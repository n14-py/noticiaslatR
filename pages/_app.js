import { useRef } from 'react';
// Quitamos la importación de Head porque ya no la usamos aquí
// import Head from 'next/head'; 

import '../styles/style.css';
import { PlayerProvider, usePlayer } from '../context/PlayerContext';
import PlayerBar from '../components/PlayerBar';

function MyApp({ Component, pageProps }) {
  const audioRef = useRef(null);

  return (
    <PlayerProvider>
      {/* Ya no ponemos el <Head> aquí, lo moveremos a _document.js */}
      
      <Component {...pageProps} />
      
      <PlayerBar />
      
      <AudioInjector setAudioElement={(el) => audioRef.current = el} />
    </PlayerProvider>
  );
}

function AudioInjector({ setAudioElement }) {
    const { setAudioElement: setAudioInContext } = usePlayer();
    
    const audioRef = (node) => {
        if (node) {
            setAudioElement(node);
            setAudioInContext(node);
        }
    };
    
    return (
        <audio 
          ref={audioRef} 
          id="audio-player" 
          preload="none"
        />
    );
}

export default MyApp;