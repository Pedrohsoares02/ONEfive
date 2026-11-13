'use client';

import { useEffect, useId, useRef } from 'react';
import { useSangria, useRevealOnView } from '@/hooks/useSangria';
import { LOGO_NUCLEO } from '@/app/constants';

const FRENTES = [
  {
    slug: 'pessoas',
    nome: 'Pessoas',
    desc: 'Desenvolvemos competências, estimulamos o protagonismo e fortalecemos uma mentalidade aberta à inovação.',
    icone: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M17 4a4 4 0 0 1 0 7M19 14a5 5 0 0 1 2 4v2" />
      </>
    ),
  },
  {
    slug: 'processos',
    nome: 'Processos',
    desc: 'Simplificamos fluxos, eliminamos barreiras e aprimoramos a forma como os serviços públicos são entregues.',
    icone: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m12 2 2 2 3-1 1 3 3 1-1 3 2 2-2 2 1 3-3 1-1 3-3-1-2 2-2-2-3 1-1-3-3-1 1-3-2-2 2-2-1-3 3-1 1-3 3 1z" />
      </>
    ),
  },
  {
    slug: 'tecnologia',
    nome: 'Tecnologia',
    desc: 'Aplicamos tecnologia com propósito, conectando soluções às necessidades reais da gestão e do cidadão.',
    icone: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </>
    ),
  },
  {
    slug: 'dados',
    nome: 'Dados',
    desc: 'Transformamos informações em evidências para orientar decisões, validar soluções e mensurar resultados.',
    icone: <path d="M5 20v-7m7 7V4m7 16v-11" />,
  },
  {
    slug: 'metodo',
    nome: 'Método',
    desc: 'Estruturamos jornadas de inovação que transformam desafios em soluções testadas, validadas e sustentáveis.',
    icone: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-3 5-5 3 3-5z" />
      </>
    ),
  },
];

const CORES = ['#E6186F', '#1F6FB2', '#35A8DF', '#8E5BB5', '#F0B429'];

export default function Frentes({
  eyebrow = 'As cinco frentes',
  titulo = 'Cinco frentes.',
  subtitulo = 'Um só sistema.',
  lead = 'Pessoas, processos, tecnologia, dados e método atuam de forma integrada para transformar desafios em soluções e fazer da inovação uma capacidade permanente das instituições públicas.',
  marca = 'FIVE',
  tagA = 'ONE · núcleo',
  tagB = 'UM SÓ PROPÓSITO: O CIDADÃO.',
  contagem = '05',
  rotulo = 'forças',
  dica = 'Passe o mouse ou selecione uma frente para explorar.',
  dicaToque = 'Toque em uma frente para explorar.',
}) {
  const uid = useId().replace(/:/g, '');
  const secRef = useRef(null);

  useSangria(secRef);
  useRevealOnView(secRef);

  // infográfico das cinco frentes — porte direto do script original, operando
  // dentro da própria seção (mesmas consultas, mesmo algoritmo e timings).
  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return undefined;

    const palco = sec.querySelector('.of-f2-palco');
    const campo = sec.querySelector('.of-f2-campo');
    const roda = sec.querySelector('.of-f2-roda');
    const grupo = sec.querySelector('.of-f2-fatias');
    const caixaIcones = sec.querySelector('.of-f2-icones');
    const satBox = sec.querySelector('.of-f2-satelites');
    const lista = sec.querySelector('.of-f2-lista');
    const cards = [].slice.call(sec.querySelectorAll('.of-f2-card'));
    if (!palco || !grupo || !cards.length) return undefined;

    const NS = 'http://www.w3.org/2000/svg';
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let semente = 20261021;
    function sorte() {
      semente = (semente * 1103515245 + 12345) % 2147483648;
      return semente / 2147483648;
    }
    function entre(a, b) {
      return a + sorte() * (b - a);
    }

    const CAMADAS = [
      { classe: 'of-f2-camada--longe', qtd: 22, rmin: 20, rmax: 47, smin: 2, smax: 5, dmin: 38, dmax: 76 },
      { classe: 'of-f2-camada--meio', qtd: 16, rmin: 16, rmax: 43, smin: 3, smax: 7, dmin: 26, dmax: 52 },
      { classe: 'of-f2-camada--perto', qtd: 9, rmin: 14, rmax: 40, smin: 4, smax: 8, dmin: 18, dmax: 38 },
    ];

    const fragmento = document.createDocumentFragment();

    CAMADAS.forEach((cfg) => {
      const camada = document.createElement('div');
      camada.className = `of-f2-camada ${cfg.classe}`;

      for (let i = 0; i < cfg.qtd; i++) {
        const dim = i % 5;

        const elipse = document.createElement('div');
        elipse.className = 'of-f2-elipse';
        elipse.style.setProperty('--tilt', `${entre(-38, 38).toFixed(1)}deg`);
        elipse.style.setProperty('--ey', entre(0.44, 1).toFixed(2));

        const braco = document.createElement('div');
        braco.className = 'of-f2-orb';
        braco.setAttribute('data-dim', dim);
        braco.style.setProperty('--d', `${entre(cfg.dmin, cfg.dmax).toFixed(1)}s`);
        braco.style.setProperty('--del', `${(-entre(0, 40)).toFixed(1)}s`);
        if (sorte() > 0.5) braco.style.animationDirection = 'reverse';

        const ponto = document.createElement('i');
        ponto.style.setProperty('--rp', entre(cfg.rmin, cfg.rmax).toFixed(1));
        ponto.style.setProperty('--s', `${entre(cfg.smin, cfg.smax).toFixed(1)}px`);
        ponto.style.setProperty('--c', CORES[dim]);
        ponto.style.setProperty('--f', `${entre(3.5, 9).toFixed(1)}s`);
        ponto.style.setProperty('--del2', `${(-entre(0, 9)).toFixed(1)}s`);
        ponto.style.setProperty('--o0', entre(0.1, 0.4).toFixed(2));
        ponto.style.setProperty('--o1', entre(0.7, 1).toFixed(2));

        braco.appendChild(ponto);
        elipse.appendChild(braco);
        camada.appendChild(elipse);
      }
      fragmento.appendChild(camada);
    });

    const trilhos = document.createElement('div');
    trilhos.className = 'of-f2-camada of-f2-camada--meio of-f2-camada--nitida';

    [
      { w: 92, tilt: 0, ey: 1, ac: 'rgba(84,62,120,.10)' },
      { w: 76, tilt: -18, ey: 0.62, ac: 'rgba(142,91,181,.14)' },
      { w: 64, tilt: 24, ey: 0.5, ac: 'rgba(53,168,223,.16)' },
      { w: 50, tilt: 0, ey: 1, ac: 'rgba(255,255,255,.85)' },
    ].forEach((x) => {
      const anel = document.createElement('div');
      anel.className = 'of-f2-anel';
      anel.style.setProperty('--w', `${x.w}%`);
      anel.style.setProperty('--wn', x.w);
      anel.style.setProperty('--tilt', `${x.tilt}deg`);
      anel.style.setProperty('--ey', x.ey);
      anel.style.setProperty('--ac', x.ac);
      trilhos.appendChild(anel);
    });

    [
      { w: 84, d: 40 },
      { w: 58, d: 28 },
    ].forEach((x) => {
      const anel = document.createElement('div');
      anel.className = 'of-f2-anel of-f2-anel--pontilhado';
      anel.style.setProperty('--w', `${x.w}%`);
      anel.style.setProperty('--wn', x.w);
      anel.style.setProperty('--d', `${x.d}s`);
      trilhos.appendChild(anel);
    });

    [
      { w: 88, d: 16, c: '#E6186F', del: 0 },
      { w: 70, d: 22, c: '#35A8DF', del: -7 },
      { w: 54, d: 13, c: '#F0B429', del: -3 },
    ].forEach((x) => {
      const cometa = document.createElement('div');
      cometa.className = 'of-f2-cometa';
      cometa.style.setProperty('--w', `${x.w}%`);
      cometa.style.setProperty('--wn', x.w);
      cometa.style.setProperty('--d', `${x.d}s`);
      cometa.style.setProperty('--c', x.c);
      cometa.style.setProperty('--del', `${x.del}s`);
      trilhos.appendChild(cometa);
    });

    fragmento.appendChild(trilhos);
    campo.appendChild(fragmento);

    function xy(r, ang) {
      const t = ((ang - 90) * Math.PI) / 180;
      return [300 + r * Math.cos(t), 300 + r * Math.sin(t)];
    }
    function fatiaPath(ini, fim) {
      const a = xy(272, ini);
      const b = xy(272, fim);
      const c = xy(160, fim);
      const d = xy(160, ini);
      return `M${a[0]} ${a[1]} A272 272 0 0 1 ${b[0]} ${b[1]} L${c[0]} ${c[1]} A160 160 0 0 0 ${d[0]} ${d[1]} Z`;
    }

    const fatias = [];
    const icones = [];

    cards.forEach((card, i) => {
      const nome = card.querySelector('strong').textContent;

      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', fatiaPath(i * 72 + 1.6, (i + 1) * 72 - 1.6));
      p.setAttribute('fill', `url(#${uid}-g${i})`);
      p.setAttribute('class', 'of-f2-fatia');
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');
      p.setAttribute('aria-label', nome);
      p.style.setProperty('--c', CORES[i]);
      grupo.appendChild(p);
      fatias.push(p);

      const fonte = card.querySelector('.of-f2-card__icone svg');
      const meio = xy(216, i * 72 + 36);
      const g = document.createElementNS(NS, 'g');
      const pos = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'of-f2-icone');
      pos.setAttribute(
        'transform',
        `translate(${meio[0].toFixed(1)},${meio[1].toFixed(1)}) scale(1.55) translate(-12,-12)`
      );
      [].forEach.call(fonte.childNodes, (n) => pos.appendChild(n.cloneNode(true)));
      g.appendChild(pos);
      caixaIcones.appendChild(g);
      icones.push(g);

      const sat = document.createElement('div');
      sat.className = 'of-f2-satelite';
      sat.setAttribute('data-dim', i);
      sat.style.setProperty('--a', i * 72 + 36);
      sat.innerHTML = `<i style="--c:${CORES[i]}"></i>`;
      satBox.appendChild(sat);
    });

    let escolhido = 0;

    function aplica(i) {
      palco.setAttribute('data-ativo', i);
      roda.classList.add('tem-ativa');
      fatias.forEach((f, j) => f.classList.toggle('ativa', j === i));
      icones.forEach((g, j) => g.classList.toggle('ativa', j === i));
      cards.forEach((c, j) => {
        c.classList.toggle('ativa', j === i);
        c.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
    }
    function ativa(i, temporario) {
      if (!temporario) escolhido = i;
      aplica(i);
    }
    const limpezas = [];
    function liga(el, i) {
      const onEnter = () => ativa(i, true);
      const onLeave = () => aplica(escolhido);
      const onFocus = () => ativa(i, true);
      const onBlur = () => aplica(escolhido);
      const onClick = () => ativa(i, false);
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('focus', onFocus);
      el.addEventListener('blur', onBlur);
      el.addEventListener('click', onClick);
      limpezas.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('focus', onFocus);
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('click', onClick);
      });
    }
    fatias.forEach((f, i) => {
      liga(f, i);
      const onKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          ativa(i, false);
        }
      };
      f.addEventListener('keydown', onKey);
      limpezas.push(() => f.removeEventListener('keydown', onKey));
    });
    cards.forEach((c, i) => liga(c, i));

    aplica(0);

    if (window.matchMedia('(hover: none)').matches) {
      const dicaEl = sec.querySelector('.of-f2-dica');
      if (dicaEl && dicaEl.dataset.toque) dicaEl.textContent = dicaEl.dataset.toque;
    }

    let relogio = null;
    let pausado = false;
    let ioGiro;
    let onMove;
    let onLeavePalco;

    if (!calmo) {
      function passo() {
        if (!pausado && !document.hidden) {
          escolhido = (escolhido + 1) % cards.length;
          aplica(escolhido);
        }
      }
      function comeca() {
        if (!relogio) relogio = setInterval(passo, 4200);
      }
      function para() {
        clearInterval(relogio);
        relogio = null;
      }

      [palco, lista].forEach((el) => {
        const onIn = () => {
          pausado = true;
        };
        const onOut = () => {
          pausado = false;
        };
        el.addEventListener('mouseenter', onIn);
        el.addEventListener('focusin', onIn);
        el.addEventListener('mouseleave', onOut);
        el.addEventListener('focusout', onOut);
        limpezas.push(() => {
          el.removeEventListener('mouseenter', onIn);
          el.removeEventListener('focusin', onIn);
          el.removeEventListener('mouseleave', onOut);
          el.removeEventListener('focusout', onOut);
        });
      });

      if ('IntersectionObserver' in window) {
        ioGiro = new IntersectionObserver(
          (es) => (es[0].isIntersecting ? comeca() : para()),
          { threshold: 0.25 }
        );
        ioGiro.observe(palco);
      } else {
        comeca();
      }

      if (window.matchMedia('(pointer: fine)').matches) {
        let quadro = null;
        onMove = (e) => {
          if (quadro) cancelAnimationFrame(quadro);
          quadro = requestAnimationFrame(() => {
            const r = palco.getBoundingClientRect();
            campo.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * -26).toFixed(1));
            campo.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * -26).toFixed(1));
            quadro = null;
          });
        };
        onLeavePalco = () => {
          campo.style.setProperty('--px', 0);
          campo.style.setProperty('--py', 0);
        };
        palco.addEventListener('mousemove', onMove);
        palco.addEventListener('mouseleave', onLeavePalco);
      }
    }

    return () => {
      limpezas.forEach((fn) => fn());
      if (relogio) clearInterval(relogio);
      if (ioGiro) ioGiro.disconnect();
      if (onMove) palco.removeEventListener('mousemove', onMove);
      if (onLeavePalco) palco.removeEventListener('mouseleave', onLeavePalco);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return (
    <section className="of-sec of-sec--full of-frentes" id="frentes" ref={secRef}>
      <div className="of-sec__motes" aria-hidden="true">
        <span style={{ left: '-6%', top: '10%', width: '34vw', height: '34vw', background: 'var(--of-tecnologia)', '--d': '28s' }} />
        <span style={{ right: '-4%', bottom: 0, width: '30vw', height: '30vw', background: 'var(--of-pessoas)', '--d': '33s', '--del': '5s' }} />
        <span style={{ left: '38%', top: '46%', width: '26vw', height: '26vw', background: 'var(--of-metodo)', '--d': '30s', '--del': '9s' }} />
      </div>
      <span className="of-sec__watermark" aria-hidden="true">{marca}</span>

      <div className="of-sec__inner">
        <header>
          <div className="of-sec__eyebrow of-reveal">
            <i aria-hidden="true" />
            <span>{eyebrow}</span>
            <em aria-hidden="true" />
          </div>
          <h2 className="of-sec__title of-reveal of-d1">
            {titulo}
            <b>{subtitulo}</b>
          </h2>
          <p className="of-sec__lead of-reveal of-d2">{lead}</p>
        </header>

        <div className="of-frentes__grid">
          <div className="of-f2-palco of-reveal of-d1" data-ativo="0" aria-label={eyebrow}>
            <div className="of-f2-etiqueta">
              {tagA}
              <div className="of-f2-barras" aria-hidden="true">
                {FRENTES.map((f) => (
                  <i key={f.slug} style={{ '--c': `var(--of-${f.slug})` }} />
                ))}
              </div>
            </div>

            <div className="of-f2-campo" aria-hidden="true" />

            <div className="of-f2-roda">
              <svg viewBox="0 0 600 600" role="img" aria-label="Anel com as cinco frentes da ONEfive">
                <defs>
                  <linearGradient id={`${uid}-g0`} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#FF7CB1" />
                    <stop offset=".6" stopColor="#EE287B" />
                    <stop offset="1" stopColor="#B90854" />
                  </linearGradient>
                  <linearGradient id={`${uid}-g1`} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#63B9F2" />
                    <stop offset=".65" stopColor="#1F6FB2" />
                    <stop offset="1" stopColor="#154C90" />
                  </linearGradient>
                  <linearGradient id={`${uid}-g2`} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#8CE8FA" />
                    <stop offset=".6" stopColor="#35A8DF" />
                    <stop offset="1" stopColor="#137DA9" />
                  </linearGradient>
                  <linearGradient id={`${uid}-g3`} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#C6A8F6" />
                    <stop offset=".6" stopColor="#8E5BB5" />
                    <stop offset="1" stopColor="#67389C" />
                  </linearGradient>
                  <linearGradient id={`${uid}-g4`} x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#FFE9A0" />
                    <stop offset=".6" stopColor="#F0B429" />
                    <stop offset="1" stopColor="#CE8E10" />
                  </linearGradient>
                </defs>
                <g className="of-f2-fatias" />
                <circle className="of-f2-brilho" cx="300" cy="300" r="266" />
                <circle className="of-f2-brilho" cx="300" cy="300" r="168" />
                <circle cx="300" cy="300" r="150" fill="#fff" opacity=".88" />
                <g className="of-f2-icones" aria-hidden="true" />
              </svg>
              <div className="of-f2-satelites" aria-hidden="true" />
            </div>

            <div className="of-f2-aura" aria-hidden="true" />
            <div className="of-f2-nucleo">
              {LOGO_NUCLEO ? (
                <img src={LOGO_NUCLEO} alt="ONEfive" loading="lazy" decoding="async" />
              ) : (
                <span className="of-f2-nucleo__texto">
                  <b>ONE</b>five
                </span>
              )}
            </div>

            <div className="of-f2-numero">
              <div className="of-f2-numero__topo">
                <strong>{contagem}</strong>
                <small>{rotulo}</small>
              </div>
              <div className="of-f2-numero__regua" aria-hidden="true" />
              <div className="of-f2-numero__copy">{tagB}</div>
            </div>
          </div>

          <div className="of-f2-lista" role="group" aria-label={eyebrow}>
            {FRENTES.map((f, i) => (
              <button
                key={f.slug}
                className={`of-f2-card of-reveal of-d${i + 1}`}
                type="button"
                data-index={i}
                data-f={f.slug}
                style={{ '--c': `var(--of-${f.slug})` }}
                aria-pressed={i === 0 ? 'true' : 'false'}
              >
                <span className="of-f2-card__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="of-f2-card__icone">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    {f.icone}
                  </svg>
                </span>
                <span className="of-f2-card__corpo">
                  <strong>{f.nome}</strong>
                  <small>{f.desc}</small>
                </span>
                <span className="of-f2-card__seta" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="of-f2-dica" data-toque={dicaToque}>{dica}</p>
      </div>
    </section>
  );
}
