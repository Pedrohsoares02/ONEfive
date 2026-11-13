// `next/navigation.js` com extensão: o pacote next não declara "exports", então
// o Node puro (usado pelos testes) não resolve o especificador sem ela. O
// bundler do Next resolve os dois caminhos — o arquivo existe com esse nome.
import { redirect } from 'next/navigation.js';

/** Só o papel admin manda; o resto lê. */
export function ehAdmin(pessoa) {
  return pessoa?.papel === 'admin';
}

/**
 * Autorização de verdade, no servidor. O proxy.js só faz a checagem otimista
 * do cookie; é aqui que se confere quem a pessoa é.
 *
 * `cliente` existe para os testes injetarem um dublê. Em produção fica vazio
 * e o cliente é criado a partir dos cookies da requisição.
 */
export async function exigirUsuario(cliente) {
  const c = cliente ?? (await (await import('./supabase/servidor.js')).criarClienteServidor());

  // getUser valida o token no servidor do Supabase. getSession só lê o cookie,
  // que o navegador pode ter adulterado: nunca use getSession para autorizar.
  const { data, error } = await c.auth.getUser();
  if (error || !data?.user) redirect('/painel/login');

  const { data: pessoa } = await c
    .from('pessoa')
    .select('id, nome, email, papel, ativo')
    .eq('id', data.user.id)
    .maybeSingle();

  // Autenticado no Supabase não é o mesmo que ser do time.
  if (!pessoa || !pessoa.ativo) redirect('/painel/login?motivo=sem-acesso');

  return pessoa;
}
