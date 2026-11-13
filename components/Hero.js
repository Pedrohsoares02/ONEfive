'use client';

import { useEffect, useRef } from 'react';
import { useSangria } from '@/hooks/useSangria';
import { HERO_IMAGEM, WHATSAPP } from '@/app/constants';

export default function Hero({
  imagem = HERO_IMAGEM,
  linha1 = 'Inovação',
  linha2 = 'pública',
  linha3 = 'na prática',
  lead = 'Da cultura de inovação à implementação de soluções, conectamos pessoas, conhecimento e oportunidades para transformar a gestão pública.',
  cta1 = 'Conheça o programa',
  cta1Url = '#metodologia',
  cta2 = 'Fale com a gente',
  cta2Url = WHATSAPP,
}) {
  const heroRef = useRef(null);
  const palcoRef = useRef(null);

  useSangria(heroRef, { comTopo: true });

  // entrada (título mascarado + blocos em blur fade up) + parallax do palco
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    const raf = requestAnimationFrame(() => {
      setTimeout(() => hero.classList.add('is-revealed'), 80);
    });

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const palco = palcoRef.current;
    let onMove;
    let onLeave;
    if (palco && !reduz && window.matchMedia('(pointer: fine)').matches) {
      onMove = (e) => {
        const r = hero.getBoundingClientRect();
        palco.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        palco.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      };
      onLeave = () => {
        palco.style.setProperty('--mx', 0);
        palco.style.setProperty('--my', 0);
      };
      hero.addEventListener('mousemove', onMove);
      hero.addEventListener('mouseleave', onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (onMove) hero.removeEventListener('mousemove', onMove);
      if (onLeave) hero.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const alvo = (url) => (/^https?:\/\//i.test(url) ? { target: '_blank', rel: 'noopener' } : {});

  return (
    <section className="of-hero" id="inicio" ref={heroRef}>
      <div className="of-hero__beam-v" style={{ '--beam': 'var(--of-pessoas)' }} />
      <div
        className="of-hero__beam-v of-hero__beam-v--right"
        style={{ '--beam': 'var(--of-tecnologia)', animationDelay: '1.8s' }}
      />
      <div className="of-hero__beam-h" style={{ '--beam': 'var(--of-metodo)' }} />

      <div className="of-hero__grid" aria-hidden="true" />
      <div className="of-hero__motes" aria-hidden="true">
        <span style={{ right: '4%', top: '6%', width: '30vw', height: '30vw', background: 'var(--of-metodo)', '--d': '26s' }} />
        <span style={{ right: '28%', top: '38%', width: '26vw', height: '26vw', background: 'var(--of-pessoas)', '--d': '31s', '--del': '3s' }} />
        <span style={{ right: '-4%', bottom: '4%', width: '28vw', height: '28vw', background: 'var(--of-tecnologia)', '--d': '29s', '--del': '6s' }} />
        <span style={{ right: '40%', bottom: '-6%', width: '22vw', height: '22vw', background: 'var(--of-dados)', '--d': '34s', '--del': '9s' }} />
      </div>

      <div className="of-hero__bg" aria-hidden="true">
        <span className="of-stage" ref={palcoRef}>
          <span className="of-aura" />
          <span className="of-rays">
            <span style={{ '--a': '0deg', '--c': 'var(--of-pessoas)' }} />
            <span style={{ '--a': '72deg', '--c': 'var(--of-processos)' }} />
            <span style={{ '--a': '144deg', '--c': 'var(--of-tecnologia)' }} />
            <span style={{ '--a': '216deg', '--c': 'var(--of-dados)' }} />
            <span style={{ '--a': '288deg', '--c': 'var(--of-metodo)' }} />
          </span>

          <span className="of-orbit" style={{ inset: '2%', '--d': '34s' }}>
            <i style={{ '--c': 'var(--of-pessoas)' }} />
          </span>
          <span className="of-orbit" style={{ inset: '14%', '--d': '26s', animationDirection: 'reverse' }}>
            <i style={{ '--c': 'var(--of-tecnologia)' }} />
          </span>
          <span className="of-orbit" style={{ inset: '26%', '--d': '44s' }}>
            <i style={{ '--c': 'var(--of-metodo)' }} />
          </span>

          <span className="of-bulb">
            {/* sem imagem definida em app/constants.js, o palco de cores continua de pé */}
            {imagem && (
              <img className="of-bulb__img" src={imagem} alt="" loading="eager" decoding="async" fetchPriority="high" />
            )}
          </span>

          <span className="of-near">
            <span className="of-wisp" style={{ inset: '4%', '--d': '19s', '--c': 'var(--of-pessoas)' }} />
            <span className="of-wisp" style={{ inset: '12%', '--d': '27s', '--c': 'var(--of-tecnologia)', animationDirection: 'reverse' }} />
            <span className="of-wisp" style={{ inset: '20%', '--d': '16s', '--c': 'var(--of-metodo)' }} />

            <span className="of-orbit of-orbit--near" style={{ inset: '8%', '--d': '14s' }}>
              <i style={{ '--c': 'var(--of-dados)' }} />
            </span>
            <span className="of-orbit of-orbit--near" style={{ inset: '17%', '--d': '11s', animationDirection: 'reverse' }}>
              <i style={{ '--c': 'var(--of-processos)' }} />
            </span>

            <span className="of-pulse" style={{ '--c': 'var(--of-pessoas)', '--del': '0s' }} />
            <span className="of-pulse" style={{ '--c': 'var(--of-tecnologia)', '--del': '2.4s' }} />
            <span className="of-pulse" style={{ '--c': 'var(--of-metodo)', '--del': '4.8s' }} />

            <span className="of-glints">
              <i style={{ left: '30%', top: '26%', '--c': 'var(--of-pessoas)', '--dur': '5.5s', '--del': '0s' }} />
              <i style={{ left: '68%', top: '19%', '--c': 'var(--of-metodo)', '--dur': '6.5s', '--del': '1.1s' }} />
              <i style={{ left: '22%', top: '48%', '--c': 'var(--of-tecnologia)', '--dur': '5s', '--del': '2.3s' }} />
              <i style={{ left: '76%', top: '43%', '--c': 'var(--of-dados)', '--dur': '7s', '--del': '.6s' }} />
              <i style={{ left: '39%', top: '63%', '--c': 'var(--of-processos)', '--dur': '6s', '--del': '3.4s' }} />
              <i style={{ left: '63%', top: '68%', '--c': 'var(--of-pessoas)', '--dur': '5.8s', '--del': '4.2s' }} />
              <i style={{ left: '52%', top: '12%', '--c': 'var(--of-tecnologia)', '--dur': '6.8s', '--del': '2.9s' }} />
              <i style={{ left: '84%', top: '60%', '--c': 'var(--of-metodo)', '--dur': '5.2s', '--del': '5.1s' }} />
            </span>
          </span>

          <span className="of-sparks">
            <i style={{ left: '12%', '--c': 'var(--of-pessoas)', '--dur': '7s', '--del': '0s' }} />
            <i style={{ left: '28%', '--c': 'var(--of-metodo)', '--dur': '9s', '--del': '1.4s' }} />
            <i style={{ left: '44%', '--c': 'var(--of-tecnologia)', '--dur': '8s', '--del': '2.8s' }} />
            <i style={{ left: '62%', '--c': 'var(--of-dados)', '--dur': '10s', '--del': '.7s' }} />
            <i style={{ left: '78%', '--c': 'var(--of-processos)', '--dur': '7.5s', '--del': '3.5s' }} />
            <i style={{ left: '92%', '--c': 'var(--of-pessoas)', '--dur': '9.5s', '--del': '4.6s' }} />
          </span>
        </span>
      </div>

      <div className="of-hero__wash" aria-hidden="true" />
      <div className="of-hero__bridge" aria-hidden="true" />
      <div className="of-hero__veil" aria-hidden="true" />
      <div className="of-hero__grain" aria-hidden="true" />
      <div className="of-hero__fade" aria-hidden="true" />

      <div className="of-hero__inner">
        <h1 className="of-hero__title">
          <span className="of-hero__line">
            <span>{linha1}</span>
          </span>
          <span className="of-hero__line of-hero__line--2">
            <span className="of-hero__outline">{linha2}</span>
          </span>
          <span className="of-hero__line of-hero__line--3">
            <span>
              {linha3}
              <span className="of-hero__period">.</span>
            </span>
          </span>
        </h1>

        <p className="of-hero__lead of-hero__fade-in of-hero__d1">{lead}</p>

        <div className="of-hero__ctas of-hero__fade-in of-hero__d2">
          <a className="of-hero__cta-ghost" href={cta1Url}>
            <span>
              {cta1}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>

          <a className="of-hero__cta-solid" href={cta2Url} {...alvo(cta2Url)}>
            <span className="of-hero__points" aria-hidden="true">
              <i /><i /><i /><i /><i /><i /><i />
            </span>
            <span className="of-hero__cta-label">
              {cta2}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        </div>
      </div>

      <nav className="of-hero__fronts of-hero__fade-in of-hero__d3" aria-label="Frentes do programa">
        <div className="of-hero__fronts-grid">
          {[
            { href: '#cultura', cor: '--of-pessoas', num: '01', nome: 'Cultura de inovação', desc: 'Desenvolvemos pessoas e ambientes preparados para inovar.' },
            { href: '#fechada', cor: '--of-dados', num: '02', nome: 'Inovação fechada', desc: 'Transformamos desafios internos em soluções concretas.' },
            { href: '#aberta', cor: '--of-processos', num: '03', nome: 'Inovação aberta', desc: 'Conectamos desafios públicos a soluções do ecossistema.' },
          ].map((f) => (
            <a className="of-front" href={f.href} style={{ '--c': `var(${f.cor})` }} key={f.href}>
              <span className="of-front__num">{f.num}</span>
              <span className="of-front__body">
                <span className="of-front__name">{f.nome}</span>
                <span className="of-front__desc">{f.desc}</span>
              </span>
              <svg className="of-front__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
          ))}
        </div>
      </nav>
    </section>
  );
}
