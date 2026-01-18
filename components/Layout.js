import Head from 'next/head';
import Script from 'next/script'; // Importamos el componente optimizado
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Título y descripción por defecto */}
        <title>Noticias.lat - El portal de noticias de Latinoamérica</title>
        <meta name="description" content="Tu portal de noticias actualizado con la última información de la red LFAF Tech. Cobertura de todos los países de Latinoamérica." />
        
        {/* Open Graph */}
        <meta property="og:title" content="Noticias.lat - Lo Último de Latinoamérica" />
        <meta property="og:description" content="Tu fuente de noticias actualizada con cobertura detallada de Argentina, México, Colombia, Chile, Perú y toda la región." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.noticias.lat" />
        <meta property="og:image" content="https://www.noticias.lat/images/placeholder.jpg" />
        <meta property="og:site_name" content="Noticias.lat" />
        
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>

      {/* --- SCRIPTS (Fuera de Head, usando Script) --- */}

      {/* 1. Google AdSense */}
      <Script 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5461370198299696"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* 2. Google Analytics (GA4) */}
      <Script 
        src="https://www.googletagmanager.com/gtag/js?id=G-J80VTC4S5M"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-J80VTC4S5M');
        `}
      </Script>

      {/* 3. Monetag (Tu único ad network activo) */}
      <Script 
        src="https://quge5.com/88/tag.min.js" 
        data-zone="195157" 
        async 
        data-cfasync="false"
        strategy="afterInteractive"
      />

      <Header />

      <main>
        {children}
      </main>

      <Footer />
    </>
  );
}