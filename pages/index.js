import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react'; // No necesitas 'useEffect' aquí

// --- Constantes traídas de tu app.js ---
// ¡CAMBIO AQUÍ! Ahora lee la variable de entorno o usa la de producción como fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lfaftechapi.onrender.com';
const SITIO = 'noticias.lat';
const LIMITE_POR_PAGINA = 12;
const PLACEHOLDER_IMG = '/images/placeholder.jpg'; // Ruta desde la carpeta /public

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
    
    // --- ¡LA LÍNEA MÁGICA PARA EL RENDIMIENTO! ---
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
    );
    // ---------------------------------------------

    // 1. Obtenemos los parámetros de la URL (ej: ?pais=ar&pagina=2)
    const { query, categoria, pais, pagina: pagina_raw } = context.query;
    
    // 2. Limpiamos los parámetros
    const queryParams = {
        query: query || null,
        pais: pais || null,
        categoria: (query || pais) ? 'todos' : (categoria || 'todos'),
        pagina: parseInt(pagina_raw) || 1,
    };

    // 3. Construimos la URL de la API (misma lógica que en tu app.js)
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
    
    // ¡CAMBIO PARA PRUEBAS!
    // Le pedimos a la API que nos traiga artículos con videos listos
    // O artículos que aún no tienen videos (los 'pending' de texto)
    // Esto asegura que el feed de staging muestre los videos procesados
    if (process.env.NODE_ENV !== 'production') {
         url += `&videoStatus=complete_or_pending`;
    }


    try {
        // 4. Llamamos a tu API en Render
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Error de API: ${res.statusText}`);
        }
        const data = await res.json();
        
        // 5. Devolvemos los datos y los queryParams como "props" a la página
        return {
            props: {
                data, // Esto contendrá { totalArticulos, totalPaginas, paginaActual, articulos }
                queryParams, // Esto contendrá { query, pais, categoria, pagina }
            },
        };
    } catch (error) {
        console.error("Error en getServerSideProps:", error.message);
        // Si la API falla, devolvemos un estado de error
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
// Recibe los "props" que devolvió getServerSideProps
export default function Home({ data, queryParams, error }) {

    // --- Lógica para el título de la categoría (traída de tu app.js) ---
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

    // --- Lógica del formulario de búsqueda (traída de tu app.js) ---
    const router = useRouter();
    // Iniciamos el estado con el 'queryParam' actual para que el input se llene
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
        router.push('/'); // Vuelve a la página principal
    };


    return (
        <Layout>
            {/* --- 3. SEO Dinámico para esta página --- */}
            <Head>
                <title>{pageTitle} - Noticias.lat</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={`${pageTitle} - Noticias.lat`} />
                <meta property="og:description" content={metaDescription} />
            </Head>

            {/* --- 4. Contenido de la Página (tu index.html) --- */}
            <div className="container">
                <div className="main-content">
                    
                    {/* --- Formulario de Búsqueda --- */}
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
                    
                    {/* --- Título de Categoría --- */}
                    <h2 id="category-title">{pageTitle}</h2>
                    
                    {/* --- Contenedor de Artículos --- */}
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
                
                    {/* --- Paginación --- */}
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

    // --- ¡NUEVO! Icono de Play si el artículo tiene video ---
    let playIcon = null;
    if (article.videoUrl && article.videoProcessingStatus === 'complete') {
        playIcon = <span className="article-card-play-icon"><i className="fas fa-play"></i></span>;
    }

    return (
        <div className="article-card">
            <Link href={articleUrl} legacyBehavior>
                <a className="article-card-image-link">
                    <img 
                        src={imagenUrl} 
                        alt={article.titulo} 
                        loading="lazy" 
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                    />
                    {flagHTML}
                    {playIcon} {/* ¡Icono de Play añadido aquí! */}
                </a>
            </Link>
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