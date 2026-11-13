'use client';

import { useEffect, useRef, useState } from 'react';
import { useSangria, useRevealOnView } from '@/hooks/useSangria';
import { WHATSAPP } from '@/app/constants';

const LINHAS = [
  {
    id: 'cultura',
    cor: '--of-pessoas',
    numero: '01',
    titulo: 'Cultura de inovação',
    sub: 'Desenvolvemos pessoas, competências e ambientes que tornam a inovação parte da rotina institucional.',
    conceito: [
      'Cultura de inovação é a capacidade de uma instituição questionar práticas estabelecidas, reconhecer oportunidades de melhoria e transformar desafios em soluções. Ela se manifesta na forma como as pessoas pensam, colaboram, experimentam e tomam decisões no dia a dia.',
      'Na ONEfive, acreditamos que essa transformação começa pelas pessoas. Por isso, trabalhamos o desenvolvimento de mentalidades, competências e condições organizacionais que estimulam o protagonismo dos servidores.',
    ],
    itens: [
      ['Diagnóstico da cultura de inovação:', 'identificamos percepções, comportamentos, competências e barreiras que influenciam a capacidade de inovar.'],
      ['Formação e desenvolvimento de competências:', 'experiências práticas que desenvolvem criatividade, colaboração, pensamento crítico e protagonismo.'],
      ['Redes e ambientes de inovação:', 'espaços, conexões e práticas que incentivam a troca de conhecimentos e a construção coletiva.'],
    ],
    resultado: 'Uma instituição mais preparada para reconhecer desafios, mobilizar seus talentos e desenvolver soluções de forma contínua — sem depender de projetos isolados.',
  },
  {
    id: 'fechada',
    cor: '--of-dados',
    numero: '02',
    titulo: 'Inovação fechada',
    sub: 'Mobilizamos o conhecimento de quem opera o serviço para transformar desafios internos em soluções testadas.',
    conceito: [
      'Inovação fechada nasce dentro dos limites da própria instituição, a partir do conhecimento de quem convive diariamente com os processos. Parte do princípio de que boa parte das respostas já existe na organização, dispersa entre áreas que raramente se encontram.',
      'Estruturamos as condições para que esse conhecimento circule e vire solução: identificamos desafios reais, mobilizamos equipes de diferentes áreas e conduzimos o percurso da ideia à prova de conceito.',
    ],
    itens: [
      ['Programas de intraempreendedorismo:', 'trilhas em que servidores identificam problemas do próprio trabalho e conduzem a solução.'],
      ['Integração entre áreas:', 'setores que dependem uns dos outros desenham juntos o fluxo que compartilham.'],
      ['Experimentação e validação:', 'testamos em escala reduzida antes de generalizar, para decidir por evidência.'],
    ],
    resultado: 'Soluções construídas por quem conhece o problema, com adesão natural de quem vai operá-las — e melhoria contínua como parte do trabalho, não como projeto à parte.',
  },
  {
    id: 'aberta',
    cor: '--of-processos',
    numero: '03',
    titulo: 'Inovação aberta',
    sub: 'Conectamos desafios públicos ao ecossistema, do chamamento público ao contrato assinado.',
    conceito: [
      'Inovação aberta reconhece que nem toda resposta está dentro da instituição. O poder público formula com clareza o desafio que precisa resolver e abre a porta para que startups, empresas, universidades e a sociedade proponham caminhos.',
      'Cuidamos das duas pontas: a formulação do desafio, para que seja compreensível e atraente para o ecossistema, e os instrumentos que permitem experimentar, contratar e implantar dentro das regras.',
    ],
    itens: [
      ['Estruturação de programas:', 'desenhamos o desafio, as regras de participação e as etapas de seleção.'],
      ['Compras públicas de soluções inovadoras:', 'orientamos o uso dos instrumentos para a inovação chegar ao contrato com segurança jurídica.'],
      ['Conexão com startups, empresas e ICTs:', 'aproximamos a instituição de quem já desenvolve soluções para desafios semelhantes.'],
    ],
    resultado: 'Acesso a soluções que a instituição não desenvolveria sozinha, contratadas com segurança jurídica — e um órgão reconhecido pelo ecossistema como parceiro possível.',
  },
];

const alvo = (url) => (/^https?:\/\//i.test(url) ? { target: '_blank', rel: 'noopener' } : {});

export default function Programa({
  eyebrow = 'Como trabalhamos',
  titulo = 'Três caminhos para inovar.',
  subtitulo = 'Um propósito em comum.',
  lead = 'Cada instituição enfrenta desafios diferentes. Integramos cultura de inovação, capacidades internas e conexões com o ecossistema para transformar esses desafios em soluções que geram valor público.',
  cta1 = 'Conheça o programa',
  cta1Url = '#metodologia',
  cta2 = 'Fale com a gente',
  cta2Url = WHATSAPP,
  marca = 'ONEfive',
}) {
  const secRef = useRef(null);
  const [aberta, setAberta] = useState(null);

  useSangria(secRef);
  useRevealOnView(secRef);

  // recuo do corpo: largura real do numeral + gap entre colunas (medido,
  // porque 'ch' na raiz não é a largura do numeral em Poppins)
  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return undefined;

    function recuo() {
      const n = sec.querySelector('.of-linha__n');
      const cab = sec.querySelector('.of-linha__cab');
      if (!n || !cab) return;
      const gap = parseFloat(getComputedStyle(cab).columnGap) || 0;
      sec.style.setProperty('--of-recuo', `${(n.getBoundingClientRect().width + gap).toFixed(1)}px`);
    }
    recuo();
    window.addEventListener('resize', recuo, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(recuo);
    return () => window.removeEventListener('resize', recuo);
  }, []);

  return (
    <section className="of-sec of-sec--full of-programa" id="metodologia" ref={secRef}>
      <span className="of-ancora" id="caminhos" aria-hidden="true" />

      <div className="of-sec__motes" aria-hidden="true">
        <span style={{ left: '-10%', top: '22%', width: '32vw', height: '32vw', background: 'var(--of-pessoas)', '--d': '30s' }} />
        <span style={{ right: '-8%', bottom: '4%', width: '30vw', height: '30vw', background: 'var(--of-processos)', '--d': '35s', '--del': '6s' }} />
        <span style={{ left: '42%', bottom: '-12%', width: '26vw', height: '26vw', background: 'var(--of-dados)', '--d': '28s', '--del': '11s' }} />
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

        <div className="of-linhas of-reveal of-d1">
          {LINHAS.map((linha) => {
            const gavId = `of-gav-${linha.numero}`;
            const isAberta = aberta === linha.id;
            return (
              <div className="of-linha" id={linha.id} style={{ '--c': `var(${linha.cor})` }} key={linha.id}>
                <span className="of-linha__fundo" aria-hidden="true" />
                <button
                  type="button"
                  className="of-linha__cab"
                  aria-expanded={isAberta}
                  aria-controls={gavId}
                  onClick={() => setAberta(isAberta ? null : linha.id)}
                >
                  <span className="of-linha__n" aria-hidden="true">{linha.numero}</span>
                  <span className="of-linha__t">
                    {linha.titulo}
                    <b>{linha.sub}</b>
                  </span>
                  <span className="of-linha__mais" aria-hidden="true" />
                </button>
                <div className={`of-linha__gav${isAberta ? ' is-aberta' : ''}`} id={gavId} role="region" aria-label={linha.titulo}>
                  <div className="of-linha__in">
                    <div className="of-linha__corpo">
                      <div className="of-bl">
                        <h4>O conceito</h4>
                        {linha.conceito.map((p) => (
                          <p key={p.slice(0, 24)}>{p}</p>
                        ))}
                      </div>
                      <div className="of-bl">
                        <h4>Como atuamos</h4>
                        <ul className="of-bl__itens">
                          {linha.itens.map(([forte, resto]) => (
                            <li key={forte}>
                              <i aria-hidden="true" />
                              <span>
                                <em>{forte}</em> {resto}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="of-bl of-bl--res">
                        <h4>O resultado esperado</h4>
                        <p className="of-bl__res">{linha.resultado}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="of-sec__ctas of-sec__ctas--centro of-reveal of-d4">
          <a className="of-cta-ghost" href={cta1Url}>
            <span>
              {cta1}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>

          <a className="of-cta-solid" href={cta2Url} {...alvo(cta2Url)}>
            <span className="of-cta-solid__points" aria-hidden="true">
              <i /><i /><i /><i /><i /><i /><i />
            </span>
            <span className="of-cta-solid__label">
              {cta2}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
