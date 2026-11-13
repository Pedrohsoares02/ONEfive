'use client';

import { useEffect, useRef } from 'react';
import { useSangria } from '@/hooks/useSangria';
import { FINAL_VIDEO, FINAL_POSTER, LOGO_CLARA, WHATSAPP } from '@/app/constants';

export default function Final({
  video = FINAL_VIDEO,
  poster = FINAL_POSTER,
  frase = 'O futuro do serviço público se constrói aqui!',
  cta = 'Fale com a gente',
  ctaUrl = WHATSAPP,
}) {
  const secRef = useRef(null);
  const logoRef = useRef(null);

  useSangria(secRef);

  // aparar a margem transparente embutida na logo, para o respiro acima
  // dela ficar igual ao de baixo do botão
  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return undefined;

    function aparar() {
      if (!logo.naturalWidth) return;
      const canvas = document.createElement('canvas');
      const k = 220 / logo.naturalWidth;
      canvas.width = 220;
      canvas.height = Math.max(1, Math.round(logo.naturalHeight * k));
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(logo, 0, 0, canvas.width, canvas.height);
      let d;
      try {
        d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      } catch (e) {
        return;
      }
      let topo = -1;
      let base = -1;
      for (let y = 0; y < canvas.height; y++) {
        const fim = (y + 1) * canvas.width * 4;
        for (let px = y * canvas.width * 4 + 3; px < fim; px += 4) {
          if (d[px] > 16) {
            if (topo < 0) topo = y;
            base = y;
            break;
          }
        }
      }
      if (topo < 0) return;
      const esc = logo.getBoundingClientRect().height / canvas.height;
      logo.style.setProperty('--of-aparo-topo', `${(topo * esc).toFixed(1)}px`);
      logo.style.setProperty('--of-aparo-base', `${((canvas.height - 1 - base) * esc).toFixed(1)}px`);
    }

    if (logo.complete) aparar();
    else logo.addEventListener('load', aparar);
    window.addEventListener('resize', aparar, { passive: true });
    return () => {
      logo.removeEventListener('load', aparar);
      window.removeEventListener('resize', aparar);
    };
  }, []);

  // vídeo só roda com a dobra na tela; entrada "is-in" ao aparecer
  useEffect(() => {
    const sec = secRef.current;
    const video2 = sec ? sec.querySelector('video') : null;
    if (!sec) return undefined;

    if (video2 && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video2.pause();
      video2.removeAttribute('autoplay');
    }

    if (!('IntersectionObserver' in window)) {
      sec.classList.add('is-in');
      return undefined;
    }
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          sec.classList.toggle('is-in', e.isIntersecting || sec.classList.contains('is-in'));
          if (video2) {
            if (e.isIntersecting) video2.play().catch(() => {});
            else video2.pause();
          }
        });
      },
      { threshold: 0.08 }
    );
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  const alvo = /^https?:\/\//i.test(ctaUrl) ? { target: '_blank', rel: 'noopener' } : {};

  return (
    <section className="of-sec of-sec--full of-final" id="contato" ref={secRef}>
      <div className="of-final__video" aria-hidden="true">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video autoPlay muted loop playsInline preload="metadata" poster={poster || undefined}>
          <source src={video} type="video/mp4" />
        </video>
      </div>
      <div className="of-final__veu" aria-hidden="true" />
      <div className="of-final__grao" aria-hidden="true" />

      <div className="of-sec__inner">
        <div className="of-final__palco">
          <div className="of-final__card of-reveal">
            <span className="of-final__beam" aria-hidden="true" />

            {LOGO_CLARA ? (
              <img
                ref={logoRef}
                className="of-final__logo"
                src={LOGO_CLARA}
                alt="ONEfive — inovação e negócios"
                width={412}
                height={143}
                decoding="async"
              />
            ) : (
              <p className="of-final__marca">
                <b>ONE</b>
                <span>five</span>
              </p>
            )}
            {!LOGO_CLARA && <div className="of-final__filete" aria-hidden="true" />}
            <p className="of-final__frase">{frase}</p>

            <a className="of-final__botao" href={ctaUrl} {...alvo}>
              <span>{cta}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
