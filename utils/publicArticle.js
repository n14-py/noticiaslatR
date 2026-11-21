const CARD_KEYS = [
    '_id',
    'titulo',
    'descripcion',
    'imagen',
    'categoria',
    'fecha',
    'youtubeId',
    'videoProcessingStatus',
    'audioUrl',
];

const ARTICLE_KEYS = [
    ...CARD_KEYS,
    'fuente',
    'enlaceOriginal',
    'pais',
    'textoImagen',
    'aiSummary',
    'articuloGenerado',
];

const AD_KEYS = ['_id', 'mediaUrl', 'nombreCampana'];

function pick(source, keys) {
    const out = {};
    if (!source || typeof source !== 'object') return out;
    for (const key of keys) {
        if (source[key] !== undefined) out[key] = source[key];
    }
    return out;
}

export function toNewsCard(article) {
    return pick(article, CARD_KEYS);
}

export function toArticlePage(article) {
    return pick(article, ARTICLE_KEYS);
}

export function toWebAd(ad) {
    return pick(ad, AD_KEYS);
}
