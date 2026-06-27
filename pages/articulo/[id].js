import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

// Obligatorio para el funcionamiento actual en Cloudflare
export const runtime = 'experimental-edge';

const API_URL = 'https://api.noticias.lat';

export async function getServerSideProps(context) {
    // Caché puro en el Edge de Cloudflare: 30 minutos (1800 segundos)
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=1800, stale-while-revalidate=86400'
    );

    const { id } = context.params;

    try {
        const resArt = await fetch(`${API_URL}/api/article/${id}`);
        if (!resArt.ok) return { notFound: true };
        const article = await resArt.json();

        // Obtener noticias similares (recomendadas) para el nuevo diseño lateral
        const resRec = await fetch(`${API_URL}/api/articles/recommended?sitio=noticias.lat&categoria=${article.categoria || 'general'}&excludeId=${id}`);
        let recommended = [];
        if (resRec.ok) {
            recommended = await resRec.json();
        }

        return {
            props: {
                article,
                recommended
            }
        };
    } catch (error) {
        console.error("Error fetching article:", error);
        return { notFound: true };
    }
}

export default function ArticuloPage({ article, recommended }) {
    const router = useRouter();
    const [summary, setSummary] = useState(article.aiSummary || null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    const fetchAISummary = async () => {
        setLoadingSummary(true);
        try {
            const res = await fetch(`${API_URL}/api/article/${article._id}/ai-summary`);
            const data = await res.json();
            if (data.summary) {
                setSummary(data.summary);
            }
        } catch (error) {
            console.error("Error obteniendo resumen IA:", error);
        }
        setLoadingSummary(false);
    };

    if (router.isFallback) {
        return <div style={{ textAlign: 'center', padding: '5rem' }}>Cargando...</div>;
    }

    const fechaFormat = new Date(article.fecha).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <Layout>
            <Head>
                <title>{article.titulo} - Noticias.lat</title>
                <meta name="description" content={article.descripcion} />
                <meta property="og:image" content={article.imagen} />
                <meta property="og:title" content={article.titulo} />
                <meta property="og:description" content={article.descripcion} />
            </Head>

            <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', margin: '3rem auto', paddingBottom: '5rem' }}>
                
                {/* COLUMNA IZQUIERDA: CONTENIDO PRINCIPAL */}
                <article style={{ flex: '1 1 65%', minWidth: '300px' }}>
                    <div className="article-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                        <span className="article-category-badge" style={{ marginBottom: '1rem' }}>
                            {article.categoria}
                        </span>
                        <h1 className="article-title-main" style={{ textAlign: 'left', fontSize: '2.5rem' }}>
                            {article.titulo}
                        </h1>
                        
                        <div className="article-meta-row" style={{ justifyContent: 'flex-start', margin: '1.5rem 0', padding: '1rem 0' }}>
                            <div className="meta-item">
                                <i className="far fa-clock"></i> {fechaFormat}
                            </div>
                            <div className="meta-item source-badge">
                                Fuente: {article.fuente || 'Redacción'}
                            </div>
                        </div>
                    </div>

                    <div className="article-hero-image">
                        <img src={article.imagen} alt={article.titulo} style={{ width: '100%', borderRadius: '12px', objectFit: 'cover' }} />
                    </div>

                    {/* REPRODUCTOR DE AUDIO (AUDIONOTICIAS) */}
                    {article.audioUrl && (
                        <div style={{ margin: '2rem 0', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--color-borde)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h4 style={{ margin: '0', fontSize: '1rem', color: 'var(--color-texto-titulos)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fas fa-headphones" style={{ color: 'var(--color-primario)' }}></i> Escucha esta noticia
                            </h4>
                            <audio controls style={{ width: '100%', outline: 'none' }} src={article.audioUrl}>
                                Tu navegador no soporta el elemento de audio.
                            </audio>
                        </div>
                    )}

                    {/* BOTÓN RESUMEN IA */}
                    <div style={{ margin: '2rem 0' }}>
                        {!summary ? (
                            <button 
                                onClick={fetchAISummary} 
                                disabled={loadingSummary} 
                                style={{ 
                                    background: 'var(--color-primario)', 
                                    color: 'white', 
                                    padding: '12px 24px', 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <i className="fas fa-robot"></i> {loadingSummary ? 'Procesando lectura...' : 'Resumir con IA'}
                            </button>
                        ) : (
                            <div style={{ padding: '1.5rem', background: 'var(--color-primario-light)', borderRadius: '8px', border: '1px solid var(--color-primario)', color: 'var(--color-texto-cuerpo)' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-primario)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fas fa-robot"></i> Resumen Inteligente
                                </h4>
                                <p style={{ margin: 0, lineHeight: '1.6' }}>{summary}</p>
                            </div>
                        )}
                    </div>

                    {/* CUERPO DEL ARTÍCULO */}
                    <div 
                        className="article-body-content" 
                        style={{ marginTop: '2rem' }}
                        dangerouslySetInnerHTML={{ __html: article.articuloGenerado ? article.articuloGenerado.replace(/\n/g, '<br/><br/>') : article.descripcion }} 
                    />

                    {/* VIDEO DE YOUTUBE AL FINAL */}
                    {article.youtubeId && article.videoProcessingStatus === 'complete' && (
                        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--color-borde)' }}>
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-texto-titulos)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fab fa-youtube" style={{ color: '#ff0000' }}></i> Cobertura en Video
                            </h3>
                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: 'var(--sombra-md)' }}>
                                <iframe 
                                    src={`https://www.youtube.com/embed/${article.youtubeId}`} 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}
                    
                    {/* SECCIÓN COMPARTIR */}
                    <div className="share-section" style={{ marginTop: '3rem' }}>
                        <h4>Compartir esta noticia</h4>
                        <div className="share-buttons-grid">
                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.titulo + ' ' + API_URL + '/articulo/' + article._id)}`} target="_blank" rel="noreferrer" className="share-btn-whatsapp" style={{ padding: '10px 15px', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                                <i className="fab fa-whatsapp"></i> WhatsApp
                            </a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.titulo)}&url=${encodeURIComponent(API_URL + '/articulo/' + article._id)}`} target="_blank" rel="noreferrer" className="share-btn-twitter" style={{ padding: '10px 15px', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                                <i className="fab fa-twitter"></i> X (Twitter)
                            </a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(API_URL + '/articulo/' + article._id)}`} target="_blank" rel="noreferrer" className="share-btn-facebook" style={{ padding: '10px 15px', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                                <i className="fab fa-facebook-f"></i> Facebook
                            </a>
                        </div>
                    </div>
                </article>

                {/* COLUMNA DERECHA: NOTICIAS SIMILARES FIJAS */}
                <aside style={{ flex: '1 1 30%', minWidth: '300px' }}>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-texto-titulos)', borderBottom: '2px solid var(--color-primario)', paddingBottom: '10px' }}>
                            Noticias Similares
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {recommended.length > 0 ? recommended.map(rec => (
                                <Link href={`/articulo/${rec._id}`} key={rec._id} style={{ display: 'flex', gap: '15px', textDecoration: 'none', color: 'inherit', alignItems: 'center' }}>
                                    <div style={{ width: '100px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={rec.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={rec.titulo} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.95rem', margin: '0 0 5px 0', lineHeight: '1.4', color: 'var(--color-texto-titulos)' }}>
                                            {rec.titulo.length > 60 ? rec.titulo.substring(0, 60) + '...' : rec.titulo}
                                        </h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-suave)', textTransform: 'uppercase', fontWeight: '600' }}>
                                            {rec.categoria}
                                        </span>
                                    </div>
                                </Link>
                            )) : (
                                <p style={{ color: 'var(--color-texto-suave)', fontSize: '0.9rem' }}>No hay noticias similares por el momento.</p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </Layout>
    );
}