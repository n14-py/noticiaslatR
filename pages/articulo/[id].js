import { useState, useEffect } from 'react';
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

        // Obtener últimas noticias para la sección inferior
        const resLatest = await fetch(`${API_URL}/api/articles?sitio=noticias.lat&limite=6`);
        let latestNews = [];
        if (resLatest.ok) {
            const dataLatest = await resLatest.json();
            // Filtramos para que no salga la misma noticia que estamos leyendo
            latestNews = (dataLatest.articulos || dataLatest.articles || dataLatest).filter(a => a._id !== id).slice(0, 6);
        }

        return {
            props: {
                article,
                recommended,
                latestNews
            }
        };
    } catch (error) {
        console.error("Error fetching article:", error);
        return { notFound: true };
    }
}

export default function ArticuloPage({ article, recommended, latestNews }) {
    const router = useRouter();
    const [summary, setSummary] = useState(article.aiSummary || null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    
    // Estado para el feedback de navegación rápida
    const [isNavigating, setIsNavigating] = useState(false);
    
    // Estado para maquetación de comentarios
    const [commentText, setCommentText] = useState('');
    const [dummyComments, setDummyComments] = useState([
        { id: 1, user: 'Lector Anónimo', text: 'Excelente cobertura. Ojalá sigan informando con esta objetividad.', date: 'Hace 2 horas' },
        { id: 2, user: 'María G.', text: 'No estaba enterada de estos detalles, gracias por el resumen con IA, ayuda mucho cuando no hay tiempo.', date: 'Hace 5 horas' }
    ]);

    useEffect(() => {
        const handleStart = () => setIsNavigating(true);
        const handleComplete = () => {
            setIsNavigating(false);
            setSummary(article.aiSummary || null); // Reiniciar estado al cambiar de nota
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        const handleError = () => setIsNavigating(false);

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleError);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleError);
        };
    }, [router, article]);

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

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        // Simulación de envío
        const newComment = {
            id: Date.now(),
            user: 'Tú (Prueba)',
            text: commentText,
            date: 'Justo ahora'
        };
        setDummyComments([newComment, ...dummyComments]);
        setCommentText('');
    };

    if (router.isFallback) {
        return <div style={{ textAlign: 'center', padding: '5rem' }}><div className="loader-spinner"></div> Cargando...</div>;
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

            {/* Efecto visual de carga y transición entre rutas */}
            <div style={{
                opacity: isNavigating ? 0.4 : 1,
                transition: 'opacity 0.3s ease',
                pointerEvents: isNavigating ? 'none' : 'auto'
            }}>
                
                {isNavigating && (
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, background: 'rgba(255,255,255,0.9)', padding: '20px 40px', borderRadius: '50px', boxShadow: 'var(--sombra-lg)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <i className="fas fa-circle-notch fa-spin" style={{ color: 'var(--color-primario)', fontSize: '1.5rem' }}></i>
                        <span style={{ fontWeight: '700', color: 'var(--color-texto-titulos)' }}>Cargando noticia...</span>
                    </div>
                )}

                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', margin: '3rem auto', paddingBottom: '3rem' }}>
                    
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
                                        transition: 'all 0.2s',
                                        boxShadow: 'var(--sombra-md)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <i className={loadingSummary ? "fas fa-circle-notch fa-spin" : "fas fa-robot"}></i> 
                                    {loadingSummary ? 'Procesando lectura inteligente...' : 'Resumir con IA'}
                                </button>
                            ) : (
                                <div style={{ padding: '1.5rem', background: 'var(--color-primario-light)', borderRadius: '8px', border: '1px solid var(--color-primario)', color: 'var(--color-texto-cuerpo)', animation: 'fadeIn 0.5s ease-out' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-primario)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                                        <i className="fas fa-file-alt"></i> Puntos Clave Noticias.LAT
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

                        {/* BANNER COMUNIDAD TELEGRAM */}
                        <div style={{ background: 'linear-gradient(135deg, #0088cc 0%, #005f99 100%)', color: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', margin: '3rem 0', boxShadow: 'var(--sombra-lg)' }}>
                            <i className="fab fa-telegram-plane" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.9 }}></i>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Únete a nuestra comunidad</h3>
                            <p style={{ margin: '0 0 20px 0', fontSize: '1.05rem', opacity: 0.9 }}>Recibe las noticias de último minuto sin censura y debates en vivo directamente en tu celular.</p>
                            <a href="https://t.me/noticiaslat" target="_blank" rel="noreferrer" style={{ background: 'white', color: '#0088cc', padding: '12px 30px', borderRadius: '50px', textDecoration: 'none', fontWeight: '800', display: 'inline-block', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                Entrar al Canal de Telegram
                            </a>
                        </div>
                        
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

                        {/* SECCIÓN DE COMENTARIOS (MAQUETACIÓN) */}
                        <div className="comments-section" style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--color-borde)' }}>
                            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-texto-titulos)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="far fa-comments"></i> Comentarios
                            </h3>
                            
                            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <textarea 
                                    rows="4" 
                                    placeholder="¿Qué opinas sobre esta noticia? Deja tu comentario..." 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--color-borde)', fontFamily: 'var(--font-sans)', fontSize: '1rem', resize: 'vertical', outline: 'none' }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primario)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--color-borde)'}
                                ></textarea>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={!commentText.trim()} style={{ background: commentText.trim() ? 'var(--color-primario)' : '#ccc', color: 'white', padding: '10px 25px', borderRadius: '50px', border: 'none', fontWeight: '700', cursor: commentText.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
                                        Publicar Comentario
                                    </button>
                                </div>
                            </form>

                            <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {dummyComments.map(c => (
                                    <div key={c.id} style={{ display: 'flex', gap: '15px', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--color-borde)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-texto-suave)', fontSize: '1.2rem', flexShrink: 0 }}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <h5 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-texto-titulos)' }}>{c.user}</h5>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-texto-suave)' }}>{c.date}</span>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--color-texto-cuerpo)', lineHeight: '1.5', fontSize: '0.95rem' }}>{c.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </article>

                    {/* COLUMNA DERECHA: NOTICIAS SIMILARES FIJAS */}
                    <aside style={{ flex: '1 1 30%', minWidth: '300px' }}>
                        <div style={{ position: 'sticky', top: '100px' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-texto-titulos)', borderBottom: '2px solid var(--color-primario)', paddingBottom: '10px' }}>
                                Noticias Relacionadas
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {recommended.length > 0 ? recommended.map(rec => (
                                    <Link href={`/articulo/${rec._id}`} key={rec._id} style={{ display: 'flex', gap: '15px', textDecoration: 'none', color: 'inherit', alignItems: 'center', transition: 'transform 0.1s ease', cursor: 'pointer' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        <div style={{ width: '100px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                                            <img src={rec.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={rec.titulo} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '0.95rem', margin: '0 0 5px 0', lineHeight: '1.4', color: 'var(--color-texto-titulos)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primario)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-texto-titulos)'}>
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

                {/* SECCIÓN INFERIOR: MÁS NOTICIAS (BENTO GRID) */}
                {latestNews.length > 0 && (
                    <div className="container bottom-news-section" style={{ borderTop: '4px solid var(--color-borde)', paddingTop: '4rem', paddingBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--color-texto-titulos)', marginBottom: '2rem', textAlign: 'center' }}>
                            Más Noticias Relevantes
                        </h2>
                        
                        <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {latestNews.map((news) => (
                                <Link href={`/articulo/${news._id}`} key={news._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="article-card" style={{ height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--sombra-lg)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--sombra-sm)'; }}>
                                        <div className="card-image-wrapper" style={{ paddingTop: '55%' }}>
                                            <img src={news.imagen} alt={news.titulo} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {news.youtubeId && news.videoProcessingStatus === 'complete' && (
                                                <div className="card-play-overlay" style={{ opacity: 1, background: 'transparent' }}>
                                                    <div className="card-play-icon" style={{ width: '40px', height: '40px', fontSize: '1rem', transform: 'scale(1)' }}>
                                                        <i className="fas fa-play"></i>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-content" style={{ padding: '1.2rem' }}>
                                            <div className="card-tags" style={{ marginBottom: '10px' }}>
                                                <span className="tag" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>{news.categoria}</span>
                                            </div>
                                            <h3 className="card-title" style={{ fontSize: '1.05rem', marginBottom: '8px', lineHeight: '1.4' }}>
                                                {news.titulo}
                                            </h3>
                                            <div className="card-meta" style={{ marginTop: 'auto', fontSize: '0.8rem' }}>
                                                <span><i className="far fa-clock"></i> {new Date(news.fecha).toLocaleDateString('es-ES')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Layout>
    );
}