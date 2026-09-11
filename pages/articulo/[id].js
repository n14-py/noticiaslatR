import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import AppBanner from '../../components/AppBanner';
import { fetchArticleById, fetchRecommended, setCacheHeaders, setUnavailable } from '../../lib/api';
import { SITE_NAME, SITE_URL } from '../../lib/site';
import { jsonLd, newsArticleSchema } from '../../lib/seo';

export const runtime = 'experimental-edge';

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const article = await fetchArticleById(id);
    if (!article || !article._id) {
      return { notFound: true };
    }
    const recommended = await fetchRecommended(id, article.categoria);
    setCacheHeaders(context.res, 1800);
    return { props: { article, recommended } };
  } catch (error) {
    if (error.status === 404 || error.status === 400 || error.status === 410) {
      if (context.res) {
        context.res.statusCode = 404;
        context.res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        context.res.setHeader('Cache-Control', 'public, s-maxage=600');
      }
      return { props: { article: null, recommended: [], missing: true } };
    }
    setUnavailable(context.res, 120);
    return { props: { article: null, recommended: [], unavailable: true } };
  }
}

export default function ArticlePage({ article, recommended, unavailable, missing }) {
  const [progress, setProgress] = useState(0);
  const [bannerAd, setBannerAd] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  useEffect(() => {
    const idle = typeof requestIdleCallback === 'function' ? requestIdleCallback : (cb) => setTimeout(cb, 2000);
    idle(() => {
      fetch('https://api.noticias.lat/api/ads/active?plataforma=web')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success && data.ads && data.ads.length) {
            setBannerAd(data.ads[Math.floor(Math.random() * data.ads.length)]);
          }
        })
        .catch(() => {});
    });
  }, []);

  if (missing) {
    return (
      <Layout noindex>
        <Head>
          <title>Noticia no encontrada | {SITE_NAME}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="container static-page-container" style={{ textAlign: 'center' }}>
          <h1>Esta noticia ya no existe</h1>
          <p>La URL no está en nuestro archivo. Google no debe volver a rastrearla.</p>
          <Link href="/" className="play-btn">Volver a la portada</Link>
        </div>
      </Layout>
    );
  }

  if (unavailable || !article) {
    return (
      <Layout noindex>
        <Head>
          <title>Contenido temporalmente no disponible | {SITE_NAME}</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="container static-page-container" style={{ textAlign: 'center' }}>
          <h1>Estamos recuperando esta nota</h1>
          <p>El artículo existe, pero el servidor tardó en responder. Prueba de nuevo en un momento.</p>
          <Link href="/" className="play-btn">Volver a la portada</Link>
        </div>
      </Layout>
    );
  }

  const fechaFormat = new Date(article.fecha).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const imgUrl = article.imagen && article.imagen.startsWith('http') ? article.imagen : '/images/placeholder.jpg';
  const canonical = `${SITE_URL}/articulo/${article._id}`;
  const paragraphs = article.articuloGenerado
    ? article.articuloGenerado.split('\n').filter((p) => p.trim() !== '')
    : [article.descripcion];
  const sidebarVisual = recommended.slice(0, 5);
  const sidebarList = recommended.slice(5, 9);
  const bottomGrid = recommended.slice(0, 6);

  return (
    <Layout>
      <Head>
        <title>{`${article.titulo} | ${SITE_NAME}`}</title>
        <meta name="description" content={article.descripcion} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={article.titulo} />
        <meta property="og:description" content={article.descripcion} />
        <meta property="og:image" content={imgUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta name="author" content="Redacción Noticias.lat" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(newsArticleSchema(article)) }} />
      </Head>

      <div className="reading-progress-container">
        <div className="reading-progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="article-layout">
        <article className="article-main-content">
          <div className="article-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <Link href={`/?categoria=${article.categoria}`} className="article-category-badge">
              {article.categoria}
            </Link>
            <h1 className="article-title-main">{article.titulo}</h1>
            <p className="article-dek">{article.descripcion}</p>
            <div className="article-meta-row" style={{ justifyContent: 'flex-start', borderTop: 'none', padding: '0 0 1.2rem 0', marginBottom: 0 }}>
              <div className="meta-item"><i className="far fa-calendar-alt"></i><span>{fechaFormat}</span></div>
              <div className="meta-item"><i className="fas fa-globe-americas"></i><span>{article.pais ? article.pais.toUpperCase() : 'LATAM'}</span></div>
              <div className="meta-item"><span className="source-badge">{getSourceName(article)}</span></div>
            </div>
          </div>

          {article.audioUrl && (
            <div className="podcast-player-section article-audio">
              <div className="audio-head">
                <i className="fas fa-headphones-alt"></i>
                <div>
                  <h3>Audionoticia</h3>
                  <p>Escucha el reporte completo</p>
                </div>
              </div>
              <audio controls src={article.audioUrl} preload="none">Tu navegador no soporta audio.</audio>
            </div>
          )}

          <figure className="article-hero-image">
            <img
              src={imgUrl}
              alt={article.textoImagen || article.titulo}
              fetchPriority="high"
              decoding="async"
              width="800"
              height="450"
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
            />
            {article.textoImagen && <figcaption>{article.textoImagen}</figcaption>}
          </figure>

          {article.aiSummary && (
            <div className="ai-summary-box">
              <button
                type="button"
                className="summary-toggle"
                onClick={() => setShowSummary((open) => !open)}
                aria-expanded={showSummary}
              >
                <i className="fas fa-key"></i>
                {showSummary ? 'Ocultar resumen' : 'Leer resumen'}
              </button>
              {showSummary && (
                <div className="summary-panel">
                  <div className="ai-summary-header">Puntos clave</div>
                  <p>{article.aiSummary}</p>
                </div>
              )}
            </div>
          )}

          <div className="article-body-content">
            {paragraphs.map((p, index) => {
              const isMiddle = index === Math.floor(paragraphs.length / 2);
              return (
                <div key={index}>
                  <p>{p}</p>
                  {isMiddle && bannerAd && bannerAd.mediaUrl && (
                    <div className="web-ad-box">
                      <span>Patrocinado</span>
                      <a href={`https://api.noticias.lat/api/ads/click?adId=${bannerAd._id}&plataforma=web`} target="_blank" rel="noopener noreferrer">
                        {String(bannerAd.mediaUrl).toLowerCase().endsWith('.mp4') ? (
                          <video src={bannerAd.mediaUrl} muted playsInline preload="none" controls style={{ width: '100%', maxHeight: '220px' }} />
                        ) : (
                          <img src={bannerAd.mediaUrl} alt="" loading="lazy" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }} />
                        )}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {article.youtubeId && (
            <div className="youtube-video-container">
              <h3>
                <i className="fab fa-youtube" style={{ color: '#ff0000' }}></i> Cobertura en video
              </h3>
              <div className="video-responsive-wrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${article.youtubeId}?autoplay=0&rel=0`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video de la noticia"
                ></iframe>
              </div>
            </div>
          )}

          {article.enlaceOriginal && (
            <div className="article-source-link">
              <p>
                Fuente consultada:{' '}
                <a href={article.enlaceOriginal} target="_blank" rel="noopener noreferrer">
                  {getSourceName(article)}
                </a>
              </p>
            </div>
          )}

          <div className="editorial-note">
            <p>
              Esta nota fue producida por la redacción de Noticias.lat: verificamos la información en fuentes
              públicas y la reescribimos con nuestro criterio editorial. No republicamos textos de terceros.
            </p>
          </div>

          <div className="share-section">
            <h4>Compartir esta noticia</h4>
            <div className="share-buttons-grid">
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.titulo} ${canonical}`)}`} target="_blank" rel="noreferrer" className="share-btn-whatsapp share-chip"><i className="fab fa-whatsapp"></i> WhatsApp</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.titulo)}&url=${encodeURIComponent(canonical)}`} target="_blank" rel="noreferrer" className="share-btn-twitter share-chip"><i className="fab fa-twitter"></i> X</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`} target="_blank" rel="noreferrer" className="share-btn-facebook share-chip"><i className="fab fa-facebook-f"></i> Facebook</a>
            </div>
          </div>
        </article>

        <aside className="article-sidebar">
          <div className="sticky-container" style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sidebarVisual.length > 0 && (
              <div className="sidebar-widget">
                <h3 className="sidebar-title">Destacados</h3>
                <div className="sidebar-news-list">
                  {sidebarVisual.map((rec) => (
                    <Link href={`/articulo/${rec._id}`} key={rec._id} className="sidebar-news-item">
                      <img src={(rec.imagen && rec.imagen.startsWith('http')) ? rec.imagen : '/images/placeholder.jpg'} alt="" loading="lazy" onError={(e) => { e.target.src = '/images/placeholder.jpg'; }} />
                      <div>
                        <span className="kicker">{rec.categoria}</span>
                        <h4>{rec.titulo}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {sidebarList.length > 0 && (
              <div className="sidebar-widget">
                <h3 className="sidebar-title">Lo último</h3>
                <ul className="plain-news">
                  {sidebarList.map((rec) => (
                    <li key={rec._id}>
                      <Link href={`/articulo/${rec._id}`}>{rec.titulo}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      {bottomGrid.length > 0 && (
        <section className="recommended-section">
          <div className="container">
            <h2 className="recommended-title">Te podría interesar</h2>
            <div className="bottom-bento-grid">
              {bottomGrid.map((rec) => (
                <article className="bento-card" key={rec._id}>
                  <Link href={`/articulo/${rec._id}`} className="bento-image-wrapper">
                    <img src={(rec.imagen && rec.imagen.startsWith('http')) ? rec.imagen : '/images/placeholder.jpg'} alt="" loading="lazy" />
                    <div className="bento-category-tag">{rec.categoria}</div>
                  </Link>
                  <div className="bento-content">
                    <h3><Link href={`/articulo/${rec._id}`}>{rec.titulo}</Link></h3>
                    <p>{rec.descripcion}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <AppBanner />
    </Layout>
  );
}

function getSourceName(article) {
  if (article.fuente) return article.fuente;
  if (article.enlaceOriginal) {
    try {
      return new URL(article.enlaceOriginal).hostname.replace(/^www\./, '');
    } catch {
      return 'Agencia de noticias';
    }
  }
  return 'Redacción';
}
