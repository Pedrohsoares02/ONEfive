import { NextResponse } from 'next/server';

// No Next 16 este arquivo se chama proxy.js; `middleware.js` está obsoleto.
// Ele roda em TODA navegação, inclusive prefetch, então aqui só se olha o
// cookie. Conferir no banco a cada rota deixaria o painel lento, e a
// autorização de verdade é exigirUsuario(), em cada página e cada ação.
export default function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/painel/login')) return NextResponse.next();

  const temSessao = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'));

  if (!temSessao) {
    return NextResponse.redirect(new URL('/painel/login', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/painel/:path*'],
};
