import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function Juegos() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewerState, setViewerState] = useState({
        isOpen: false,
        url: '',
        title: '',
        isLoading: false
    });
    const viewerRef = useRef(null);

    // LISTA COMPLETA DE 31 JUEGOS
    const games = [
        {
            title: "Bloxdhop.io",
            description: "Salta por los bloques en este adictivo juego de parkour multijugador.",
            thumbnail: "https://imgs.crazygames.com/bloxdhop-io_16x9/20250829023851/bloxdhop-io_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/bloxdhop-io",
            category: "io"
        },
        {
            title: "Art of Defense",
            description: "Protege tu base de oleadas enemigas en este épico Tower Defense.",
            thumbnail: "https://imgs.crazygames.com/aod---art-of-defense_16x9/20260429163424/aod---art-of-defense_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/aod---art-of-defense",
            category: "action"
        },
        {
            title: "Leek Factory Tycoon",
            description: "Gestiona tu propia fábrica y conviértete en un magnate industrial.",
            thumbnail: "https://imgs.crazygames.com/leek-factory-tycoon_16x9/20260330040926/leek-factory-tycoon_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/leek-factory-tycoon",
            category: "simulator"
        },
        {
            title: "BuildNow GG",
            description: "Construye y dispara en este battle royale táctico de entrenamiento.",
            thumbnail: "https://imgs.crazygames.com/buildnow-gg_16x9/20251229084241/buildnow-gg_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/buildnow-gg",
            category: "action"
        },
        {
            title: "Castle Craft",
            description: "Construye y defiende tu castillo contra los invasores.",
            thumbnail: "https://imgs.crazygames.com/castle-craft_16x9/20250203045450/castle-craft_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/castle-craft",
            category: "action"
        },
        {
            title: "Fragen",
            description: "Resuelve acertijos y supera los niveles en este desafiante juego.",
            thumbnail: "https://imgs.crazygames.com/fragen_16x9/20251022094210/fragen_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/fragen",
            category: "puzzle"
        },
        {
            title: "Fortzone Battle Royale",
            description: "Battle Royale con construcción de fortalezas y mucha acción.",
            thumbnail: "https://imgs.crazygames.com/fortzone-battle-royale-xkd_16x9/20250513044222/fortzone-battle-royale-xkd_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/fortzone-battle-royale-xkd",
            category: "action"
        },
        {
            title: "Traffic Rider",
            description: "Juego de motocicletas en tráfico real a toda velocidad.",
            thumbnail: "https://imgs.crazygames.com/traffic-rider-vvq_16x9/20250526021507/traffic-rider-vvq_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/traffic-rider-vvq",
            category: "racing"
        },
        {
            title: "Paper.io 2",
            description: "Conquista territorio en este exitoso juego .io multijugador.",
            thumbnail: "https://imgs.crazygames.com/paper-io-2_16x9/20250214024143/paper-io-2_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/paper-io-2",
            category: "io"
        },
        {
            title: "Rally Racer Dirt",
            description: "Derrapa y corre en las mejores pistas de rally de tierra.",
            thumbnail: "https://imgs.crazygames.com/rally-racer-dirt_16x9/20260220034629/rally-racer-dirt_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/rally-racer-dirt",
            category: "racing"
        },
        {
            title: "Italian Brainrot Clicker",
            description: "Juego de clicker con temática italiana y mucho humor.",
            thumbnail: "https://imgs.crazygames.com/italian-brainrot-clicker-usp_16x9/20250430033904/italian-brainrot-clicker-usp_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/italian-brainrot-clicker-usp",
            category: "io"
        },
        {
            title: "Tung Tung Sahur Obby",
            description: "Supera los obstáculos en este divertido desafío de plataformas.",
            thumbnail: "https://imgs.crazygames.com/tung-tung-sahur-obby-challenge_16x9/20250520041244/tung-tung-sahur-obby-challenge_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/tung-tung-sahur-obby-challenge",
            category: "adventure"
        },
        {
            title: "Prison Escape",
            description: "Escapa de la prisión evadiendo guardias en este emocionante juego.",
            thumbnail: "https://imgs.crazygames.com/prison-escape-lnj_16x9/20250509092652/prison-escape-lnj_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/prison-escape-lnj",
            category: "action"
        },
        {
            title: "Death City Zombie",
            description: "Sobrevive a la letal invasión zombie en la ciudad.",
            thumbnail: "https://imgs.crazygames.com/death-city-zombie-invasion-liq_16x9/20241017024657/death-city-zombie-invasion-liq_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/death-city-zombie-invasion-liq",
            category: "shooter"
        },
        {
            title: "Truck Driving Simulator",
            description: "Conviértete en un experto simulador de conducción de camiones.",
            thumbnail: "https://imgs.crazygames.com/truck-driving-simulator-game_16x9/20241022081951/truck-driving-simulator-game_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/truck-driving-simulator-game",
            category: "simulator"
        },
        {
            title: "Count Masters",
            description: "Acumula la mayor cantidad de stickmans en tu multitud.",
            thumbnail: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/count-masters-stickman-games",
            category: "io"
        },
        {
            title: "Bridge Race",
            description: "Carrera para construir puentes y llegar primero a la meta.",
            thumbnail: "https://imgs.crazygames.com/bridge-race_16x9/20241227062023/bridge-race_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/bridge-race",
            category: "io"
        },
        {
            title: "Solar Smash",
            description: "Simulador sandbox de destrucción planetaria a gran escala.",
            thumbnail: "https://imgs.crazygames.com/solar-smash_16x9/20240722073047/solar-smash_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/solar-smash",
            category: "simulator"
        },
        {
            title: "Fighter Aircraft Pilot",
            description: "Surca los cielos y conviértete en piloto de combate aéreo.",
            thumbnail: "https://imgs.crazygames.com/fighter-aircraft-pilotb.png?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/fighter-aircraft-pilot",
            category: "simulator"
        },
        {
            title: "Attack of Duty",
            description: "Juego de disparos lleno de acción al estilo Call of Duty.",
            thumbnail: "https://imgs.crazygames.com/attack-of-duty_16x9/20240606142630/attack-of-duty_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/attack-of-duty",
            category: "shooter"
        },
        {
            title: "Roling Balls Sea Race",
            description: "Carrera desafiante de bolas rodantes sobre el mar.",
            thumbnail: "https://imgs.crazygames.com/roling-balls-sea-race_16x9/20241029074138/roling-balls-sea-race_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/roling-balls-sea-race",
            category: "racing"
        },
        {
            title: "Screw Out Bolts",
            description: "Rompecabezas mecánico de destornillar tuercas y tornillos.",
            thumbnail: "https://imgs.crazygames.com/screw-out-bolts-and-nuts_16x9/20250507101325/screw-out-bolts-and-nuts_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/screw-out-bolts-and-nuts",
            category: "puzzle"
        },
        {
            title: "Squid Game Online",
            description: "Los letales juegos del calamar en versión multijugador.",
            thumbnail: "https://imgs.crazygames.com/squid-game-online_16x9/20250403161318/squid-game-online_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/squid-game-online",
            category: "io"
        },
        {
            title: "Amazing Crime",
            description: "Aventura libre de stickman en el peligroso mundo del crimen.",
            thumbnail: "https://imgs.crazygames.com/amazing-crime-strange-stickman-rope-vice-vegas.png?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/amazing-crime-strange-stickman",
            category: "adventure"
        }
    ];

    const categories = [
        { id: 'all', name: 'Todos' },
        { id: 'action', name: 'Acción' },
        { id: 'io', name: '.IO (Multijugador)' },
        { id: 'simulator', name: 'Simuladores' },
        { id: 'puzzle', name: 'Puzzles' },
        { id: 'racing', name: 'Carreras' },
        { id: 'adventure', name: 'Aventura' },
        { id: 'shooter', name: 'Shooter' }
    ];

    const filteredGames = games.filter(game => {
        const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              game.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const openGame = (url, title) => {
        setViewerState({ isOpen: true, url, title, isLoading: true });
        
        // Simular tiempo de carga del iframe para mostrar animación
        setTimeout(() => {
            setViewerState(prev => ({ ...prev, isLoading: false }));
            
            // Auto pantalla completa en PC si es posible
            if (window.innerWidth > 768 && viewerRef.current && viewerRef.current.requestFullscreen) {
                viewerRef.current.requestFullscreen().catch(() => {});
            }
        }, 1500);
    };

    const closeViewer = () => {
        setViewerState({ isOpen: false, url: '', title: '', isLoading: false });
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    };

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && viewerState.isOpen) closeViewer();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewerState.isOpen]);

    return (
        <Layout>
            <Head>
                <title>Zona Gamer - Juegos Gratis en Noticias.lat</title>
                <meta name="description" content="Disfruta de los mejores juegos online gratuitos directamente en Noticias.lat. Acción, carreras, puzzles y más." />
            </Head>

            <div className="container main-content" style={{ marginTop: '2rem', marginBottom: '5rem' }}>
                
                {/* CABECERA */}
                <div style={{ textAlign: 'center', marginBottom: '3rem', background: 'linear-gradient(135deg, var(--color-tech-bg, #0f172a) 0%, #1e40af 100%)', padding: '3rem 1rem', borderRadius: '16px', color: 'white', boxShadow: 'var(--sombra-md)' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 1rem 0', letterSpacing: '-1px' }}>
                        <i className="fas fa-gamepad" style={{ color: '#60a5fa', marginRight: '10px' }}></i>
                        Zona Gamer
                    </h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>
                        Tu pausa informativa. Disfruta de nuestra selección de juegos gratuitos sin necesidad de descargas.
                    </p>
                </div>

                {/* FILTROS Y BÚSQUEDA */}
                <div className="filters-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '2rem' }}>
                    <div className="search-box" style={{ position: 'relative', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                        <input 
                            type="text" 
                            placeholder="Buscar juego..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '15px 20px 15px 45px', borderRadius: '50px', border: '1px solid var(--color-borde)', fontSize: '1rem', boxShadow: 'var(--sombra-sm)', outline: 'none' }}
                        />
                    </div>

                    <div className="filters-scroll-container" style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    padding: '8px 20px', borderRadius: '50px', border: '1px solid var(--color-borde)', 
                                    background: activeCategory === cat.id ? 'var(--color-primario)' : 'white',
                                    color: activeCategory === cat.id ? 'white' : 'var(--color-texto-cuerpo)',
                                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* GRID DE JUEGOS (Estilo Bento adaptado) */}
                <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                    {filteredGames.length > 0 ? filteredGames.map((game, index) => (
                        <div key={index} className="article-card" onClick={() => openGame(game.url, game.title)} style={{ cursor: 'pointer' }}>
                            <div className="card-image-wrapper">
                                <img src={game.thumbnail} alt={game.title} loading="lazy" />
                                <div className="card-play-overlay">
                                    <div className="card-play-icon">
                                        <i className="fas fa-play"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="card-tags">
                                    <span className="tag" style={{ background: '#e0f2fe', color: '#0284c7' }}>{game.category.toUpperCase()}</span>
                                </div>
                                <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{game.title}</h3>
                                <p className="card-excerpt" style={{ fontSize: '0.95rem', WebkitLineClamp: 2 }}>{game.description}</p>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '12px', border: '1px dashed var(--color-borde)' }}>
                            <i className="fas fa-ghost" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-texto-titulos)' }}>No encontramos ese juego</h3>
                            <p style={{ color: 'var(--color-texto-suave)' }}>Prueba con otros términos o explora las categorías.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* VISOR DEL JUEGO (MODAL FULLSCREEN) */}
            {viewerState.isOpen && (
                <div className="game-viewer-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
                    zIndex: 9999, display: 'flex', flexDirection: 'column',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    
                    {/* Toolbar Superior */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', background: '#0f172a', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img src="/favicon.png" alt="Logo" style={{ width: '30px', height: '30px', borderRadius: '6px' }} />
                            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '700' }}>{viewerState.title}</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => viewerRef.current?.requestFullscreen()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                <i className="fas fa-expand"></i> Pantalla Completa
                            </button>
                            <button onClick={closeViewer} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                <i className="fas fa-times"></i> Cerrar
                            </button>
                        </div>
                    </div>

                    {/* Contenedor del Iframe */}
                    <div ref={viewerRef} style={{ flex: 1, position: 'relative', width: '100%', height: '100%', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {viewerState.isLoading && (
                            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', color: 'white' }}>
                                <div className="loader-spinner" style={{ width: '60px', height: '60px', border: '5px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--color-primario)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Cargando {viewerState.title}...</h3>
                            </div>
                        )}
                        <iframe 
                            src={viewerState.url}
                            style={{ width: '100%', height: '100%', border: 'none', opacity: viewerState.isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in' }}
                            allowFullScreen
                            scrolling="no"
                        ></iframe>
                    </div>

                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .filter-chip:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--sombra-md);
                }
            `}</style>

        </Layout>
    );
}