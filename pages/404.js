import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Custom404() {
  return (
    <Layout noindex>
      <Head>
        <title>Error 404 — Página no encontrada | Noticias.lat</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.noticias.lat/404" />
      </Head>
      <div className="container">
        <div className="static-page-container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h1 style={{ fontSize: '4rem', color: 'var(--color-primario)', marginBottom: 0 }}>404</h1>
          <h2>Esta página ya no existe</h2>
          <p>
            La URL no está en nuestro archivo. Puede haberse eliminado o el enlace está mal escrito.
            Google no debe volver a indexarla.
          </p>
          <Link href="/" className="play-btn">Volver a la portada</Link>
          <p style={{ marginTop: '2rem' }}>
            Si crees que es un error, <Link href="/contacto">contáctanos</Link>.
          </p>
        </div>
      </div>
    </Layout>
  );
}
