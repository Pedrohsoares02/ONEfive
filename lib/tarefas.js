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

  const coluna = dados?.coluna ?? 'A fazer';
  if (!COLUNAS_TAREFA.includes(coluna)) throw new Error('Coluna inválida: ' + coluna);

  await exigirUsuario(cliente);

  const { data, error } = await cliente
    .from('tarefa')
    .insert({ negocio_id: negocioId, titulo, prazo, responsavel_id: responsavel, coluna })
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

  // Saindo de Aguardando, a espera deixa de existir: manter o nome ali
  // faria o contador seguir correndo numa tarefa que já voltou a andar.
  const espera = coluna === 'Aguardando' ? {} : { espera_quem: null, espera_desde: null };

  const { error } = await cliente
    .from('tarefa')
    .update({
      coluna,
      concluido_em: coluna === 'Feito' ? new Date().toISOString() : null,
      ...espera,
    })
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

/* Com quem está a bola, e desde quando. Trocar de pessoa reinicia a
   contagem: o relógio é de quanto tempo aquela pessoa está segurando,
   não de quanto tempo a tarefa está em Aguardando. */
export async function definirEspera(cliente, tarefaId, quem) {
  const nome = textoLimpo(quem);

  await exigirUsuario(cliente);

  const { error } = await cliente
    .from('tarefa')
    .update({
      espera_quem: nome,
      espera_desde: nome ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq('id', tarefaId);

  if (error) throw new Error('Não foi possível registrar a espera.');
  return { ok: true };
}

/* Grava a tarefa inteira de uma vez — é o que o editor manda. Sem id, cria;
   com id, altera. Juntar tudo numa chamada evita o estado meio gravado:
   título novo com prazo velho porque a segunda chamada falhou. */
export async function salvarTarefa(cliente, dados) {
  const titulo = textoLimpo(dados?.titulo);
  if (!titulo) throw new Error('A tarefa precisa de um título.');

  const coluna = dados?.coluna ?? 'A fazer';
  if (!COLUNAS_TAREFA.includes(coluna)) throw new Error('Coluna inválida: ' + coluna);

  const prazo = prazoConferido(dados?.prazo);

  const responsavel = textoLimpo(dados?.responsavelId);
  if (responsavel !== null && !ehIdentificador(responsavel)) throw new Error('Pessoa desconhecida.');

  // uma tarefa não espera por si mesma; o desenho do fluxo viraria um laço
  const depende = (dados?.dependeDe ?? []).filter((id) => id !== dados?.id && ehIdentificador(id));

  const esperaQuem = coluna === 'Aguardando' ? textoLimpo(dados?.esperaQuem) : null;

  const registro = {
    titulo,
    coluna,
    prazo,
    responsavel_id: responsavel,
    urgente: Boolean(dados?.urgente),
    observacoes: textoLimpo(dados?.observacoes),
    depende_de: depende,
    concluido_em: coluna === 'Feito' ? new Date().toISOString() : null,
    espera_quem: esperaQuem,
    // trocar de pessoa reinicia a contagem; manter a antiga faria o relógio mentir
    espera_desde: esperaQuem
      ? (dados?.esperaDesde ?? new Date().toISOString().slice(0, 10))
      : null,
  };

  await exigirUsuario(cliente);

  if (dados?.id) {
    const { error } = await cliente.from('tarefa').update(registro).eq('id', dados.id);
    if (error) throw new Error('Não foi possível gravar a tarefa.');
    return { ok: true, id: dados.id };
  }

  const { data, error } = await cliente
    .from('tarefa')
    .insert({ negocio_id: dados.negocioId, ...registro })
    .select('id')
    .single();

  if (error) throw new Error('Não foi possível criar a tarefa.');
  return { ok: true, id: data.id };
}
