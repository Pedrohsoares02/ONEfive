import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import {
  listarNegocios, listarPessoas, listarClientes, lerMovimento, comMovimento,
  listarTarefasDe, listarLancamentosDe, comOperacao,
} from '@/lib/consultas.js';
import { ETAPAS_PROJETO } from '@/lib/funil.js';
import Projetos from '@/components/painel/Projetos.js';
import NovoNegocio from '@/components/painel/NovoNegocio.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;

export const metadata = { title: 'Projetos — Painel ONEfive' };

export default async function PaginaProjetos() {
  const cliente = await criarClienteServidor();
  await exigirUsuario(cliente);

  const [achados, pessoas, clientes, movimento] = await Promise.all([
    listarNegocios(cliente, ETAPAS_PROJETO),
    listarPessoas(cliente),
    listarClientes(cliente),
    lerMovimento(cliente),
  ]);

  const ids = achados.map((n) => n.id);
  const [tarefas, lancamentos] = await Promise.all([
    listarTarefasDe(cliente, ids),
    listarLancamentosDe(cliente, ids),
  ]);

  const projetos = comOperacao(comMovimento(achados, movimento), tarefas, lancamentos);

  return (
    <main className="pn-tela">
      {projetos.length === 0 ? (
        <>
          <div className="pn-barra">
            <div><h1>Projetos</h1></div>
            <NovoNegocio etapas={ETAPAS_PROJETO} pessoas={pessoas} clientes={clientes} rotulo="Novo projeto" />
          </div>
          <p className="pn-vazio">
            Nenhum projeto ainda. Um lead vira projeto quando você o move para Em andamento.
          </p>
        </>
      ) : (
        <Projetos projetos={projetos} pessoas={pessoas}>
          <NovoNegocio etapas={ETAPAS_PROJETO} pessoas={pessoas} clientes={clientes} rotulo="Novo projeto" />
        </Projetos>
      )}
    </main>
  );
}
