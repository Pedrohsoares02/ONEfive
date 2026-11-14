'use client';

import { useEffect, useRef } from 'react';
import { LOGO_HERO, LOGO_CLARA, SANGRIA_JS } from '@/app/constants';

const LINKS = [
  { txt: 'As cinco frentes', url: '#frentes' },
  { txt: 'O programa', url: '#caminhos' },
  { txt: 'Nosso legado', url: '#legado' },
  { txt: 'Fale com a gente', url: '#contato' },
];

const alvo = (url) => (/^https?:\/\//i.test(url) ? { target: '_blank', rel: 'noopener' } : {});

export default function Topo() {
  const marcaRef = useRef(null);

  // cromo da página inteira: barra fixa, trilho de progresso, menu de
  // celular e troca de logo no modo noite — porte direto do script
  // original, que já opera no document inteiro (não só nesta seção).
  useEffect(() => {
    const raiz = document.documentElement;
    // equivalente ao onefive_janela_js_uma_vez(): globais que o rodapé e as
    // demais dobras leem para a sangria real (100vw medido, não estimado)
    if (typeof window.onefiveSangra === 'undefined') window.onefiveSangra = SANGRIA_JS;
    if (typeof window.onefiveJanela === 'undefined') {
      window.onefiveJanela = () => document.documentElement.clientWidth;
    }
    if (raiz.dataset.ofCromo) return undefined;
    raiz.dataset.ofCromo = '1';

    const topo = document.getElementById('of-topo');
    const cap = document.getElementById('of-cap');
    const capT = document.getElementById('of-cap-t');
    const capN = document.getElementById('of-cap-n');
    const marca = document.getElementById('of-marca');

    const MAPA = [
      ['.of-hero', 'Inovação pública', '01', '#E6186F'],
      ['#frentes', 'As cinco frentes', '02', '#1F6FB2'],
      ['#metodologia', 'Como atuamos', '03', '#35A8DF'],
      ['#legado', 'Nosso legado', '04', '#8E5BB5'],
      ['#contato', 'Fale com a gente', '05', '#F0B429'],
    ];
    let CAPS = [];
    let escuro = null;
    let rodape = null;
    let visto = -1;

    function colaNoFim() {
      let el = rodape.parentElement;
      while (el && el !== document.documentElement) {
        const cs = getComputedStyle(el);
        if (parseFloat(cs.paddingBottom) > 0.5) el.style.paddingBottom = '0px';
        if (parseFloat(cs.marginBottom) > 0.5) el.style.marginBottom = '0px';
        el = el.parentElement;
      }
      document.body.style.marginBottom = '0px';
      document.body.style.paddingBottom = '0px';
    }

    function sangra() {
      if (!rodape) return;
      if (!window.onefiveSangra) {
        rodape.style.marginLeft = '';
        rodape.style.marginRight = '';
        rodape.style.width = '';
        colaNoFim();
        return;
      }
      rodape.style.marginLeft = '0px';
      rodape.style.marginRight = '0px';
      rodape.style.width = 'auto';
      const r = rodape.getBoundingClientRect();
      const janela = window.onefiveJanela();
      rodape.style.width = `${janela}px`;
      rodape.style.marginLeft = `${-r.left}px`;
      rodape.style.marginRight = `${r.width + r.left - janela}px`;
      colaNoFim();
    }

    let noite = false;
    let pendente = 0;

    function quadro() {
      pendente = 0;
      const y = window.pageYOffset || 0;
      const vh = window.innerHeight;
      const total = document.documentElement.scrollHeight - vh;
      raiz.style.setProperty('--of-prog', `${(total > 0 ? Math.min(100, (y / total) * 100) : 0).toFixed(2)}%`);
      topo.classList.toggle('is-cola', y > 40);

      for (let i = CAPS.length - 1; i >= 0; i--) {
        if (CAPS[i].el.getBoundingClientRect().top <= vh * 0.45) {
          if (i !== visto) {
            visto = i;
            capT.textContent = CAPS[i].t;
            capN.textContent = CAPS[i].n;
            raiz.style.setProperty('--of-luz', CAPS[i].cor);
          }
          break;
        }
      }

      if (escuro) {
        const r = escuro.getBoundingClientRect();
        const agora = r.top < vh * 0.5 && r.bottom > vh * 0.5;
        if (agora !== noite) {
          noite = agora;
          raiz.classList.toggle('of-noite', agora);
          if (marca) {
            const nova = agora ? marca.dataset.claro : marca.dataset.escuro;
            // eslint-disable-next-line no-use-before-define
            if (nova && marca.getAttribute('src') !== nova) {
              marca.src = nova;
              // eslint-disable-next-line no-use-before-define
              aparar();
            }
          }
        }
      }
    }

    function pede() {
      if (pendente) cancelAnimationFrame(pendente);
      pendente = requestAnimationFrame(quadro);
    }

    function prepara() {
      CAPS = MAPA.map((c) => ({ el: document.querySelector(c[0]), t: c[1], n: c[2], cor: c[3] })).filter(
        (c) => c.el && c.el.offsetParent !== null
      );
      escuro = document.querySelector('.of-final');
      rodape = document.querySelector('.of-rodape');
      visto = -1;
      sangra();
      quadro();
    }

    // diagnóstico, só com ?of-diag=1 na URL
    let diagTimeout;
    if (/[?&]of-diag=1/.test(window.location.search)) {
      diagTimeout = setTimeout(() => {
        const de = document.documentElement;
        let pior = null;
        let max = 0;
        document.querySelectorAll('body *').forEach((e) => {
          const b = e.getBoundingClientRect();
          if (b.width > max) {
            max = b.width;
            pior = e;
          }
        });
        function L(sel, prop) {
          const e = document.querySelector(sel);
          return e ? Math.round(e.getBoundingClientRect()[prop || 'width']) : '-';
        }
        const txt = [
          `client ${de.clientWidth} | inner ${window.innerWidth} | screen ${window.screen ? screen.width : '-'} | vv ${window.visualViewport ? Math.round(visualViewport.width) : '-'}`,
          `scrollW ${de.scrollWidth} | dpr ${window.devicePixelRatio} | rem ${getComputedStyle(de).fontSize}`,
          `janela() ${window.onefiveJanela ? window.onefiveJanela() : '-'} | ZOOM ${window.visualViewport ? (de.clientWidth / visualViewport.width).toFixed(2) + 'x' : '-'}`,
          `sec ${L('.of-sec--full')} | inner ${L('.of-sec__inner')} | palco ${L('.of-f2-palco')} | roda ${L('.of-f2-roda')}`,
          `maior: ${Math.round(max)}px  ${pior ? `${pior.tagName}.${String(pior.className).slice(0, 38)}` : '-'}`,
        ].join('\n');
        const cx = document.createElement('pre');
        cx.textContent = txt;
        cx.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;margin:0;padding:10px;background:#140A24;color:#0f0;font:11px/1.5 monospace;white-space:pre-wrap;word-break:break-all';
        document.body.appendChild(cx);
      }, 1800);
    }

    // menu de celular
    const botao = document.getElementById('of-menu-btn');
    const painel = document.getElementById('of-menu');
    let menuTempo = null;
    let menuAberto = false;

    function abreMenu() {
      if (menuAberto) return;
      menuAberto = true;
      clearTimeout(menuTempo);
      painel.hidden = false;
      requestAnimationFrame(() => painel.classList.add('is-aberto'));
      botao.setAttribute('aria-expanded', 'true');
      botao.setAttribute('aria-label', 'Fechar menu');
      raiz.classList.add('of-modal-aberto');
      document.body.classList.add('of-modal-aberto');
      const primeiro = painel.querySelector('a');
      if (primeiro) primeiro.focus();
    }
    function fechaMenu(devolveFoco) {
      if (!menuAberto) return;
      menuAberto = false;
      painel.classList.remove('is-aberto');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir menu');
      raiz.classList.remove('of-modal-aberto');
      document.body.classList.remove('of-modal-aberto');
      menuTempo = setTimeout(() => {
        painel.hidden = true;
      }, 350);
      if (devolveFoco) botao.focus();
    }

    let onBotaoClick;
    let onPainelClick;
    let onEscKey;
    let onResizeMenu;
    if (botao && painel) {
      onBotaoClick = () => (menuAberto ? fechaMenu(true) : abreMenu());
      onPainelClick = (e) => {
        if (e.target.closest('a')) fechaMenu(false);
      };
      onEscKey = (e) => {
        if (e.key === 'Escape' && menuAberto) fechaMenu(true);
      };
      onResizeMenu = () => {
        if (menuAberto && window.innerWidth > 980) fechaMenu(false);
      };
      botao.addEventListener('click', onBotaoClick);
      painel.addEventListener('click', onPainelClick);
      document.addEventListener('keydown', onEscKey);
      window.addEventListener('resize', onResizeMenu, { passive: true });
    }

    function aparar() {
      if (!marca || !marca.naturalWidth) return;
      const l = document.createElement('canvas');
      l.width = 220;
      l.height = Math.max(1, Math.round(marca.naturalHeight * (220 / marca.naturalWidth)));
      const ctx = l.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(marca, 0, 0, l.width, l.height);
      let d;
      try {
        d = ctx.getImageData(0, 0, l.width, l.height).data;
      } catch (e) {
        return;
      }
      let alto = -1;
      let baixo = -1;
      for (let y = 0; y < l.height; y++) {
        const fim = (y + 1) * l.width * 4;
        for (let px = y * l.width * 4 + 3; px < fim; px += 4) {
          if (d[px] > 16) {
            if (alto < 0) alto = y;
            baixo = y;
            break;
          }
        }
      }
      if (alto < 0) return;
      const esc = marca.getBoundingClientRect().height / l.height;
      marca.style.setProperty('--of-aparo-topo', `${(alto * esc).toFixed(1)}px`);
      marca.style.setProperty('--of-aparo-base', `${((l.height - 1 - baixo) * esc).toFixed(1)}px`);
    }
    if (marca) {
      if (marca.complete) aparar();
      else marca.addEventListener('load', aparar);
    }

    const onLoad = () => {
      prepara();
      aparar();
    };
    const onResize = () => {
      pede();
      aparar();
      sangra();
    };

    window.addEventListener('scroll', pede, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    window.addEventListener('load', onLoad);

    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => sangra());
      ro.observe(document.documentElement);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', prepara);
    } else {
      prepara();
    }
    quadro();

    return () => {
      delete raiz.dataset.ofCromo;
      clearTimeout(diagTimeout);
      if (botao) botao.removeEventListener('click', onBotaoClick);
      if (painel) painel.removeEventListener('click', onPainelClick);
      document.removeEventListener('keydown', onEscKey);
      window.removeEventListener('resize', onResizeMenu);
      window.removeEventListener('scroll', pede);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('load', onLoad);
      document.removeEventListener('DOMContentLoaded', prepara);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <>
      <header className="of-topo" id="of-topo">
        {LOGO_HERO ? (
          <a className="of-topo__marca" href="#inicio" aria-label="ONEfive — início">
            <img
              id="of-marca"
              ref={marcaRef}
              src={LOGO_HERO}
              data-claro={LOGO_CLARA}
              data-escuro={LOGO_HERO}
              alt="ONEfive — inovação e negócios"
              decoding="async"
            />
          </a>
        ) : (
          <span />
        )}
        <nav className="of-mono" aria-label="Seções">
          {LINKS.map((l, i) => (
            <a
              key={l.url}
              className={i < LINKS.length - 1 ? 'of-topo__some' : 'of-topo__cta'}
              href={l.url}
              data-alvo={l.url.replace(/^#/, '')}
              {...alvo(l.url)}
            >
              {l.txt}
            </a>
          ))}
          {/* Acesso ao painel interno. <a> comum e não <Link>: o painel é
              área logada, e o prefetch do Link bateria no proxy a cada hover. */}
          <a className="of-topo__entrar" href="/painel">
            Entrar
          </a>
          <button className="of-topo__menu" id="of-menu-btn" type="button" aria-expanded="false" aria-controls="of-menu" aria-label="Abrir menu">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </nav>
      </header>

      <div className="of-menu" id="of-menu" hidden>
        <nav className="of-menu__lista of-mono" aria-label="Seções">
          {LINKS.map((l, i) => (
            <a key={l.url} href={l.url} data-alvo={l.url.replace(/^#/, '')} {...alvo(l.url)}>
              <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
              <span>{l.txt}</span>
            </a>
          ))}
          <a href="/painel">
            <i aria-hidden="true">{String(LINKS.length + 1).padStart(2, '0')}</i>
            <span>Entrar no painel</span>
          </a>
        </nav>
      </div>

      <div className="of-trilho" aria-hidden="true">
        <span className="of-trilho__luz" />
        <span className="of-trilho__bolha" />
      </div>
      <div className="of-cap of-mono" id="of-cap" aria-hidden="true">
        <span id="of-cap-t" />
        <i />
        <span id="of-cap-n" />
      </div>
    </>
  );
}
