import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link'; // Importamos Link para el enlace interno a /terminos

export default function Contacto() {
  return (
    <Layout>
      <Head>
        {/* SEO tags para esta página */}
        <title>Contacto - Noticias.lat</title>
        <meta name="description" content="¿Tienes alguna pregunta, sugerencia o quieres reportar un error? Contáctanos a través de nuestro email oficial." />
        
        {/* Metatags OG específicas */}
        <meta property="og:title" content="Contacto - Noticias.lat" />
        <meta property="og:url" content="https://www.noticias.lat/contacto" />
        <meta property="og:description" content="¿Tienes alguna pregunta, sugerencia o quieres reportar un error? Contáctanos a través de nuestro email oficial." />

        {/* Etiqueta Canónica */}
        <link rel="canonical" href="https://www.noticias.lat/contacto" />
      </Head>

      <div className="container">
        {/* Contenido de tu archivo contacto.html original */}
        <div className="static-page-container">
            <h1>Contáctenos</h1>
            <p>¿Tienes alguna pregunta, sugerencia o quieres reportar un error? Nos encantaría escucharte. Nuestro portal de noticias Noticias.lat es una plataforma de LFAF Tech.</p>
            <p>Puedes contactarnos directamente a través de nuestro email oficial o seguirnos en nuestras redes sociales.</p>
            
            <h2>Información de Contacto</h2>
            <ul>
                {/* Enlaces externos (mailto:, https://) usan <a> */}
                <li><strong>Email Oficial:</strong> <a href="mailto:contactonoticiaslat@gmail.com">contactonoticiaslat@gmail.com</a></li>
                <li><strong>Instagram:</strong> <a href="https://www.instagram.com/noticias.lat" target="_blank" rel="noopener noreferrer">@noticias.lat</a></li>
                <li><strong>TikTok:</strong> <a href="https://www.tiktok.com/@noticias.lat" target="_blank" rel="noopener noreferrer">@noticias.lat</a></li>
            </ul>
            
            {/* El atributo 'style' en React debe ser un objeto.
              Convertimos el style="..." a style={{...}}
            */}
            <p style={{ 
                fontSize: '0.95rem', 
                color: 'var(--color-texto-secundario)', 
                marginTop: '2rem', 
                lineHeight: '1.6' 
            }}>
              Para consultas sobre publicidad, alianzas o licencias de uso de contenido (basado en la política de <Link href="/terminos">Términos y Condiciones</Link>), por favor dirija su correo a nuestro Email Oficial.
            </p>
        </div>
      </div>
    </Layout>
  );
}