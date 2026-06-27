import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

export const runtime = 'experimental-edge';

const API_URL = 'https://api.noticias.lat/api';
const PLACEHOLDER_LOGO = '/images/placeholder.jpg'; 
const LIMITE_POR_PAGINA = 30; 

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
    // Caché estricto de 30 minutos (1800 segundos) para que vuele la web
    context.res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');

    const { query, pais, genero, pagina: pagina_raw, tab: tab_raw } = context.query;
    
    const queryParams = {
        query: query || null,
        pais: pais || null,
        genero: genero || null,
        pagina: parseInt(pagina_raw) || 1,
        tab: tab_raw || 'radios'
    };

    let url = '';
    let tituloPagina = queryParams.tab === 'podcasts' ? "Podcasts y Noticias en Audio" : "Radios en Vivo";
    
    if (queryParams.tab === 'podcasts') {
        // Asumiendo endpoint de artículos con audio o podcast en el backend
        url = `${API_URL}/articles?limit=${LIMITE_POR_PAGINA}&page=${queryParams.pagina}&hasAudio=true`;
        if (queryParams.pais) url += `&country=${encodeURIComponent(queryParams.pais)}`;
    } else {
        url = `${API_URL}/radio/buscar?limite=${LIMITE_POR_PAGINA}&pagina=${queryParams.pagina}`;
        if (queryParams.query) {
            url += `&query=${encodeURIComponent(queryParams.query)}`;
            tituloPagina = `Resultados: "${queryParams.query}"`;
        } else if (queryParams.pais) {
            const paisObj = COUNTRY_FILTERS.find(p => p.pais === queryParams.pais);
            const emoji = paisObj ? paisObj.label.split(' ')[0] : '📻';
            url += `&pais=${encodeURIComponent(queryParams.pais)}`;
            tituloPagina = `${emoji} Radios de ${queryParams.pais}`;
        } else if (queryParams.genero) {
            url += `&genero=${encodeURIComponent(queryParams.genero)}`;
            tituloPagina = `Género: ${queryParams.genero}`;
        }
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error API`);
        const data = await res.json();
        
        return { props: { data, queryParams, tituloPagina } };
    } catch (error) {
        return {
            props: {
                data: queryParams.tab === 'podcasts' 
                    ? { articles: [], totalPages: 1, currentPage: 1 } 
                    : { radios: [], totalRadios: 0, totalPaginas: 1, paginaActual: 1 },
                queryParams,
                tituloPagina,
                error: "No pudimos conectar con los servidores. Intenta luego.",
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
        router.push(`/radios?tab=${queryParams.tab}&query=${encodeURIComponent(query)}`);
    };

    const handleFilterClick = (type, value) => {
        const params = new URLSearchParams();
        params.set('tab', queryParams.tab);
        
        if (value === null) {
            router.push(`/radios?tab=${queryParams.tab}`);
            return;
        }

        if (type === 'pais') params.set('pais', value);
        if (type === 'genero') params.set('genero', value);
        if (queryParams.query && type !== 'query') params.set('query', queryParams.query);
        
        router.push(`/radios?${params.toString()}`);
    };

    const handleTabChange = (newTab) => {
        router.push(`/radios?tab=${newTab}`);
    };

    const isActive = (type, value) => {
        if (value === null && !queryParams.pais && !queryParams.genero) return true;
        if (type === 'pais' && queryParams.pais === value) return true;
        if (type === 'genero' && queryParams.genero === value) return true;
        return false;
    };

    const isPodcasts = queryParams.tab === 'podcasts';
    
    // Adaptación para la respuesta de la API dependiendo del tab
    const items = isPodcasts ? (data.articles || []) : (data.radios || []);
    const totalPaginas = isPodcasts ? (data.totalPages || 1) : (data.totalPaginas || 1);
    const paginaActual = isPodcasts ? (data.currentPage || 1) : (data.paginaActual || 1);

    return (
        <Layout>
            <Head>
                <title>{`${tituloPagina} | Noticias.lat`}</title>
                <meta name="description" content="Escucha radios en vivo y playlists de noticias en formato podcast de toda Latinoamérica. Audio continuo y sin interrupciones." />
            </Head>

            <div className="container main-content">
                
                {/* HEADER Y TABS */}
                <div className="radio-page-header">
                    <div className="tabs-container" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                        <button 
                            className={`tab-btn ${!isPodcasts ? 'active' : ''}`}
                            onClick={() => handleTabChange('radios')}
                            style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', background: !isPodcasts ? '#2563eb' : '#e2e8f0', color: !isPodcasts ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}
                        >
                            📻 Radios en Vivo
                        </button>
                        <button 
                            className={`tab-btn ${isPodcasts ? 'active' : ''}`}
                            onClick={() => handleTabChange('podcasts')}
                            style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', background: isPodcasts ? '#2563eb' : '#e2e8f0', color: isPodcasts ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}
                        >
                            🎙️ Podcasts / Noticias
                        </button>
                    </div>

                    <h1 className="article-title-main" style={{ fontSize: '2.2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                        {tituloPagina}
                    </h1>
                    <p style={{marginBottom: '2rem', color: '#64748b', fontSize: '1.1rem', textAlign: 'center'}}>
                        {isPodcasts ? 'Escucha las noticias más recientes en audio continuo.' : 'Explora miles de estaciones en vivo. Música, noticias y deportes.'}
                    </p>
                    
                    {!isPodcasts && (
                        <form className="radio-search-container" onSubmit={handleSearchSubmit}>
                            <input 
                                type="text" 
                                className="radio-search-input"
                                placeholder="Buscar emisora (Ej: Disney, Mitre...)" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="radio-search-btn">
                                <i className="fas fa-search"></i>
                            </button>
                        </form>
                    )}
                </div>

                {/* FILTROS DE PAÍSES */}
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

                {/* FILTROS DE GÉNEROS (Solo para Radios) */}
                {!isPodcasts && (
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
                )}

                {/* GRID DE RESULTADOS */}
                {error ? (
                    <div className="no-articles-message">{error}</div>
                ) : items.length === 0 ? (
                    <div className="no-articles-message" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <i className={isPodcasts ? "fas fa-podcast" : "fas fa-broadcast-tower"} style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                        <h3>{isPodcasts ? 'No hay podcasts disponibles' : 'No encontramos radios'}</h3>
                        <p>Intenta seleccionar otro país o cambiar tu búsqueda.</p>
                        <button onClick={() => router.push(`/radios?tab=${queryParams.tab}`)} className="pagination-btn" style={{marginTop: '1rem'}}>
                            Ver todo
                        </button>
                    </div>
                ) : (
                    <div className="stations-grid">
                        {items.map(item => (
                            isPodcasts 
                            ? <PodcastCard key={item._id || item.uuid} article={item} queryParams={queryParams} />
                            : <StationCard key={item.uuid} station={item} />
                        ))}
                    </div>
                )}

                <Pagination 
                    paginaActual={paginaActual} 
                    totalPaginas={totalPaginas} 
                    queryParams={queryParams}
                />
            </div>
        </Layout>
    );
}

// TARJETA DE RADIO
function StationCard({ station }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    
    const isThisStation = currentStation?.uuid === station.uuid;
    const isThisPlaying = isThisStation && isPlaying;

    const handleCardClick = () => {
        if (isThisPlaying) {
            pauseStation();
        } else {
            playStation(station);
        }
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
                onClick={(e) => e.stopPropagation()}
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

// TARJETA DE PODCAST / NOTICIA CONTINUA
function PodcastCard({ article, queryParams }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    const router = useRouter();
    
    const podcastId = article._id || article.uuid;
    const isThisPodcast = currentStation?.uuid === podcastId;
    const isThisPlaying = isThisPodcast && isPlaying;

    const handleCardClick = () => {
        if (isThisPlaying) {
            pauseStation();
        } else {
            // Simulamos el objeto estación usando los datos del artículo para el reproductor
            const podcastData = {
                uuid: podcastId,
                nombre: article.title || 'Noticias Audio',
                pais: article.country || queryParams.pais || 'Latinoamérica',
                logo: article.imageUrl || PLACEHOLDER_LOGO,
                stream_url: article.audioUrl || '', 
                isPodcast: true
            };
            playStation(podcastData);
        }
    };

    return (
        <div 
            className={`station-card ${isThisPlaying ? 'playing' : ''}`}
            onClick={handleCardClick}
            title={`Escuchar Noticia`}
            style={{ border: isThisPlaying ? '2px solid #2563eb' : '' }}
        >
            {isThisPlaying && (
                <div className="playing-indicator" style={{ background: 'rgba(37, 99, 235, 0.9)' }}>
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                </div>
            )}

            <button 
                className="station-info-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/articulo/${article.slug || podcastId}`);
                }}
                title="Leer Noticia Completa"
            >
                <i className="fas fa-external-link-alt"></i>
            </button>

            <div className="station-logo-wrapper" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <img 
                    src={article.imageUrl || PLACEHOLDER_LOGO} 
                    alt={article.title || 'Podcast'}
                    loading="lazy"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                />
            </div>
            
            <div className="station-title" style={{ fontSize: '0.9rem', lineHeight: '1.3', marginTop: '10px' }}>
                {(article.title || '').substring(0, 50)}...
            </div>
            
            <span className="station-location" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                <i className="fas fa-play-circle" style={{ marginRight: '5px' }}></i> Reproducir
            </span>
        </div>
    );
}

function Pagination({ paginaActual, totalPaginas, queryParams }) {
    if (totalPaginas <= 1) return null;
    const baseParams = new URLSearchParams();
    if (queryParams.tab) baseParams.set('tab', queryParams.tab);
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
        <div className="pagination-container" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
            {paginaActual > 1 && (
                <Link href={buildLink(prevPage)} className="pagination-btn">
                    &laquo; Anterior
                </Link>
            )}
            
            <span className="page-info" style={{ fontWeight: 'bold', color: '#64748b' }}>
                Página {paginaActual} de {totalPaginas}
            </span>
            
            {paginaActual < totalPaginas && (
                <Link href={buildLink(nextPage)} className="pagination-btn">
                    Siguiente &raquo;
                </Link>
            )}
        </div>
    );
}