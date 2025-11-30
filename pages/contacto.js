import Head from 'next/head';
import Layout from '../components/Layout';

export default function Contacto() {
    return (
        <Layout>
            <Head>
                <title>Contacto - Noticias.lat</title>
            </Head>

            <div className="container" style={{ maxWidth: '800px', margin: '4rem auto' }}>
                <h1 style={{ 
                    fontSize: '2.5rem', 
                    color: 'var(--color-texto-titulos)', 
                    textAlign: 'center', 
                    marginBottom: '1rem' 
                }}>
                    Hablemos
                </h1>
                <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem' }}>
                    ¿Tienes una noticia, una propuesta comercial o encontraste un error?
                </p>

                <div style={{ 
                    background: 'white', 
                    padding: '3rem', 
                    borderRadius: '12px', 
                    boxShadow: 'var(--sombra-suave)',
                    border: '1px solid var(--borde-sutil)'
                }}>
                    {/* Aquí podrías integrar un formulario real más adelante */}
                    <div style={{ textAlign: 'center' }}>
                        <i className="fas fa-envelope-open-text" style={{ fontSize: '3rem', color: 'var(--color-primario)', marginBottom: '1.5rem' }}></i>
                        <h3 style={{ marginBottom: '1rem' }}>Envíanos un correo</h3>
                        <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                            Nuestro equipo de soporte y redacción (humana y virtual) revisa esta bandeja todos los días.
                        </p>
                        
                        <a href="mailto:contactonoticiaslat@gmail.com" style={{ 
                            display: 'inline-block',
                            background: 'var(--color-primario)', 
                            color: 'white', 
                            padding: '15px 40px', 
                            borderRadius: '50px', 
                            fontWeight: '700',
                            fontSize: '1.2rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 15px rgba(0, 102, 204, 0.4)'
                        }}>
                            contactonoticiaslat@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
}