import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

// --- CONFIGURACIÓN CLOUDFLARE (Comentar con // en local si da error) ---
export const runtime = 'experimental-edge';

const API_URL = 'https://api.noticias.lat/api';
const PLACEHOLDER_LOGO = '/images/placeholder.jpg'; 
const LIMITE_POR_PAGINA = 30; // Aumentamos un poco para ver más radios

// --- LISTA COMPLETA DE PAÍSES Y FILTROS ---
const COUNTRY_FILTERS = [
    { label: '🌎 Todas', code: null },
    { label: '🇦🇷 Argentina', pais: 'Argentina' },
    { label: '🇧🇴 Bolivia', pais: 'Bolivia' },
    { label: '🇧🇷 Brasil', pais: 'Brazil' },
    { label: '🇨🇱 Chile', pais: 'Chile' },
    { label: '🇨🇴 Colombia', pais: 'Colombia' },
    { label: '🇨🇷 Costa Rica', pais: 'Costa Rica' },
    { label: '🇨🇺 Cuba', pais: 'Cuba' },
    { label: '🇪🇨 Ecuador', pais: 'Ecuador' },
    { label: '🇸🇻 El Salvador', pais: 'El Salvador' },
    { label: '🇪🇸 España', pais: 'Spain' },
    { label: '🇬🇹 Guatemala', pais: 'Guatemala' },
    { label: '🇭🇳 Honduras', pais: 'Honduras' },
    { label: '🇲🇽 México', pais: 'Mexico' },
    { label: '🇳🇮 Nicaragua', pais: 'Nicaragua' },
    { label: '🇵🇦 Panamá', pais: 'Panama' },
    { label: '🇵🇾 Paraguay', pais: 'Paraguay' },
    { label: '🇵🇪 Perú', pais: 'Peru' },
    { label: '🇩🇴 R. Dominicana', pais: 'Dominican Republic' },
    { label: '🇺🇾 Uruguay', pais: 'Uruguay' },
    { label: '🇺🇸 USA', pais: 'United States' },
    { label: '🇻🇪 Venezuela', pais: 'Venezuela' }
];

const GENRE_FILTERS = [
    { label: '📰 Noticias', genero: 'news' },
    { label: '🎵 Música', genero: 'pop' },
    { label: '⚽ Deportes', genero: 'sports' },
    { label: '✝️ Cristiana', genero: 'christian' },
    { label: '🎸 Rock', genero: 'rock' },
    { label: '💃 Latina', genero: 'latin' },
];

export async function getServerSideProps(context) {
    // Cache para velocidad en Cloudflare
    context.res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

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
        // Buscamos el emoji para el título
        const paisObj = COUNTRY_FILTERS.find(p => p.pais === queryParams.pais);
        const emoji = paisObj ? paisObj.label.split(' ')[0] : '📻';
        url += `&pais=${encodeURIComponent(queryParams.pais)}`;
        tituloPagina = `${emoji} Radios de ${queryParams.pais}`;
    } else if (queryParams.genero) {
        url += `&genero=${encodeURIComponent(queryParams.genero)}`;
        tituloPagina = `Género: ${queryParams.genero}`;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error API`);
        const data = await res.json();
        
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
    const scrollRef = useRef(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = searchTerm.trim();
        if (!query) return;
        router.push(`/radios?query=${encodeURIComponent(query)}`);
    };

    const handleFilterClick = (type, value) => {
        const params = new URLSearchParams();
        
        // Si es "Todas", limpiamos
        if (value === null) {
            router.push('/radios');
            return;
        }

        if (type === 'pais') params.set('pais', value);
        if (type === 'genero') params.set('genero', value);
        
        router.push(`/radios?${params.toString()}`);
    };

    // Verificar si un filtro está activo
    const isActive = (type, value) => {
        if (value === null && !queryParams.pais && !queryParams.genero) return true;
        if (type === 'pais' && queryParams.pais === value) return true;
        if (type === 'genero' && queryParams.genero === value) return true;
        return false;
    };

    return (
        <Layout>
            <Head>
                <title>{`${tituloPagina} | Noticias.lat`}</title>
                <meta name="description" content={`Escucha ${tituloPagina} gratis en Noticias.lat. Acceso instantáneo a miles de emisoras en vivo de toda Latinoamérica.`} />
            </Head>

            <div className="container main-content">
                
                {/* --- HEADER CON BUSCADOR --- */}
                <div className="radio-page-header">
                    <h1 className="article-title-main" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
                        {tituloPagina}
                    </h1>
                    <p style={{marginBottom: '2rem', color: '#64748b', fontSize: '1.1rem'}}>
                        Explora miles de estaciones en vivo. Música, noticias y deportes.
                    </p>
                    
                    <form className="radio-search-container" onSubmit={handleSearchSubmit}>
                        <input 
                            type="text" 
                            className="radio-search-input"
                            placeholder="Buscar emisora (Ej: Disney, Mitre, Los 40...)" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="radio-search-btn">
                            <i className="fas fa-search"></i>
                        </button>
                    </form>
                </div>

                {/* --- FILTROS DE PAÍSES (SCROLL HORIZONTAL) --- */}
                <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px', fontWeight: '700', letterSpacing: '1px' }}>
                        Filtrar por País
                    </h3>
                    <div className="filters-scroll-container" ref={scrollRef}>
                        {COUNTRY_FILTERS.map((filter, index) => (
                            <div 
                                key={index} 
                                className={`filter-chip ${isActive('pais', filter.pais || filter.code) ? 'active' : ''}`}
                                onClick={() => handleFilterClick('pais', filter.pais || filter.code)}
                            >
                                {filter.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- FILTROS DE GÉNEROS (SCROLL HORIZONTAL) --- */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px', fontWeight: '700', letterSpacing: '1px' }}>
                        Categorías Populares
                    </h3>
                    <div className="filters-scroll-container">
                        {GENRE_FILTERS.map((filter, index) => (
                            <div 
                                key={index} 
                                className={`filter-chip ${isActive('genero', filter.genero) ? 'active' : ''}`}
                                onClick={() => handleFilterClick('genero', filter.genero)}
                            >
                                {filter.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- GRID DE RADIOS --- */}
                {error ? (
                    <div className="no-articles-message">{error}</div>
                ) : data.radios.length === 0 ? (
                    <div className="no-articles-message">
                        <i className="fas fa-broadcast-tower" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                        <h3>No encontramos radios</h3>
                        <p>Intenta seleccionar otro país o busca con otro término.</p>
                        <button onClick={() => router.push('/radios')} className="pagination-btn" style={{marginTop: '1rem'}}>
                            Ver todas las radios
                        </button>
                    </div>
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
    
    // Verificamos por UUID
    const isThisStation = currentStation?.uuid === station.uuid;
    const isThisPlaying = isThisStation && isPlaying;

    const handleCardClick = () => {
        if (isThisPlaying) {
            pauseStation();
        } else {
            playStation(station);
        }
    };

    const handleInfoClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div 
            className={`station-card ${isThisPlaying ? 'playing' : ''}`}
            onClick={handleCardClick}
            title={`Escuchar ${station.nombre}`}
        >
            {isThisPlaying && (
                <div className="playing-indicator">
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                </div>
            )}

            <Link 
                href={`/radio/${station.uuid}`} 
                className="station-info-btn"
                onClick={handleInfoClick}
                title="Ver detalles"
            >
                <i className="fas fa-info"></i>
            </Link>

            <div className="station-logo-wrapper">
                <img 
                    src={station.logo || PLACEHOLDER_LOGO} 
                    alt={station.nombre}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                />
            </div>
            
            <div className="station-title">
                {station.nombre.trim()}
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
            {paginaActual > 1 && (
                <Link href={buildLink(prevPage)} className="pagination-btn">
                    &laquo; Anterior
                </Link>
            )}
            
            <span className="page-info">Página {paginaActual} de {totalPaginas}</span>
            
            {paginaActual < totalPaginas && (
                <Link href={buildLink(nextPage)} className="pagination-btn">
                    Siguiente &raquo;
                </Link>
            )}
        </div>
    );
}