import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Este es el componente Header
export default function Header() {
    // 1. LÓGICA PARA EL MENÚ MÓVIL
    const [menuActivo, setMenuActivo] = useState(false);

    const closeMenu = () => {
        setMenuActivo(false);
    };

    // 2. LÓGICA PARA MARCAR EL ENLACE ACTIVO
    const router = useRouter();
    const { categoria, pais } = router.query;

    let activeKey = categoria || pais || 'todos';
    
    // Detectar si estamos en el feed
    if (router.pathname === '/feed') activeKey = 'feed';
    
    if (router.pathname.startsWith('/sobre-nosotros')) activeKey = 'sobre-nosotros';
    if (router.pathname.startsWith('/contacto')) activeKey = 'contacto';

    // Función para añadir 'active' a la clase
    const getLinkClass = (key) => {
        return activeKey === key ? 'nav-link active' : 'nav-link';
    };

    return (
        <>
            <header className="main-header">
                <nav className="container">
                    
                    {/* Logo */}
                    <Link href="/" className="logo">
                        Noticias.lat
                    </Link>
                    
                    <ul className="nav-links desktop-menu">
                        
                        {/* --- 1. ENLACE AL FEED (Escritorio: Solo texto azul, sin ícono) --- */}
                        <li>
                            <Link href="/feed" className={getLinkClass('feed')} style={{ color: '#007bff', fontWeight: '600' }}>
                                Videos
                            </Link>
                        </li>
                        {/* ------------------------------------------------------------------ */}

                        <li><Link href="/?categoria=todos" className={getLinkClass('todos')} data-categoria="todos">General</Link></li>
                        <li><Link href="/?categoria=politica" className={getLinkClass('politica')} data-categoria="politica">Política</Link></li>
                        <li><Link href="/?categoria=economia" className={getLinkClass('economia')} data-categoria="economia">Economía</Link></li>
                        <li><Link href="/?categoria=deportes" className={getLinkClass('deportes')} data-categoria="deportes">Deportes</Link></li>
                        <li><Link href="/?categoria=tecnologia" className={getLinkClass('tecnologia')} data-categoria="tecnologia">Tecnología</Link></li>
                        <li><Link href="/?categoria=entretenimiento" className={getLinkClass('entretenimiento')} data-categoria="entretenimiento">Show</Link></li>
                        <li><Link href="/?categoria=salud" className={getLinkClass('salud')} data-categoria="salud">Salud</Link></li>
                        <li><Link href="/?categoria=internacional" className={getLinkClass('internacional')} data-categoria="internacional">Mundo</Link></li>
                        
                        <li className="dropdown">
                            <a href="#" className="nav-link">Países <i className="fas fa-chevron-down"></i></a>
                            <ul className="dropdown-menu">
                                <li><Link href="/?pais=ar" className={getLinkClass('ar')} data-pais="ar">🇦🇷 Argentina</Link></li>
                                <li><Link href="/?pais=bo" className={getLinkClass('bo')} data-pais="bo">🇧🇴 Bolivia</Link></li>
                                <li><Link href="/?pais=br" className={getLinkClass('br')} data-pais="br">🇧🇷 Brasil</Link></li>
                                <li><Link href="/?pais=cl" className={getLinkClass('cl')} data-pais="cl">🇨🇱 Chile</Link></li>
                                <li><Link href="/?pais=co" className={getLinkClass('co')} data-pais="co">🇨🇴 Colombia</Link></li>
                                <li><Link href="/?pais=cr" className={getLinkClass('cr')} data-pais="cr">🇨🇷 Costa Rica</Link></li>
                                <li><Link href="/?pais=cu" className={getLinkClass('cu')} data-pais="cu">🇨🇺 Cuba</Link></li>
                                <li><Link href="/?pais=ec" className={getLinkClass('ec')} data-pais="ec">🇪🇨 Ecuador</Link></li>
                                <li><Link href="/?pais=sv" className={getLinkClass('sv')} data-pais="sv">🇸🇻 El Salvador</Link></li>
                                <li><Link href="/?pais=gt" className={getLinkClass('gt')} data-pais="gt">🇬🇹 Guatemala</Link></li>
                                <li><Link href="/?pais=hn" className={getLinkClass('hn')} data-pais="hn">🇭🇳 Honduras</Link></li>
                                <li><Link href="/?pais=mx" className={getLinkClass('mx')} data-pais="mx">🇲🇽 México</Link></li>
                                <li><Link href="/?pais=ni" className={getLinkClass('ni')} data-pais="ni">🇳🇮 Nicaragua</Link></li>
                                <li><Link href="/?pais=pa" className={getLinkClass('pa')} data-pais="pa">🇵🇦 Panamá</Link></li>
                                <li><Link href="/?pais=py" className={getLinkClass('py')} data-pais="py">🇵🇾 Paraguay</Link></li>
                                <li><Link href="/?pais=pe" className={getLinkClass('pe')} data-pais="pe">🇵🇪 Perú</Link></li>
                                <li><Link href="/?pais=do" className={getLinkClass('do')} data-pais="do">🇩🇴 Rep. Dominicana</Link></li>
                                <li><Link href="/?pais=uy" className={getLinkClass('uy')} data-pais="uy">🇺🇾 Uruguay</Link></li>
                                <li><Link href="/?pais=ve" className={getLinkClass('ve')} data-pais="ve">🇻🇪 Venezuela</Link></li>
                            </ul>
                        </li>
                        <li><Link href="/sobre-nosotros" className={getLinkClass('sobre-nosotros')} data-categoria="sobre-nosotros">Nosotros</Link></li>
                        <li><Link href="/contacto" className={getLinkClass('contacto')} data-categoria="contacto">Contacto</Link></li>
                    </ul>

                    {/* Botón de Menú Móvil */}
                    <button id="menu-toggle" className="menu-toggle" onClick={() => setMenuActivo(true)}>
                        <i className="fas fa-bars"></i>
                    </button>
                </nav>
            </header>

            {/* Menú Móvil (Divs) */}
            <div id="mobile-menu" className={menuActivo ? "mobile-menu active" : "mobile-menu"}>
                <div className="mobile-menu-header">
                    <button id="menu-close" className="menu-close" onClick={closeMenu}>&times;</button>
                </div>
                <div className="mobile-menu-content">
                    {/* Enlace al Feed destacado en móvil (Se mantiene con ícono) */}
                    <Link href="/feed" className="nav-link" onClick={closeMenu} style={{ color: '#007bff', fontWeight: 'bold' }}>
                         <i className="fas fa-play" style={{ marginRight: '5px' }}></i> Videos (Feed)
                    </Link>
                    <hr />

                    {/* Al hacer clic en un enlace, cerramos el menú */}
                    <Link href="/?categoria=todos" className="nav-link" data-categoria="todos" onClick={closeMenu}>General</Link>
                    <Link href="/?categoria=politica" className="nav-link" data-categoria="politica" onClick={closeMenu}>Política</Link>
                    <Link href="/?categoria=economia" className="nav-link" data-categoria="economia" onClick={closeMenu}>Economía</Link>
                    <Link href="/?categoria=deportes" className="nav-link" data-categoria="deportes" onClick={closeMenu}>Deportes</Link>
                    <Link href="/?categoria=tecnologia" className="nav-link" data-categoria="tecnologia" onClick={closeMenu}>Tecnología</Link>
                    <Link href="/?categoria=entretenimiento" className="nav-link" data-categoria="entretenimiento" onClick={closeMenu}>Show</Link>
                    <Link href="/?categoria=salud" className="nav-link" data-categoria="salud" onClick={closeMenu}>Salud</Link>
                    <Link href="/?categoria=internacional" className="nav-link" data-categoria="internacional" onClick={closeMenu}>Mundo</Link>
                    
                    <hr />
                    
                    <Link href="/?pais=ar" className="nav-link" data-pais="ar" onClick={closeMenu}>🇦🇷 Argentina</Link>
                    <Link href="/?pais=bo" className="nav-link" data-pais="bo" onClick={closeMenu}>🇧🇴 Bolivia</Link>
                    <Link href="/?pais=br" className="nav-link" data-pais="br" onClick={closeMenu}>🇧🇷 Brasil</Link>
                    <Link href="/?pais=cl" className="nav-link" data-pais="cl" onClick={closeMenu}>🇨🇱 Chile</Link>
                    <Link href="/?pais=co" className="nav-link" data-pais="co" onClick={closeMenu}>🇨🇴 Colombia</Link>
                    <Link href="/?pais=cr" className="nav-link" data-pais="cr" onClick={closeMenu}>🇨🇷 Costa Rica</Link>
                    <Link href="/?pais=cu" className="nav-link" data-pais="cu" onClick={closeMenu}>🇨🇺 Cuba</Link>
                    <Link href="/?pais=ec" className="nav-link" data-pais="ec" onClick={closeMenu}>🇪🇨 Ecuador</Link>
                    <Link href="/?pais=sv" className="nav-link" data-pais="sv" onClick={closeMenu}>🇸🇻 El Salvador</Link>
                    <Link href="/?pais=gt" className="nav-link" data-pais="gt" onClick={closeMenu}>🇬🇹 Guatemala</Link>
                    <Link href="/?pais=hn" className="nav-link" data-pais="hn" onClick={closeMenu}>🇭🇳 Honduras</Link>
                    <Link href="/?pais=mx" className="nav-link" data-pais="mx" onClick={closeMenu}>🇲🇽 México</Link>
                    <Link href="/?pais=ni" className="nav-link" data-pais="ni" onClick={closeMenu}>🇳🇮 Nicaragua</Link>
                    <Link href="/?pais=pa" className="nav-link" data-pais="pa" onClick={closeMenu}>🇵🇦 Panamá</Link>
                    <Link href="/?pais=py" className="nav-link" data-pais="py" onClick={closeMenu}>🇵🇾 Paraguay</Link>
                    <Link href="/?pais=pe" className="nav-link" data-pais="pe" onClick={closeMenu}>🇵🇪 Perú</Link>
                    <Link href="/?pais=do" className="nav-link" data-pais="do" onClick={closeMenu}>🇩🇴 Rep. Dominicana</Link>
                    <Link href="/?pais=uy" className="nav-link" data-pais="uy" onClick={closeMenu}>🇺🇾 Uruguay</Link>
                    <Link href="/?pais=ve" className="nav-link" data-pais="ve" onClick={closeMenu}>🇻🇪 Venezuela</Link>
                    
                    <hr />
                    <Link href="/sobre-nosotros" className="nav-link" data-categoria="sobre-nosotros" onClick={closeMenu}>Sobre Nosotros</Link>
                    <Link href="/contacto" className="nav-link" data-categoria="contacto" onClick={closeMenu}>Contacto</Link>
                </div>
            </div>

            {/* Overlay para el menú móvil */}
            <div id="overlay" className={menuActivo ? "overlay active" : "overlay"} onClick={closeMenu}></div>
        </>
    );
}