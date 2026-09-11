import Link from 'next/link';
import { PLAY_STORE_URL, SITE_EMAIL } from '../lib/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="container">
        <div style={{ marginBottom: '3rem' }}>
          <div className="footer-brand">
            Noticias<span className="dot">.lat</span>
          </div>
          <p className="footer-desc">
            Medio digital de Latinoamérica y el mundo. Producimos unas 300 noticias al día, verificadas
            y reescritas con el sello de Noticias.lat. Más de 500 mil personas nos ven cada mes en YouTube.
            También en la app oficial para Android.
          </p>
          <div className="footer-social-icons">
            <a href="https://www.instagram.com/noticias.lat" target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.youtube.com/@Noticiaslat-3" target="_blank" rel="noreferrer" aria-label="YouTube Noticiaslat-3">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.youtube.com/@noticias-lat" target="_blank" rel="noreferrer" aria-label="YouTube noticias-lat">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.youtube.com/@NoticiasLat-2" target="_blank" rel="noreferrer" aria-label="YouTube NoticiasLat-2">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.youtube.com/@NoticiasLat1" target="_blank" rel="noreferrer" aria-label="YouTube NoticiasLat1">
              <i className="fab fa-youtube"></i>
            </a>
            <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" aria-label="Google Play">
              <i className="fab fa-google-play"></i>
            </a>
            <a href={`mailto:${SITE_EMAIL}`} aria-label="Correo">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h3>Explorar</h3>
            <ul>
              <li><Link href="/?categoria=politica">Política</Link></li>
              <li><Link href="/?categoria=economia">Economía</Link></li>
              <li><Link href="/?categoria=tecnologia">Tecnología</Link></li>
              <li><Link href="/?categoria=deportes">Deportes</Link></li>
              <li><Link href="/podcast">Podcast / Audionoticias</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Compañía</h3>
            <ul>
              <li><Link href="/sobre-nosotros">Quiénes somos</Link></li>
              <li><Link href="/contacto">Contacto</Link></li>
              <li><Link href="/app">App Android</Link></li>
              <li><a href={PLAY_STORE_URL} target="_blank" rel="noreferrer">Google Play</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Legal</h3>
            <ul>
              <li><Link href="/politica-privacidad">Privacidad</Link></li>
              <li><Link href="/terminos">Términos</Link></li>
              <li><a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} Noticias.lat — LFAF Tech. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
