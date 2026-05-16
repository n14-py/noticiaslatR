import React, { useState, useRef } from 'react';
import Head from 'next/head';

export default function NotilatGaming() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [menuActive, setMenuActive] = useState(false);
    const [viewerState, setViewerState] = useState({ 
        isOpen: false, 
        url: '', 
        title: '', 
        isLoading: false, 
        isFullscreen: false 
    });

    const viewerRef = useRef(null);

    // Todos tus juegos originales intactos
    const games = [
        {
            title: "Italian Brainrot Quiz",
            description: "Pon a prueba tus conocimientos con este divertido quiz italiano.",
            thumbnail: "https://imgs.crazygames.com/italianbrainrotquiz-io_16x9/20250522065211/italianbrainrotquiz-io_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/italianbrainrotquiz-io",
            category: "puzzle"
        },
        {
            title: "Italian Brainrot Clicker",
            description: "Juego de clicker con temática italiana.",
            thumbnail: "https://imgs.crazygames.com/italian-brainrot-clicker-usp_16x9/20250430033904/italian-brainrot-clicker-usp_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/italian-brainrot-clicker-usp",
            category: "io"
        },
        {
            title: "Tung Tung Sahur Obby",
            description: "Supera los obstáculos en este desafío de plataformas.",
            thumbnail: "https://imgs.crazygames.com/tung-tung-sahur-obby-challenge_16x9/20250520041244/tung-tung-sahur-obby-challenge_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/tung-tung-sahur-obby-challenge",
            category: "adventure"
        },
        {
            title: "Prison Escape",
            description: "Escapa de la prisión en este emocionante juego.",
            thumbnail: "https://imgs.crazygames.com/prison-escape-lnj_16x9/20250509092652/prison-escape-lnj_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/prison-escape-lnj",
            category: "action"
        },
        {
            title: "Death City Zombie",
            description: "Sobrevive a la invasión zombie en la ciudad.",
            thumbnail: "https://imgs.crazygames.com/death-city-zombie-invasion-liq_16x9/20241017024657/death-city-zombie-invasion-liq_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/death-city-zombie-invasion-liq",
            category: "shooter"
        },
        {
            title: "Bullet Force",
            description: "Juego de disparos multijugador en primera persona.",
            thumbnail: "https://imgs.crazygames.com/bullet-force-multiplayer_16x9/20250422192901/bullet-force-multiplayer_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/bullet-force-multiplayer",
            category: "shooter"
        },
        {
            title: "Rally Racer Dirt",
            description: "Carreras de rally en terrenos difíciles.",
            thumbnail: "https://imgs.crazygames.com/rally-racer-dirt_16x9/20250227034748/rally-racer-dirt_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/rally-racer-dirt",
            category: "racing"
        },
        {
            title: "Truck Driving Simulator",
            description: "Simulador de conducción de camiones.",
            thumbnail: "https://imgs.crazygames.com/truck-driving-simulator-game_16x9/20241022081951/truck-driving-simulator-game_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/truck-driving-simulator-game",
            category: "simulator"
        },
        {
            title: "Fortzone Battle Royale",
            description: "Battle Royale con construcción de fortalezas.",
            thumbnail: "https://imgs.crazygames.com/fortzone-battle-royale-xkd_16x9/20250513044222/fortzone-battle-royale-xkd_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/fortzone-battle-royale-xkd",
            category: "action"
        },
        {
            title: "Count Masters",
            description: "Juego de stickman con multitudes.",
            thumbnail: "https://imgs.crazygames.com/count-masters-stickman-games_16x9/20250220041115/count-masters-stickman-games_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/count-masters-stickman-games",
            category: "io"
        },
        {
            title: "Bridge Race",
            description: "Carrera para construir puentes y llegar primero.",
            thumbnail: "https://imgs.crazygames.com/bridge-race_16x9/20241227062023/bridge-race_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/bridge-race",
            category: "io"
        },
        {
            title: "Solar Smash",
            description: "Simulador de destrucción planetaria.",
            thumbnail: "https://imgs.crazygames.com/solar-smash_16x9/20240722073047/solar-smash_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/solar-smash",
            category: "simulator"
        },
        {
            title: "Fighter Aircraft Pilot",
            description: "Conviértete en piloto de combate.",
            thumbnail: "https://imgs.crazygames.com/fighter-aircraft-pilotb.png?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/fighter-aircraft-pilot",
            category: "simulator"
        },
        {
            title: "Traffic Rider",
            description: "Juego de motocicletas en tráfico real.",
            thumbnail: "https://imgs.crazygames.com/traffic-rider-vvq_16x9/20250328101418/traffic-rider-vvq_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/traffic-rider-vvq",
            category: "racing"
        },
        {
            title: "Attack of Duty",
            description: "Juego de disparos estilo Call of Duty.",
            thumbnail: "https://imgs.crazygames.com/attack-of-duty_16x9/20240606142630/attack-of-duty_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/attack-of-duty",
            category: "shooter"
        },
        {
            title: "Roling Balls Sea Race",
            description: "Carrera de bolas rodantes en el mar.",
            thumbnail: "https://imgs.crazygames.com/roling-balls-sea-race_16x9/20241029074138/roling-balls-sea-race_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/roling-balls-sea-race",
            category: "racing"
        },
        {
            title: "Screw Out Bolts",
            description: "Juego de destornillar tuercas y tornillos.",
            thumbnail: "https://imgs.crazygames.com/screw-out-bolts-and-nuts_16x9/20250507101325/screw-out-bolts-and-nuts_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/screw-out-bolts-and-nuts",
            category: "puzzle"
        },
        {
            title: "Squid Game Online",
            description: "Juegos del calamar en versión online.",
            thumbnail: "https://imgs.crazygames.com/squid-game-online_16x9/20250403161318/squid-game-online_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/squid-game-online",
            category: "io"
        },
        {
            title: "Paper.io 2",
            description: "Conquista territorio en este juego .io.",
            thumbnail: "https://imgs.crazygames.com/paper-io-2_16x9/20250214024143/paper-io-2_16x9-cover?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/paper-io-2",
            category: "io"
        },
        {
            title: "Amazing Crime",
            description: "Aventura de stickman en el mundo del crimen.",
            thumbnail: "https://imgs.crazygames.com/amazing-crime-strange-stickman-rope-vice-vegas.png?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/amazing-crime-strange-stickman",
            category: "adventure"
        },
        {
            title: "Metrage",
            description: "Juego de estrategia y medición.",
            thumbnail: "https://imgs.crazygames.com/games/metrage/thumb-1562259732086.png?metadata=none&quality=70&width=599",
            url: "https://www.crazygames.com/embed/metrage",
            category: "puzzle"
        }
    ];

    const filteredGames = games.filter(game => {
        const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              game.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const openGame = (url, title, fullscreen) => {
        setViewerState({ isOpen: true, url: '', title, isLoading: true, isFullscreen: fullscreen });
        
        setTimeout(() => {
            setViewerState(prev => ({ ...prev, url, isLoading: false }));
            if (fullscreen && viewerRef.current) {
                viewerRef.current.requestFullscreen().catch(err => console.error(err));
            }
        }, 1500);
    };

    const closeViewer = () => {
        setViewerState({ isOpen: false, url: '', title: '', isLoading: false, isFullscreen: false });
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <>
            <Head>
                <title>NOTILAT Gaming - Juegos y Diversión Gratis Online</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <meta name="description" content="Juega los mejores juegos gratis en línea en NOTILAT Gaming. Acción, aventura, puzzle y más. Plataforma 100% gratuita." />
                
                {/* CÓDIGO DE VERIFICACIÓN DE ADSENSE AQUÍ */}
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5461370198299696" crossorigin="anonymous"></script>
                
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
            </Head>

            <div className="gaming-body">
                {/* Cabecera */}
                <header>
                    <a href="/" className="logo">NOTILAT Gaming</a>
                    <div className="user-info">
                        <button className="menu-btn" onClick={() => setMenuActive(!menuActive)}>
                            <div className="menu-dot"></div>
                            <div className="menu-dot"></div>
                            <div className="menu-dot"></div>
                        </button>
                    </div>
                    <div className={`menu ${menuActive ? 'active' : ''}`}>
                        <div className="menu-item" onClick={() => { document.getElementById('legal-footer').scrollIntoView({behavior: 'smooth'}); setMenuActive(false); }}>
                            <i className="fas fa-question-circle"></i>
                            <span>¿Qué es NOTILAT Gaming?</span>
                        </div>
                        <div className="menu-item" onClick={() => { document.getElementById('legal-footer').scrollIntoView({behavior: 'smooth'}); setMenuActive(false); }}>
                            <i className="fas fa-file-contract"></i>
                            <span>Términos y Privacidad</span>
                        </div>
                    </div>
                </header>

                {/* Contenedor Principal */}
                <div className="container">
                    
                    {/* Barra de Búsqueda */}
                    <div className="search-container">
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Buscar juegos..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-btn">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>

                    {/* Categorías */}
                    <div className="categories">
                        {[
                            {id: 'all', name: 'Todos'}, {id: 'action', name: 'Acción'}, 
                            {id: 'adventure', name: 'Aventura'}, {id: 'puzzle', name: 'Puzzle'}, 
                            {id: 'racing', name: 'Carreras'}, {id: 'shooter', name: 'Shooter'}, 
                            {id: 'simulator', name: 'Simulador'}, {id: 'io', name: '.io'}
                        ].map(cat => (
                            <div 
                                key={cat.id}
                                className={`category ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.name}
                            </div>
                        ))}
                    </div>

                    <h2 className="section-title">Juegos Populares</h2>
                    
                    {/* Grilla de Juegos */}
                    <div className="games-grid">
                        {filteredGames.length > 0 ? filteredGames.map((game, i) => (
                            <div className="game-card" key={i}>
                                <img src={game.thumbnail} alt={game.title} className="game-thumbnail" />
                                <div className="game-info">
                                    <div className="game-title">{game.title}</div>
                                    <div className="game-description">{game.description}</div>
                                    <div className="game-actions">
                                        <button className="btn btn-primary" onClick={() => openGame(game.url, game.title, false)}>
                                            <i className="fas fa-play"></i> Jugar
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => openGame(game.url, game.title, true)}>
                                            <i className="fas fa-expand"></i> Pantalla
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p style={{gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#666'}}>No se encontraron juegos con esa búsqueda.</p>
                        )}
                    </div>
                </div>

                {/* FOOTER LEGAL PARA ADSENSE (Requisito fundamental para revisión) */}
                <footer id="legal-footer" className="legal-footer">
                    <div className="container footer-content">
                        <div className="footer-section">
                            <h3>Quiénes Somos</h3>
                            <p>NOTILAT Gaming es una plataforma de entretenimiento dedicada a ofrecer acceso gratuito a una amplia variedad de minijuegos online para usuarios de todas las edades. Nuestro objetivo es brindar un espacio seguro y divertido.</p>
                        </div>
                        <div className="footer-section">
                            <h3>Política de Privacidad</h3>
                            <p>Respetamos profundamente tu privacidad. No recopilamos datos personales sensibles. Nuestro sitio web utiliza cookies técnicas estrictamente necesarias para el funcionamiento del portal y mejorar la experiencia de navegación del usuario.</p>
                        </div>
                        <div className="footer-section">
                            <h3>Términos y Condiciones</h3>
                            <p>El uso de este sitio web es totalmente gratuito. Los juegos alojados en esta plataforma pertenecen a sus respectivos creadores o distribuidores autorizados. Al utilizar la web, aceptas disfrutar del contenido de manera responsable.</p>
                        </div>
                        <div className="footer-section">
                            <h3>Contacto</h3>
                            <p>¿Tienes alguna duda, sugerencia o reclamación sobre el contenido? Contáctanos enviando un correo electrónico directamente a nuestro equipo de soporte técnico: <strong>contacto@noticias.lat</strong></p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} NOTILAT Gaming. Todos los derechos reservados.</p>
                    </div>
                </footer>

                {/* Visor del Juego (Iframe Overlay) */}
                {viewerState.isOpen && (
                    <>
                        <div className="overlay" onClick={closeViewer} style={{display: 'block'}}></div>
                        <div className="game-viewer" ref={viewerRef} style={{display: 'flex'}}>
                            <div className="viewer-header">
                                <div className="viewer-title">{viewerState.title}</div>
                                <button className="viewer-close" onClick={closeViewer}>&times;</button>
                            </div>
                            <iframe 
                                className="game-iframe" 
                                src={viewerState.url} 
                                frameBorder="0" 
                                allow="gamepad *;"
                            ></iframe>
                            {viewerState.isLoading && (
                                <div className="loading-overlay" style={{display: 'flex'}}>
                                    <div className="loading-spinner"></div>
                                    <div className="loading-text">Cargando juego...</div>
                                    <button className="skip-btn" onClick={() => setViewerState(prev => ({...prev, isLoading: false}))}>Saltar</button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ESTILOS GLOBALES INTEGRADOS (Todo en un solo archivo) */}
            <style jsx global>{`
                :root {
                    --primary: #4834d4; /* Color principal: Azul Gamer Moderno */
                    --secondary: #686de0; /* Color secundario */
                    --accent: #00cec9; /* Acento Neon */
                    --dark: #1e272e;
                    --light: #f5f6fa;
                    --warning: #fdcb6e;
                    --shadow: 0 5px 15px rgba(0,0,0,0.1);
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Poppins', sans-serif;
                    -webkit-tap-highlight-color: transparent;
                }

                .gaming-body {
                    background-color: var(--light);
                    color: var(--dark);
                    min-height: 100vh;
                    padding-top: 80px;
                    padding-bottom: 0px;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .gaming-body header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background-color: var(--light);
                    box-shadow: var(--shadow);
                    z-index: 100;
                }

                .logo {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--primary);
                    background: linear-gradient(45deg, var(--primary), var(--accent));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    cursor: pointer;
                    text-decoration: none;
                }

                .user-info { display: flex; align-items: center; gap: 15px; }

                .menu-btn {
                    background: none; border: none; font-size: 24px;
                    color: var(--primary); cursor: pointer;
                    display: flex; flex-direction: column; gap: 5px; padding: 5px;
                }
                .menu-dot { width: 5px; height: 5px; background-color: var(--primary); border-radius: 50%; }

                .menu {
                    position: fixed; top: 70px; right: 20px; background-color: white;
                    border-radius: 10px; box-shadow: var(--shadow); padding: 15px;
                    z-index: 101; display: none;
                }
                .menu.active { display: block; }
                .menu-item {
                    padding: 10px 15px; border-radius: 8px; cursor: pointer;
                    transition: all 0.3s ease; display: flex; align-items: center; gap: 10px;
                }
                .menu-item:hover { background-color: rgba(72, 52, 212, 0.1); color: var(--primary); }

                .section-title {
                    font-size: 24px; margin-bottom: 20px; color: var(--primary);
                    position: relative; padding-bottom: 10px;
                }
                .section-title::after {
                    content: ''; position: absolute; bottom: 0; left: 0;
                    width: 50px; height: 3px; background: linear-gradient(45deg, var(--primary), var(--accent));
                    border-radius: 3px;
                }

                .categories {
                    display: flex; overflow-x: auto; gap: 10px; padding: 10px 0; margin-bottom: 20px; scrollbar-width: thin;
                }
                .categories::-webkit-scrollbar { height: 5px; }
                .categories::-webkit-scrollbar-track { background: var(--light); }
                .categories::-webkit-scrollbar-thumb { background-color: var(--primary); border-radius: 5px; }
                
                .category {
                    padding: 8px 15px; background-color: white; border-radius: 20px;
                    cursor: pointer; white-space: nowrap; font-size: 14px; font-weight: 500;
                    box-shadow: var(--shadow); transition: all 0.3s;
                }
                .category:hover, .category.active {
                    background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; transform: translateY(-2px);
                }

                .search-container { display: flex; margin-bottom: 20px; margin-top: 10px;}
                .search-input {
                    flex: 1; padding: 12px 15px; border: 2px solid #eee;
                    border-radius: 10px 0 0 10px; font-size: 16px; outline: none;
                }
                .search-input:focus { border-color: var(--primary); }
                .search-btn {
                    padding: 0 20px; background: linear-gradient(45deg, var(--primary), var(--secondary));
                    color: white; border: none; border-radius: 0 10px 10px 0; font-weight: 600; cursor: pointer;
                }

                .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
                .game-card { background-color: white; border-radius: 15px; overflow: hidden; box-shadow: var(--shadow); transition: all 0.3s; }
                .game-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
                .game-thumbnail { width: 100%; height: 150px; object-fit: cover; transition: transform 0.3s; }
                .game-card:hover .game-thumbnail { transform: scale(1.05); }
                
                .game-info { padding: 15px; }
                .game-title { font-weight: 600; margin-bottom: 8px; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .game-description { font-size: 14px; color: #666; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 40px; }
                
                .game-actions { display: flex; gap: 10px; }
                .btn { flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 14px; transition: all 0.3s;}
                .btn-primary { background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; }
                .btn-secondary { background-color: var(--warning); color: var(--dark); }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 3px 10px rgba(0,0,0,0.2); }

                /* PIE DE PÁGINA (LEGAL PARA ADSENSE) */
                .legal-footer { background-color: #2d3436; color: #dfe6e9; padding: 40px 0 20px; margin-top: 40px; }
                .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; margin-bottom: 30px; }
                .footer-section h3 { color: var(--accent); margin-bottom: 15px; font-size: 18px; }
                .footer-section p { font-size: 13px; line-height: 1.6; color: #b2bec3; }
                .footer-bottom { text-align: center; padding-top: 20px; border-top: 1px solid #636e72; font-size: 14px; }

                /* VISOR DEL JUEGO */
                .game-viewer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: white; z-index: 1000; flex-direction: column; }
                .viewer-header { padding: 15px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; }
                .viewer-title { font-weight: 600; font-size: 18px; }
                .viewer-close { background: none; border: none; color: white; font-size: 24px; cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s; }
                .viewer-close:hover { background-color: rgba(255,255,255,0.2); transform: rotate(90deg); }
                .game-iframe { width: 100%; height: calc(100% - 60px); border: none; background-color: #f0f0f0; }
                .loading-overlay { position: absolute; top: 60px; left: 0; width: 100%; height: calc(100% - 60px); background-color: rgba(0,0,0,0.9); flex-direction: column; align-items: center; justify-content: center; color: white; }
                .loading-spinner { width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.3); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
                .skip-btn { background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; margin-top: 20px; }
                .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 999; }

                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .games-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
                    .game-thumbnail { height: 120px; }
                }
                @media (max-width: 480px) {
                    .games-grid { grid-template-columns: 1fr; }
                    .game-actions { flex-direction: column; }
                    .btn { width: 100%; }
                    .footer-content { grid-template-columns: 1fr; }
                }
            `}</style>
        </>
    );
}