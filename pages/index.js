import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

// --- CONFIGURACIÓN ---
const API_URL = 'https://lfaftechapi.onrender.com';
const SITE_NAME = 'Noticias.lat';
const PLACEHOLDER_IMG = '/images/placeholder.jpg';

// --- 1. SERVER SIDE PROPS (Corregido para leer "articulos") ---
export async function getServerSideProps(context) {
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=86400'
    );

    const { query } = context;
    const page = parseInt(query.page || '1', 10);
    const limit = 13; 
    
    // Construir URL
    let endpoint = `${API_URL}/api/articles?sitio=noticias.lat&page=${page}&limit=${limit}`;
    
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

        // --- CORRECCIÓN CRÍTICA ---
        // Tu backend envía "articulos" (español), así que debemos leer eso.
        let articles = [];
        
        if (data.articulos && Array.isArray(data.articulos)) {
            articles = data.articulos; // <--- AQUÍ ESTABA EL PROBLEMA
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
                    currentPage: data.paginaActual || data.page || 1,
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

// --- 2. COMPONENTE PRINCIPAL ---
export default function Home({ initialArticles, pagination, currentCategory, currentCountry, error }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleComplete = () => setLoading(false);

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
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

    return (
        <Layout>
            <Head>
                <title>{titleText} - {SITE_NAME}</title>
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
                        paddingLeft: '15px'
                    }}>
                        {titleText}
                    </h1>
                </div>

                {loading ? (
                    <SkeletonGrid />
                ) : (
                    <>
                        {initialArticles && initialArticles.length > 0 ? (
                            <div className="bento-grid">
                                {initialArticles.map((article, index) => {
                                    const isHero = (index === 0 && pagination.currentPage === 1);
                                    return (
                                        <ArticleCard 
                                            key={article._id} 
                                            article={article} 
                                            isHero={isHero} 
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState />
                        )}

                        {initialArticles && initialArticles.length > 0 && (
                            <Pagination 
                                currentPage={pagination.currentPage} 
                                totalPages={pagination.totalPages} 
                                query={router.query}
                            />
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}

// --- 3. SUB-COMPONENTES ---

function ArticleCard({ article, isHero }) {
    const fecha = new Date(article.fecha).toLocaleDateString('es-ES', { 
        day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'
    });
    
    const imgUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER_IMG;
    const hasVideo = (article.youtubeId && article.videoProcessingStatus === 'complete');

    return (
        <div className={`article-card ${isHero ? 'hero-item' : ''}`}>
            <Link href={`/articulo/${article._id}`} className="card-image-wrapper">
                <img 
                    src={imgUrl} 
                    alt={article.titulo} 
                    loading={isHero ? "eager" : "lazy"} 
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                />
                
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
                    {hasVideo && <span className="tag" style={{background: '#000', color: '#fff'}}>VIDEO</span>}
                </div>
                
                <h3 className="card-title">
                    <Link href={`/articulo/${article._id}`}>
                        {article.titulo}
                    </Link>
                </h3>

                <p className="card-excerpt">
                    {article.descripcion ? article.descripcion.substring(0, isHero ? 200 : 100) + '...' : ''}
                </p>

                <div className="card-meta">
                    <span><i className="far fa-clock"></i> {fecha}</span>
                </div>
            </div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="bento-grid">
            <div className="article-card hero-item" style={{ border: 'none', boxShadow: 'none' }}>
                <div className="skeleton skeleton-img" style={{ height: '100%' }}></div>
            </div>
            {[...Array(6)].map((_, i) => (
                <div key={i} className="article-card" style={{ border: 'none', boxShadow: 'none' }}>
                    <div className="skeleton skeleton-img" style={{ height: '180px' }}></div>
                    <div style={{ padding: '1rem' }}>
                        <div className="skeleton skeleton-title"></div>
                        <div className="skeleton skeleton-title" style={{ width: '60%' }}></div>
                        <div className="skeleton skeleton-text"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="no-articles-message" style={{ textAlign: 'center', padding: '4rem' }}>
            <i className="fas fa-newspaper" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#cbd5e1' }}></i>
            <h3>No se encontraron noticias</h3>
            <p>Estamos actualizando nuestro feed. Vuelve en unos minutos.</p>
            <Link href="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block', color: 'var(--color-primario)', fontWeight: 'bold' }}>
                Recargar Página
            </Link>
        </div>
    );
}

function Pagination({ currentPage, totalPages, query }) {
    if (totalPages <= 1) return null;

    const createPageLink = (page) => {
        const newQuery = { ...query, page };
        const params = new URLSearchParams();
        Object.keys(newQuery).forEach(key => params.append(key, newQuery[key]));
        return `/?${params.toString()}`;
    };

    return (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
            {currentPage > 1 && (
                <Link href={createPageLink(currentPage - 1)} style={{ marginRight: '1rem', fontWeight: 'bold' }}>
                    <i className="fas fa-chevron-left"></i> Anterior
                </Link>
            )}

            <span className="page-info" style={{ color: '#64748b' }}>
                Página {currentPage} de {totalPages}
            </span>

            {currentPage < totalPages && (
                <Link href={createPageLink(currentPage + 1)} style={{ marginLeft: '1rem', fontWeight: 'bold' }}>
                    Siguiente <i className="fas fa-chevron-right"></i>
                </Link>
            )}
        </div>
    );
}