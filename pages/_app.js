// Importamos tu archivo de estilos global
import '../styles/style.css';

// ¡Importante! Añadimos Font Awesome para tus íconos
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Esto carga los íconos (fas fa-bars, fab fa-whatsapp, etc.) que usas en tu HTML original */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" 
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;