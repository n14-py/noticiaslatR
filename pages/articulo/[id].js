import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';

// Configuracion Edge estricta exigida
export const runtime = 'experimental-edge';

export async function getServerSideProps(context) {
    // CACHÉ DE 24 HORAS (86400 segundos) - Actúa como archivo HTML estático en CDN
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=86400, stale-while-revalidate=86400'
    );

    const { id } = context.params;
    const API_URL = 'https://api.noticias.lat';

    try {
        // 1. Obtener el artículo principal
        const res = await fetch(`${API_URL}/api/article/${id}`);
        if (!res.ok) {
            return { notFound: true };
        }
        const article = await res.json();

        // 2. Obtener recomendaciones para la barra lateral y el pie (excluyendo el artículo actual)
        const recRes = await fetch(`${API_URL}/api/articles/recommended?sitio=noticias.lat&categoria=${article.categoria}&excludeId=${id}`);
        const recommended = recRes.ok ? await recRes.json() : [];

        return {
            props: { 
                article, 
                recommended 
            }
        };
    } catch (error) {
        console.error("Error cargando artículo:", error);
        return { notFound: true };
    }
}

export default function ArticlePage({ article, recommended }) {
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    // Barra de progreso de lectura
    useEffect(() => {
        const updateProgress = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const maxScroll = documentHeight - windowHeight;
            const currentProgress = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0;
            setProgress(currentProgress);
        };

        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    if (!article) return null;

    const fechaFormat = new Date(article.fecha).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const imgUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : '/images/placeholder.jpg';
    
    // Separar recomendaciones: 4 para el sidebar sticky, el resto para abajo
    const sidebarRecommended = recommended.slice(0, 4);
    const bottomRecommended = recommended.slice(4, 10);

    // Formatear el contenido en párrafos
    const paragraphs = article.articuloGenerado 
        ? article.articuloGenerado.split('\n').filter(p => p.trim() !== '') 
        : [article.descripcion];

    return (
        <Layout>
            <Head>
                <title>{`${article.titulo} | Noticias.lat`}</title>
                <meta name="description" content={article.descripcion} />
                <meta property="og:title" content={article.titulo} />
                <meta property="og:description" content={article.descripcion} />
                <meta property="og:image" content={imgUrl} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href={`https://www.noticias.lat/articulo/${article._id}`} />
            </Head>

            {/* BARRA DE PROGRESO DE LECTURA SUPERIOR */}
            <div className="reading-progress-container">
                <div className="reading-progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="article-layout">
                {/* COLUMNA IZQUIERDA: CONTENIDO PRINCIPAL */}
                <article className="article-main-content">
                    
                    <div className="article-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                        <Link href={`/?categoria=${article.categoria}`} className="article-category-badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                            {article.categoria}
                        </Link>
                        
                        <h1 className="article-title-main" style={{ fontSize: '2.5rem', lineHeight: '1.2', fontWeight: '900', margin: '0 0 1rem 0' }}>
                            {article.titulo}
                        </h1>
                        
                        <p style={{ fontSize: '1.2rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.5rem', fontWeight: '500' }}>
                            {article.descripcion}
                        </p>

                        <div className="article-meta-row" style={{ justifyContent: 'flex-start', borderTop: 'none', padding: '0 0 1.5rem 0', marginBottom: '0', borderBottom: '1px solid #e2e8f0' }}>
                            <div className="meta-item">
                                <i className="far fa-calendar-alt"></i>
                                <span>{fechaFormat}</span>
                            </div>
                            <div className="meta-item">
                                <i className="fas fa-globe-americas"></i>
                                <span>{article.pais ? article.pais.toUpperCase() : 'LATAM'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="source-badge">Redacción IA</span>
                            </div>
                        </div>
                    </div>

                    {/* REPRODUCTOR DE PODCAST RECONSTRUIDO DESDE CERO */}
                    {article.audioUrl && (
                        <div className="podcast-player-section" style={{ marginBottom: '2.5rem', background: 'linear-gradient(145deg, #1e293b, #0f172a)', borderRadius: '16px', padding: '20px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ width: '50px', height: '50px', background: 'var(--color-primario)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                    <i className="fas fa-headphones-alt"></i>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Audionoticia</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Escucha el reporte completo</p>
                                </div>
                            </div>
                            <audio 
                                ref={audioRef}
                                controls 
                                src={article.audioUrl} 
                                style={{ width: '100%', height: '45px', outline: 'none', borderRadius: '8px' }}
                                preload="metadata"
                            >
                                Tu navegador no soporta el elemento de audio.
                            </audio>
                        </div>
                    )}

                    <figure className="article-hero-image" style={{ marginBottom: '2.5rem' }}>
                        <img 
                            src={imgUrl} 
                            alt={article.textoImagen || article.titulo} 
                            style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', objectFit: 'cover', maxHeight: '500px' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                        />
                        {article.textoImagen && (
                            <figcaption style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '10px', fontStyle: 'italic' }}>
                                {article.textoImagen}
                            </figcaption>
                        )}
                    </figure>

                    {/* BLOQUE AD SENSE INTERNO 1 */}
                    <div className="ads-placeholder" style={{ margin: '2rem 0', padding: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Publicidad</span>
                        {/* Insertar script de AdSense aquí */}
                    </div>

                    {article.aiSummary && (
                        <div className="ai-summary-box" style={{ marginBottom: '2.5rem' }}>
                            <div className="ai-summary-header">
                                <i className="fas fa-robot"></i> Resumen Ejecutivo de la IA
                            </div>
                            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6', color: '#1e293b' }}>
                                {article.aiSummary}
                            </p>
                        </div>
                    )}

                    <div className="article-body-content" style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#334155' }}>
                        {paragraphs.map((p, index) => {
                            // Inserción de publicidad dinámica o citas destacadas cada 3 párrafos
                            if (index > 0 && index % 3 === 0) {
                                return (
                                    <div key={index}>
                                        <div className="ads-placeholder-inline" style={{ margin: '2rem 0', height: '90px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                                            [Espacio AdSense]
                                        </div>
                                        <p style={{ marginBottom: '1.5rem' }}>{p}</p>
                                    </div>
                                );
                            }
                            return <p key={index} style={{ marginBottom: '1.5rem' }}>{p}</p>;
                        })}
                    </div>

                    {article.youtubeId && article.videoProcessingStatus === 'complete' && (
                        <div className="youtube-video-container" style={{ marginTop: '3rem', borderTop: '2px solid #f1f5f9', paddingTop: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-texto-titulos)' }}>
                                <i className="fab fa-youtube" style={{ color: '#ff0000' }}></i> Cobertura en Video
                            </h3>
                            <div className="video-responsive-wrapper" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                                <iframe 
                                    src={`https://www.youtube.com/embed/${article.youtubeId}?autoplay=0&rel=0`} 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    title="Video de la noticia"
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {article.enlaceOriginal && (
                        <div className="article-source-link" style={{ marginTop: '3rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--color-primario)' }}>
                            <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px' }}>Fuente Original</span>
                            <a href={article.enlaceOriginal} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primario)', fontWeight: '600', textDecoration: 'none', wordBreak: 'break-all' }}>
                                {article.enlaceOriginal} <i className="fas fa-external-link-alt" style={{ fontSize: '0.8rem', marginLeft: '5px' }}></i>
                            </a>
                        </div>
                    )}

                    <div className="share-section" style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--color-texto-titulos)' }}>Compartir esta noticia</h4>
                        <div className="share-buttons-grid" style={{ display: 'flex', gap: '10px' }}>
                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.titulo + ' https://www.noticias.lat/articulo/' + article._id)}`} target="_blank" rel="noreferrer" className="share-btn-whatsapp" style={{ padding: '10px 20px', borderRadius: '50px', color: 'white', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fab fa-whatsapp"></i> WhatsApp
                            </a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.titulo)}&url=${encodeURIComponent('https://www.noticias.lat/articulo/' + article._id)}`} target="_blank" rel="noreferrer" className="share-btn-twitter" style={{ padding: '10px 20px', borderRadius: '50px', color: 'white', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fab fa-twitter"></i> Twitter
                            </a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.noticias.lat/articulo/' + article._id)}`} target="_blank" rel="noreferrer" className="share-btn-facebook" style={{ padding: '10px 20px', borderRadius: '50px', color: 'white', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fab fa-facebook-f"></i> Facebook
                            </a>
                        </div>
                    </div>
                </article>

                {/* COLUMNA DERECHA: STICKY SIDEBAR */}
                <aside className="article-sidebar">
                    <div className="sticky-container" style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* WIDGET RECOMENDADOS LATERAL */}
                        <div className="sidebar-widget">
                            <h3 className="sidebar-title">Recomendados</h3>
                            <div className="sidebar-news-list">
                                {sidebarRecommended.length > 0 ? sidebarRecommended.map(rec => (
                                    <Link href={`/articulo/${rec._id}`} key={rec._id} className="sidebar-news-item" style={{ textDecoration: 'none' }}>
                                        <img 
                                            src={(rec.imagen && rec.imagen.startsWith('http')) ? rec.imagen : '/images/placeholder.jpg'} 
                                            alt={rec.titulo} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                                        />
                                        <h4>{rec.titulo}</h4>
                                    </Link>
                                )) : (
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>No hay recomendaciones en esta categoría.</p>
                                )}
                            </div>
                        </div>

                        {/* WIDGET PUBLICIDAD LATERAL (AdSense) */}
                        <div className="sidebar-widget" style={{ padding: '0', overflow: 'hidden', background: '#f8fafc', border: '1px dashed #cbd5e1', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Anuncio</span>
                        </div>

                    </div>
                </aside>
            </div>

            {/* SECCIÓN INFERIOR: MÁS RECOMENDADOS EN GRILLA */}
            {bottomRecommended.length > 0 && (
                <section className="recommended-section" style={{ background: '#f8fafc', padding: '4rem 15px', marginTop: '4rem', borderTop: '1px solid #e2e8f0' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h2 className="recommended-title" style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', textAlign: 'center', color: 'var(--color-texto-titulos)' }}>Más noticias que te pueden interesar</h2>
                        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                            {bottomRecommended.map(rec => (
                                <div className="article-card" key={rec._id} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                    <Link href={`/articulo/${rec._id}`} className="card-image-wrapper" style={{ height: '160px', position: 'relative', display: 'block' }}>
                                        <img 
                                            src={(rec.imagen && rec.imagen.startsWith('http')) ? rec.imagen : '/images/placeholder.jpg'} 
                                            alt={rec.titulo} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                                        />
                                    </Link>
                                    <div className="card-content" style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--color-primario)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>{rec.categoria}</span>
                                        <h3 style={{ fontSize: '1.05rem', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                                            <Link href={`/articulo/${rec._id}`} style={{ color: 'var(--color-texto-titulos)', textDecoration: 'none' }}>
                                                {rec.titulo}
                                            </Link>
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {rec.descripcion}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <style jsx global>{`
                .article-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 2rem auto;
                    padding: 0 15px;
                }
                @media (min-width: 1024px) {
                    .article-layout {
                        grid-template-columns: 1fr 350px;
                        gap: 4rem;
                        padding: 0;
                    }
                }
                .sidebar-news-item h4 {
                    font-size: 0.95rem;
                    line-height: 1.3;
                    margin: 0;
                    color: var(--color-texto-titulos);
                    transition: color 0.2s;
                }
                .sidebar-news-item:hover h4 {
                    color: var(--color-primario);
                }
                audio::-webkit-media-controls-panel {
                    background-color: #f1f5f9;
                }
                audio::-webkit-media-controls-play-button {
                    background-color: var(--color-primario);
                    border-radius: 50%;
                }
            `}</style>
        </Layout>
    );
}