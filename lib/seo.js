import { SITE_EMAIL, SITE_LEGAL_NAME, SITE_NAME, SITE_URL } from './site';

export function absoluteUrl(path = '/') {
  if (!path) return SITE_URL;
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/favicon.png`,
    },
    email: SITE_EMAIL,
    sameAs: [
      'https://www.instagram.com/noticias.lat',
      'https://www.youtube.com/@Noticiaslat-3',
      'https://play.google.com/store/apps/details?id=com.noticiaslat.app',
    ],
    publishingPrinciples: `${SITE_URL}/sobre-nosotros`,
    correctionsPolicy: `${SITE_URL}/sobre-nosotros`,
    ethicsPolicy: `${SITE_URL}/sobre-nosotros`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SITE_EMAIL,
      availableLanguage: ['es'],
    },
  };
}

export function newsArticleSchema(article) {
  if (!article) return null;
  const url = absoluteUrl(`/articulo/${article._id}`);
  const image = article.imagen && article.imagen.startsWith('http')
    ? article.imagen
    : `${SITE_URL}/images/placeholder.jpg`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.titulo,
    description: article.descripcion,
    image,
    datePublished: article.fecha,
    dateModified: article.fecha,
    mainEntityOfPage: url,
    author: {
      '@type': 'Organization',
      name: 'Redacción Noticias.lat',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.png`,
      },
    },
    inLanguage: 'es',
    articleSection: article.categoria,
    url,
  };
}

export function jsonLd(data) {
  if (!data) return null;
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
