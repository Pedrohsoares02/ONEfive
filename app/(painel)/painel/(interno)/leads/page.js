import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import { listarNegocios, listarPessoas, listarClientes, lerMovimento, comMovimento } from '@/lib/consultas.js';
import { ETAPAS_LEAD } from '@/lib/funil.js';
import FunilLeads from '@/components/painel/FunilLeads.js';
import NovoNegocio from '@/components/painel/NovoNegocio.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;

export const metadata = { title: 'Leads — Painel ONEfive' };

export default async function PaginaLeads() {
  const cliente = await criarClienteServidor();
  await exigirUsuario(cliente);

  const [achados, pessoas, clientes, movimento] = await Promise.all([
    listarNegocios(cliente, ETAPAS_LEAD),
    listarPessoas(cliente),
    listarClientes(cliente),
    lerMovimento(cliente),
  ]);
  const negocios = comMovimento(achados, movimento);

  if (negocios.length === 0) {
    return (
      <main className="pn-tela">
        <div className="pn-barra">
          <div><h1>Leads</h1></div>
          <NovoNegocio etapas={ETAPAS_LEAD} pessoas={pessoas} clientes={clientes} rotulo="Novo lead" />
        </div>
        <p className="pn-vazio">Nenhum lead ainda. O primeiro cadastro cria o código NEG-001.</p>
      </main>
    );
  }

  return (
    <main className="pn-tela">
      <FunilLeads negocios={negocios} pessoas={pessoas} etapas={ETAPAS_LEAD}>
        <NovoNegocio etapas={ETAPAS_LEAD} pessoas={pessoas} clientes={clientes} rotulo="Novo lead" />
      </FunilLeads>
    </main>
  );
}
