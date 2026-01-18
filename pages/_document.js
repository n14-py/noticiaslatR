import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Aquí es donde Next.js quiere que vayan las fuentes y estilos globales */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" 
        />
        {/* Aquí puedes poner tus metadatos globales, favicon, etc. si faltan */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}