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
