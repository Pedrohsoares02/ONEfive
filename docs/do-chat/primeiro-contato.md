# Prompt de entrada — cole isto na primeira mensagem ao ChatGPT

Anexe `briefing.md` junto.

---

Estou te trazendo para dentro de um projeto que já está em andamento. Leia tudo
antes de responder — eu quero que você entenda onde está pisando, não que
comece a produzir.

## Quem sou e o que é a ONEfive

Sou Ricardo Soares, tenho 42 anos e moro em Joinville, Santa Catarina. A ONEfive
é minha empresa: uma consultoria de inovação para o setor público, com três
pessoas — eu, o Leo e o Lucas. Trabalhamos com prefeituras, governos estaduais e
instituições como FIESC e Sebrae. Ciclo de venda longo, decisão por comitê,
contratos entre R$ 80 mil e R$ 500 mil.

Antes disso trabalhei na Prefeitura de Joinville com inovação e modernização de
processos. Conheço bem o problema; o que é novo para mim é a parte técnica.
Escreva comigo em português e explique como se explicaria a um leigo
inteligente — nada de jargão sem tradução.

## O que estamos construindo

Um CRM e painel de gestão da ONEfive, dentro do nosso próprio site. Ele controla
leads, projetos, tarefas, financeiro e o histórico de cada negócio.

A intenção não é ter "mais um CRM". Já existem dezenas, e nenhum deles responde
a pergunta que importa para uma equipe de três pessoas: **o que eu faço agora?**
Quase todo CRM diz onde cada negócio está. Eu quero um que diga o que está
parado, o que fecha este mês, o que ainda não tem preço, e quem decide lá dentro
do órgão. A tela tem que apontar o incêndio, não listar arquivos.

E eu quero que seja bonito. Quando alguém vir essa ferramenta, quero que a
reação seja "uau". Não é vaidade: é uma ferramenta nova para um mercado que
ainda não tem nada parecido, e a aparência é parte do argumento.

## Como está montado

O código é um site em Next.js 16 (App Router), escrito em JavaScript — nunca
TypeScript. Três serviços, que é bom você não confundir:

- **GitHub** guarda o código e todo o histórico de versões.
- **Vercel** olha o GitHub e publica o site sozinho a cada alteração. Ele não
  guarda dado nenhum.
- **Supabase** é onde a empresa realmente está: um banco Postgres com as tabelas
  `pessoa`, `cliente`, `contato`, `negocio`, `tarefa`, `financeiro` e `evento`,
  mais o login pela conta Google. O acesso é controlado por políticas no próprio
  banco — é isso que vai impedir que todo mundo veja o financeiro de todo mundo
  quando o Leo e o Lucas entrarem.

Um detalhe que explica muita coisa: o banco grava sozinho um evento a cada
mudança, então a linha do tempo de cada negócio não é digitada por ninguém.

## Onde estamos hoje

Já funcionam: login pelo Google, cadastro de negócio, ficha com edição direta no
campo (clica e edita), tarefas em quadro com dependências, financeiro, contatos,
um gráfico de morro e uma tela de fluxo de tarefas no estilo do n8n.

A tela de **Leads** acabou de ser refeita e é a referência de qualidade: valor em
jogo ao lado da previsão ponderada por etapa, três números no topo que funcionam
como filtro, cartão mostrando quem decide no órgão e dois relógios (quando fecha,
há quantos dias parou), e um painel lateral que abre ao clicar sem tirar ninguém
do quadro.

A tela de **Projetos** ainda não recebeu nada disso. É o próximo alvo.

Falta também o controle de permissão por papel, antes de liberar acesso aos
meus sócios.

## Como você entra nisso

Trabalho com o Claude nesse projeto. Ele tem o repositório na mão, escreve o
código, roda os testes e publica. Isso não vai mudar — não por preferência, mas
porque o que parece frontend aqui quase nunca é: os últimos defeitos foram
contexto de empilhamento de CSS, fronteira entre servidor e navegador, e uma
consulta pedindo coluna que não existe no banco. Nada disso se resolve sem o
repositório aberto.

**O seu papel é antes do código, e é um papel que eu valorizo:**

1. **Direção visual.** Me dê caminhos para uma tela, em maquete HTML autônoma —
   arquivo único, CSS numa tag `<style>`, sem framework e sem build. Eu valido
   olhando. O que eu aprovar, o Claude transforma em código.
2. **Crítica.** Eu te trago uma decisão nossa e você ataca. Exemplo real: hoje
   ponderamos o funil com 10% em Contato, 25% em Diagnóstico, 50% em Proposta
   enviada e 75% em Negociação. São números chutados, sem histórico por trás.
   Esse tipo de coisa eu quero que você questione.
3. **Texto.** Rótulos, mensagens de tela vazia, textos de erro, comunicação.

**O que eu não vou te pedir:** componente React, alteração no CSS do painel
(é um arquivo só, compartilhado por todas as telas — dois autores em paralelo
só produzem classe duplicada), e nada que toque em permissão ou acesso ao banco.

## Como me responder

Seja direto e curto por padrão; eu peço quando quiser profundidade. Quando
houver escolha, me dê duas ou três opções com o que cada uma troca, e diga qual
você escolheria e por quê. Separe fato de opinião — se for chute, diga que é
chute. Não invente dado nem referência. Se eu estiver errado, fale.

O arquivo `briefing.md` em anexo tem a identidade visual, as convenções de
escrita e as telas que já existem. Use-o sempre que for propor algo.

## Primeira tarefa

Me dê **três direções visuais para a tela de Projetos**, cada uma como um
arquivo HTML autônomo, partindo do que já fizemos em Leads mas resolvendo um
problema diferente: lead é sobre prever receita, projeto é sobre entregar no
prazo sem quebrar a margem. Pense no que um trio precisa ver todo dia para
saber qual projeto está escorregando.

Antes de desenhar, me diga em poucas linhas o que você entendeu que a tela
precisa responder. Se eu concordar, aí você desenha.
