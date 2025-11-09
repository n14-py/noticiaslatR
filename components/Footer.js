import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="main-footer">
            <div className="container footer-content">
                <div className="footer-section about">
                    <h3>Noticias.lat</h3>
                    <p>El portal de noticias líder de la red LFAF Tech, comprometido con la información veraz y al instante.</p>
                </div>
                <div className="footer-section links">
                    <h4>Enlaces Rápidos</h4>
                    <ul>
                        <li><Link href="/?categoria=todos">Última Hora</Link></li>
                        <li><Link href="/?categoria=deportes">Deportes</Link></li>
                        <li><Link href="/?categoria=politica">Política</Link></li>
                        <li><Link href="/?categoria=economia">Economía</Link></li>
                    </ul>
                </div>
                <div className="footer-section links-legal">
                    <h4>Legal</h4>
                    <ul>
                        <li><Link href="/politica-privacidad">Política de Privacidad</Link></li>
                        <li><Link href="/terminos">Términos y Condiciones</Link></li>
                        <li><Link href="/sobre-nosotros">Sobre Nosotros</Link></li>
                        <li><Link href="/contacto">Contacto</Link></li>
                    </ul>
                </div>
                <div className="footer-section social">
                    <h4>Síguenos</h4>
                    <ul style={{ display: 'flex', gap: '1rem', fontSize: '1.5rem' }}>
                        <li><a href="https://www.instagram.com/noticias.lat" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a></li>
                        <li><a href="https://www.tiktok.com/@noticias.lat" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i className="fab fa-tiktok"></i></a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Noticias.lat | Una plataforma de <a href="https://lfaftech.com" target="_blank" rel="noopener noreferrer">LFAF Tech</a>
            </div>
        </footer>
    );
}