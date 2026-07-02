import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';

// Configuracion Edge estricta exigida por Cloudflare Pages
export const runtime = 'experimental-edge';

export async function getServerSideProps(context) {
    // CACHÉ DE CDN CLOUDFLARE: Esto convierte la respuesta en HTML guardado en los nodos Edge por 24hs.
    // Si la API se cae, Cloudflare seguirá sirviendo el HTML congelado sin procesar el servidor.
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=86400, stale-while-revalidate=86400'
    );

    const { id } = context.params;
    const API_URL = 'https://api.noticias.lat';

    try {
        const res = await fetch(`${API_URL}/api/article/${id}`);
        if (!res.ok) {
            return { notFound: true };
        }
        const article = await res.json();

        // Obtenemos más recomendaciones (el endpoint trae 12 por defecto)
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
    
    // Extracción inteligente del nombre de la fuente
    const getSourceName = () => {
        if (article.fuente) return article.fuente;
        if (article.enlaceOriginal) {
            try {
                const url = new URL(article.enlaceOriginal);
                return url.hostname.replace('www.', '');
            } catch (e) {
                return 'Agencia de Noticias';
            }
        }
        return 'Redacción';
    };

    // Distribución diversa de recomendaciones
    const sidebarVisual = recommended.slice(0, 5); // 3 con imagen en el sidebar
    const sidebarList = recommended.slice(5, 9);   // 4 en lista de texto en el sidebar
    const bottomGrid = recommended.slice(10, 15);   // 5 para el bento grid inferior

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
                                <span className="source-badge">{getSourceName()}</span>
                            </div>
                        </div>
                    </div>

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

                    {article.aiSummary && (
                        <div className="ai-summary-box" style={{ marginBottom: '2.5rem', background: '#f8fafc', borderLeft: '4px solid var(--color-primario)', padding: '1.5rem', borderRadius: '0 8px 8px 0' }}>
                            <div className="ai-summary-header" style={{ fontWeight: '800', color: 'var(--color-texto-titulos)', marginBottom: '10px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fas fa-key" style={{ color: 'var(--color-primario)' }}></i> Puntos clave
                            </div>
                            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6', color: '#334155' }}>
                                {article.aiSummary}
                            </p>
                        </div>
                    )}

                    <div className="article-body-content" style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#334155' }}>
                        {paragraphs.map((p, index) => (
                            <p key={index} style={{ marginBottom: '1.5rem' }}>{p}</p>
                        ))}
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

                {/* COLUMNA DERECHA: STICKY SIDEBAR DIVERSIFICADO */}
                <aside className="article-sidebar">
                    <div className="sticky-container" style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* WIDGET 1: Visual (Con imágenes) */}
                        {sidebarVisual.length > 0 && (
                            <div className="sidebar-widget">
                                <h3 className="sidebar-title">Destacados</h3>
                                <div className="sidebar-news-list">
                                    {sidebarVisual.map(rec => (
                                        <Link href={`/articulo/${rec._id}`} key={rec._id} className="sidebar-news-item" style={{ textDecoration: 'none' }}>
                                            <img 
                                                src={(rec.imagen && rec.imagen.startsWith('http')) ? rec.imagen : '/images/placeholder.jpg'} 
                                                alt={rec.titulo} 
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--color-primario)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>{rec.categoria}</span>
                                                <h4>{rec.titulo}</h4>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* WIDGET 2: Lista Rápida (Solo texto) */}
                        {sidebarList.length > 0 && (
                            <div className="sidebar-widget" style={{ background: '#f8fafc', border: 'none' }}>
                                <h3 className="sidebar-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Lo Último</h3>
                                <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                    {sidebarList.map(rec => (
                                        <li key={rec._id} style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                                            <Link href={`/articulo/${rec._id}`} style={{ textDecoration: 'none', color: 'var(--color-texto-titulos)', display: 'block' }}>
                                                <h4 style={{ fontSize: '0.95rem', margin: 0, lineHeight: '1.4', fontWeight: '600' }}>
                                                    {rec.titulo}
                                                </h4>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
                                                    <i className="far fa-clock"></i> {new Date(rec.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>
                </aside>
            </div>

            {/* SECCIÓN INFERIOR: BENTO GRID ASIMÉTRICO */}
            {bottomGrid.length > 0 && (
                <section className="recommended-section" style={{ background: '#ffffff', padding: '4rem 15px', marginTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h2 className="recommended-title" style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', color: 'var(--color-texto-titulos)' }}>Te podría interesar</h2>
                        
                        <div className="bottom-bento-grid">
                            {bottomGrid.map((rec, index) => {
                                // El primer artículo de la grilla lo hacemos más grande (ocupa 2 columnas si hay espacio)
                                const isFeatured = index === 0;
                                
                                return (
                                    <div className={`bento-card ${isFeatured ? 'featured-bento' : ''}`} key={rec._id}>
                                        <Link href={`/articulo/${rec._id}`} className="bento-image-wrapper">
                                            <img 
                                                src={(rec.imagen && rec.imagen.startsWith('http')) ? rec.imagen : '/images/placeholder.jpg'} 
                                                alt={rec.titulo} 
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                                            />
                                            <div className="bento-category-tag">{rec.categoria}</div>
                                        </Link>
                                        <div className="bento-content">
                                            <h3>
                                                <Link href={`/articulo/${rec._id}`}>
                                                    {rec.titulo}
                                                </Link>
                                            </h3>
                                            <p>{rec.descripcion}</p>
                                        </div>
                                    </div>
                                );
                            })}
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
                
                /* Estilos Sidebar */
                .sidebar-news-item h4 {
                    font-size: 0.95rem;
                    line-height: 1.3;
                    margin: 0;
                    color: var(--color-texto-titulos);
                    transition: color 0.2s;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .sidebar-news-item:hover h4 {
                    color: var(--color-primario);
                }
                
                /* Audio Player Nativo Modificado */
                audio::-webkit-media-controls-panel {
                    background-color: #f1f5f9;
                }
                audio::-webkit-media-controls-play-button {
                    background-color: var(--color-primario);
                    border-radius: 50%;
                }

                /* Bento Grid Inferior */
                .bottom-bento-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                }
                .bento-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .bento-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
                }
                .bento-image-wrapper {
                    position: relative;
                    height: 180px;
                    display: block;
                }
                .bento-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .bento-category-tag {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: var(--color-primario);
                    color: white;
                    padding: 4px 10px;
                    font-size: 0.7rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    border-radius: 4px;
                }
                .bento-content {
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
                .bento-content h3 {
                    font-size: 1.1rem;
                    margin: 0 0 10px 0;
                    line-height: 1.3;
                }
                .bento-content h3 a {
                    color: var(--color-texto-titulos);
                    text-decoration: none;
                }
                .bento-content h3 a:hover {
                    color: var(--color-primario);
                }
                .bento-content p {
                    font-size: 0.9rem;
                    color: #64748b;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    flex: 1;
                }

                @media (min-width: 768px) {
                    .featured-bento {
                        grid-column: span 2;
                        flex-direction: row;
                    }
                    .featured-bento .bento-image-wrapper {
                        width: 50%;
                        height: auto;
                    }
                    .featured-bento .bento-content {
                        width: 50%;
                        padding: 25px;
                        justify-content: center;
                    }
                    .featured-bento .bento-content h3 {
                        font-size: 1.5rem;
                        margin-bottom: 15px;
                    }
                    .featured-bento .bento-content p {
                        font-size: 1rem;
                        -webkit-line-clamp: 4;
                    }
                }
            `}</style>
        </Layout>
    );
}