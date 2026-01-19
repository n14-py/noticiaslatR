import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { usePlayer } from '../../context/PlayerContext';

// --- CONFIGURACIÓN CLOUDFLARE ---
export const runtime = 'experimental-edge';

const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';
const PLACEHOLDER_LOGO = '/images/placeholder.jpg';

export async function getServerSideProps(context) {
    const { uuid } = context.params;
    context.res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400'); // Cache largo para SEO

    try {
        let res = await fetch(`${API_URL}/radio/${uuid}`);
        if (!res.ok) {
            // Fallback de búsqueda si el ID directo falla
            const resSearch = await fetch(`${API_URL}/radio/buscar?uuid=${uuid}`);
            const dataSearch = await resSearch.json();
            if (dataSearch.radios && dataSearch.radios.length > 0) {
                 res = { ok: true, json: async () => dataSearch.radios[0] }; 
            } else {
                throw new Error("Radio no encontrada");
            }
        }
        const station = await res.json();
        
        // Buscar relacionadas para enlaces internos (bueno para SEO)
        const resRelated = await fetch(`${API_URL}/radio/buscar?pais=${station.pais}&limite=4`);
        const dataRelated = await resRelated.json();
        const relatedStations = dataRelated.radios.filter(r => r.uuid !== station.uuid).slice(0, 4);

        return { props: { station, relatedStations } };
    } catch (error) {
        return { notFound: true };
    }
}

export default function RadioDetailPage({ station, relatedStations }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    const isThisPlaying = currentStation?.uuid === station.uuid && isPlaying;

    const handlePlayClick = () => {
        if (isThisPlaying) pauseStation();
        else playStation(station);
    };

    // --- GENERACIÓN DE DESCRIPCIÓN SEO (Si la API viene vacía) ---
    // Creamos un texto rico automáticamente para que Google tenga algo que leer.
    const descriptionText = station.descripcion && station.descripcion.length > 10 
        ? station.descripcion 
        : `Escucha ${station.nombre} en vivo desde ${station.pais}. Disfruta de la mejor programación de radio online, noticias, música y deportes. Transmisión gratuita y sin cortes en Noticias.lat, tu plataforma líder en medios digitales.`;

    const tags = station.tags ? station.tags.split(',') : [station.pais, 'Radio Online', 'En Vivo', 'Noticias', 'Música'];

    return (
        <Layout>
            <Head>
                <title>{`Escuchar ${station.nombre} en vivo - ${station.pais} | Noticias.lat`}</title>
                <meta name="description" content={`🔴 ${station.nombre} en vivo. ${descriptionText.substring(0, 140)}... Escúchala gratis aquí.`} />
                <meta name="robots" content="index, follow" />
                
                {/* Open Graph para redes sociales */}
                <meta property="og:title" content={`${station.nombre} - Radio en Vivo`} />
                <meta property="og:description" content={`Escucha ahora ${station.nombre} de ${station.pais} en alta calidad.`} />
                <meta property="og:image" content={station.logo || PLACEHOLDER_LOGO} />
                <meta property="og:type" content="music.radio_station" />
            </Head>

            <div className="container main-content">
                
                {/* --- HEADER DE LA RADIO --- */}
                <div className="radio-detail-header">
                    <div className="radio-detail-logo">
                        <img 
                            src={station.logo || PLACEHOLDER_LOGO} 
                            alt={`Logo ${station.nombre}`}
                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                        />
                    </div>

                    <div className="radio-detail-info">
                        <div className="radio-detail-country">
                            <span className="tag">{station.pais}</span>
                            {station.idioma && <span className="tag" style={{background: '#f1f5f9', color: '#64748b'}}>{station.idioma}</span>}
                        </div>
                        
                        <h1 style={{fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px'}}>{station.nombre}</h1>
                        
                        <p style={{ marginBottom: '1.5rem', color: '#64748b', fontSize: '1.1rem' }}>
                            <i className="fas fa-signal" style={{color: '#22c55e', marginRight: '5px'}}></i> Señal en vivo disponible
                        </p>

                        <button 
                            className={`radio-play-large-btn ${isThisPlaying ? 'playing' : ''}`}
                            onClick={handlePlayClick}
                        >
                            {isThisPlaying ? (
                                <>
                                    <i className="fas fa-pause"></i> Pausar
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-play"></i> Reproducir Ahora
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- NUEVO: APARTADO DE DESCRIPCIÓN SEO --- */}
                <div className="radio-description-box">
                    <h2>Sobre {station.nombre}</h2>
                    <p>{descriptionText}</p>
                    
                    {/* Detalles técnicos adicionales para SEO */}
                    <div style={{marginTop: '1rem', color: '#64748b', fontSize: '0.9rem'}}>
                        <strong>Ubicación:</strong> {station.estado ? `${station.estado}, ` : ''}{station.pais} <br/>
                        <strong>Género Principal:</strong> {station.genero || 'Variado'} <br/>
                        {station.homepage && (
                            <div style={{marginTop: '10px'}}>
                                <a href={station.homepage} target="_blank" rel="noopener noreferrer" style={{color: '#0066cc', textDecoration: 'underline'}}>
                                    Visitar sitio web oficial <i className="fas fa-external-link-alt" style={{fontSize: '0.8em'}}></i>
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="radio-tags-list">
                        {tags.map((tag, i) => (
                            <span key={i} className="seo-tag">#{tag.trim()}</span>
                        ))}
                    </div>
                </div>

                {/* --- RELACIONADOS --- */}
                {relatedStations && relatedStations.length > 0 && (
                    <div className="recommended-section" style={{ background: 'transparent', padding: '0', border: 'none', marginTop: '2rem' }}>
                        <h3 className="recommended-title" style={{ textAlign: 'left', fontSize: '1.5rem' }}>
                            Más emisoras de {station.pais}
                        </h3>
                        <div className="stations-grid">
                            {relatedStations.map(relStation => (
                                <StationCard key={relStation.uuid} station={relStation} />
                            ))}
                        </div>
                    </div>
                )}
                
                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <Link href="/radios" className="pagination-btn">
                        &laquo; Volver al catálogo
                    </Link>
                </div>

            </div>
        </Layout>
    );
}

// Mini Card para relacionados (reutilizamos la lógica del Click to Play)
function StationCard({ station }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    const isThisPlaying = currentStation?.uuid === station.uuid && isPlaying;

    const handleCardClick = () => {
        if (isThisPlaying) pauseStation();
        else playStation(station);
    };

    return (
        <div className={`station-card ${isThisPlaying ? 'playing' : ''}`} onClick={handleCardClick}>
             {isThisPlaying && (
                <div className="playing-indicator" style={{top: '10px', left: '10px'}}>
                    <div className="bar-anim"></div><div className="bar-anim"></div><div className="bar-anim"></div>
                </div>
            )}
            
            {/* Botón info también aquí */}
             <Link href={`/radio/${station.uuid}`} className="station-info-btn" onClick={(e) => e.stopPropagation()}>
                <i className="fas fa-info"></i>
            </Link>

            <div className="station-logo-wrapper">
                <img 
                    src={station.logo || PLACEHOLDER_LOGO} 
                    alt={station.nombre}
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                />
            </div>
            <div className="station-title">{station.nombre}</div>
            <span className="station-location">{station.pais}</span>
        </div>
    );
}