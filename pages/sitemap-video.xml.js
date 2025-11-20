const API_URL = 'https://lfaftechapi.onrender.com';
const SITIO = 'noticias.lat';
const BASE_URL = 'https://www.noticias.lat';

function generateSiteMap(articles) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${articles
        .map((article) => {
          // Solo incluimos si tiene video de YouTube válido
          if (!article.youtubeId) return '';

          // Limpieza básica de caracteres para no romper el XML
          const title = (article.titulo || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
          const desc = (article.descripcion || article.titulo || '').substring(0, 2048).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
          const thumbnail = article.imagen || `${BASE_URL}/images/placeholder.jpg`;
          const date = new Date(article.fecha).toISOString();
          const articleUrl = `${BASE_URL}/articulo/${article._id}`;

          return `
        <url>
            <loc>${articleUrl}</loc>
            <video:video>
              <video:thumbnail_loc>${thumbnail}</video:thumbnail_loc>
              <video:title>${title}</video:title>
              <video:description>${desc}</video:description>
              <video:player_loc>https://www.youtube.com/embed/${article.youtubeId}</video:player_loc>
              <video:publication_date>${date}</video:publication_date>
              <video:family_friendly>yes</video:family_friendly>
              <video:live>no</video:live>
            </video:video>
        </url>
      `;
        })
        .join('')}
    </urlset>
  `;
}

export async function getServerSideProps({ res }) {
  // Consultamos los últimos 50 videos para el sitemap
  // Esto se actualiza SOLO cada vez que Google lo pide (con caché)
  const request = await fetch(`${API_URL}/api/articles/feed?sitio=${SITIO}&limit=50`);
  
  let articles = [];
  try {
      articles = await request.json();
  } catch (e) {
      console.error("Error generando sitemap de video", e);
  }

  const sitemap = generateSiteMap(Array.isArray(articles) ? articles : []);

  res.setHeader('Content-Type', 'text/xml');
  // Le decimos a Cloudflare que guarde este mapa por 3 horas (10800 seg)
  // Así Google recibe información fresca, pero tu servidor descansa.
  res.setHeader('Cache-Control', 'public, s-maxage=10800, stale-while-revalidate=3600');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function SiteMap() {
  // El componente no renderiza nada visual, el trabajo lo hace el servidor
  return null;
}