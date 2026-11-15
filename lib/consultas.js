/** Leitura dos negócios de um conjunto de etapas, com cliente e dono juntos. */
export async function listarNegocios(cliente, etapas) {
  const { data, error } = await cliente
    .from('negocio')
    .select(
      'id, codigo, titulo, etapa, valor_previsto, prazo, fechamento_previsto, prioridade, dono_id, cliente_id, atualizado_em, cliente:cliente_id (nome), dono:dono_id (nome)'
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
