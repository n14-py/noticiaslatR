import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <Layout>
      <Head>
        <title>Error 404 - Página No Encontrada | Noticias.lat</title>
        {/* Hacemos que los motores de búsqueda no indexen esta página */}
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container">
        {/* Contenido de tu archivo 404.html original */}
        <div className="static-page-container" style={{ textAlign: 'center', maxWidth: '600px', padding: '4rem 2rem' }}>
            
            {/* Convertimos el style="..." a style={{...}} */}
            <h1 style={{ fontSize: '5rem', color: 'var(--color-primario-hover)', marginBottom: 0 }}>404</h1>
            <h2 style={{ fontSize: '2rem', marginTop: 0, marginBottom: '2rem', color: 'var(--color-texto-principal)' }}>Página no encontrada</h2>
            
            <p style={{ fontSize: '1.15rem', color: 'var(--color-texto-secundario)', marginBottom: '3rem' }}>
                Lo sentimos, la URL que intentaste acceder no existe en nuestro portal. Es posible que el enlace haya expirado o que se haya movido el contenido.
            </p>
            
            {/* Usamos el componente Link de Next.js */}
            <Link href="/" legacyBehavior>
              <a className="btn-primary" style={{ textDecoration: 'none' }}>
                <i className="fas fa-home"></i> Volver a la página principal
              </a>
            </Link>
            
            <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--color-texto-secundario)' }}>
                Si crees que esto es un error del sistema, por favor <Link href="/contacto">contáctanos</Link>.
            </p>
        </div>
      </div>
    </Layout>
  );
}