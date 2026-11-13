import { ETAPAS } from './funil.js';
import { exigirUsuario } from './sessao.js';

/**
 * Move o negócio de etapa.
 *
 * A etapa é conferida aqui ANTES de tocar no banco, e de novo pelo CHECK da
 * tabela: a tela não é fronteira de confiança, qualquer requisição pode
 * chegar com o que quiser. A sessão é conferida antes da gravação, para que
 * um cookie vencido não escreva nada.
 */
export async function moverEtapa(cliente, negocioId, novaEtapa) {
  if (!ETAPAS.includes(novaEtapa)) throw new Error('Etapa inválida: ' + novaEtapa);

  await exigirUsuario(cliente);

  const { error } = await cliente
    .from('negocio')
    .update({ etapa: novaEtapa, atualizado_em: new Date().toISOString() })
    .eq('id', negocioId);

  if (error) throw new Error('Não foi possível mover o negócio.');
  return { ok: true };
}
