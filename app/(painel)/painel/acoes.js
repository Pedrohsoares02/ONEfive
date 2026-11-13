'use server';

import { revalidatePath } from 'next/cache';
import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { moverEtapa } from '@/lib/negocios.js';

export async function moverEtapaAcao(negocioId, novaEtapa) {
  const cliente = await criarClienteServidor();
  await moverEtapa(cliente, negocioId, novaEtapa);
  revalidatePath('/painel', 'layout');
  return { ok: true };
}
