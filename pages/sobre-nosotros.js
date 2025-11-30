import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function SobreNosotros() {
    return (
        <Layout>
            <Head>
                <title>Sobre Nosotros - Noticias.lat | AudioNoticias IA</title>
                <meta name="description" content="Conoce a Noticias.lat, la primera plataforma de noticias narradas por inteligencia artificial en tiempo real." />
            </Head>

            {/* HERO SECTION (Encabezado Visual) */}
            <div style={{ 
                background: 'linear-gradient(135deg, var(--color-tech-bg) 0%, #1e3a8a 100%)', 
                color: 'white', 
                padding: '5rem 1rem', 
                textAlign: 'center',
                marginBottom: '3rem'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-1px' }}>
                        El Futuro de las Noticias es <span style={{ color: '#60a5fa' }}>Audible</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', opacity: '0.9' }}>
                        Combinamos periodismo digital con inteligencia artificial avanzada para llevarte la actualidad en tiempo real, en texto y audio.
                    </p>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '900px', marginBottom: '4rem' }}>
                
                {/* 1. QUIÉNES SOMOS */}
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        color: 'var(--color-texto-titulos)', 
                        borderLeft: '5px solid var(--color-primario)', 
                        paddingLeft: '15px',
                        marginBottom: '1.5rem'
                    }}>
                        Quiénes Somos
                    </h2>
                    <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--color-texto-cuerpo)' }}>
                        <p style={{ marginBottom: '1rem' }}>
                            <strong>Noticias.lat</strong> nació con una misión clara: adaptar el consumo de información al ritmo de vida moderno. En un mundo donde el tiempo es escaso, creemos que mantenerse informado no debería ser una tarea difícil.
                        </p>
                        <p>
                            Somos pioneros en la implementación de tecnologías de <strong>Generación de Voz Neuronal (Neural TTS)</strong> y automatización de video. Esto nos permite transformar reportes escritos en experiencias audiovisuales ricas (AudioNoticias) en cuestión de minutos, garantizando que la información llegue a ti fresca y accesible, ya sea que estés leyendo en tu oficina o escuchando mientras conduces.
                        </p>
                    </div>
                </section>

                {/* 2. NUESTRA TECNOLOGÍA (Credibilidad) */}
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--color-texto-titulos)', marginBottom: '2rem' }}>
                        Innovación Tecnológica
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        {/* Card 1 */}
                        <div style={{ 
                            background: 'white', padding: '2rem', borderRadius: '12px', 
                            boxShadow: 'var(--sombra-suave)', border: '1px solid var(--borde-sutil)'
                        }}>
                            <i className="fas fa-robot" style={{ fontSize: '2rem', color: 'var(--color-primario)', marginBottom: '1rem' }}></i>
                            <h3 style={{ marginBottom: '0.5rem' }}>Curación por IA</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                Nuestros algoritmos monitorean fuentes globales 24/7 para identificar los eventos más relevantes al instante.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div style={{ 
                            background: 'white', padding: '2rem', borderRadius: '12px', 
                            boxShadow: 'var(--sombra-suave)', border: '1px solid var(--borde-sutil)'
                        }}>
                            <i className="fas fa-microphone-alt" style={{ fontSize: '2rem', color: 'var(--color-primario)', marginBottom: '1rem' }}></i>
                            <h3 style={{ marginBottom: '0.5rem' }}>Narración Natural</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                Utilizamos modelos de voz de última generación que suenan humanos, cálidos y profesionales.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. CONTACTO Y PRENSA (Lo que pediste) */}
                <section style={{ 
                    background: '#f8fafc', 
                    padding: '3rem', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Publicidad y Contacto</h2>
                    <p style={{ marginBottom: '2rem', color: '#475569' }}>
                        ¿Quieres anunciar tu marca en nuestras AudioNoticias o tienes una nota de prensa para compartir?
                        Llegamos a miles de usuarios activos interesados en tecnología, política y actualidad.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/contacto" style={{ 
                            background: 'var(--color-primario)', 
                            color: 'white', 
                            padding: '12px 30px', 
                            borderRadius: '50px', 
                            fontWeight: '700',
                            boxShadow: '0 4px 10px rgba(0, 102, 204, 0.3)'
                        }}>
                            Contactar Soporte
                        </Link>
                        
                        <a href="mailto:contactonoticiaslat@gmail.com" style={{ 
                            background: 'white', 
                            color: 'var(--color-texto-titulos)', 
                            border: '1px solid #cbd5e1',
                            padding: '12px 30px', 
                            borderRadius: '50px', 
                            fontWeight: '700'
                        }}>
                            contactonoticiaslat@gmail.com
                        </a>
                    </div>
                </section>

            </div>
        </Layout>
    );
}