/** Leitura dos negócios de um conjunto de etapas, com cliente e dono juntos. */
export async function listarNegocios(cliente, etapas) {
  const { data, error } = await cliente
    .from('negocio')
    .select(
      'id, codigo, titulo, etapa, valor_previsto, inicio, prazo, fechamento_previsto, prioridade, observacoes, dono_id, cliente_id, atualizado_em, cliente:cliente_id (nome, contato (nome, cargo)), dono:dono_id (nome)'
    )
    .in('etapa', etapas)
    .order('criado_em', { ascending: false });

  if (error) throw new Error('Não foi possível ler os negócios.');
  return data ?? [];
}

/** Pessoas ativas do time, para os campos de dono e responsável. */
export async function listarPessoas(cliente) {
  const { data, error } = await cliente
    .from('pessoa')
    .select('id, nome')
    .eq('ativo', true)
    .order('nome');

  if (error) throw new Error('Não foi possível ler o time.');
  return data ?? [];
}

/** Clientes já cadastrados, para a lista de sugestões do formulário. */
export async function listarClientes(cliente) {
  const { data, error } = await cliente
    .from('cliente')
    .select('id, nome')
    .order('nome');

  if (error) throw new Error('Não foi possível ler os clientes.');
  return data ?? [];
}

/* Quando cada negócio se mexeu pela última vez, da view negocio_movimento.
   Devolve um Map id → data, para quem chama juntar aos negócios. */
export async function lerMovimento(cliente) {
  const { data, error } = await cliente.from('negocio_movimento').select('negocio_id, ultimo_em');
  if (error) throw new Error('Não foi possível ler o movimento dos negócios.');
  return new Map((data ?? []).map((m) => [m.negocio_id, m.ultimo_em]));
}

/* Junta o último movimento a cada negócio, no formato que lib/parado.js lê. */
export function comMovimento(negocios, movimento) {
  return negocios.map((n) => ({ ...n, ultimoEm: movimento.get(n.id) ?? null }));
}

/* Tarefas de vários negócios de uma vez. A tela de Projetos precisa das
   tarefas de toda a carteira para montar a fila de pendências; buscar projeto
   a projeto seria uma ida ao banco por cartão. */
export async function listarTarefasDe(cliente, ids) {
  if (!ids?.length) return [];
  const { data, error } = await cliente
    .from('tarefa')
    .select('id, negocio_id, titulo, coluna, prazo, responsavel_id, urgente, depende_de, espera_quem, espera_desde')
    .in('negocio_id', ids);

  if (error) throw new Error('Não foi possível ler as tarefas.');
  return data ?? [];
}

/** Lançamentos de vários negócios, pelo mesmo motivo. */
export async function listarLancamentosDe(cliente, ids) {
  if (!ids?.length) return [];
  const { data, error } = await cliente
    .from('financeiro')
    .select('id, negocio_id, tipo, valor, vencimento, pago_em')
    .in('negocio_id', ids);

  if (error) throw new Error('Não foi possível ler o financeiro.');
  return data ?? [];
}

/* Junta tarefas e lançamentos a cada negócio. Agrupar aqui, e não na tela,
   evita que o navegador percorra as duas listas inteiras por cartão. */
export function comOperacao(negocios, tarefas, lancamentos) {
  const porNegocio = (lista) => {
    const mapa = new Map();
    for (const item of lista) {
      const atual = mapa.get(item.negocio_id);
      if (atual) atual.push(item);
      else mapa.set(item.negocio_id, [item]);
    }
    return mapa;
  };
  const t = porNegocio(tarefas);
  const l = porNegocio(lancamentos);
  return negocios.map((n) => ({ ...n, tarefas: t.get(n.id) ?? [], lancamentos: l.get(n.id) ?? [] }));
}
