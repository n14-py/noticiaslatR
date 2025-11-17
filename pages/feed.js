import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

// --- Constantes ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SITIO = 'noticias.lat';
const LIMITE_POR_PAGINA = 12;
const PLACEHOLDER_IMG = '/images/placeholder.jpg';

const BANDERAS = {
    ar: '🇦🇷 Argentina', bo: '🇧🇴 Bolivia', br: '🇧🇷 Brasil',
    cl: '🇨🇱 Chile', co: '🇨🇴 Colombia', cr: '🇨🇷 Costa Rica',
    cu: '🇨🇺 Cuba', ec: '🇪🇨 Ecuador', sv: '🇸🇻 El Salvador',
    gt: '🇬🇹 Guatemala', hn: '🇭🇳 Honduras', mx: '🇲🇽 México',
    ni: '🇳🇮 Nicaragua', pa: '🇵🇦 Panamá', py: '🇵🇾 Paraguay',
    pe: '🇵🇪 Perú', do: '🇩🇴 Rep. Dominicana', uy: '🇺🇾 Uruguay',
    ve: '🇻🇪 Venezuela'
};

const CATEGORIAS_TITULOS = {
    todos: 'Última Hora (General)',
    politica: 'Política',
    economia: 'Economía',
    deportes: 'Deportes',
    tecnologia: 'Tecnología',
    entretenimiento: 'Show y Entretenimiento',
    salud: 'Salud',
    internacional: 'Mundo'
};

// --- 1. FUNCIÓN PRINCIPAL (Se ejecuta en el SERVIDOR) ---
export async function getServerSideProps(context) {
    
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
    );
    
    const { query, categoria, pais, pagina: pagina_raw } = context.query;
    
    const queryParams = {
        query: query || null,
        pais: pais || null,
        categoria: (query || pais) ? 'todos' : (categoria || 'todos'),
        pagina: parseInt(pagina_raw) || 1,
    };

    let url = `${API_URL}/api/articles?sitio=${SITIO}&limite=${LIMITE_POR_PAGINA}&pagina=${queryParams.pagina}`;
    
    if (queryParams.query) {
        url += `&query=${encodeURIComponent(queryParams.query)}`;
    }
    if (queryParams.pais) {
        url += `&pais=${queryParams.pais}`;
    }
    if (queryParams.categoria && queryParams.categoria !== 'todos' && !queryParams.query && !queryParams.pais) {
        url += `&categoria=${queryParams.categoria}`;
    }
    
    // Filtro para traer artículos con video completo o artículos de solo texto
    // Esto lo definimos en el controller
    url += `&videoStatus=complete_or_pending`;
    
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Error de API: ${res.statusText}`);
        }
        const data = await res.json();
        
        return {
            props: {
                data,
                queryParams,
            },
        };
    } catch (error) {
        console.error("Error en getServerSideProps:", error.message);
        return {
            props: {
                data: { articulos: [], totalArticulos: 0, totalPaginas: 1, paginaActual: 1 },
                queryParams,
                error: "No se pudieron cargar las noticias. Intente más tarde.",
            },
        };
    }
}


// --- 2. COMPONENTE DE LA PÁGINA (Se ejecuta en el NAVEGADOR) ---
export default function Home({ data, queryParams, error }) {

    let pageTitle = CATEGORIAS_TITULOS['todos'];
    let metaDescription = "Tu portal de noticias actualizado con la última información...";
    
    if (queryParams.query) {
        pageTitle = `Resultados para: "${queryParams.query}"`;
        metaDescription = `Encuentra las últimas noticias sobre "${queryParams.query}" en Noticias.lat.`;
        if (queryParams.pais && BANDERAS[queryParams.pais]) {
            pageTitle += ` en ${BANDERAS[queryParams.pais]}`;
        }
    } else if (queryParams.pais) {
        if (BANDERAS[queryParams.pais]) {
            pageTitle = `Noticias de ${BANDERAS[queryParams.pais]}`;
            metaDescription = `Mantente informado con las últimas noticias de ${BANDERAS[queryParams.pais]} en Noticias.lat.`;
        }
    } else if (queryParams.categoria) {
        if (CATEGORIAS_TITULOS[queryParams.categoria]) {
            pageTitle = CATEGORIAS_TITULOS[queryParams.categoria];
            metaDescription = `Las noticias más recientes sobre ${pageTitle} en Latinoamérica.`;
        }
    }

    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(queryParams.query || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = searchTerm.trim();
        if (!query) return;

        const newParams = new URLSearchParams();
        newParams.set('query', query);
        
        if (router.query.pais) {
            newParams.set('pais', router.query.pais);
        }
        
        router.push(`/?${newParams.toString()}`);
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.push('/');
    };


    return (
        <Layout>
            <Head>
                <title>{pageTitle} - Noticias.lat</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={`${pageTitle} - Noticias.lat`} />
                <meta property="og:description" content={metaDescription} />
            </Head>

            <div className="container">
                <div className="main-content">
                    
                    <form id="search-form" className="search-form" onSubmit={handleSearchSubmit}>
                        <input 
                            type="text" 
                            id="search-input" 
                            name="query" 
                            placeholder="Buscar noticias, temas o países..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            required 
                        />
                        <button type="submit" id="search-button"><i className="fas fa-search"></i></button>
                        {queryParams.query && (
                            <button 
                                type="button" 
                                id="clear-search-button" 
                                onClick={clearSearch}
                                style={{ display: 'inline-block' }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </form>
                    
                    <h2 id="category-title">{pageTitle}</h2>
                    
                    <div id="articles-container">
                        {error && (
                            <div className="no-articles-message" style={{ color: 'red' }}>
                                <p>{error}</p>
                            </div>
                        )}

                        {!error && data.articulos.length === 0 && (
                            <div className="no-articles-message">
                                <p>No se encontraron noticias en esta sección.</p>
                            </div>
                        )}

                        {!error && data.articulos.map(article => (
                            <ArticleCard key={article._id} article={article} />
                        ))}
                    </div>
                
                    <Pagination 
                        paginaActual={data.paginaActual} 
                        totalPaginas={data.totalPaginas} 
                        queryParams={queryParams}
                    />
                </div>
            </div>
        </Layout>
    );
}


// --- 3. Componentes Ayudantes (para limpiar el código) ---

function ArticleCard({ article }) {
    let infoFuente = <span>Fuente: {article.fuente}</span>;
    let flagHTML = null;
    if (article.pais && BANDERAS[article.pais]) {
        const bandera = BANDERAS[article.pais].split(' ')[0]; 
        infoFuente = <span>{bandera} {article.fuente}</span>;
        flagHTML = <span className="article-card-flag">{bandera}</span>;
    }
    
    let descripcionHTML = null;
    if (article.descripcion && article.descripcion !== 'Sin descripción.') {
        descripcionHTML = <p>{article.descripcion.substring(0, 120)}...</p>;
    }
    
    const imagenUrl = article.imagen || PLACEHOLDER_IMG;
    const articleUrl = `/articulo/${article._id}`;

    // --- ¡CAMBIO IMPORTANTE AQUÍ! ---
    // Ahora creamos un BOTÓN DE PLAY real que es un <Link>
    let playButton = null;
    // Comprobamos si el video está listo y tiene un ID de YouTube
    if (article.youtubeId && article.videoProcessingStatus === 'complete') {
        playButton = (
            <Link href={`/feed?start_id=${article._id}`} legacyBehavior>
                <a className="article-card-play-icon" title="Ver video">
                    <i className="fas fa-play"></i>
                </a>
            </Link>
        );
    }
    // --- FIN DEL CAMBIO ---

    return (
        <div className="article-card">
            {/* El link principal ahora solo está en la imagen y el título */}
            <Link href={articleUrl} legacyBehavior>
                <a className="article-card-image-link">
                    <img 
                        src={imagenUrl} 
                        alt={article.titulo} 
                        loading="lazy" 
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                    />
                    {flagHTML}
                </a>
            </Link>
            
            {/* ¡Botón de Play añadido aquí! 
                Se pone fuera del Link principal para que tenga su propia acción */}
            {playButton} 

            <div className="article-card-content">
                <h3>
                    <Link href={articleUrl}>{article.titulo}</Link>
                </h3>
                {descripcionHTML}
                <div className="article-card-footer">
                    {infoFuente}
                    <span>{new Date(article.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
        </div>
    );
}

function Pagination({ paginaActual, totalPaginas, queryParams }) {
    if (totalPaginas <= 1) return null;

    let queryString = '';
    if (queryParams.query) {
        queryString = `query=${encodeURIComponent(queryParams.query)}`;
        if (queryParams.pais) {
            queryString += `&pais=${queryParams.pais}`;
        }
    } else if (queryParams.pais) {
        queryString = `pais=${queryParams.pais}`;
    } else {
        queryString = `categoria=${queryParams.categoria}`;
    }

    let startPage = Math.max(1, paginaActual - 2);
    let endPage = Math.min(totalPaginas, paginaActual + 2);
    if (paginaActual <= 3) endPage = Math.min(totalPaginas, 5);
    if (paginaActual > totalPaginas - 3) startPage = Math.max(1, totalPaginas - 4);

    const pages = [];
    if (startPage > 1) {
        pages.push(<Link key="1" href={`/?${queryString}&pagina=1`} className="page-link">1</Link>);
        if (startPage > 2) {
            pages.push(<span key="dots1" className="page-ellipsis">...</span>);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(
            <Link key={i} href={`/?${queryString}&pagina=${i}`} className={`page-link ${i === paginaActual ? 'active' : ''}`}>
                {i}
            </Link>
        );
    }

    if (endPage < totalPaginas) {
        if (endPage < totalPaginas - 1) {
            pages.push(<span key="dots2" className="page-ellipsis">...</span>);
        }
        pages.push(<Link key={totalPaginas} href={`/?${queryString}&pagina=${totalPaginas}`} className="page-link">{totalPaginas}</Link>);
    }

    return (
        <nav id="pagination-container" className="pagination-container" aria-label="Navegación de páginas">
            {paginaActual > 1 ? (
                <Link href={`/?${queryString}&pagina=${paginaActual - 1}`} className="page-link" aria-label="Anterior">
                    Anterior
                </Link>
            ) : (
                <span className="page-link disabled" aria-disabled="true">Anterior</span>
            )}
            
            {pages}
            
            {paginaActual < totalPaginas ? (
                <Link href={`/?${queryString}&pagina=${paginaActual + 1}`} className="page-link" aria-label="Siguiente">
                    Siguiente
                </Link>
            ) : (
                <span className="page-link disabled" aria-disabled="true">Siguiente</span>
            )}
        </nav>
    );
}