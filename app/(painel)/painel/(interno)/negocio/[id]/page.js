import { notFound } from 'next/navigation.js';

import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario, ehAdmin } from '@/lib/sessao.js';
import { listarPessoas } from '@/lib/consultas.js';
import { diasParado, estaParado } from '@/lib/parado.js';
import { ehLead, ETAPAS_LEAD, ETAPAS_PROJETO } from '@/lib/funil.js';
import CampoDoNegocio from '@/components/painel/CampoDoNegocio.js';
import Tarefas from '@/components/painel/Tarefas.js';
import Financeiro from '@/components/painel/Financeiro.js';
import ApagarNegocio from '@/components/painel/ApagarNegocio.js';
import Contatos from '@/components/painel/Contatos.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;

export default async function PaginaNegocio({ params }) {
  // No Next 16 params é assíncrono.
  const { id } = await params;

  const cliente = await criarClienteServidor();
  const pessoa = await exigirUsuario(cliente);

  const { data: negocio } = await cliente
    .from('negocio')
    .select(
      'id, codigo, titulo, etapa, valor_previsto, dono_id, cliente_id, data_contato, fechamento_previsto, inicio, prazo, motivo_perda, observacoes, cliente:cliente_id (nome)'
    )
    .eq('id', id)
    .maybeSingle();

  if (!negocio) notFound();

  const [pessoas, eventos, lancamentos, tarefas, ultimoEm, contatos] = await Promise.all([
    listarPessoas(cliente),
    cliente
      .from('evento')
      .select('id, acao, detalhe, criado_em, autor:autor_id (nome)')
      .eq('negocio_id', id)
      .order('criado_em', { ascending: false })
      .then((r) => r.data ?? []),
    cliente
      .from('financeiro')
      .select('id, tipo, rubrica, descricao, valor, vencimento, pago_em')
      .eq('negocio_id', id)
      .order('vencimento', { ascending: true })
      .then((r) => r.data ?? []),
    cliente
      .from('tarefa')
      .select('id, titulo, coluna, prazo, responsavel_id, urgente, depende_de, posicao_x, posicao_y, espera_quem, espera_desde')
      .eq('negocio_id', id)
      .order('criado_em', { ascending: true })
      .then((r) => r.data ?? []),
    cliente
      .from('negocio_movimento')
      .select('ultimo_em')
      .eq('negocio_id', id)
      .maybeSingle()
      .then((r) => r.data?.ultimo_em ?? null),
    negocio.cliente_id
      ? cliente
          .from('contato')
          .select('id, nome, cargo, email, fone')
          .eq('cliente_id', negocio.cliente_id)
          .order('criado_em', { ascending: true })
          .then((r) => r.data ?? [])
      : Promise.resolve([]),
  ]);

  const lead = ehLead(negocio);
  const hoje = new Date().toISOString().slice(0, 10);
  const silencio = diasParado(ultimoEm, hoje);
  const demais = estaParado({ etapa: negocio.etapa, ultimoEm }, hoje);

  const campos = [
    { rotulo: 'Etapa', campo: 'etapa', tipo: 'lista', opcoes: [...ETAPAS_LEAD, ...ETAPAS_PROJETO], valor: negocio.etapa },
    { rotulo: 'Dono', campo: 'dono_id', tipo: 'lista', opcoes: pessoas.map((p) => ({ valor: p.id, nome: p.nome })), valor: negocio.dono_id, vazio: 'Sem dono' },
    { rotulo: lead ? 'Valor previsto' : 'Valor contratado', campo: 'valor_previsto', tipo: 'numero', formato: 'moeda', valor: negocio.valor_previsto },
    lead
      ? { rotulo: 'Primeiro contato', campo: 'data_contato', tipo: 'data', formato: 'data', valor: negocio.data_contato, vazio: '—' }
      : { rotulo: 'Início', campo: 'inicio', tipo: 'data', formato: 'data', valor: negocio.inicio, vazio: '—' },
    lead
      ? { rotulo: 'Fechamento previsto', campo: 'fechamento_previsto', tipo: 'data', formato: 'data', valor: negocio.fechamento_previsto, vazio: '—' }
      : { rotulo: 'Prazo', campo: 'prazo', tipo: 'data', formato: 'data', valor: negocio.prazo, vazio: '—' },
  ];

  return (
    <main className="pn-tela">
      <div className="pn-barra">
        <div>
          <p className="pn-codigo">
            {negocio.codigo}
            {silencio !== null && silencio >= 3 && (
              <span className={'pn-silencio num' + (demais ? ' demais' : '')}>
                {demais ? `parado há ${silencio} dias` : `${silencio} dias sem movimento`}
              </span>
            )}
          </p>
          <h1>
            <CampoDoNegocio
              negocioId={negocio.id}
              campo="titulo"
              valor={negocio.titulo}
              rotulo="Título do negócio"
            />
          </h1>
          <p className="pn-sub">{negocio.cliente?.nome || 'Sem cliente'}</p>
        </div>

        {ehAdmin(pessoa) && (
          <ApagarNegocio
            negocioId={negocio.id}
            titulo={negocio.titulo}
            voltarPara={lead ? '/painel/leads' : '/painel/projetos'}
          />
        )}
      </div>

      <dl className="pn-dados">
        {campos.map((c) => (
          <div key={c.campo}>
            <dt>{c.rotulo}</dt>
            <dd className="num">
              <CampoDoNegocio negocioId={negocio.id} {...c} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="pn-dica">Clique em qualquer valor acima para alterar. Enter grava, Esc cancela.</p>

      {negocio.etapa === 'Perdido' && (
        <>
          <p className="pn-sub">Motivo da perda</p>
          <div className="pn-nota">
            <CampoDoNegocio
              negocioId={negocio.id} campo="motivo_perda" tipo="longo"
              valor={negocio.motivo_perda} rotulo="Motivo da perda"
              vazio="Por que este negócio não foi adiante? Clique para escrever."
            />
          </div>
        </>
      )}

      <p className="pn-sub">Quem decide lá dentro</p>
      <Contatos
        clienteId={negocio.cliente_id}
        contatos={contatos}
        organizacao={negocio.cliente?.nome}
      />

      <p className="pn-sub">Observações</p>
      <div className="pn-nota">
        <CampoDoNegocio
          negocioId={negocio.id} campo="observacoes" tipo="longo"
          valor={negocio.observacoes} rotulo="Observações"
          vazio="Sem observações. Clique para escrever."
        />
      </div>

      <p className="pn-sub">Tarefas</p>
      <Tarefas negocioId={negocio.id} tarefas={tarefas} pessoas={pessoas} />

      <p className="pn-sub">Financeiro</p>
      <Financeiro negocioId={negocio.id} lancamentos={lancamentos} />

      <p className="pn-sub">Linha do tempo</p>
      {eventos.length === 0 ? (
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
