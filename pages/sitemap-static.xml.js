// --- CONFIGURACIÓN CLOUDFLARE ---
export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'experimental-edge';

const DOMAIN = 'https://www.noticias.lat';

function generateSiteMap() {
  const staticPages = [
      '',
      '/radios',
      '/feed',
      '/sobre-nosotros',
      '/contacto',
      '/politica-privacidad',
      '/terminos',
  ];

  const categories = [
      'politica', 'economia', 'deportes', 'tecnologia', 'entretenimiento', 'salud', 'internacional'
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${staticPages
       .map((url) => {
         return `
       <url>
           <loc>${DOMAIN}${url}</loc>
           <lastmod>${new Date().toISOString()}</lastmod>
           <changefreq>daily</changefreq>
           <priority>1.0</priority>
       </url>
     `;
       })
       .join('')}

     ${categories
       .map((cat) => {
         return `
       <url>
           <loc>${DOMAIN}/?categoria=${cat}</loc>
           <lastmod>${new Date().toISOString()}</lastmod>
           <changefreq>hourly</changefreq>
           <priority>0.9</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  const sitemap = generateSiteMap();
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  return { props: {} };
}

export default function SiteMapStatic() {}