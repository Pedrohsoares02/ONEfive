// Um registro nasce lead e vira projeto mudando de etapa. "Fechado" não é
// etapa: fechar é mover para "Em andamento", e é isso que o tira de Leads.
export const ETAPAS_LEAD = ['Contato', 'Diagnóstico', 'Proposta enviada', 'Negociação', 'Perdido'];
export const ETAPAS_PROJETO = ['Em andamento', 'Em risco', 'Concluído', 'Encerrado'];
export const ETAPAS = [...ETAPAS_LEAD, ...ETAPAS_PROJETO];

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

const ETAPAS_ENCERRADAS = ['Concluído', 'Encerrado', 'Perdido'];

/** Negócios em aberto de uma pessoa. Compara por id: nome repete, id não. */
export function meusNegocios(negocios, pessoaId) {
  if (!pessoaId) return [];
  return negocios.filter(
    (n) => n.dono_id === pessoaId && !ETAPAS_ENCERRADAS.includes(n.etapa)
  );
}
