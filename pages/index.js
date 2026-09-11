import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { fetchArticles, setCacheHeaders, setUnavailable } from '../lib/api';
import { PLAY_STORE_URL, SITE_NAME, SITE_URL } from '../lib/site';

export const runtime = 'experimental-edge';

const PLACEHOLDER_IMG = '/images/placeholder.jpg';

export async function getServerSideProps(context) {
  const page = parseInt(context.query.page || '1', 10);
  const categoria = context.query.categoria || null;
  const pais = context.query.pais || null;
  const isFiltered = Boolean((categoria && categoria !== 'todos') || pais || page > 1);

  try {
    const { articles, pagination } = await fetchArticles({
      pagina: page,
      limite: 18,
      categoria,
      pais,
    });
    setCacheHeaders(context.res, isFiltered ? 180 : 300);
    return {
      props: {
        initialArticles: articles,
        pagination,
        currentCategory: categoria,
        currentCountry: pais,
        isFiltered,
      },
    };
  } catch (error) {
    setUnavailable(context.res, 90);
    return {
      props: {
        initialArticles: [],
        pagination: { currentPage: 1, totalPages: 1, totalArticles: 0 },
        currentCategory: categoria,
        currentCountry: pais,
        isFiltered,
        error: true,
      },
    };
  }
}

export default function Home({ initialArticles, pagination, currentCategory, currentCountry, isFiltered, error }) {
  const router = useRouter();
  const [bannerAd, setBannerAd] = useState(null);

  useEffect(() => {
    const loadAds = () => {
      fetch('https://api.noticias.lat/api/ads/active?plataforma=web')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && data.ads && data.ads.length) {
            const ad = data.ads[Math.floor(Math.random() * data.ads.length)];
            setBannerAd(ad);
          }
        })
        .catch(() => {});
    };
    const idle = typeof requestIdleCallback === 'function'
      ? requestIdleCallback
      : (cb) => setTimeout(cb, 1800);
    const id = idle(loadAds);
    return () => {
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(id);
    };
  }, []);

  const getPageTitle = () => {
    if (currentCategory && currentCategory !== 'todos') {
      return `Noticias de ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}`;
    }
    if (currentCountry) return `Noticias de ${String(currentCountry).toUpperCase()}`;
    return 'Últimas noticias de Latinoamérica';
  };

  const titleText = getPageTitle();
  const heroArticle = initialArticles[0] || null;
  const sideArticles = initialArticles.slice(1, 3);
  const listArticles = initialArticles.slice(3, 11);
  const gridArticles = initialArticles.slice(11);

  return (
    <Layout noindex={isFiltered}>
      <Head>
        <title>{`${titleText} | ${SITE_NAME}`}</title>
        <meta
          name="description"
          content="Noticias de Latinoamérica redactadas por Noticias.lat. Verificamos la fuente, reescribimos cada nota y la publicamos en texto, audio y video."
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content={`${titleText} | ${SITE_NAME}`} />
        <meta property="og:url" content={SITE_URL} />
      </Head>

      <div className="container main-content home-shell">
        <div className="home-kicker">
          <h1>{titleText}</h1>
          <span className="home-date">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {error || initialArticles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="news-portal-layout">
            {pagination.currentPage === 1 && heroArticle && (
              <div className="featured-section">
                <div className="main-hero">
                  <ArticleHero article={heroArticle} />
                </div>
                {sideArticles.length > 0 && (
                  <div className="side-hero">
                    {sideArticles.map((article) => (
                      <ArticleSide key={article._id} article={article} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {listArticles.length > 0 && (
              <div className="home-block">
                <h2 className="section-title">Más relevantes</h2>
                <div className="dense-list-grid">
                  {listArticles.map((article) => (
                    <ArticleDenseList key={article._id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {bannerAd && bannerAd.mediaUrl && (
              <div className="web-ad-box">
                <span>Anuncio</span>
                <a href={`https://api.noticias.lat/api/ads/click?adId=${bannerAd._id}&plataforma=web`} target="_blank" rel="noopener noreferrer">
                  {String(bannerAd.mediaUrl).toLowerCase().endsWith('.mp4') ? (
                    <video src={bannerAd.mediaUrl} muted playsInline preload="none" controls style={{ width: '100%', maxHeight: '220px' }} />
                  ) : (
                    <img src={bannerAd.mediaUrl} alt="" loading="lazy" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }} />
                  )}
                </a>
              </div>
            )}

            <section className="app-home-promo">
              <div>
                <span className="app-pill">App oficial</span>
                <h2>Noticias.lat en tu bolsillo</h2>
                <p>
                  La misma redacción, ahora en Android: alertas, audionoticias, videos y lectura offline.
                  Más de 50.000 notas propias en noticias.lat.
                </p>
                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="play-btn">
                  <i className="fab fa-google-play"></i> Descargar en Google Play
                </a>
              </div>
            </section>

            {gridArticles.length > 0 && (
              <div className="home-block home-block-split">
                <h2 className="section-title">Últimas actualizaciones</h2>
                <div className="bento-grid home-grid">
                  {gridArticles.map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              </div>
            )}

            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} query={router.query} />
          </div>
        )}
      </div>
    </Layout>
  );
}

function ArticleHero({ article }) {
  const imgUrl = article.imagen && article.imagen.startsWith('http') ? article.imagen : PLACEHOLDER_IMG;
  return (
    <div className="hero-card">
      <Link href={`/articulo/${article._id}`} className="card-image-wrapper hero-link">
        <img src={imgUrl} alt={article.titulo} fetchPriority="high" decoding="async" width="800" height="450" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
        <div className="hero-overlay">
          <div className="card-tags">
            <span className="tag">{article.categoria}</span>
            {article.youtubeId && article.videoProcessingStatus === 'complete' && <span className="tag tag-video">VIDEO</span>}
            {article.hasAudio && <span className="tag tag-audio">AUDIO</span>}
          </div>
          <h2>{article.titulo}</h2>
          <p>{article.descripcion}</p>
        </div>
      </Link>
    </div>
  );
}

function ArticleSide({ article }) {
  const imgUrl = article.imagen && article.imagen.startsWith('http') ? article.imagen : PLACEHOLDER_IMG;
  return (
    <article className="side-card">
      <Link href={`/articulo/${article._id}`} className="side-card-image">
        <img src={imgUrl} alt={article.titulo} loading="lazy" decoding="async" width="400" height="180" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
      </Link>
      <div className="side-card-body">
        <span className="kicker">{article.categoria}</span>
        <h3><Link href={`/articulo/${article._id}`}>{article.titulo}</Link></h3>
        <p>{article.descripcion ? `${article.descripcion.substring(0, 90)}…` : ''}</p>
      </div>
    </article>
  );
}

function ArticleDenseList({ article }) {
  const imgUrl = article.imagen && article.imagen.startsWith('http') ? article.imagen : PLACEHOLDER_IMG;
  const fecha = article.fecha ? new Date(article.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : '';
  return (
    <article className="dense-item">
      <Link href={`/articulo/${article._id}`} className="dense-thumb">
        <img src={imgUrl} alt={article.titulo} loading="lazy" decoding="async" width="120" height="100" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
      </Link>
      <div>
        <div className="dense-meta">
          <span>{article.categoria}</span>
          <span>{fecha}</span>
        </div>
        <h3><Link href={`/articulo/${article._id}`}>{article.titulo}</Link></h3>
        <p>{article.descripcion}</p>
      </div>
    </article>
  );
}

function ArticleCard({ article }) {
  const imgUrl = article.imagen && article.imagen.startsWith('http') ? article.imagen : PLACEHOLDER_IMG;
  const fecha = article.fecha ? new Date(article.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
  return (
    <article className="article-card">
      <Link href={`/articulo/${article._id}`} className="card-image-wrapper" style={{ height: '160px', paddingTop: 0 }}>
        <img src={imgUrl} alt={article.titulo} loading="lazy" decoding="async" width="320" height="160" style={{ position: 'static', height: '160px' }} onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
      </Link>
      <div className="card-content">
        <div className="card-tags">
          <span className="tag">{article.categoria}</span>
        </div>
        <h3 className="card-title"><Link href={`/articulo/${article._id}`}>{article.titulo}</Link></h3>
        <p className="card-excerpt">{article.descripcion ? `${article.descripcion.substring(0, 90)}…` : ''}</p>
        <div className="card-meta">{fecha}</div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="no-articles-message">
      <h3>Estamos actualizando el feed</h3>
      <p>Vuelve en un momento o entra a la portada.</p>
      <Link href="/" className="play-btn">Recargar portada</Link>
    </div>
  );
}

function Pagination({ currentPage, totalPages, query }) {
  if (totalPages <= 1) return null;
  const createPageLink = (page) => {
    const params = new URLSearchParams();
    Object.keys(query || {}).forEach((key) => {
      if (key !== 'page' && query[key]) params.append(key, query[key]);
    });
    if (page > 1) params.set('page', page);
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  };
  return (
    <div className="pagination-container">
      {currentPage > 1 ? (
        <Link href={createPageLink(currentPage - 1)} className="pagination-btn">Anterior</Link>
      ) : (
        <span className="pagination-btn disabled">Anterior</span>
      )}
      <span className="page-info">Página {currentPage} de {totalPages}</span>
      {currentPage < totalPages ? (
        <Link href={createPageLink(currentPage + 1)} className="pagination-btn">Siguiente</Link>
      ) : (
        <span className="pagination-btn disabled">Siguiente</span>
      )}
    </div>
  );
}
