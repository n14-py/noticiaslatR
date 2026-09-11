import { API_URL, SITE_URL } from '../../lib/site';
import { fetchArticles, fetchText, normalizeArticles } from '../../lib/api';
import { remember, xmlResponse } from '../../lib/cache';

export const runtime = 'experimental-edge';

const FALLBACK_INDEX = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE_URL}/sitemap-static.xml</loc></sitemap>
  <sitemap><loc>${SITE_URL}/sitemap-news.xml</loc></sitemap>
  <sitemap><loc>${SITE_URL}/sitemap-video.xml</loc></sitemap>
  <sitemap><loc>${SITE_URL}/sitemap-noticias-1.xml</loc></sitemap>
</sitemapindex>`;

function toWww(xml) {
  return String(xml || '')
    .replaceAll('https://noticias.lat', SITE_URL)
    .replaceAll('http://noticias.lat', SITE_URL)
    .replaceAll('https://www.www.noticias.lat', SITE_URL);
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function staticSitemap() {
  const pages = [
    ['/', '1.0', 'hourly'],
    ['/podcast', '0.8', 'hourly'],
    ['/feed', '0.7', 'daily'],
    ['/app', '0.8', 'weekly'],
    ['/sobre-nosotros', '0.6', 'monthly'],
    ['/contacto', '0.6', 'monthly'],
    ['/politica-privacidad', '0.4', 'monthly'],
    ['/terminos', '0.4', 'monthly'],
  ];
  const lastmod = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([path, priority, changefreq]) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

async function proxyApiSitemap(apiPath) {
  const xml = await fetchText(`${API_URL}${apiPath}`, { timeout: 15000 });
  return toWww(xml);
}

async function buildIndex() {
  try {
    const xml = await proxyApiSitemap('/api/sitemap.xml');
    if (xml.includes('<sitemapindex') && xml.includes('<loc>')) {
      const withNews = xml.replace(
        '</sitemapindex>',
        `  <sitemap><loc>${SITE_URL}/sitemap-news.xml</loc></sitemap>\n</sitemapindex>`
      );
      return toWww(withNews);
    }
  } catch {
    // Fall through to a generated index so Google never sees a 5xx.
  }

  try {
    const { pagination } = await fetchArticles({ pagina: 1, limite: 1 });
    const perFile = 5000;
    const total = Math.max(1, Math.ceil((pagination.totalArticles || 1) / perFile));
    const children = Array.from({ length: Math.min(total, 40) }, (_, i) => {
      return `  <sitemap><loc>${SITE_URL}/sitemap-noticias-${i + 1}.xml</loc></sitemap>`;
    }).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE_URL}/sitemap-static.xml</loc></sitemap>
  <sitemap><loc>${SITE_URL}/sitemap-news.xml</loc></sitemap>
  <sitemap><loc>${SITE_URL}/sitemap-video.xml</loc></sitemap>
${children}
</sitemapindex>`;
  } catch {
    return FALLBACK_INDEX;
  }
}

async function buildNewsSitemap() {
  const { articles } = await fetchArticles({ pagina: 1, limite: 12 });
  const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
  const recent = articles.filter((article) => {
    const time = new Date(article.fecha).getTime();
    return Number.isFinite(time) && time >= twoDaysAgo;
  });
  const list = (recent.length ? recent : articles).slice(0, 50);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${list.map((article) => `  <url>
    <loc>${SITE_URL}/articulo/${article._id}</loc>
    <news:news>
      <news:publication>
        <news:name>Noticias.lat</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${isoDate(article.fecha)}</news:publication_date>
      <news:title>${escapeXml(article.titulo)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;
}

async function buildVideoSitemap() {
  const data = await fetchText(`${API_URL}/api/articles/feed?sitio=noticias.lat&limit=40`, { timeout: 8000 });
  let articles = [];
  try {
    articles = normalizeArticles(JSON.parse(data));
  } catch {
    articles = [];
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${articles.filter((article) => article.youtubeId).map((article) => {
    const title = escapeXml(article.titulo);
    const desc = escapeXml((article.descripcion || article.titulo || '').slice(0, 500));
    const thumb = article.imagen && String(article.imagen).startsWith('http')
      ? escapeXml(article.imagen)
      : `${SITE_URL}/images/placeholder.jpg`;
    return `  <url>
    <loc>${SITE_URL}/articulo/${article._id}</loc>
    <video:video>
      <video:thumbnail_loc>${thumb}</video:thumbnail_loc>
      <video:title>${title}</video:title>
      <video:description>${desc}</video:description>
      <video:player_loc>https://www.youtube.com/embed/${escapeXml(article.youtubeId)}</video:player_loc>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>`;
  }).join('\n')}
</urlset>`;
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'index';
  const page = searchParams.get('page') || '1';
  const cacheKey = `https://www.noticias.lat/__sitemap_cache__/${type}/${page}`;

  return remember(cacheKey, async () => {
    try {
      if (type === 'static') return xmlResponse(staticSitemap());
      if (type === 'news') return xmlResponse(await buildNewsSitemap());
      if (type === 'video') return xmlResponse(await buildVideoSitemap());
      if (type === 'noticias') {
        const safePage = String(page).replace(/[^\d]/g, '') || '1';
        try {
          const xml = await proxyApiSitemap(`/api/sitemap-noticias-${safePage}.xml`);
          if (xml.includes('<urlset')) return xmlResponse(xml);
        } catch {
          // Local fallback: newest articles only for page 1.
        }
        if (safePage === '1') {
          const { articles } = await fetchArticles({ pagina: 1, limite: 100 });
          const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles.map((article) => `  <url>
    <loc>${SITE_URL}/articulo/${article._id}</loc>
    <lastmod>${isoDate(article.fecha)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
          return xmlResponse(body);
        }
        return xmlResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
      return xmlResponse(await buildIndex());
    } catch {
      if (type === 'index') return xmlResponse(FALLBACK_INDEX);
      return xmlResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
  });
}
