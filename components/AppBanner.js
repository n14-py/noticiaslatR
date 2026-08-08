import { useState, useEffect } from 'react';

export default function AppBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [intentUrl, setIntentUrl] = useState('');

    useEffect(() => {
        // Armamos el enlace "Intent" dinámico según la URL donde esté el usuario
        const currentPath = window.location.host + window.location.pathname; 
        const link = `intent://${currentPath}#Intent;scheme=https;package=com.noticiaslat.app;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.noticiaslat.app;end;`;
        setIntentUrl(link);

        // Muestra el cuadro 2 segundos después
        const timer = setTimeout(() => {
            const bannerClosed = localStorage.getItem('appBannerClosed');
            if (!bannerClosed) {
                setIsVisible(true);
            }
        }, 2000);

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
                    <strong>¡Mejor en la App! 📱</strong>
                    <p>Lee esta noticia sin interrupciones, escucha nuestra radio y recibe alertas.</p>
                </div>
                <div className="app-promo-actions">
                    <a 
                        href={intentUrl} 
                        className="btn-download"
                    >
                        Abrir en la App
                    </a>
                    <button onClick={handleClose} className="btn-close">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .app-promo-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background: var(--color-tech-bg, #0f172a);
                    color: white;
                    padding: 15px;
                    z-index: 9999;
                    box-shadow: 0 -4px 15px rgba(0,0,0,0.3);
                    border-top: 3px solid var(--color-primario, #0066cc);
                    animation: slideUp 0.4s ease-out;
                }
                .app-promo-content {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                }
                .app-promo-text strong {
                    display: block;
                    font-size: 1.1rem;
                    margin-bottom: 4px;
                }
                .app-promo-text p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #cbd5e1;
                }
                .app-promo-actions {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .btn-download {
                    background: var(--color-primario, #0066cc);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 0.95rem;
                    white-space: nowrap;
                    box-shadow: 0 4px 10px rgba(0, 102, 204, 0.3);
                }
                .btn-close {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 5px;
                }
                @media (max-width: 640px) {
                    .app-promo-content {
                        flex-direction: column;
                        text-align: center;
                    }
                    .app-promo-actions {
                        width: 100%;
                        justify-content: center;
                    }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}