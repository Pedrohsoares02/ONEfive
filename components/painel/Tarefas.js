'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation.js';

import { COLUNAS_TAREFA } from '@/lib/funil.js';
import { travasDe, resumoDasTarefas } from '@/lib/tarefasVisao.js';
import { moverTarefaAcao, definirEsperaAcao } from '@/app/(painel)/painel/acoes.js';
import EditorTarefa from '@/components/painel/EditorTarefa.js';
import Fluxo from '@/components/painel/Fluxo.js';

/* As três colunas da operação ficam lado a lado e do mesmo tamanho.
   Para depois e Feito não são operação: viram gavetas fechadas embaixo,
   que continuam aceitando um cartão arrastado mesmo fechadas. */
const OPERACAO = ['A fazer', 'Fazendo', 'Aguardando'];
const GUARDADAS = ['Para depois', 'Feito'];
const COR = {
  'Para depois': '#A9A2B8', 'A fazer': '#8E5BB5', 'Fazendo': '#1F6FB2',
  'Aguardando': '#F0B429', 'Feito': '#6B6280',
};
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const HOJE = () => new Date().toISOString().slice(0, 10);
const iniciais = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
const curta = (d) => Number(d.slice(8, 10)) + ' ' + MESES[Number(d.slice(5, 7)) - 1];
const emDias = (de, ate) => Math.round((Date.parse(ate) - Date.parse(de)) / 86400000);

export default function Tarefas({ negocioId, tarefas, pessoas = [] }) {
  const [lista, definirLista] = useState(tarefas);
  const [visao, definirVisao] = useState('quadro');
  const [abertas, definirAbertas] = useState({});
  const [sobre, definirSobre] = useState(null);
  const [erro, definirErro] = useState(null);
  const [aviso, definirAviso] = useState(null);
  const [editor, definirEditor] = useState(null);
  const router = useRouter();

  useEffect(() => { definirLista(tarefas); }, [tarefas]);

  const r = resumoDasTarefas(lista);

  async function mover(id, coluna) {
    const tarefa = lista.find((t) => t.id === id);
    if (!tarefa || tarefa.coluna === coluna) return;

    const travas = travasDe(tarefa, lista);
    const antes = lista;
    definirLista(lista.map((t) => (t.id === id
      ? { ...t, coluna, ...(coluna === 'Aguardando' ? {} : { espera_quem: null, espera_desde: null }) }
      : t)));

    const resposta = await moverTarefaAcao(id, coluna);
    if (resposta?.erro) { definirLista(antes); definirErro(resposta.erro); return; }
    definirErro(null);

    // avisa e deixa passar: às vezes se começa fora de ordem de propósito
    if (travas.length && coluna !== 'Para depois' && coluna !== 'A fazer') {
      definirAviso(`"${tarefa.titulo}" ainda espera "${travas[0].titulo}"${travas.length > 1 ? ` e mais ${travas.length - 1}` : ''}.`);
      setTimeout(() => definirAviso(null), 6000);
    }
    router.refresh();
  }

  function soltar(coluna) {
    return {
      onDragOver: (e) => { e.preventDefault(); definirSobre(coluna); },
      onDragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) definirSobre((a) => (a === coluna ? null : a)); },
      onDrop: (e) => {
        e.preventDefault();
        definirSobre(null);
        mover(e.dataTransfer.getData('text/plain'), coluna);
      },
    };
  }

  const arrastar = (t) => ({
    draggable: true,
    onDragStart: (e) => { e.dataTransfer.setData('text/plain', t.id); e.currentTarget.classList.add('arrastando'); },
    onDragEnd: (e) => e.currentTarget.classList.remove('arrastando'),
  });

  return (
    <>
      <div className="op-cab">
        <div className="op-abas" role="group" aria-label="Como ver as tarefas">
          {[['quadro', 'Quadro'], ['lista', 'Lista'], ['fluxo', 'Fluxo']].map(([chave, rotulo]) => (
            <button
              key={chave} type="button" className="op-aba"
              aria-pressed={visao === chave} onClick={() => definirVisao(chave)}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <p className="op-medida">
          <b>{r.percentual === null ? '—' : r.percentual + '%'}</b>
          <span className="op-faixa" aria-hidden="true">
            {COLUNAS_TAREFA.map((c) => {
              const n = lista.filter((t) => t.coluna === c).length;
              return n ? <span key={c} style={{ '--n': n, '--cc': COR[c] }} title={`${c}: ${n}`} /> : null;
            })}
          </span>
          <span>{r.feitas} de {r.consideradas} feitas</span>
          <span className="vivo">{r.fazendo} em execução</span>
          {r.esperando > 0 && <span className="espera">{r.esperando} esperando alguém</span>}
        </p>
      </div>

      {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}
      {aviso && <p className="op-aviso" role="status">{aviso}</p>}

      {visao === 'fluxo' ? (
        <Fluxo tarefas={lista} pessoas={pessoas} />
      ) : visao === 'lista' ? (
        <Listagem lista={lista} pessoas={pessoas} aoAbrir={(t) => definirEditor({ tarefa: t })} />
      ) : (
        <>
          <div className="op-quadro">
            {OPERACAO.map((coluna) => {
              const dela = lista.filter((t) => t.coluna === coluna);
              return (
                <section
                  key={coluna}
                  className={'op-col' + (sobre === coluna ? ' alvo' : '')}
                  style={{ '--cc': COR[coluna] }}
                  aria-label={`${coluna}: ${dela.length} ${dela.length === 1 ? 'tarefa' : 'tarefas'}`}
                  {...soltar(coluna)}
                >
                  <div className="op-col-topo">
                    <i aria-hidden="true" />
                    <b>{coluna}</b>
                    <small className="num">{dela.length}</small>
                    <button
                      type="button" aria-label={'Nova tarefa em ' + coluna}
                      onClick={() => definirEditor({ coluna })}
                    >
                      +
                    </button>
                  </div>

                  {dela.length === 0 && <p className="op-vazia">Arraste uma tarefa para cá</p>}

                  {dela.map((t) => (
                    <Cartao
                      key={t.id} tarefa={t} todas={lista} pessoas={pessoas}
                      arrastar={arrastar(t)}
                      aoAbrir={() => definirEditor({ tarefa: t })}
                      aoTrocarEspera={async (quem) => {
                        const r2 = await definirEsperaAcao(t.id, quem);
                        if (r2?.erro) definirErro(r2.erro); else router.refresh();
                      }}
                    />
                  ))}
                </section>
              );
            })}
          </div>

          <div className="op-gavetas">
            {GUARDADAS.map((coluna) => {
              const dela = lista.filter((t) => t.coluna === coluna);
              const aberta = Boolean(abertas[coluna]);
              return (
                <div
                  key={coluna}
                  className={'op-gaveta' + (aberta ? ' aberta' : '') + (sobre === coluna ? ' alvo' : '')}
                  data-col={coluna} style={{ '--cc': COR[coluna] }}
                  {...soltar(coluna)}
                >
                  <button
                    type="button" className="op-puxador" aria-expanded={aberta}
                    onClick={() => definirAbertas({ ...abertas, [coluna]: !aberta })}
                  >
                    <span className="seta" aria-hidden="true">▸</span>
                    <i aria-hidden="true" />
                    <b>{coluna}</b>
                    <small className="num">{dela.length}</small>
                  </button>

                  {aberta && (
                    <div className="op-dentro">
                      {dela.length === 0 && <p className="op-vazia">Nada aqui.</p>}
                      {dela.map((t) => {
                        const venc = t.prazo && t.prazo < HOJE() && t.coluna !== 'Feito';
                        return (
                          <div key={t.id} className="op-linha" {...arrastar(t)} onClick={() => definirEditor({ tarefa: t })}>
                            <span>{t.titulo}</span>
                            {t.prazo && <em className={venc ? 'vencido' : ''}>{curta(t.prazo)}</em>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <EditorTarefa
        aberta={editor !== null}
        tarefa={editor?.tarefa ?? null}
        colunaPadrao={editor?.coluna}
        negocioId={negocioId}
        pessoas={pessoas}
        irmas={lista}
        aoFechar={() => definirEditor(null)}
      />
    </>
  );
}

function Cartao({ tarefa, todas, pessoas, arrastar, aoAbrir, aoTrocarEspera }) {
  const hoje = HOJE();
  const responsavel = pessoas.find((p) => p.id === tarefa.responsavel_id);
  const venc = tarefa.prazo && tarefa.prazo < hoje && tarefa.coluna !== 'Feito';
  const travas = travasDe(tarefa, todas);

  return (
    <article className="op-cartao" {...arrastar} onClick={aoAbrir}>
      <span className="op-titulo">{tarefa.titulo}</span>

      <span className="op-meta">
        {tarefa.urgente && <span className="op-selo">Urgente</span>}
        <span className="op-resp">
          <span className={'op-avatar' + (responsavel ? '' : ' vazio')}>
            {responsavel ? iniciais(responsavel.nome) : '—'}
          </span>
          {responsavel?.nome ?? 'sem responsável'}
        </span>
        {tarefa.prazo && (
          <span className={'op-prazo' + (venc ? ' vencido' : '')}>
            {(venc ? 'Venceu ' : 'Até ') + curta(tarefa.prazo)}
          </span>
        )}
      </span>

      {tarefa.coluna === 'Aguardando' && (
        <div className={'op-bola' + (tarefa.espera_quem ? '' : ' vazio')}>
          <span aria-hidden="true">⏳</span>
          {tarefa.espera_quem ? (
            <>
              <b>{tarefa.espera_quem}</b>
              {tarefa.espera_desde && (
                <span>há {emDias(tarefa.espera_desde, hoje)} {emDias(tarefa.espera_desde, hoje) === 1 ? 'dia' : 'dias'}</span>
              )}
            </>
          ) : (
            <span>Com quem está a bola?</span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const quem = window.prompt('Esperando quem?', tarefa.espera_quem ?? '');
              if (quem !== null) aoTrocarEspera(quem);
            }}
          >
            {tarefa.espera_quem ? 'trocar' : 'dizer'}
          </button>
        </div>
      )}

      {travas.length > 0 && tarefa.coluna !== 'Feito' && (
        <div className="op-trava">
          <span aria-hidden="true">↳</span>
          <span>espera {travas.map((x) => `"${x.titulo}"`).join(' e ')}</span>
        </div>
      )}
    </article>
  );
}

function Listagem({ lista, pessoas, aoAbrir }) {
  const hoje = HOJE();
  return (
    <ul className="op-listagem">
      {lista.length === 0 && <li className="op-vazia">Nenhuma tarefa ainda.</li>}
      {lista.map((t) => {
        const responsavel = pessoas.find((p) => p.id === t.responsavel_id);
        const venc = t.prazo && t.prazo < hoje && t.coluna !== 'Feito';
        return (
          <li key={t.id}>
            <button type="button" onClick={() => aoAbrir(t)}>
              <span className="op-ponto" style={{ '--cc': COR[t.coluna] }} aria-hidden="true" />
              <span className="op-listagem-tit">{t.titulo}</span>
              <span className="op-listagem-col">{t.coluna}</span>
              <span className="op-listagem-resp">{responsavel?.nome ?? '—'}</span>
              <span className={'op-prazo num' + (venc ? ' vencido' : '')}>
                {t.prazo ? curta(t.prazo) : '—'}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
