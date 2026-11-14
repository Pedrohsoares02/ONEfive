'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation.js';

import { apagarNegocioAcao } from '@/app/(painel)/painel/acoes.js';

/* Apagar não tem volta e leva junto tarefas, lançamentos e histórico, então
   pede confirmação no próprio botão: um clique arma, o segundo apaga. Sem
   janela do navegador, que trava a página enquanto estiver aberta. */
export default function ApagarNegocio({ negocioId, titulo, voltarPara }) {
  const [armado, definirArmado] = useState(false);
  const [apagando, definirApagando] = useState(false);
  const [erro, definirErro] = useState(null);
  const router = useRouter();

  async function apagar() {
    definirApagando(true);
    const r = await apagarNegocioAcao(negocioId);
    if (r?.erro) {
      definirErro(r.erro);
      definirApagando(false);
      definirArmado(false);
      return;
    }
    router.push(voltarPara);
    router.refresh();
  }

  if (!armado) {
    return (
      <>
        <button className="pn-acao pn-acao--perigo" type="button" onClick={() => definirArmado(true)}>
          Apagar
        </button>
        {erro && <span className="pn-recusa" role="alert">{erro}</span>}
      </>
    );
  }

  return (
    <span className="pn-confirma" role="group" aria-label={'Apagar ' + titulo}>
      <span className="pn-confirma__texto">
        Apagar <strong>{titulo}</strong> e tudo que está nele? Não tem volta.
      </span>
      <button className="pn-acao pn-acao--leve" type="button" onClick={() => definirArmado(false)}>
        Cancelar
      </button>
      <button className="pn-acao pn-acao--perigo" type="button" onClick={apagar} disabled={apagando}>
        {apagando ? 'Apagando…' : 'Apagar mesmo'}
      </button>
    </span>
  );
}
