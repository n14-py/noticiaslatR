/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  async headers() {
    return [
      {
        source: '/sitemap(.*).xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' },
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
        ],
      },
      {
        source: '/articulo/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=1800, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=3600' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemaps?type=index' },
      { source: '/sitemap-static.xml', destination: '/api/sitemaps?type=static' },
      { source: '/sitemap-news.xml', destination: '/api/sitemaps?type=news' },
      { source: '/sitemap-video.xml', destination: '/api/sitemaps?type=video' },
      { source: '/sitemap-noticias-:page.xml', destination: '/api/sitemaps?type=noticias&page=:page' },
    ];
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'noticias.lat' }],
        destination: 'https://www.noticias.lat/:path*',
        permanent: true,
      },
      {
        source: '/radios',
        destination: '/podcast',
        permanent: true,
      },
      {
        source: '/radios/:path*',
        destination: '/podcast',
        permanent: true,
      },
      {
        source: '/radio/:uuid',
        destination: '/podcast',
        permanent: true,
      },
      {
        source: '/articulo.html',
        has: [{ type: 'query', key: 'id' }],
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
