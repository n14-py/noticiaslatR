/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Tu sitemap (ya lo teníamos)
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: 'https://lfaftechapi.onrender.com/api/sitemap.xml',
      },
      {
        source: '/robots.txt',
        destination: '/robots_real.txt',
      }
    ];
  },

  // --- REDIRECCIONES (Mantienen tu SEO de la web anterior) ---
  async redirects() {
    return [
      // 1. Redirección para los artículos (de articulo.html?id=123 a /articulo/123)
      {
        source: '/articulo.html', // La página vieja
        has: [ { type: 'query', key: 'id' } ], // SI TIENE el parámetro ?id=
        destination: '/articulo/:id', // Redirige a la nueva ruta
        permanent: true, // ¡Esto es un 301! (Aviso permanente a Google)
      },
      // 2. Redirección para las páginas estáticas (de .html a la ruta limpia)
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