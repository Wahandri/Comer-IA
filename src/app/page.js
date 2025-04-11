import Recipes from '../components/Recipes/Recipes';
// import { useEffect } from "react";
import Head from 'next/head';

// const [showWarning, setShowWarning] = useState(false);

// useEffect(() => {
//   setShowWarning(false);
//   setWarningMessage(
//     `⚠️ <strong>Aviso importante:</strong><br/><br/>
//     La recetas y remedios sugeridos son recomendaciones generales y no sustituyen atención médica profesional.<br/>
//     Consulta siempre con un especialista antes de usar cualquier remedio.<br/><br/>
//     ¡Cuida tu salud con Remed-IA! 🌿🤖`
//   );
// }, []);


export default function Home() {
  return (
    <>
      <Head>
        {/* Título de la página */}
        <title>Comer-IA | Crea recetas con inteligencia artificial</title>

        {/* Descripción para SEO */}
        <meta
          name="description"
          content="Comer-IA es una herramienta que utiliza inteligencia artificial para crear recetas personalizadas basadas en tus ingredientes y preferencias. ¡Cocina con lo que tienes en casa!"
        />

        {/* Palabras clave para SEO */}
        <meta
          name="keywords"
          content="recetas, inteligencia artificial, cocina, ingredientes, IA, comida, chef, recetas personalizadas"
        />

        {/* Open Graph (para compartir en redes sociales) */}
        <meta property="og:title" content="Comer-IA | Crea recetas con inteligencia artificial" />
        <meta
          property="og:description"
          content="Comer-IA es una herramienta que utiliza inteligencia artificial para crear recetas personalizadas basadas en tus ingredientes y preferencias. ¡Cocina con lo que tienes en casa!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.Comer-IA.com" />
        <meta property="og:image" content="https://www.Comer-IA.com/logoComerIA.gif" />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />
        <meta property="og:image:type" content="image/gif" />
        <meta property="og:image:alt" content="Logo de Comer-IA" />

        {/* Twitter Card (para compartir en Twitter) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Comer-IA | Crea recetas con inteligencia artificial" />
        <meta
          name="twitter:description"
          content="Comer-IA es una herramienta que utiliza inteligencia artificial para crear recetas personalizadas basadas en tus ingredientes y preferencias. ¡Cocina con lo que tienes en casa!"
        />
        <meta name="twitter:image" content="https://www.Comer-IA.com/logoComerIA.gif" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Apple Touch Icon (para dispositivos Apple) */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Canonical URL (para evitar contenido duplicado) */}
        <link rel="canonical" href="https://www.Comer-IA.com" />
      </Head>

      <main className="container">
        <Recipes />
      </main>
    </>
  );
}