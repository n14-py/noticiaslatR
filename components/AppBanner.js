import { useState, useEffect } from 'react';
import { PLAY_STORE_URL } from '../lib/site';

export default function AppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [href, setHref] = useState(PLAY_STORE_URL);

  useEffect(() => {
    const currentPath = window.location.host + window.location.pathname;
    setHref(
      `intent://${currentPath}#Intent;scheme=https;package=com.noticiaslat.app;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end;`
    );
    const timer = setTimeout(() => {
      if (!localStorage.getItem('appBannerClosed')) setIsVisible(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('appBannerClosed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="app-promo-banner">
      <div className="app-promo-content">
        <div className="app-promo-text">
          <strong>Noticias.lat App</strong>
          <p>Lee, escucha audionoticias y recibe alertas. Gratis en Google Play.</p>
        </div>
        <div className="app-promo-actions">
          <a href={href} className="btn-download">Abrir o descargar</a>
          <button onClick={handleClose} className="btn-close" type="button" aria-label="Cerrar">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
