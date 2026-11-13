import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Cliente para Server Components, Server Actions e Route Handlers. */
export async function criarClienteServidor() {
  // No Next 16 cookies() é assíncrono.
  const jar = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
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
    }
  );
}
