// Archivo: pages/articulo/[id].js
// ¡MODIFICADO PARA MOSTRAR VIDEO!

import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// --- Constantes ---
// ¡CAMBIO AQUÍ! Ahora lee la variable de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lfaftechapi.onrender.com';
const PLACEHOLDER_IMG_PATH = '/images/placeholder.jpg'; // Ruta local

// --- 1. FUNCIÓN (Se ejecuta en el SERVIDOR) ---
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

// --- 2. FUNCIÓN (Se ejecuta en el SERVIDOR) ---
export async function getStaticProps(context) {
    const { id } = context.params;
    const articleUrl = `${API_URL}/api/article/${id}`;
    
    try {
        const res = await fetch(articleUrl);
        if (!res.ok) {
            throw new Error('Artículo no encontrado');
        }
        const article = await res.json();

        // Buscamos recomendados
        const recommendedUrl = `${API_URL}/api/articles/recommended?sitio=${article.sitio}&categoria=${article.categoria}&excludeId=${article._id}`;
        let recommended = [];
        try {
            const resRec = await fetch(recommendedUrl);
            if (resRec.ok) {
                recommended = await resRec.json();
            }
        } catch (recError) {
             console.error("Error cargando recomendados:", recError.message);
        }

        return {
            props: {
                article,
                recommended,
                canonicalUrl: `https://www.noticias.lat/articulo/${id}`
            },
            revalidate: 3600 // Vuelve a generar la página cada 1 hora
        };
    } catch (error) {
        console.error("Error en getStaticProps (Artículo):", error.message);
        return {
            notFound: true, // Muestra la página 404
        };
    }
}

// --- 3. COMPONENTE DE LA PÁGINA ---
export default function ArticuloPage({ article, recommended, canonicalUrl }) {
    
    // --- Lógica de la imagen (miniatura) para SEO ---
    // (Esto no cambia, las meta tags OG usan la miniatura)
    const BASE_URL = 'https://www.noticias.lat';
    const PLACEHOLDER_URL_ABSOLUTA = `${BASE_URL}${PLACEHOLDER_IMG_PATH}`;
    const finalImageUrl = (article.imagen && article.imagen.startsWith('http'))
        ? article.imagen
        : PLACEHOLDER_URL_ABSOLUTA;
    
    const descriptionSnippet = (article.descripcion || 'Sin descripción').substring(0, 150) + '...';

    // Formatear el cuerpo del artículo (sin cambios)
    let contenidoPrincipalHTML = '';
    if (article.articuloGenerado) {
        const textoLimpio = article.articuloGenerado
            .replace(/##\s/g, '')       
            .replace(/\*\*/g, '')      
            .replace(/\* /g, '')       
            .replace(/[^\x00-\x7F\ñ\Ñ\á\é\í\ó\ú\Á\É\Í\Ó\Ú\¿\¡]/g, ' '); 
        
        contenidoPrincipalHTML = textoLimpio
            .split('\n')
            .filter(p => p.trim() !== '') 
            .map((p, index) => `<p>${p}</p>`)      
            .join('');                   
    } else {
        const contenidoLimpio = article.contenido ? article.contenido.split(' [')[0] : (article.descripcion || 'Contenido no disponible.');
        contenidoPrincipalHTML = `
            <p>${contenidoLimpio}</p>
            <p><em>(Mostrando descripción breve.)</em></p>
        `;
    }

    const shareButtons = createShareButtons(canonicalUrl, article.titulo);

    const adSlot = (
        <div className="ad-slot-placeholder" style={{ minHeight: '100px', margin: '1.5rem 0' }}>
            <p>Publicidad</p>
        </div>
    );

    return (
        <Layout>
            {/* --- 4. SEO Dinámico --- */}
            <Head>
                <title>{article.titulo} - Noticias.lat</title>
                <meta name="description" content={descriptionSnippet} />
                <link rel="canonical" href={canonicalUrl} />
                
                <meta property="og:title" content={article.titulo} />
                <meta property="og:description" content={descriptionSnippet} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonicalUrl} />
                
                {/* La meta imagen SIEMPRE es la miniatura (para Google y redes) */}
                <meta property="og:image" content={finalImageUrl} /> 

                {/* Datos Estructurados (JSON-LD) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "NewsArticle",
                            "headline": article.titulo,
                            "image": [ finalImageUrl ], // La miniatura
                            "datePublished": article.fecha,
                            "dateModified": article.updatedAt || article.fecha,
                            "author": [{"@type": "Organization", "name": "Noticias.lat"}],
                            "publisher": {
                                "@type": "Organization",
                                "name": "Noticias.lat",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": `${BASE_URL}/favicon.png`
                                }
                            },
                            "description": descriptionSnippet,
                            // ¡AÑADIR INFO DE VIDEO SI EXISTE!
                            ...(article.videoUrl && article.videoProcessingStatus === 'complete' && {
                                "video": {
                                    "@type": "VideoObject",
                                    "name": article.titulo,
                                    "description": descriptionSnippet,
                                    "thumbnailUrl": finalImageUrl,
                                    "uploadDate": article.updatedAt || article.fecha,
                                    "contentUrl": article.videoUrl // URL del video de Ezoic
                                }
                            })
                        }),
                    }}
                />
            </Head>

            {/* --- 5. Contenido de la Página --- */}
            <div className="container">
                <div id="article-content" className="article-page-container">
                    <h1>{article.titulo}</h1>
                    
                    {adSlot}
                    
                    <p className="article-meta">
                        Publicado el: {new Date(article.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} | Fuente: {article.fuente}
                    </p>
                    
                    {shareButtons}
                    
                    {/* --- ¡INICIO DEL CAMBIO! --- */}
                    {/* Lógica para mostrar video o imagen */}
                    <div className="article-media-container" style={{ position: 'relative', width: '100%', background: '#000', borderRadius: 'var(--radio-borde)', marginBottom: '2rem', overflow: 'hidden' }}>
                        
                        {/* CASO 1: El video está listo y existe */}
                        {article.videoUrl && article.videoProcessingStatus === 'complete' ? (
                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                {/* ¡IMPORTANTE! Aquí debes pegar el código
                                    del reproductor de Ezoic, usando article.videoUrl */}
                                <iframe 
                                    src={article.videoUrl} 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    frameBorder="0" 
                                    allow="autoplay; encrypted-media" 
                                    allowFullScreen
                                    title={article.titulo}
                                ></iframe>
                            </div>
                        ) : (
                            /* CASO 2: El video NO está (o está procesando), muestra la imagen */
                            <img 
                                src={finalImageUrl}
                                alt={article.titulo} 
                                className="article-main-image" 
                                style={{ margin: 0, borderRadius: 0, width: '100%' }} // Resetea márgenes
                                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_URL_ABSOLUTA; }}
                            />
                        )}

                    </div>
                    {/* --- FIN DEL CAMBIO --- */}

                    <div 
                        className="article-body"
                        dangerouslySetInnerHTML={{ __html: contenidoPrincipalHTML }}
                    >
                    </div>

                    <div className="article-source-link">
                        <p>Para leer la noticia en su publicación original, visite la fuente.</p>
                        <a href={article.enlaceOriginal} className="btn-primary" target="_blank" rel="noopener noreferrer">
                            Leer en {article.fuente}
                        </a>
                    </div>
                    
                    {adSlot}
                </div>

                {/* --- 6. Sección de Recomendados (Sin cambios) --- */}
                {recommended.length > 0 && (
                    <section id="recommended-section" className="main-content" style={{ paddingTop: '1rem' }}>
                        <h2>Artículos Recomendados</h2>
                        <div id="recommended-container" className="articles-container-mini">
                            {recommended.map(recArticle => (
                                <RecommendedCard key={recArticle._id} article={recArticle} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
}

// --- Componentes Ayudantes (Sin cambios) ---

function createShareButtons(url, title) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return (
        <div className="share-buttons">
            <h4>Compartir esta noticia:</h4>
            <a href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} className="share-btn whatsapp" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i> WhatsApp</a>
            <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} className="share-btn twitter" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i> Twitter</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} className="share-btn facebook" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i> Facebook</a>
            <a href={`mailto:?subject=${encodedTitle}&body=Mira esta noticia:%20${encodedUrl}`} className="share-btn email" target="_blank" rel="noopener noreferrer"><i className="fas fa-envelope"></i> Email</a>
        </div>
    );
}

function RecommendedCard({ article }) {
    const imagenUrl = article.imagen || PLACEHOLDER_IMG_PATH; // Usar ruta relativa para <img>
    const articleUrl = `/articulo/${article._id}`;
    
    // Icono de Play para los recomendados
    let playIcon = null;
    if (article.videoUrl && article.videoProcessingStatus === 'complete') {
        playIcon = <span className="article-card-play-icon mini"><i className="fas fa-play"></i></span>;
    }

    return (
        <div className="article-card">
            <Link href={articleUrl} legacyBehavior>
                <a className="article-card-image-link">
                    <img 
                        src={imagenUrl} 
                        alt={article.titulo} 
                        loading="lazy" 
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG_PATH; }}
                    />
                    {playIcon}
                </a>
            </Link>
            <div className="article-card-content">
                <h3>
                    <Link href={articleUrl}>{article.titulo}</Link>
                </h3>
            </div>
        </div>
    );
}