import Head from 'next/head';
import Layout from '../components/Layout';
import { PLAY_STORE_URL, SITE_EMAIL, SITE_NAME, SITE_URL } from '../lib/site';

export const runtime = 'experimental-edge';

export default function Contacto() {
  return (
    <Layout>
      <Head>
        <title>Contacto | {SITE_NAME}</title>
        <meta name="description" content="Contacta a la redacción de Noticias.lat: correcciones, prensa, publicidad y soporte de la app Android." />
        <link rel="canonical" href={`${SITE_URL}/contacto`} />
      </Head>

      <div className="static-hero">
        <div className="container">
          <h1>Contacto</h1>
          <p>Redacción, correcciones, prensa, publicidad y soporte de la app.</p>
        </div>
      </div>

      <div className="container static-prose">
        <section>
          <h2>Escríbenos</h2>
          <p>
            El equipo revisa esta bandeja todos los días hábiles. Usa un asunto claro para que llegue al área correcta.
          </p>
          <p>
            <a className="play-btn" href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
          </p>
        </section>

        <section>
          <h2>Áreas</h2>
          <ul>
            <li><strong>Redacción y correcciones:</strong> errores de hecho, actualizaciones, derecho de réplica.</li>
            <li><strong>Prensa:</strong> comunicados e invitaciones para cobertura.</li>
            <li><strong>Publicidad:</strong> campañas en web, audionoticias, video o la app.</li>
            <li><strong>App Android:</strong> problemas de instalación o notificaciones de Noticias LAT en Google Play.</li>
            <li><strong>Legal / privacidad:</strong> ejercicio de derechos sobre datos y cookies. Ver también la <a href="/politica-privacidad">política de privacidad</a>.</li>
          </ul>
        </section>

        <section>
          <h2>Formulario rápido</h2>
          <form className="contact-form" action={`mailto:${SITE_EMAIL}`} method="post" encType="text/plain">
            <label>
              Nombre
              <input name="nombre" type="text" required placeholder="Tu nombre" />
            </label>
            <label>
              Correo
              <input name="email" type="email" required placeholder="tucorreo@ejemplo.com" />
            </label>
            <label>
              Tema
              <select name="tema" defaultValue="redaccion">
                <option value="redaccion">Redacción / corrección</option>
                <option value="prensa">Prensa</option>
                <option value="publicidad">Publicidad</option>
                <option value="app">App Android</option>
                <option value="privacidad">Privacidad</option>
              </select>
            </label>
            <label>
              Mensaje
              <textarea name="mensaje" rows="5" required placeholder="Cuéntanos el motivo de tu contacto" />
            </label>
            <button type="submit" className="play-btn">Abrir correo para enviar</button>
          </form>
          <p className="form-note">El envío abre tu cliente de correo con el mensaje listo para {SITE_EMAIL}.</p>
        </section>

        <section>
          <h2>También estamos en</h2>
          <ul>
            <li>Instagram: <a href="https://www.instagram.com/noticias.lat" target="_blank" rel="noreferrer">@noticias.lat</a></li>
            <li>YouTube: <a href="https://www.youtube.com/@Noticiaslat-3" target="_blank" rel="noreferrer">Noticias.lat</a></li>
            <li>App: <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer">Google Play — Noticias LAT</a></li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
