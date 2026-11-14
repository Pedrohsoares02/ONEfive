import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import { listarNegocios, listarPessoas, listarClientes } from '@/lib/consultas.js';
import { ETAPAS_LEAD, previsaoDoFunil } from '@/lib/funil.js';
import Quadro from '@/components/painel/Quadro.js';
import NovoNegocio from '@/components/painel/NovoNegocio.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;


export const metadata = { title: 'Leads — Painel ONEfive' };

export default async function PaginaLeads() {
  const cliente = await criarClienteServidor();
  await exigirUsuario(cliente);

  const [negocios, pessoas, clientes] = await Promise.all([
    listarNegocios(cliente, ETAPAS_LEAD),
    listarPessoas(cliente),
    listarClientes(cliente),
  ]);
  const emJogo = previsaoDoFunil(negocios.filter((n) => n.etapa !== 'Perdido'));

  return (
    <main className="pn-tela">
      <div className="pn-barra">
        <div>
          <h1>Leads</h1>
          <p className="pn-sub">
            {negocios.length} no funil, R$ {emJogo.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} em jogo
          </p>
        </div>

        <NovoNegocio
          etapas={ETAPAS_LEAD}
          pessoas={pessoas}
          clientes={clientes}
          rotulo="Novo lead"
        />
      </div>

      {negocios.length === 0 ? (
        <p className="pn-vazio">Nenhum lead ainda. O primeiro cadastro cria o código NEG-001.</p>
      ) : (
        <Quadro etapas={ETAPAS_LEAD} negocios={negocios} tipo="leads" />
      )}
    </main>
  );
}
