import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const API_URL = 'https://lfaftechapi.onrender.com';
const PLACEHOLDER_IMG = '/images/placeholder.jpg';

// --- ¡NUEVA FUNCIÓN! ---
// Esta función le dice a Next.js CÓMO manejar los 1 millón de IDs
export async function getStaticPaths() {
  return {
    // No generamos NINGÚN artículo por adelantado
    paths: [], 
    
    // ¡ESTA ES LA LÍNEA MÁGICA!
    // 'blocking' significa: "Si no tienes el HTML, haz que el usuario espere,
    // llama a la API, construye el HTML, guárdalo, y luego entrégaselo."
    // Esto es perfecto para SEO y rendimiento.
    fallback: 'blocking' 
  };
}

// --- ¡FUNCIÓN MODIFICADA! ---
// Cambiamos 'getServerSideProps' por 'getStaticProps'
export async function getStaticProps(context) {
    const { id } = context.params;
    const articleUrl = `${API_URL}/api/article/${id}`;
    
    try {
        const res = await fetch(articleUrl);
        if (!res.ok) {
            throw new Error('Artículo no encontrado');
        }
        const article = await res.json();

        // Buscamos recomendados (igual que antes)
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
            // ¡LÍNEA MÁGICA 2!
            // Le decimos a Vercel que vuelva a revisar este artículo
            // cada 1 hora (3600 segundos) en segundo plano, por si cambió.
            revalidate: 3600 
        };
    } catch (error) {
        console.error("Error en getStaticProps (Artículo):", error.message);
        return {
            notFound: true, // Esto mostrará la página 404
        };
    }
}

// --- TODO EL RESTO DEL ARCHIVO (LA PÁGINA) ES EXACTAMENTE IGUAL ---
// No necesitas copiar esto, ya lo tienes. Solo asegúrate
// de que las funciones de arriba (getStaticPaths y getStaticProps)
// reemplacen a tu antigua getServerSideProps.

export default function ArticuloPage({ article, recommended, canonicalUrl }) {

    // ... (todo el código de tu página de artículo que ya pegamos)
    // ... (Head, Layout, ShareButtons, etc.)
    
    const descriptionSnippet = (article.descripcion || 'Sin descripción').substring(0, 150) + '...';
    const imageUrl = article.imagen || PLACEHOLDER_IMG;

    let contenidoPrincipalHTML;
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

    const adSlotTopBanner = (
        <div className="ad-slot-placeholder" style={{ minHeight: '100px' }}>
            <p>Publicidad</p>
        </div>
    );
    const adSlotBottom = (
        <div className="ad-slot-placeholder" style={{ minHeight: '250px' }}>
            <p>Publicidad</p>
        </div>
    );

    return (
        <Layout>
            <Head>
                <title>{article.titulo} - Noticias.lat</title>
                <meta name="description" content={descriptionSnippet} id="meta-description" />
                <link rel="canonical" href={canonicalUrl} id="canonical-link" />
                
                <meta property="og:title" content={article.titulo} id="og-title" />
                <meta property="og:description" content={descriptionSnippet} id="og-description" />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonicalUrl} id="og-url" />
                <meta property="og:image" content={imageUrl} id="og-image" />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "NewsArticle",
                            "headline": article.titulo,
                            "image": [ imageUrl ],
                            "datePublished": article.fecha,
                            "dateModified": article.updatedAt || article.fecha,
                            "author": [{"@type": "Organization", "name": "Noticias.lat"}],
                            "publisher": {
                                "@type": "Organization",
                                "name": "Noticias.lat",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": "https://www.noticias.lat/favicon.png"
                                }
                            },
                            "description": descriptionSnippet
                        }),
                    }}
                />
            </Head>

            <div className="container">
                <div id="article-content" className="article-page-container">
                    <h1>{article.titulo}</h1>
                    
                    {adSlotTopBanner}
                    
                    <p className="article-meta">
                        Publicado el: {new Date(article.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} | Fuente: {article.fuente}
                    </p>
                    
                    {shareButtons}
                    
                    <img 
                        src={imageUrl} 
                        alt={article.titulo} 
                        className="article-main-image" 
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                    />

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
                    
                    {adSlotBottom}
                </div>

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

// ... (Las funciones 'createShareButtons' y 'RecommendedCard' se quedan igual) ...

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
    const imagenUrl = article.imagen || PLACEHOLDER_IMG;
    const articleUrl = `/articulo/${article._id}`;

    return (
        <div className="article-card">
            <Link href={articleUrl} legacyBehavior>
                <a className="article-card-image-link">
                    <img 
                        src={imagenUrl} 
                        alt={article.titulo} 
                        loading="lazy" 
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
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