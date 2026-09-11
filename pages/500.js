import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Custom500() {
  return (
    <Layout noindex>
      <Head>
        <title>Error del servidor | Noticias.lat</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="container">
        <div className="static-page-container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h1>Estamos resolviendo un fallo</h1>
          <p>El servidor no pudo completar esta solicitud. Vuelve a intentarlo en unos minutos.</p>
          <Link href="/" className="play-btn">Ir a la portada</Link>
        </div>
      </div>
    </Layout>
  );
}
