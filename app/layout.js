import './onefive.css';

export const metadata = {
  title: 'ONEfive',
  description: 'Inovação pública na prática — ONEfive',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Fontes da marca, carregadas do mesmo jeito que o snippet original
            (onefive_fontes): Inter, Poppins e JetBrains Mono do Google Fonts. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Poppins:wght@500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
