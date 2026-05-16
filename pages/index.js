import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function NotilatGaming() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [menuActive, setMenuActive] = useState(false);
    
    // Estado del visor del juego
    const [viewerState, setViewerState] = useState({ 
        isOpen: false, 
        url: '', 
        title: '', 
        isLoading: false 
    });

    const viewerRef = useRef(null);

    // LISTA COMPLETA DE 31 JUEGOS SIN RECORTES
    const games = [
        {
            title: "Bloxdhop.io",
            description: "Salta por los bloques en este adictivo juego de parkour multijugador.",
            thumbnail: "https://imgs.crazygames.com/bloxdhop-io_16x9/20250829023851/bloxdhop-io_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/bloxdhop-io",
            category: "io"
        },
        {
            title: "OpenFront",
            description: "Juego de disparos táctico y acción militar en primera persona.",
            thumbnail: "https://imgs.crazygames.com/openfront-gsw_16x9/20260515051210/openfront-gsw_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/openfront-gsw",
            category: "shooter"
        },
        {
            title: "UNO Online",
            description: "El clásico juego de cartas multijugador para disfrutar con amigos.",
            thumbnail: "https://imgs.crazygames.com/games/uno-online/cover-1679068977831.png?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/uno-online",
            category: "puzzle"
        },
        {
            title: "Spider Solitaire",
            description: "Relájate con este clásico juego de cartas y estrategia mental.",
            thumbnail: "https://imgs.crazygames.com/spider-solitaire-fuw_16x9/20251008073941/spider-solitaire-fuw_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/spider-solitaire-fuw",
            category: "puzzle"
        },
        {
            title: "Battle Brigade",
            description: "Dirige tu brigada y conquista territorios en este juego bélico.",
            thumbnail: "https://imgs.crazygames.com/battle-brigade_16x9/20260420092345/battle-brigade_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/battle-brigade",
            category: "action"
        },
        {
            title: "Art of Defense",
            description: "Protege tu base de oleadas enemigas en este épico Tower Defense.",
            thumbnail: "https://imgs.crazygames.com/aod---art-of-defense_16x9/20260429163424/aod---art-of-defense_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/aod---art-of-defense",
            category: "action"
        },
        {
            title: "99 Nights (Bloxd)",
            description: "Sobrevive la noche en este mundo de bloques multijugador.",
            thumbnail: "https://imgs.crazygames.com/99-nights-bloxd-io_16x9/20260319034044/99-nights-bloxd-io_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/99-nights-bloxd-io",
            category: "adventure"
        },
        {
            title: "Hazmob FPS",
            description: "Disparos online trepidantes contra jugadores de todo el mundo.",
            thumbnail: "https://imgs.crazygames.com/hazmob-fps-online-shooter_16x9/20260302022643/hazmob-fps-online-shooter_16x9-cover?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/hazmob-fps-online-shooter",
            category: "shooter"
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
            title: "Basketball Stars",
            description: "Demuestra tus habilidades en la cancha de baloncesto 1 contra 1.",
            thumbnail: "https://imgs.crazygames.com/games/basketball-stars-2019/cover-1583231506155.png?metadata=none&quality=75&width=196&dpr=2",
            url: "https://www.crazygames.com/embed/basketball-stars-2019",
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

    const filteredGames = games.filter(game => {
        const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              game.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const openGame = (url, title, isFullscreen) => {
        setViewerState({ 
            isOpen: true, 
            url: url, 
            title: title, 
            isLoading: true 
        });
        
        // Ejecución de pantalla completa nativa
        if (isFullscreen && viewerRef.current) {
            const elem = viewerRef.current;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(err => console.log(err));
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen(); // Safari / iOS
            }
        }

        setTimeout(() => {
            setViewerState(prev => ({ ...prev, isLoading: false }));
        }, 1500);
    };

    const closeViewer = () => {
        setViewerState({ isOpen: false, url: '', title: '', isLoading: false });
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuActive && !e.target.closest('.user-info') && !e.target.closest('.menu')) {
                setMenuActive(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [menuActive]);

    return (
        <>
            <Head>
                <title>NOTILAT Gaming - Juegos y Diversión Gratis Online</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <meta name="description" content="Juega los mejores juegos gratis en línea en NOTILAT Gaming. Acción, aventura, puzzle y más. Plataforma 100% gratuita." />
                
                {/* Script de verificación de Google AdSense */}
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5461370198299696" crossorigin="anonymous"></script>

                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
            </Head>

            <div className="gaming-body">
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

                <div className="container" style={{ paddingTop: '100px' }}>
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

                {/* VISOR DEL JUEGO: EXACTAMENTE COMO EL HTML ORIGINAL PERO EN REACT */}
                {viewerState.isOpen && (
                    <>
                        <div className="overlay" onClick={closeViewer} style={{display: 'block'}}></div>
                        <div className="game-viewer" ref={viewerRef} style={{display: 'flex'}}>
                            <div className="viewer-header">
                                <div className="viewer-title">{viewerState.title}</div>
                                <button className="viewer-close" onClick={closeViewer}>&times;</button>
                            </div>
                            
                            {/* IFRAME: Permite interactuar con los dedos en móvil */}
                            <iframe 
                                className="game-iframe" 
                                src={viewerState.url} 
                                frameBorder="0" 
                                allow="gamepad *; autoplay; fullscreen"
                                allowFullScreen
                            ></iframe>

                            {/* Pantalla de carga superpuesta */}
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

            {/* TODOS LOS ESTILOS INCLUIDOS EN EL MISMO ARCHIVO */}
            <style jsx global>{`
                :root {
                    --primary: #4834d4; 
                    --secondary: #686de0; 
                    --accent: #00cec9; 
                    --dark: #1e272e;
                    --light: #f5f6fa;
                    --warning: #fdcb6e;
                    --shadow: 0 5px 15px rgba(0,0,0,0.1);
                }

                * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; -webkit-tap-highlight-color: transparent; }

                body { margin: 0; padding: 0; background-color: var(--light); }

                .gaming-body { background-color: var(--light); color: var(--dark); min-height: 100vh; padding-bottom: 0px; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

                .gaming-body header { position: fixed; top: 0; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background-color: var(--light); box-shadow: var(--shadow); z-index: 100; }
                .logo { font-size: 28px; font-weight: 700; color: var(--primary); background: linear-gradient(45deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; cursor: pointer; text-decoration: none; }
                .user-info { display: flex; align-items: center; gap: 15px; }

                .menu-btn { background: none; border: none; font-size: 24px; color: var(--primary); cursor: pointer; display: flex; flex-direction: column; gap: 5px; padding: 5px; }
                .menu-dot { width: 5px; height: 5px; background-color: var(--primary); border-radius: 50%; }

                .menu { position: fixed; top: 70px; right: 20px; background-color: white; border-radius: 10px; box-shadow: var(--shadow); padding: 15px; z-index: 101; display: none; }
                .menu.active { display: block; }
                .menu-item { padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px; }
                .menu-item:hover { background-color: rgba(72, 52, 212, 0.1); color: var(--primary); }

                .section-title { font-size: 24px; margin-bottom: 20px; color: var(--primary); position: relative; padding-bottom: 10px; }
                .section-title::after { content: ''; position: absolute; bottom: 0; left: 0; width: 50px; height: 3px; background: linear-gradient(45deg, var(--primary), var(--accent)); border-radius: 3px; }

                .categories { display: flex; overflow-x: auto; gap: 10px; padding: 10px 0; margin-bottom: 20px; scrollbar-width: thin; }
                .categories::-webkit-scrollbar { height: 5px; }
                .categories::-webkit-scrollbar-track { background: var(--light); }
                .categories::-webkit-scrollbar-thumb { background-color: var(--primary); border-radius: 5px; }
                
                .category { padding: 8px 15px; background-color: white; border-radius: 20px; cursor: pointer; white-space: nowrap; font-size: 14px; font-weight: 500; box-shadow: var(--shadow); transition: all 0.3s; }
                .category:hover, .category.active { background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; transform: translateY(-2px); }

                .search-container { display: flex; margin-bottom: 20px; }
                .search-input { flex: 1; padding: 12px 15px; border: 2px solid #eee; border-radius: 10px 0 0 10px; font-size: 16px; outline: none; }
                .search-input:focus { border-color: var(--primary); }
                .search-btn { padding: 0 20px; background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; border: none; border-radius: 0 10px 10px 0; font-weight: 600; cursor: pointer; }

                .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
                .game-card { background-color: white; border-radius: 15px; overflow: hidden; box-shadow: var(--shadow); transition: all 0.3s; }
                .game-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
                .game-thumbnail { width: 100%; height: 150px; object-fit: cover; transition: transform 0.3s; }
                .game-card:hover .game-thumbnail { transform: scale(1.05); }
                
                .game-info { padding: 15px; }
                .game-title { font-weight: 600; margin-bottom: 8px; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--dark); }
                .game-description { font-size: 14px; color: #666; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 40px; }
                
                .game-actions { display: flex; gap: 10px; }
                .btn { flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 14px; transition: all 0.3s;}
                .btn-primary { background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; }
                .btn-secondary { background-color: var(--warning); color: var(--dark); }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 3px 10px rgba(0,0,0,0.2); }

                .legal-footer { background-color: #2d3436; color: #dfe6e9; padding: 40px 0 20px; margin-top: 40px; }
                .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; margin-bottom: 30px; }
                .footer-section h3 { color: var(--accent); margin-bottom: 15px; font-size: 18px; }
                .footer-section p { font-size: 13px; line-height: 1.6; color: #b2bec3; }
                .footer-bottom { text-align: center; padding-top: 20px; border-top: 1px solid #636e72; font-size: 14px; }

                /* CSS DEL VISOR RESTAURADO EXACTAMENTE AL ORIGINAL PARA EVITAR BLOQUEOS TÁCTILES */
                .game-viewer { 
                    position: fixed; 
                    top: 0; 
                    left: 0; 
                    width: 100%; 
                    height: 100%; 
                    background-color: white; 
                    z-index: 1000; 
                    flex-direction: column; 
                }
                
                .viewer-header { 
                    padding: 15px; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    background: linear-gradient(45deg, var(--primary), var(--secondary)); 
                    color: white; 
                }
                
                .viewer-title { font-weight: 600; font-size: 18px; }
                
                .viewer-close { 
                    background: none; 
                    border: none; 
                    color: white; 
                    font-size: 24px; 
                    cursor: pointer; 
                    width: 40px; 
                    height: 40px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 50%; 
                    transition: all 0.3s; 
                }
                
                .viewer-close:hover { background-color: rgba(255,255,255,0.2); transform: rotate(90deg); }
                
                .game-iframe { 
                    width: 100%; 
                    height: calc(100% - 60px); 
                    border: none; 
                    background-color: #f0f0f0; 
                }
                
                .loading-overlay { 
                    position: absolute; 
                    top: 60px; 
                    left: 0; 
                    width: 100%; 
                    height: calc(100% - 60px); 
                    background-color: rgba(0,0,0,0.9); 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                }
                
                .loading-spinner { width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.3); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
                .skip-btn { background: linear-gradient(45deg, var(--primary), var(--secondary)); color: white; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; margin-top: 20px; }
                .overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 999; }

                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .games-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
                    .game-thumbnail { height: 120px; }
                }
                
                @media (max-width: 480px) {
                    .games-grid { grid-template-columns: 1fr; }
                    .logo { font-size: 22px; }
                    .game-actions { flex-direction: column; }
                    .btn { width: 100%; }
                    .footer-content { grid-template-columns: 1fr; }
                }
            `}</style>
        </>
    );
}