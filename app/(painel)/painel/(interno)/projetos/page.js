import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import { listarNegocios, listarPessoas, listarClientes } from '@/lib/consultas.js';
import { ETAPAS_PROJETO, previsaoDoFunil } from '@/lib/funil.js';
import Quadro from '@/components/painel/Quadro.js';
import NovoNegocio from '@/components/painel/NovoNegocio.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;


export const metadata = { title: 'Projetos — Painel ONEfive' };

export default async function PaginaProjetos({ searchParams }) {
  // No Next 16 searchParams é assíncrono.
  const { novo } = await searchParams;

  const cliente = await criarClienteServidor();
  await exigirUsuario(cliente);

  const [negocios, pessoas, clientes] = await Promise.all([
    listarNegocios(cliente, ETAPAS_PROJETO),
    listarPessoas(cliente),
    listarClientes(cliente),
  ]);
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

        <NovoNegocio
          etapas={ETAPAS_PROJETO}
          pessoas={pessoas}
          clientes={clientes}
          abrirAoCarregar={novo === '1'}
          rotulo="Novo projeto"
        />
      </div>

      {negocios.length === 0 ? (
        <p className="pn-vazio">Nenhum projeto ainda. Um lead vira projeto ao ir para “Em andamento”.</p>
      ) : (
        <Quadro etapas={ETAPAS_PROJETO} negocios={negocios} tipo="projetos" />
      )}
    </main>
  );
}
