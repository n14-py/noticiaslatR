import { createContext, useContext, useState, useRef, useEffect } from 'react';

// URL de la API de fallback para logos
const LOGO_FALLBACK_URL = 'https://api.radio-browser.info/json/stations/search?limit=1&byuuid=';
// Usamos el placeholder que ya tienes en noticias
const PLACEHOLDER_LOGO = '/images/placeholder.jpg';

// 1. Creamos el Contexto
const PlayerContext = createContext();

// 2. Creamos el "Proveedor" (el componente que envuelve la app)
export function PlayerProvider({ children }) {
    const [currentStation, setCurrentStation] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stationLogo, setStationLogo] = useState(PLACEHOLDER_LOGO);

    // Usamos 'useRef' para el <audio> tag.
    const audioRef = useRef(null);

    // Esta función se ejecuta cuando el <audio> tag se monta en _app.js
    const setAudioElement = (element) => {
        audioRef.current = element;
        if (audioRef.current) {
            // Sincroniza el estado de play/pause con los botones del navegador/teléfono
            audioRef.current.onplay = () => setIsPlaying(true);
            audioRef.current.onpause = () => setIsPlaying(false);
            audioRef.current.onended = () => setIsPlaying(false);
            audioRef.current.onerror = () => {
                console.error("Error en el stream de audio.");
                setIsPlaying(false);
                setIsLoading(false);
            };
            audioRef.current.onwaiting = () => setIsLoading(true);
            audioRef.current.oncanplay = () => setIsLoading(false);
        }
    };

    // Función para sanitizar URLs
    const sanitizeStreamUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('https://')) return url;
        return url.replace('http://', 'https://');
    };

    // Función para buscar un logo mejor si falla el original
    const getBetterLogo = async (uuid) => {
        try {
             const response = await fetch(LOGO_FALLBACK_URL + uuid);
             const data = await response.json();
             if (data && data[0] && data[0].favicon && data[0].favicon !== '') {
                 return data[0].favicon;
             }
             return null;
        } catch (e) {
             return null;
        }
    };

    // --- Funciones Globales ---

    const playStation = async (station) => {
        if (!audioRef.current) return;

        setIsLoading(true);
        setCurrentStation(station);
        setStationLogo(PLACEHOLDER_LOGO); // Pone el placeholder mientras carga

        // 1. Manejo del logo
        let finalLogo = station.logo || PLACEHOLDER_LOGO;
        if (!station.logo || station.logo === PLACEHOLDER_LOGO) {
            const betterLogo = await getBetterLogo(station.uuid);
            if (betterLogo) finalLogo = betterLogo;
        }
        setStationLogo(finalLogo);

        // 2. Manejo del audio (con fallback)
        const httpsUrl = sanitizeStreamUrl(station.stream_url);
        audioRef.current.src = httpsUrl;
        
        try {
            await audioRef.current.play();
            setIsPlaying(true);
            setIsLoading(false);
        } catch (error) {
            console.warn("Fallback a HTTP:", error.message);
            // Fallback a HTTP si HTTPS falla
            if (httpsUrl !== station.stream_url) {
                audioRef.current.src = station.stream_url;
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (httpError) {
                    console.error(`Error final al reproducir ${station.nombre}:`, httpError.message);
                    setIsPlaying(false);
                }
            } else {
                setIsPlaying(false);
            }
            setIsLoading(false);
        }
    };

    const pauseStation = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const stopStation = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        setCurrentStation(null);
        setIsPlaying(false);
        setIsLoading(false);
    };

    const togglePlayPause = () => {
        if (!currentStation) return;
        if (isPlaying) {
            pauseStation();
        } else {
            // Si está pausada, simplemente reanuda
            audioRef.current.play().catch(e => console.error("Error al reanudar", e));
        }
    };
    
    // 3. Compartimos las funciones y estados con toda la app
    const value = {
        currentStation,
        isPlaying,
        isLoading,
        stationLogo,
        playStation,
        pauseStation,
        stopStation,
        togglePlayPause,
        setAudioElement,
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
}

// 4. Hook personalizado
export const usePlayer = () => {
    return useContext(PlayerContext);
};