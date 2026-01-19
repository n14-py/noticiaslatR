/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // --- IMÁGENES ---
  // Vital para que carguen las fotos de las noticias y logos de radios
  images: {
    domains: [
      'pbs.twimg.com', 
      'via.placeholder.com', 
      'i.ytimg.com', 
      'lh3.googleusercontent.com',
      'cdn-profiles.tunein.com',
      'logo.clearbit.com'
    ],
    // Esto permite cargar imágenes de CUALQUIER dominio (necesario para un agregador de noticias)
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
  
  // --- REWRITES (LA MAGIA DE LOS SITEMAPS) ---
  // Esto conecta tu dominio frontend con los sitemaps de la API
  async rewrites() {
    return [
      // 1. Índice Principal
      {
        source: '/sitemap.xml',
        destination: 'https://lfaftechapi-7nrb.onrender.com/api/sitemap.xml',
      },
      // 2. Sitemap Estático
      {
        source: '/sitemap-static.xml',
        destination: 'https://lfaftechapi-7nrb.onrender.com/api/sitemap-static.xml',
      },
      // 3. Sitemaps Dinámicos de Noticias (Paginados: 1, 2, 3...)
      {
        source: '/sitemap-noticias-:page.xml',
        destination: 'https://lfaftechapi-7nrb.onrender.com/api/sitemap-noticias-:page.xml',
      },
      // 4. Robots.txt real
      {
        source: '/robots.txt',
        destination: '/robots_real.txt',
      }
    ];
  },

  // --- REDIRECCIONES (SEO LEGADO) ---
  // Mantienen el posicionamiento de tu web antigua redirigiendo .html a rutas limpias
  async redirects() {
    return [
      // Artículos (de articulo.html?id=123 a /articulo/123)
      {
        source: '/articulo.html',
        has: [ { type: 'query', key: 'id' } ],
        destination: '/articulo/:id',
        permanent: true, // 301 Permanent Redirect
      },
      // Páginas estáticas
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