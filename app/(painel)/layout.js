import '../painel.css';

export const metadata = {
  title: 'Painel ONEfive',
};

export default function LayoutPainel({ children }) {
  return <div className="painel">{children}</div>;
}
