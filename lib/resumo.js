import { diasParado, estaParado } from './parado.js';
import { fechaEm } from './recortes.js';

/* As linhas do painel lateral — o que o quadro já sabe do negócio, sem ir
   ao servidor de novo. Módulo puro: a tela só desenha o que sai daqui.
   `tom` é o aviso: 'risco' vermelho, 'alerta' âmbar, 'fraco' cinza. */

const data = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');

function linhaDoValor(negocio) {
  const bruto = negocio?.valor_previsto;
  const v = bruto === null || bruto === undefined || bruto === '' ? NaN : Number(bruto);
  if (!Number.isFinite(v)) return { rotulo: 'Valor', valor: 'Sem valor ainda', tom: 'fraco' };
  return { rotulo: 'Valor', valor: 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) };
}

function linhaDaData(negocio, hoje, campo) {
  const rotulo = campo === 'prazo' ? 'Prazo' : 'Fechamento';
  const quando = negocio?.[campo];
  if (!quando) return { rotulo, valor: 'Sem data', tom: 'fraco' };

  const faltam = fechaEm({ fechamento_previsto: quando }, hoje);
  if (faltam < 0) return { rotulo, valor: `${data(quando)} — venceu`, tom: 'risco' };
  return { rotulo, valor: data(quando), tom: faltam <= 30 ? 'alerta' : undefined };
}

function linhaDoSilencio(negocio, hoje) {
  const dias = diasParado(negocio?.ultimoEm, hoje);
  if (dias === null) return { rotulo: 'Sem mexer há', valor: '—', tom: 'fraco' };
  return {
    rotulo: 'Sem mexer há',
    valor: dias === 1 ? '1 dia' : `${dias} dias`,
    tom: estaParado(negocio, hoje) ? 'risco' : undefined,
  };
}

export function resumoDoNegocio(negocio, hoje, campoData = 'fechamento_previsto') {
  return [
    { rotulo: 'Etapa', valor: negocio?.etapa ?? '—' },
    negocio?.dono?.nome
      ? { rotulo: 'Dono', valor: negocio.dono.nome }
      : { rotulo: 'Dono', valor: 'Sem dono', tom: 'fraco' },
    linhaDoValor(negocio),
    linhaDaData(negocio, hoje, campoData),
    linhaDoSilencio(negocio, hoje),
  ];
}
