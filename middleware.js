import { NextResponse } from 'next/server';

export const runtime = 'experimental-edge';

export function middleware(request) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();

  if (host === 'noticias.lat') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = 'www.noticias.lat';
    return NextResponse.redirect(url, 301);
  }

  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  if (path.startsWith('/sitemap') || path.endsWith('.xml')) {
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.png|images/|ads.txt|app-ads.txt).*)'],
};
