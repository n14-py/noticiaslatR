import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { usePlayer } from '../../context/PlayerContext';

// Configuración Edge
export const runtime = 'experimental-edge';

const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';
const PLACEHOLDER_LOGO = '/images/placeholder.jpg';

export async function getServerSideProps(context) {
    const { uuid } = context.params;
    context.res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    try {
        let res = await fetch(`${API_URL}/radio/${uuid}`);
        if (!res.ok) {
            const resSearch = await fetch(`${API_URL}/radio/buscar?uuid=${uuid}`);
            const dataSearch = await resSearch.json();
            if (dataSearch.radios && dataSearch.radios.length > 0) {
                 res = { ok: true, json: async () => dataSearch.radios[0] }; 
            } else {
                throw new Error("Radio no encontrada");
            }
        }
        const station = await res.json();
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

    // CORRECCIÓN AQUÍ: Template literals en el title
    return (
        <Layout>
            <Head>
                <title>{`Escuchar ${station.nombre} en vivo | Noticias.lat`}</title>
                <meta name="description" content={`Escucha ${station.nombre} de ${station.pais} en vivo. Transmisión online gratuita en Noticias.lat.`} />
                <meta property="og:title" content={`${station.nombre} - Radio en Vivo`} />
                <meta property="og:image" content={station.logo || PLACEHOLDER_LOGO} />
            </Head>

            <div className="container main-content">
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
                        
                        <h1>{station.nombre}</h1>
                        
                        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                            Transmisión en vivo de alta calidad. Escucha noticias, música y deportes de {station.pais} directamente en tu navegador.
                        </p>

                        <button 
                            className={`radio-play-large-btn ${isThisPlaying ? 'playing' : ''}`}
                            onClick={handlePlayClick}
                        >
                            {isThisPlaying ? (
                                <>
                                    <i className="fas fa-pause"></i> Pausar Transmisión
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-play"></i> Escuchar en Vivo
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {relatedStations && relatedStations.length > 0 && (
                    <div className="recommended-section" style={{ background: 'transparent', padding: '0', border: 'none', marginTop: '2rem' }}>
                        <h3 className="recommended-title" style={{ textAlign: 'left', fontSize: '1.5rem' }}>
                            Otras emisoras de {station.pais}
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
                        &laquo; Volver a todas las radios
                    </Link>
                </div>
            </div>
        </Layout>
    );
}

function StationCard({ station }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    const isActive = currentStation?.uuid === station.uuid;
    const isThisPlaying = isActive && isPlaying;

    const handlePlayClick = (e) => {
        e.preventDefault();
        if (isThisPlaying) pauseStation();
        else playStation(station);
    };

    return (
        <div className={`station-card ${isThisPlaying ? 'playing' : ''}`}>
             <div className="station-play-overlay" onClick={handlePlayClick}>
                <i className={`fas ${isThisPlaying ? 'fa-pause' : 'fa-play'}`} style={{ color: 'white', fontSize: '2rem' }}></i>
            </div>
            <div className="station-logo-wrapper">
                <img 
                    src={station.logo || PLACEHOLDER_LOGO} 
                    alt={station.nombre}
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                />
            </div>
            <Link href={`/radio/${station.uuid}`} className="station-title">
                {station.nombre}
            </Link>
            <span className="station-location">{station.pais}</span>
        </div>
    );
}