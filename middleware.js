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

  if (path === '/juegos' || path === '/miembros') {
    return new NextResponse(
      `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="robots" content="noindex,nofollow"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Contenido eliminado | Noticias.lat</title>
</head>
<body style="font-family:system-ui,sans-serif;padding:48px 20px;text-align:center">
  <h1>Esta sección se eliminó</h1>
  <p>Ya no forma parte de Noticias.lat.</p>
  <p><a href="/">Volver a la portada</a></p>
</body>
</html>`,
      {
        status: 410,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow',
          'Cache-Control': 'public, s-maxage=86400',
        },
      }
    );
  }
  const response = NextResponse.next();

  if (path.startsWith('/sitemap') || path.endsWith('.xml')) {
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.png|images/|ads.txt|app-ads.txt).*)'],
};
