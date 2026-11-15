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

/* Dizer que uma tarefa depende de outra. Recusa o ciclo direto (A depende de
   B que depende de A): o cálculo de nível aguenta, mas o desenho vira um
   absurdo e ninguém consegue ler o que trava o quê. */
export async function ligarTarefa(cliente, tarefaId, anteriorId) {
  if (tarefaId === anteriorId) throw new Error('Uma tarefa não depende de si mesma.');

  await exigirUsuario(cliente);

  const { data: tarefas, error: erroLeitura } = await cliente
    .from('tarefa')
    .select('id, depende_de')
    .in('id', [tarefaId, anteriorId]);

  if (erroLeitura) throw new Error('Não foi possível ler as tarefas.');

  const alvo = tarefas?.find((t) => t.id === tarefaId);
  const anterior = tarefas?.find((t) => t.id === anteriorId);
  if (!alvo || !anterior) throw new Error('Tarefa não encontrada.');

  if ((anterior.depende_de ?? []).includes(tarefaId)) {
    throw new Error('Essas duas já dependem uma da outra ao contrário.');
  }

  const atual = alvo.depende_de ?? [];
  if (atual.includes(anteriorId)) return { ok: true };

  const { error } = await cliente
    .from('tarefa')
    .update({ depende_de: [...atual, anteriorId] })
    .eq('id', tarefaId);

  if (error) throw new Error('Não foi possível ligar as tarefas.');
  return { ok: true };
}

export async function moverBalao(cliente, tarefaId, x, y) {
  const px = Math.round(Number(x));
  const py = Math.round(Number(y));
  if (!Number.isFinite(px) || !Number.isFinite(py) || px < 0 || py < 0) {
    throw new Error('Posição inválida.');
  }

  await exigirUsuario(cliente);

  const { error } = await cliente
    .from('tarefa')
    .update({ posicao_x: px, posicao_y: py })
    .eq('id', tarefaId);

  if (error) throw new Error('Não foi possível mover o balão.');
  return { ok: true };
}

/* Devolve o desenho ao cálculo automático, apagando as posições à mão. */
export async function arrumarFluxo(cliente, ids) {
  await exigirUsuario(cliente);

  const { error } = await cliente
    .from('tarefa')
    .update({ posicao_x: null, posicao_y: null })
    .in('id', ids);

  if (error) throw new Error('Não foi possível organizar o fluxo.');
  return { ok: true };
}
