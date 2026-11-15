<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Servidor e navegador não dividem módulo

Qualquer arquivo que importe `lib/sessao.js` (direta ou indiretamente) só roda
no servidor: ele puxa `next/headers`. Se um componente `'use client'` importar
desse arquivo, o build quebra com *"You're importing a module that depends on
next/headers"* — e a mensagem não diz qual import causou.

A divisão é por quem lê, não por assunto:

- **Puro, lido pelos dois:** `lib/funil.js`, `lib/valores.js`, `lib/campos.js`,
  `lib/parado.js`, `lib/pendencias.js`, `lib/colina.js`, `lib/fluxo.js`.
  Constantes, conversões, cálculo. Nada de sessão, nada de banco.
- **Só servidor:** `lib/negocios.js`, `lib/tarefas.js`, `lib/contatos.js`,
  `lib/lancamentos.js`, `lib/consultas.js`, `lib/sessao.js`. Leitura e
  gravação, sempre atrás de `exigirUsuario`.

Ao criar uma função nova, pergunte quem precisa dela. Se a tela precisa,
ela vai no módulo puro — mesmo que o assunto seja o mesmo da gravação.

## Como trabalhamos (acordado em 15/11/2026)

### Sessão

Uma sessão por frente de trabalho. A conversa inteira é reenviada a cada
mensagem: sessão longa é o maior custo do projeto, e contexto menor também
produz menos confusão entre coisas parecidas.

O que for durável vem para este arquivo ou para `docs/`. O que não estiver
escrito aqui não sobrevive ao fim da sessão.

### Verificação

Captura de tela só para julgar **aparência** — se ficou feio, se encostou, se
sumiu. Para verificar **funcionamento**, consultar o DOM com JavaScript no
navegador: largura computada, se o diálogo abriu, qual regra de CSS venceu.
Responde melhor e custa uma fração.

Depois de publicar, conferir no ar **uma vez**. Sem repetir o ciclo.

### O que pode sair daqui para outro modelo

Ricardo também usa o ChatGPT. Três testes, nessa ordem:

1. Dá para fazer sem abrir este repositório?
2. O resultado se julga com o olho, não com teste?
3. Se vier errado, custa minutos — não vira bug?

Os três sim, pode ir. Qualquer não, fica aqui. Protótipo de tela, direção
visual, texto de página e crítica a uma decisão passam. Componente React,
qualquer coisa que encoste em `app/painel.css`, e tudo que toque em RLS ou
permissão, não passam.

Antes de escrever algo caro que passe nos três testes — protótipo, acima de
tudo — avisar que é candidato, e deixar ele decidir.

A troca é por arquivo: o que vem do ChatGPT entra em `docs/do-chat/`, e o
briefing que ele precisa anexar lá está em `docs/do-chat/briefing.md`.
