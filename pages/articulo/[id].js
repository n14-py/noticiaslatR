import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export const runtime = 'experimental-edge';

const API_URL = 'https://api.noticias.lat/api';
const PLACEHOLDER_IMG = '/images/placeholder.jpg';

export async function getServerSideProps(context) {
    context.res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');

    const { id } = context.params;

    try {
        const resArticle = await fetch(`${API_URL}/article/${id}`);
        if (!resArticle.ok) {
            return { notFound: true };
        }
        const article = await resArticle.json();

        // Obtener recomendaciones basadas en la categoría actual (excluyendo la noticia actual)
        const resRelated = await fetch(`${API_URL}/articles/recommended?sitio=noticias.lat&categoria=${article.categoria || 'general'}&excludeId=${id}`);
        const recommended = resRelated.ok ? await resRelated.json() : [];

        return {
            props: {
                article,
                recommended
            }
        };
    } catch (error) {
        console.error("Error cargando artículo SSR:", error);
        return { notFound: true };
    }
}

export default function Articulo({ article, recommended }) {
    const router = useRouter();
    
    // Estados para la IA
    const [summary, setSummary] = useState(article.aiSummary || null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    
    // Estados para Comentarios
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({ nombre: '', texto: '' });
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentMessage, setCommentMessage] = useState('');

    if (router.isFallback) {
        return (
            <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column' }}>
                    <div className="loader-spinner" style={{ width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <h2 style={{ marginTop: '20px', color: '#64748b' }}>Cargando noticia...</h2>
                </div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </Layout>
        );
    }

    // Funciones
    const handleGenerateSummary = async () => {
        if (summary) return;
        setLoadingSummary(true);
        try {
            const res = await fetch(`${API_URL}/article/${article._id}/ai-summary`);
            const data = await res.json();
            if (data.summary) {
                setSummary(data.summary);
            } else {
                setSummary("No se pudo generar el resumen en este momento. Intenta leer el artículo completo.");
            }
        } catch (error) {
            console.error("Error al generar resumen:", error);
            setSummary("Ocurrió un error al contactar con la IA.");
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.nombre.trim() || !newComment.texto.trim()) {
            setCommentMessage('Por favor, completa todos los campos.');
            return;
        }

        setIsSubmittingComment(true);
        setCommentMessage('');

        // Simulación de envío a API (Aquí conectarías con tu backend real)
        setTimeout(() => {
            const commentObj = {
                id: Date.now(),
                nombre: newComment.nombre,
                texto: newComment.texto,
                fecha: new Date().toISOString(),
            };
            setComments([commentObj, ...comments]);
            setNewComment({ nombre: '', texto: '' });
            setIsSubmittingComment(false);
            setCommentMessage('¡Comentario publicado con éxito!');
            setTimeout(() => setCommentMessage(''), 4000);
        }, 800);
    };

    // Formateo de Datos
    const fechaFormateada = new Date(article.fecha).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const imgUrl = (article.imagen && article.imagen.startsWith('http')) ? article.imagen : PLACEHOLDER_IMG;
    const audioSrc = article.audioUrl || article.audio || null;
    const currentUrl = `https://noticias.lat/articulo/${article._id || article.slug}`;

    // Schema SEO (JSON-LD Completo)
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": currentUrl
        },
        "headline": article.titulo,
        "image": [imgUrl],
        "datePublished": new Date(article.fecha).toISOString(),
        "dateModified": new Date(article.updatedAt || article.fecha).toISOString(),
        "author": {
            "@type": "Organization",
            "name": article.fuente || "Noticias.lat",
            "url": "https://noticias.lat"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Noticias.lat",
            "logo": {
                "@type": "ImageObject",
                "url": "https://noticias.lat/favicon.png"
            }
        },
        "description": article.descripcion
    };

    return (
        <Layout>
            <Head>
                <title>{`${article.titulo} | Noticias.lat`}</title>
                <meta name="description" content={article.descripcion} />
                <meta name="keywords" content={`${article.categoria}, ${article.pais}, noticias, latinoamérica, actualidad`} />
                <meta name="author" content={article.fuente || "Noticias.lat"} />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:title" content={article.titulo} />
                <meta property="og:description" content={article.descripcion} />
                <meta property="og:image" content={imgUrl} />
                <meta property="og:site_name" content="Noticias.lat" />
                <meta property="article:published_time" content={new Date(article.fecha).toISOString()} />
                <meta property="article:section" content={article.categoria} />
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={currentUrl} />
                <meta name="twitter:title" content={article.titulo} />
                <meta name="twitter:description" content={article.descripcion} />
                <meta name="twitter:image" content={imgUrl} />

                <link rel="canonical" href={currentUrl} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
            </Head>

            <div className="article-layout container">
                
                {/* ==========================================
                    COLUMNA PRINCIPAL (IZQUIERDA EN PC)
                ========================================== */}
                <main className="article-main-content">
                    <article>
                        
                        {/* --- 1. CABECERA DE LA NOTICIA --- */}
                        <header className="article-header">
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <Link href={`/?categoria=${article.categoria}`} className="tag" style={{ background: '#2563eb', color: 'white', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' }}>
                                    {article.categoria}
                                </Link>
                                {article.pais && (
                                    <Link href={`/?pais=${article.pais.toLowerCase()}`} className="tag" style={{ background: '#e2e8f0', color: '#334155', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' }}>
                                        {article.pais}
                                    </Link>
                                )}
                            </div>
                            
                            <h1 className="article-title-main" style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.2', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>
                                {article.titulo}
                            </h1>
                            
                            <div className="article-meta-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', padding: '1.2rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
                                <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="far fa-clock"></i> <span style={{ textTransform: 'capitalize' }}>{fechaFormateada}</span>
                                </span>
                                {article.fuente && (
                                    <span className="source-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#0f172a' }}>
                                        <i className="fas fa-newspaper" style={{ color: '#2563eb' }}></i> Fuente: {article.fuente}
                                    </span>
                                )}
                                <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                                    <i className="fas fa-share-alt"></i> Compartir
                                </span>
                            </div>
                        </header>

                        {/* --- 2. IMAGEN PRINCIPAL (HERO) --- */}
                        <div className="article-hero-image" style={{ marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: '#f8fafc' }}>
                            <img 
                                src={imgUrl} 
                                alt={article.titulo} 
                                loading="eager" 
                                style={{ width: '100%', maxHeight: '600px', objectFit: 'cover', display: 'block' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                            />
                        </div>

                        {/* --- 3. REPRODUCTOR DE AUDIONOTICIAS --- */}
                        {audioSrc && (
                            <div className="audio-player-wrapper" style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>
                                    <i className="fas fa-podcast" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '800', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                        Escucha esta noticia
                                    </div>
                                    <audio controls src={audioSrc} style={{ width: '100%', height: '40px', outline: 'none' }} preload="metadata" controlsList="nodownload"></audio>
                                </div>
                            </div>
                        )}

                        {/* --- 4. RESUMEN INTELIGENTE (IA) --- */}
                        <div className="ai-summary-box" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '2rem', marginBottom: '3rem', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.05)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '6rem', color: '#eff6ff', zIndex: 0, opacity: 0.7 }}>
                                <i className="fas fa-brain"></i>
                            </div>
                            <div className="ai-summary-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: '#1d4ed8', fontWeight: '900', fontSize: '1.2rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ background: '#dbeafe', padding: '8px 12px', borderRadius: '8px' }}>
                                    <i className="fas fa-file-alt"></i>
                                </div>
                                <span>Puntos Claves</span>
                            </div>
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {summary ? (
                                    <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                                        <p style={{ color: '#1e293b', fontSize: '1.1rem', lineHeight: '1.7', fontWeight: '500', margin: 0 }}>
                                            {summary}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '1.5rem' }}>Ahorra tiempo. Genera un resumen de los puntos clave de esta noticia usando Inteligencia Artificial.</p>
                                        <button 
                                            onClick={handleGenerateSummary} 
                                            disabled={loadingSummary}
                                            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '50px', fontSize: '1.05rem', fontWeight: '800', cursor: loadingSummary ? 'wait' : 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)', opacity: loadingSummary ? 0.8 : 1, display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}
                                        >
                                            {loadingSummary ? (
                                                <><i className="fas fa-spinner fa-spin"></i> Analizando el texto...</>
                                            ) : (
                                                <><i className="fas fa-bolt"></i> Generar Resumen Rápido</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- 5. CUERPO DEL ARTÍCULO --- */}
                        <div className="article-body-text" style={{ fontSize: '1.2rem', lineHeight: '1.9', color: '#334155', fontFamily: 'var(--font-serif, Georgia, serif)', marginBottom: '3rem' }}>
                            {article.articuloGenerado ? (
                                article.articuloGenerado.split('\n').map((paragraph, index) => {
                                    const text = paragraph.trim();
                                    if (!text) return null;
                                    
                                    // Renderizado de Subtítulos (Markdown style ##)
                                    if (text.startsWith('## ')) {
                                        return <h2 key={index} style={{ fontFamily: 'var(--font-sans, system-ui, sans-serif)', fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', margin: '2.5rem 0 1.2rem 0', letterSpacing: '-0.5px' }}>{text.replace('## ', '')}</h2>;
                                    }
                                    
                                    // Renderizado de citas (Markdown style >)
                                    if (text.startsWith('> ')) {
                                        return (
                                            <blockquote key={index} style={{ borderLeft: '4px solid #2563eb', margin: '2rem 0', padding: '1rem 2rem', background: '#f8fafc', fontStyle: 'italic', color: '#475569', fontSize: '1.25rem', borderRadius: '0 12px 12px 0' }}>
                                                {text.replace('> ', '')}
                                            </blockquote>
                                        );
                                    }

                                    // Párrafos normales
                                    return <p key={index} style={{ marginBottom: '1.5rem' }}>{text}</p>;
                                })
                            ) : (
                                <p style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{article.descripcion}</p>
                            )}
                        </div>

                        {/* --- 6. VIDEO DE YOUTUBE (SI EXISTE) --- */}
                        {article.youtubeId && (
                            <div className="youtube-video-container" style={{ margin: '4rem 0', padding: '3rem 0', borderTop: '2px dashed #e2e8f0', borderBottom: '2px dashed #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                                    <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '50%', color: '#ef4444' }}>
                                        <i className="fab fa-youtube"></i>
                                    </div>
                                    Cobertura en Video
                                </h3>
                                <div className="video-responsive-wrapper" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', background: '#000' }}>
                                    <iframe 
                                        src={`https://www.youtube.com/embed/${article.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                                        title="Video de la noticia en YouTube"
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {/* --- 7. BOTONES SOCIALES Y BANNER TELEGRAM --- */}
                        <div className="share-section" style={{ margin: '3rem 0' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '1px' }}>Comparte esta noticia</h4>
                            <div className="share-buttons-grid" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Mira esta noticia: ${article.titulo} - ${currentUrl}`)}`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: 'white', padding: '12px 25px', borderRadius: '50px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> WhatsApp
                                </a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.titulo)}`} target="_blank" rel="noopener noreferrer" style={{ background: '#1DA1F2', color: 'white', padding: '12px 25px', borderRadius: '50px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(29, 161, 242, 0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <i className="fab fa-twitter" style={{ fontSize: '1.2rem' }}></i> Twitter
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" style={{ background: '#1877F2', color: 'white', padding: '12px 25px', borderRadius: '50px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <i className="fab fa-facebook-f" style={{ fontSize: '1.2rem' }}></i> Facebook
                                </a>
                            </div>

                            <a href="https://t.me/noticiaslat" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', background: 'linear-gradient(90deg, #0088cc 0%, #00aaff 100%)', color: 'white', padding: '20px', borderRadius: '16px', fontWeight: '800', fontSize: '1.2rem', marginTop: '3rem', textDecoration: 'none', boxShadow: '0 10px 25px rgba(0, 136, 204, 0.3)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <i className="fab fa-telegram-plane" style={{ fontSize: '2rem' }}></i>
                                <span>¡Únete a nuestro canal de Telegram para alertas en vivo!</span>
                            </a>
                        </div>

                        {/* --- 8. ESTRUCTURA COMPLETA DE COMENTARIOS --- */}
                        <section className="comments-section" id="comentarios" style={{ margin: '5rem 0 2rem 0', padding: '3rem 0', borderTop: '2px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <i className="far fa-comments" style={{ color: '#2563eb' }}></i>
                                Comentarios ({comments.length})
                            </h3>

                            {/* Formulario de Comentarios */}
                            <div className="comment-form-container" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: '#334155' }}>Deja tu opinión</h4>
                                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label htmlFor="nombre" style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b' }}>Tu Nombre</label>
                                        <input 
                                            type="text" 
                                            id="nombre"
                                            value={newComment.nombre}
                                            onChange={(e) => setNewComment({...newComment, nombre: e.target.value})}
                                            placeholder="Ej. Juan Pérez"
                                            style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                                            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label htmlFor="texto" style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b' }}>Tu Comentario</label>
                                        <textarea 
                                            id="texto"
                                            value={newComment.texto}
                                            onChange={(e) => setNewComment({...newComment, texto: e.target.value})}
                                            placeholder="¿Qué opinas sobre esta noticia?..."
                                            rows="4"
                                            style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                                            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                        ></textarea>
                                    </div>
                                    
                                    {commentMessage && (
                                        <div style={{ padding: '10px', borderRadius: '8px', background: commentMessage.includes('éxito') ? '#dcfce7' : '#fee2e2', color: commentMessage.includes('éxito') ? '#166534' : '#991b1b', fontSize: '0.95rem', fontWeight: '600' }}>
                                            {commentMessage}
                                        </div>
                                    )}

                                    <button 
                                        type="submit" 
                                        disabled={isSubmittingComment}
                                        style={{ background: '#2563eb', color: 'white', padding: '14px 24px', borderRadius: '8px', fontWeight: '800', fontSize: '1.05rem', border: 'none', cursor: isSubmittingComment ? 'wait' : 'pointer', transition: 'background 0.2s', marginTop: '10px', alignSelf: 'flex-start' }}
                                        onMouseOver={e => !isSubmittingComment && (e.target.style.background = '#1d4ed8')}
                                        onMouseOut={e => !isSubmittingComment && (e.target.style.background = '#2563eb')}
                                    >
                                        {isSubmittingComment ? 'Publicando...' : 'Publicar Comentario'}
                                    </button>
                                </form>
                            </div>

                            {/* Lista de Comentarios */}
                            <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {comments.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                                        <i className="far fa-comment-dots" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Aún no hay comentarios. ¡Sé el primero en opinar!</p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="comment-item" style={{ display: 'flex', gap: '15px', padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.2rem', fontWeight: '800', flexShrink: 0 }}>
                                                {comment.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <h5 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{comment.nombre}</h5>
                                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
                                                        {new Date(comment.fecha).toLocaleDateString('es-ES')}
                                                    </span>
                                                </div>
                                                <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.5', margin: 0 }}>{comment.texto}</p>
                                                <div style={{ display: 'flex', gap: '15px', marginTop: '12px' }}>
                                                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onMouseOver={e => e.target.style.color = '#2563eb'} onMouseOut={e => e.target.style.color = '#64748b'}><i className="far fa-thumbs-up"></i> Me gusta</button>
                                                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onMouseOver={e => e.target.style.color = '#2563eb'} onMouseOut={e => e.target.style.color = '#64748b'}><i className="fas fa-reply"></i> Responder</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                    </article>
                </main>

                {/* ==========================================
                    COLUMNA LATERAL (DERECHA EN PC)
                ========================================== */}
                <aside className="article-sidebar">
                    <div className="sidebar-widget" style={{ position: 'sticky', top: '100px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.8rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <h3 className="sidebar-title" style={{ fontSize: '1.1rem', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '4px', height: '18px', background: '#ef4444', borderRadius: '2px' }}></div>
                            Noticias Relacionadas
                        </h3>
                        
                        <div className="sidebar-news-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {recommended.length > 0 ? (
                                recommended.slice(0, 7).map((rel) => (
                                    <Link href={`/articulo/${rel._id}`} key={rel._id} style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '15px', alignItems: 'start', textDecoration: 'none', group: 'true' }}>
                                        <div style={{ width: '85px', height: '85px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                                            <img 
                                                src={(rel.imagen && rel.imagen.startsWith('http')) ? rel.imagen : PLACEHOLDER_IMG} 
                                                alt={rel.titulo} 
                                                loading="lazy" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                                                onMouseOver={e => e.target.style.transform = 'scale(1.1)'}
                                                onMouseOut={e => e.target.style.transform = 'scale(1)'}
                                            />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', lineHeight: '1.4', color: '#1e293b', margin: '0 0 6px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#2563eb'} onMouseOut={e => e.target.style.color = '#1e293b'}>
                                                {rel.titulo}
                                            </h4>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                                                {rel.categoria}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p style={{ fontSize: '0.95rem', color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No hay recomendaciones en este momento.</p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
            
            <style jsx global>{`
                .article-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                    margin: 2rem auto 5rem auto;
                    padding: 0 1.5rem;
                }
                @media (min-width: 1024px) {
                    .article-layout {
                        grid-template-columns: 1fr 380px;
                        gap: 4rem;
                    }
                }
                .article-main-content {
                    width: 100%;
                    max-width: 850px;
                }
            `}</style>
        </Layout>
    );
}