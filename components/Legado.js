'use client';

import { useRef } from 'react';
import { useSangria, useRevealOnView } from '@/hooks/useSangria';

const LEGADOS = [
  { cor: '--of-pessoas', n: '01', titulo: 'Pessoas formadas e atuando', desc: 'Servidores com competências, método e protagonismo para transformar desafios reais em soluções.' },
  { cor: '--of-processos', n: '02', titulo: 'Processos redesenhados e em uso', desc: 'Fluxos aprimorados para otimizar recursos, reduzir barreiras e melhorar a experiência do cidadão.' },
  { cor: '--of-tecnologia', n: '03', titulo: 'Soluções implantadas', desc: 'Desafios transformados em soluções viáveis, orientadas por evidências e preparadas para implementação.' },
  { cor: '--of-metodo', n: '04', titulo: 'Capacidade que permanece', desc: 'Conhecimento, práticas e estruturas que fortalecem a autonomia da instituição para continuar inovando.' },
];

export default function Legado({
  eyebrow = 'Resultados que permanecem',
  titulo = 'Nosso maior legado não são as soluções.',
  subtitulo = 'É a capacidade de continuar.',
}) {
  const secRef = useRef(null);
  useSangria(secRef);
  useRevealOnView(secRef);

  return (
    <section className="of-sec of-sec--full of-legado" id="legado" ref={secRef}>
      <div className="of-sec__motes" aria-hidden="true">
        <span style={{ left: '-8%', top: '8%', width: '30vw', height: '30vw', background: 'var(--of-metodo)', '--d': '29s' }} />
        <span style={{ right: '-6%', bottom: '6%', width: '32vw', height: '32vw', background: 'var(--of-tecnologia)', '--d': '34s', '--del': '7s' }} />
      </div>

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
        </header>

        <ul className="of-legados of-reveal of-d2">
          {LEGADOS.map((l) => (
            <li className="of-legado__item" style={{ '--c': `var(${l.cor})` }} key={l.n}>
              <span className="of-legado__n">{l.n}</span>
              <h3 className="of-legado__t">{l.titulo}</h3>
              <p className="of-legado__d">{l.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
