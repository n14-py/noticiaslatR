import Layout from '../components/Layout';
import Head from 'next/head';

export default function SobreNosotros() {
  return (
    <Layout>
      <Head>
        {/* Esto sobreescribe el título y descripción por defecto del Layout.js */}
        <title>Sobre Nosotros - Noticias.lat</title>
        <meta name="description" content="Nacimos con una misión clara: ser la plataforma de noticias líder y más completa de habla hispana, conectando a millones de personas." />
        
        {/* Metatags OG específicas para esta página */}
        <meta property="og:title" content="Sobre Nosotros - Noticias.lat" />
        <meta property="og:url" content="https://www.noticias.lat/sobre-nosotros" />
        <meta property="og:description" content="Nacimos con una misión clara: ser la plataforma de noticias líder y más completa de habla hispana, conectando a millones de personas." />

        {/* ¡Etiqueta Canónica! */}
        <link rel="canonical" href="https://www.noticias.lat/sobre-nosotros" />
      </Head>

      <div className="container">
        {/* Este es el contenido de tu archivo sobre-nosotros.html original */}
        <div className="static-page-container">
            <h1>Sobre Noticias.lat</h1>
            <p>Bienvenidos a <strong>Noticias.lat</strong>, el epicentro informativo de la red LFAF Tech. Nacimos con una misión clara: ser la plataforma de noticias líder y más completa de habla hispana, conectando a millones de personas con los eventos que definen a Latinoamérica y al mundo.</p>
            <p>En un panorama mediático saturado y fragmentado, entendemos que el tiempo es el activo más valioso. Por eso, nuestra prioridad es brindar una cobertura integral, veraz y al instante, permitiéndole a nuestros lectores obtener una visión completa de la actualidad de forma rápida y eficiente.</p>
            
            <h2>Un Motor de Información Sin Precedentes</h2>
            <p>En Noticias.lat, operamos a una escala diseñada para el mundo moderno. Nuestra avanzada plataforma tecnológica monitorea miles de fuentes en toda la región, permitiéndonos procesar, clasificar y analizar más de <strong>2.000 artículos de noticias cada día</strong>. Esto nos da una capacidad única para detectar tendencias, confirmar hechos y cubrir cada rincón de Latinoamérica, desde los grandes acontecimientos políticos en Argentina y México hasta los eventos culturales en Colombia o los desarrollos económicos en Chile y Perú.</p>
            <p>Contamos con un equipo dedicado de periodistas, editores y curadores de contenido que trabajan 24/7. Nuestro equipo de redacción no solo reporta el "qué", sino que profundiza en el "por qué", sintetizando la información más crucial y redactando artículos claros, concisos y profundos que ofrecen contexto y análisis.</p>

            <h2>Nuestro Compromiso con la Fuente Original</h2>
            <p>Creemos firmemente en la transparencia y en el valor del periodismo original. Si bien nuestro equipo redacta y contextualiza la información para ofrecer un producto único, siempre proporcionamos un enlace directo a la fuente original de la noticia. Valoramos el arduo trabajo de los periodistas en el terreno y consideramos a los medios de toda la región como nuestros valiosos socios en la misión de mantener informada a la población.</p>
            <p>Esta sinergia nos permite ser un puente: ofrecemos a nuestros lectores la inmediatez y la amplitud de un agregador, junto con la profundidad y el análisis de una sala de redacción dedicada.</p>
            
            <h2>Nuestra Visión: Ser la Voz de LATAM</h2>
            <p>Aspiramos a ser el punto de referencia informativo para Latinoamérica. Queremos ser la primera parada para cualquiera que busque entender la compleja y vibrante realidad de nuestra región. Estamos en una misión constante para innovar, mejorar nuestra plataforma y expandir nuestra cobertura.</p>
            <p>En Noticias.lat, no solo reportamos el presente; estamos construyendo el futuro de la información. Gracias por acompañarnos.</p>
        </div>
      </div>
    </Layout>
  );
}