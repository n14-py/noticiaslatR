import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { SITE_EMAIL, SITE_NAME, SITE_URL } from '../lib/site';

export const runtime = 'experimental-edge';

export default function PoliticaPrivacidad() {
  return (
    <Layout>
      <Head>
        <title>Política de Privacidad | {SITE_NAME}</title>
        <meta name="description" content="Cómo Noticias.lat y la app Noticias LAT tratan cookies, analítica, publicidad y datos de contacto." />
        <link rel="canonical" href={`${SITE_URL}/politica-privacidad`} />
      </Head>
      <div className="container">
        <div className="static-page-container static-prose">
          <h1>Política de Privacidad</h1>
          <p>Fecha de última actualización: 11 de septiembre de 2026</p>
          <p>
            Esta política describe cómo Noticias.lat (el sitio https://www.noticias.lat) y la aplicación
            Android Noticias LAT (“el Servicio”), operados por LFAF Tech, tratan la información. Está
            pensada para cumplir buenas prácticas de transparencia exigidas por anunciantes, incluida Google AdSense.
          </p>

          <h2>1. Responsable</h2>
          <p>
            Responsable: LFAF Tech — Noticias.lat.<br />
            Contacto: <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> · <Link href="/contacto">Formulario de contacto</Link>
          </p>

          <h2>2. Qué datos tratamos</h2>
          <p>No exigimos registro para leer las noticias. Podemos tratar:</p>
          <ul>
            <li>Datos técnicos de navegación: IP, tipo de dispositivo y navegador, páginas vistas, fecha y hora (registros de servidor y CDN).</li>
            <li>Datos que nos envías voluntariamente por correo o formulario (nombre, email y mensaje).</li>
            <li>Identificadores de publicidad y analítica mediante cookies o identificadores móviles, si aceptas o no bloqueas esas tecnologías.</li>
            <li>En la app: token de notificaciones y datos de uso básicos que Android o Firebase puedan recoger según la configuración del dispositivo.</li>
          </ul>
          <p>No vendemos bases de datos de lectores. No pedimos datos sensibles para navegar el sitio.</p>

          <h2>3. Finalidades</h2>
          <ul>
            <li>Mostrar y mejorar el periodismo digital, medir audiencia y detectar abusos o fallos.</li>
            <li>Responder solicitudes de contacto, correcciones y soporte de la app.</li>
            <li>Mostrar publicidad propia y de terceros (Google AdSense y redes asociadas).</li>
            <li>Cumplir obligaciones legales y de seguridad.</li>
          </ul>

          <h2>4. Cookies y tecnologías similares</h2>
          <p>
            Usamos cookies propias (por ejemplo, recordar que cerraste el aviso de la app) y cookies de terceros.
            Puedes bloquear cookies en tu navegador; algunas funciones publicitarias dejarán de personalizarse.
          </p>

          <h2>5. Google AdSense y partners publicitarios</h2>
          <p>
            Google, como proveedor externo, utiliza cookies para publicar anuncios en el Servicio. Google y sus
            socios pueden mostrar anuncios basados en visitas anteriores a este u otros sitios. Los usuarios
            pueden inhabilitar la personalización en la configuración de anuncios de Google:
          </p>
          <p>
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">https://www.google.com/settings/ads</a>
          </p>
          <p>
            Cómo usa Google los datos: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">policies.google.com/technologies/partner-sites</a>.
          </p>
          <p>
            Otros anunciantes o medidores pueden usar cookies propias. Los anuncios internos de Noticias.lat
            se etiquetan como publicidad o patrocinado.
          </p>

          <h2>6. Google Analytics</h2>
          <p>
            Usamos Google Analytics 4 para estadísticas agregadas de uso. La IP se trata de forma seudonimizada
            cuando la configuración lo permite. Puedes oponerte con complementos de inhabilitación de Google
            o bloqueando scripts de analítica.
          </p>

          <h2>7. Cloudflare</h2>
          <p>
            El sitio se entrega a través de Cloudflare (CDN, seguridad y, en su caso, señales de rastreo).
            Cloudflare puede tratar datos técnicos según su propia política para prestar el servicio de red.
          </p>

          <h2>8. Conservación</h2>
          <p>
            Los registros técnicos se conservan el tiempo necesario para seguridad y estadística. Los correos
            de contacto se guardan mientras dure la gestión y las obligaciones legales asociadas.
          </p>

          <h2>9. Destinatarios</h2>
          <p>
            Encargados de tratamiento habituales: Google (Ads, Analytics, Play), Cloudflare e infraestructura
            de alojamiento/API. No cedemos tu correo de contacto a terceros para marketing ajeno.
          </p>

          <h2>10. Transferencias internacionales</h2>
          <p>
            Proveedores como Google y Cloudflare pueden tratar datos en Estados Unidos u otros países con
            cláusulas y medidas reconocidas por su normativa.
          </p>

          <h2>11. Menores</h2>
          <p>
            El Servicio está dirigido a un público general adulto. No recopilamos de forma consciente datos
            de menores de 13 años (o la edad digital mínima de tu país).
          </p>

          <h2>12. Tus derechos</h2>
          <p>
            Según tu legislación (incluida, cuando aplique, normativa latinoamericana de protección de datos o
            GDPR si eres residente del EEE), puedes pedir acceso, rectificación, supresión, oposición o
            limitación, y retirar el consentimiento de cookies no esenciales. Escríbenos a {SITE_EMAIL}.
          </p>

          <h2>13. Cambios</h2>
          <p>Publicaremos cualquier cambio material en esta página con nueva fecha de actualización.</p>

          <h2>14. Contacto</h2>
          <p>
            Privacidad y datos: <Link href="/contacto">Contacto</Link> o {SITE_EMAIL}.
          </p>
        </div>
      </div>
    </Layout>
  );
}
