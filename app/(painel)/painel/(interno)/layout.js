import { criarClienteServidor } from '@/lib/supabase/servidor.js';
import { exigirUsuario } from '@/lib/sessao.js';
import NavPainel from '@/components/painel/NavPainel.js';
import { HERO_IMAGEM } from '@/app/constants';
import Paleta from '@/components/painel/Paleta.js';

// Página de usuário logado: lê cookie de sessão, nada aqui pode ser
// pré-renderizado. Rota bloqueante é o comportamento correto.
export const instant = false;


/* Este layout cobre só as páginas internas: o login mora fora deste grupo e
   não ganha barra de navegação. A autorização acontece aqui E em cada página
   — um layout não protege sozinho as rotas abaixo dele. */
/* O contato não tem página própria: ele mora na ficha do negócio. A paleta
   leva ao negócio mais recente da organização dele; sem negócio nenhum,
   leva aos leads. */
function negocioDaOrganizacao(negocios, clienteId) {
  const achado = negocios.find((n) => n.cliente_id === clienteId);
  return achado ? `/painel/negocio/${achado.id}` : '/painel/leads';
}

export default async function LayoutInterno({ children }) {
  const cliente = await criarClienteServidor();
  const pessoa = await exigirUsuario(cliente);

  // O que a paleta de comandos busca. Vem junto com a página e fica em
  // memória, por isso a busca responde sem ida ao servidor.
  const [negocios, clientes, contatos] = await Promise.all([
    cliente.from('negocio').select('id, codigo, titulo, etapa, cliente_id, cliente:cliente_id (nome)')
      .order('atualizado_em', { ascending: false }).limit(300).then((r) => r.data ?? []),
    cliente.from('cliente').select('id, nome').order('nome').limit(300).then((r) => r.data ?? []),
    cliente.from('contato').select('id, nome, cargo, cliente_id').order('nome').limit(300)
      .then((r) => r.data ?? []),
  ]);

  const porCliente = new Map(clientes.map((c) => [c.id, c.nome]));

  const itensDaPaleta = [
    ...negocios.map((n) => ({
      grupo: 'Negócios', nome: n.titulo,
      sub: `${n.codigo} · ${n.cliente?.nome || 'sem organização'} · ${n.etapa}`,
      destino: `/painel/negocio/${n.id}`,
    })),
    ...contatos.map((c) => ({
      grupo: 'Contatos', nome: c.nome,
      sub: `${c.cargo || 'sem cargo'} · ${porCliente.get(c.cliente_id) || 'sem organização'}`,
      destino: negocioDaOrganizacao(negocios, c.cliente_id),
    })),
  ];

  const iniciais = pessoa.nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('');

  return (
    <>
      {/* A mesma lâmpada da landing, atrás de um vidro: desfocada, apagada e
          coberta por um véu claro. Fica fixa, então não acompanha a rolagem
          e nunca disputa a leitura com o conteúdo. */}
      <div className="pn-fundo" aria-hidden="true">
        <img src={HERO_IMAGEM} alt="" decoding="async" />
      </div>

      <header className="pn-topo">
        <div className="pn-topo-in">
          <p className="pn-marca">
            <span>ONE<em>five</em></span>
            <span className="pn-marca-sub">painel</span>
          </p>
          <NavPainel />
          <Paleta itens={itensDaPaleta} />
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
