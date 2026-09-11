import Head from 'next/head';
import Script from 'next/script';
import Header from './Header';
import Footer from './Footer';
import { ADSENSE_CLIENT, GA_ID, SITE_NAME } from '../lib/site';
import { jsonLd, organizationSchema } from '../lib/seo';

export default function Layout({ children, noindex = false }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="robots" content={noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="es_LA" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema()) }} />
      </Head>

      <Script
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>

      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
