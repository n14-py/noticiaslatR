import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Fuentes y estilos globales */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" 
        />
        
        {/* --- MONETAG: VIGNETTE BANNER --- */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10721309',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }} />

        {/* --- MONETAG: IN-PAGE PUSH --- */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10721319',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }} />

        {/* --- MONETAG: PUSH NOTIFICATIONS --- */}
        <script src="https://5gvci.com/act/files/tag.min.js?z=10721323" data-cfasync="false" async></script>

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}