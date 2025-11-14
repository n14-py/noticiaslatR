// Archivo: pages/feed.js (¡NUEVO ARCHIVO!)

import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Leemos la URL de la API desde la variable de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lfaftechapi.onrender.com';
const SITIO = 'noticias.lat';

// 1. Cargar el primer lote de videos en el servidor
export async function getServerSideProps() {
    let initialVideos = [];
    try {
        // Pedimos artículos que tengan el video completo y los ordenamos por fecha
        const url = `${API_URL}/api/articles?sitio=${SITIO}&videoStatus=complete&limite=5`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            initialVideos = data.articulos;
        }
    } catch (e) {
        console.error("Error cargando videos iniciales para el feed:", e.message);
    }
    
    return {
        props: {
            initialVideos,
        },
    };
}


// 2. Componente de la Página
export default function FeedPage({ initialVideos }) {
    
    // (Esta es una implementación básica. Una versión avanzada
    // usaría 'IntersectionObserver' para cargar más videos al hacer scroll)

    return (
        <Layout>
            <Head>
                <title>Feed de Noticias en Video - Noticias.lat</title>
                <meta name="description" content="Las últimas noticias de Latinoamérica en formato de video corto. Desliza para mantenerte informado." />
                
                {/* CSS simple para el feed (se puede mover a style.css si prefieres) */}
                <style>{`
                    .feed-container {
                        max-width: 500px; /* Ancho de TikTok */
                        margin: 1rem auto;
                        display: flex;
                        flex-direction: column;
                        gap: 2rem; /* Espacio entre videos */
                    }
                    .feed-item {
                        border: 1px solid var(--borde-suave);
                        border-radius: var(--radio-borde);
                        overflow: hidden;
                        background: var(--color-tarjeta);
                        box-shadow: var(--sombra-suave);
                    }
                    .feed-video-player {
                        position: relative;
                        /* 16:9 - Si tus videos de avatar son horizontales */
                        padding-bottom: 56.25%; 
                        /* 9:16 - Si tus videos de avatar son verticales */
                        /* padding-bottom: 177%; */ 
                        height: 0;
                        background: #000;
                    }
                    .feed-video-player iframe {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    }
                    .feed-item-content {
                        padding: 1.25rem;
                    }
                    .feed-item-content h3 {
                        font-size: 1.2rem;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                        line-height: 1.4;
                    }
                    .feed-item-meta {
                        font-size: 0.85rem;
                        color: var(--color-texto-secundario);
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 1rem;
                    }
                `}</style>
            </Head>

            <div className="container">
                <div className="feed-container">
                    <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1rem' }}>
                        Noticias en Video
                    </h1>
                    
                    {initialVideos.length === 0 && (
                        <p style={{ textAlign: 'center' }}>No hay videos disponibles en este momento. Vuelve a intentarlo más tarde.</p>
                    )}

                    {initialVideos.map(article => (
                        <div key={article._id} className="feed-item">
                            <div className="feed-video-player">
                                {/* ¡Aquí se muestra el reproductor de Ezoic! */}
                                <iframe 
                                    src={article.videoUrl} 
                                    frameBorder="0" 
                                    allow="autoplay; encrypted-media" 
                                    allowFullScreen
                                    title={article.titulo}
                                ></iframe>
                            </div>
                            <div className="feed-item-content">
                                <div className="feed-item-meta">
                                    <span>{new Date(article.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                                    <span>{article.fuente}</span>
                                </div>
                                <h3>
                                    {/* El título linkea al artículo completo */}
                                    <Link href={`/articulo/${article._id}`}>
                                        {article.titulo}
                                    </Link>
                                </h3>
                            </div>
                        </div>
                    ))}
                    
                    {/* (Aquí iría el 'loader' para el scroll infinito) */}
                </div>
            </div>
        </Layout>
    );
}