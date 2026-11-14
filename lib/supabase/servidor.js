import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/* Em vez do erro genérico do Supabase ("URL and Key are required"), diz QUAL
   variável falta e quais o servidor está enxergando — senão a única forma de
   descobrir é abrir o painel da hospedagem. */
function lerConfiguracao() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !chave) {
    const vistas = Object.keys(process.env)
      .filter((k) => /SUPA|NEXT_PUBLIC/i.test(k))
      .sort()
      .join(', ');
    throw new Error(
      'Configuração do Supabase ausente. ' +
        'URL=' + (url ? 'ok' : 'FALTA') + ', CHAVE=' + (chave ? 'ok' : 'FALTA') + '. ' +
        'Variáveis que o servidor enxerga: ' + (vistas || 'nenhuma com SUPA/NEXT_PUBLIC no nome')
    );
  }
  return { url, chave };
}

/** Cliente para Server Components, Server Actions e Route Handlers. */
export async function criarClienteServidor() {
  const { url, chave } = lerConfiguracao();

  // No Next 16 cookies() é assíncrono.
  const jar = await cookies();

  return createServerClient(url, chave, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // Server Component não pode escrever cookie. O proxy renova a sessão.
        }
      },
    },
  });
}
