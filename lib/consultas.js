/** Leitura dos negócios de um conjunto de etapas, com cliente e dono juntos. */
export async function listarNegocios(cliente, etapas) {
  const { data, error } = await cliente
    .from('negocio')
    .select(
      'id, codigo, titulo, etapa, valor_previsto, prazo, fechamento_previsto, prioridade, dono_id, cliente:cliente_id (nome), dono:dono_id (nome)'
    )
    .in('etapa', etapas)
    .order('criado_em', { ascending: false });

  if (error) throw new Error('Não foi possível ler os negócios.');
  return data ?? [];
}
