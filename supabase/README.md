# Banco do CRM — projeto Supabase `aeautstgnyeicfmoppjl`

Migrações aplicadas (nomes como estão no histórico do Supabase):

| Nome | O que faz |
|---|---|
| `001_estrutura` | 7 tabelas: pessoa, cliente, negocio, tarefa, evento, checkin, financeiro. CHECKs de etapa, coluna, saúde e tipo. `negocio.codigo` com default `NEG-001`. |
| `002_rls` | RLS nas 7 tabelas. Funções `e_do_time()` e `sou_admin()`. `evento` só tem política de leitura. |
| `003_historico` | Gatilho `registrar_evento()` em negocio, tarefa, checkin e financeiro. |

O corpo das migrações vive no Supabase. Para trazer para o git:
`supabase db pull` com a CLI autenticada.

`testes/` roda com qualquer cliente SQL contra o projeto; cada arquivo falha por exceção.
