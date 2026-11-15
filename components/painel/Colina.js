'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation.js';

import { posicaoDaColina, ladoDaColina } from '@/lib/colina.js';
import { moverColinaAcao } from '@/app/(painel)/painel/acoes.js';

const W = 1000;
const H = 380;
const M = 70;
const CORES = ['#E6186F', '#1F6FB2', '#F0B429', '#8E5BB5', '#35A8DF'];

/* A curva é um cosseno: sobe devagar, vira no alto e desce. É o desenho da
   Basecamp, e o que ele diz é que a parte difícil não é o meio — é não saber
   ainda o que você não sabe, na subida. */
function geometria() {
  const x0 = M;
  const x1 = W - M;
  const base = H - M * 0.9;
  const alto = H - M * 2.1;
  const xy = (pos) => {
    const t = pos / 100;
    return { x: x0 + t * (x1 - x0), y: base - (alto * (1 - Math.cos(2 * Math.PI * t))) / 2 };
  };
  let d = '';
  for (let i = 0; i <= 100; i += 1) {
    const q = xy(i);
    d += (i ? 'L' : 'M') + q.x.toFixed(1) + ' ' + q.y.toFixed(1);
  }
  return {
    xy, d, x0, x1, base,
    posDeX: (x) => Math.max(0, Math.min(100, Math.round(((x - x0) / (x1 - x0)) * 100))),
  };
}

const G = geometria();

export default function Colina({ negocios, trilhas, ehLead, titulo, explicacao }) {
  const [lista, definirLista] = useState(negocios);
  const [foco, definirFoco] = useState(null);
  const [erro, definirErro] = useState(null);
  const [sobre, definirSobre] = useState(null);
  const svgRef = useRef(null);
  const router = useRouter();

  useEffect(() => { definirLista(negocios); }, [negocios]);

  const donos = [...new Set(lista.map((n) => n.dono?.nome || 'Sem dono'))].sort();
  const cor = {};
  donos.forEach((d, i) => { cor[d] = CORES[i % CORES.length]; });
  const donoDe = (n) => n.dono?.nome || 'Sem dono';

  async function gravar(negocio, pos) {
    const antes = lista;
    definirLista(lista.map((n) => (n.id === negocio.id ? { ...n, colina: pos } : n)));
    const r = await moverColinaAcao(negocio.id, pos);
    if (r?.erro) { definirLista(antes); definirErro(r.erro); return; }
    definirErro(null);
    router.refresh();
  }

  if (lista.length === 0) {
    return (
      <section className="cl-caixa">
        <Cabecalho titulo={titulo} explicacao={explicacao} resumo="" />
        <p className="cl-vazio">Nada por aqui ainda.</p>
      </section>
    );
  }

  const ordenados = lista
    .map((n) => ({ n, ...posicaoDaColina(n) }))
    .sort((a, b) => a.pos - b.pos || (a.n.titulo < b.n.titulo ? -1 : 1))
    .map((o, i) => ({ ...o, num: i + 1 }));

  // bolinhas na mesma posição se espalham só no desenho; o valor real não muda
  const grupos = {};
  ordenados.forEach((o) => { (grupos[o.pos] = grupos[o.pos] || []).push(o); });
  Object.values(grupos).forEach((g) => {
    const meia = (g.length - 1) * 1.5;
    const centro = Math.max(meia, Math.min(100 - meia, g[0].pos));
    g.forEach((o, k) => { o.visual = centro - meia + k * 3; });
  });

  const meio = G.xy(50);
  const rotulos = ehLead
    ? ['← Entendendo o que ele precisa', 'Fechando →']
    : ['← Entendendo o problema', 'Implantando a solução →'];

  const emJogo = lista.reduce((s, n) => s + Number(n.valor_previsto || 0), 0);

  return (
    <section className="cl-caixa">
      <Cabecalho
        titulo={titulo} explicacao={explicacao}
        resumo={`${lista.length} ${lista.length === 1 ? 'registro' : 'registros'} · R$ ${emJogo.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
      />

      <div className="cl-donos" role="group" aria-label="Donos: clique para destacar">
        {donos.map((d) => (
          <button
            key={d} type="button" className="cl-dono"
            style={{ '--pc': cor[d] }} aria-pressed={foco === d}
            onClick={() => definirFoco(foco === d ? null : d)}
          >
            <i aria-hidden="true" />
            <span>{d}</span>
            <small>{lista.filter((n) => donoDe(n) === d).length}</small>
          </button>
        ))}
      </div>

      {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}

      <svg
        ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="cl-svg" role="group"
        aria-label={`${titulo}: arraste cada registro conforme ele avança`}
      >
        <defs>
          <linearGradient id={`grad-${ehLead ? 'lead' : 'proj'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8E5BB5" stopOpacity=".16" />
            <stop offset="1" stopColor="#8E5BB5" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={`${G.d}L${G.x1} ${G.base}L${G.x0} ${G.base}Z`} fill={`url(#grad-${ehLead ? 'lead' : 'proj'})`} />
        <line x1={meio.x} y1={meio.y - 14} x2={meio.x} y2={G.base} className="cl-meio" />
        <line x1={G.x0} y1={G.base} x2={G.x1} y2={G.base} className="cl-chao" />
        <path d={G.d} className="cl-linha" />

        <text x={(G.x0 + meio.x) / 2} y={G.base + 30} textAnchor="middle" className="cl-rot">{rotulos[0]}</text>
        <text x={(meio.x + G.x1) / 2} y={G.base + 30} textAnchor="middle" className="cl-rot">{rotulos[1]}</text>

        <g className="cl-rastro">
          {sobre && (trilhas[sobre] ?? []).slice(0, -1).map((m, i, t) => {
            const q = G.xy(m.pos);
            return <circle key={m.quando} cx={q.x} cy={q.y} r="5" style={{ opacity: 0.25 + (0.5 * (i + 1)) / t.length }} />;
          })}
        </g>

        {ordenados.map((o) => (
          <Bolinha
            key={o.n.id} alvo={o} svgRef={svgRef} cor={cor[donoDe(o.n)]}
            apagado={foco !== null && donoDe(o.n) !== foco}
            ehLead={ehLead}
            aoEntrar={() => definirSobre(o.n.id)}
            aoSair={() => definirSobre(null)}
            aoMover={(pos) => gravar(o.n, pos)}
            aoAbrir={() => router.push(`/painel/negocio/${o.n.id}`)}
          />
        ))}
      </svg>

      <ol className="cl-lista">
        {ordenados.map((o) => (
          <li
            key={o.n.id} className={o.sugerida ? 'auto' : ''}
            style={{ '--pc': cor[donoDe(o.n)] }}
          >
            <b>{o.num}</b>
            <button type="button" onClick={() => router.push(`/painel/negocio/${o.n.id}`)}>
              {o.n.titulo}
            </button>
            <em>{o.pos}%</em>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Cabecalho({ titulo, explicacao, resumo }) {
  return (
    <div className="cl-cab">
      <div>
        <h2>{titulo}</h2>
        <p>{explicacao}</p>
      </div>
      <p className="pn-sub">{resumo}</p>
    </div>
  );
}

function Bolinha({ alvo, svgRef, cor, apagado, ehLead, aoEntrar, aoSair, aoMover, aoAbrir }) {
  const ref = useRef(null);
  const inicio = useRef(null);
  const relogio = useRef(null);

  function colocar(pos) {
    const q = G.xy(pos);
    ref.current.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
    ref.current.dataset.pos = pos;
  }

  function pontoNoSvg(e) {
    const svg = svgRef.current;
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }

  const q = G.xy(alvo.visual);

  return (
    <g
      ref={ref}
      className={'cl-no' + (alvo.sugerida ? ' auto' : '') + (apagado ? ' apagado' : '')}
      style={{ '--pc': cor }}
      transform={`translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`}
      data-pos={alvo.pos}
      tabIndex={0}
      role="slider"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={alvo.pos}
      aria-valuetext={`${alvo.pos}%, ${ladoDaColina(alvo.pos, ehLead)}`}
      aria-label={alvo.n.titulo}
      onMouseEnter={aoEntrar}
      onMouseLeave={aoSair}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        ref.current.setPointerCapture(e.pointerId);
        inicio.current = e.clientX;
        ref.current.classList.add('arrastando');
      }}
      onPointerMove={(e) => {
        if (inicio.current === null) return;
        colocar(G.posDeX(pontoNoSvg(e).x));
      }}
      onPointerUp={(e) => {
        if (inicio.current === null) return;
        const arrastou = Math.abs(e.clientX - inicio.current) > 3;
        inicio.current = null;
        ref.current.classList.remove('arrastando');
        if (arrastou) {
          const pos = Number(ref.current.dataset.pos);
          if (pos !== alvo.pos) aoMover(pos);
        } else {
          aoAbrir();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); aoAbrir(); return; }
        const passo = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 5
          : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 0;
        if (!passo) return;
        e.preventDefault();
        colocar(Math.max(0, Math.min(100, Number(ref.current.dataset.pos) + passo)));
        clearTimeout(relogio.current);
        relogio.current = setTimeout(() => aoMover(Number(ref.current.dataset.pos)), 700);
      }}
    >
      <title>{`${alvo.n.titulo} — ${alvo.pos}%, ${ladoDaColina(alvo.pos, ehLead)}${alvo.sugerida ? ' (sugerida pela etapa)' : ''}`}</title>
      <circle className="bola" r="11" />
      <text>{alvo.num}</text>
    </g>
  );
}
