import { exigirUsuario } from './sessao.js';
import { numeroDeTexto, dataValida, textoLimpo } from './valores.js';

export const TIPOS_LANCAMENTO = ['receita', 'custo'];

export async function criarLancamento(cliente, negocioId, dados) {
  if (!TIPOS_LANCAMENTO.includes(dados?.tipo)) {
    throw new Error('Tipo inválido: use receita ou custo.');
  }

  const rubrica = textoLimpo(dados?.rubrica);
  if (!rubrica) throw new Error('Diga a rubrica do lançamento.');

  const valor = numeroDeTexto(dados?.valor);
  if (valor === null) throw new Error('Valor inválido. Use só números.');

  const vencimento = textoLimpo(dados?.vencimento);
  if (vencimento !== null && !dataValida(vencimento)) throw new Error('Data inválida.');

  await exigirUsuario(cliente);

  const { data, error } = await cliente
    .from('financeiro')
    .insert({
      negocio_id: negocioId,
      tipo: dados.tipo,
      rubrica,
      descricao: textoLimpo(dados?.descricao),
      valor,
      vencimento,
    })
    .select('id')
    .single();

  if (error) throw new Error('Não foi possível lançar.');
  return data;
}

export async function apagarLancamento(cliente, lancamentoId) {
  await exigirUsuario(cliente);
  const { error } = await cliente.from('financeiro').delete().eq('id', lancamentoId);
  if (error) throw new Error('Não foi possível apagar o lançamento.');
  return { ok: true };
}
