'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ehRedirecionamento } from '@/lib/erros.js';
import { diasParado, estaParado } from '@/lib/parado.js';
import { moverEtapaAcao } from '@/app/(painel)/painel/acoes.js';

function iniciais(nome) {
  if (!nome) return '—';
  return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function dinheiro(valor) {
  const v = Number(valor);
  if (!Number.isFinite(v)) return null;
  return 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

/* Há quanto tempo este negócio não se mexe. Fica no rodapé do cartão porque
   é onde os três olham todo dia, sem precisar abrir nada. */
function Silencio({ negocio }) {
  const hoje = HOJE();
  const dias = diasParado(negocio.ultimoEm, hoje);
  if (dias === null || dias < 3) return null;

  const demais = estaParado(negocio, hoje);
  return (
    <span className={'pn-silencio num' + (demais ? ' demais' : '')}>
      {demais ? `parado há ${dias} d` : `${dias} d`}
    </span>
  );
}

function classeEtapa(etapa) {
  if (etapa === 'Em risco' || etapa === 'Perdido') return 's-risk';
  if (etapa === 'Concluído' || etapa === 'Encerrado') return 's-ok';
  if (etapa === 'Em andamento') return 's-cool';
  return '';
}

const HOJE = () => new Date().toISOString().slice(0, 10);

export default function Quadro({ etapas, negocios, tipo }) {
  const [lista, setLista] = useState(negocios);
  const [sobre, setSobre] = useState(null);
  const [, transicao] = useTransition();

  function soltar(etapa, evento) {
    evento.preventDefault();
    setSobre(null);
    const id = evento.dataTransfer.getData('text/plain');
    const negocio = lista.find((n) => n.id === id);
    if (!negocio || negocio.etapa === etapa) return;

    const anterior = lista;
    // Move na tela antes da resposta do servidor; se a gravação falhar, volta.
    setLista((atual) => atual.map((n) => (n.id === id ? { ...n, etapa } : n)));
    transicao(async () => {
      try {
        await moverEtapaAcao(id, etapa);
      } catch (erro) {
        // Sessão vencida: deixa o redirecionamento para o login seguir.
        if (ehRedirecionamento(erro)) throw erro;
        setLista(anterior);
      }
    });
  }

  return (
    <div className={'pn-quadro ' + tipo}>
      {etapas.map((etapa) => {
        const dela = lista.filter((n) => n.etapa === etapa);
        return (
          <div
            key={etapa}
            className={'pn-col' + (sobre === etapa ? ' sobre' : '')}
            onDragOver={(e) => { e.preventDefault(); setSobre(etapa); }}
            onDragLeave={() => setSobre((s) => (s === etapa ? null : s))}
            onDrop={(e) => soltar(etapa, e)}
          >
            <div className="pn-col-cab">
              <span className="pn-col-nome">{etapa}</span>
              <span className="pn-col-n">{dela.length}</span>
            </div>

            {dela.map((n) => (
              <article
                key={n.id}
                className={'pn-cartao ' + classeEtapa(n.etapa)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', n.id);
                  e.currentTarget.classList.add('arrastando');
                }}
                onDragEnd={(e) => e.currentTarget.classList.remove('arrastando')}
              >
                <div className="pn-cliente">{n.cliente?.nome || 'Sem cliente'}</div>
                <div className="pn-tit">
                  <Link href={'/painel/negocio/' + n.id} draggable={false}>{n.titulo}</Link>
                </div>
                <div className="pn-pe">
                  <span className={'pn-valor num' + (dinheiro(n.valor_previsto) ? '' : ' pn-sem')}>
                    {dinheiro(n.valor_previsto) || 'Sem valor ainda'}
                  </span>
                  <span className="pn-dono" title={n.dono?.nome || 'Sem dono'}>
                    {iniciais(n.dono?.nome)}
                  </span>
                </div>

                <Silencio negocio={n} />
              </article>
            ))}
          </div>
        );
      })}
    </div>
  );
}
