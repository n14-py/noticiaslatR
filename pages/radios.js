import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
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
    context.res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=60');

    const { query, pais, genero, pagina: pagina_raw, tab: tab_raw } = context.query;
    
    const queryParams = {
        query: query || null,
        pais: pais || null,
        genero: genero || null,
        pagina: parseInt(pagina_raw) || 1,
        tab: tab_raw || 'radios'
    };

    let url = '';
    let tituloPagina = queryParams.tab === 'podcasts' ? "Podcast de Noticias y Audio Artículos" : "Radios en Vivo";
    
    if (queryParams.tab === 'podcasts') {
        url = `${API_URL}/articles?limite=${LIMITE_POR_PAGINA}&pagina=${queryParams.pagina}&audio=true&hasAudio=true`;
        if (queryParams.pais) {
            url += `&pais=${encodeURIComponent(queryParams.pais)}&country=${encodeURIComponent(queryParams.pais)}`;
            tituloPagina = `Podcasts y Noticias en Audio de ${queryParams.pais}`;
        }
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
                    ? { articles: [], totalPaginas: 1, paginaActual: 1 } 
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
    const scrollRefPais = useRef(null);
    const scrollRefGenero = useRef(null);

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
    
    const items = isPodcasts 
        ? (data.articles || data.noticias || data.data || []) 
        : (data.radios || []);
        
    const totalPaginas = data.totalPaginas || data.totalPages || 1;
    const paginaActual = data.paginaActual || data.currentPage || 1;

    // Estructura de marcado de datos estructurados (SEO)
    const seoSchema = isPodcasts ? {
        "@context": "https://schema.org",
        "@type": "PodcastSeries",
        "name": "Noticias.lat Podcasts",
        "description": "Escucha las últimas noticias en audio continuo y reportajes automatizados de Latinoamérica.",
        "url": "https://noticias.lat/radios?tab=podcasts",
        "webFeed": "https://noticias.lat/api/articles?audio=true"
    } : {
        "@context": "https://schema.org",
        "@type": "RadioStation",
        "name": "Radios en Vivo - Noticias.lat",
        "description": "Acceso instantáneo a miles de estaciones de radio en vivo de toda Latinoamérica.",
        "url": "https://noticias.lat/radios"
    };

    return (
        <Layout>
            <Head>
                <title>{`${tituloPagina} | Noticias.lat`}</title>
                <meta name="description" content={`Escucha gratis ${tituloPagina} en Noticias.lat. El mayor catálogo de audio de Latinoamérica, reproducción continua y optimización de datos.`} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`https://noticias.lat/radios?tab=${queryParams.tab}`} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchema) }} />
            </Head>

            <div className="container main-content">
                
                {/* SELECTOR DE TABS REDISEÑADO */}
                <div className="radio-page-header" style={{ paddingTop: '20px' }}>
                    <div className="tabs-container" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '25px', background: '#f1f5f9', padding: '6px', borderRadius: '40px', maxWidth: '450px', margin: '0 auto 30px auto' }}>
                        <button 
                            className={`tab-btn ${!isPodcasts ? 'active' : ''}`}
                            onClick={() => handleTabChange('radios')}
                            style={{ flex: 1, padding: '12px 24px', borderRadius: '35px', border: 'none', background: !isPodcasts ? '#2563eb' : 'transparent', color: !isPodcasts ? '#fff' : '#64748b', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: !isPodcasts ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none' }}
                        >
                            📻 Radios en Vivo
                        </button>
                        <button 
                            className={`tab-btn ${isPodcasts ? 'active' : ''}`}
                            onClick={() => handleTabChange('podcasts')}
                            style={{ flex: 1, padding: '12px 24px', borderRadius: '35px', border: 'none', background: isPodcasts ? '#2563eb' : 'transparent', color: isPodcasts ? '#fff' : '#64748b', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: isPodcasts ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none' }}
                        >
                            🎙️ Podcast / Audios
                        </button>
                    </div>

                    <h1 className="article-title-main" style={{ fontSize: '2.4rem', marginBottom: '0.75rem', textAlign: 'center', fontWeight: '800', letterSpacing: '-0.5px' }}>
                        {tituloPagina}
                    </h1>
                    <p style={{marginBottom: '2.5rem', color: '#64748b', fontSize: '1.15rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.5'}}>
                        {isPodcasts ? 'Crea tu propia playlist de noticias continuas y escucha los acontecimientos de tu región en audio.' : 'Explora miles de estaciones de radio en vivo. Música, deportes e información al instante.'}
                    </p>
                    
                    {!isPodcasts && (
                        <form className="radio-search-container" onSubmit={handleSearchSubmit} style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                            <input 
                                type="text" 
                                className="radio-search-input"
                                placeholder="Buscar emisora por nombre (Ej: Disney, Mitre, Los 40...)" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="radio-search-btn">
                                <i className="fas fa-search"></i>
                            </button>
                        </form>
                    )}
                </div>

                {/* FILTROS DE PAÍSES (CON SOPORTE TOTAL DE DESPLAZAMIENTO FLUIDO Y TÁCTIL) */}
                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px', fontWeight: '800', letterSpacing: '1.2px' }}>
                        Filtrar por País
                    </h3>
                    <div 
                        className="filters-scroll-container" 
                        ref={scrollRefPais}
                        style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '12px', paddingLeft: '2px', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {COUNTRY_FILTERS.map((filter, index) => (
                            <div 
                                key={index} 
                                className={`filter-chip ${isActive('pais', filter.pais || filter.code) ? 'active' : ''}`}
                                onClick={() => handleFilterClick('pais', filter.pais || filter.code)}
                                style={{ flex: '0 0 auto', scrollSnapAlign: 'start', cursor: 'pointer', padding: '10px 18px', borderRadius: '20px', background: isActive('pais', filter.pais || filter.code) ? '#2563eb' : '#fff', color: isActive('pais', filter.pais || filter.code) ? '#fff' : '#334155', fontWeight: '600', fontSize: '0.9rem', border: '1px solid #e2e8f0', transition: 'all 0.2s ease', userSelect: 'none' }}
                            >
                                {filter.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* FILTROS DE GÉNEROS / CATEGORÍAS */}
                {!isPodcasts && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px', fontWeight: '800', letterSpacing: '1.2px' }}>
                            Categorías Populares
                        </h3>
                        <div 
                            className="filters-scroll-container" 
                            ref={scrollRefGenero}
                            style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '12px', paddingLeft: '2px', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {GENRE_FILTERS.map((filter, index) => (
                                <div 
                                    key={index} 
                                    className={`filter-chip ${isActive('genero', filter.genero) ? 'active' : ''}`}
                                    onClick={() => handleFilterClick('genero', filter.genero)}
                                    style={{ flex: '0 0 auto', scrollSnapAlign: 'start', cursor: 'pointer', padding: '10px 18px', borderRadius: '20px', background: isActive('genero', filter.genero) ? '#2563eb' : '#fff', color: isActive('genero', filter.genero) ? '#fff' : '#334155', fontWeight: '600', fontSize: '0.9rem', border: '1px solid #e2e8f0', transition: 'all 0.2s ease', userSelect: 'none' }}
                            >
                                    {filter.label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CUADRÍCULA DE CONTENIDO REESTRUCTURADA */}
                {error ? (
                    <div className="no-articles-message" style={{ textAlign: 'center', padding: '3rem 0', color: '#ef4444', fontWeight: '600' }}>{error}</div>
                ) : items.length === 0 ? (
                    <div className="no-articles-message" style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <i className={isPodcasts ? "fas fa-podcast" : "fas fa-broadcast-tower"} style={{ fontSize: '3.5rem', color: '#94a3b8', marginBottom: '1.25rem' }}></i>
                        <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: '700' }}>
                            {isPodcasts ? 'No se encontraron audio noticias' : 'No encontramos emisoras'}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>Intenta seleccionar otro país de la lista o limpia los filtros aplicados.</p>
                        <button onClick={() => router.push(`/radios?tab=${queryParams.tab}`)} className="pagination-btn" style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                            Restablecer todos los filtros
                        </button>
                    </div>
                ) : (
                    <div className="stations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '20px' }}>
                        {items.map((item) => (
                            isPodcasts 
                            ? <PodcastCard key={item._id || item.uuid || item.slug} article={item} queryParams={queryParams} />
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
            
            {/* INYECCIÓN DE ESTILOS CSS REQUERIDOS PARA EL DESPLAZAMIENTO FLUIDO Y EFECTOS SKEW */}
            <style jsx global>{`
                .filters-scroll-container::-webkit-scrollbar {
                    display: none !important;
                }
                .station-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 16px;
                    text-align: center;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    height: 100%;
                    min-height: 220px;
                }
                .station-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
                    border-color: #cbd5e1;
                }
                .station-card.playing {
                    border-color: #2563eb;
                    background: #f0f5ff;
                }
                .station-logo-wrapper {
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                    border: 1px solid #f1f5f9;
                }
                .station-logo-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .station-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 4px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.3;
                }
                .station-location {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 600;
                }
                .station-info-btn {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 28px;
                    height: 28px;
                    background: #f1f5f9;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    font-size: 0.8rem;
                    transition: all 0.2s ease;
                    z-index: 2;
                }
                .station-info-btn:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .playing-indicator {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    display: flex;
                    gap: 3px;
                    align-items: flex-end;
                    height: 16px;
                    z-index: 2;
                }
                .bar-anim {
                    width: 3px;
                    height: 100%;
                    background: #2563eb;
                    animation: bounce 0.6s ease infinite alternate;
                }
                .bar-anim:nth-child(2) { animation-delay: 0.2s; }
                .bar-anim:nth-child(3) { animation-delay: 0.4s; }
                @keyframes bounce {
                    0% { height: 4px; }
                    100% { height: 16px; }
                }
            `}</style>
        </Layout>
    );
}

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
                {station.pais || 'Latinoamérica'}
            </span>
        </div>
    );
}

function PodcastCard({ article, queryParams }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    const router = useRouter();
    
    const podcastId = article._id || article.uuid || article.slug;
    const isThisPodcast = currentStation?.uuid === podcastId;
    const isThisPlaying = isThisPodcast && isPlaying;

    // Mapeo seguro de campos de audio e imagen procedentes del backend de artículos
    const finalAudioUrl = article.audioUrl || article.audio || '';
    const finalImageUrl = article.imageUrl || article.imagen || PLACEHOLDER_LOGO;
    const finalTitle = article.title || article.titulo || 'Noticia en Audio';

    const handleCardClick = () => {
        if (isThisPlaying) {
            pauseStation();
        } else {
            const podcastData = {
                uuid: podcastId,
                nombre: finalTitle,
                pais: article.country || article.pais || queryParams.pais || 'Internacional',
                logo: finalImageUrl,
                stream_url: finalAudioUrl, 
                isPodcast: true
            };
            playStation(podcastData);
        }
    };

    return (
        <div 
            className={`station-card ${isThisPlaying ? 'playing' : ''}`}
            onClick={handleCardClick}
            title={`Escuchar: ${finalTitle}`}
        >
            {isThisPlaying && (
                <div className="playing-indicator">
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                </div>
            )}

            <button 
                className="station-info-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/articulo/${article.slug || article._id}`);
                }}
                title="Leer Noticia Completa"
                style={{ border: 'none', cursor: 'pointer' }}
            >
                <i className="fas fa-external-link-alt"></i>
            </button>

            <div className="station-logo-wrapper" style={{ borderRadius: '14px' }}>
                <img 
                    src={finalImageUrl} 
                    alt={finalTitle}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                />
            </div>
            
            <div className="station-title" style={{ fontSize: '0.88rem' }}>
                {finalTitle.trim()}
            </div>
            
            <span className="station-location" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className={isThisPlaying ? "fas fa-pause-circle" : "fas fa-play-circle"}></i> 
                {isThisPlaying ? 'Pausar' : 'Escuchar'}
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
        <div className="pagination-container" style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
            {paginaActual > 1 && (
                <Link href={buildLink(prevPage)} className="pagination-btn" style={{ padding: '10px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
                    &laquo; Anterior
                </Link>
            )}
            
            <span className="page-info" style={{ fontWeight: '700', color: '#64748b', fontSize: '0.95rem', padding: '0 8px' }}>
                Página {paginaActual} de {totalPaginas}
            </span>
            
            {paginaActual < totalPaginas && (
                <Link href={buildLink(nextPage)} className="pagination-btn" style={{ padding: '10px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Siguiente &raquo;
                </Link>
            )}
        </div>
    );
}