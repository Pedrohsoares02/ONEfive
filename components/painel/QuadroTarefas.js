'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation.js';

import { COLUNAS_TAREFA } from '@/lib/funil.js';
import { moverTarefaAcao } from '@/app/(painel)/painel/acoes.js';

const iniciais = (n) => String(n || '—').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
const dataBr = (d) => (d ? d.split('-').reverse().join('/') : null);
const HOJE = () => new Date().toISOString().slice(0, 10);

/* As tarefas do projeto como quadro: uma coluna por etapa de execução,
   arrastando entre elas. A lista é melhor para passar o olho; o quadro é
   melhor quando o projeto está rodando e a pergunta é "o que está parado
   em Aguardando". */
export default function QuadroTarefas({ tarefas, pessoas }) {
  const [lista, definirLista] = useState(tarefas);
  const [sobre, definirSobre] = useState(null);
  const [erro, definirErro] = useState(null);
  const router = useRouter();

  async function soltar(coluna, evento) {
    evento.preventDefault();
    definirSobre(null);
    const id = evento.dataTransfer.getData('text/plain');
    const tarefa = lista.find((t) => t.id === id);
    if (!tarefa || tarefa.coluna === coluna) return;

    const antes = lista;
    definirLista(lista.map((t) => (t.id === id ? { ...t, coluna } : t)));

    const r = await moverTarefaAcao(id, coluna);
    if (r?.erro) { definirLista(antes); definirErro(r.erro); return; }
    definirErro(null);
    router.refresh();
  }

  return (
    <>
      {erro && <p className="pn-recusa pn-recusa--bloco" role="alert">{erro}</p>}

      <div className="pn-quadro pn-quadro--tarefas">
        {COLUNAS_TAREFA.map((coluna) => {
          const dela = lista.filter((t) => t.coluna === coluna);
          return (
            <div
              key={coluna}
              className={'pn-col' + (sobre === coluna ? ' sobre' : '')}
              onDragOver={(e) => { e.preventDefault(); definirSobre(coluna); }}
              onDragLeave={() => definirSobre((a) => (a === coluna ? null : a))}
              onDrop={(e) => soltar(coluna, e)}
            >
              <div className="pn-col-cab">
                <span className="pn-col-nome">{coluna}</span>
                <span className="pn-col-n num">{dela.length}</span>
              </div>

              {dela.map((t) => {
                const responsavel = pessoas.find((p) => p.id === t.responsavel_id);
                const atrasada = t.prazo && t.prazo < HOJE() && t.coluna !== 'Feito';
                return (
                  <article
                    key={t.id}
                    className={'pn-cartao pn-cartao--tarefa' + (t.coluna === 'Feito' ? ' feita' : '')}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', t.id);
                      e.currentTarget.classList.add('arrastando');
                    }}
                    onDragEnd={(e) => e.currentTarget.classList.remove('arrastando')}
                  >
                    <p className="pn-tit">{t.titulo}</p>
                    <div className="pn-pe">
                      <span className={'pn-prazo num' + (atrasada ? ' atrasado' : '')}>
                        {dataBr(t.prazo) || 'sem prazo'}
                      </span>
                      <span className="pn-dono" title={responsavel?.nome || 'Sem responsável'}>
                        {iniciais(responsavel?.nome)}
                      </span>
                    </div>
                    {t.urgente && t.coluna !== 'Feito' && <span className="pn-urgente">Urgente</span>}
                  </article>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
