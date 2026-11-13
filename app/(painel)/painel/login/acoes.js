'use server';

import { redirect } from 'next/navigation.js';
import { criarClienteServidor } from '@/lib/supabase/servidor.js';

export async function entrar(_anterior, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const senha = String(formData.get('senha') || '');

  if (!email || !senha) return { erro: 'Preencha e-mail e senha.' };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  // Mensagem única de propósito: dizer "este e-mail não existe" entrega a
  // quem está tentando adivinhar quais contas existem.
  if (error) return { erro: 'E-mail ou senha não conferem.' };

  redirect('/painel');
}
