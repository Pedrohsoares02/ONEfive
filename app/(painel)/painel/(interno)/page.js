import Link from 'next/link';
import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import { listarNegocios } from '@/lib/consultas.js';
import { ETAPAS_LEAD, ETAPAS_PROJETO, previsaoDoFunil, meusNegocios } from '@/lib/funil.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;


export const metadata = { title: 'Início — Painel ONEfive' };

export default async function PaginaInicio() {
  const cliente = await criarClienteServidor();
  const pessoa = await exigirUsuario(cliente);

  const leads = await listarNegocios(cliente, ETAPAS_LEAD);
  const projetos = await listarNegocios(cliente, ETAPAS_PROJETO);

  const propostas = leads.filter((n) => n.etapa === 'Proposta enviada').length;
  const emRisco = projetos.filter((n) => n.etapa === 'Em risco').length;
  const noFunil = previsaoDoFunil(leads.filter((n) => n.etapa !== 'Perdido'));
  const meus = meusNegocios([...leads, ...projetos], pessoa.id);

  const partes = [];
  if (propostas) partes.push(`${propostas} ${propostas > 1 ? 'propostas esperando resposta' : 'proposta esperando resposta'}`);
  if (emRisco) partes.push(`${emRisco} ${emRisco > 1 ? 'projetos em risco' : 'projeto em risco'}`);
  partes.push(`R$ ${Math.round(noFunil / 1000)} mil no funil`);

  return (
    <main className="pn-tela">
      <div className="pn-barra">
        <div>
          <h1>{pessoa.nome.split(' ')[0]}</h1>
          <p className="pn-sub">{partes.join(', ')}</p>
        </div>
      </div>

      <p className="pn-sub" style={{ marginBottom: 12 }}>Seus negócios em aberto</p>
      {meus.length === 0 ? (
        <p className="pn-vazio">
          Nada em seu nome. Veja os quadros de <Link href="/painel/leads">Leads</Link> e{' '}
          <Link href="/painel/projetos">Projetos</Link>.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {meus.map((n) => (
            <li key={n.id} className="pn-cartao" style={{ cursor: 'default' }}>
              <div className="pn-cliente">{n.cliente?.nome || 'Sem cliente'}</div>
              <div className="pn-tit">{n.titulo}</div>
              <div className="pn-pe"><span className="pn-sub">{n.etapa}</span></div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
