import { ETAPAS_LEAD, ETAPAS_PROJETO } from './funil.js';

/* Há quanto tempo um negócio não se mexe.

   O relógio é o último evento da linha do tempo, que é gravada pelo próprio
   banco: mudança de etapa, de valor, de dono, observação escrita, tarefa
   criada ou movida, check-in, lançamento. Ninguém zera esse contador sem
   fazer alguma coisa de verdade — diferente de medir pelo último arrasto na
   colina, que zera só de alguém mexer na bolinha. */

const LIMITE_LEAD = 14;
const LIMITE_PROJETO = 21;
const ENCERRADAS = ['Perdido', 'Concluído', 'Encerrado'];

const dia = 86400000;

export function diasParado(ultimoEm, hoje) {
  if (!ultimoEm) return null;
  const de = Date.parse(String(ultimoEm).slice(0, 10));
  const ate = Date.parse(String(hoje).slice(0, 10));
  if (Number.isNaN(de) || Number.isNaN(ate)) return null;
  return Math.max(0, Math.round((ate - de) / dia));
}

/* Lead e projeto não aguentam o mesmo silêncio: um projeto de dez meses
   passa duas semanas sem registro numa fase de execução e está tudo bem;
   um lead parado duas semanas esfriou. */
export function limiteDeParado(etapa) {
  if (ENCERRADAS.includes(etapa)) return null;
  if (ETAPAS_LEAD.includes(etapa)) return LIMITE_LEAD;
  if (ETAPAS_PROJETO.includes(etapa)) return LIMITE_PROJETO;
  return LIMITE_LEAD;
}

export function estaParado(negocio, hoje) {
  const limite = limiteDeParado(negocio?.etapa);
  if (limite === null) return false;
  const dias = diasParado(negocio?.ultimoEm, hoje);
  return dias !== null && dias >= limite;
}
