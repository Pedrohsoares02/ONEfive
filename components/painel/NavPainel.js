'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation.js';

const PAGINAS = [
  ['/painel', 'Início'],
  ['/painel/leads', 'Leads'],
  ['/painel/projetos', 'Projetos'],
];

export default function NavPainel() {
  const caminho = usePathname();
  return (
    <nav className="pn-nav">
      {PAGINAS.map(([href, rotulo]) => (
        <Link key={href} href={href} aria-current={caminho === href ? 'page' : undefined}>
          {rotulo}
        </Link>
      ))}
    </nav>
  );
}
