import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { PLAY_STORE_URL, SITE_EMAIL, SITE_NAME, SITE_URL } from '../lib/site';

export const runtime = 'experimental-edge';

export default function Terminos() {
  return (
    <Layout>
      <Head>
        <title>Términos y Condiciones | {SITE_NAME}</title>
        <meta name="description" content="Términos de uso de Noticias.lat, la app Noticias LAT y los servicios de LFAF Tech." />
        <link rel="canonical" href={`${SITE_URL}/terminos`} />
      </Head>
      <div className="container">
        <div className="static-page-container static-prose">
          <h1>Términos y Condiciones de Uso</h1>
          <p>Fecha de última actualización: 11 de septiembre de 2026</p>
          <p>
            Estos Términos regulan el acceso a https://www.noticias.lat, a la aplicación Android Noticias LAT
            (paquete com.noticiaslat.app) y a cualquier servicio asociado operado por LFAF Tech
            (“nosotros”). Al usar el Servicio aceptas estos Términos. Si no estás de acuerdo, no lo uses.
          </p>

          <h2>1. Quiénes somos y qué publicamos</h2>
          <p>
            Noticias.lat es un medio digital de información general para Latinoamérica. El contenido de las
            noticias es producción propia: verificamos fuentes públicas y reescribimos cada artículo con el
            criterio de nuestra redacción. Las más de 50.000 notas alojadas en noticias.lat son piezas
            originales de este medio, no una copia automática de terceros.
          </p>
          <p>
            Podemos citar o enlazar la fuente consultada por transparencia periodística. Eso no implica que
            el texto publicado pertenezca a esa fuente.
          </p>

          <h2>2. La aplicación móvil</h2>
          <p>
            La app oficial se distribuye en Google Play. Puede enviar notificaciones, reproducir audio y
            abrir notas del sitio. El uso de la app se rige por estos Términos y por las políticas de Google Play.
            Más información en <Link href="/app">nuestra página de la app</Link>.
          </p>

          <h2>3. Propiedad intelectual</h2>
          <p>
            El diseño, la marca Noticias.lat, los titulares, los textos redactados por nosotros, los audios y
            videos propios son de LFAF Tech o de sus licenciantes. No está permitido copiar, scrapear o
            republicar el Servicio de forma sistemática sin autorización escrita.
          </p>

          <h2>4. Uso aceptable</h2>
          <p>
            No debes atacar la infraestructura, sobrecargar el sitio, extraer el archivo a escala con bots
            abusivos, suplantar al medio ni usar el contenido para entrenar modelos de IA cuando lo
            hayamos restringido en robots.txt u otras señales.
          </p>

          <h2>5. Cuentas, comentarios y envíos</h2>
          <p>
            Si en el futuro habilitamos cuentas o envíos de usuarios, eres responsable de lo que publiques.
            Nos reservamos el derecho de retirar contenido ilegal, difamatorio o que infrinja derechos de terceros.
          </p>

          <h2>6. Publicidad</h2>
          <p>
            El Servicio se financia, en parte, con publicidad de Google AdSense y con campañas propias
            identificadas como anuncio. Los anuncios de terceros están sujetos a sus propias políticas.
            Detalles de cookies en la <Link href="/politica-privacidad">Política de Privacidad</Link>.
          </p>

          <h2>7. Exactitud de la información</h2>
          <p>
            Trabajamos para que cada nota sea correcta. Aun así, el contenido se ofrece con fines informativos
            y puede actualizarse. No es asesoramiento legal, médico, financiero ni profesional. Si ves un error,
            escríbenos a {SITE_EMAIL}.
          </p>

          <h2>8. Enlaces a terceros</h2>
          <p>
            El sitio y la app pueden enlazar a medios, redes, Google Play u otras plataformas. No controlamos
            esos sitios y no respondemos por su contenido o sus prácticas de privacidad.
          </p>
          <p>
            Tienda de la app: <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer">{PLAY_STORE_URL}</a>.
          </p>

          <h2>9. Limitación de responsabilidad</h2>
          <p>
            En la medida permitida por la ley, LFAF Tech no será responsable de daños indirectos, lucro
            cesante o pérdida de datos derivados del uso o la imposibilidad de usar el Servicio, incluidos
            cortes técnicos, errores de terceros o fallos de red.
          </p>

          <h2>10. Indemnidad</h2>
          <p>
            Aceptas mantener indemne a LFAF Tech frente a reclamaciones derivadas de tu uso ilegal del
            Servicio o del incumplimiento de estos Términos.
          </p>

          <h2>11. Ley aplicable</h2>
          <p>
            Estos Términos se interpretan según las leyes aplicables en el lugar de establecimiento de LFAF Tech,
            sin perjuicio de normas imperativas de protección al consumidor que te correspondan.
          </p>

          <h2>12. Cambios</h2>
          <p>
            Podemos actualizar estos Términos. La fecha del encabezado indica la versión vigente. El uso
            continuado después de un cambio razonable implica aceptación.
          </p>

          <h2>13. Contacto</h2>
          <p>
            Dudas legales o de uso: <Link href="/contacto">Contacto</Link> o {SITE_EMAIL}.
          </p>
        </div>
      </div>
    </Layout>
  );
}
