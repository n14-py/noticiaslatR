import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

// Configuración Edge
export const runtime = 'experimental-edge';

// URL API
const API_URL = 'https://lfaftechapi.onrender.com';
const PLACEHOLDER_IMG = '/images/placeholder.jpg';

// --- 1. SERVER SIDE PROPS ---
export async function getServerSideProps(context) {
    const { id } = context.params;
    
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=86400, stale-while-revalidate=3600'
    );

    try {
        const res = await fetch(`${API_URL}/api/article/${id}`);
        if (!res.ok) return { notFound: true };
        const article = await res.json();

        // Cargar Recomendados (Ahora traerá hasta 12 si el backend está actualizado)
        let recommended = [];
        try {
            const sitio = article.sitio || 'noticias.lat';
            const cat = article.categoria || 'general';
            const recommendedUrl = `${API_URL}/api/articles/recommended?sitio=${sitio}&categoria=${cat}&excludeId=${article._id}`;
            const resRec = await fetch(recommendedUrl);
            if (resRec.ok) {
                recommended = await resRec.json();
            }
        } catch (error) {
            console.error("Error cargando recomendados:", error);
        }

        return { props: { article, recommended } };
    } catch (error) {
        console.error("Error en getServerSideProps:", error);
        return { notFound: true };
    }
}

// --- 2. COMPONENTE PRINCIPAL ---
export default function Articulo({ article, recommended }) {
    const router = useRouter();
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = (window.scrollY / totalHeight) * 100;
                setScrollProgress(progress);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (router.isFallback) {
        return (
            <Layout>
                <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                    <h2>Cargando noticia...</h2>
                    <div className="skeleton" style={{ width: '100%', height: '300px', marginTop: '20px' }}></div>
                </div>
            </Layout>
        );
    }

    // Limpieza de texto
    let contenidoFinal = [];
    if (article.articuloGenerado) {
        const textoLimpio = article.articuloGenerado
            .replace(/##\s/g, '').replace(/\*\*/g, '').replace(/\* /g, '')
            .replace(/[^\x00-\x7F\ñ\Ñ\á\é\í\ó\ú\Á\É\Í\Ó\Ú\¿\¡]/g, ' ');
        contenidoFinal = textoLimpio.split('\n').filter(p => p.trim() !== '');
    } else if (article.contenido) {
        const contenidoLimpio = article.contenido.split(' [')[0]; 
        contenidoFinal = contenidoLimpio.split('\n').filter(p => p.trim() !== '');
    } else {
        contenidoFinal = [article.descripcion || 'Contenido no disponible.'];
    }

    const fecha = new Date(article.fecha).toLocaleDateString('es-ES', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const finalImageUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER_IMG;
    const hasVideo = (article.youtubeId && article.videoProcessingStatus === 'complete');
    const canonicalUrl = `https://www.noticias.lat/articulo/${article._id}`;

    return (
        <Layout>
            <Head>
                <title>{article.titulo} - Noticias.lat</title>
                <meta name="description" content={article.descripcion ? article.descripcion.substring(0, 160) : article.titulo} />
                <meta property="og:image" content={finalImageUrl} />
                <meta property="og:title" content={article.titulo} />
                <link rel="canonical" href={canonicalUrl} />
            </Head>

            <div className="reading-progress-container">
                <div className="reading-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            <article className="container article-page-container">
                
                {/* HEADER */}
                <header className="article-header">
                    <Link href={`/?categoria=${article.categoria}`} className="article-category-badge">
                        {article.categoria || 'General'}
                    </Link>
                    <h1 className="article-title-main">{article.titulo}</h1>
                    <div className="article-meta-row">
                        <span className="meta-item"><i className="far fa-calendar-alt"></i> {fecha}</span>
                        {/* Se mantiene el "Según" arriba, esto está bien */}
                        {article.fuente && <span className="meta-item source-badge">Según: {article.fuente}</span>}
                        <span className="meta-item"><i className="far fa-clock"></i> Lectura rápida</span>
                    </div>
                </header>

                {/* IMAGEN HERO */}
                <div className="article-hero-image">
                    <img src={finalImageUrl} alt={article.titulo} onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
                </div>

                {/* BOTÓN DE VIDEO */}
                {hasVideo && (
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <Link href={`/feed?start_id=${article._id}`} className="btn-video-floating" style={{ display: 'inline-flex', width: 'auto', padding: '15px 30px' }}>
                            <i className="fas fa-play-circle" style={{ color: '#ef4444', fontSize: '1.5rem' }}></i> 
                            <div style={{ textAlign: 'left' }}>
                                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.8, fontWeight: 400 }}>AudioNoticia Disponible</span>
                                Ver en Video (Formato TikTok)
                            </div>
                        </Link>
                    </div>
                )}

                {/* CUERPO NOTICIA */}
                <div className="article-body-content">
                    {contenidoFinal.map((parrafo, index) => (
                        <p key={index}>{parrafo}</p>
                    ))}
                </div>

                {/* BOTONES DE COMPARTIR */}
                <div className="share-section">
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-texto-suave)' }}>Compartir esta noticia:</h4>
                    <div className="share-buttons-grid">
                        <ShareButton platform="whatsapp" url={canonicalUrl} title={article.titulo} />
                        <ShareButton platform="facebook" url={canonicalUrl} title={article.titulo} />
                        <ShareButton platform="twitter" url={canonicalUrl} title={article.titulo} />
                        <ShareButton platform="email" url={canonicalUrl} title={article.titulo} />
                    </div>
                </div>

                {/* ELIMINADO: La caja gris de "Leer fuente original". 
                    Ya no aparecerá abajo como pediste. */}

            </article>

            {/* --- SECCIÓN NUEVA: PROMO NEWSLETTER (LO QUE FALTABA) --- */}
            {/* Esta sección llena el vacío visual antes de las recomendaciones */}
            <section style={{ 
                background: 'linear-gradient(135deg, var(--color-tech-bg) 0%, #1e40af 100%)', 
                color: 'white', 
                padding: '4rem 1rem', 
                textAlign: 'center',
                marginTop: '4rem'
            }}>
                <div className="container" style={{ maxWidth: '600px' }}>
                    <i className="fas fa-paper-plane" style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.8 }}></i>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>
                        ¿Te gusta estar informado?
                    </h3>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
                        Recibe las noticias más importantes de Latinoamérica directamente en Telegram. Sin Spam, solo realidad.
                    </p>
                    <Link href="https://t.me/s/noticiaslat" style={{ 
                        background: 'white', color: 'var(--color-primario)', padding: '12px 30px', 
                        borderRadius: '50px', fontWeight: '700', fontSize: '1rem', display: 'inline-block' 
                    }}>
                        Unirme Gratis
                    </Link>
                </div>
            </section>
            {/* -------------------------------------------------------- */}


            {/* SECCIÓN DE RECOMENDADOS (AHORA CON 12 ITEMS) */}
            {recommended && recommended.length > 0 && (
                <section style={{ background: '#f8fafc', padding: '5rem 0' }}>
                    <div className="container">
                        <h2 style={{ 
                            marginBottom: '3rem', fontFamily: 'var(--font-sans)', 
                            color: 'var(--color-texto-titulos)', textAlign: 'center', fontSize: '2rem', fontWeight: '800' 
                        }}>
                            Sigue Leyendo
                        </h2>
                        
                        {/* Grid ajustado para muchas noticias */}
                        <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {recommended.map(rec => (
                                <div key={rec._id} className="article-card" style={{ height: '100%' }}>
                                    <Link href={`/articulo/${rec._id}`} className="card-image-wrapper" style={{ height: '200px' }}>
                                        <img 
                                            src={rec.imagen || PLACEHOLDER_IMG} 
                                            alt={rec.titulo}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                                        />
                                    </Link>
                                    <div className="card-content">
                                        <div className="card-tags">
                                            <span className="tag">{rec.categoria}</span>
                                        </div>
                                        <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
                                            <Link href={`/articulo/${rec._id}`}>{rec.titulo}</Link>
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </Layout>
    );
}

// Botón Compartir
function ShareButton({ platform, url, title }) {
    let href = ''; let icon = ''; let color = ''; let label = '';
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    switch(platform) {
        case 'whatsapp': href = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`; icon = 'fab fa-whatsapp'; color = '#25D366'; label = 'WhatsApp'; break;
        case 'facebook': href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; icon = 'fab fa-facebook-f'; color = '#1877F2'; label = 'Facebook'; break;
        case 'twitter': href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`; icon = 'fab fa-twitter'; color = '#1DA1F2'; label = 'X'; break;
        case 'email': href = `mailto:?subject=${encodedTitle}&body=Mira esta noticia: ${encodedUrl}`; icon = 'fas fa-envelope'; color = '#64748b'; label = 'Email'; break;
    }

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{
            background: color, color: 'white', padding: '10px 18px', borderRadius: '6px',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
            <i className={icon}></i> {label}
        </a>
    );
}