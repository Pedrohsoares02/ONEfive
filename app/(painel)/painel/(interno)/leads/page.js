import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import { listarNegocios } from '@/lib/consultas.js';
import { ETAPAS_LEAD, previsaoDoFunil } from '@/lib/funil.js';
import Quadro from '@/components/painel/Quadro.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;


export const metadata = { title: 'Leads — Painel ONEfive' };

export default async function PaginaLeads() {
  const cliente = await criarClienteServidor();
  await exigirUsuario(cliente);

  const negocios = await listarNegocios(cliente, ETAPAS_LEAD);
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
      </div>

      {negocios.length === 0 ? (
        <p className="pn-vazio">Nenhum lead ainda. O primeiro cadastro cria o código NEG-001.</p>
      ) : (
        <Quadro etapas={ETAPAS_LEAD} negocios={negocios} tipo="leads" />
      )}
    </main>
  );
}
