import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CATEGORIES, COUNTRIES, PLAY_STORE_URL } from '../lib/site';

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
  if (router.pathname.startsWith('/podcast')) activeKey = 'podcast';
  if (router.pathname.startsWith('/app')) activeKey = 'app';
  if (router.pathname.startsWith('/sobre-nosotros')) activeKey = 'sobre-nosotros';
  if (router.pathname.startsWith('/contacto')) activeKey = 'contacto';
  if (router.pathname === '/' && !categoria && !pais) activeKey = 'todos';

  const getLinkClass = (key) => (activeKey === key ? 'nav-link active' : 'nav-link');
  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const south = COUNTRIES.filter((item) => item.region === 'Suramérica');
  const central = COUNTRIES.filter((item) => item.region === 'Centroamérica');
  const north = COUNTRIES.filter((item) => item.region === 'Norte / Caribe');

  return (
    <>
      <div className="news-ticker-bar">
        <div className="container ticker-flex">
          <span className="ticker-label">ÚLTIMA HORA</span>
          <div className="ticker-text-wrapper">
            <p className="ticker-text">
              Cobertura 24 h · Redacción propia · {fechaHoy} · App oficial en Google Play
            </p>
          </div>
        </div>
      </div>

      <header className="main-header glass-effect">
        <nav className="container nav-container">
          <Link href="/" className="logo-branding" onClick={closeMenu}>
            <span className="logo-main">
              Noticias<span className="dot">.lat</span>
            </span>
            <span className="logo-badge">Redacción LATAM</span>
          </Link>

          <ul className="nav-links desktop-menu">
            <li>
              <Link href="/podcast" className={`nav-link-audio ${activeKey === 'podcast' ? 'active' : ''}`}>
                <i className="fas fa-podcast"></i> Podcast
              </Link>
            </li>
            <li>
              <Link href="/app" className={getLinkClass('app')}>
                App
              </Link>
            </li>
            {CATEGORIES.slice(0, 5).map((item) => (
              <li key={item.slug}>
                <Link href={item.slug === 'todos' ? '/' : `/?categoria=${item.slug}`} className={getLinkClass(item.slug)}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="dropdown-wrapper">
              <span className="nav-link dropdown-trigger">
                Países <i className="fas fa-chevron-down"></i>
              </span>
              <div className="mega-menu">
                <div className="mega-menu-grid">
                  <div className="mm-column">
                    <h4>Suramérica</h4>
                    {south.map((item) => (
                      <Link key={item.code} href={`/?pais=${item.code}`}>
                        {item.flag} {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mm-column">
                    <h4>Centroamérica</h4>
                    {central.map((item) => (
                      <Link key={item.code} href={`/?pais=${item.code}`}>
                        {item.flag} {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mm-column">
                    <h4>Norte / Caribe</h4>
                    {north.map((item) => (
                      <Link key={item.code} href={`/?pais=${item.code}`}>
                        {item.flag} {item.name}
                      </Link>
                    ))}
                    <div className="mm-divider"></div>
                    <Link href="/?categoria=internacional">Mundo</Link>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <button
            className={`menu-toggle ${menuActivo ? 'is-active' : ''}`}
            onClick={() => setMenuActivo(!menuActivo)}
            aria-label="Abrir menú"
            type="button"
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
          <button className="mobile-close" onClick={closeMenu} type="button" aria-label="Cerrar menú">
            &times;
          </button>
        </div>

        <div className="mobile-scroll-content">
          <Link href="/podcast" className="mobile-video-btn" onClick={closeMenu}>
            <i className="fas fa-podcast"></i> Escuchar podcast
          </Link>
          <a
            href={PLAY_STORE_URL}
            className="mobile-video-btn"
            style={{ background: '#0f172a', marginTop: '-1rem' }}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            <i className="fab fa-google-play"></i> Descargar la app
          </a>

          <div className="mobile-links-list">
            <p className="mobile-section-title">Categorías</p>
            {CATEGORIES.map((item) => (
              <Link
                key={item.slug}
                href={item.slug === 'todos' ? '/' : `/?categoria=${item.slug}`}
                onClick={closeMenu}
                className={activeKey === item.slug ? 'active' : ''}
              >
                {item.label}
              </Link>
            ))}

            <hr className="mobile-divider" />

            <div className="mobile-accordion">
              <button
                className={`accordion-trigger ${paisesOpen ? 'open' : ''}`}
                onClick={() => setPaisesOpen(!paisesOpen)}
                type="button"
              >
                Países de Latinoamérica <i className={`fas fa-chevron-${paisesOpen ? 'up' : 'down'}`}></i>
              </button>
              {paisesOpen && (
                <div className="accordion-content">
                  <div className="country-grid-mobile">
                    {COUNTRIES.map((item) => (
                      <Link key={item.code} href={`/?pais=${item.code}`} onClick={closeMenu}>
                        {item.flag} {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr className="mobile-divider" />

            <div className="mobile-footer-links">
              <Link href="/sobre-nosotros" onClick={closeMenu}>Quiénes somos</Link>
              <Link href="/contacto" onClick={closeMenu}>Contacto</Link>
              <Link href="/app" onClick={closeMenu}>App Android</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
