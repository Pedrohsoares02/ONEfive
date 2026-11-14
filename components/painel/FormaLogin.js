'use client';

import { useState } from 'react';

import { criarClienteNavegador } from '@/lib/supabase/navegador.js';

export default function FormaLogin() {
  const [erro, definirErro] = useState(null);
  const [pendente, definirPendente] = useState(false);

  async function entrarComGoogle() {
    definirPendente(true);
    definirErro(null);

    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/painel/auth/retorno` },
    });

    // Se deu certo, o navegador já saiu daqui para o Google.
    if (error) {
      definirErro('Não deu para abrir o login do Google. Tente de novo.');
      definirPendente(false);
    }
  }

  return (
    <>
      {erro && (
        <p className="pn-erro" role="alert">
          {erro}
        </p>
      )}

      <button
        className="pn-botao"
        type="button"
        onClick={entrarComGoogle}
        disabled={pendente}
      >
        {pendente ? 'Abrindo o Google…' : 'Entrar com Google'}
      </button>
    </>
  );
}
