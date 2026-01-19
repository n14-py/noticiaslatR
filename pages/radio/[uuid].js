import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { usePlayer } from '../../context/PlayerContext';

// --- CONFIGURACIÓN CLOUDFLARE (Fijo para evitar errores) ---
export const runtime = 'experimental-edge';

const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';
const PLACEHOLDER_LOGO = '/images/placeholder.jpg';

// --- SERVIDOR: BUSCAR DATOS ---
export async function getServerSideProps(context) {
    const { uuid } = context.params;
    
    // Cache agresivo para que cargue instantáneo (1 día)
    context.res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');

    try {
        // 1. Buscamos la radio por UUID
        // Nota: Intentamos primero el endpoint directo, si falla usamos el de búsqueda
        let res = await fetch(`${API_URL}/radio/${uuid}`);
        
        if (!res.ok) {
            // Plan B: Buscar por query string si el endpoint directo falla
            const resSearch = await fetch(`${API_URL}/radio/buscar?uuid=${uuid}`);
            const dataSearch = await resSearch.json();
            if (dataSearch.radios && dataSearch.radios.length > 0) {
                 // Simulamos respuesta exitosa con el primer resultado
                 res = { ok: true, json: async () => dataSearch.radios[0] }; 
            } else {
                throw new Error("Radio no encontrada");
            }
        }

        const station = await res.json();

        // 2. Buscamos radios recomendadas (Mismo País)
        // Pedimos 8 para tener una buena grilla
        let relatedStations = [];
        try {
            const resRelated = await fetch(`${API_URL}/radio/buscar?pais=${encodeURIComponent(station.pais)}&limite=8`);
            const dataRelated = await resRelated.json();
            // Filtramos para que no salga la misma radio que estamos escuchando
            relatedStations = dataRelated.radios.filter(r => r.uuid !== station.uuid).slice(0, 8);
        } catch (e) {
            console.error("Error cargando relacionadas", e);
        }

        return {
            props: {
                station,
                relatedStations
            }
        };

    } catch (error) {
        console.error("Error en getServerSideProps:", error);
        return {
            notFound: true, 
        };
    }
}

// --- CLIENTE: UI ---
export default function RadioDetailPage({ station, relatedStations }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    
    // Detectar si está sonando ESTA radio
    const isThisPlaying = currentStation?.uuid === station.uuid && isPlaying;

    const handlePlayClick = () => {
        if (isThisPlaying) {
            pauseStation();
        } else {
            playStation(station);
        }
    };

    // --- LÓGICA DE TEXTOS ---
    // Usamos tu campo de la BD 'descripcionGenerada'
    // Si viene vacío, usamos un fallback genérico profesional.
    const descriptionText = station.descripcionGenerada && station.descripcionGenerada.length > 10 
        ? station.descripcionGenerada 
        : `Escucha ${station.nombre} en vivo. La mejor programación de ${station.pais} online, con música, noticias y entretenimiento las 24 horas del día. Transmisión gratuita en Noticias.lat.`;

    // Generar tags para SEO visual
    const tags = station.generos 
        ? station.generos.split(',').slice(0, 5) 
        : [station.pais, 'Radio Online', 'En Vivo'];

    return (
        <Layout>
            <Head>
                {/* Título Optimizado: Nombre - Ciudad, País | Marca */}
                <title>{`${station.nombre} en Vivo - ${station.pais} | Noticias.lat`}</title>
                
                {/* Meta Description usando tu campo de BD */}
                <meta name="description" content={`🔴 ${descriptionText.substring(0, 150)}... Escúchala gratis aquí.`} />
                
                <meta name="robots" content="index, follow" />
                
                {/* Open Graph (Facebook/WhatsApp) */}
                <meta property="og:title" content={`${station.nombre} - Radio en Vivo`} />
                <meta property="og:description" content={descriptionText.substring(0, 200)} />
                <meta property="og:image" content={station.logo || PLACEHOLDER_LOGO} />
                <meta property="og:type" content="music.radio_station" />
                <meta property="og:site_name" content="Noticias.lat" />
            </Head>

            <div className="container main-content">
                
                {/* --- 1. SECCIÓN HERO (Reproductor Principal) --- */}
                <div className="radio-detail-header" style={{
                    background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    {/* Logo con efecto de sombra */}
                    <div className="radio-detail-logo" style={{
                        flexShrink: 0,
                        width: '120px',
                        height: '120px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        background: '#fff'
                    }}>
                        <img 
                            src={station.logo || PLACEHOLDER_LOGO} 
                            alt={`Logo ${station.nombre}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                        />
                    </div>

                    {/* Info y Botón Play */}
                    <div className="radio-detail-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <span className="tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                <i className="fas fa-globe-americas" style={{marginRight:'5px'}}></i>
                                {station.pais}
                            </span>
                            <span className="tag" style={{ background: '#dcfce7', color: '#15803d' }}>
                                <i className="fas fa-signal" style={{marginRight:'5px'}}></i> En Vivo
                            </span>
                        </div>
                        
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '800', 
                            marginBottom: '1rem', 
                            lineHeight: '1.2',
                            color: '#0f172a' 
                        }}>
                            {station.nombre}
                        </h1>

                        <button 
                            className={`radio-play-large-btn ${isThisPlaying ? 'playing' : ''}`}
                            onClick={handlePlayClick}
                            style={{
                                padding: '12px 28px',
                                fontSize: '1.1rem',
                                borderRadius: '50px',
                                background: isThisPlaying ? '#ef4444' : '#0066cc',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isThisPlaying ? (
                                <>
                                    <i className="fas fa-pause"></i> Pausar Transmisión
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-play"></i> Escuchar Ahora
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- 2. DESCRIPCIÓN SEO (Usando descripcionGenerada) --- */}
                <div className="radio-description-box" style={{
                    background: '#fff',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '3rem'
                }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#334155' }}>
                        Información de la Emisora
                    </h2>
                    
                    <p style={{ 
                        fontSize: '1.05rem', 
                        lineHeight: '1.8', 
                        color: '#475569', 
                        marginBottom: '1.5rem' 
                    }}>
                        {descriptionText}
                    </p>
                    
                    {/* Tags / Géneros */}
                    <div className="radio-tags-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {tags.map((tag, i) => (
                            <span key={i} className="seo-tag" style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                color: '#64748b',
                                textTransform: 'capitalize'
                            }}>
                                #{tag.trim()}
                            </span>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#94a3b8' }}>
                         Frecuencia/Stream: Online • Popularidad: {station.popularidad || 'Alta'} • Código: {station.pais_code}
                    </div>
                </div>

                {/* --- 3. RADIOS RELACIONADAS (Del mismo país) --- */}
                {relatedStations && relatedStations.length > 0 && (
                    <div className="recommended-section" style={{ marginTop: '3rem' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '1.5rem' 
                        }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                Radios Recomendadas en {station.pais}
                            </h3>
                            <Link href={`/radios?pais=${encodeURIComponent(station.pais)}`} style={{ color: '#0066cc', fontWeight: '600' }}>
                                Ver todas <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>

                        <div className="stations-grid">
                            {relatedStations.map(relStation => (
                                <StationCard key={relStation.uuid} station={relStation} />
                            ))}
                        </div>
                    </div>
                )}
                
                <div style={{ marginTop: '4rem', textAlign: 'center', marginBottom: '2rem' }}>
                    <Link href="/radios" className="pagination-btn">
                        <i className="fas fa-th-large" style={{ marginRight: '8px' }}></i>
                        Volver al Catálogo Completo
                    </Link>
                </div>

            </div>
        </Layout>
    );
}

// --- SUB-COMPONENTE: TARJETA RELACIONADA ---
function StationCard({ station }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    const isThisPlaying = currentStation?.uuid === station.uuid && isPlaying;

    const handleCardClick = () => {
        if (isThisPlaying) pauseStation();
        else playStation(station);
    };

    const handleInfoClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div 
            className={`station-card ${isThisPlaying ? 'playing' : ''}`}
            onClick={handleCardClick}
            title={`Escuchar ${station.nombre}`}
        >
             {isThisPlaying && (
                <div className="playing-indicator" style={{top: '10px', left: '10px'}}>
                    <div className="bar-anim"></div><div className="bar-anim"></div><div className="bar-anim"></div>
                </div>
            )}
            
            <Link 
                href={`/radio/${station.uuid}`} 
                className="station-info-btn"
                onClick={handleInfoClick}
                title="Ver detalles"
            >
                <i className="fas fa-info"></i>
            </Link>

            <div className="station-logo-wrapper">
                <img 
                    src={station.logo || PLACEHOLDER_LOGO} 
                    alt={station.nombre}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                />
            </div>
            <div className="station-title">{station.nombre}</div>
            <span className="station-location">{station.pais}</span>
        </div>
    );
}