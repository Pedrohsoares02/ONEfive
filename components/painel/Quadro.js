'use client';

import { useEffect, useState, useTransition } from 'react';
import { ehRedirecionamento } from '@/lib/erros.js';
import { diasParado, estaParado } from '@/lib/parado.js';
import { fechaEm } from '@/lib/recortes.js';
import { PESO_ETAPA } from '@/lib/funil.js';
import { moverEtapaAcao } from '@/app/(painel)/painel/acoes.js';
import FichaRapida from '@/components/painel/FichaRapida.js';

function iniciais(nome) {
  if (!nome) return '—';
  return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function dinheiro(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const v = Number(valor);
  if (!Number.isFinite(v)) return null;
  return 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

const HOJE = () => new Date().toISOString().slice(0, 10);

const DIA_MES = { day: '2-digit', month: 'short' };

/* Os dois relógios do cartão: quando fecha e há quanto tempo não se mexe.
   Ficam sempre à vista — é o que os três olham todo dia sem abrir nada. */
function Relogios({ negocio, campoData }) {
  const hoje = HOJE();
  const data = negocio[campoData] ?? null;
  const faltam = data ? fechaEm({ fechamento_previsto: data }, hoje) : null;
  const dias = diasParado(negocio.ultimoEm, hoje);
  const demais = estaParado(negocio, hoje);

  const quando = data
    ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', DIA_MES)
    : null;

  return (
    <div className="pn-relogios">
      {data ? (
        <span className={'pn-rel num' + (faltam < 0 ? ' vencido' : faltam <= 30 ? ' perto' : '')}>
          {faltam < 0 ? 'venceu ' : 'fecha '}{quando}
        </span>
      ) : (
        <span className="pn-rel fraco">sem data</span>
      )}
      {dias !== null && (
        <span className={'pn-rel num' + (demais ? ' parado' : '')}>
          {demais ? `parado há ${dias} d` : `${dias} d`}
        </span>
      )}
    </div>
  );
}

function classeEtapa(etapa) {
  if (etapa === 'Em risco' || etapa === 'Perdido') return 's-risk';
  if (etapa === 'Concluído' || etapa === 'Encerrado') return 's-ok';
  if (etapa === 'Em andamento') return 's-cool';
  return '';
}

/* Quadro do funil. `gaveta` recolhe uma etapa numa aba vertical: Perdido
   ocupava um quinto da largura para guardar o que já morreu. */
export default function Quadro({ etapas, negocios, tipo, gaveta, campoData = 'fechamento_previsto' }) {
  const [lista, setLista] = useState(negocios);
  const [sobre, setSobre] = useState(null);
  const [abertaGaveta, setAbertaGaveta] = useState(false);
  const [aberto, setAberto] = useState(null);
  const [, transicao] = useTransition();

  // a lista vem filtrada de fora: useState sozinho ignoraria a troca
  useEffect(() => { setLista(negocios); }, [negocios]);

  const noQuadro = etapas.filter((e) => e !== gaveta || abertaGaveta);
  const naGaveta = gaveta && !abertaGaveta;

  function mover(id, etapa) {
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

  function soltar(etapa, evento) {
    evento.preventDefault();
    setSobre(null);
    mover(evento.dataTransfer.getData('text/plain'), etapa);
  }

  function Cartao({ n }) {
    const quem = n.cliente?.contato?.[0] ?? null;
    return (
      <article
        className={'pn-cartao ' + classeEtapa(n.etapa) + (aberto?.id === n.id ? ' aberto' : '')}
        role="button"
        tabIndex={0}
        onClick={() => setAberto(n)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          setAberto(n);
        }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', n.id);
          e.currentTarget.classList.add('arrastando');
        }}
        onDragEnd={(e) => e.currentTarget.classList.remove('arrastando')}
      >
        <div className="pn-cliente">{n.cliente?.nome || 'Sem cliente'}</div>
        <div className="pn-tit">{n.titulo}</div>

        <div className={'pn-quem' + (quem ? '' : ' sem')}>
          <span className="pn-quem__ini">{quem ? iniciais(quem.nome) : '?'}</span>
          {quem ? quem.nome + (quem.cargo ? ' · ' + quem.cargo : '') : 'sem contato lá dentro'}
        </div>

        <Relogios negocio={n} campoData={campoData} />

        <div className="pn-pe">
          <span className={'pn-valor num' + (dinheiro(n.valor_previsto) ? '' : ' pn-sem')}>
            {dinheiro(n.valor_previsto) || 'Sem valor ainda'}
          </span>
          <span className="pn-dono" title={n.dono?.nome || 'Sem dono'}>
            {iniciais(n.dono?.nome)}
          </span>
        </div>
      </article>
    );
  }

  return (
    <>
    {aberto && (
      <FichaRapida
        negocio={lista.find((n) => n.id === aberto.id) ?? aberto}
        campoData={campoData}
        aoFechar={() => setAberto(null)}
      />
    )}
    <div className={'pn-quadro ' + tipo + (naGaveta ? ' com-gaveta' : '')}>
      {noQuadro.map((etapa) => {
        const dela = lista.filter((n) => n.etapa === etapa);
        const soma = dela.reduce(
          (t, n) => (dinheiro(n.valor_previsto) ? t + Number(n.valor_previsto) : t), 0
        );
        const peso = PESO_ETAPA[etapa];
        return (
          <div
            key={etapa}
            className={'pn-col' + (sobre === etapa ? ' sobre' : '')}
            onDragOver={(e) => { e.preventDefault(); setSobre(etapa); }}
            onDragLeave={() => setSobre((s) => (s === etapa ? null : s))}
            onDrop={(e) => soltar(etapa, e)}
          >
            <div className="pn-col-cab">
              <div className="pn-col-topo">
                <span className="pn-col-nome">{etapa}</span>
                <span className="pn-col-n">{dela.length}</span>
                {peso && <span className="pn-col-peso">{Math.round(peso * 100)}%</span>}
              </div>
              <span className={'pn-col-soma num' + (soma ? '' : ' zero')}>
                {soma ? dinheiro(soma) : '—'}
              </span>
            </div>

            {dela.length === 0
              ? <p className="pn-col-vazia">Arraste um negócio para cá</p>
              : dela.map((n) => <Cartao key={n.id} n={n} />)}
          </div>
        );
      })}

      {naGaveta && (
        <button
          type="button"
          className={'pn-gaveta' + (sobre === gaveta ? ' sobre' : '')}
          onClick={() => setAbertaGaveta(true)}
          onDragOver={(e) => { e.preventDefault(); setSobre(gaveta); }}
          onDragLeave={() => setSobre((s) => (s === gaveta ? null : s))}
          onDrop={(e) => soltar(gaveta, e)}
          title={'Abrir ' + gaveta}
        >
          <span className="pn-gaveta__vert">
            <b>{gaveta}</b>
            <i className="num">{lista.filter((n) => n.etapa === gaveta).length}</i>
          </span>
        </button>
      )}
    </div>
    </>
  );
}
