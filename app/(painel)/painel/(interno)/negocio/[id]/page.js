import { notFound } from 'next/navigation.js';

import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario, ehAdmin } from '@/lib/sessao.js';
import { listarPessoas } from '@/lib/consultas.js';
import { diasParado, estaParado } from '@/lib/parado.js';
import { ehLead, ETAPAS_LEAD, ETAPAS_PROJETO } from '@/lib/funil.js';
import CampoDoNegocio from '@/components/painel/CampoDoNegocio.js';
import Contatos from '@/components/painel/Contatos.js';
import Tarefas from '@/components/painel/Tarefas.js';
import Financeiro from '@/components/painel/Financeiro.js';
import ApagarNegocio from '@/components/painel/ApagarNegocio.js';

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
      .select('id, titulo, coluna, prazo, responsavel_id, urgente, observacoes, depende_de, posicao_x, posicao_y, espera_quem, espera_desde')
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
  ];
  const datas = lead
    ? [
        { rotulo: 'Contato', campo: 'data_contato', tipo: 'data', formato: 'data', valor: negocio.data_contato, vazio: '—' },
        { rotulo: 'Fechamento', campo: 'fechamento_previsto', tipo: 'data', formato: 'data', valor: negocio.fechamento_previsto, vazio: '—' },
      ]
    : [
        { rotulo: 'Início', campo: 'inicio', tipo: 'data', formato: 'data', valor: negocio.inicio, vazio: '—' },
        { rotulo: 'Prazo', campo: 'prazo', tipo: 'data', formato: 'data', valor: negocio.prazo, vazio: '—' },
      ];

  const organizacao = negocio.cliente?.nome ?? null;

  return (
    <main className="fc-tela">
      <div className="fc-cab">
        <div>
          <p className="fc-cod">
            {negocio.codigo}
            {silencio !== null && silencio >= 3 && (
              <span className={'fc-parado' + (demais ? ' demais' : '')}>
                {demais ? `parado há ${silencio} dias` : `${silencio} dias sem movimento`}
              </span>
            )}
          </p>
          <h1>
            <CampoDoNegocio
              negocioId={negocio.id} campo="titulo" valor={negocio.titulo}
              rotulo="Título do negócio"
            />
          </h1>
          <p className="fc-org">{organizacao || 'Sem organização'}</p>
        </div>

        {ehAdmin(pessoa) && (
          <ApagarNegocio
            negocioId={negocio.id} titulo={negocio.titulo}
            voltarPara={lead ? '/painel/leads' : '/painel/projetos'}
          />
        )}
      </div>

      <div className="fc-corpo">
        {/* o que se consulta: fica parado na lateral enquanto o resto rola */}
        <aside className="fc-lado">
          <div className="fc-bloco">
            <dl className="fc-campos">
              {campos.map((c) => (
                <div className="fc-campo" key={c.campo}>
                  <dt>{c.rotulo}</dt>
                  <dd><CampoDoNegocio negocioId={negocio.id} {...c} /></dd>
                </div>
              ))}
              <div className="fc-dupla">
                {datas.map((c) => (
                  <div className="fc-campo" key={c.campo}>
                    <dt>{c.rotulo}</dt>
                    <dd className="num"><CampoDoNegocio negocioId={negocio.id} {...c} /></dd>
                  </div>
                ))}
              </div>
            </dl>
          </div>

          {negocio.etapa === 'Perdido' && (
            <div className="fc-bloco">
              <p className="fc-rot">Motivo da perda</p>
              <p className="fc-nota">
                <CampoDoNegocio
                  negocioId={negocio.id} campo="motivo_perda" tipo="longo"
                  valor={negocio.motivo_perda} rotulo="Motivo da perda"
                  vazio="Por que não foi adiante? Clique para escrever."
                />
              </p>
            </div>
          )}

          <div className="fc-bloco">
            <p className="fc-rot">Quem decide lá dentro</p>
            <Contatos
              clienteId={negocio.cliente_id} contatos={contatos}
              organizacao={negocio.cliente?.nome}
            />
          </div>

          <div className="fc-bloco">
            <p className="fc-rot">Notas</p>
            <p className="fc-nota">
              <CampoDoNegocio
                negocioId={negocio.id} campo="observacoes" tipo="longo"
                valor={negocio.observacoes} rotulo="Observações"
                vazio="Sem notas. Clique para escrever."
              />
            </p>
          </div>
        </aside>

        {/* onde se trabalha */}
        <div className="fc-op">
          <section>
            <Tarefas negocioId={negocio.id} tarefas={tarefas} pessoas={pessoas} />
          </section>

          <section className="fc-sec">
            <h2>Financeiro</h2>
            <Financeiro negocioId={negocio.id} lancamentos={lancamentos} />
          </section>

          <section className="fc-sec">
            <h2>Linha do tempo</h2>
            {eventos.length === 0 ? (
              <p className="pn-nota">Sem histórico ainda.</p>
            ) : (
              <ul className="fc-linha">
                {eventos.map((e) => (
                  <li key={e.id}>
                    <b>{e.acao}</b>
                    {e.detalhe && <small>{e.detalhe}</small>}
                    <small>
                      {e.autor?.nome || 'sistema'}, {new Date(e.criado_em).toLocaleString('pt-BR')}
                    </small>
                  </li>
                ))}
              </ul>
            )}
            <p className="pn-nota-fraca">
              Nada aqui é digitado à mão: cada linha nasce de uma ação, gravada pelo próprio banco.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
