import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link'; // Importamos Link

export default function PoliticaPrivacidad() {
  return (
    <Layout>
      <Head>
        {/* SEO tags para esta página */}
        <title>Política de Privacidad - Noticias.lat</title>
        <meta name="description" content="Esta página le informa sobre nuestras políticas con respecto a la recopilación, uso y divulgación de datos personales cuando utiliza nuestro Servicio." />
        
        {/* Metatags OG específicas */}
        <meta property="og:title" content="Política de Privacidad - Noticias.lat" />
        <meta property="og:url" content="https://www.noticias.lat/politica-privacidad" />
        <meta property="og:description" content="Esta página le informa sobre nuestras políticas con respecto a la recopilación, uso y divulgación de datos personales cuando utiliza nuestro Servicio." />

        {/* Etiqueta Canónica */}
        <link rel="canonical" href="https://www.noticias.lat/politica-privacidad" />
      </Head>

      <div className="container">
        {/* Contenido de tu archivo politica-privacidad.html original */}
        <div className="static-page-container">
            <h1>Política de Privacidad</h1>
            <p>Fecha de última actualización: 31 de Octubre de 2025</p>
            <p>Noticias.lat ("nosotros", "nuestro") opera el sitio web Noticias.lat (el "Servicio"). Esta página le informa sobre nuestras políticas con respecto a la recopilación, uso y divulgación de datos personales cuando utiliza nuestro Servicio.</p>

            <h2>Recopilación y Uso de Información</h2>
            <p>No recopilamos información de identificación personal de nuestros visitantes. La información que recopilamos es puramente anónima y se utiliza para análisis de tráfico.</p>

            <h2>Datos de Registro (Log Data)</h2>
            <p>Al igual que muchos operadores de sitios, recopilamos información que su navegador envía cada vez que visita nuestro Servicio ("Datos de Registro"). Estos Datos de Registro pueden incluir información como la dirección del Protocolo de Internet ("IP") de su computadora, el tipo de navegador, la versión del navegador, las páginas de nuestro Servicio que visita, la hora y la fecha de su visita, el tiempo dedicado a esas páginas y otras estadísticas.</p>

            <h2>Cookies</h2>
            <p>Las cookies son archivos con una pequeña cantidad de datos, que pueden incluir un identificador único anónimo. Se envían a su navegador desde un sitio web y se almacenan en el disco duro de su computadora.</p>
            <p>Utilizamos cookies para recopilar información. Puede indicar a su navegador que rechace todas las cookies o que indique cuándo se está enviando una cookie. Sin embargo, si no acepta las cookies, es posible que no pueda utilizar algunas partes de nuestro Servicio.</p>
            
            <h2>Google AdSense y Cookies de Terceros</h2>
            <p>Utilizamos Google AdSense para mostrar anuncios en nuestro Servicio. Google, como proveedor externo, utiliza cookies para publicar anuncios en nuestro Servicio.</p>
            <ul>
                <li>El uso de la cookie DART de Google le permite a él y a sus socios publicar anuncios a nuestros usuarios basados en su visita a nuestro Servicio u otros sitios en Internet.</li>
                <li>Los usuarios pueden optar por no usar la cookie DART visitando la página de configuración de anuncios de Google.</li>
                <li>También utilizamos otros proveedores de publicidad de terceros. Estos proveedores pueden utilizar cookies para publicar anuncios basados en las visitas anteriores de un usuario a nuestro sitio web o a otros sitios web.</li>
            </ul>

            <h2>Cambios a esta Política de Privacidad</h2>
            <p>Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página.</p>

            <h2>Contáctenos</h2>
            <p>Si tiene alguna pregunta sobre esta Política de Privacidad, por favor <Link href="/contacto">contáctenos</Link>.</p>
        </div>
      </div>
    </Layout>
  );
}