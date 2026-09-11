const XML_HEADERS = {
  'content-type': 'application/xml; charset=utf-8',
  'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
};

export function xmlResponse(xml, status = 200) {
  return new Response(xml, { status, headers: XML_HEADERS });
}

export async function remember(cacheKey, producer) {
  try {
    if (typeof caches !== 'undefined' && caches.default) {
      const request = new Request(cacheKey);
      const hit = await caches.default.match(request);
      if (hit) return hit;
      const response = await producer();
      const copy = response.clone();
      await caches.default.put(request, copy);
      return response;
    }
  } catch {
    // Cache API is optional (local Next.js). Fall through.
  }
  return producer();
}
