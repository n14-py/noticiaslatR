import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Forzamos el entorno Edge para velocidad extrema en Cloudflare
export const runtime = 'experimental-edge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.noticias.lat';
const SITE_NAME = 'Noticias.lat';
const PLACEHOLDER_IMG = '/images/placeholder.jpg';

export async function getServerSideProps(context) {
    // Caché extrema en el borde (CDN): Sirve al instante como HTML estático y actualiza en segundo plano
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=1800, stale-while-revalidate=86400'
    );

    const { query } = context;
    const page = parseInt(query.page || '1', 10);
    const limit = 15; 
    
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
                currentCountry: query.pais || null
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

export default function Home({ initialArticles, pagination, currentCategory, currentCountry, error }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
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
        return 'Últimas Noticias';
    };

    const titleText = getPageTitle();

    const sliderArticles = initialArticles ? initialArticles.slice(0, 4) : [];
    const gridArticles = initialArticles ? initialArticles.slice(4) : [];

    return (
        <Layout>
            <Head>
                <title>{`${titleText} - ${SITE_NAME}`}</title>
                <meta name="description" content={`Mantente informado con las últimas noticias de ${titleText} en Noticias.lat. Cobertura global y actualizaciones al minuto.`} />
                <link rel="canonical" href={`https://www.noticias.lat${router.asPath.split('?')[0]}`} />
            </Head>

            <div className="container main-content">
                <div style={{ marginBottom: '2rem', marginTop: '1rem' }}>
                    <h1 style={{ 
                        fontSize: '2rem', 
                        fontFamily: 'var(--font-titulos)', 
                        color: 'var(--color-texto-titulos)',
                        borderLeft: '5px solid var(--color-primario)',
                        paddingLeft: '15px',
                        fontWeight: '900'
                    }}>
                        {titleText}
                    </h1>
                </div>

                <div style={{
                    opacity: loading ? 0.5 : 1,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: loading ? 'none' : 'auto'
                }}>
                    {error || (initialArticles && initialArticles.length === 0) ? (
                        <EmptyState />
                    ) : (
                        <div className="home-layout">
                            {/* SLIDER IZQUIERDO (HERO) */}
                            <div className="slider-section">
                                <Swiper
                                    modules={[Autoplay, Pagination, EffectFade]}
                                    effect="fade"
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    pagination={{ clickable: true }}
                                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                                    className="hero-swiper"
                                >
                                    {sliderArticles.map((article) => (
                                        <SwiperSlide key={article._id}>
                                            <HeroSlide article={article} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            {/* GRILLA DERECHA / INFERIOR (RELACIONADAS) */}
                            <div className="grid-section">
                                <div className="bento-grid">
                                    {gridArticles.map((article) => (
                                        <ArticleCard 
                                            key={article._id} 
                                            article={article} 
                                            isHero={false} 
                                        />
                                    ))}
                                </div>
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
            </div>

            <style jsx>{`
                .home-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
                @media (min-width: 1024px) {
                    .home-layout {
                        grid-template-columns: 1.2fr 1fr;
                    }
                }
                .hero-swiper {
                    border-radius: var(--radio-card);
                    overflow: hidden;
                    box-shadow: var(--sombra-lg);
                    height: 100%;
                    min-height: 450px;
                }
                .hero-swiper :global(.swiper-pagination-bullet-active) {
                    background: var(--color-primario);
                }
            `}</style>
        </Layout>
    );
}

// --- SUB-COMPONENTES ---

function HeroSlide({ article }) {
    const imgUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER_IMG;
    const hasVideo = (article.youtubeId && article.videoProcessingStatus === 'complete');

    return (
        <div className="hero-slide-content">
            <Link href={`/articulo/${article._id}`} className="hero-img-link">
                <img src={imgUrl} alt={article.titulo} />
                <div className="hero-gradient"></div>
                {hasVideo && (
                    <div className="card-play-overlay" style={{ opacity: 1, background: 'transparent' }}>
                        <div className="card-play-icon" style={{ transform: 'scale(1.2)' }}>
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                )}
            </Link>
            <div className="hero-text-overlay">
                <div className="card-tags">
                    <span className="tag">{article.categoria}</span>
                    {hasVideo && <span className="tag" style={{background: '#ef4444', color: '#fff'}}>VIDEO</span>}
                </div>
                <h2>
                    <Link href={`/articulo/${article._id}`}>
                        {article.titulo}
                    </Link>
                </h2>
            </div>

            <style jsx>{`
                .hero-slide-content {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    min-height: 450px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                }
                .hero-img-link {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                }
                .hero-img-link img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .hero-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 50%, transparent 100%);
                }
                .hero-text-overlay {
                    position: relative;
                    z-index: 10;
                    padding: 2.5rem;
                }
                .hero-text-overlay h2 {
                    font-size: 1.8rem;
                    font-weight: 900;
                    line-height: 1.2;
                    margin: 0.5rem 0 0 0;
                }
                .hero-text-overlay h2 a {
                    color: #ffffff;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .hero-text-overlay h2 a:hover {
                    color: var(--color-primario-light);
                }
                @media (min-width: 768px) {
                    .hero-text-overlay h2 { font-size: 2.4rem; }
                }
            `}</style>
        </div>
    );
}

function ArticleCard({ article }) {
    const fecha = new Date(article.fecha).toLocaleDateString('es-ES', { 
        day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'
    });
    
    const imgUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER_IMG;
    const hasVideo = (article.youtubeId && article.videoProcessingStatus === 'complete');

    return (
        <div className="article-card">
            <Link href={`/articulo/${article._id}`} className="card-image-wrapper">
                <img src={imgUrl} alt={article.titulo} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
                {hasVideo && (
                    <div className="card-play-overlay">
                        <div className="card-play-icon">
                            <i className="fas fa-play"></i>
                        </div>
                    </div>
                )}
            </Link>
            <div className="card-content">
                <div className="card-tags">
                    <span className="tag">{article.categoria}</span>
                    {hasVideo && <span className="tag" style={{background: '#ef4444', color: '#fff'}}>VIDEO</span>}
                </div>
                
                <h3 className="card-title">
                    <Link href={`/articulo/${article._id}`}>
                        {article.titulo}
                    </Link>
                </h3>
                <p className="card-excerpt">
                    {article.descripcion ? article.descripcion.substring(0, 90) + '...' : ''}
                </p>
                <div className="card-meta">
                    <span><i className="far fa-clock"></i> {fecha}</span>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="no-articles-message" style={{ textAlign: 'center', padding: '4rem' }}>
            <i className="fas fa-newspaper" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#cbd5e1' }}></i>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-texto-titulos)' }}>No se encontraron noticias</h3>
            <p style={{ color: 'var(--color-texto-suave)' }}>Estamos actualizando nuestro feed. Vuelve en unos minutos.</p>
            <Link href="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block', background: 'var(--color-primario)', color: 'white', padding: '10px 20px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>
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
                <Link href={createPageLink(currentPage - 1)} className="pagination-btn">
                    <i className="fas fa-chevron-left"></i> Anterior
                </Link>
            ) : (
                <span className="pagination-btn disabled"><i className="fas fa-chevron-left"></i> Anterior</span>
            )}
            
            <span className="page-info" style={{ color: 'var(--color-texto-suave)', fontWeight: '600' }}>
                Página {currentPage} de {totalPages}
            </span>

            {currentPage < totalPages ? (
                <Link href={createPageLink(currentPage + 1)} className="pagination-btn">
                    Siguiente <i className="fas fa-chevron-right"></i>
                </Link>
            ) : (
                <span className="pagination-btn disabled">Siguiente <i className="fas fa-chevron-right"></i></span>
            )}
        </div>
    );
}