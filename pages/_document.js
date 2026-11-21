import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <noscript id="__next_css__DO_NOT_USE__" />
        {/* Fuentes y estilos globales */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" 
        />
        


      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}