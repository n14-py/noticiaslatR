import { usePlayer } from '../context/PlayerContext';
import Link from 'next/link';

// Usamos la imagen placeholder de noticias
const PLACEHOLDER_LOGO = '/images/placeholder.jpg';

export default function PlayerBar() {
    // 1. Obtenemos el estado y las funciones de nuestro "cerebro"
    const {
        currentStation,
        isPlaying,
        isLoading,
        stationLogo,
        togglePlayPause,
        stopStation
    } = usePlayer();

    // 2. Si no hay ninguna estación seleccionada, no mostramos nada.
    if (!currentStation) {
        return null;
    }

    // 3. Renderizamos la barra
    return (
        <div id="player-bar" className={currentStation ? 'active' : ''}>
            <div className="player-content-wrapper">
                <div className="player-minimized-view">
                    
                    {/* --- 1. Información de la Radio --- */}
                    <Link 
                        href={`/radio/${currentStation.uuid}`} 
                        className="player-info"
                        title={`Ir a ${currentStation.nombre}`}
                    >
                        <img 
                            id="player-logo" 
                            src={stationLogo || PLACEHOLDER_LOGO} 
                            alt="logo de la radio"
                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                        />
                        <div className="player-info-text">
                            <h4 id="player-nombre">{currentStation.nombre}</h4>
                            <p id="player-pais">{currentStation.pais}</p>
                        </div>
                    </Link>
                    
                    {/* --- 2. Controles de Audio --- */}
                    <div className="player-controls">
                        <button 
                            id="play-pause-btn" 
                            className={`player-btn control-center large-btn ${isLoading ? 'is-loading' : ''}`} 
                            aria-label="Reproducir o Pausar"
                            onClick={togglePlayPause}
                            disabled={isLoading}
                        >
                            {/* Mostramos PAUSE si está sonando, PLAY si no */}
                            {isPlaying ? (
                                <i className="fas fa-pause"></i>
                            ) : (
                                <i className="fas fa-play"></i>
                            )}
                        </button>
                    </div>
                    
                    {/* --- 3. Botón de Cerrar --- */}
                    <div className="player-buttons">
                        <button 
                            id="player-close-btn" 
                            className="player-btn" 
                            aria-label="Cerrar reproductor"
                            onClick={stopStation}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}