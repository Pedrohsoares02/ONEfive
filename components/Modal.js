'use client';

import { useEffect, useId, useRef } from 'react';
import { WHATSAPP } from '@/app/constants';

const PASSOS = [
  {
    cor: '--of-pessoas',
    n: '01',
    titulo: 'Cultura de inovação',
    resumo: 'Desenvolvemos pessoas, competências e ambientes que tornam a inovação parte da rotina institucional.',
    conceito: [
      'Cultura de inovação é a capacidade de uma instituição questionar práticas estabelecidas, reconhecer oportunidades de melhoria e transformar desafios em soluções. Ela se manifesta na forma como as pessoas pensam, colaboram, experimentam e tomam decisões no dia a dia.',
      'Na ONEfive, acreditamos que essa transformação começa pelas pessoas. Por isso, trabalhamos o desenvolvimento de mentalidades, competências e condições organizacionais que estimulam o protagonismo dos servidores, fortalecem a colaboração e criam um ambiente favorável à experimentação e ao aprendizado contínuo.',
    ],
    itens: [
      ['Diagnóstico da cultura de inovação:', 'identificamos percepções, comportamentos, competências e barreiras que influenciam a capacidade de inovar da instituição.'],
      ['Formação e desenvolvimento de competências:', 'promovemos experiências práticas que desenvolvem criatividade, colaboração, pensamento crítico, protagonismo e capacidade de experimentação.'],
      ['Redes e ambientes de inovação:', 'apoiamos a criação de espaços, conexões e práticas institucionais que incentivam a troca de conhecimentos e a construção coletiva de soluções.'],
    ],
    resultado: 'Uma instituição mais preparada para reconhecer desafios, mobilizar seus talentos e desenvolver soluções de forma contínua, construindo uma cultura de inovação que não dependa exclusivamente de projetos ou iniciativas isoladas.',
  },
  {
    cor: '--of-dados',
    n: '02',
    titulo: 'Inovação fechada',
    resumo: 'Mobilizamos o conhecimento de quem opera o serviço para transformar desafios internos em soluções testadas.',
    conceito: [
      'Inovação fechada é aquela que nasce e se desenvolve dentro dos limites da própria instituição, a partir do conhecimento de quem convive diariamente com os processos e com os serviços prestados. Ela parte do princípio de que boa parte das respostas já existe na organização, dispersa entre áreas que raramente se encontram.',
      'Na ONEfive, estruturamos as condições para que esse conhecimento circule e se transforme em solução: identificamos desafios reais da gestão, mobilizamos equipes de diferentes áreas e conduzimos o percurso que vai da ideia à prova de conceito, com método e sem depender de iniciativas isoladas.',
    ],
    itens: [
      ['Programas de intraempreendedorismo:', 'criamos trilhas em que servidores identificam problemas do próprio trabalho e conduzem a solução, com apoio metodológico e patrocínio institucional.'],
      ['Integração entre áreas e departamentos:', 'aproximamos setores que dependem uns dos outros para que desenhem juntos o fluxo que compartilham, em vez de otimizar cada parte isoladamente.'],
      ['Experimentação e validação de soluções:', 'testamos em escala reduzida antes de generalizar, para que a decisão de implantar seja baseada em evidência e não em expectativa.'],
    ],
    resultado: 'Soluções construídas por quem conhece o problema, com adesão natural de quem vai operá-las, e uma instituição que passa a tratar a melhoria contínua como parte do trabalho — e não como um projeto à parte.',
  },
  {
    cor: '--of-processos',
    n: '03',
    titulo: 'Inovação aberta',
    resumo: 'Conectamos desafios públicos ao ecossistema, do chamamento público ao contrato assinado.',
    conceito: [
      'Inovação aberta é a que reconhece que nem toda resposta está dentro da instituição. O poder público formula com clareza o desafio que precisa resolver e abre a porta para que startups, empresas, universidades e a própria sociedade proponham caminhos.',
      'Na ONEfive, cuidamos das duas pontas dessa conexão: a formulação do desafio, para que ele seja compreensível e atraente para o ecossistema, e os instrumentos jurídicos e processuais que permitem experimentar, contratar e implantar a solução dentro das regras da administração pública.',
    ],
    itens: [
      ['Estruturação de programas de inovação aberta:', 'desenhamos o desafio, as regras de participação e as etapas de seleção, do chamamento público ao contrato.'],
      ['Compras públicas de soluções inovadoras:', 'orientamos o uso dos instrumentos de contratação disponíveis para que a inovação chegue ao contrato com segurança jurídica.'],
      ['Conexão com startups, empresas e ICTs:', 'aproximamos a instituição de quem já desenvolve soluções para desafios semelhantes, encurtando o caminho entre a necessidade e a resposta.'],
    ],
    resultado: 'Acesso a soluções que a instituição não desenvolveria sozinha, contratadas com segurança jurídica e implantadas com acompanhamento — e um órgão reconhecido pelo ecossistema como um parceiro possível.',
  },
];

const ENTREGAS = [
  { cor: '--of-pessoas', titulo: 'Pessoas formadas e atuando', desc: 'Servidores com competências, método e protagonismo para transformar desafios reais em soluções.' },
  { cor: '--of-processos', titulo: 'Processos redesenhados e em uso', desc: 'Fluxos aprimorados para otimizar recursos, reduzir barreiras e melhorar a experiência do cidadão.' },
  { cor: '--of-tecnologia', titulo: 'Soluções implantadas', desc: 'Desafios transformados em soluções viáveis, orientadas por evidências e preparadas para implementação.' },
  { cor: '--of-metodo', titulo: 'Capacidade que permanece', desc: 'Conhecimento, práticas e estruturas que fortalecem a autonomia da instituição para continuar inovando.' },
];

export default function Modal({
  eyebrow = 'O programa',
  titulo = 'Criamos as condições para a inovação acontecer.',
  fazemos = 'Acreditamos que a transformação do setor público começa pelo desenvolvimento de quem o faz acontecer. Por isso, conectamos pessoas, conhecimento e método para transformar desafios reais em soluções concretas, fortalecendo a capacidade das instituições de inovar, experimentar e gerar valor público de forma contínua.',
  destaque = 'Nosso maior legado não está apenas em encontrar soluções eficientes, mas na capacidade de continuar inovando através de um servidor capacitado para promover mudanças.',
  notaPassos = 'As cinco frentes da nossa metodologia: pessoas, processos, tecnologia, dados e método, atuam de forma integrada nas três dimensões da inovação pública: cultura de inovação, inovação fechada e inovação aberta. Cada uma contribui com capacidades essenciais para identificar desafios, desenvolver soluções e gerar resultados concretos. Juntas, fortalecem uma cultura de inovação contínua, conectando conhecimento, colaboração e experimentação para que a transformação não se limite a projetos pontuais, mas se torne uma capacidade permanente das instituições públicas, com foco na geração de valor para o cidadão.',
  nota = 'ONEfive · Inovação pública',
  cta = 'Fale com a gente',
  ctaUrl = WHATSAPP,
}) {
  const uid = useId().replace(/:/g, '');
  const dlgRef = useRef(null);

  // qualquer link para #metodologia abre o modal; sem JavaScript, ele
  // continua rolando até a dobra, que existe de verdade
  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg || typeof dlg.showModal !== 'function') return undefined;

    function abrir(e) {
      e.preventDefault();
      dlg.showModal();
      const janela = dlg.querySelector('.of-modal__janela');
      if (janela) janela.focus({ preventScroll: true });
      document.documentElement.classList.add('of-modal-aberto');
      requestAnimationFrame(() => dlg.classList.add('is-aberto'));
    }
    function fechar() {
      dlg.classList.remove('is-aberto');
      const fim = () => {
        dlg.close();
        dlg.removeEventListener('transitionend', fim);
      };
      dlg.addEventListener('transitionend', fim);
      setTimeout(fim, 600);
    }
    function onClickFora(e) {
      if (e.target === dlg) fechar();
    }
    function onCancel(e) {
      e.preventDefault();
      fechar();
    }
    function onClose() {
      document.documentElement.classList.remove('of-modal-aberto');
      dlg.classList.remove('is-aberto');
    }

    const gatilhos = document.querySelectorAll('a[href="#metodologia"], a[href$="#metodologia"]');
    gatilhos.forEach((a) => a.addEventListener('click', abrir));

    const botoesFechar = dlg.querySelectorAll('[data-of-fechar]');
    botoesFechar.forEach((b) => b.addEventListener('click', fechar));

    dlg.addEventListener('click', onClickFora);
    dlg.addEventListener('cancel', onCancel);
    dlg.addEventListener('close', onClose);

    return () => {
      gatilhos.forEach((a) => a.removeEventListener('click', abrir));
      botoesFechar.forEach((b) => b.removeEventListener('click', fechar));
      dlg.removeEventListener('click', onClickFora);
      dlg.removeEventListener('cancel', onCancel);
      dlg.removeEventListener('close', onClose);
    };
  }, []);

  const alvo = /^https?:\/\//i.test(ctaUrl) ? { target: '_blank', rel: 'noopener' } : {};
  const tituloId = `${uid}-titulo`;

  return (
    <dialog className="of-modal" id={uid} aria-labelledby={tituloId} ref={dlgRef}>
      <div className="of-modal__janela" tabIndex={-1}>
        <div className="of-modal__fio" aria-hidden="true" />

        <header className="of-modal__topo">
          <div>
            <div className="of-modal__eyebrow">
              <i aria-hidden="true" />
              <span>{eyebrow}</span>
            </div>
            <h2 className="of-modal__titulo" id={tituloId}>{titulo}</h2>
          </div>
          <button type="button" className="of-modal__fechar" data-of-fechar="true" aria-label="Fechar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="of-modal__corpo">
          <section className="of-modal__bloco">
            <div className="of-modal__rotulo"><span>O que fazemos</span></div>
            <p className="of-modal__texto">{fazemos}</p>
            <p className="of-modal__destaque">{destaque}</p>
          </section>

          <section className="of-modal__bloco">
            <div className="of-modal__rotulo"><span>Como fazemos</span></div>
            <div className="of-modal__passos">
              {PASSOS.map((p) => (
                <details className="of-modal__passo" name="of-sanfona" style={{ '--c': `var(${p.cor})` }} key={p.n}>
                  <summary className="of-modal__cabeca">
                    <b aria-hidden="true">{p.n}</b>
                    <span>
                      <em>{p.titulo}</em> — {p.resumo}
                    </span>
                    <svg className="of-modal__chev" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m7 10 5 5 5-5" />
                    </svg>
                  </summary>
                  <div className="of-modal__gaveta">
                    <div className="of-modal__dentro">
                      <div className="of-modal__sec">
                        <span className="of-modal__rot">O conceito</span>
                        {p.conceito.map((par) => (
                          <p key={par.slice(0, 24)}>{par}</p>
                        ))}
                      </div>
                      <div className="of-modal__sec">
                        <span className="of-modal__rot">Como atuamos</span>
                        <ul className="of-modal__itens">
                          {p.itens.map(([forte, resto]) => (
                            <li key={forte}>
                              <i aria-hidden="true" />
                              <span>
                                <em>{forte}</em> {resto}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="of-modal__sec">
                        <span className="of-modal__rot">O resultado esperado</span>
                        <p className="of-modal__resultado">{p.resultado}</p>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
            <p className="of-modal__texto" style={{ marginTop: '1rem', fontSize: '.875rem' }}>{notaPassos}</p>
          </section>

          <section className="of-modal__bloco">
            <div className="of-modal__rotulo"><span>Resultados que permanecem</span></div>
            <ul className="of-modal__entregas">
              {ENTREGAS.map((e) => (
                <li className="of-modal__entrega" style={{ '--c': `var(${e.cor})` }} key={e.titulo}>
                  <i aria-hidden="true">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </i>
                  <span>
                    <em>{e.titulo}</em>
                    {e.desc}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="of-modal__base">
          <span className="of-modal__nota">{nota}</span>
          <a className="of-modal__cta" href={ctaUrl} {...alvo}>
            {cta}{' '}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </footer>
      </div>
    </dialog>
  );
}
