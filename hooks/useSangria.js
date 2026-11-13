'use client';

import { useEffect } from 'react';
import { SANGRIA_JS } from '@/app/constants';

/**
 * Sangria real (equivalente ao onefive_janela_js_uma_vez() + medir()/sangra()
 * do snippet original). O cálculo em CSS puro (width:100vw + margin
 * calc(50%-50vw)) supõe container centralizado e 100vw inclui a barra de
 * rolagem; aqui a medida é feita no próprio elemento, igual ao original.
 *
 * @param {import('react').RefObject<HTMLElement>} ref
 * @param {{ comTopo?: boolean }} opts comTopo: também zera a margem superior
 *   (comportamento exclusivo do hero, que fica colado no topo da janela).
 */
export function useSangria(ref, opts = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let pendente = 0;

    function janela() {
      return document.documentElement.clientWidth;
    }

    function medir() {
      pendente = 0;
      if (!SANGRIA_JS) {
        el.style.marginLeft = '';
        el.style.marginRight = '';
        el.style.width = '';
        if (opts.comTopo) el.style.marginTop = '';
        return;
      }
      el.style.marginLeft = '0px';
      el.style.marginRight = '0px';
      el.style.width = 'auto';
      const r = el.getBoundingClientRect();
      const w = janela();
      el.style.width = w + 'px';
      el.style.marginLeft = -r.left + 'px';
      el.style.marginRight = r.width + r.left - w + 'px';

      if (opts.comTopo) {
        el.style.marginTop = '0px';
        const barra = document.getElementById('wpadminbar');
        const topoOk = barra ? barra.getBoundingClientRect().height : 0;
        el.style.setProperty('--wp-admin--admin-bar--height', topoOk + 'px');
        const topo = el.getBoundingClientRect().top + (window.pageYOffset || 0);
        const sobra = topo - topoOk;
        if (sobra > 0 && sobra < 200 && topo < 400) {
          el.style.marginTop = -sobra + 'px';
        }
      }
    }

    function sangra() {
      if (pendente) cancelAnimationFrame(pendente);
      pendente = requestAnimationFrame(medir);
    }

    sangra();
    window.addEventListener('resize', sangra, { passive: true });
    window.addEventListener('orientationchange', sangra, { passive: true });
    window.addEventListener('load', sangra);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sangra);

    let ro;
    if (window.ResizeObserver && el.parentElement) {
      ro = new ResizeObserver(sangra);
      ro.observe(el.parentElement);
    }

    return () => {
      if (pendente) cancelAnimationFrame(pendente);
      window.removeEventListener('resize', sangra);
      window.removeEventListener('orientationchange', sangra);
      window.removeEventListener('load', sangra);
      if (ro) ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Entrada "is-in" quando a dobra aparece na viewport (equivalente ao
 * IntersectionObserver repetido em cada dobra do snippet original).
 */
export function useRevealOnView(ref, className = 'is-in') {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      el.classList.add(className);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          el.classList.add(className);
          io.disconnect();
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
