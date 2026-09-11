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

export default function JuegosGone() {
  return (
    <Layout noindex>
      <Head>
        <title>Sección eliminada | Noticias.lat</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="container static-page-container" style={{ textAlign: 'center' }}>
        <h1>Esta sección se eliminó</h1>
        <p>
          La zona de juegos ya no forma parte de Noticias.lat. El contenido se retiró de forma permanente
          para concentrar el sitio en periodismo, podcast y la app oficial.
        </p>
        <Link href="/" className="play-btn">Ir a las noticias</Link>
      </div>
    </Layout>
  );
}
