'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation.js';

import CampoEditavel from '@/components/painel/CampoEditavel.js';
import { COLUNAS_TAREFA } from '@/lib/funil.js';
import {
  criarTarefaAcao, moverTarefaAcao, renomearTarefaAcao, apagarTarefaAcao,
} from '@/app/(painel)/painel/acoes.js';

const dataBr = (d) => (d ? d.split('-').reverse().join('/') : '—');
const HOJE = () => new Date().toISOString().slice(0, 10);

export default function Tarefas({ negocioId, tarefas }) {
  const [lista, definirLista] = useState(tarefas);
  const [erro, definirErro] = useState(null);
  const router = useRouter();

  /* A lista pintada na hora é local, para a tela responder sem esperar o
     servidor. Quando o servidor devolve a versão nova, ela tem de assumir:
     sem isto, o que foi criado só aparecia ao recarregar a página. */
  useEffect(() => { definirLista(tarefas); }, [tarefas]);

  function avisar(resposta) {
    definirErro(resposta?.erro ?? null);
    return !resposta?.erro;
  }

  async function mover(tarefa, coluna) {
    const antes = lista;
    definirLista(lista.map((t) => (t.id === tarefa.id ? { ...t, coluna } : t)));
    const r = await moverTarefaAcao(tarefa.id, coluna);
    if (!avisar(r)) definirLista(antes);
    else router.refresh();
  }

  async function apagar(tarefa) {
    const antes = lista;
    definirLista(lista.filter((t) => t.id !== tarefa.id));
    const r = await apagarTarefaAcao(tarefa.id);
    if (!avisar(r)) definirLista(antes);
    else router.refresh();
  }

  async function criar(e) {
    e.preventDefault();
    const forma = e.currentTarget;
    const dados = Object.fromEntries(new FormData(forma));
    if (!String(dados.titulo).trim()) return;

    const r = await criarTarefaAcao(negocioId, { titulo: dados.titulo, prazo: dados.prazo });
    if (!avisar(r)) return;
    forma.reset();
    router.refresh();
  }

  return (
    <>
      {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}

      <ul className="pn-tarefas">
        {lista.map((t) => (
          <li className={'pn-tarefa' + (t.coluna === 'Feito' ? ' feita' : '')} key={t.id}>
            <select
              className="pn-situacao"
              data-col={t.coluna}
              value={t.coluna}
              onChange={(e) => mover(t, e.target.value)}
              aria-label={'Situação de ' + t.titulo}
            >
              {COLUNAS_TAREFA.map((c) => <option key={c}>{c}</option>)}
            </select>

            <span className="pn-tarefa__tit">
              <CampoEditavel
                valor={t.titulo}
                rotulo="Título da tarefa"
                aoGravar={(v) => renomearTarefaAcao(t.id, v)}
              />
            </span>

            <span
              className={
                'pn-prazo num' +
                (t.prazo && t.prazo < HOJE() && t.coluna !== 'Feito' ? ' atrasado' : '')
              }
            >
              {dataBr(t.prazo)}
            </span>

            <button
              className="pn-apagar" type="button"
              onClick={() => apagar(t)} aria-label={'Apagar ' + t.titulo}
            >
              ×
            </button>
          </li>
        ))}

        <li className="pn-nova">
          <form onSubmit={criar} className="pn-nova__forma">
            <input className="pn-nova__tit" name="titulo" placeholder="Nova tarefa e Enter" aria-label="Nova tarefa" />
            <input className="pn-nova__dt" name="prazo" type="date" aria-label="Prazo" />
            <button className="pn-acao pn-acao--leve" type="submit">Adicionar</button>
          </form>
        </li>
      </ul>
    </>
  );
}
