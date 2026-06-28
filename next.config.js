/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: [
      'pbs.twimg.com', 
      'via.placeholder.com', 
      'i.ytimg.com', 
      'lh3.googleusercontent.com',
      'cdn-profiles.tunein.com',
      'logo.clearbit.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  // --- HEADERS (CACHÉ FORZADO 24HS PARA SITEMAPS) ---
  // Convierte los sitemaps dinámicos de la API en archivos "estáticos" en caché por 24 horas.
  async headers() {
    return [
      {
        // Aplica a sitemap.xml, sitemap-static.xml, sitemap-noticias-1.xml, etc.
        source: '/sitemap(.*).xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400'
          },
          {
            key: 'Content-Type',
            value: 'application/xml'
          }
        ],
      },
    ];
  },

  // --- REWRITES (LA MAGIA DE LOS SITEMAPS) ---
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: 'https://api.noticias.lat/api/sitemap.xml',
      },
      {
        source: '/sitemap-static.xml',
        destination: 'https://api.noticias.lat/api/sitemap-static.xml',
      },
      {
        source: '/sitemap-noticias-:page.xml',
        destination: 'https://api.noticias.lat/api/sitemap-noticias-:page.xml',
      },
      // Añadido para habilitar el sitemap de video que figura en el backend
      {
        source: '/sitemap-video.xml',
        destination: 'https://api.noticias.lat/api/sitemap-video.xml',
      },
      {
        source: '/robots.txt',
        destination: '/robots_real.txt',
      }
    ];
  },

  // --- REDIRECCIONES (SEO LEGADO) ---
  async redirects() {
    return [
      {
        source: '/articulo.html',
        has: [ { type: 'query', key: 'id' } ],
        destination: '/articulo/:id',
        permanent: true,
      },
      {
        source: '/sobre-nosotros.html',
        destination: '/sobre-nosotros',
        permanent: true,
      },
      {
        source: '/contacto.html',
        destination: '/contacto',
        permanent: true,
      },
      {
        source: '/terminos.html',
        destination: '/terminos',
        permanent: true,
      },
      {
        source: '/politica-privacidad.html',
        destination: '/politica-privacidad',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;