# Painel ONEfive — o que você precisa saber para propor uma tela

Anexe este arquivo antes de pedir qualquer coisa. Ele existe porque você não
enxerga o repositório, e sem ele a proposta sai fora do conjunto.

## O que é

A ONEfive é uma consultoria de inovação no setor público, em Joinville/SC, com
três pessoas. Este é o CRM e painel de gestão delas: leads, projetos, tarefas,
financeiro. Quem usa são as três, todo dia, para saber o que fazer agora — não
é vitrine para cliente.

Público: três adultos ocupados que conhecem o próprio negócio. A tela tem que
responder rápido o que está pegando fogo. Nada de explicar o óbvio, nada de
onboarding, nada de texto motivacional.

## O que entregar

Um arquivo HTML sozinho, que abra com dois cliques: CSS numa tag `<style>` no
topo, JavaScript simples no fim se precisar de interação. Sem framework, sem
build, sem dependência além das fontes do Google.

**Não** entregue componente React, não escreva nada pensando em arquivo do
projeto, não invente nome de classe achando que vai colar no código existente.
O que chega daqui é maquete para validar com o Ricardo; quem transforma em
código é o Claude, depois.

Dados de exemplo: invente, mas realistas para o ramo — Prefeitura de Joinville,
Governo de SC, FIESC, Sebrae, Agora Tech Park. Valores de consultoria pública
ficam entre R$ 80 mil e R$ 500 mil. Ciclo de venda longo, decisão por comitê.

## A identidade

Fundo claro, superfícies brancas, traço fino, bastante respiro. Sensação de
leveza e segurança. O rosa é acento, não cor de fundo: use com parcimônia, para
a ação principal e para o que está em risco.

```
--ink:        #2A1545   texto e títulos
--paper:      #F8F7FB   fundo da página
--card:       #FFFFFF   superfície
--muted:      #6B6280   texto secundário
--line:       #E7E3EE   bordas
--vivo:       #E6186F   acento, ação principal
--risk:       #C9145E   vencido, parado demais
--warn:       #A8780C   atenção, prazo chegando
--cool:       #1F6FB2   informação

cinco cores da marca, para categorias:
--pessoas:    #E6186F
--processos:  #1F6FB2
--tecnologia: #35A8DF
--dados:      #8E5BB5
--metodo:     #F0B429
```

Tipografia, do Google Fonts:

- **Poppins 600** — títulos e números grandes. `letter-spacing: -.035em`.
- **Inter 400/500** — todo o resto, 15px de base.
- **JetBrains Mono** — dinheiro, datas, códigos, contadores. Nunca em texto corrido.

Cantos: 10 a 12px em cartão e coluna, 999px em botão e etiqueta. Borda de 1px
em `--line`. Sombra quase nenhuma — só sob o que flutua de verdade.

## Convenções de escrita

Tudo em português do Brasil, em caixa baixa de frase. Nunca CAIXA ALTA em
rótulo, exceto a etiqueta pequena em versalete que o painel já usa (9,5px, mono,
`letter-spacing: .14em`).

O texto diz o que acontece, não o que o sistema faz: "Arraste um negócio para
cá", não "Nenhum item encontrado". Tela vazia é convite para agir. Erro diz o
que deu errado e o que fazer.

## Telas que já existem, para você não contradizer

- **Início** — o que fazer hoje, em cartões clicáveis.
- **Leads** — quadro de cinco etapas (Contato, Diagnóstico, Proposta enviada,
  Negociação, Perdido). No topo, o valor em jogo e a previsão ponderada, e três
  números que funcionam como filtro: parados, fecham este mês, sem valor.
  Clicar no cartão abre um painel lateral de 380px com o resumo.
- **Projetos** — mesmo quadro, com Em andamento, Em risco, Concluído, Encerrado.
  **Ainda não recebeu o tratamento que Leads recebeu.**
- **Ficha do negócio** — duas colunas: à esquerda, parada na tela, o que se
  consulta (etapa, dono, valor, datas, contatos, notas); à direita, o que se
  opera (tarefas em três colunas, financeiro, linha do tempo).
- **Colina** — gráfico de morro, leads de um lado e projetos do outro.
- **Fluxo** — tarefas ligadas por dependência, no estilo do n8n.

Dois relógios aparecem em todo cartão: quando fecha e há quantos dias está
parado. Vermelho passa de 14 dias em lead, 21 em projeto.

## O que evitar

Nada de gradiente decorativo, sombra colorida, emoji, ícone dentro de caixa de
diagrama, ou número grande sem rótulo. Nada de cartão idêntico repetido só para
preencher. Nada de etiqueta em caixa alta acima de todo título. Se a informação
não muda uma decisão de alguém naquele dia, ela não merece espaço no topo.
