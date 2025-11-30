import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
    const [menuActivo, setMenuActivo] = useState(false);
    const [paisesOpen, setPaisesOpen] = useState(false);
    const router = useRouter();
    const { categoria, pais } = router.query;

    const closeMenu = () => {
        setMenuActivo(false);
        setPaisesOpen(false);
    };

    let activeKey = categoria || pais || 'todos';
    if (router.pathname === '/feed') activeKey = 'feed';
    if (router.pathname.startsWith('/sobre-nosotros')) activeKey = 'sobre-nosotros';
    if (router.pathname.startsWith('/contacto')) activeKey = 'contacto';

    const getLinkClass = (key) => activeKey === key ? 'nav-link active' : 'nav-link';
    
    // FORMATO DE FECHA
    const fechaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            {/* 1. TICKER SUPERIOR (SIN IA) */}
            <div className="news-ticker-bar">
                <div className="container ticker-flex">
                    <span className="ticker-label">ÚLTIMA HORA</span>
                    <div className="ticker-text-wrapper">
                        <p className="ticker-text">
                            {/* ELIMINADO: "Inteligencia Artificial narra..." */}
                            Cobertura global las 24 hs. • {fechaHoy} • Noticias actualizadas al minuto.
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. HEADER PRINCIPAL */}
            <header className="main-header glass-effect">
                <nav className="container nav-container">
                    
                    <Link href="/" className="logo-branding" onClick={closeMenu}>
                        <span className="logo-main">Noticias<span className="dot">.lat</span></span>
                        <span className="logo-badge">AudioNoticias</span>
                    </Link>
                    
                    <ul className="nav-links desktop-menu">
                        <li>
                            <Link href="/feed" className={`nav-link-video ${activeKey === 'feed' ? 'active' : ''}`}>
                                <span className="pulse-icon">●</span> Video Feed
                            </Link>
                        </li>

                        <li><Link href="/?categoria=todos" className={getLinkClass('todos')}>General</Link></li>
                        <li><Link href="/?categoria=politica" className={getLinkClass('politica')}>Política</Link></li>
                        <li><Link href="/?categoria=economia" className={getLinkClass('economia')}>Economía</Link></li>
                        
                        <li className="dropdown-wrapper">
                            <span className="nav-link dropdown-trigger">
                                Países <i className="fas fa-chevron-down"></i>
                            </span>
                            <div className="mega-menu">
                                <div className="mega-menu-grid">
                                    <div className="mm-column">
                                        <h4>Suramérica</h4>
                                        <Link href="/?pais=ar">🇦🇷 Argentina</Link>
                                        <Link href="/?pais=bo">🇧🇴 Bolivia</Link>
                                        <Link href="/?pais=br">🇧🇷 Brasil</Link>
                                        <Link href="/?pais=cl">🇨🇱 Chile</Link>
                                        <Link href="/?pais=co">🇨🇴 Colombia</Link>
                                        <Link href="/?pais=ec">🇪🇨 Ecuador</Link>
                                        <Link href="/?pais=py">🇵🇾 Paraguay</Link>
                                        <Link href="/?pais=pe">🇵🇪 Perú</Link>
                                        <Link href="/?pais=uy">🇺🇾 Uruguay</Link>
                                        <Link href="/?pais=ve">🇻🇪 Venezuela</Link>
                                    </div>
                                    <div className="mm-column">
                                        <h4>Centroamérica</h4>
                                        <Link href="/?pais=cr">🇨🇷 Costa Rica</Link>
                                        <Link href="/?pais=sv">🇸🇻 El Salvador</Link>
                                        <Link href="/?pais=gt">🇬🇹 Guatemala</Link>
                                        <Link href="/?pais=hn">🇭🇳 Honduras</Link>
                                        <Link href="/?pais=ni">🇳🇮 Nicaragua</Link>
                                        <Link href="/?pais=pa">🇵🇦 Panamá</Link>
                                    </div>
                                    <div className="mm-column">
                                        <h4>Norte / Caribe</h4>
                                        <Link href="/?pais=mx">🇲🇽 México</Link>
                                        <Link href="/?pais=cu">🇨🇺 Cuba</Link>
                                        <Link href="/?pais=do">🇩🇴 Rep. Dom.</Link>
                                        <div className="mm-divider"></div>
                                        <h4>Más</h4>
                                        <Link href="/?categoria=internacional">🌍 Mundo</Link>
                                    </div>
                                </div>
                            </div>
                        </li>

                        <li><Link href="/?categoria=tecnologia" className={getLinkClass('tecnologia')}>Tech</Link></li>
                        <li><Link href="/?categoria=deportes" className={getLinkClass('deportes')}>Deportes</Link></li>
                        <li><Link href="/?categoria=entretenimiento" className={getLinkClass('entretenimiento')}>Show</Link></li>
                    </ul>

                    <button 
                        className={`menu-toggle ${menuActivo ? 'is-active' : ''}`} 
                        onClick={() => setMenuActivo(!menuActivo)}
                    >
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>
                </nav>
            </header>

            <div className={`mobile-menu-overlay ${menuActivo ? 'active' : ''}`} onClick={closeMenu}></div>
            
            <div className={`mobile-side-menu ${menuActivo ? 'active' : ''}`}>
                <div className="mobile-header">
                    <span className="mobile-title">Menú</span>
                    <button className="mobile-close" onClick={closeMenu}>&times;</button>
                </div>

                <div className="mobile-scroll-content">
                    <Link href="/feed" className="mobile-video-btn" onClick={closeMenu}>
                        <i className="fas fa-play-circle"></i> Ver AudioNoticias (Feed)
                    </Link>

                    <div className="mobile-links-list">
                        <p className="mobile-section-title">Categorías</p>
                        <Link href="/?categoria=todos" onClick={closeMenu} className={activeKey === 'todos' ? 'active' : ''}>General</Link>
                        <Link href="/?categoria=politica" onClick={closeMenu} className={activeKey === 'politica' ? 'active' : ''}>Política</Link>
                        <Link href="/?categoria=economia" onClick={closeMenu} className={activeKey === 'economia' ? 'active' : ''}>Economía</Link>
                        <Link href="/?categoria=tecnologia" onClick={closeMenu} className={activeKey === 'tecnologia' ? 'active' : ''}>Tecnología</Link>
                        <Link href="/?categoria=deportes" onClick={closeMenu} className={activeKey === 'deportes' ? 'active' : ''}>Deportes</Link>
                        <Link href="/?categoria=entretenimiento" onClick={closeMenu} className={activeKey === 'entretenimiento' ? 'active' : ''}>Show</Link>
                        <Link href="/?categoria=salud" onClick={closeMenu} className={activeKey === 'salud' ? 'active' : ''}>Salud</Link>
                        <Link href="/?categoria=internacional" onClick={closeMenu} className={activeKey === 'internacional' ? 'active' : ''}>Mundo</Link>

                        <hr className="mobile-divider" />

                        <div className="mobile-accordion">
                            <button 
                                className={`accordion-trigger ${paisesOpen ? 'open' : ''}`} 
                                onClick={() => setPaisesOpen(!paisesOpen)}
                            >
                                Países de Latinoamérica <i className={`fas fa-chevron-${paisesOpen ? 'up' : 'down'}`}></i>
                            </button>
                            
                            {paisesOpen && (
                                <div className="accordion-content">
                                    <div className="country-grid-mobile">
                                        <Link href="/?pais=ar" onClick={closeMenu}>🇦🇷 Argentina</Link>
                                        <Link href="/?pais=bo" onClick={closeMenu}>🇧🇴 Bolivia</Link>
                                        <Link href="/?pais=br" onClick={closeMenu}>🇧🇷 Brasil</Link>
                                        <Link href="/?pais=cl" onClick={closeMenu}>🇨🇱 Chile</Link>
                                        <Link href="/?pais=co" onClick={closeMenu}>🇨🇴 Colombia</Link>
                                        <Link href="/?pais=cr" onClick={closeMenu}>🇨🇷 Costa Rica</Link>
                                        <Link href="/?pais=cu" onClick={closeMenu}>🇨🇺 Cuba</Link>
                                        <Link href="/?pais=ec" onClick={closeMenu}>🇪🇨 Ecuador</Link>
                                        <Link href="/?pais=sv" onClick={closeMenu}>🇸🇻 El Salvador</Link>
                                        <Link href="/?pais=gt" onClick={closeMenu}>🇬🇹 Guatemala</Link>
                                        <Link href="/?pais=hn" onClick={closeMenu}>🇭🇳 Honduras</Link>
                                        <Link href="/?pais=mx" onClick={closeMenu}>🇲🇽 México</Link>
                                        <Link href="/?pais=ni" onClick={closeMenu}>🇳🇮 Nicaragua</Link>
                                        <Link href="/?pais=pa" onClick={closeMenu}>🇵🇦 Panamá</Link>
                                        <Link href="/?pais=py" onClick={closeMenu}>🇵🇾 Paraguay</Link>
                                        <Link href="/?pais=pe" onClick={closeMenu}>🇵🇪 Perú</Link>
                                        <Link href="/?pais=do" onClick={closeMenu}>🇩🇴 R. Dominicana</Link>
                                        <Link href="/?pais=uy" onClick={closeMenu}>🇺🇾 Uruguay</Link>
                                        <Link href="/?pais=ve" onClick={closeMenu}>🇻🇪 Venezuela</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="mobile-divider" />
                        
                        <div className="mobile-footer-links">
                            <Link href="/sobre-nosotros" onClick={closeMenu}>Sobre Nosotros</Link>
                            <Link href="/contacto" onClick={closeMenu}>Contacto</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}