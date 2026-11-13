'use client';

import { useActionState } from 'react';
import { entrar } from '@/app/(painel)/painel/login/acoes.js';

export default function FormaLogin() {
  const [estado, acao, pendente] = useActionState(entrar, { erro: null });

  return (
    <form action={acao} noValidate>
      {estado?.erro && <p className="pn-erro" role="alert">{estado.erro}</p>}

      <label className="pn-campo">
        <span>E-mail</span>
        <input type="email" name="email" autoComplete="username" required autoFocus />
      </label>

      <label className="pn-campo">
        <span>Senha</span>
        <input type="password" name="senha" autoComplete="current-password" required />
      </label>

      <button className="pn-botao" type="submit" disabled={pendente}>
        {pendente ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
