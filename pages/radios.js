import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

// Configuración Edge
export const runtime = 'experimental-edge';

const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';
const PLACEHOLDER_LOGO = '/images/placeholder.jpg'; 
const LIMITE_POR_PAGINA = 24;

export async function getServerSideProps(context) {
    context.res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    const { query, pais, genero, pagina: pagina_raw } = context.query;
    
    const queryParams = {
        query: query || null,
        pais: pais || null,
        genero: genero || null,
        pagina: parseInt(pagina_raw) || 1,
    };

    let url = `${API_URL}/radio/buscar?limite=${LIMITE_POR_PAGINA}&pagina=${queryParams.pagina}`;
    let tituloPagina = "Radios en Vivo";
    
    if (queryParams.query) {
        url += `&query=${encodeURIComponent(queryParams.query)}`;
        tituloPagina = `Resultados: "${queryParams.query}"`;
    } else if (queryParams.pais) {
        url += `&pais=${queryParams.pais}`;
        tituloPagina = `Emisoras de ${queryParams.pais}`;
    } else if (queryParams.genero) {
        url += `&genero=${encodeURIComponent(queryParams.genero)}`;
        tituloPagina = `Género: ${queryParams.genero}`;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error API`);
        const data = await res.json();
        
        if (queryParams.pais && data.radios.length > 0 && !queryParams.query) {
            tituloPagina = `Radios de ${data.radios[0].pais}`;
        }
        
        return { props: { data, queryParams, tituloPagina } };
    } catch (error) {
        return {
            props: {
                data: { radios: [], totalRadios: 0, totalPaginas: 1, paginaActual: 1 },
                queryParams,
                tituloPagina,
                error: "No pudimos conectar con las antenas. Intenta luego.",
            },
        };
    }
}

export default function RadiosPage({ data, queryParams, tituloPagina, error }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(queryParams.query || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = searchTerm.trim();
        if (!query) return;
        const newParams = new URLSearchParams();
        newParams.set('query', query);
        newParams.set('pagina', '1');
        router.push(`/radios?${newParams.toString()}`);
    };

    // CORRECCIÓN AQUÍ: Usamos template literals {`...`} dentro del title
    return (
        <Layout>
            <Head>
                <title>{`${tituloPagina} | Noticias.lat`}</title>
                <meta name="description" content={`Escucha ${tituloPagina} gratis en Noticias.lat. Música, noticias y deportes en vivo.`} />
            </Head>

            <div className="container main-content">
                <div className="radio-page-header">
                    <h1 className="article-title-main" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        {tituloPagina}
                    </h1>
                    
                    <form className="radio-search-container" onSubmit={handleSearchSubmit}>
                        <input 
                            type="text" 
                            className="radio-search-input"
                            placeholder="Buscar emisora, país o género..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="radio-search-btn">
                            <i className="fas fa-search"></i>
                        </button>
                    </form>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {['Argentina', 'México', 'Colombia', 'España', 'Noticias'].map(tag => (
                            <Link href={`/radios?query=${tag}`} key={tag} className="tag" style={{ fontSize: '0.85rem' }}>
                                {tag}
                            </Link>
                        ))}
                        <Link href="/radios" className="tag" style={{ background: '#333', color: '#fff' }}>
                            Ver Todas
                        </Link>
                    </div>
                </div>

                {error ? (
                    <div className="no-articles-message">{error}</div>
                ) : data.radios.length === 0 ? (
                    <div className="no-articles-message">No encontramos radios con ese criterio.</div>
                ) : (
                    <div className="stations-grid">
                        {data.radios.map(station => (
                            <StationCard key={station.uuid} station={station} />
                        ))}
                    </div>
                )}

                <Pagination 
                    paginaActual={data.paginaActual} 
                    totalPaginas={data.totalPaginas} 
                    queryParams={queryParams}
                />
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
            <span className="station-location">
                <i className="fas fa-map-marker-alt" style={{ marginRight: '5px', color: '#ef4444' }}></i>
                {station.pais}
            </span>
        </div>
    );
}

function Pagination({ paginaActual, totalPaginas, queryParams }) {
    if (totalPaginas <= 1) return null;
    const baseParams = new URLSearchParams();
    if (queryParams.query) baseParams.set('query', queryParams.query);
    if (queryParams.pais) baseParams.set('pais', queryParams.pais);
    if (queryParams.genero) baseParams.set('genero', queryParams.genero);

    const prevPage = Math.max(1, paginaActual - 1);
    const nextPage = Math.min(totalPaginas, paginaActual + 1);

    const buildLink = (page) => {
        const p = new URLSearchParams(baseParams);
        p.set('pagina', page);
        return `/radios?${p.toString()}`;
    };

    return (
        <div className="pagination-container">
            <Link href={buildLink(prevPage)} className={`pagination-btn ${paginaActual === 1 ? 'disabled' : ''}`}>
                &laquo; Anterior
            </Link>
            <span className="page-info">Página {paginaActual} de {totalPaginas}</span>
            <Link href={buildLink(nextPage)} className={`pagination-btn ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                Siguiente &raquo;
            </Link>
        </div>
    );
}