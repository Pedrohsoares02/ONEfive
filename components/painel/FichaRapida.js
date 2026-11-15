'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

import { resumoDoNegocio } from '@/lib/resumo.js';

const HOJE = () => new Date().toISOString().slice(0, 10);

function iniciais(nome) {
  if (!nome) return '—';
  return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

/* O painel que abre ao lado do quadro. Só mostra o que o quadro já carregou:
   nada é buscado aqui, então ele aparece no mesmo quadro de tela do clique.
   O que ficou de fora — tarefas, financeiro, linha do tempo — está a um
   clique, na ficha. */
export default function FichaRapida({ negocio, campoData, aoFechar }) {
  const fecharRef = useRef(null);
  // .pn-tela tem z-index próprio para ficar acima da lâmpada, e isso prendia
  // o painel abaixo da barra de navegação. Ele mora no body.
  const [montado, definirMontado] = useState(false);
  useEffect(() => definirMontado(true), []);

  useEffect(() => {
    fecharRef.current?.focus();
    function tecla(e) { if (e.key === 'Escape') aoFechar(); }
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, [aoFechar]);

  const linhas = resumoDoNegocio(negocio, HOJE(), campoData);
  const contatos = negocio.cliente?.contato ?? [];

  if (!montado) return null;

  return createPortal(
    <>
      <div className="pl-veu" onClick={aoFechar} aria-hidden="true" />

      <aside className="pl-painel" role="dialog" aria-label={'Resumo de ' + negocio.titulo}>
        <div className="pl-cab">
          <span className="pl-cod">{negocio.codigo}</span>
          <button
            ref={fecharRef} type="button" className="pl-x"
            onClick={aoFechar} aria-label="Fechar o resumo"
          >
            ✕
          </button>
        </div>

        <h2 className="pl-tit">{negocio.titulo}</h2>
        <p className="pl-org">{negocio.cliente?.nome || 'Sem organização'}</p>

        <dl className="pl-linhas">
          {linhas.map((l) => (
            <div key={l.rotulo}>
              <dt>{l.rotulo}</dt>
              <dd className={l.tom ? 'tom-' + l.tom : undefined}>{l.valor}</dd>
            </div>
          ))}
        </dl>

        <p className="pl-rot">Quem decide lá dentro</p>
        {contatos.length === 0 ? (
          <p className="pl-nada">Ninguém cadastrado ainda. A ficha tem onde colocar.</p>
        ) : (
          <ul className="pl-contatos">
            {contatos.map((c, i) => (
              <li key={c.nome + i}>
                <span className="pl-ini">{iniciais(c.nome)}</span>
                <span>
                  <b>{c.nome}</b>
                  {c.cargo && <small>{c.cargo}</small>}
                </span>
              </li>
            ))}
          </ul>
        )}

        {negocio.observacoes && (
          <>
            <p className="pl-rot">Notas</p>
            <p className="pl-nota">{negocio.observacoes}</p>
          </>
        )}

        <Link className="pn-acao pn-acao--forte pl-ir" href={'/painel/negocio/' + negocio.id}>
          Abrir ficha completa
        </Link>
        <p className="pl-pe">Tarefas, financeiro e linha do tempo estão lá dentro.</p>
      </aside>
    </>,
    document.body
  );
}
