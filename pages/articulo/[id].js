import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';

// --- Configuración para Cloudflare (Edge) ---
// Mantenla comentada mientras trabajas en local para evitar errores de estilos
export const runtime = 'experimental-edge';

// --- Constantes ---
const API_URL = 'https://lfaftechapi.onrender.com';
const PLACEHOLDER_IMG_PATH = '/images/placeholder.jpg'; 

// --- 1. FUNCIÓN SERVER SIDE (Se ejecuta en el servidor) ---
export async function getServerSideProps(context) {
    // --- CACHÉ DE 24 HORAS ---
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=86400, stale-while-revalidate=3600'
    );

    const { id } = context.params;
    const articleUrl = `${API_URL}/api/article/${id}`;
    
    try {
        // 1. Cargar Artículo Principal
        const res = await fetch(articleUrl);
        if (!res.ok) {
            return { notFound: true };
        }
        const article = await res.json();

        // 2. Cargar Recomendados (basados en categoría y sitio)
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
            }
        };
    } catch (error) {
        console.error("Error en getServerSideProps (Artículo):", error.message);
        return {
            notFound: true, 
        };
    }
}

// --- 2. COMPONENTE DE LA PÁGINA ---
export default function ArticuloPage({ article, recommended, canonicalUrl }) {
    
    const BASE_URL = 'https://www.noticias.lat';
    const PLACEHOLDER_URL_ABSOLUTA = `${BASE_URL}${PLACEHOLDER_IMG_PATH}`;

    // Validar URL de la imagen
    const finalImageUrl = (article.imagen && article.imagen.startsWith('http'))
        ? article.imagen 
        : PLACEHOLDER_URL_ABSOLUTA;
    
    // Crear snippet para SEO
    const descriptionSnippet = (article.descripcion || 'Sin descripción').substring(0, 150) + '...';

    // --- Lógica del Video ---
    // Verificamos si el backend dice que el video está listo y tiene ID de YouTube
    const videoEstaListo = (article.videoProcessingStatus === 'complete' && article.youtubeId);
    const feedUrl = `/feed?start_id=${article._id}`;

    // Limpieza y formato del texto del artículo
    let contenidoPrincipalHTML = '';
    if (article.articuloGenerado) {
        const textoLimpio = article.articuloGenerado
            .replace(/##\s/g, '')       
            .replace(/\*\*/g, '')      
            .replace(/\* /g, '')       
            .replace(/[^\x00-\x7F\ñ\Ñ\á\é\í\ó\ú\Á\É\Í\Ó\Ú\¿\¡]/g, ' '); 
        
        // Convertir saltos de línea en párrafos HTML
        contenidoPrincipalHTML = textoLimpio
            .split('\n')
            .filter(p => p.trim() !== '') 
            .map((p) => `<p>${p}</p>`)      
            .join('');                   
    } else {
        // Fallback si no hay artículo generado
        const contenidoLimpio = article.contenido ? article.contenido.split(' [')[0] : (article.descripcion || 'Contenido no disponible.');
        contenidoPrincipalHTML = `
            <p>${contenidoLimpio}</p>
            <p><em>(Mostrando descripción breve.)</em></p>
        `;
    }

    const shareButtons = createShareButtons(canonicalUrl, article.titulo);
    
    // Espacio para publicidad
    const adSlot = (
        <div className="ad-slot-placeholder" style={{ minHeight: '100px', margin: '1.5rem 0' }}>
            <p>Publicidad</p>
        </div>
    );

    return (
        <Layout>
            <Head>
                <title>{article.titulo} - Noticias.lat</title>
                <meta name="description" content={descriptionSnippet} />
                <link rel="canonical" href={canonicalUrl} />
                
                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:title" content={article.titulo} />
                <meta property="og:description" content={descriptionSnippet} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={finalImageUrl} /> 

                {/* Schema.org para Google */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "NewsArticle",
                            "headline": article.titulo,
                            "image": [ finalImageUrl ],
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
                            "description": descriptionSnippet
                        }),
                    }}
                />
            </Head>

            <div className="container">
                <div id="article-content" className="article-page-container">
                    {/* Título Principal */}
                    <h1>{article.titulo}</h1>
                    
                    {/* Publicidad Superior */}
                    {adSlot}
                    
                    {/* Metadatos */}
                    <p className="article-meta">
                        Publicado el: {new Date(article.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} | Fuente: {article.fuente}
                    </p>
                    
                    {/* Botones de Compartir */}
                    {shareButtons}
                    
                    {/* --- IMAGEN PRINCIPAL --- */}
                    <div className="image-video-wrapper">
                        <img 
                            src={finalImageUrl} 
                            alt={article.titulo} 
                            className="article-main-image" 
                            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_URL_ABSOLUTA; }}
                        />
                        
                        {/* HE BORRADO EL BOTÓN DE PLAY FLOTANTE QUE ESTABA AQUÍ */}
                    </div>

                    {/* --- BOTÓN DE VIDEO (EL QUE TE GUSTA) --- */}
                    {/* Solo aparece si hay video listo */}
                    {videoEstaListo && (
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Link href={feedUrl} className="btn-noticias-lat-video">
                                <i className="fas fa-video"></i> Ver Noticia en Video (Formato TikTok)
                            </Link>
                        </div>
                    )}
                    {/* ----------------------------------------- */}

                    {/* Cuerpo de la Noticia */}
                    <div className="article-body" dangerouslySetInnerHTML={{ __html: contenidoPrincipalHTML }}></div>
                    
                    {/* Enlace a la Fuente Original */}
                    <div className="article-source-link">
                        <p>Para leer la noticia en su publicación original, visite la fuente.</p>
                        <a href={article.enlaceOriginal} className="btn-primary" target="_blank" rel="noopener noreferrer">
                            Leer en {article.fuente}
                        </a>
                    </div>
                    
                    {/* Publicidad Inferior */}
                    {adSlot}
                </div>

                {/* Sección de Recomendados */}
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

// --- FUNCIONES AUXILIARES ---

function createShareButtons(url, title) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    return (
        <div className="share-buttons">
            <h4>Compartir esta noticia:</h4>
            {/* WhatsApp */}
            <a href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} className="share-btn whatsapp" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i> WhatsApp
            </a>
            {/* Twitter / X */}
            <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} className="share-btn twitter" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i> Twitter
            </a>
            {/* Facebook */}
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} className="share-btn facebook" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook"></i> Facebook
            </a>
            {/* Email */}
            <a href={`mailto:?subject=${encodedTitle}&body=Mira esta noticia:%20${encodedUrl}`} className="share-btn email" target="_blank" rel="noopener noreferrer">
                <i className="fas fa-envelope"></i> Email
            </a>
        </div>
    );
}

function RecommendedCard({ article }) {
    const PLACEHOLDER_IMG_PATH = '/images/placeholder.jpg';
    const imagenUrl = article.imagen || PLACEHOLDER_IMG_PATH;
    const articleUrl = `/articulo/${article._id}`;
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