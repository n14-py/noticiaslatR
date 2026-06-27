import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

export const runtime = 'experimental-edge';
const API_URL = 'https://api.noticias.lat';

export async function getServerSideProps(context) {
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=1800, stale-while-revalidate=86400'
    );

    const { query } = context;
    const page = parseInt(query.page || '1', 10);
    const limit = 24;
    
    let endpoint = `${API_URL}/api/radio/buscar?pagina=${page}&limite=${limit}`;
    if (query.pais) endpoint += `&pais=${query.pais}`;
    if (query.genero) endpoint += `&genero=${query.genero}`;
    if (query.q) endpoint += `&query=${query.q}`;

    try {
        const [resRadios, resPaises, resGeneros] = await Promise.all([
            fetch(endpoint),
            fetch(`${API_URL}/api/radio/paises`),
            fetch(`${API_URL}/api/radio/generos`)
        ]);

        const dataRadios = resRadios.ok ? await resRadios.json() : { radios: [], totalPaginas: 1, paginaActual: 1 };
        const dataPaises = resPaises.ok ? await resPaises.json() : [];
        const dataGeneros = resGeneros.ok ? await resGeneros.json() : [];

        return {
            props: {
                initialRadios: dataRadios.radios || [],
                pagination: {
                    currentPage: dataRadios.paginaActual || page,
                    totalPages: dataRadios.totalPaginas || 1
                },
                paises: dataPaises,
                generos: dataGeneros,
                initialQuery: query.q || '',
                initialPais: query.pais || '',
                initialGenero: query.genero || ''
            }
        };
    } catch (error) {
        console.error("Error fetching radios:", error);
        return {
            props: {
                initialRadios: [],
                pagination: { currentPage: 1, totalPages: 1 },
                paises: [],
                generos: [],
                initialQuery: '',
                initialPais: '',
                initialGenero: '',
                error: true
            }
        };
    }
}

export default function RadiosPage({ initialRadios, pagination, paises, generos, initialQuery, initialPais, initialGenero, error }) {
    const [radios, setRadios] = useState(initialRadios);
    const [currentPage, setCurrentPage] = useState(pagination.currentPage);
    const [totalPages, setTotalPages] = useState(pagination.totalPages);
    
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [activePais, setActivePais] = useState(initialPais);
    const [activeGenero, setActiveGenero] = useState(initialGenero);
    const [loading, setLoading] = useState(false);

    // Estado del reproductor
    const [playerState, setPlayerState] = useState({
        isPlaying: false,
        currentStation: null,
        isLoading: false
    });
    const audioRef = useRef(null);

    const fetchRadios = async (page = 1, pais = activePais, genero = activeGenero, q = searchTerm) => {
        setLoading(true);
        try {
            let url = `${API_URL}/api/radio/buscar?pagina=${page}&limite=24`;
            if (pais) url += `&pais=${pais}`;
            if (genero) url += `&genero=${genero}`;
            if (q) url += `&query=${q}`;

            const res = await fetch(url);
            const data = await res.json();
            
            setRadios(data.radios || []);
            setCurrentPage(data.paginaActual || page);
            setTotalPages(data.totalPaginas || 1);
            
            // Actualizar URL sin recargar para poder compartir
            const urlParams = new URLSearchParams();
            if (page > 1) urlParams.set('page', page);
            if (pais) urlParams.set('pais', pais);
            if (genero) urlParams.set('genero', genero);
            if (q) urlParams.set('q', q);
            
            const newUrl = urlParams.toString() ? `/radios?${urlParams.toString()}` : '/radios';
            window.history.pushState({}, '', newUrl);

        } catch (error) {
            console.error("Error al buscar radios:", error);
        }
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchRadios(1, activePais, activeGenero, searchTerm);
    };

    const togglePlay = (station) => {
        if (playerState.currentStation?.uuid === station.uuid) {
            // Es la misma estación, pausar/reproducir
            if (playerState.isPlaying) {
                audioRef.current.pause();
                setPlayerState(prev => ({ ...prev, isPlaying: false }));
            } else {
                audioRef.current.play();
                setPlayerState(prev => ({ ...prev, isPlaying: true }));
            }
        } else {
            // Nueva estación
            setPlayerState({ isPlaying: false, currentStation: station, isLoading: true });
            if (audioRef.current) {
                audioRef.current.src = station.stream_url;
                audioRef.current.play()
                    .then(() => setPlayerState({ isPlaying: true, currentStation: station, isLoading: false }))
                    .catch(e => {
                        console.error("Error reproduciendo stream:", e);
                        setPlayerState(prev => ({ ...prev, isLoading: false }));
                        alert("No se pudo conectar al stream de esta radio.");
                    });
            }
        }
    };

    const closePlayer = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
        setPlayerState({ isPlaying: false, currentStation: null, isLoading: false });
    };

    return (
        <Layout>
            <Head>
                <title>Radios en Vivo - Noticias.lat</title>
                <meta name="description" content="Escucha miles de estaciones de radio en vivo de toda Latinoamérica y el mundo." />
            </Head>

            <div className="container main-content" style={{ marginTop: '2rem', marginBottom: playerState.currentStation ? '100px' : '4rem' }}>
                
                <div className="radio-page-header">
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--color-texto-titulos)', marginBottom: '1rem' }}>
                        <i className="fas fa-broadcast-tower" style={{ color: 'var(--color-primario)' }}></i> Radios en Vivo
                    </h1>
                    <p style={{ color: 'var(--color-texto-suave)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                        Explora más de 3000 estaciones. Escucha noticias, música y deportes sin interrupciones.
                    </p>

                    <form className="radio-search-container" onSubmit={handleSearch}>
                        <input 
                            type="text" 
                            className="radio-search-input" 
                            placeholder="Buscar radio, ciudad o frecuencia..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="radio-search-btn">
                            <i className="fas fa-search"></i> Buscar
                        </button>
                    </form>
                </div>

                {/* FILTROS POR PAÍS */}
                <div className="filters-scroll-container">
                    <button 
                        className={`filter-chip ${!activePais ? 'active' : ''}`}
                        onClick={() => { setActivePais(''); fetchRadios(1, '', activeGenero, searchTerm); }}
                    >
                        Todos los Países
                    </button>
                    {paises.map(p => (
                        <button 
                            key={p.code} 
                            className={`filter-chip ${activePais === p.code ? 'active' : ''}`}
                            onClick={() => { setActivePais(p.code); fetchRadios(1, p.code, activeGenero, searchTerm); }}
                        >
                            <img src={`https://flagcdn.com/w20/${p.code.toLowerCase()}.png`} alt={p.name} style={{ width: '16px', borderRadius: '2px' }} />
                            {p.name}
                        </button>
                    ))}
                </div>

                {/* FILTROS POR GÉNERO */}
                <div className="filters-scroll-container" style={{ marginBottom: '3rem' }}>
                    <button 
                        className={`filter-chip ${!activeGenero ? 'active' : ''}`}
                        onClick={() => { setActiveGenero(''); fetchRadios(1, activePais, '', searchTerm); }}
                    >
                        Todos los Géneros
                    </button>
                    {generos.slice(0, 20).map(g => (
                        <button 
                            key={g.name} 
                            className={`filter-chip ${activeGenero === g.name ? 'active' : ''}`}
                            onClick={() => { setActiveGenero(g.name); fetchRadios(1, activePais, g.name, searchTerm); }}
                        >
                            {g.name}
                        </button>
                    ))}
                </div>

                {/* ESTADO DE CARGA & RESULTADOS */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '3rem', color: 'var(--color-primario)' }}></i>
                        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>Sintonizando estaciones...</p>
                    </div>
                ) : error || radios.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '12px', border: '1px dashed var(--color-borde)' }}>
                        <i className="fas fa-satellite-dish" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--color-texto-titulos)' }}>No hay señal</h3>
                        <p style={{ color: 'var(--color-texto-suave)' }}>No encontramos radios con esos filtros. Intenta otra búsqueda.</p>
                        <button onClick={() => { setSearchTerm(''); setActivePais(''); setActiveGenero(''); fetchRadios(1, '', '', ''); }} className="btn-primary" style={{ marginTop: '1rem', padding: '10px 20px', borderRadius: '50px', background: 'var(--color-primario)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                            Ver todas
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="stations-grid">
                            {radios.map(station => {
                                const isPlayingThis = playerState.currentStation?.uuid === station.uuid && playerState.isPlaying;
                                
                                return (
                                    <div 
                                        key={station.uuid} 
                                        className={`station-card ${playerState.currentStation?.uuid === station.uuid ? 'playing' : ''}`}
                                        onClick={() => togglePlay(station)}
                                    >
                                        {isPlayingThis && (
                                            <div className="playing-indicator">
                                                <div className="bar-anim"></div>
                                                <div className="bar-anim"></div>
                                                <div className="bar-anim"></div>
                                            </div>
                                        )}
                                        <div className="station-logo-wrapper">
                                            <img src={station.logo || PLACEHOLDER_IMG} alt={station.nombre} onError={(e) => e.target.src = PLACEHOLDER_IMG} />
                                            <div className="station-play-overlay">
                                                <i className={`fas ${isPlayingThis ? 'fa-pause' : 'fa-play'}`} style={{ color: 'white', fontSize: '2rem' }}></i>
                                            </div>
                                        </div>
                                        <h3 className="station-title">{station.nombre}</h3>
                                        <div className="station-location">
                                            {station.pais_code && <img src={`https://flagcdn.com/w20/${station.pais_code.toLowerCase()}.png`} alt="flag" style={{ width: '14px', marginRight: '5px', verticalAlign: 'middle', borderRadius: '2px' }} />}
                                            {station.pais}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* PAGINACIÓN */}
                        {totalPages > 1 && (
                            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem', gap: '15px' }}>
                                <button 
                                    onClick={() => fetchRadios(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                    style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid var(--color-borde)', background: currentPage === 1 ? '#f1f5f9' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                                >
                                    <i className="fas fa-chevron-left"></i> Anterior
                                </button>
                                <span style={{ fontWeight: '600', color: 'var(--color-texto-suave)' }}>
                                    {currentPage} / {totalPages}
                                </span>
                                <button 
                                    onClick={() => fetchRadios(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid var(--color-borde)', background: currentPage === totalPages ? '#f1f5f9' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                                >
                                    Siguiente <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* REPRODUCTOR FIJO INFERIOR */}
            <div id="player-bar" className={playerState.currentStation ? 'active' : ''}>
                <div className="player-content-wrapper player-minimized-view">
                    <div className="player-info">
                        <img src={playerState.currentStation?.logo || PLACEHOLDER_IMG} alt="Logo" onError={(e) => e.target.src = PLACEHOLDER_IMG} />
                        <div className="player-info-text">
                            <h4>{playerState.currentStation?.nombre || 'Sintonizando...'}</h4>
                            <p>{playerState.currentStation?.pais || ''}</p>
                        </div>
                    </div>
                    <div className="player-controls">
                        <button className={`player-btn control-center ${playerState.isLoading ? 'is-loading' : ''}`} onClick={() => togglePlay(playerState.currentStation)}>
                            <i className={`fas ${playerState.isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                    </div>
                    <div className="player-buttons">
                        <button id="player-close-btn" className="player-btn" onClick={closePlayer}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>

            <audio ref={audioRef} style={{ display: 'none' }} preload="none"></audio>
        </Layout>
    );
}