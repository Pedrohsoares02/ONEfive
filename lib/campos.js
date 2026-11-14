import { ETAPAS_LEAD, ETAPAS_PROJETO } from './funil.js';
import { numeroDeTexto, dataValida, textoLimpo, ehIdentificador } from './valores.js';

/* Quais campos do negócio a tela pode alterar, e como.
   O nome do campo chega do navegador: sem esta lista, um pedido forjado
   escreveria em qualquer coluna (codigo, criado_em, até id). A RLS do
   Postgres diz QUEM pode escrever; esta lista diz O QUÊ. */
const TIPOS = {
  titulo: 'obrigatorio',
  etapa: 'etapa',
  dono_id: 'identificador',
  valor_previsto: 'numero',
  data_contato: 'data',
  fechamento_previsto: 'data',
  inicio: 'data',
  prazo: 'data',
  motivo_perda: 'texto',
  observacoes: 'texto',
};

const ETAPAS = [...ETAPAS_LEAD, ...ETAPAS_PROJETO];

const recusa = (motivo) => ({ ok: false, motivo });

export function validarCampo(campo, bruto) {
  const tipo = Object.prototype.hasOwnProperty.call(TIPOS, campo) ? TIPOS[campo] : null;
  if (!tipo) return recusa('Esse campo não pode ser alterado por aqui.');

  if (tipo === 'etapa') {
    return ETAPAS.includes(bruto)
      ? { ok: true, valor: bruto }
      : recusa('Etapa desconhecida.');
  }

  if (tipo === 'numero') {
    const vazio = String(bruto ?? '').trim() === '';
    if (vazio) return { ok: true, valor: null };
    const n = numeroDeTexto(bruto);
    return n === null ? recusa('Valor inválido. Use só números.') : { ok: true, valor: n };
  }

  if (tipo === 'data') {
    const vazio = String(bruto ?? '').trim() === '';
    if (vazio) return { ok: true, valor: null };
    return dataValida(bruto) ? { ok: true, valor: bruto } : recusa('Data inválida.');
  }

  if (tipo === 'identificador') {
    const vazio = String(bruto ?? '').trim() === '';
    if (vazio) return { ok: true, valor: null };
    return ehIdentificador(bruto) ? { ok: true, valor: bruto } : recusa('Pessoa desconhecida.');
  }

  if (tipo === 'obrigatorio') {
    const t = textoLimpo(bruto);
    return t === null ? recusa('Esse campo não pode ficar vazio.') : { ok: true, valor: t };
  }

  return { ok: true, valor: textoLimpo(bruto) };
}

export const CAMPOS_DO_NEGOCIO = Object.keys(TIPOS);
