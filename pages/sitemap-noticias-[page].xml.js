// --- CONFIGURACIÓN CLOUDFLARE ---
export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'experimental-edge';

const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';
const DOMAIN = 'https://www.noticias.lat';
const URLS_PER_SITEMAP = 10000;

function generateSiteMap(articles) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${articles
       .map(({ _id, fecha }) => {
         return `
       <url>
           <loc>${DOMAIN}/articulo/${_id}</loc>
           <lastmod>${fecha ? new Date(fecha).toISOString() : new Date().toISOString()}</lastmod>
           <changefreq>daily</changefreq>
           <priority>0.7</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

export async function getServerSideProps({ res, params }) {
  // El nombre del archivo es sitemap-noticias-[page].xml
  // Next.js nos pasará "1.xml", "2.xml" en params.page
  
  // Limpiamos para obtener solo el número (quitamos ".xml")
  const pageString = params.page.replace('.xml', '');
  const pageNumber = parseInt(pageString, 10);

  if (!pageNumber || isNaN(pageNumber)) {
      res.end();
      return { props: {} };
  }

  try {
    // Llamamos a la API pidiendo la página correcta con límite grande
    // Nota: Si la API pagina normal (page=1, limit=10000), usamos esto:
    const request = await fetch(`${API_URL}/articles?sitio=noticias.lat&page=${pageNumber}&limit=${URLS_PER_SITEMAP}`);
    const data = await request.json();
    
    // Soportar diferentes estructuras de respuesta
    const articles = data.docs || data.articulos || data.articles || [];

    const sitemap = generateSiteMap(articles);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600'); // Cache de 1 hora
    res.write(sitemap);
    res.end();
  } catch (e) {
    console.error(e);
    res.write(`<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>`);
    res.end();
  }

  return {
    props: {},
  };
}

export default function SiteMapChild() {}