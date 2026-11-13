# CRM ONEfive — Fatia 1 — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o painel `/painel` com login do Ricardo como super-admin, os quadros de Leads e Projetos funcionando sobre o Supabase, e o histórico de cada negócio gravado sozinho.

**Architecture:** O CRM entra como uma área logada no mesmo app Next da landing, sob a rota `/painel`, isolada num route group. Sessão pelo Supabase Auth com cookies (`@supabase/ssr`); `proxy.js` faz só a checagem otimista do cookie e a autorização de verdade vive numa camada de acesso a dados no servidor. Um registro em `negocio` nasce lead e vira projeto mudando de `etapa`; `evento` é gravado por gatilho no banco, não pelo app.

**Tech Stack:** Next.js 16.4.6 (App Router, Turbopack), React 19.3, JavaScript, Supabase (Postgres 17 + Auth + RLS), Vercel. Testes com `node --test` (nativo, sem dependência nova).

**Spec:** `docs/crm-onefive-design.md` no Project "One Five" (documento de design aprovado em 13/11/2026)

## Global Constraints

- **JavaScript, nunca TypeScript.** O repositório é JS com `jsconfig.json` e alias `@/`.
- **Next.js 16.4.6:** o arquivo de borda chama-se `proxy.js` (não `middleware.js`, deprecado nesta versão) e fica na raiz do projeto. `cookies()`, `headers()`, `params` e `searchParams` são assíncronos — sempre `await`.
- **Tokens da marca já existem** em `app/onefive.css`, escopados em `.of-sec`: `--text-main:#2A1545`, `--text-muted:#6B6280`, `--border-light:#E7E3EE`, `--of-pessoas:#E6186F`, `--of-processos:#1F6FB2`, `--of-tecnologia:#35A8DF`, `--of-dados:#8E5BB5`, `--of-metodo:#F0B429`. O painel reaproveita; não se cria paleta nova.
- **Tipografia:** Poppins 500/600 (títulos e números), Inter (corpo), JetBrains Mono (códigos e rótulos). Já carregadas no `app/layout.js`.
- **Projeto Supabase:** `aeautstgnyeicfmoppjl` (nome ONEfive, us-east-1, Postgres 17).
- **Custo zero:** planos gratuitos. Sem serviço de e-mail, sem cron pago. Avisos são in-app.
- **Carga presumida:** 3 usuários, <200 negócios/ano, <3 mil tarefas/ano. Nada precisa escalar além disso.
- **Chave de serviço (`service_role`) nunca vai para o cliente** nem para o repositório. Só `NEXT_PUBLIC_SUPABASE_URL` e a chave publicável.

## Review Focus

1. **Usuário autenticado sem linha em `pessoa`, ou com `ativo=false`:** entra no Supabase Auth mas não é do time. Deve ver zero linhas e ser mandado para fora, não receber tela vazia com dados por baixo. Teste em Task 1 (RLS) e Task 3 (DAL).
2. **Sessão expirada no meio de uma ação:** mover um cartão com cookie vencido deve redirecionar para o login sem gravar nada. Teste em Task 5.
3. **Negócio sem valor e sem probabilidade:** a previsão do funil não pode virar `NaN` nem somar `null`. Teste em Task 4.
4. **Etapa inválida vinda do cliente:** um POST forjado com `etapa:"QualquerCoisa"` deve ser recusado pelo banco, não só pela tela. Teste em Task 1 (CHECK) e Task 5.
5. **Dois sócios movendo o mesmo negócio ao mesmo tempo:** a última escrita vence, mas as duas devem aparecer no histórico. Teste em Task 2 (gatilho).

---

### Task 1: Banco — tabelas, CHECKs e RLS

**Files:**
- Create: `supabase/migracoes/001_estrutura.sql` (cópia versionada do que foi aplicado)
- Test: `supabase/testes/001_rls.sql`

**Interfaces:**
- Produces: tabelas `pessoa`, `cliente`, `negocio`, `tarefa`, `evento`, `checkin`, `financeiro`; função `e_do_time()` usada por toda política de RLS.

- [ ] **Step 1: Escrever as asserções de RLS que devem falhar**

```sql
-- supabase/testes/001_rls.sql
-- 1. anônimo não lê nada
set role anon;
do $$ begin
  assert (select count(*) from public.negocio) = 0, 'anon enxergou negocio';
end $$;
-- 2. etapa inválida é recusada pelo CHECK
set role postgres;
do $$ begin
  begin
    insert into public.negocio (titulo, etapa) values ('x', 'QualquerCoisa');
    assert false, 'CHECK de etapa nao barrou';
  exception when check_violation then null;
  end;
end $$;
```

- [ ] **Step 2: Rodar e confirmar que falha** (as tabelas ainda não existem)

Rodar: `mcp__Supabase__execute_sql` com o conteúdo de `001_rls.sql`
Esperado: FALHA com `relation "public.negocio" does not exist`

- [ ] **Step 3: Aplicar a migração `001_estrutura`**

Colunas conforme `docs/crm-onefive-design.md` §7. Pontos que o documento fixa e a migração deve cumprir:
- `negocio.etapa text not null check (etapa in ('Contato','Diagnóstico','Proposta enviada','Negociação','Perdido','Em andamento','Em risco','Concluído','Encerrado'))`
- `negocio.codigo text unique` gerado por sequência, formato `NEG-001` (código estável a vida toda, decisão de 13/11)
- `tarefa.coluna text not null check (coluna in ('Para depois','A fazer','Fazendo','Aguardando','Feito'))`
- `checkin.saude text not null check (saude in ('No rumo','Em risco','Fora do rumo'))`
- `financeiro.tipo text not null check (tipo in ('receita','custo'))`
- `pessoa.papel text not null default 'leitor' check (papel in ('admin','leitor'))`
- `pessoa.id uuid primary key references auth.users(id) on delete cascade`
- Todas com `criado_em timestamptz not null default now()`

- [ ] **Step 4: Aplicar a migração `002_rls`**

`alter table ... enable row level security` nas sete tabelas. Função:

```sql
create or replace function public.e_do_time() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.pessoa p where p.id = auth.uid() and p.ativo);
$$;
```

Política de leitura em todas as tabelas: `using (public.e_do_time())`. Política de escrita: `with check (public.e_do_time())`. Em `pessoa`, `update` do próprio `papel` só para `papel='admin'`.

- [ ] **Step 5: Rodar as asserções e confirmar que passam**

Rodar: `001_rls.sql`
Esperado: nenhuma exceção

- [ ] **Step 6: Commit**

```bash
git add supabase/
git commit -m "feat(banco): estrutura do CRM com RLS por pertencimento ao time"
```

---

### Task 2: Banco — histórico automático

**Files:**
- Create: `supabase/migracoes/003_historico.sql`
- Test: `supabase/testes/003_historico.sql`

**Interfaces:**
- Consumes: tabelas da Task 1.
- Produces: gatilho `registrar_evento()` em `negocio`, `tarefa`, `checkin`, `financeiro`.

- [ ] **Step 1: Escrever a asserção**

Duas trocas de etapa seguidas no mesmo negócio devem produzir **duas** linhas em `evento` com `acao='Etapa alterada'` (Review Focus 5), cada uma com `detalhe` no formato `'<antes> para <depois>'`.

- [ ] **Step 2: Rodar e confirmar que falha**

Esperado: `0 eventos, esperava 2`

- [ ] **Step 3: Criar a função e os gatilhos**

`registrar_evento()` em `after insert or update`, gravando `negocio_id`, `acao`, `detalhe` e `autor_id = auth.uid()`. Em `negocio`, só gera evento quando `old.etapa is distinct from new.etapa` ou quando muda um campo da lista `(titulo, valor_previsto, dono_id, prazo)`.

- [ ] **Step 4: Rodar e confirmar que passa**

- [ ] **Step 5: Commit**

---

### Task 3: Sessão e autorização

**Files:**
- Create: `lib/supabase/servidor.js`, `lib/supabase/navegador.js`, `lib/sessao.js`, `proxy.js`
- Modify: `package.json` (adicionar `@supabase/ssr` e `@supabase/supabase-js`)
- Test: `testes/sessao.test.js`

**Interfaces:**
- Produces:
  - `criarClienteServidor()` → cliente Supabase com os cookies da requisição
  - `exigirUsuario()` → `{ id, nome, email, papel }`, ou `redirect('/painel/login')`
  - `ehAdmin(pessoa)` → `boolean`

- [ ] **Step 1: Escrever o teste**

```js
// testes/sessao.test.js
test('exigirUsuario redireciona quem não tem linha em pessoa', async () => {
  // cliente dublê devolve usuário autenticado; consulta a pessoa devolve null
  await assert.rejects(() => exigirUsuario(), /NEXT_REDIRECT/);
});
test('ehAdmin é falso para papel leitor', () => {
  assert.equal(ehAdmin({ papel: 'leitor' }), false);
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Rodar: `node --test testes/sessao.test.js`

- [ ] **Step 3: Implementar**

`criarClienteServidor()` usa `createServerClient` do `@supabase/ssr` com `await cookies()` (assíncrono no Next 16). `exigirUsuario()` chama `auth.getUser()` — nunca `getSession()`, que lê o cookie sem validar — e em seguida busca a linha em `pessoa`; sem usuário ou sem linha ativa, `redirect('/painel/login')`.

- [ ] **Step 4: Criar `proxy.js` na raiz**

Checagem otimista: lê o cookie de sessão e redireciona para `/painel/login` quem não tem nenhum. `config.matcher = ['/painel/:path*']`. Sem consulta ao banco aqui — o proxy roda em toda navegação, inclusive prefetch. A autorização real é sempre `exigirUsuario()`.

- [ ] **Step 5: Rodar os testes e confirmar que passam**

- [ ] **Step 6: Commit**

---

### Task 4: Login e o super-admin

**Files:**
- Create: `app/(painel)/painel/login/page.js`, `app/(painel)/painel/login/acoes.js`, `app/(painel)/layout.js`, `app/painel.css`
- Test: `testes/funil.test.js`

**Interfaces:**
- Consumes: `exigirUsuario` da Task 3.
- Produces: `entrar(formData)` server action; `previsaoDoFunil(negocios)` → número.

- [ ] **Step 1: Escrever o teste da previsão (Review Focus 3)**

```js
test('previsão ignora negócio sem valor e não vira NaN', () => {
  const r = previsaoDoFunil([{ valor_previsto: null }, { valor_previsto: 1000 }]);
  assert.equal(r, 1000);
});
test('previsão de funil vazio é zero', () => {
  assert.equal(previsaoDoFunil([]), 0);
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

- [ ] **Step 3: Implementar `previsaoDoFunil(negocios)` em `lib/funil.js`**

- [ ] **Step 4: Criar o usuário do Ricardo**

Criar em `auth.users` o e-mail `ricardo.soares030@gmail.com` pelo painel do Supabase (o Ricardo define a própria senha; o plano não carrega senha nenhuma), depois inserir a linha correspondente:

```sql
insert into public.pessoa (id, nome, email, papel, ativo)
select id, 'Ricardo Soares', email, 'admin', true from auth.users
where email = 'ricardo.soares030@gmail.com';
```

- [ ] **Step 5: Construir a tela de login**

E-mail e senha, server action `entrar`, mensagem de erro única e genérica ("E-mail ou senha não conferem") — não se revela se o e-mail existe. Visual: fundo claro, a marca em Poppins, o ponto magenta, botão `--of-pessoas`.

- [ ] **Step 6: Verificar ponta a ponta**

Rodar: `npm run dev`, abrir `/painel` deslogado → redireciona para `/painel/login`; entrar → chega no painel; `/painel` com cookie adulterado → volta ao login.

- [ ] **Step 7: Commit**

---

### Task 5: Quadro de Leads e de Projetos

**Files:**
- Create: `app/(painel)/painel/page.js`, `app/(painel)/painel/leads/page.js`, `app/(painel)/painel/projetos/page.js`, `components/painel/Quadro.js`, `components/painel/Cartao.js`, `app/(painel)/painel/acoes.js`
- Test: `testes/etapas.test.js`

**Interfaces:**
- Consumes: `exigirUsuario`, `criarClienteServidor`, `previsaoDoFunil`.
- Produces: `moverEtapa(negocioId, novaEtapa)` server action → `{ ok: true }` ou lança.

- [ ] **Step 1: Escrever os testes (Review Focus 2 e 4)**

```js
test('moverEtapa recusa etapa fora da lista', async () => {
  await assert.rejects(() => moverEtapa('abc', 'QualquerCoisa'), /Etapa inválida/);
});
test('moverEtapa sem sessão não grava', async () => {
  await assert.rejects(() => moverEtapa('abc', 'Negociação'), /NEXT_REDIRECT/);
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

- [ ] **Step 3: Implementar `moverEtapa`**

Valida a etapa contra a lista antes de tocar no banco (defesa em profundidade: o CHECK da Task 1 é a última linha, não a única), chama `exigirUsuario()` primeiro, atualiza e `revalidatePath`.

- [ ] **Step 4: Construir os quadros**

`Quadro` é client component (arrastar precisa de evento no navegador); as páginas são server components que buscam os dados e passam adiante. Leads mostra as cinco etapas do funil com o fio de 2px nas cores da marca; Projetos mostra as quatro de execução. O cartão traz cliente, título, valor, dono e o aviso de parado.

- [ ] **Step 5: Rodar os testes e confirmar que passam**

- [ ] **Step 6: Commit**

---

### Task 6: Ficha do negócio e financeiro simples

**Files:**
- Create: `app/(painel)/painel/negocio/[id]/page.js`, `components/painel/Ficha.js`, `components/painel/Financeiro.js`
- Test: `testes/financeiro.test.js`

**Interfaces:**
- Consumes: tudo acima.
- Produces: `somarPorTipo(lancamentos, tipo)`, `margem(lancamentos)` → `null` quando não há receita.

- [ ] **Step 1: Escrever o teste**

```js
test('margem sem receita é null, não divisão por zero', () => {
  assert.equal(margem([{ tipo: 'custo', valor: 500 }]), null);
});
```

- [ ] **Step 2: Rodar e confirmar que falha**
- [ ] **Step 3: Implementar em `lib/financeiro.js`**
- [ ] **Step 4: Construir a ficha** — dados, linha do tempo (lendo `evento`), lançamentos e margem.
- [ ] **Step 5: Rodar os testes e confirmar que passam**
- [ ] **Step 6: Commit**

---

## O que esta fatia não entrega

Quadro de tarefas por projeto, check-in semanal e a fila de avisos da Início (Fatia 2); rubricas de custo e margem por rubrica (Fatia 3); minuta de contrato (depois). A tela Início desta fatia mostra a frase do topo e a lista dos negócios do usuário, sem a fila.
