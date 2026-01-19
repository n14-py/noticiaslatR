import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

// --- CONFIGURACIÓN CLOUDFLARE ---
export const runtime = 'experimental-edge';

const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';
const PLACEHOLDER_LOGO = '/images/placeholder.jpg'; 
const LIMITE_POR_PAGINA = 24;

// --- FILTROS RÁPIDOS (CONFIGURACIÓN) ---
const QUICK_FILTERS = [
    { label: 'Todas', code: null, icon: '🌎' },
    { label: 'Noticias', genero: 'news', icon: '📰' },
    { label: 'Música', genero: 'pop', icon: '🎵' },
    { label: 'Argentina', pais: 'Argentina', icon: '🇦🇷' },
    { label: 'México', pais: 'Mexico', icon: '🇲🇽' }, // Nota: API suele usar nombres en inglés o sin tilde a veces
    { label: 'Colombia', pais: 'Colombia', icon: '🇨🇴' },
    { label: 'Chile', pais: 'Chile', icon: '🇨🇱' },
    { label: 'Perú', pais: 'Peru', icon: '🇵🇪' },
    { label: 'España', pais: 'Spain', icon: '🇪🇸' },
    { label: 'USA', pais: 'United States', icon: '🇺🇸' },
];

export async function getServerSideProps(context) {
    context.res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    const { query, pais, genero, pagina: pagina_raw } = context.query;
    
    const queryParams = {
        query: query || null,
        pais: pais || null,
        genero: genero || null,
        pagina: parseInt(pagina_raw) || 1,
    };

    let url = `${API_URL}/radio/buscar?limite=${LIMITE_POR_PAGINA}&pagina=${queryParams.pagina}`;
    let tituloPagina = "Radios en Vivo";
    
    if (queryParams.query) {
        url += `&query=${encodeURIComponent(queryParams.query)}`;
        tituloPagina = `Resultados: "${queryParams.query}"`;
    } else if (queryParams.pais) {
        url += `&pais=${queryParams.pais}`;
        tituloPagina = `Emisoras de ${queryParams.pais}`;
    } else if (queryParams.genero) {
        url += `&genero=${encodeURIComponent(queryParams.genero)}`;
        tituloPagina = `Género: ${queryParams.genero}`;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error API`);
        const data = await res.json();
        
        if (queryParams.pais && data.radios.length > 0 && !queryParams.query) {
            tituloPagina = `Radios de ${data.radios[0].pais}`;
        }
        
        return { props: { data, queryParams, tituloPagina } };
    } catch (error) {
        return {
            props: {
                data: { radios: [], totalRadios: 0, totalPaginas: 1, paginaActual: 1 },
                queryParams,
                tituloPagina,
                error: "No pudimos conectar con las antenas. Intenta luego.",
            },
        };
    }
}

export default function RadiosPage({ data, queryParams, tituloPagina, error }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(queryParams.query || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = searchTerm.trim();
        if (!query) return;
        router.push(`/radios?query=${encodeURIComponent(query)}`);
    };

    // Función para manejar clicks en filtros
    const handleFilterClick = (filter) => {
        if (filter.code === null && !filter.genero && !filter.pais) {
            router.push('/radios'); // Reset
            return;
        }
        const params = new URLSearchParams();
        if (filter.pais) params.set('pais', filter.pais);
        if (filter.genero) params.set('genero', filter.genero);
        router.push(`/radios?${params.toString()}`);
    };

    const isFilterActive = (filter) => {
        if (filter.code === null && !queryParams.pais && !queryParams.genero) return true;
        if (filter.pais && queryParams.pais === filter.pais) return true;
        if (filter.genero && queryParams.genero === filter.genero) return true;
        return false;
    };

    return (
        <Layout>
            <Head>
                <title>{`${tituloPagina} | Noticias.lat`}</title>
                <meta name="description" content={`Escucha ${tituloPagina} gratis en Noticias.lat. Acceso instantáneo a miles de emisoras en vivo.`} />
            </Head>

            <div className="container main-content">
                
                {/* --- HEADER CON BUSCADOR --- */}
                <div className="radio-page-header">
                    <h1 className="article-title-main" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {tituloPagina}
                    </h1>
                    <p style={{marginBottom: '1.5rem', color: '#64748b'}}>Toca cualquier emisora para escuchar al instante.</p>
                    
                    <form className="radio-search-container" onSubmit={handleSearchSubmit}>
                        <input 
                            type="text" 
                            className="radio-search-input"
                            placeholder="Buscar emisora (Ej: Radio Mitre, Los 40...)" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="radio-search-btn">
                            <i className="fas fa-search"></i>
                        </button>
                    </form>
                </div>

                {/* --- BARRA DE FILTROS TIPO APP --- */}
                <div className="filters-scroll-container">
                    {QUICK_FILTERS.map((filter, index) => (
                        <div 
                            key={index} 
                            className={`filter-chip ${isFilterActive(filter) ? 'active' : ''}`}
                            onClick={() => handleFilterClick(filter)}
                        >
                            <span>{filter.icon}</span>
                            {filter.label}
                        </div>
                    ))}
                </div>

                {/* --- GRID DE RADIOS --- */}
                {error ? (
                    <div className="no-articles-message">{error}</div>
                ) : data.radios.length === 0 ? (
                    <div className="no-articles-message">No encontramos radios con ese criterio.</div>
                ) : (
                    <div className="stations-grid">
                        {data.radios.map(station => (
                            <StationCard key={station.uuid} station={station} />
                        ))}
                    </div>
                )}

                <Pagination 
                    paginaActual={data.paginaActual} 
                    totalPaginas={data.totalPaginas} 
                    queryParams={queryParams}
                />
            </div>
        </Layout>
    );
}

// --- TARJETA INTELIGENTE (CLICK TO PLAY) ---
function StationCard({ station }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    
    // ¿Está sonando esta radio exactamente?
    const isThisStation = currentStation?.uuid === station.uuid;
    const isThisPlaying = isThisStation && isPlaying;

    // Maneja el click en TODO el cuadro
    const handleCardClick = () => {
        if (isThisPlaying) {
            pauseStation();
        } else {
            playStation(station);
        }
    };

    // Maneja el click en el botón de info (evita que suene, solo navega)
    const handleInfoClick = (e) => {
        e.stopPropagation(); // Detiene que el click llegue al cuadro y le de Play
        // El Link se encarga de navegar
    };

    return (
        <div 
            className={`station-card ${isThisPlaying ? 'playing' : ''}`}
            onClick={handleCardClick}
            title="Toca para escuchar"
        >
            {/* Indicador visual si está sonando */}
            {isThisPlaying && (
                <div className="playing-indicator">
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                </div>
            )}

            {/* Botón Flotante para ir a DETALLES/SEO */}
            <Link 
                href={`/radio/${station.uuid}`} 
                className="station-info-btn"
                onClick={handleInfoClick}
                title="Ver detalles y descripción"
            >
                <i className="fas fa-info"></i>
            </Link>

            <div className="station-logo-wrapper">
                <img 
                    src={station.logo || PLACEHOLDER_LOGO} 
                    alt={`Escuchar ${station.nombre}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                />
            </div>
            
            {/* Quitamos el Link del título para que no confunda, ahora todo el card es click */}
            <div className="station-title">
                {station.nombre}
            </div>
            
            <span className="station-location">
                {station.pais}
            </span>
        </div>
    );
}

function Pagination({ paginaActual, totalPaginas, queryParams }) {
    if (totalPaginas <= 1) return null;
    const baseParams = new URLSearchParams();
    if (queryParams.query) baseParams.set('query', queryParams.query);
    if (queryParams.pais) baseParams.set('pais', queryParams.pais);
    if (queryParams.genero) baseParams.set('genero', queryParams.genero);

    const prevPage = Math.max(1, paginaActual - 1);
    const nextPage = Math.min(totalPaginas, paginaActual + 1);

    const buildLink = (page) => {
        const p = new URLSearchParams(baseParams);
        p.set('pagina', page);
        return `/radios?${p.toString()}`;
    };

    return (
        <div className="pagination-container">
            <Link href={buildLink(prevPage)} className={`pagination-btn ${paginaActual === 1 ? 'disabled' : ''}`}>
                &laquo; Anterior
            </Link>
            <span className="page-info">Página {paginaActual}</span>
            <Link href={buildLink(nextPage)} className={`pagination-btn ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                Siguiente &raquo;
            </Link>
        </div>
    );
}