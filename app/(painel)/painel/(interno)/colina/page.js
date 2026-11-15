import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import { listarNegocios } from '@/lib/consultas.js';
import { ETAPAS, ehLead } from '@/lib/funil.js';
import { trilhaDosEventos } from '@/lib/colina.js';
import Colina from '@/components/painel/Colina.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;

export const metadata = { title: 'Colina — Painel ONEfive' };

export default async function PaginaColina() {
  const cliente = await criarClienteServidor();
  await exigirUsuario(cliente);

  const [negocios, eventos] = await Promise.all([
    listarNegocios(cliente, ETAPAS),
    // o rastro sai da própria linha do tempo: cada movimento virou um evento
    cliente
      .from('evento')
      .select('negocio_id, acao, detalhe, criado_em')
      .eq('acao', 'Colina')
      .order('criado_em', { ascending: true })
      .then((r) => r.data ?? []),
  ]);

  const trilhas = Object.fromEntries(trilhaDosEventos(eventos));
  const abertos = negocios.filter((n) => !['Perdido', 'Encerrado'].includes(n.etapa));

  return (
    <main className="pn-tela">
      <div className="pn-barra">
        <div>
          <h1>Colina</h1>
          <p className="pn-sub">onde cada coisa está, e não em que caixa ela mora</p>
        </div>
      </div>

      <Colina
        negocios={abertos.filter(ehLead)}
        trilhas={trilhas}
        ehLead
        titulo="Leads"
        explicacao="À esquerda você ainda está descobrindo o que ele precisa. À direita, você já sabe e está fechando."
      />

      <Colina
        negocios={abertos.filter((n) => !ehLead(n))}
        trilhas={trilhas}
        ehLead={false}
        titulo="Projetos"
        explicacao="À esquerda você ainda está entendendo o problema. À direita, implantando a solução."
      />

      <p className="pn-nota-fraca">
        Bolinha vazada é a posição que o sistema sugeriu pela etapa, que ninguém confirmou ainda.
        Arraste, ou use as setas do teclado. Passe o mouse para ver por onde ela já passou.
        Cada movimento entra na linha do tempo do negócio.
      </p>
    </main>
  );
}
