import { Suspense } from 'react';

import MolduraEntrada from '@/components/painel/MolduraEntrada.js';
import FormaLogin from '@/components/painel/FormaLogin.js';

export const metadata = { title: 'Entrar — Painel ONEfive' };

/* No Next 16, ler searchParams fora de <Suspense> impede o prerender da rota
   inteira. O aviso fica num componente próprio, e a casca da página é estática. */
async function AvisoMotivo({ searchParams }) {
  const { motivo } = await searchParams;
  const textos = {
    'sem-acesso': 'Sua conta entrou, mas ainda não tem acesso ao painel.',
    falhou: 'O login com o Google não foi concluído. Tente de novo.',
  };
  const texto = textos[motivo];
  if (!texto) return null;
  return (
    <p className="of-entrada__aviso" role="alert">
      {texto}
    </p>
  );
}

export default function PaginaLogin({ searchParams }) {
  return (
    <MolduraEntrada>
      <span className="of-entrada__regua" aria-hidden="true" />

      <p className="of-entrada__marca">
        ONE<em>five</em>
      </p>

      <h1 className="of-entrada__titulo">
        Painel de gestão<span className="of-entrada__ponto">.</span>
      </h1>

      <p className="of-entrada__linha">
        Leads, projetos e financeiro da consultoria, num lugar só.
      </p>

      <Suspense fallback={null}>
        <AvisoMotivo searchParams={searchParams} />
      </Suspense>

      <FormaLogin />

      <p className="of-entrada__nota">
        O acesso é liberado por pessoa. Se você entrar e o painel não abrir, é
        porque sua conta ainda não foi incluída — fale com o Ricardo.
      </p>
    </MolduraEntrada>
  );
}
