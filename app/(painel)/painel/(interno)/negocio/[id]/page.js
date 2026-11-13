import { notFound } from 'next/navigation.js';
import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import { somarPorTipo, margem, aReceber } from '@/lib/financeiro.js';
import { ehLead } from '@/lib/funil.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;

const real = (v) =>
  'R$ ' + Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

const dataBr = (d) => (d ? d.split('-').reverse().join('/') : '—');

export default async function PaginaNegocio({ params }) {
  // No Next 16 params é assíncrono.
  const { id } = await params;

  const cliente = await criarClienteServidor();
  await exigirUsuario(cliente);

  const { data: negocio } = await cliente
    .from('negocio')
    .select(
      'id, codigo, titulo, etapa, valor_previsto, probabilidade, data_contato, fechamento_previsto, inicio, prazo, motivo_perda, observacoes, cliente:cliente_id (nome), dono:dono_id (nome)'
    )
    .eq('id', id)
    .maybeSingle();

  if (!negocio) notFound();

  const { data: eventos } = await cliente
    .from('evento')
    .select('id, acao, detalhe, criado_em, autor:autor_id (nome)')
    .eq('negocio_id', id)
    .order('criado_em', { ascending: false });

  const { data: lancamentos } = await cliente
    .from('financeiro')
    .select('id, tipo, rubrica, descricao, valor, vencimento, pago_em')
    .eq('negocio_id', id)
    .order('vencimento', { ascending: true });

  const ls = lancamentos ?? [];
  const receita = somarPorTipo(ls, 'receita');
  const custo = somarPorTipo(ls, 'custo');
  const m = margem(ls);

  const campos = ehLead(negocio)
    ? [
        ['Etapa', negocio.etapa],
        ['Dono', negocio.dono?.nome || '—'],
        ['Valor previsto', negocio.valor_previsto ? real(negocio.valor_previsto) : 'Não definido'],
        ['Primeiro contato', dataBr(negocio.data_contato)],
        ['Fechamento previsto', dataBr(negocio.fechamento_previsto)],
      ]
    : [
        ['Etapa', negocio.etapa],
        ['Dono', negocio.dono?.nome || '—'],
        ['Valor contratado', negocio.valor_previsto ? real(negocio.valor_previsto) : 'Não definido'],
        ['Início', dataBr(negocio.inicio)],
        ['Prazo', dataBr(negocio.prazo)],
      ];

  return (
    <main className="pn-tela">
      <div className="pn-barra">
        <div>
          <p className="pn-codigo">{negocio.codigo}</p>
          <h1>{negocio.titulo}</h1>
          <p className="pn-sub">{negocio.cliente?.nome || 'Sem cliente'}</p>
        </div>
      </div>

      <dl className="pn-dados">
        {campos.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt>{rotulo}</dt>
            <dd className="num">{valor}</dd>
          </div>
        ))}
      </dl>

      {negocio.motivo_perda && (
        <>
          <p className="pn-sub">Motivo da perda</p>
          <p className="pn-nota">{negocio.motivo_perda}</p>
        </>
      )}

      <p className="pn-sub">Financeiro</p>
      {ls.length === 0 ? (
        <p className="pn-nota">Nenhum lançamento. Um lead sem valor fechado ainda não tem financeiro.</p>
      ) : (
        <>
          <div className="pn-kpis">
            <div className="pn-kpi"><span className="pn-kpi-n num">{real(receita)}</span><span className="pn-kpi-r">Receita</span></div>
            <div className="pn-kpi"><span className="pn-kpi-n num neg">{real(custo)}</span><span className="pn-kpi-r">Custos</span></div>
            <div className="pn-kpi"><span className="pn-kpi-n num pos">{m === null ? '—' : m + '%'}</span><span className="pn-kpi-r">Margem</span></div>
            <div className="pn-kpi"><span className="pn-kpi-n num">{real(aReceber(ls))}</span><span className="pn-kpi-r">A receber</span></div>
          </div>
          <ul className="pn-lanc">
            {ls.map((l) => (
              <li key={l.id}>
                <span className="pn-lanc-txt">
                  <strong>{l.rubrica || l.descricao || (l.tipo === 'receita' ? 'Receita' : 'Custo')}</strong>
                  {l.descricao && l.rubrica && <span className="pn-lanc-rub">{l.descricao}</span>}
                </span>
                <span className={'pn-lanc-val num' + (l.tipo === 'custo' ? ' saida' : '')}>
                  {l.tipo === 'custo' ? '−' : ''}{real(l.valor)}
                </span>
                <span className="pn-lanc-sit num">
                  {l.pago_em ? 'pago ' + dataBr(l.pago_em) : dataBr(l.vencimento)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="pn-sub">Linha do tempo</p>
      {(eventos ?? []).length === 0 ? (
        <p className="pn-nota">Sem histórico ainda.</p>
      ) : (
        <ul className="pn-linha">
          {eventos.map((e) => (
            <li key={e.id}>
              <span className="pn-linha-ac">{e.acao}</span>
              {e.detalhe && <span className="pn-linha-de">{e.detalhe}</span>}
              <span className="pn-linha-qd">
                {e.autor?.nome || 'sistema'}, {new Date(e.criado_em).toLocaleString('pt-BR')}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="pn-nota-fraca">
        Nada na linha do tempo é digitado à mão: cada linha nasce de uma ação, gravada pelo próprio banco.
      </p>
    </main>
  );
}
