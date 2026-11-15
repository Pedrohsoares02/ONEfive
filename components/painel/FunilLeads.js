'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { recortes, filtrarNegocios } from '@/lib/recortes.js';
import { previsaoDoFunil, previsaoPonderada } from '@/lib/funil.js';
import Quadro from '@/components/painel/Quadro.js';

const HOJE = () => new Date().toISOString().slice(0, 10);

function dinheiro(v) {
  return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

const PINOS = [
  { chave: 'parado', rotulo: 'parados', classe: 'risco' },
  { chave: 'perto', rotulo: 'fecham este mês', classe: 'perto' },
  { chave: 'semvalor', rotulo: 'sem valor', classe: 'falta' },
];

/* O topo da página de leads: os três números que são filtros, o corte por
   dono e a busca. O dinheiro acompanha o corte — "meus leads" mostra o que
   é meu, não o do funil inteiro. */
export default function FunilLeads({ negocios, pessoas, etapas, children }) {
  const [recorte, definirRecorte] = useState(null);
  const [donoId, definirDono] = useState('');
  const [texto, definirTexto] = useState('');
  const buscaRef = useRef(null);
  const hoje = HOJE();

  const marcas = useMemo(() => recortes({ negocios, hoje }), [negocios, hoje]);
  const visiveis = useMemo(
    () => filtrarNegocios(negocios, { recorte, donoId, texto, hoje }),
    [negocios, recorte, donoId, texto, hoje]
  );

  const vivos = visiveis.filter((n) => n.etapa !== 'Perdido');
  const emJogo = previsaoDoFunil(vivos);
  const ponderada = previsaoPonderada(vivos);
  const filtrando = Boolean(recorte || donoId || texto);

  useEffect(() => {
    function atalho(e) {
      if (e.key !== '/' || e.target === buscaRef.current) return;
      const campo = e.target;
      if (campo?.tagName === 'INPUT' || campo?.tagName === 'TEXTAREA' || campo?.isContentEditable) return;
      e.preventDefault();
      buscaRef.current?.focus();
    }
    addEventListener('keydown', atalho);
    return () => removeEventListener('keydown', atalho);
  }, []);

  function limpar() {
    definirRecorte(null);
    definirDono('');
    definirTexto('');
  }

  return (
    <>
      <div className="pn-barra">
        <div>
          <h1>Leads</h1>
          <div className="pn-money">
            <span><b className="num">{dinheiro(emJogo)}</b> <small>em jogo</small></span>
            <span className="pn-money__sep" />
            <span className="pn-money__pond">
              <b className="num">{dinheiro(ponderada)}</b> <small>previsão ponderada</small>
            </span>
          </div>
        </div>
        {children}
      </div>

      <div className="pn-faixa">
        {PINOS.map((p) => (
          <button
            key={p.chave}
            type="button"
            className={'pn-pino ' + p.classe}
            aria-pressed={recorte === p.chave}
            onClick={() => definirRecorte((r) => (r === p.chave ? null : p.chave))}
          >
            <em className="num">{marcas[p.chave].n}</em>
            <span>
              {p.rotulo}
              <span className="pn-pino__cifra num">
                {p.chave === 'semvalor' ? 'não entram na conta' : dinheiro(marcas[p.chave].soma)}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="pn-corte">
        <div className="pn-donos">
          <button
            type="button" className="pn-dono-b"
            aria-pressed={donoId === ''} onClick={() => definirDono('')}
          >
            Todos
          </button>
          {pessoas.map((p) => (
            <button
              key={p.id} type="button" className="pn-dono-b"
              aria-pressed={donoId === p.id}
              onClick={() => definirDono((d) => (d === p.id ? '' : p.id))}
            >
              {p.nome.split(' ')[0]}
            </button>
          ))}
        </div>

        {filtrando && (
          <button type="button" className="pn-limpar" onClick={limpar}>limpar filtro</button>
        )}

        <div className="pn-busca">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={buscaRef} value={texto} onChange={(e) => definirTexto(e.target.value)}
            placeholder="Buscar lead ou órgão" aria-label="Buscar lead ou órgão"
          />
          <kbd>/</kbd>
        </div>
      </div>

      {visiveis.length === 0 ? (
        <p className="pn-vazio">Nenhum lead neste corte. <button type="button" className="pn-limpar" onClick={limpar}>Ver todos</button></p>
      ) : (
        <Quadro etapas={etapas} negocios={visiveis} tipo="leads" gaveta="Perdido" />
      )}
    </>
  );
}
