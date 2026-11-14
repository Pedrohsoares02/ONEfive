'use client';

import { forwardRef } from 'react';

import { HERO_IMAGEM } from '@/app/constants';

/* O palco da lâmpada: aura, raios, órbitas, filamentos, pulsos, cintilâncias
   e fagulhas. Mora aqui porque a landing e a entrada do painel mostram o
   mesmo palco — o CSS já era compartilhado (onefive.css), agora a marcação
   também. A ref é do <span class="of-stage">, que é o que recebe o parallax
   de quem usa o componente. */
const PalcoLampada = forwardRef(function PalcoLampada({ imagem = HERO_IMAGEM }, ref) {
  return (
    <div className="of-hero__bg" aria-hidden="true">
      <span className="of-stage" ref={ref}>
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
  );
});

export default PalcoLampada;
