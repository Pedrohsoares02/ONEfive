import { estaParado } from './parado.js';

/* Os três cortes da página de leads. Cada um é uma pergunta que alguém faz
   olhando o funil: o que parou, o que fecha agora, o que ainda não tem preço.
   Módulo puro: a tela filtra no navegador, sem ida ao servidor. */

const DIA = 86400000;

/** Dias que faltam para o fechamento previsto. Negativo se já venceu. */
export function fechaEm(negocio, hoje) {
  const data = negocio?.fechamento_previsto;
  if (!data) return null;
  return Math.round((new Date(data) - new Date(hoje)) / DIA);
}

/* Number(null) é 0, e 0 é finito: sem este teste um lead sem valor passaria
   por "tem valor, e vale zero". */
const semValor = (n) => {
  const bruto = n?.valor_previsto;
  if (bruto === null || bruto === undefined || bruto === '') return true;
  return !Number.isFinite(Number(bruto));
};

/* "Fecham este mês" inclui o que já venceu: um prazo estourado é mais
   urgente que um que vence amanhã, não menos. */
const perto = (n, hoje) => {
  const d = fechaEm(n, hoje);
  return d !== null && d <= 30;
};

const DE = {
  parado: (n, hoje) => estaParado(n, hoje),
  perto,
  semvalor: (n) => semValor(n),
};

export const RECORTES = Object.keys(DE);

/** Quantos e quanto em cada corte, para os números do topo. */
export function recortes({ negocios, hoje }) {
  const conta = (teste) => {
    const dela = negocios.filter((n) => teste(n, hoje));
    const soma = dela.reduce((t, n) => (semValor(n) ? t : t + Number(n.valor_previsto)), 0);
    return { n: dela.length, soma };
  };
  return { parado: conta(DE.parado), perto: conta(DE.perto), semvalor: conta(DE.semvalor) };
}

/* Tira acento e caixa: ninguém digita "Itajaí" com o acento na pressa. */
const achatar = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Aplica os cortes juntos: recorte, dono e busca. */
export function filtrarNegocios(negocios, { recorte, donoId, texto, hoje } = {}) {
  const procura = achatar(texto).trim();
  return negocios.filter((n) => {
    if (donoId && n.dono_id !== donoId) return false;
    if (recorte && DE[recorte] && !DE[recorte](n, hoje)) return false;
    if (procura) {
      const alvo = achatar(n.titulo + ' ' + (n.cliente?.nome ?? ''));
      if (!alvo.includes(procura)) return false;
    }
    return true;
  });
}
