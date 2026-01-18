import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/router';

// Configuración Edge
//export const runtime = 'experimental-edge';

const API_URL = 'https://lfaftechapi-7nrb.onrender.com';
const SITIO = 'noticias.lat';

// --- 1. CARGA DE DATOS (Caché 24h) ---
export async function getServerSideProps(context) {
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=86400, stale-while-revalidate=3600'
    );

    const { start_id } = context.query;
    const url = `${API_URL}/api/articles/feed?sitio=${SITIO}&limit=15`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('API Error');
        const articles = await res.json();

        if (!Array.isArray(articles) || articles.length === 0) {
             return { props: { articles: [] } };
        }

        let sortedArticles = articles;
        if (start_id) {
            const index = articles.findIndex(a => a._id === start_id);
            if (index !== -1) {
                const selected = articles[index];
                const rest = articles.filter(a => a._id !== start_id);
                sortedArticles = [selected, ...rest];
            }
        }

        return {
            props: {
                articles: sortedArticles,
                initialMeta: sortedArticles[0] || null
            }
        };
    } catch (error) {
        console.error("Feed Error:", error);
        return { props: { articles: [], error: "Error de conexión" } };
    }
}

export default function FeedPage({ articles, initialMeta, error }) {
    const router = useRouter();
    
    // --- ESTADOS ---
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false); 
    const [showSwipeHint, setShowSwipeHint] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareData, setShareData] = useState(null);
    const [likedVideos, setLikedVideos] = useState(new Set());
    
    // Estado para descripciones expandidas
    const [expandedDescId, setExpandedDescId] = useState(null);

    const playersRef = useRef({});
    const wheelBufferRef = useRef(0);
    const touchStartYRef = useRef(0);
    const isMovingRef = useRef(false);

    const currentArticle = articles && articles[currentIndex] ? articles[currentIndex] : {};
    const pageTitle = currentArticle.titulo ? `Video: ${currentArticle.titulo}` : 'Noticias.lat Feed';

    // --- URL DINÁMICA ---
    useEffect(() => {
        if (!currentArticle || !currentArticle._id) return;
        const currentQueryId = router.query.start_id;
        if (currentQueryId === currentArticle._id) return;

        const newUrl = `/feed?start_id=${currentArticle._id}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }, [currentIndex, currentArticle._id]);

    // --- FUNCIONES AUXILIARES ---
    
    // Función Inteligente para obtener el texto más completo (de Articulo Generado)
    const getSmartDescription = (article) => {
        // Tomamos el texto más completo: Articulo IA > Contenido > Descripción
        const rawText = article.articuloGenerado || article.contenido || article.descripcion || "";
        
        if (rawText.length > 10) {
            // Limpiamos Markdown, saltos de línea y espacios para obtener un texto continuo y plano
            let cleanText = rawText
                .replace(/##\s/g, '')     
                .replace(/\*\*/g, '')    
                .replace(/\*/g, '')      
                .replace(/\n\s*\n/g, '\n') 
                .trim();
            
            // Reemplazar saltos de línea por espacios (asumiendo que es un texto fluido)
            cleanText = cleanText.replace(/\n/g, ' '); 
            cleanText = cleanText.replace(/\s\s+/g, ' '); // Quitar espacios múltiples

            return cleanText;
        }

        // Fallback si es muy breve
        return article.titulo || "Mira el video para enterarte de todos los detalles.";
    };

    const toggleLike = (e, id) => {
        e.stopPropagation();
        const newLiked = new Set(likedVideos);
        if (newLiked.has(id)) newLiked.delete(id);
        else newLiked.add(id);
        setLikedVideos(newLiked);
    };

    const toggleDesc = (e, id) => {
        e.stopPropagation(); // Evita pausar el video al tocar el texto
        if (expandedDescId === id) setExpandedDescId(null);
        else setExpandedDescId(id);
    };

    const loadPlayer = (index) => {
        if (!window.YT || !articles[index]) return;
        const article = articles[index];
        const containerId = `player-${index}`;

        if (!document.getElementById(containerId)) return;
        if (playersRef.current[index]) return;

        playersRef.current[index] = new window.YT.Player(containerId, {
            videoId: article.youtubeId,
            playerVars: { autoplay: 0, mute: 0, controls: 0, playsinline: 1, rel: 0, modestbranding: 1, loop: 1, fs: 0, iv_load_policy: 3, disablekb: 1, origin: typeof window !== 'undefined' ? window.location.origin : undefined },
            events: {
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.ENDED) event.target.playVideo();
                    if (event.data === window.YT.PlayerState.PLAYING) { if (index === currentIndex) setIsPlaying(true); }
                    if (event.data === window.YT.PlayerState.PAUSED) { if (index === currentIndex) setIsPlaying(false); }
                }
            }
        });
    };

    const handleVideoInteraction = () => {
        if (showSwipeHint) setShowSwipeHint(false);
        const player = playersRef.current[currentIndex];
        if (!player || typeof player.getPlayerState !== 'function') return;

        const state = player.getPlayerState();
        if (state === 1) { player.pauseVideo(); setIsPlaying(false); }
        else { player.unMute(); player.setVolume(100); player.playVideo(); setIsPlaying(true); }
    };

    const goToSlide = (idx) => {
        if (isMovingRef.current || !articles || articles.length === 0) return;
        if (idx < 0) idx = 0; if (idx >= articles.length) idx = articles.length - 1; if (idx === currentIndex) return;

        isMovingRef.current = true;
        const prevIndex = currentIndex;
        setCurrentIndex(idx);
        setShowSwipeHint(false);
        setExpandedDescId(null); 

        const prevPlayer = playersRef.current[prevIndex];
        if (prevPlayer && typeof prevPlayer.pauseVideo === 'function') { prevPlayer.pauseVideo(); if (prevPlayer.seekTo) prevPlayer.seekTo(0); }
        
        setIsPlaying(false);
        managePlayers(idx);
        setTimeout(() => { isMovingRef.current = false; }, 500);
    };

    const managePlayers = (idx) => {
        loadPlayer(idx);
        if (idx + 1 < articles.length) setTimeout(() => loadPlayer(idx + 1), 500);
    };

    useEffect(() => {
        const hintTimer = setTimeout(() => setShowSwipeHint(false), 5000);
        if (window.YT && window.YT.Player) managePlayers(currentIndex);
        else window.onYouTubeIframeAPIReady = () => managePlayers(currentIndex);
        return () => clearTimeout(hintTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // GESTOS
    useEffect(() => {
        const handleWheel = (e) => {
            if (isMovingRef.current || showShareModal) return;
            wheelBufferRef.current += e.deltaY;
            if (wheelBufferRef.current > 50) {
                goToSlide(currentIndex + 1);
                wheelBufferRef.current = 0;
            } else if (wheelBufferRef.current < -50) {
                goToSlide(currentIndex - 1);
                wheelBufferRef.current = 0;
            }
        };

        const handleKeyDown = (e) => {
            if (isMovingRef.current || showShareModal) return;
            if (e.key === "ArrowDown" || e.key === "PageDown") goToSlide(currentIndex + 1);
            else if (e.key === "ArrowUp" || e.key === "PageUp") goToSlide(currentIndex - 1);
            else if (e.key === " " || e.key === "Enter") handleVideoInteraction();
        };

        const handleTouchStart = (e) => {
            if (e.touches.length === 1) touchStartYRef.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            if (showShareModal) return;
            const endY = e.changedTouches[0].clientY;
            const diffY = touchStartYRef.current - endY;
            if (Math.abs(diffY) > 60) {
                if (diffY > 0) goToSlide(currentIndex + 1);
                else goToSlide(currentIndex - 1);
            } 
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchend", handleTouchEnd, { passive: true });
        return () => { window.removeEventListener("wheel", handleWheel); window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("touchstart", handleTouchStart); window.removeEventListener("touchend", handleTouchEnd); };
    }, [currentIndex, showShareModal]); 

    const openShareModal = (e, article) => { e.stopPropagation(); setShareData({ title: article.titulo, url: `${window.location.origin}/feed?start_id=${article._id}` }); setShowShareModal(true); };
    const shareToWhatsApp = () => { if (shareData) { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Mira este video: ${shareData.title} ${shareData.url}`)}`, '_blank'); setShowShareModal(false); } };
    const copyToClipboard = async () => { if (shareData) { try { await navigator.clipboard.writeText(shareData.url); alert('Enlace copiado ✅'); } catch (err) { prompt("Copia el enlace:", shareData.url); } setShowShareModal(false); } };

    if (!articles || articles.length === 0) return (<div className="feed-error"><p style={{marginBottom: '20px'}}>Cargando noticias...</p><Link href="/" className="read-more-btn">Ir al Inicio</Link><style jsx>{`.feed-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #aaa; background: #111; } .read-more-btn { color: white; text-decoration: underline; }`}</style></div>);

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="theme-color" content="#000000" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
                <link rel="canonical" href={`https://www.noticias.lat/feed?start_id=${currentArticle._id}`} />
            </Head>
            <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />

            <div className="app">
                
                {/* HEADER */}
                <div className="app-header-container">
                    <Link href="/" className="header-left">
                        <i className="fas fa-chevron-left"></i>
                        <img src="/favicon.png" alt="Logo" />
                        <span>Noticias.lat</span>
                    </Link>
                    <Link href={`/articulo/${currentArticle._id}`} className="header-btn-read">Leer Nota</Link>
                </div>

                {/* PLAY OVERLAY */}
                {!isPlaying && (<div className="play-overlay" onClick={handleVideoInteraction}><i className="fas fa-play"></i></div>)}
                
                {/* SWIPE HINT */}
                {showSwipeHint && (<div className="swipe-hint"><div className="hand-icon">👆</div><span>Desliza</span></div>)}

                {/* SHARE MODAL */}
                {showShareModal && (
                    <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                        <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                            <h3>Compartir</h3>
                            <button className="share-option whatsapp" onClick={shareToWhatsApp}><i className="fab fa-whatsapp"></i> WhatsApp</button>
                            <button className="share-option copy" onClick={copyToClipboard}><i className="fas fa-link"></i> Copiar Enlace</button>
                            <button className="share-close" onClick={() => setShowShareModal(false)}>Cerrar</button>
                        </div>
                    </div>
                )}

                {articles.map((article, index) => {
                    if (Math.abs(currentIndex - index) > 1) return null; 
                    const offset = (index - currentIndex) * 100;
                    const isLiked = likedVideos.has(article._id);
                    const isDescExpanded = expandedDescId === article._id;
                    
                    // OBTENEMOS EL TEXTO COMPLETO Y LIMPIO DE IA
                    const fullDesc = getSmartDescription(article);
                    
                    // Recortamos a 200 caracteres para el gancho inicial
                    const shortDesc = fullDesc.length > 200 ? fullDesc.substring(0, 200) + "..." : fullDesc;
                    
                    // Recortamos a 450 caracteres para el expandido
                    const expandedText = fullDesc.length > 450 ? fullDesc.substring(0, 450) + "..." : fullDesc;
                    
                    // Decidir qué texto mostrar
                    const textToShow = isDescExpanded ? expandedText : shortDesc;
                    const showMoreButton = fullDesc.length > 200; // Mostrar botón si hay suficiente texto
                    
                    return (
                        <div 
                            key={article._id} 
                            className="slide" 
                            style={{ transform: `translateY(${offset}vh)` }}
                            onClick={handleVideoInteraction}
                        >
                            <div className="video-wrapper"><div id={`player-${index}`} className="yt-holder"></div></div>
                            <div className="video-gradient"></div>

                            {/* HUD */}
                            <div className="hud" onClick={(e) => e.stopPropagation()}>
                                <div className={`hud-item ${isLiked ? 'liked' : ''}`} onClick={(e) => toggleLike(e, article._id)}>
                                    <i className="fas fa-heart"></i><span>{isLiked ? 'Te gusta' : 'Me gusta'}</span>
                                </div>
                                <div className="hud-item" onClick={(e) => openShareModal(e, article)}>
                                    <i className="fas fa-share"></i><span>Compartir</span>
                                </div>
                            </div>

                            {/* INFO + DESCRIPCIÓN */}
                            <div className="info" onClick={(e) => e.stopPropagation()}>
                                <div className="tag">{article.categoria}</div>
                                <h2 className="article-title">{article.titulo}</h2>
                                
                                {/* DESCRIPCIÓN TIPO TIKTOK */}
                                {/* Importante: El texto completo está en el HTML, pero el CSS/JS lo recorta para el usuario */}
                                <div className={`article-desc ${isDescExpanded ? 'expanded' : ''}`} onClick={(e) => showMoreButton && toggleDesc(e, article._id)}>
                                    {textToShow}
                                    {showMoreButton && (
                                        <span className="more-text">
                                            {isDescExpanded ? ' menos' : ' más'}
                                        </span>
                                    )}
                                </div>

                                <Link href={`/articulo/${article._id}`} className="read-more-link">
                                    Leer nota completa <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx global>{`
                body { margin: 0; padding: 0; background-color: #000; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; }
                .app { position: relative; width: 100%; height: 100dvh; overflow: hidden; background: #000; }
                
                .app-header-container { position: absolute; top: 12px; left: 2%; width: 96%; z-index: 50; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.5); padding: 10px 15px; border-radius: 50px; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
                .header-left { display: flex; align-items: center; gap: 10px; text-decoration: none; color: white; }
                .header-left i { font-size: 1rem; opacity: 0.8; } .header-left img { width: 28px; height: 28px; border-radius: 5px; } .header-left span { font-weight: 700; font-size: 1rem; letter-spacing: 0.5px; }
                .header-btn-read { background: white; color: black; font-size: 0.8rem; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-decoration: none; transition: transform 0.1s; } .header-btn-read:active { transform: scale(0.95); }
                
                .play-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 55; background-color: #ffffff; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; pointer-events: none; box-shadow: 0 0 20px rgba(0,0,0,0.3); animation: popIn 0.2s ease-out; }
                .play-overlay i { color: #000000; font-size: 2.5rem; margin-left: 5px; }
                
                .slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1); background-color: #111; will-change: transform; }
                .video-wrapper { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none; }
                .yt-holder { width: 100%; height: 100%; } .yt-holder iframe { width: 100%; height: 100%; object-fit: cover; transform: scale(1.4); pointer-events: none; }
                .video-gradient { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 25%, transparent 60%); pointer-events: none; z-index: 2; }
                
                .hud { position: absolute; right: 12px; bottom: 90px; z-index: 20; display: flex; flex-direction: column; gap: 25px; align-items: center; }
                .hud-item { display: flex; flex-direction: column; align-items: center; color: white; cursor: pointer; opacity: 0.95; text-shadow: 0 2px 5px rgba(0,0,0,0.5); transition: transform 0.1s; } .hud-item:active { transform: scale(0.85); }
                .hud-item i { font-size: 2.4rem; margin-bottom: 5px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4)); transition: color 0.2s; } .hud-item span { font-size: 0.75rem; font-weight: 600; }
                .hud-item.liked i { color: #ff0050; animation: heartPop 0.3s ease-out; }
                
                /* INFO CONTAINER */
                .info { position: absolute; left: 15px; bottom: 30px; z-index: 20; max-width: 78%; text-align: left; text-shadow: 0 1px 3px rgba(0,0,0,0.9); display: flex; flex-direction: column; align-items: flex-start; }
                
                .tag { background: #ff0050; color: white; padding: 4px 8px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
                
                .article-title { color: white; font-size: 1.1rem; font-weight: 700; line-height: 1.3; margin: 0 0 8px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                
                /* ESTILOS DE LA DESCRIPCIÓN */
                .article-desc { 
                    color: rgba(255,255,255,0.9); 
                    font-size: 0.9rem; 
                    line-height: 1.4; 
                    margin-bottom: 12px; 
                    cursor: pointer; 
                    transition: all 0.3s ease;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
                }
                .article-desc.expanded { 
                    background: rgba(0,0,0,0.6);
                    padding: 10px; 
                    border-radius: 8px; 
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(255,255,255,0.1);
                    max-height: 250px; 
                    overflow-y: auto;
                }
                .more-text { font-weight: 700; color: #ccc; margin-left: 5px; }

                .read-more-link { color: #007bff; font-size: 0.95rem; text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 6px; margin-top: 5px; background: rgba(0,0,0,0.4); padding: 4px 10px; border-radius: 15px; backdrop-filter: blur(2px); }
                .read-more-link i { font-size: 0.8rem; }

                /* ANIMACIONES */
                .swipe-hint { position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%); z-index: 60; display: flex; flex-direction: column; align-items: center; color: white; opacity: 0.8; pointer-events: none; animation: fadeOutHint 5s forwards; }
                .hand-icon { font-size: 3rem; animation: swipeUp 1.5s infinite; } .swipe-hint span { font-size: 0.9rem; font-weight: 600; margin-top: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
                @keyframes swipeUp { 0% { transform: translateY(20px); opacity: 0; } 50% { transform: translateY(-10px); opacity: 1; } 100% { transform: translateY(-30px); opacity: 0; } }
                @keyframes fadeOutHint { 90% { opacity: 0.8; } 100% { opacity: 0; } }
                @keyframes popIn { from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; } to { transform: translate(-50%, -50%) scale(1); opacity: 1; } }
                @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
                
                /* MODAL */
                .share-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(3px); }
                .share-modal { background: #1f1f1f; width: 100%; max-width: 500px; border-radius: 20px 20px 0 0; padding: 25px; display: flex; flex-direction: column; gap: 12px; animation: slideUp 0.3s ease-out; border-top: 1px solid #333; box-shadow: 0 -5px 20px rgba(0,0,0,0.5); }
                .share-modal h3 { color: white; text-align: center; margin: 0 0 15px 0; font-size: 1.1rem; }
                .share-option { border: none; padding: 16px; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; color: white; transition: transform 0.1s; }
                .share-option:active { transform: scale(0.98); }
                .share-option.whatsapp { background-color: #25D366; color: #fff; } .share-option.copy { background-color: #333; }
                .share-close { margin-top: 10px; padding: 15px; background: transparent; border: none; color: #888; font-size: 1rem; cursor: pointer; width: 100%; font-weight: 600; }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @media (min-width: 768px) { .share-modal-overlay { align-items: center; } .share-modal { border-radius: 20px; } }
            `}</style>
        </>
    );
}