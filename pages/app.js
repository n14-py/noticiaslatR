import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { PLAY_STORE_URL, SITE_NAME, SITE_URL } from '../lib/site';
import { jsonLd } from '../lib/seo';

export const runtime = 'experimental-edge';

export default function AppPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Noticias LAT',
    operatingSystem: 'ANDROID',
    applicationCategory: 'NewsApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    url: PLAY_STORE_URL,
    downloadUrl: PLAY_STORE_URL,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    description: 'App oficial de Noticias.lat para Android: noticias de Latinoamérica, audionoticias, videos y alertas.',
  };

  return (
    <Layout>
      <Head>
        <title>App Noticias LAT para Android | {SITE_NAME}</title>
        <meta name="description" content="Descarga la app oficial de Noticias.lat en Google Play. Noticias de Latinoamérica, audionoticias, videos y alertas en tu teléfono." />
        <link rel="canonical" href={`${SITE_URL}/app`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      </Head>

      <div className="static-hero">
        <div className="container">
          <h1>La app oficial de Noticias.lat</h1>
          <p>La misma redacción de la web, pensada para el celular. Gratis en Google Play.</p>
          <a className="play-btn" href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-google-play"></i> Descargar en Google Play
          </a>
        </div>
      </div>

      <div className="container static-prose">
        <section>
          <h2>Qué hace la app</h2>
          <p>
            Noticias LAT es la aplicación oficial del sitio <strong>noticias.lat</strong>. No es un agregador
            genérico: abre las mismas notas que producimos en la web, con lectura rápida, audio y video.
          </p>
          <ul>
            <li>Portada y categorías de política, economía, tecnología, deportes, salud y más.</li>
            <li>Audionoticias para escuchar el reporte completo sin leer la pantalla.</li>
            <li>Videos de cobertura cuando la nota lo incluye.</li>
            <li>Alertas de última hora y acceso directo a cada artículo.</li>
            <li>Enlace profundo: si tienes la app instalada, las notas de la web pueden abrirse nativamente.</li>
          </ul>
        </section>

        <section>
          <h2>Por qué existe</h2>
          <p>
            Millones de personas en Latinoamérica se informan desde el teléfono. La app concentra el trabajo
            de nuestra redacción —verificar la fuente, reescribir la noticia y publicarla con el sello de
            Noticias.lat— en un formato móvil, con notificaciones y modo audio.
          </p>
        </section>

        <section>
          <h2>Cómo descargarla</h2>
          <ol>
            <li>Abre Google Play en tu Android.</li>
            <li>Busca <strong>Noticias LAT</strong> o entra al enlace oficial.</li>
            <li>Instala el paquete <code>com.noticiaslat.app</code>.</li>
          </ol>
          <p>
            El dominio noticias.lat está vinculado a la app mediante Digital Asset Links, para que el sistema
            reconozca que web y aplicación pertenecen al mismo medio.
          </p>
          <p>
            ¿Prefieres la versión de escritorio? Sigue en <Link href="/">la portada</Link> o escribe a
            nuestro equipo desde <Link href="/contacto">Contacto</Link>.
          </p>
        </section>
      </div>
    </Layout>
  );
}
