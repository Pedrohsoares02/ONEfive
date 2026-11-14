import { exigirUsuario } from './sessao.js';
import { COLUNAS_TAREFA } from './funil.js';
import { dataValida, textoLimpo, ehIdentificador } from './valores.js';


function prazoConferido(bruto) {
  const t = textoLimpo(bruto);
  if (t === null) return null;
  if (!dataValida(t)) throw new Error('Data inválida. Use o seletor de data.');
  return t;
}

export async function criarTarefa(cliente, negocioId, dados) {
  const titulo = textoLimpo(dados?.titulo);
  if (!titulo) throw new Error('A tarefa precisa de um título.');

  const prazo = prazoConferido(dados?.prazo);

  const responsavel = textoLimpo(dados?.responsavelId);
  if (responsavel !== null && !ehIdentificador(responsavel)) {
    throw new Error('Pessoa desconhecida.');
  }

  await exigirUsuario(cliente);

  const { data, error } = await cliente
    .from('tarefa')
    .insert({ negocio_id: negocioId, titulo, prazo, responsavel_id: responsavel, coluna: 'A fazer' })
    .select('id')
    .single();

  if (error) throw new Error('Não foi possível criar a tarefa.');
  return data;
}

/* Mover para Feito carimba a conclusão; tirar de Feito apaga o carimbo,
   senão uma tarefa reaberta continuaria contando como concluída. */
export async function moverTarefa(cliente, tarefaId, coluna) {
  if (!COLUNAS_TAREFA.includes(coluna)) throw new Error('Coluna inválida: ' + coluna);

  await exigirUsuario(cliente);

  const { error } = await cliente
    .from('tarefa')
    .update({ coluna, concluido_em: coluna === 'Feito' ? new Date().toISOString() : null })
    .eq('id', tarefaId);

  if (error) throw new Error('Não foi possível mover a tarefa.');
  return { ok: true };
}

export async function renomearTarefa(cliente, tarefaId, bruto) {
  const titulo = textoLimpo(bruto);
  if (!titulo) throw new Error('A tarefa precisa de um título.');

  await exigirUsuario(cliente);

  const { error } = await cliente.from('tarefa').update({ titulo }).eq('id', tarefaId);
  if (error) throw new Error('Não foi possível renomear a tarefa.');
  return { ok: true };
}

export async function apagarTarefa(cliente, tarefaId) {
  await exigirUsuario(cliente);
  const { error } = await cliente.from('tarefa').delete().eq('id', tarefaId);
  if (error) throw new Error('Não foi possível apagar a tarefa.');
  return { ok: true };
}
