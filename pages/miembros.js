import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export const runtime = 'experimental-edge';

export async function getServerSideProps({ res }) {
  if (res) {
    res.statusCode = 410;
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Cache-Control', 'public, s-maxage=86400');
  }
  return { props: {} };
}

export default function MiembrosGone() {
  return (
    <Layout noindex>
      <Head>
        <title>Sección eliminada | Noticias.lat</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="container static-page-container" style={{ textAlign: 'center' }}>
        <h1>El portal para publicar noticias ya no existe</h1>
        <p>
          Dejamos de aceptar publicaciones de terceros. Toda la cobertura de Noticias.lat la produce
          nuestra redacción. Si tienes una corrección o una nota de prensa, usa Contacto.
        </p>
        <Link href="/contacto" className="play-btn">Contactar redacción</Link>
      </div>
    </Layout>
  );
}
