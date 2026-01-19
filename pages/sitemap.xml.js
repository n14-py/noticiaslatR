// --- CONFIGURACIÓN CLOUDFLARE ---
export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'experimental-edge';

const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';
const DOMAIN = 'https://www.noticias.lat';
const URLS_PER_SITEMAP = 10000; // Hacemos grupos de 10 mil para ir seguros

function generateSiteMapIndex(totalSitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <sitemap>
       <loc>${DOMAIN}/sitemap-static.xml</loc>
     </sitemap>
     
     ${[...Array(totalSitemaps)].map((_, index) => {
        // index + 1 para que empiece en sitemap-noticias-1.xml
        return `
       <sitemap>
           <loc>${DOMAIN}/sitemap-noticias-${index + 1}.xml</loc>
       </sitemap>
     `;
     }).join('')}
   </sitemapindex>
 `;
}

export async function getServerSideProps({ res }) {
  try {
    // 1. Pedimos solo 1 artículo para saber el TOTAL de documentos que tienes
    const request = await fetch(`${API_URL}/articles?sitio=noticias.lat&limit=1`);
    const data = await request.json();

    // 2. Obtenemos el total (totalDocs o totalArticulos según tu API)
    const totalArticles = data.totalDocs || data.totalArticulos || 0;

    // 3. Calculamos cuántos sitemaps necesitamos (Ej: 50k arts / 10k = 5 sitemaps)
    const totalSitemaps = Math.ceil(totalArticles / URLS_PER_SITEMAP);

    // 4. Generamos el XML
    const sitemapIndex = generateSiteMapIndex(totalSitemaps);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400'); // Cache de 1 día
    res.write(sitemapIndex);
    res.end();
  } catch (e) {
    console.error(e);
    res.write(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex></sitemapindex>`);
    res.end();
  }

  return {
    props: {},
  };
}

export default function SiteMapIndex() {}