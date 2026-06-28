import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export const runtime = 'experimental-edge';

// Corrección de URL base para igualar al index.js
const API_URL = 'https://api.noticias.lat';
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
    let tituloPagina = queryParams.tab === 'podcasts' ? "Podcast y Audionoticias" : "Radios en Vivo";
    
    try {
        let items = [];
        let totalPaginas = 1;
        let paginaActual = queryParams.pagina;

        if (queryParams.tab === 'podcasts') {
            // BACKEND FIX: Usamos la misma lógica robusta del index.js para asegurar que traiga las noticias con audio
            url = `${API_URL}/api/articles?sitio=noticias.lat&limite=${LIMITE_POR_PAGINA}&pagina=${queryParams.pagina}&hasAudio=true`;
            if (queryParams.pais) {
                url += `&pais=${encodeURIComponent(queryParams.pais)}`;
                tituloPagina = `Audionoticias de ${queryParams.pais}`;
            }
            
            const res = await fetch(url);
            if (!res.ok) throw new Error('Error fetching podcasts');
            const data = await res.json();
            
            // Extracción a prueba de fallos (Mismo sistema que index.js)
            items = data.articulos || data.articles || data.docs || (Array.isArray(data) ? data : []);
            totalPaginas = data.totalPaginas || data.totalPages || 1;
            paginaActual = data.paginaActual || data.page || queryParams.pagina;

        } else {
            url = `${API_URL}/api/radio/buscar?limite=${LIMITE_POR_PAGINA}&pagina=${queryParams.pagina}`;
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

            const res = await fetch(url);
            if (!res.ok) throw new Error('Error fetching radios');
            const data = await res.json();
            
            items = data.radios || [];
            totalPaginas = data.totalPaginas || data.totalPages || 1;
            paginaActual = data.paginaActual || data.currentPage || queryParams.pagina;
        }

        return { 
            props: { 
                items, 
                pagination: { totalPaginas, paginaActual },
                queryParams, 
                tituloPagina 
            } 
        };
    } catch (error) {
        console.error("Error en radios.js:", error);
        return {
            props: {
                items: [],
                pagination: { totalPaginas: 1, paginaActual: 1 },
                queryParams,
                tituloPagina,
                error: "No pudimos conectar con los servidores. Intenta luego.",
            },
        };
    }
}

export default function RadiosPage({ items, pagination, queryParams, tituloPagina, error }) {
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

    // Marcado de datos estructurados
    const seoSchema = isPodcasts ? {
        "@context": "https://schema.org",
        "@type": "PodcastSeries",
        "name": "Noticias.lat Podcasts",
        "description": "Escucha las últimas noticias en audio y reportajes automatizados de Latinoamérica.",
        "url": "https://noticias.lat/radios?tab=podcasts"
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
                <meta name="description" content={`Escucha gratis ${tituloPagina} en Noticias.lat. Reproducción continua y optimización de datos.`} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`https://noticias.lat/radios?tab=${queryParams.tab}`} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchema) }} />
            </Head>

            <div className="container main-content" style={{ maxWidth: '1400px' }}>
                
                <div className="radio-page-header" style={{ paddingTop: '20px' }}>
                    <div className="tabs-container" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '25px', background: '#f8fafc', padding: '8px', borderRadius: '40px', maxWidth: '500px', margin: '0 auto 30px auto', border: '1px solid #e2e8f0' }}>
                        <button 
                            className={`tab-btn ${!isPodcasts ? 'active' : ''}`}
                            onClick={() => handleTabChange('radios')}
                            style={{ flex: 1, padding: '12px 24px', borderRadius: '35px', border: 'none', background: !isPodcasts ? 'var(--color-primario)' : 'transparent', color: !isPodcasts ? '#fff' : '#64748b', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: !isPodcasts ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}
                        >
                            📻 Radios en Vivo
                        </button>
                        <button 
                            className={`tab-btn ${isPodcasts ? 'active' : ''}`}
                            onClick={() => handleTabChange('podcasts')}
                            style={{ flex: 1, padding: '12px 24px', borderRadius: '35px', border: 'none', background: isPodcasts ? 'var(--color-primario)' : 'transparent', color: isPodcasts ? '#fff' : '#64748b', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isPodcasts ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}
                        >
                            🎙️ Audionoticias
                        </button>
                    </div>

                    <h1 className="article-title-main" style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center', fontWeight: '900', color: 'var(--color-texto-titulos)' }}>
                        {tituloPagina}
                    </h1>
                    <p style={{marginBottom: '2.5rem', color: '#64748b', fontSize: '1.1rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem auto', lineHeight: '1.6'}}>
                        {isPodcasts ? 'Escucha los reportajes completos, análisis y noticias de último minuto narrados de forma inteligente.' : 'Explora miles de estaciones de radio en vivo. Música, deportes e información al instante desde cualquier lugar.'}
                    </p>
                    
                    {!isPodcasts && (
                        <form className="radio-search-container" onSubmit={handleSearchSubmit} style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto', display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                className="radio-search-input"
                                placeholder="Buscar emisora por nombre..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ flex: 1, padding: '15px 20px', borderRadius: '50px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                            />
                            <button type="submit" className="radio-search-btn" style={{ background: 'var(--color-primario)', color: 'white', border: 'none', borderRadius: '50px', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}>
                                <i className="fas fa-search"></i>
                            </button>
                        </form>
                    )}
                </div>

                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-texto-titulos)', marginBottom: '15px', fontWeight: '900', borderLeft: '4px solid var(--color-primario)', paddingLeft: '10px' }}>
                        Selecciona tu Región
                    </h3>
                    <div 
                        className="filters-scroll-container" 
                        ref={scrollRefPais}
                        style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '15px', paddingLeft: '2px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {COUNTRY_FILTERS.map((filter, index) => (
                            <div 
                                key={index} 
                                onClick={() => handleFilterClick('pais', filter.pais || filter.code)}
                                style={{ flex: '0 0 auto', cursor: 'pointer', padding: '10px 20px', borderRadius: '50px', background: isActive('pais', filter.pais || filter.code) ? 'var(--color-primario)' : '#f8fafc', color: isActive('pais', filter.pais || filter.code) ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid', borderColor: isActive('pais', filter.pais || filter.code) ? 'var(--color-primario)' : '#e2e8f0', transition: 'all 0.2s ease', userSelect: 'none' }}
                            >
                                {filter.label}
                            </div>
                        ))}
                    </div>
                </div>

                {!isPodcasts && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-texto-titulos)', marginBottom: '15px', fontWeight: '900', borderLeft: '4px solid #ff0000', paddingLeft: '10px' }}>
                            Categorías Destacadas
                        </h3>
                        <div 
                            className="filters-scroll-container" 
                            ref={scrollRefGenero}
                            style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '15px', paddingLeft: '2px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {GENRE_FILTERS.map((filter, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => handleFilterClick('genero', filter.genero)}
                                    style={{ flex: '0 0 auto', cursor: 'pointer', padding: '10px 20px', borderRadius: '50px', background: isActive('genero', filter.genero) ? '#ff0000' : '#f8fafc', color: isActive('genero', filter.genero) ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid', borderColor: isActive('genero', filter.genero) ? '#ff0000' : '#e2e8f0', transition: 'all 0.2s ease', userSelect: 'none' }}
                            >
                                    {filter.label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error ? (
                    <div className="no-articles-message" style={{ textAlign: 'center', padding: '3rem 0', color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem' }}>{error}</div>
                ) : items.length === 0 ? (
                    <div className="no-articles-message" style={{ textAlign: 'center', padding: '5rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                        <i className={isPodcasts ? "fas fa-microphone-alt-slash" : "fas fa-broadcast-tower"} style={{ fontSize: '4rem', color: '#94a3b8', marginBottom: '1.5rem' }}></i>
                        <h3 style={{ fontSize: '1.8rem', color: 'var(--color-texto-titulos)', marginBottom: '1rem', fontWeight: '800' }}>
                            {isPodcasts ? 'No hay audionoticias en esta región' : 'No encontramos emisoras'}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>Intenta seleccionar otro país de la lista o limpia los filtros aplicados.</p>
                        <button onClick={() => router.push(`/radios?tab=${queryParams.tab}`)} style={{ background: 'var(--color-primario)', color: '#fff', padding: '12px 25px', borderRadius: '50px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                            Ver catálogo completo
                        </button>
                    </div>
                ) : (
                    <div className="stations-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isPodcasts ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'repeat(auto-fill, minmax(170px, 1fr))', 
                        gap: isPodcasts ? '25px' : '20px' 
                    }}>
                        {items.map((item) => (
                            isPodcasts 
                            ? <NativePodcastCard key={item._id || item.slug} article={item} />
                            : <StationCard key={item.uuid} station={item} />
                        ))}
                    </div>
                )}

                <Pagination 
                    paginaActual={pagination.paginaActual} 
                    totalPaginas={pagination.totalPaginas} 
                    queryParams={queryParams}
                />
            </div>
            
            <style jsx global>{`
                .filters-scroll-container::-webkit-scrollbar {
                    display: none !important;
                }
                
                /* Estilos Radio Stations */
                .station-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px 15px;
                    text-align: center;
                    cursor: pointer;
                    position: relative;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    height: 100%;
                    min-height: 220px;
                }
                .station-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
                    border-color: var(--color-primario);
                }
                .station-card.playing {
                    border-color: var(--color-primario);
                    background: #f0f5ff;
                    box-shadow: 0 0 0 2px var(--color-primario);
                }
                .station-logo-wrapper {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 15px;
                    border: 1px solid #e2e8f0;
                }
                .station-logo-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .station-title {
                    font-size: 1rem;
                    font-weight: 800;
                    color: var(--color-texto-titulos);
                    margin-bottom: 5px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.3;
                }
                .station-location {
                    font-size: 0.8rem;
                    color: #64748b;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .playing-indicator {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    display: flex;
                    gap: 4px;
                    align-items: flex-end;
                    height: 18px;
                    z-index: 2;
                }
                .bar-anim {
                    width: 4px;
                    height: 100%;
                    background: var(--color-primario);
                    animation: bounce 0.6s ease infinite alternate;
                    border-radius: 2px;
                }
                .bar-anim:nth-child(2) { animation-delay: 0.2s; }
                .bar-anim:nth-child(3) { animation-delay: 0.4s; }
                @keyframes bounce {
                    0% { height: 4px; }
                    100% { height: 18px; }
                }

                /* Estilos Nativos para Podcast (Audionoticias) */
                .podcast-native-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .podcast-native-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .podcast-native-card audio::-webkit-media-controls-panel {
                    background-color: #f8fafc;
                }
                .podcast-native-card audio::-webkit-media-controls-play-button {
                    background-color: var(--color-primario);
                    border-radius: 50%;
                }
            `}</style>
        </Layout>
    );
}

// COMPONENTE: Estación de Radio Clásica (Mantiene uso del Contexto Global)
function StationCard({ station }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    const router = useRouter();
    
    const isThisStation = currentStation?.uuid === station.uuid;
    const isThisPlaying = isThisStation && isPlaying;

    return (
        <div 
            className={`station-card ${isThisPlaying ? 'playing' : ''}`}
            onClick={() => isThisPlaying ? pauseStation() : playStation(station)}
            title={`Escuchar ${station.nombre}`}
        >
            {isThisPlaying && (
                <div className="playing-indicator">
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                    <div className="bar-anim"></div>
                </div>
            )}

            <button 
                onClick={(e) => { e.stopPropagation(); router.push(`/radio/${station.uuid}`); }}
                style={{ position: 'absolute', top: '15px', right: '15px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                title="Ver detalles"
            >
                <i className="fas fa-info"></i>
            </button>

            <div className="station-logo-wrapper">
                <img 
                    src={station.logo || PLACEHOLDER_LOGO} 
                    alt={station.nombre}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                />
            </div>
            
            <div className="station-title">{station.nombre.trim()}</div>
            <span className="station-location">{station.pais || 'Latinoamérica'}</span>
        </div>
    );
}

// NUEVO COMPONENTE: Podcast Nativo (IGNORA EL PLAYER GLOBAL - 100% FUNCIONALIDAD DIRECTA)
function NativePodcastCard({ article }) {
    const audioUrl = article.audioUrl || article.audio;
    const imageUrl = article.imagen || article.imageUrl || PLACEHOLDER_LOGO;
    const title = article.titulo || article.title || 'Noticia sin título';
    const desc = article.descripcion || 'Escucha el reporte completo en formato audio.';
    const category = article.categoria || 'Noticias';
    const date = article.fecha ? new Date(article.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '';

    return (
        <div className="podcast-native-card">
            <Link href={`/articulo/${article._id}`} style={{ display: 'flex', gap: '15px', padding: '15px', textDecoration: 'none', color: 'inherit', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '90px', height: '90px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                    />
                    <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                        <i className="fas fa-microphone"></i>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.65rem', background: 'var(--color-primario)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>{category}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}><i className="far fa-clock"></i> {date}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 6px 0', lineHeight: '1.3', color: 'var(--color-texto-titulos)', fontWeight: '800', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {desc}
                    </p>
                </div>
            </Link>
            
            {/* REPRODUCTOR HTML5 NATIVO INSERTADO DIRECTAMENTE (A PRUEBA DE FALLOS) */}
            <div style={{ padding: '10px 15px', background: '#f8fafc' }}>
                {audioUrl ? (
                    <audio 
                        controls 
                        src={audioUrl} 
                        preload="none"
                        style={{ width: '100%', height: '40px', outline: 'none' }}
                    >
                        Tu navegador no soporta audios.
                    </audio>
                ) : (
                    <div style={{ padding: '10px', textAlign: 'center', color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <i className="fas fa-exclamation-triangle"></i> Audio no disponible
                    </div>
                )}
            </div>
        </div>
    );
}

// Paginación Estilizada
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
        <div className="pagination-container" style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
            {paginaActual > 1 ? (
                <Link href={buildLink(prevPage)} style={{ padding: '12px 24px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '50px', color: '#334155', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                    <i className="fas fa-arrow-left"></i> Anterior
                </Link>
            ) : (
                <span style={{ padding: '12px 24px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50px', color: '#94a3b8', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'not-allowed' }}>
                    <i className="fas fa-arrow-left"></i> Anterior
                </span>
            )}
            
            <span style={{ fontWeight: '800', color: 'var(--color-texto-titulos)', fontSize: '1rem', padding: '0 10px' }}>
                Página {paginaActual} de {totalPaginas}
            </span>
            
            {paginaActual < totalPaginas ? (
                <Link href={buildLink(nextPage)} style={{ padding: '12px 24px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '50px', color: '#334155', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                    Siguiente <i className="fas fa-arrow-right"></i>
                </Link>
            ) : (
                <span style={{ padding: '12px 24px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50px', color: '#94a3b8', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'not-allowed' }}>
                    Siguiente <i className="fas fa-arrow-right"></i>
                </span>
            )}
        </div>
    );
}