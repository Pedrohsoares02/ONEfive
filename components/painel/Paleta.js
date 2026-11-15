'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation.js';

/* A paleta de comandos. Cmd+K, Ctrl+K ou barra.

   Ela busca na lista que já veio com a página, em memória — não vai ao
   servidor a cada tecla. É o que faz parecer instantânea: com três pessoas e
   uma carteira pequena, o painel inteiro cabe aqui dentro.
   shortcut: até alguns milhares de registros; passando disso, buscar no banco
   com atraso de digitação. */
export default function Paleta({ itens }) {
  const [aberta, definirAberta] = useState(false);
  const [termo, definirTermo] = useState('');
  const [escolhido, definirEscolhido] = useState(0);
  const janelaRef = useRef(null);
  const buscaRef = useRef(null);
  const router = useRouter();

  const abrir = useCallback(() => {
    definirTermo('');
    definirEscolhido(0);
    definirAberta(true);
  }, []);

  const fechar = useCallback(() => definirAberta(false), []);

  const acoes = useMemo(
    () => [
      { grupo: 'Ir para', nome: 'Início', tecla: 'G I', destino: '/painel' },
      { grupo: 'Ir para', nome: 'Leads', tecla: 'G L', destino: '/painel/leads' },
      { grupo: 'Ir para', nome: 'Projetos', tecla: 'G P', destino: '/painel/projetos' },
      { grupo: 'Criar', nome: 'Novo lead', tecla: 'N', destino: '/painel/leads?novo=1' },
      { grupo: 'Criar', nome: 'Novo projeto', destino: '/painel/projetos?novo=1' },
    ],
    []
  );

  const resultados = useMemo(() => {
    const t = termo.trim().toLowerCase();
    const casa = (s) => !t || String(s ?? '').toLowerCase().includes(t);

    const achados = itens
      .filter((i) => casa(i.nome) || casa(i.sub))
      .slice(0, 8)
      .map((i) => ({ grupo: i.grupo, nome: i.nome, sub: i.sub, destino: i.destino }));

    return [...achados, ...acoes.filter((a) => casa(a.nome) || casa(a.grupo))];
  }, [termo, itens, acoes]);

  const seguir = useCallback(
    (item) => {
      if (!item) return;
      fechar();
      router.push(item.destino);
    },
    [fechar, router]
  );

  // Abertura e fechamento ficam com o <dialog>, para ganhar o foco preso
  // dentro dele e o Esc sem código nosso.
  useEffect(() => {
    const janela = janelaRef.current;
    if (!janela) return;
    if (aberta && !janela.open) {
      janela.showModal();
      buscaRef.current?.focus();
    }
    if (!aberta && janela.open) janela.close();
  }, [aberta]);

  useEffect(() => {
    function aoTeclar(e) {
      const digitando = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        aberta ? fechar() : abrir();
        return;
      }
      if (digitando || aberta) return;

      if (e.key === '/') { e.preventDefault(); abrir(); return; }
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); router.push('/painel/leads?novo=1'); return; }
      if (e.key.toLowerCase() === 'g') { janelaRef.current.dataset.sequencia = 'g'; return; }

      if (janelaRef.current?.dataset.sequencia === 'g') {
        const destino = { i: '/painel', l: '/painel/leads', p: '/painel/projetos' }[e.key.toLowerCase()];
        delete janelaRef.current.dataset.sequencia;
        if (destino) { e.preventDefault(); router.push(destino); }
      }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberta, abrir, fechar, router]);

  function aoTeclarNaBusca(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      definirEscolhido((i) => Math.min(i + 1, resultados.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      definirEscolhido((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      seguir(resultados[escolhido]);
    }
  }

  let grupoAtual = null;

  return (
    <>
      <button className="pn-buscar" type="button" onClick={abrir}>
        <span aria-hidden="true">⌕</span>
        <span className="pn-buscar__texto">Buscar ou ir para</span>
        <kbd>⌘K</kbd>
      </button>

      <dialog className="pn-paleta" ref={janelaRef} onClose={fechar}>
        <div className="pn-paleta__busca">
          <span aria-hidden="true">⌕</span>
          <input
            ref={buscaRef}
            value={termo}
            onChange={(e) => { definirTermo(e.target.value); definirEscolhido(0); }}
            onKeyDown={aoTeclarNaBusca}
            placeholder="Buscar negócio, organização, contato — ou ir para"
            aria-label="Buscar ou ir para"
            autoComplete="off"
          />
        </div>

        <ul className="pn-paleta__lista" role="listbox">
          {resultados.length === 0 && <li className="pn-paleta__nada">Nada encontrado.</li>}

          {resultados.map((r, i) => {
            const cabecalho = r.grupo !== grupoAtual ? ((grupoAtual = r.grupo)) : null;
            return (
              <li key={r.grupo + r.nome + i}>
                {cabecalho && <p className="pn-paleta__grupo">{cabecalho}</p>}
                <button
                  type="button"
                  className="pn-paleta__item"
                  role="option"
                  aria-selected={i === escolhido}
                  onMouseMove={() => definirEscolhido(i)}
                  onClick={() => seguir(r)}
                >
                  <span>
                    {r.nome}
                    {r.sub && <em>{r.sub}</em>}
                  </span>
                  {r.tecla && <kbd>{r.tecla}</kbd>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="pn-paleta__pe">
          <span><kbd>↑</kbd> <kbd>↓</kbd> navegar</span>
          <span><kbd>Enter</kbd> abrir</span>
          <span><kbd>Esc</kbd> fechar</span>
        </div>
      </dialog>
    </>
  );
}
