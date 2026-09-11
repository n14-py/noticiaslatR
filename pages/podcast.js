import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { fetchArticles, setCacheHeaders, setUnavailable } from '../lib/api';
import { COUNTRIES, SITE_NAME, SITE_URL } from '../lib/site';

export const runtime = 'experimental-edge';

const PLACEHOLDER = '/images/placeholder.jpg';

export async function getServerSideProps(context) {
  const pagina = parseInt(context.query.pagina || '1', 10);
  const pais = context.query.pais || null;
  try {
    const { articles, pagination } = await fetchArticles({
      pagina,
      limite: 24,
      pais,
      hasAudio: true,
    });
    setCacheHeaders(context.res, 600);
    return {
      props: {
        items: articles,
        pagination: { paginaActual: pagination.currentPage, totalPaginas: pagination.totalPages },
        pais,
      },
    };
  } catch {
    setUnavailable(context.res, 90);
    return { props: { items: [], pagination: { paginaActual: 1, totalPaginas: 1 }, pais, error: true } };
  }
}

export default function PodcastPage({ items, pagination, pais, error }) {
  const router = useRouter();
  const title = pais ? `Audionoticias de ${pais}` : 'Podcast y audionoticias';

  return (
    <Layout>
      <Head>
        <title>{`${title} | ${SITE_NAME}`}</title>
        <meta name="description" content="Escucha las noticias de Latinoamérica en audio. Audionoticias narradas a partir de la redacción propia de Noticias.lat." />
        <link rel="canonical" href={`${SITE_URL}/podcast`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'PodcastSeries',
              name: 'Noticias.lat Podcast',
              url: `${SITE_URL}/podcast`,
              description: 'Audionoticias de Latinoamérica producidas por Noticias.lat.',
            }),
          }}
        />
      </Head>

      <div className="container main-content podcast-page">
        <header className="static-hero podcast-hero">
          <h1>{title}</h1>
          <p>Reportes completos en audio, listos para escuchar en el celular, en el auto o desde la app de Android.</p>
        </header>

        <div className="filters-scroll-container" style={{ marginTop: '1.5rem' }}>
          <button type="button" className={`filter-chip ${!pais ? 'active' : ''}`} onClick={() => router.push('/podcast')}>Todas</button>
          {COUNTRIES.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`filter-chip ${pais === item.code ? 'active' : ''}`}
              onClick={() => router.push(`/podcast?pais=${item.code}`)}
            >
              {item.flag} {item.name}
            </button>
          ))}
        </div>

        {error ? (
          <p className="no-articles-message">No pudimos cargar el podcast ahora. Inténtalo de nuevo.</p>
        ) : items.length === 0 ? (
          <div className="no-articles-message">
            <h3>No hay audionoticias en este filtro</h3>
            <Link href="/podcast" className="play-btn">Ver catálogo completo</Link>
          </div>
        ) : (
          <div className="stations-grid podcast-grid">
            {items.map((article) => (
              <article className="podcast-native-card" key={article._id}>
                <Link href={`/articulo/${article._id}`} className="podcast-card-top">
                  <img src={(article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER} alt="" loading="lazy" />
                  <div>
                    <span className="kicker">{article.categoria}</span>
                    <h3>{article.titulo}</h3>
                    <p>{article.descripcion}</p>
                  </div>
                </Link>
                <div className="podcast-card-audio">
                  {article.audioUrl ? (
                    <audio controls src={article.audioUrl} preload="none">Audio no soportado</audio>
                  ) : (
                    <span>Audio no disponible</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {pagination.totalPaginas > 1 && (
          <div className="pagination-container">
            {pagination.paginaActual > 1 ? (
              <Link href={`/podcast?${pais ? `pais=${pais}&` : ''}pagina=${pagination.paginaActual - 1}`} className="pagination-btn">Anterior</Link>
            ) : <span className="pagination-btn disabled">Anterior</span>}
            <span className="page-info">Página {pagination.paginaActual} de {pagination.totalPaginas}</span>
            {pagination.paginaActual < pagination.totalPaginas ? (
              <Link href={`/podcast?${pais ? `pais=${pais}&` : ''}pagina=${pagination.paginaActual + 1}`} className="pagination-btn">Siguiente</Link>
            ) : <span className="pagination-btn disabled">Siguiente</span>}
          </div>
        )}
      </div>
    </Layout>
  );
}
