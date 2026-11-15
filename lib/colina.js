/* A Colina (hill chart), trazida do painel da DIP.

   Uma posição de 0 a 100 diz onde o trabalho está, não em que caixa ele mora.
   A metade esquerda é descoberta — você ainda não sabe o que vai dar. A
   direita é execução — você já sabe, falta fazer. Um negócio pode estar em
   "Negociação" há três semanas e não ter saído do pé do morro; o kanban não
   mostra isso e a colina mostra. */

const TRILHA = 6;

/* Onde cada etapa costuma cair, quando ninguém arrastou a bolinha ainda.
   É palpite do sistema, e a tela deixa isso à vista com a bolinha vazada. */
const SUGERIDA = {
  'Contato': 8,
  'Diagnóstico': 26,
  'Proposta enviada': 58,
  'Negociação': 80,
  'Em andamento': 40,
  'Em risco': 40,
  'Concluído': 100,
  'Encerrado': 100,
  'Perdido': 100,
};

export function posicaoDaColina(negocio) {
  const guardada = negocio?.colina;
  // 0 é posição de verdade: só null/undefined significam "ninguém confirmou"
  if (guardada !== null && guardada !== undefined) return { pos: guardada, sugerida: false };
  return { pos: SUGERIDA[negocio?.etapa] ?? 8, sugerida: true };
}

/* Na DIP a colina é só de projeto: entender o problema × implantar a solução.
   Para lead isso não quer dizer nada, então o sentido muda: à esquerda você
   ainda descobre o que ele precisa, à direita já sabe e está fechando. */
export function ladoDaColina(pos, ehLead) {
  if (ehLead) return pos < 50 ? 'Entendendo o que ele precisa' : 'Fechando';
  return pos < 50 ? 'Entendendo o problema' : 'Implantando a solução';
}

/* O rastro das posições anteriores sai da própria linha do tempo: cada
   movimento virou um evento "Colina" com detalhe "30% → 58%". Não existe
   tabela de histórico à parte para alguém esquecer de alimentar. */
export function trilhaDosEventos(eventos) {
  const trilha = new Map();

  (eventos ?? []).forEach((e) => {
    if (e.acao !== 'Colina') return;
    const m = /(\d{1,3})%\s*$/.exec(String(e.detalhe ?? ''));
    if (!m) return;
    const lista = trilha.get(e.negocio_id) ?? [];
    lista.push({ quando: e.criado_em, pos: Number(m[1]) });
    trilha.set(e.negocio_id, lista);
  });

  trilha.forEach((lista, id) => {
    lista.sort((a, b) => String(a.quando).localeCompare(String(b.quando)));
    trilha.set(id, lista.slice(-TRILHA));
  });

  return trilha;
}
