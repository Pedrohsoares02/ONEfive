import { NextResponse } from 'next/server';

import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { destinoAposLogin } from '@/lib/autenticacao.js';

/* Para onde o Google devolve a pessoa depois do login. Troca o código de uso
   único pela sessão e grava o cookie. Rota pública por necessidade: aqui
   ainda não existe sessão nenhuma. */
export async function GET(requisicao) {
  const url = new URL(requisicao.url);
  const codigo = url.searchParams.get('code');
  const destino = destinoAposLogin(url.searchParams.get('proximo'));
  const paraLogin = (motivo) =>
    NextResponse.redirect(new URL(`/painel/login?motivo=${motivo}`, url));

  if (!codigo) return paraLogin('falhou');

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(codigo);
  if (error) return paraLogin('falhou');

  return NextResponse.redirect(new URL(destino, url));
}
