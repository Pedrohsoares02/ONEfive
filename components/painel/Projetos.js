'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { alertasDoNegocio } from '@/lib/alertas.js';
import { diasParado, estaParado } from '@/lib/parado.js';

const HOJE = () => new Date().toISOString().slice(0, 10);
const DIA = 86400000;
const JANELA = 14;

const dias = (de, ate) => Math.round((new Date(ate) - new Date(de)) / DIA);
const emDias = (n) => (n === 1 ? '1 dia' : n + ' dias');
const curta = (iso) => iso.slice(8) + '/' + iso.slice(5, 7);

function iniciais(nome) {
  if (!nome) return '—';
  return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

const CORTES = [
  { chave: 'tudo', rotulo: 'Tudo' },
  { chave: 'espera', rotulo: 'Parado esperando' },
  { chave: 'recebimento', rotulo: 'Recebimento vencido' },
];

const ENCERRADAS = ['Concluído', 'Encerrado'];

/* A tela de Projetos não pergunta onde cada projeto está — pergunta o que
   fazer agora. A fila de pendências é a resposta; a agenda é a mesma carteira
   vista pelo calendário das próximas duas semanas. */
export default function Projetos({ projetos, pessoas, children }) {
  const [aba, definirAba] = useState('fila');
  const [corte, definirCorte] = useState('tudo');
  const [pessoaId, definirPessoa] = useState('');
  const [foco, definirFoco] = useState(null);
  const hoje = HOJE();

  const nomeDe = useMemo(() => {
    const mapa = new Map(pessoas.map((p) => [p.id, p.nome]));
    return (id) => mapa.get(id) ?? null;
  }, [pessoas]);

  const vivos = projetos.filter((p) => !ENCERRADAS.includes(p.etapa));

  const alertas = useMemo(
    () =>
      vivos
        .flatMap((p) => alertasDoNegocio({ negocio: p, tarefas: p.tarefas, lancamentos: p.lancamentos, hoje })
          .map((a) => ({ ...a, projeto: p })))
        .sort((a, b) => a.peso - b.peso),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projetos, hoje]
  );

  const dela = (a) => !pessoaId || a.pessoaId === pessoaId;
  const naEspera = (a) => a.tipo === 'aguardando' || a.tipo === 'travada';
  const noCorte = (a) =>
    corte === 'tudo' || (corte === 'espera' ? naEspera(a) : a.tipo === 'recebimento');

  const visiveis = alertas.filter((a) => dela(a) && noCorte(a));
  const chave = (a) => a.negocioId + ':' + (a.tarefaId ?? a.tipo);
  const atual = visiveis.find((a) => chave(a) === foco) ?? visiveis[0] ?? null;

  const contar = (teste) => alertas.filter((a) => dela(a) && teste(a)).length;

  return (
    <>
      <div className="pn-barra">
        <div>
          <h1>Projetos</h1>
          <p className="pn-sub">
            {visiveis.length === 0
              ? 'Nada pedindo atenção agora'
              : visiveis.length + (visiveis.length === 1 ? ' pendência na carteira' : ' pendências na carteira')}
          </p>
        </div>
        {children}
      </div>

      <div className="pn-corte pj-topo">
        <div className="op-abas">
          <button type="button" className="op-aba" aria-pressed={aba === 'fila'} onClick={() => definirAba('fila')}>
            Fila de ação
          </button>
          <button type="button" className="op-aba" aria-pressed={aba === 'agenda'} onClick={() => definirAba('agenda')}>
            Agenda
          </button>
        </div>

        {aba === 'fila' && (
          <div className="pj-cortes">
            {CORTES.map((c) => (
              <button
                key={c.chave} type="button" className="pj-corte-b"
                aria-pressed={corte === c.chave}
                onClick={() => definirCorte(c.chave)}
              >
                {c.rotulo}
                <span className="num">
                  {c.chave === 'tudo' ? contar(() => true)
                    : c.chave === 'espera' ? contar(naEspera)
                    : contar((a) => a.tipo === 'recebimento')}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="pn-donos pj-pessoas">
          <button type="button" className="pn-dono-b" aria-pressed={pessoaId === ''} onClick={() => definirPessoa('')}>
            Todos
          </button>
          {pessoas.map((p) => (
            <button
              key={p.id} type="button" className="pn-dono-b"
              aria-pressed={pessoaId === p.id}
              onClick={() => definirPessoa((d) => (d === p.id ? '' : p.id))}
            >
              {p.nome.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {aba === 'fila' ? (
        <Fila
          visiveis={visiveis} atual={atual} chave={chave} nomeDe={nomeDe} hoje={hoje}
          aoEscolher={(a) => definirFoco(chave(a))}
        />
      ) : (
        <Agenda projetos={vivos} alertas={alertas.filter(dela)} nomeDe={nomeDe} hoje={hoje} />
      )}

      <Carteira projetos={projetos} nomeDe={nomeDe} hoje={hoje} />
    </>
  );
}

function Fila({ visiveis, atual, chave, nomeDe, hoje, aoEscolher }) {
  if (!visiveis.length) {
    return <p className="pn-vazio">Nenhuma pendência neste corte. É um bom sinal, ou um filtro apertado demais.</p>;
  }

  return (
    <div className="pj-layout">
      <section className="pj-fila">
        {visiveis.map((a) => (
          <button
            key={chave(a)} type="button" className="pj-linha"
            aria-pressed={a === atual} onClick={() => aoEscolher(a)}
          >
            <span className="pj-linha__o">
              <span className={'pj-selo ' + a.tom}>{a.rotulo}</span>
              <b>{a.titulo}</b>
              <small>{a.projeto.titulo}</small>
            </span>
            <span className="pj-linha__quem">
              <span className="pj-pessoa">
                <span className="pn-quem__ini">{iniciais(nomeDe(a.pessoaId))}</span>
                {nomeDe(a.pessoaId) ?? 'Sem responsável'}
              </span>
              <small>{a.explicacao}</small>
            </span>
            <span className="pj-linha__seta" aria-hidden="true">›</span>
          </button>
        ))}
      </section>

      {atual && <Foco alerta={atual} nomeDe={nomeDe} hoje={hoje} />}
    </div>
  );
}

function Foco({ alerta, nomeDe, hoje }) {
  const p = alerta.projeto;
  const parado = diasParado(p.ultimoEm, hoje);

  return (
    <aside className="pj-foco" aria-label={'Resumo de ' + alerta.titulo}>
      <div className="pj-foco__topo">
        <p className="pj-foco__cod">{p.codigo}</p>
        <h2>{p.titulo}</h2>
        <p className="pj-foco__org">{p.cliente?.nome || 'Sem organização'}</p>
      </div>

      <div className="pj-foco__corpo">
        <span className={'pj-selo ' + alerta.tom}>{alerta.rotulo}</span>
        <h3>{alerta.titulo}</h3>

        <dl className="pj-foco__dados">
          <div>
            <dt>{alerta.tarefaId ? 'Responsável pela tarefa' : 'Responsável'}</dt>
            <dd>{nomeDe(alerta.pessoaId) ?? 'Ninguém'}</dd>
          </div>
          <div>
            <dt>{alerta.tipo === 'aguardando' ? 'Bola com' : alerta.tipo === 'recebimento' ? 'Em aberto' : 'Situação'}</dt>
            <dd>{alerta.explicacao}</dd>
          </div>
          <div>
            <dt>Dono do projeto</dt>
            <dd>{nomeDe(p.dono_id) ?? 'Sem dono'}</dd>
          </div>
          <div>
            <dt>Prazo do projeto</dt>
            <dd>{p.prazo ? curta(p.prazo) : 'Sem data'}</dd>
          </div>
        </dl>

        <p className="pj-foco__pe">
          {p.etapa}
          {parado !== null && ' · ' + emDias(parado) + ' sem movimento'}
          {estaParado(p, hoje) && ' — parado demais'}
        </p>

        <Link className="pn-acao pn-acao--leve pj-foco__ir" href={'/painel/negocio/' + p.id}>
          Abrir ficha do projeto
        </Link>
      </div>
    </aside>
  );
}

function Agenda({ projetos, alertas, nomeDe, hoje }) {
  const naJanela = (data) => data && dias(hoje, data) >= 0 && dias(hoje, data) < JANELA;
  const posicao = (data) => ((dias(hoje, data) + 0.5) / JANELA) * 100;

  const colunas = Array.from({ length: JANELA }, (_, i) => {
    const d = new Date(new Date(hoje).getTime() + i * DIA);
    const semana = d.getUTCDay();
    return { tom: i === 0 ? 'hoje' : semana === 0 || semana === 6 ? 'fds' : '', numero: d.getUTCDate() };
  });

  const linhas = projetos
    .filter((p) => naJanela(p.prazo) || p.tarefas.some((t) => t.coluna !== 'Feito' && naJanela(t.prazo)))
    .sort((a, b) => String(a.prazo ?? '9').localeCompare(String(b.prazo ?? '9')));

  if (!linhas.length) {
    return <p className="pn-vazio">Nenhum prazo nas próximas duas semanas.</p>;
  }

  return (
    <section className="pj-agenda">
      <div className="pj-agenda__cab">
        <h2>Próximas duas semanas</h2>
        <p className="pj-legenda">
          <span><i className="hoje" />Hoje</span>
          <span><i className="tarefa" />Prazo de tarefa</span>
          <span><i className="projeto" />Prazo do projeto</span>
        </p>
      </div>

      <div className="pj-rolar">
        <div className="pj-grade">
          <div className="pj-cabecalho">
            <div>Projeto</div>
            <div className="pj-dias">
              {colunas.map((c, i) => <span key={i} className={'pj-dia ' + c.tom}>{c.numero}</span>)}
            </div>
          </div>

          {linhas.map((p) => {
            const abertas = p.tarefas.filter((t) => t.coluna !== 'Feito' && naJanela(t.prazo));
            const alerta = alertas.find((a) => a.negocioId === p.id);
            const inicio = naJanela(p.inicio) ? posicao(p.inicio) : 0;
            const fim = naJanela(p.prazo) ? posicao(p.prazo) : 100;
            return (
              <div className="pj-raia" key={p.id}>
                <Link className="pj-raia__nome" href={'/painel/negocio/' + p.id}>
                  <b>{p.titulo}</b>
                  <small>{nomeDe(p.dono_id) ?? 'Sem dono'} · {p.etapa}</small>
                </Link>

                <div className="pj-trilho">
                  {colunas.map((c, i) => <span key={i} className={'pj-celula ' + c.tom} />)}
                  <span
                    className={'pj-barra' + (alerta ? ' risco' : '')}
                    style={{ left: inicio + '%', right: 100 - fim + '%' }}
                  />
                  {abertas.map((t) => (
                    <span
                      key={t.id}
                      className={'pj-marca' + (t.urgente ? ' risco' : '')}
                      style={{ left: posicao(t.prazo) + '%' }}
                      title={t.titulo + ' · ' + (nomeDe(t.responsavel_id) ?? 'sem responsável') + ' · ' + curta(t.prazo)}
                    />
                  ))}
                  {naJanela(p.prazo) && (
                    <span className="pj-marca projeto" style={{ left: posicao(p.prazo) + '%' }} title={'Prazo do projeto · ' + curta(p.prazo)} />
                  )}
                  {alerta && <span className={'pj-nota ' + alerta.tom}>{alerta.titulo} · {alerta.explicacao}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Carteira({ projetos, nomeDe, hoje }) {
  return (
    <details className="pj-carteira">
      <summary>Carteira inteira ({projetos.length})</summary>
      {projetos.map((p) => {
        const parado = diasParado(p.ultimoEm, hoje);
        return (
          <Link className="pj-carteira__linha" key={p.id} href={'/painel/negocio/' + p.id}>
            <span>
              <b>{p.titulo}</b>
              <small>{p.cliente?.nome || 'Sem organização'}</small>
            </span>
            <small>
              {p.etapa} · {nomeDe(p.dono_id) ?? 'sem dono'}
              {p.prazo && ' · prazo ' + curta(p.prazo)}
              {parado !== null && parado >= 3 && ' · ' + emDias(parado) + ' sem movimento'}
            </small>
          </Link>
        );
      })}
    </details>
  );
}
