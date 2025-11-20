import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
// Al final del archivo feed.js
// Al final de feed.js
export const runtime = 'experimental-edge';

// ¡Librerías que instalamos!
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import YouTube from 'react-youtube';

// Importar los estilos de Swiper
import 'swiper/css';
import 'swiper/css/mousewheel';

// Constantes de tu API
const API_URL = 'https://lfaftechapi.onrender.com';
const SITIO = 'noticias.lat';

// --- 1. FUNCIÓN (Se ejecuta en el SERVIDOR) ---
// Esta función obtiene la lista de videos de tu API ANTES de que la página cargue.
export async function getServerSideProps(context) {
    
    // Obtenemos el ID del artículo desde la URL (ej: /feed?start_id=123)
    const { start_id } = context.query;

    // --- ¡IMPORTANTE! ---
    // Esta es una NUEVA ruta de API que debemos crear en tu backend (lfaftechapi).
    // Esta ruta (que crearemos después) devolverá SOLO las noticias
    // que tengan videoProcessingStatus: 'complete' y un youtubeId.
    const url = `${API_URL}/api/articles/feed?sitio=${SITIO}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al cargar el feed de videos');
        
        const articles = await res.json();

        // Devolvemos los artículos como "props" a nuestra página
        return {
            props: {
                articles,
                start_id: start_id || null, // El ID para empezar
            },
        };
    } catch (error) {
        console.error("Error en getServerSideProps (Feed):", error.message);
        return {
            props: {
                articles: [],
                error: "No se pudo cargar el feed de videos.",
            },
        };
    }
}


// --- 2. COMPONENTE DE LA PÁGINA (Se ejecuta en el NAVEGADOR) ---
export default function FeedPage({ articles, start_id, error }) {
    
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    
    // Usamos 'useRef' para guardar las instancias de los reproductores de YouTube
    const playerRefs = useRef({}); 
    const swiperRef = useRef(null);

    // Lógica para encontrar el slide inicial
    let initialSlideIndex = 0;
    if (start_id) {
        const foundIndex = articles.findIndex(a => a._id === start_id);
        if (foundIndex !== -1) {
            initialSlideIndex = foundIndex;
        }
    }

    // Opciones del reproductor de YouTube
    const playerOptions = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0, // No auto-reproducir al inicio
            mute: 1,     // Empezar muteado
            controls: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1
        },
    };

    // Función para guardar la instancia del reproductor
    const onPlayerReady = (event, index) => {
        playerRefs.current[index] = event.target;
        
        // Si es el primer slide, lo reproducimos (muteado)
        if (index === initialSlideIndex) {
            event.target.playVideo();
        }
    };

    // Se dispara CADA VEZ que deslizas a un nuevo video
    const handleSlideChange = (swiper) => {
        const newIndex = swiper.activeIndex;
        const prevIndex = activeIndex;

        // Pausar el video anterior
        const prevPlayer = playerRefs.current[prevIndex];
        if (prevPlayer && typeof prevPlayer.pauseVideo === 'function') {
            prevPlayer.pauseVideo();
        }

        // Reproducir el video actual
        const newPlayer = playerRefs.current[newIndex];
        if (newPlayer && typeof newPlayer.playVideo === 'function') {
            if (audioEnabled) {
                newPlayer.unMute();
            } else {
                newPlayer.mute();
            }
            newPlayer.playVideo();
        }

        setActiveIndex(newIndex);
    };

    // Activar el audio (copiado de tu 1.html)
    const enableAudio = () => {
        setAudioEnabled(true);
        const currentPlayer = playerRefs.current[activeIndex];
        if (currentPlayer && typeof currentPlayer.unMute === 'function') {
            currentPlayer.unMute();
        }
        // Ocultar el botón
        document.getElementById('soundButton').style.display = 'none';
    };

    if (error) {
        return (
            <div className="feed-error">
                <h1>Error al cargar el feed</h1>
                <p>{error}</p>
                <Link href="/">Volver al inicio</Link>
            </div>
        );
    }

    return (
        <>
            {/* El Head es solo para el SEO de esta página específica */}
            <Head>
                <title>Noticias.lat - Feed</title>
                <meta name="robots" content="noindex" /> {/* Evita que Google indexe el feed */}
            </Head>
            
            {/* --- Esta es la estructura de tu 1.html, pero en React --- */}
            <div className="app">
                <Link href="/" legacyBehavior>
                    <a className="app-header">
                        <img src="/favicon.png" alt="Noticias.lat" />
                        <span>Noticias.lat</span>
                    </a>
                </Link>

                <div className="hint">▲▼ Desliza para cambiar video</div>

                {/* Botón de Sonido (igual que en 1.html) */}
                {!audioEnabled && (
                    <div id="soundButton" className="sound-btn" onClick={enableAudio}>
                        <div className="sound-btn-inner">
                            <span>🔊</span>
                            Toca o haz clic para activar el sonido
                        </div>
                    </div>
                )}

                <Swiper
                    ref={swiperRef}
                    direction={'vertical'}
                    modules={[Mousewheel]}
                    mousewheel={true}
                    className="feed-swiper-container"
                    onSlideChange={handleSlideChange}
                    initialSlide={initialSlideIndex} // Empezar en el slide correcto
                >
                    {articles.map((article, index) => (
                        <SwiperSlide key={article._id} className="slide">
                            
                            <YouTube
                                videoId={article.youtubeId}
                                opts={playerOptions}
                                onReady={(e) => onPlayerReady(e, index)}
                                className="yt-holder"
                            />

                            {/* --- HUD (Copiado de 1.html) --- */}
                            <div className="hud">
                                <div className="hud-item">
                                    <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" />
                                    <span>{article.likes || 0}</span>
                                </div>
                                <div className="hud-item">
                                    <img src="https://cdn-icons-png.flaticon.com/512/1380/1380338.png" />
                                    <span>{article.comments || 0}</span>
                                </div>
                                <div className="hud-item">
                                    <img src="https://cdn-icons-png.flaticon.com/512/929/929610.png" />
                                    <span>Compartir</span>
                                </div>
                            </div>

                            {/* --- Info (Copiado de 1.html) --- */}
                            <div className="info">
                                <div className="tag">{article.categoria}</div>
                                {article.titulo}
                            </div>

                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </>
    );
}