import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import NavPainel from '@/components/painel/NavPainel.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;


/* Este layout cobre só as páginas internas: o login mora fora deste grupo e
   não ganha barra de navegação. A autorização acontece aqui E em cada página
   — um layout não protege sozinho as rotas abaixo dele. */
export default async function LayoutInterno({ children }) {
  const cliente = await criarClienteServidor();
  const pessoa = await exigirUsuario(cliente);
  const iniciais = pessoa.nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('');

  return (
    <>
      <header className="pn-topo">
        <div className="pn-topo-in">
          <p className="pn-marca">
            <span>ONE<em>five</em></span>
            <span className="pn-marca-sub">painel</span>
          </p>
          <NavPainel />
          <div className="pn-eu">
            <span>{pessoa.nome}</span>
            <span className="pn-av" aria-hidden="true">{iniciais.toUpperCase()}</span>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
