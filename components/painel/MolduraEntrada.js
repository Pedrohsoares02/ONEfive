'use client';

import { useEffect, useRef } from 'react';

import PalcoLampada from '@/components/PalcoLampada.js';

/* A entrada do painel usa a mesma dobra da landing: classe .of-hero, então
   todo o CSS do hero (onefive.css) vale aqui sem uma linha nova. O cartão
   ocupa a coluna da esquerda, onde na landing fica o título — por isso a
   lâmpada aparece inteira, no lugar de sempre. */
export default function MolduraEntrada({ children }) {
  const secaoRef = useRef(null);
  const palcoRef = useRef(null);

  useEffect(() => {
    const secao = secaoRef.current;
    if (!secao) return undefined;

    const quadro = requestAnimationFrame(() => {
      setTimeout(() => secao.classList.add('is-revealed'), 80);
    });

    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const palco = palcoRef.current;
    let aoMover;
    let aoSair;

    if (palco && !reduz && window.matchMedia('(pointer: fine)').matches) {
      aoMover = (e) => {
        const r = secao.getBoundingClientRect();
        palco.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        palco.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      };
      aoSair = () => {
        palco.style.setProperty('--mx', 0);
        palco.style.setProperty('--my', 0);
      };
      secao.addEventListener('mousemove', aoMover);
      secao.addEventListener('mouseleave', aoSair);
    }

    return () => {
      cancelAnimationFrame(quadro);
      if (aoMover) secao.removeEventListener('mousemove', aoMover);
      if (aoSair) secao.removeEventListener('mouseleave', aoSair);
    };
  }, []);

  return (
    <section className="of-hero of-entrada" ref={secaoRef}>
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

      <PalcoLampada ref={palcoRef} />

      <div className="of-hero__wash" aria-hidden="true" />
      <div className="of-hero__bridge" aria-hidden="true" />
      <div className="of-hero__veil" aria-hidden="true" />
      <div className="of-hero__grain" aria-hidden="true" />
      {/* dissolve o bocal no rodapé: sem ela a base metálica encosta na
          borda da janela e parece cortada */}
      <div className="of-hero__fade" aria-hidden="true" />

      <div className="of-entrada__inner">
        <main className="of-entrada__cartao">{children}</main>
      </div>
    </section>
  );
}
