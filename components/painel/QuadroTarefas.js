'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation.js';

import { COLUNAS_TAREFA } from '@/lib/funil.js';
import { travasDe, resumoDasTarefas } from '@/lib/tarefasVisao.js';
import { moverTarefaAcao, definirEsperaAcao } from '@/app/(painel)/painel/acoes.js';

/* As colunas não têm o mesmo peso nesta tela. Ela é da operação: Fazendo e
   Aguardando ocupam espaço e mostram tudo; Para depois e Feito encolhem
   para uma linha, porque não é lá que se trabalha. */
const PESO = {
  'Para depois': 'fraca',
  'A fazer': '',
  'Fazendo': 'foco',
  'Aguardando': '',
  'Feito': 'fraca',
};
const COR = {
  'Para depois': '#A9A2B8', 'A fazer': '#8E5BB5', 'Fazendo': '#1F6FB2',
  'Aguardando': '#F0B429', 'Feito': '#6B6280',
};
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const HOJE = () => new Date().toISOString().slice(0, 10);
const iniciais = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
const dataCurta = (d) => Number(d.slice(8, 10)) + ' ' + MESES[Number(d.slice(5, 7)) - 1];
const emDias = (de, ate) => Math.round((Date.parse(ate) - Date.parse(de)) / 86400000);

export default function QuadroTarefas({ tarefas, pessoas, aoCriar }) {
  const [lista, definirLista] = useState(tarefas);
  const [sobre, definirSobre] = useState(null);
  const [erro, definirErro] = useState(null);
  const [aviso, definirAviso] = useState(null);
  const router = useRouter();

  useEffect(() => { definirLista(tarefas); }, [tarefas]);

  const r = resumoDasTarefas(lista);

  async function soltar(coluna, evento) {
    evento.preventDefault();
    definirSobre(null);
    const id = evento.dataTransfer.getData('text/plain');
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

    // avisar, e não impedir: às vezes se começa fora de ordem de propósito
    if (travas.length && coluna !== 'Para depois' && coluna !== 'A fazer') {
      definirAviso(`"${tarefa.titulo}" ainda espera "${travas[0].titulo}"${travas.length > 1 ? ` e mais ${travas.length - 1}` : ''}.`);
      setTimeout(() => definirAviso(null), 6000);
    }
    router.refresh();
  }

  async function perguntarEspera(tarefa) {
    const quem = window.prompt('Esperando quem?', tarefa.espera_quem ?? '');
    if (quem === null) return;
    const antes = lista;
    const nome = quem.trim();
    definirLista(lista.map((t) => (t.id === tarefa.id
      ? { ...t, espera_quem: nome || null, espera_desde: nome ? HOJE() : null } : t)));
    const resposta = await definirEsperaAcao(tarefa.id, nome);
    if (resposta?.erro) { definirLista(antes); definirErro(resposta.erro); return; }
    definirErro(null);
    router.refresh();
  }

  return (
    <>
      <div className="qt-topo">
        <div className="qt-medida">
          <b className="num">{r.percentual === null ? '—' : r.percentual + '%'}</b>
          <p>
            {r.consideradas
              ? `${r.feitas} de ${r.consideradas} ${r.consideradas === 1 ? 'tarefa feita' : 'tarefas feitas'}`
              : 'Nenhuma tarefa contando para o realizado'}
            {r.guardadas ? `, ${r.guardadas} em Para depois (não contam)` : ''}.
          </p>
          <div className="qt-faixa" aria-hidden="true">
            {COLUNAS_TAREFA.map((c) => {
              const n = lista.filter((t) => t.coluna === c).length;
              if (!n) return null;
              return <span key={c} style={{ '--n': n, '--cc': COR[c] }} title={`${c}: ${n}`} />;
            })}
          </div>
        </div>

        <p className="qt-agora">
          <b className="num">{r.fazendo}</b> em execução agora
          {r.esperando > 0 && (
            <>
              {' · '}
              <b className="num esperando">{r.esperando}</b> esperando alguém
            </>
          )}
        </p>
      </div>

      {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}
      {aviso && <p className="qt-aviso" role="status">{aviso}</p>}

      <div className="qt-quadro">
        {COLUNAS_TAREFA.map((coluna, i) => {
          const dela = lista.filter((t) => t.coluna === coluna);
          return (
            <section
              key={coluna}
              className={'qt-col ' + PESO[coluna] + (sobre === coluna ? ' alvo' : '')}
              data-col={coluna}
              style={{ '--cc': COR[coluna] }}
              aria-label={`${coluna}: ${dela.length} ${dela.length === 1 ? 'tarefa' : 'tarefas'}`}
              onDragOver={(e) => { e.preventDefault(); definirSobre(coluna); }}
              onDragLeave={() => definirSobre((a) => (a === coluna ? null : a))}
              onDrop={(e) => soltar(coluna, e)}
            >
              <div className="qt-col-topo">
                <em>{String(i + 1).padStart(2, '0')}/{String(COLUNAS_TAREFA.length).padStart(2, '0')}</em>
                <i aria-hidden="true" />
                <b>{coluna}</b>
                <small className="num">{dela.length}</small>
                {aoCriar && (
                  <button type="button" onClick={() => aoCriar(coluna)} aria-label={'Nova tarefa em ' + coluna}>
                    +
                  </button>
                )}
              </div>

              {dela.length === 0 && <p className="qt-vazia">Arraste uma tarefa para cá</p>}

              {dela.map((t) => (
                <Cartao
                  key={t.id} tarefa={t} peso={PESO[coluna]} todas={lista} pessoas={pessoas}
                  aoPerguntarEspera={() => perguntarEspera(t)}
                />
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}

function Cartao({ tarefa, peso, todas, pessoas, aoPerguntarEspera }) {
  const hoje = HOJE();
  const responsavel = pessoas.find((p) => p.id === tarefa.responsavel_id);
  const vencido = tarefa.prazo && tarefa.prazo < hoje && tarefa.coluna !== 'Feito';
  const urgente = tarefa.urgente && tarefa.coluna !== 'Feito';
  const travas = travasDe(tarefa, todas);

  return (
    <article
      className={'qt-cartao' + (vencido || urgente ? ' tem-alerta' : '')}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', tarefa.id);
        e.currentTarget.classList.add('arrastando');
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('arrastando')}
    >
      <span className="qt-titulo">{tarefa.titulo}</span>

      <span className="qt-meta">
        {urgente && <span className="qt-selo urgente">Urgente</span>}

        {responsavel ? (
          <span className="qt-resp">
            <span className="qt-av">{iniciais(responsavel.nome)}</span>
            {responsavel.nome}
          </span>
        ) : peso !== 'fraca' ? (
          <span className="qt-resp">
            <span className="qt-av vazio">—</span>
            sem responsável
          </span>
        ) : null}

        {tarefa.prazo && (
          <span className={'qt-prazo' + (vencido ? ' vencido' : '')}>
            {(vencido ? 'Venceu ' : 'Até ') + dataCurta(tarefa.prazo)}
          </span>
        )}
      </span>

      {tarefa.coluna === 'Aguardando' && (
        <div className={'qt-bola' + (tarefa.espera_quem ? '' : ' vazio')}>
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
          <button type="button" onClick={aoPerguntarEspera}>
            {tarefa.espera_quem ? 'trocar' : 'dizer'}
          </button>
        </div>
      )}

      {travas.length > 0 && tarefa.coluna !== 'Feito' && peso !== 'fraca' && (
        <div className={'qt-trava' + (tarefa.coluna === 'Fazendo' || tarefa.coluna === 'Aguardando' ? ' ativa' : '')}>
          <span aria-hidden="true">↳</span>
          <span>espera {travas.map((x) => `"${x.titulo}"`).join(' e ')}</span>
        </div>
      )}
    </article>
  );
}
