import { Suspense } from 'react';
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
    <p className="pn-erro" role="alert">
      {texto}
    </p>
  );
}

export default function PaginaLogin({ searchParams }) {
  return (
    <main className="pn-entrada">
      <div className="pn-cartao-entrada">
        <p className="pn-marca">ONE<em>five</em></p>
        <h1>Painel de gestão<span className="ponto">.</span></h1>

        <Suspense fallback={null}>
          <AvisoMotivo searchParams={searchParams} />
        </Suspense>

        <FormaLogin />

        <p className="pn-rodape-entrada">
          Acesso restrito à equipe da ONEfive. Se você entrou e mesmo assim não
          vê nada, sua conta ainda não foi liberada.
        </p>
      </div>
    </main>
  );
}
