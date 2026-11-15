// Um registro nasce lead e vira projeto mudando de etapa. "Fechado" não é
// etapa: fechar é mover para "Em andamento", e é isso que o tira de Leads.
export const ETAPAS_LEAD = ['Contato', 'Diagnóstico', 'Proposta enviada', 'Negociação', 'Perdido'];
export const ETAPAS_PROJETO = ['Em andamento', 'Em risco', 'Concluído', 'Encerrado'];
export const ETAPAS = [...ETAPAS_LEAD, ...ETAPAS_PROJETO];

/* Colunas da tarefa, iguais ao CHECK da tabela. Moram aqui, e não em
   lib/tarefas.js, porque a lista é lida também pela tela: tarefas.js puxa
   a sessão, que só existe no servidor, e arrastaria isso para o navegador. */
export const COLUNAS_TAREFA = ['Para depois', 'A fazer', 'Fazendo', 'Aguardando', 'Feito'];

export function ehLead(negocio) {
  return ETAPAS_LEAD.includes(negocio?.etapa);
}

/** Soma o previsto da lista que recebe. Valor ausente ou ilegível não entra. */
export function previsaoDoFunil(negocios) {
  return negocios.reduce((total, n) => {
    const v = Number(n?.valor_previsto);
    return Number.isFinite(v) ? total + v : total;
  }, 0);
}

/* O peso de cada etapa do funil: a chance de virar contrato. Somar tudo igual
   infla a previsão — uma proposta enviada não vale o mesmo que um primeiro
   café. Números de partida, trocados aqui quando houver histórico. Etapa
   fora da lista (Perdido) não entra na conta. */
export const PESO_ETAPA = {
  Contato: 0.10,
  'Diagnóstico': 0.25,
  'Proposta enviada': 0.50,
  'Negociação': 0.75,
};

/** Soma o previsto de cada negócio já multiplicado pelo peso da sua etapa. */
export function previsaoPonderada(negocios) {
  return negocios.reduce((total, n) => {
    const peso = PESO_ETAPA[n?.etapa];
    const v = Number(n?.valor_previsto);
    return peso && Number.isFinite(v) ? total + v * peso : total;
  }, 0);
}

const ETAPAS_ENCERRADAS = ['Concluído', 'Encerrado', 'Perdido'];

/** Negócios em aberto de uma pessoa. Compara por id: nome repete, id não. */
export function meusNegocios(negocios, pessoaId) {
  if (!pessoaId) return [];
  return negocios.filter(
    (n) => n.dono_id === pessoaId && !ETAPAS_ENCERRADAS.includes(n.etapa)
  );
}
