import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import { listarNegocios } from '@/lib/consultas.js';
import { ETAPAS_PROJETO, previsaoDoFunil } from '@/lib/funil.js';
import Quadro from '@/components/painel/Quadro.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;


export const metadata = { title: 'Projetos — Painel ONEfive' };

export default async function PaginaProjetos() {
  const cliente = await criarClienteServidor();
  await exigirUsuario(cliente);

  const negocios = await listarNegocios(cliente, ETAPAS_PROJETO);
  const contratado = previsaoDoFunil(negocios.filter((n) => n.etapa !== 'Encerrado'));

  return (
    <main className="pn-tela">
      <div className="pn-barra">
        <div>
          <h1>Projetos</h1>
          <p className="pn-sub">
            {negocios.length} em carteira, R$ {contratado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} contratados
          </p>
        </div>
      </div>

      {negocios.length === 0 ? (
        <p className="pn-vazio">Nenhum projeto ainda. Um lead vira projeto ao ir para “Em andamento”.</p>
      ) : (
        <Quadro etapas={ETAPAS_PROJETO} negocios={negocios} tipo="projetos" />
      )}
    </main>
  );
}
