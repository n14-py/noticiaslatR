import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

// Este componente envuelve todas las páginas
// {children} será el contenido de la página (ej: la lista de artículos)
export default function Layout({ children }) {
  return (
    <>
      <Head>
        {/* Metatags de tu index.html original */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Título y descripción por defecto (las páginas específicas pueden sobreescribirlos) */}
        <title>Noticias.lat - El portal de noticias de Latinoamérica</title>
        <meta name="description" content="Tu portal de noticias actualizado con la última información de la red LFAF Tech. Cobertura de todos los países de Latinoamérica." />
        
        {/* Tags de Open Graph (para redes sociales) por defecto */}
        <meta property="og:title" content="Noticias.lat - Lo Último de Latinoamérica" />
        <meta property="og:description" content="Tu fuente de noticias actualizada con cobertura detallada de Argentina, México, Colombia, Chile, Perú y toda la región. La información más importante, al instante." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.noticias.lat" />
        <meta property="og:image" content="https://www.noticias.lat/images/placeholder.jpg" />
        <meta property="og:site_name" content="Noticias.lat" />
        
        {/* Favicon (lo pusimos en la carpeta /public) */}
        <link rel="icon" href="/favicon.png" type="image/png" />

        {/* Google AdSense (de tu index.html) */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5461370198299696"
          crossOrigin="anonymous"
        ></script>
        
        {/* Google tag (gtag.js) (de tu index.html) */}
        <script 
          async 
          src="https://www.googletagmanager.com/gtag/js?id=G-J80VTC4S5M"
        ></script>
        <script
          // Usamos dangerouslySetInnerHTML para insertar el script que no es un archivo
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-J80VTC4S5M');
            `,
          }}
        />
      </Head>

      {/* Aquí se renderiza tu cabecera */}
      <Header />

      {/* Aquí se renderiza el contenido de la página */}
      <main>
        {children}
      </main>

      {/* Aquí se renderiza tu pie de página */}
      <Footer />
    </>
  );
}