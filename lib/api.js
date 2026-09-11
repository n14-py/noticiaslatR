import { API_URL } from './site';

export async function fetchJson(url, { timeout = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url, { timeout = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export function normalizeArticles(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.articulos)) return data.articulos;
  if (Array.isArray(data.articles)) return data.articles;
  if (Array.isArray(data.docs)) return data.docs;
  return [];
}

export function slimListArticle(article) {
  if (!article) return null;
  return {
    _id: article._id,
    titulo: article.titulo || '',
    descripcion: article.descripcion || '',
    imagen: article.imagen || '',
    categoria: article.categoria || 'general',
    pais: article.pais || '',
    fecha: article.fecha || article.createdAt || null,
    youtubeId: article.youtubeId || null,
    videoProcessingStatus: article.videoProcessingStatus || null,
    hasAudio: Boolean(article.audioUrl),
    audioUrl: article.audioUrl || null,
  };
}

export function slimFullArticle(article) {
  if (!article) return null;
  return {
    _id: article._id,
    titulo: article.titulo || '',
    descripcion: article.descripcion || '',
    articuloGenerado: article.articuloGenerado || '',
    imagen: article.imagen || '',
    textoImagen: article.textoImagen || '',
    categoria: article.categoria || 'general',
    pais: article.pais || '',
    fecha: article.fecha || article.createdAt || null,
    youtubeId: article.youtubeId || null,
    videoProcessingStatus: article.videoProcessingStatus || null,
    audioUrl: article.audioUrl || null,
    aiSummary: article.aiSummary || null,
    fuente: article.fuente || '',
    enlaceOriginal: article.enlaceOriginal || '',
  };
}

export async function fetchArticles({ pagina = 1, limite = 18, categoria, pais, hasAudio } = {}) {
  const params = new URLSearchParams({
    sitio: 'noticias.lat',
    pagina: String(pagina),
    limite: String(limite),
  });
  if (categoria && categoria !== 'todos') params.set('categoria', categoria);
  if (pais) params.set('pais', pais);
  if (hasAudio) params.set('hasAudio', 'true');

  const data = await fetchJson(`${API_URL}/api/articles?${params.toString()}`);
  const articles = normalizeArticles(data).map(slimListArticle).filter(Boolean);

  return {
    articles,
    pagination: {
      currentPage: data.paginaActual || data.page || pagina,
      totalPages: data.totalPaginas || data.totalPages || 1,
      totalArticles: data.totalArticulos || data.totalDocs || articles.length,
    },
  };
}

export async function fetchArticleById(id) {
  try {
    const data = await fetchJson(`${API_URL}/api/article/${id}`);
    if (!data || data.error || !data._id) {
      const error = new Error('Not found');
      error.status = 404;
      throw error;
    }
    return slimFullArticle(data);
  } catch (error) {
    if (error.status === 400 || error.status === 404 || error.status === 410) {
      error.status = 404;
    }
    throw error;
  }
}

export async function fetchRecommended(id, categoria) {
  try {
    const data = await fetchJson(
      `${API_URL}/api/articles/recommended?sitio=noticias.lat&categoria=${encodeURIComponent(categoria || '')}&excludeId=${encodeURIComponent(id)}`,
      { timeout: 5000 }
    );
    return normalizeArticles(data).slice(0, 10).map(slimListArticle).filter(Boolean);
  } catch {
    return [];
  }
}

export function setCacheHeaders(res, seconds = 600) {
  if (!res || typeof res.setHeader !== 'function') return;
  const value = `public, s-maxage=${seconds}, stale-while-revalidate=86400`;
  res.setHeader('Cache-Control', value);
  res.setHeader('CDN-Cache-Control', value);
  res.setHeader('Cloudflare-CDN-Cache-Control', `max-age=${seconds}`);
}

export function setUnavailable(res, retryAfter = 120) {
  if (!res) return;
  if (typeof res.status === 'function') {
    res.status(503);
  } else {
    res.statusCode = 503;
  }
  if (typeof res.setHeader === 'function') {
    res.setHeader('Retry-After', String(retryAfter));
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=30');
    res.setHeader('X-Robots-Tag', 'noindex');
  }
}
