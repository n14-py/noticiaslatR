import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

// Configuracion Edge para máxima velocidad en Cloudflare
export const runtime = 'experimental-edge';

// --- CONFIGURACION ---
const API_URL = 'https://api.noticias.lat';
const SITE_NAME = 'Noticias.lat';
const PLACEHOLDER_IMG = '/images/placeholder.jpg';

// --- 1. SERVER SIDE PROPS ---
export async function getServerSideProps(context) {
    // SECUESTRO DE CDN CLOUDFLARE: Congelamos el HTML en los nodos Edge por 1 HORA (3600 segundos).
    if (context.res && context.res.setHeader) {
        context.res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
        context.res.setHeader('Cloudflare-CDN-Cache-Control', 's-maxage=3600, stale-while-revalidate=3600');
        context.res.setHeader('CDN-Cache-Control', 's-maxage=3600, stale-while-revalidate=3600');
    }

    const { query } = context;
    const page = parseInt(query.page || '1', 10);
    const limit = 26; // Aumentado al doble para mayor densidad (AdSense)
    
    // CORRECCIÓN DE PAGINACIÓN: El backend espera "pagina", no "page"
    let endpoint = `${API_URL}/api/articles?sitio=noticias.lat&pagina=${page}&limite=${limit}`;
    
    if (query.categoria && query.categoria !== 'todos') {
        endpoint += `&categoria=${query.categoria}`;
    }
    if (query.pais) {
        endpoint += `&pais=${query.pais}`;
    }

    try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Error fetching articles');
        const data = await res.json();

        // --- NUEVO: FETCH DE ANUNCIOS WEB ---
        let webAds = [];
        try {
            const adsRes = await fetch(`${API_URL}/api/ads/active?plataforma=web`);
            if (adsRes.ok) {
                const adsData = await adsRes.json();
                if (adsData.success && adsData.ads) {
                    webAds = adsData.ads;
                }
            }
        } catch (e) { console.error("Error cargando anuncios web:", e); }

        let articles = [];
        if (data.articulos && Array.isArray(data.articulos)) {
            articles = data.articulos;
        } else if (data.articles && Array.isArray(data.articles)) {
            articles = data.articles;
        } else if (data.docs && Array.isArray(data.docs)) {
            articles = data.docs;
        } else if (Array.isArray(data)) {
            articles = data;
        }

        return {
            props: {
                initialArticles: articles,
                pagination: {
                    currentPage: data.paginaActual || data.page || page,
                    totalPages: data.totalPaginas || data.totalPages || 1,
                    totalArticles: data.totalArticulos || data.totalDocs || 0
                },
                currentCategory: query.categoria || null,
                currentCountry: query.pais || null,
                webAds // Pasamos los anuncios a la web
            }
        };
    } catch (error) {
        console.error("Error cargando noticias:", error);
        return {
            props: {
                initialArticles: [],
                pagination: { currentPage: 1, totalPages: 1 },
                error: true
            }
        };
    }
}

// --- 2. COMPONENTE PRINCIPAL ---
export default function Home({ initialArticles, pagination, currentCategory, currentCountry, error, webAds }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Estados separados para Banner y Pop-up
    const [bannerAd, setBannerAd] = useState(null);
    const [interstitialAd, setInterstitialAd] = useState(null);
    const [showInterstitial, setShowInterstitial] = useState(false);

useEffect(() => {
        if (webAds && webAds.length > 0) {
            // ¡MAGIA OMNICANAL! 
            // Como el cliente marcó "mostrarEnWeb: true", ya no nos importa el "tipo" original.
            // Tomamos todos para que puedan salir como Banners o Pop-ups.
            const banners = webAds;
            const interstitials = webAds;

            // 1. Configurar Banner
            if (banners.length > 0) {
                const randomBanner = banners[Math.floor(Math.random() * banners.length)];
                setBannerAd(randomBanner);
                fetch('https://api.noticias.lat/api/ads/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adId: randomBanner._id, plataforma: 'web' })
                }).catch(() => {});
            }

            // 2. Configurar Pop-up (Interstitial)
            if (interstitials.length > 0) {
                const randomInter = interstitials[Math.floor(Math.random() * interstitials.length)];
                setInterstitialAd(randomInter);
                
                // Retrasamos el pop-up 3 segundos para no asustar al lector de golpe
                setTimeout(() => {
                    setShowInterstitial(true);
                    fetch('https://api.noticias.lat/api/ads/view', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adId: randomInter._id, plataforma: 'web' })
                    }).catch(() => {});
                }, 3000);
            }
        }
    }, [webAds]);
    
    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleComplete = () => {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        const handleError = () => setLoading(false);

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleError);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleError);
        };
    }, [router]);

    const getPageTitle = () => {
        if (currentCategory && currentCategory !== 'todos') {
            return `Noticias de ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}`;
        }
        if (currentCountry) {
            return `Noticias de ${currentCountry.toUpperCase()}`;
        }
        return 'Últimas Noticias, Reportajes y Análisis';
    };

    const titleText = getPageTitle();

    // Estructuración de alta densidad informativa para portada
    const heroArticle = initialArticles && initialArticles.length > 0 ? initialArticles[0] : null;
    const sideArticles = initialArticles && initialArticles.length > 1 ? initialArticles.slice(1, 3) : [];
    const listArticles = initialArticles && initialArticles.length > 3 ? initialArticles.slice(3, 11) : [];
    const gridArticles = initialArticles && initialArticles.length > 11 ? initialArticles.slice(11) : [];

    return (
        <Layout>
            <Head>
                <title>{`${titleText} - ${SITE_NAME}`}</title>
                <meta name="description" content={`Mantente informado con las últimas noticias de ${titleText} en Noticias.lat. Cobertura global, audionoticias, videos y actualizaciones al minuto.`} />
                <link rel="canonical" href={`https://www.noticias.lat${router.asPath.split('?')[0]}`} />
            </Head>

            <div className="container main-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 15px' }}>
                <div style={{ marginBottom: '2rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--color-primario)', paddingBottom: '10px' }}>
                    <h1 style={{ 
                        fontSize: '2.2rem', 
                        fontFamily: 'var(--font-titulos)', 
                        color: 'var(--color-texto-titulos)',
                        margin: 0,
                        fontWeight: '900',
                        textTransform: 'uppercase'
                    }}>
                        {titleText}
                    </h1>
                    <span style={{ color: 'var(--color-texto-suave)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                <div style={{
                    opacity: loading ? 0.5 : 1,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: loading ? 'none' : 'auto'
                }}>
                    {error || (initialArticles && initialArticles.length === 0) ? (
                        <EmptyState />
                    ) : (
                        <div className="news-portal-layout">
                            
                            {/* SECCIÓN 1: DESTACADOS (HERO + SIDEBAR) */}
                            {pagination.currentPage === 1 && heroArticle && (
                                <div className="featured-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '3rem' }}>
                                    {/* Artículo Principal (65%) */}
                                    <div className="main-hero" style={{ flex: '1 1 60%', minWidth: '300px', position: 'relative' }}>
                                        <ArticleHero article={heroArticle} />
                                    </div>
                                    
                                    {/* Artículos Laterales Secundarios (35%) */}
                                    {sideArticles.length > 0 && (
                                        <div className="side-hero" style={{ flex: '1 1 30%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {sideArticles.map(article => (
                                                <ArticleSide key={article._id} article={article} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SECCI N 2: LISTA DENSA DE NOTICIAS CON MUCHO TEXTO */}
                            {listArticles.length > 0 && (
                                <div style={{ marginBottom: '3rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', borderLeft: '4px solid #ff0000', paddingLeft: '10px', marginBottom: '1.5rem' }}>M s Relevantes</h2>
                                    <div className="dense-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                                        {listArticles.map(article => (
                                            <ArticleDenseList key={article._id} article={article} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- BANNER PUBLICITARIO WEB --- */}
                            {bannerAd && (
                                <div style={{ marginBottom: '3rem', textAlign: 'center', width: '100%', background: '#fff', padding: '15px', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Anuncio Publicitario</span>
                                    </div>
                                    <a href={`https://api.noticias.lat/api/ads/click?adId=${bannerAd._id}&plataforma=web`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', width: '100%', borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        {bannerAd.mediaUrl.toLowerCase().endsWith('.mp4') ? (
                                            <video src={bannerAd.mediaUrl} autoPlay loop muted playsInline style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
                                        ) : (
                                            <img src={bannerAd.mediaUrl} alt={bannerAd.nombreCampana} style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
                                        )}
                                    </a>
                                </div>
                            )}

                            {/* --- POP-UP INTERSTITIAL WEB --- */}
                            {showInterstitial && interstitialAd && (
                                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15, 23, 42, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
                                    <div style={{ position: 'relative', width: '90%', maxWidth: '400px', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                                            <button onClick={() => setShowInterstitial(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>X</button>
                                        </div>
                                        <div style={{ padding: '10px 15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            Anuncio Patrocinado
                                        </div>
                                        <a href={`https://api.noticias.lat/api/ads/click?adId=${interstitialAd._id}&plataforma=web`} target="_blank" rel="noopener noreferrer" onClick={() => setShowInterstitial(false)}>
                                            {interstitialAd.mediaUrl.toLowerCase().endsWith('.mp4') ? (
                                                <video src={interstitialAd.mediaUrl} autoPlay loop muted playsInline style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'cover' }} />
                                            ) : (
                                                <img src={interstitialAd.mediaUrl} alt={interstitialAd.nombreCampana} style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'cover' }} />
                                            )}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* --- NUEVA SECCIÓN: PROMOCIÓN DE LA APP --- */}
                            <div style={{
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)',
                                borderRadius: '16px',
                                padding: '2.5rem 2rem',
                                marginBottom: '3rem',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '20px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                            }}>
                                <div style={{ flex: '1 1 500px' }}>
                                    <span style={{ background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        ¡Nueva App Disponible!
                                    </span>
                                    <h2 style={{ color: 'white', fontSize: '2.2rem', margin: '15px 0 10px 0', fontWeight: '900', lineHeight: '1.2' }}>
                                        Lleva Noticias Lat en tu bolsillo
                                    </h2>
                                    <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                                        Resúmenes con IA, radio 24/7, videos cortos y modo Premium. Descarga nuestra app oficial para Android y experimenta la información a otro nivel.
                                    </p>
                                    <a href="https://play.google.com/store/apps/details?id=com.noticiaslat.app" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'white', color: '#0f172a', padding: '14px 28px', borderRadius: '50px', fontWeight: 'bold', textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                        <i className="fab fa-google-play" style={{ color: '#10b981', fontSize: '1.4rem' }}></i>
                                        Descargar en Google Play
                                    </a>
                                </div>
                                <div style={{ flex: '0 1 200px', textAlign: 'center', margin: '0 auto' }}>
                                    <i className="fas fa-mobile-alt" style={{ fontSize: '8rem', color: '#3b82f6', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}></i>
                                </div>
                            </div>

                            {/* SECCI N 3: GRILLA EST NDAR PARA EL RESTO */}
                            {gridArticles.length > 0 && (
                                <div style={{ marginBottom: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                                    <h2 style={{ fontSize: '1.5rem', borderLeft: '4px solid var(--color-primario)', paddingLeft: '10px', marginBottom: '1.5rem' }}> ltimas Actualizaciones</h2>
                                    <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                                        {gridArticles.map(article => (
                                            <ArticleCard key={article._id} article={article} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {initialArticles && initialArticles.length > 0 && (
                                <Pagination 
                                    currentPage={pagination.currentPage} 
                                    totalPages={pagination.totalPages} 
                                    query={router.query} 
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Estilos específicos para la estructura densa de portal de noticias */}
            <style jsx global>{`
                .main-hero .card-image-wrapper img {
                    height: 450px;
                    object-fit: cover;
                    border-radius: 8px;
                }
                @media (max-width: 768px) {
                    .featured-section { flexDirection: column; }
                    .main-hero .card-image-wrapper img { height: 250px; }
                    .dense-list-grid { grid-template-columns: 1fr !important; }
                }
                .tag-audio { background: #10b981; color: white; }
                .tag-video { background: #ef4444; color: white; }
            `}</style>
        </Layout>
    );
}

// --- 3. SUB-COMPONENTES ---

// Componente: Hero Principal
function ArticleHero({ article }) {
    const imgUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER_IMG;
    const hasVideo = (article.youtubeId && article.videoProcessingStatus === 'complete');
    const hasAudio = article.audioUrl;

    return (
        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <Link href={`/articulo/${article._id}`} className="card-image-wrapper" style={{ display: 'block', position: 'relative' }}>
                <img 
                    src={imgUrl} 
                    alt={article.titulo} 
                    loading="eager" // Mantenemos eager solo aquí para métricas LCP iniciales rapidísimas
                    style={{ width: '100%', display: 'block' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '30px 20px 20px' }}>
                    <div className="card-tags" style={{ marginBottom: '10px' }}>
                        <span className="tag" style={{ background: 'var(--color-primario)', color: '#fff' }}>{article.categoria}</span>
                        {hasVideo && <span className="tag tag-video"><i className="fas fa-play"></i> VIDEO</span>}
                        {hasAudio && <span className="tag tag-audio"><i className="fas fa-headphones"></i> AUDIO</span>}
                    </div>
                    <h2 style={{ color: 'white', fontSize: '2rem', margin: '0 0 10px 0', lineHeight: '1.2', fontWeight: '800' }}>
                        {article.titulo}
                    </h2>
                    <p style={{ color: '#e2e8f0', margin: 0, fontSize: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {article.descripcion}
                    </p>
                </div>
            </Link>
        </div>
    );
}

// Componente: Artículo Lateral Destacado
function ArticleSide({ article }) {
    const imgUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER_IMG;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <Link href={`/articulo/${article._id}`} style={{ display: 'block', height: '180px', overflow: 'hidden', position: 'relative' }}>
                <img 
                    src={imgUrl} 
                    alt={article.titulo} 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                />
            </Link>
            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primario)', textTransform: 'uppercase', marginBottom: '8px' }}>{article.categoria}</span>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                    <Link href={`/articulo/${article._id}`} style={{ color: 'var(--color-texto-titulos)', textDecoration: 'none' }}>
                        {article.titulo}
                    </Link>
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 10px 0', flex: 1 }}>
                    {article.descripcion ? article.descripcion.substring(0, 80) + '...' : ''}
                </p>
            </div>
        </div>
    );
}

// Componente: Lista densa con mucho texto (AdSense Friendly)
function ArticleDenseList({ article }) {
    const imgUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER_IMG;
    const fecha = new Date(article.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

    return (
        <div style={{ display: 'flex', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
            <Link href={`/articulo/${article._id}`} style={{ flex: '0 0 120px', height: '100px', borderRadius: '6px', overflow: 'hidden' }}>
                <img 
                    src={imgUrl} 
                    alt={article.titulo} 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                />
            </Link>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.7rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#475569' }}>{article.categoria}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}><i className="far fa-clock"></i> {fecha}</span>
                </div>
                <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                    <Link href={`/articulo/${article._id}`} style={{ color: 'var(--color-texto-titulos)', textDecoration: 'none' }}>
                        {article.titulo}
                    </Link>
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.descripcion}
                </p>
            </div>
        </div>
    );
}

// Componente: Tarjeta Grilla (Estándar para relleno final)
function ArticleCard({ article }) {
    const fecha = new Date(article.fecha).toLocaleDateString('es-ES', { 
        day: 'numeric', month: 'short'
    });
    
    const imgUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER_IMG;
    const hasVideo = (article.youtubeId && article.videoProcessingStatus === 'complete');
    const hasAudio = article.audioUrl;

    return (
        <div className="article-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Link href={`/articulo/${article._id}`} className="card-image-wrapper" style={{ height: '160px' }}>
                <img 
                    src={imgUrl} 
                    alt={article.titulo} 
                    loading="lazy" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                />
                {hasVideo && (
                    <div className="card-play-overlay">
                        <div className="card-play-icon"><i className="fas fa-play"></i></div>
                    </div>
                )}
            </Link>
            <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '15px' }}>
                <div className="card-tags" style={{ marginBottom: '10px' }}>
                    <span className="tag" style={{ fontSize: '0.7rem' }}>{article.categoria}</span>
                    {hasAudio && <span className="tag" style={{ background: '#10b981', color: 'white', fontSize: '0.7rem' }}>AUDIO</span>}
                </div>
                
                <h3 className="card-title" style={{ fontSize: '1.05rem', margin: '0 0 10px 0' }}>
                    <Link href={`/articulo/${article._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {article.titulo}
                    </Link>
                </h3>
                <p className="card-excerpt" style={{ fontSize: '0.85rem', flex: 1 }}>
                    {article.descripcion ? article.descripcion.substring(0, 90) + '...' : ''}
                </p>
                <div className="card-meta" style={{ marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span><i className="far fa-clock"></i> {fecha}</span>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="no-articles-message" style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '12px' }}>
            <i className="fas fa-newspaper" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#cbd5e1' }}></i>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-texto-titulos)' }}>No se encontraron noticias</h3>
            <p style={{ color: 'var(--color-texto-suave)' }}>Estamos actualizando nuestro feed global. Vuelve en unos minutos.</p>
            <Link href="/" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block', background: 'var(--color-primario)', color: 'white', padding: '12px 25px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
                Recargar Portada
            </Link>
        </div>
    );
}

function Pagination({ currentPage, totalPages, query }) {
    if (totalPages <= 1) return null;

    const createPageLink = (page) => {
        const newQuery = { ...query, page };
        const params = new URLSearchParams();
        Object.keys(newQuery).forEach(key => {
            if (newQuery[key]) params.append(key, newQuery[key]);
        });
        return `/?${params.toString()}`;
    };

    return (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '4rem', paddingBottom: '2rem', gap: '15px' }}>
            {currentPage > 1 ? (
                <Link href={createPageLink(currentPage - 1)} className="pagination-btn" style={{ padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '30px', fontWeight: 'bold', color: '#334155', textDecoration: 'none' }}>
                    <i className="fas fa-chevron-left"></i> Anterior
                </Link>
            ) : (
                <span className="pagination-btn disabled" style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '30px', fontWeight: 'bold', color: '#94a3b8', cursor: 'not-allowed' }}><i className="fas fa-chevron-left"></i> Anterior</span>
            )}
            
            <span className="page-info" style={{ color: 'var(--color-texto-suave)', fontWeight: '600' }}>
                Página {currentPage} de {totalPages}
            </span>

            {currentPage < totalPages ? (
                <Link href={createPageLink(currentPage + 1)} className="pagination-btn" style={{ padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '30px', fontWeight: 'bold', color: '#334155', textDecoration: 'none' }}>
                    Siguiente <i className="fas fa-chevron-right"></i>
                </Link>
            ) : (
                <span className="pagination-btn disabled" style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '30px', fontWeight: 'bold', color: '#94a3b8', cursor: 'not-allowed' }}>Siguiente <i className="fas fa-chevron-right"></i></span>
            )}
        </div>
    );
}