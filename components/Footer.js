import Link from 'next/link';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="main-footer">
            <div className="container">
                
                {/* LOGO Y REDES SOCIALES */}
                <div style={{ marginBottom: '3rem' }}>
                    <div className="footer-brand">
                        Noticias<span className="dot">.lat</span>
                    </div>
                    <p className="footer-desc">
                        Periodismo digital inteligente. Cobertura en tiempo real para Latinoamérica y el mundo.
                    </p>
                    
                    {/* AQUÍ ESTÁN LAS REDES SOCIALES */}
                    <div className="footer-social-icons">
                       <a href="https://www.instagram.com/noticias.lat" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href="https://www.youtube.com/@Noticiaslat-3" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                        <a href="https://www.youtube.com/@noticias-lat" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                        <a href="https://www.youtube.com/@NoticiasLat-2" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                        <a href="https://www.youtube.com/@NoticiasLat1" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>

                <div className="footer-grid">
                    {/* Columna 1 */}
                    <div className="footer-col">
                        <h3>Explorar</h3>
                        <ul>
                            <li><Link href="/?categoria=politica">Política</Link></li>
                            <li><Link href="/?categoria=economia">Economía</Link></li>
                            <li><Link href="/?categoria=tecnologia">Tecnología</Link></li>
                            <li><Link href="/?categoria=deportes">Deportes</Link></li>
                        </ul>
                    </div>

                    {/* Columna 2 */}
                    <div className="footer-col">
                        <h3>Compañía</h3>
                        <ul>
                            <li><Link href="/sobre-nosotros">Quiénes Somos</Link></li>
                            <li><Link href="/contacto">Contacto</Link></li>
                        </ul>
                    </div>
                    
                    {/* Columna 3 */}
                    <div className="footer-col">
                        <h3>Legal</h3>
                        <ul>
                            <li><Link href="/politica-privacidad">Privacidad</Link></li>
                            <li><Link href="/terminos">Términos</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {year} Noticias.lat. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}