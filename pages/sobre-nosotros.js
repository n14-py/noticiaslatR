import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { PLAY_STORE_URL, SITE_EMAIL, SITE_NAME, SITE_URL } from '../lib/site';

export const runtime = 'experimental-edge';

export default function SobreNosotros() {
  return (
    <Layout>
      <Head>
        <title>Quiénes somos — Redacción de {SITE_NAME}</title>
        <meta name="description" content="Noticias.lat es un medio digital de Latinoamérica. Verificamos la fuente, reescribimos cada nota y la publicamos en la web y en la app de Android." />
        <link rel="canonical" href={`${SITE_URL}/sobre-nosotros`} />
      </Head>

      <div className="static-hero">
        <div className="container">
          <h1>Quiénes somos</h1>
          <p>Un medio digital de Latinoamérica y el mundo. Producimos unas 300 noticias al día. Más de 500 mil personas nos ven cada mes en YouTube.</p>
        </div>
      </div>

      <div className="container static-prose">
        <section>
          <h2>La redacción</h2>
          <p>
            <strong>Noticias.lat</strong> es operado por LFAF Tech. Nacimos para informar a lectores de habla
            hispana en Argentina, México, Colombia, Chile, Perú, Centroamérica, el Caribe y el resto de la región,
            con un criterio editorial propio: rapidez, claridad y atribución.
          </p>
          <p>
            No copiamos y pegamos agencias. El proceso es siempre el mismo: localizamos un hecho de interés
            público, <strong>verificamos la fuente</strong>, contrastamos datos esenciales y
            <strong> reescribimos la noticia con el toque de Noticias.lat</strong> —contexto, síntesis y un
            texto original publicado en este dominio.
          </p>
        </section>

        <section>
          <h2>Cómo producimos cada nota</h2>
          <ol>
            <li>Monitoreo de hechos de interés público en toda Latinoamérica y el mundo.</li>
            <li>Verificación de la fuente original y de datos comprobables (fechas, cifras, declaraciones).</li>
            <li>Redacción propia: el artículo que lees en noticias.lat no es el texto de terceros.</li>
            <li>Edición de titular, bajada, categoría y país para que el lector ubique la noticia.</li>
            <li>Cuando aporta valor, producimos audionoticia y video para la web y para la app.</li>
          </ol>
          <p>
            Publicamos unas <strong>300 noticias al día</strong> para Latinoamérica y el mundo. El archivo de
            noticias.lat supera las <strong>50.000 notas</strong> propias: cada URL es una pieza elaborada para
            este medio.
          </p>
          <p>
            En YouTube nos siguen más de <strong>500 mil personas al mes</strong> a través de nuestros canales
            (<a href="https://www.youtube.com/@Noticiaslat-3" target="_blank" rel="noreferrer">Noticiaslat-3</a>,{' '}
            <a href="https://www.youtube.com/@noticias-lat" target="_blank" rel="noreferrer">noticias-lat</a>,{' '}
            <a href="https://www.youtube.com/@NoticiasLat-2" target="_blank" rel="noreferrer">NoticiasLat-2</a> y{' '}
            <a href="https://www.youtube.com/@NoticiasLat1" target="_blank" rel="noreferrer">NoticiasLat1</a>).
            La misma cobertura llega a la web, al podcast y a la app.
          </p>
        </section>

        <section>
          <h2>Tecnología al servicio del periodismo</h2>
          <p>
            Usamos herramientas de voz y video para que la misma nota pueda leerse, escucharse o verse. Eso no
            reemplaza la verificación ni la reescritura. La responsabilidad editorial de cada publicación es de
            Noticias.lat.
          </p>
          <div className="static-cards">
            <article className="static-card">
              <h3>Texto original</h3>
              <p>Cada artículo se redacta para este sitio. No republicamos cables completos.</p>
            </article>
            <article className="static-card">
              <h3>Audio</h3>
              <p>Las audionoticias permiten informar sin mirar la pantalla, desde la web o la app.</p>
            </article>
            <article className="static-card">
              <h3>Video</h3>
              <p>Cuando hay cobertura audiovisual, la incrustamos en la misma nota verificada.</p>
            </article>
          </div>
        </section>

        <section>
          <h2>La app oficial</h2>
          <p>
            Publicamos también en Android. La app <strong>Noticias LAT</strong> está en Google Play
            (<code>com.noticiaslat.app</code>) y replica el trabajo de la redacción: portada, categorías,
            alertas y audionoticias. Más detalle en la página <Link href="/app">App Android</Link>.
          </p>
          <p>
            <a className="play-btn" href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              Descargar en Google Play
            </a>
          </p>
        </section>

        <section>
          <h2>Independencia, correcciones y publicidad</h2>
          <p>
            Las opiniones de fuentes citadas no son necesariamente las de este medio. Si detectas un error de
            hecho, escríbenos a <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>: corregimos con transparencia.
          </p>
          <p>
            El sitio se financia con publicidad, incluida Google AdSense, y con anuncios propios claramente
            etiquetados. La publicidad no decide qué se publica ni cómo se titula una noticia.
          </p>
        </section>

        <section>
          <h2>Contacto de prensa y comercial</h2>
          <p>
            Para notas de prensa, derechos, correcciones o publicidad: <Link href="/contacto">página de contacto</Link> o {SITE_EMAIL}.
          </p>
        </section>
      </div>
    </Layout>
  );
}
