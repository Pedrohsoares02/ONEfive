'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation.js';

import { BALAO, tarefasDoFluxo, arranjar } from '@/lib/fluxo.js';
import { ligarTarefaAcao, moverBalaoAcao, arrumarFluxoAcao } from '@/app/(painel)/painel/acoes.js';

const COR = {
  'Para depois': '#A9A2B8', 'A fazer': '#8E5BB5', 'Fazendo': '#1F6FB2',
  'Aguardando': '#F0B429', 'Feito': '#6B6280',
};
const iniciais = (n) => String(n || '—').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
const diaMes = (d) => (d ? d.slice(8, 10) + '/' + d.slice(5, 7) : null);

/* O fluxo mostra o que trava o quê. O kanban diz em que coluna a tarefa
   está; aqui se vê que a de quinta não começa antes da de terça. */
export default function Fluxo({ tarefas, pessoas }) {
  const [lista, definirLista] = useState(tarefas);
  const [zoom, definirZoom] = useState(1);
  const [puxando, definirPuxando] = useState(null);
  const [alvo, definirAlvo] = useState(null);
  const [erro, definirErro] = useState(null);
  const telaRef = useRef(null);
  const router = useRouter();

  useEffect(() => { definirLista(tarefas); }, [tarefas]);

  const dentro = tarefasDoFluxo(lista);
  const posicao = arranjar(dentro);
  const meio = posicao.meio;
  const idsDentro = new Set(dentro.map((t) => t.id));
  const fora = lista.filter((t) => !idsDentro.has(t.id));

  const antes = (t) => (t.depende_de ?? []).map((id) => dentro.find((x) => x.id === id)).filter(Boolean);
  const depois = (t) => dentro.filter((x) => (x.depende_de ?? []).includes(t.id));

  const feitas = dentro.filter((t) => t.coluna === 'Feito').length;
  const xFim = dentro.length
    ? Math.max(...dentro.map((t) => posicao.get(t.id).x)) + BALAO.largura + BALAO.folgaX
    : BALAO.margem + BALAO.inicio + BALAO.folgaX;
  const largura = xFim + 190;
  const altura = Math.max(
    380,
    (dentro.length ? Math.max(...dentro.map((t) => posicao.get(t.id).y + BALAO.altura)) : meio) + BALAO.margem
  );

  function pontoNoMundo(e) {
    const tela = telaRef.current;
    const r = tela.getBoundingClientRect();
    return {
      x: (e.clientX - r.left + tela.scrollLeft) / zoom,
      y: (e.clientY - r.top + tela.scrollTop) / zoom,
    };
  }

  async function gravar(acao) {
    const r = await acao();
    if (r?.erro) { definirErro(r.erro); return false; }
    definirErro(null);
    router.refresh();
    return true;
  }

  if (lista.length === 0) {
    return <p className="pn-nota">Nenhuma tarefa ainda. Crie na lista para o fluxo aparecer.</p>;
  }

  return (
    <>
      {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}

      <div className="fl-caixa">
        <div className="fl-cab">
          <div>
            <b className="num">{dentro.length ? Math.round((feitas / dentro.length) * 100) + '%' : '—'}</b>
            <p>
              {feitas} de {dentro.length} tarefas feitas. Caminho percorrido em linha cheia,
              o que falta em tracejado.
            </p>
          </div>
          <div className="fl-leg">
            <span><i className="l" /> percorrido</span>
            <span><i className="l t" /> o que falta</span>
            <span><i style={{ '--c': COR.Fazendo }} /> Fazendo</span>
            <span><i style={{ '--c': COR.Aguardando }} /> Aguardando</span>
          </div>
        </div>

        <div
          className="fl-tela" ref={telaRef}
          onPointerMove={(e) => {
            if (!puxando) return;
            const p = pontoNoMundo(e);
            definirPuxando({ ...puxando, x: p.x, y: p.y });
            const sob = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-tarefa]');
            definirAlvo(sob && sob.dataset.tarefa !== puxando.de ? sob.dataset.tarefa : null);
          }}
          onPointerUp={async () => {
            if (puxando && alvo) {
              await gravar(() => ligarTarefaAcao(alvo, puxando.de));
            }
            definirPuxando(null);
            definirAlvo(null);
          }}
        >
          <div
            className="fl-mundo"
            style={{ width: largura, height: altura, transform: `scale(${zoom})` }}
          >
            <svg width={largura} height={altura}>
              <Fios
                dentro={dentro} posicao={posicao} meio={meio} xFim={xFim}
                antes={antes} depois={depois} puxando={puxando}
              />
            </svg>

            <div className="fl-marco inicio" style={{ left: BALAO.margem, top: meio - 20 }}>
              <span>Início</span>
            </div>
            <div
              className={'fl-marco fim' + (dentro.length && feitas === dentro.length ? ' ok' : '')}
              style={{ left: xFim, top: meio - 20 }}
            >
              <span>Concluído</span>
            </div>

            {dentro.map((t) => (
              <Balao
                key={t.id} tarefa={t} em={posicao.get(t.id)} zoom={zoom}
                alvo={alvo === t.id} pessoas={pessoas}
                aoAbrir={() => router.push('#tarefa-' + t.id)}
                aoPuxar={(p) => definirPuxando({ de: t.id, x: p.x, y: p.y })}
                pontoNoMundo={pontoNoMundo}
                aoSoltar={(x, y) => gravar(() => moverBalaoAcao(t.id, x, y))}
              />
            ))}
          </div>

          <div className="fl-zoom">
            <button type="button" onClick={() => definirZoom((z) => Math.max(0.4, z - 0.15))} aria-label="Afastar">−</button>
            <button type="button" onClick={() => definirZoom((z) => Math.min(1.4, z + 0.15))} aria-label="Aproximar">+</button>
            <button
              type="button" className="largo"
              onClick={() => { definirZoom(1); gravar(() => arrumarFluxoAcao(lista.map((t) => t.id))); }}
            >
              Organizar
            </button>
          </div>
        </div>

        {fora.length > 0 && (
          <div className="fl-bandeja">
            <span>Fora do fluxo:</span>
            {fora.map((t) => (
              <button
                key={t.id} type="button"
                onClick={() => gravar(() => moverBalaoAcao(t.id, BALAO.margem + BALAO.inicio + BALAO.folgaX, 120))}
              >
                {(t.coluna === 'Para depois' ? 'Para depois · ' : 'Sem ligação · ') + t.titulo}
              </button>
            ))}
          </div>
        )}

        <p className="fl-rodape">
          Arraste um balão para onde quiser. Puxe a bolinha da direita até outro balão para dizer
          que ele depende deste. O nível vem da dependência, não da ordem de criação.
        </p>
      </div>
    </>
  );
}

function Fios({ dentro, posicao, meio, xFim, antes, depois, puxando }) {
  const saida = (t) => ({ x: posicao.get(t.id).x + BALAO.largura, y: posicao.get(t.id).y + BALAO.altura / 2 });
  const entrada = (t) => ({ x: posicao.get(t.id).x, y: posicao.get(t.id).y + BALAO.altura / 2 });
  const pIni = { x: BALAO.margem + BALAO.inicio, y: meio };
  const pFim = { x: xFim, y: meio };

  const curva = (a, b) => {
    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
    return `M${a.x} ${a.y} C${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  };

  const fios = [];
  dentro.forEach((t) => {
    const anteriores = antes(t);
    if (!anteriores.length) {
      fios.push({ k: 'i' + t.id, d: curva(pIni, entrada(t)), feito: t.coluna === 'Feito' });
    }
    anteriores.forEach((a) => {
      fios.push({ k: a.id + '>' + t.id, d: curva(saida(a), entrada(t)),
        feito: a.coluna === 'Feito' && t.coluna === 'Feito' });
    });
    if (!depois(t).length) {
      fios.push({ k: 'f' + t.id, d: curva(saida(t), pFim), feito: t.coluna === 'Feito' });
    }
  });

  return (
    <>
      {fios.map((f) => <path key={f.k} d={f.d} className={'fio' + (f.feito ? '' : ' falta')} />)}
      {puxando && posicao.get(puxando.de) && (
        <path
          d={curva(
            { x: posicao.get(puxando.de).x + BALAO.largura, y: posicao.get(puxando.de).y + BALAO.altura / 2 },
            { x: puxando.x, y: puxando.y }
          )}
          className="fio puxando"
        />
      )}
    </>
  );
}

function Balao({ tarefa, em, zoom, alvo, pessoas, aoPuxar, aoSoltar, pontoNoMundo }) {
  const ref = useRef(null);
  const pegada = useRef(null);
  const [onde, definirOnde] = useState(em);

  useEffect(() => { definirOnde(em); }, [em.x, em.y]);

  const responsavel = pessoas.find((p) => p.id === tarefa.responsavel_id);

  return (
    <div
      ref={ref}
      data-tarefa={tarefa.id}
      className={'fl-no' + (tarefa.coluna === 'Feito' ? ' feito' : '') + (alvo ? ' alvo' : '')}
      style={{ left: onde.x, top: onde.y, '--c': COR[tarefa.coluna] }}
      onPointerDown={(e) => {
        if (e.target.classList.contains('fl-porta')) return;
        if (e.button !== 0) return;
        ref.current.setPointerCapture(e.pointerId);
        const r = ref.current.getBoundingClientRect();
        pegada.current = { dx: (e.clientX - r.left) / zoom, dy: (e.clientY - r.top) / zoom, moveu: false };
      }}
      onPointerMove={(e) => {
        if (!pegada.current) return;
        const p = pontoNoMundo(e);
        pegada.current.moveu = true;
        definirOnde({
          x: Math.max(0, Math.round((p.x - pegada.current.dx) / 11) * 11),
          y: Math.max(0, Math.round((p.y - pegada.current.dy) / 11) * 11),
        });
      }}
      onPointerUp={() => {
        if (!pegada.current) return;
        const moveu = pegada.current.moveu;
        pegada.current = null;
        if (moveu) aoSoltar(onde.x, onde.y);
      }}
    >
      <span className="fl-porta ent" aria-hidden="true" />

      <div className="fl-abrir">
        <span className="fl-col">
          <i aria-hidden="true" />
          {tarefa.coluna}
          {tarefa.urgente && tarefa.coluna !== 'Feito' && <em>Urgente</em>}
        </span>
        <span className="fl-titulo">{tarefa.titulo}</span>
        <span className="fl-meta">
          <span className={'fl-av' + (responsavel ? '' : ' vazio')} title={responsavel?.nome || 'Sem responsável'}>
            {iniciais(responsavel?.nome)}
          </span>
          <span>{diaMes(tarefa.prazo) ? 'prazo ' + diaMes(tarefa.prazo) : 'sem prazo'}</span>
        </span>
      </div>

      <span
        className="fl-porta sai"
        title="Arraste até outra tarefa para dizer que ela depende desta"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          aoPuxar(pontoNoMundo(e));
        }}
      />
    </div>
  );
}
