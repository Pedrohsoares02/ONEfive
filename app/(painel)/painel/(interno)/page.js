import Link from 'next/link';

import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import { listarNegocios } from '@/lib/consultas.js';
import { ETAPAS, previsaoDoFunil, ehLead } from '@/lib/funil.js';
import { pendencias } from '@/lib/pendencias.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;

export const metadata = { title: 'Início — Painel ONEfive' };

const real = (v) => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

export default async function PaginaInicio() {
  const cliente = await criarClienteServidor();
  const pessoa = await exigirUsuario(cliente);

  const [negocios, tarefas, clientesComContato] = await Promise.all([
    listarNegocios(cliente, ETAPAS),
    cliente
      .from('tarefa')
      .select('id, titulo, prazo, coluna, negocio_id')
      .neq('coluna', 'Feito')
      .then((r) => r.data ?? []),
    cliente
      .from('contato')
      .select('cliente_id')
      .then((r) => new Set((r.data ?? []).map((c) => c.cliente_id))),
  ]);

  // A regra "sem contato" precisa saber, por negócio, se a organização dele
  // já tem alguém cadastrado.
  const comContagem = negocios.map((n) => ({
    ...n,
    contatos: clientesComContato.has(n.cliente_id) ? 1 : 0,
  }));

  const hoje = new Date().toISOString().slice(0, 10);
  const lista = pendencias({ negocios: comContagem, tarefas, hoje });

  const leads = negocios.filter((n) => ehLead(n) && n.etapa !== 'Perdido');
  const noFunil = previsaoDoFunil(leads);
  const meus = negocios.filter(
    (n) => n.dono_id === pessoa.id && !['Perdido', 'Encerrado', 'Concluído'].includes(n.etapa)
  );

  return (
    <main className="pn-tela">
      <div className="pn-barra">
        <div>
          <h1>{pessoa.nome.split(' ')[0]}</h1>
          <p className="pn-sub">
            {lista.length === 0
              ? `nada parado, ${real(noFunil)} no funil`
              : `${lista.length} ${lista.length === 1 ? 'coisa pedindo atenção' : 'coisas pedindo atenção'}, ${real(noFunil)} no funil`}
          </p>
        </div>
      </div>

      <p className="pn-sub" style={{ marginTop: 0 }}>O que precisa de você hoje</p>

      {lista.length === 0 ? (
        <p className="pn-hoje-limpo">
          Nada parado. Tudo que está aberto teve movimento recente.
        </p>
      ) : (
        <ul className="pn-hoje">
          {lista.map((p, i) => (
            <li className="pn-hoje__item" data-tipo={p.tipo} key={p.tipo + p.negocioId + i}>
              <Link className="pn-hoje__link" href={`/painel/negocio/${p.negocioId}`}>
                <span className="pn-hoje__o">{p.titulo}</span>
                <span className="pn-hoje__pq">{p.motivo}</span>
              </Link>
              <span className="pn-hoje__qdo">{p.quando}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="pn-sub">Em seu nome</p>
      {meus.length === 0 ? (
        <p className="pn-vazio">
          Nada em seu nome. Veja os quadros de <Link href="/painel/leads">Leads</Link> e{' '}
          <Link href="/painel/projetos">Projetos</Link>.
        </p>
      ) : (
        <ul className="pn-lista-seca">
          {meus.map((n) => (
            <li key={n.id}>
              <Link className="pn-cartao" href={`/painel/negocio/${n.id}`}>
                <span className="pn-cliente">{n.cliente?.nome || 'Sem organização'}</span>
                <span className="pn-tit">{n.titulo}</span>
                <span className="pn-pe">
                  <span className="pn-sub">{n.etapa}</span>
                  <span className="pn-valor num">
                    {n.valor_previsto ? real(n.valor_previsto) : <span className="pn-sem">sem valor</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
