import Recipes from '../components/Recipes/Recipes';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        {/* Título de la página */}
        <title>Recipes | Crea recetas con inteligencia artificial</title>

        {/* Descripción para SEO */}
        <meta
          name="description"
          content="Recipes es una herramienta que utiliza inteligencia artificial para crear recetas personalizadas basadas en tus ingredientes y preferencias. ¡Cocina con lo que tienes en casa!"
        />

        {/* Palabras clave para SEO */}
        <meta
          name="keywords"
          content="recetas, inteligencia artificial, cocina, ingredientes, IA, comida, chef, recetas personalizadas"
        />

        {/* Open Graph (para compartir en redes sociales) */}
        <meta property="og:title" content="Recipes | Crea recetas con inteligencia artificial" />
        <meta
          property="og:description"
          content="Recipes es una herramienta que utiliza inteligencia artificial para crear recetas personalizadas basadas en tus ingredientes y preferencias. ¡Cocina con lo que tienes en casa!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.Recipes.com" />
        <meta property="og:image" content="https://www.Recipes.com/logoComerIA.gif" />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />
        <meta property="og:image:type" content="image/gif" />
        <meta property="og:image:alt" content="Logo de Recipes" />

        {/* Twitter Card (para compartir en Twitter) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Recipes | Crea recetas con inteligencia artificial" />
        <meta
          name="twitter:description"
          content="Recipes es una herramienta que utiliza inteligencia artificial para crear recetas personalizadas basadas en tus ingredientes y preferencias. ¡Cocina con lo que tienes en casa!"
        />
        <meta name="twitter:image" content="https://www.Recipes.com/logoComerIA.gif" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Apple Touch Icon (para dispositivos Apple) */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Canonical URL (para evitar contenido duplicado) */}
        <link rel="canonical" href="https://www.Recipes.com" />
      </Head>

      <main className="container">
        <Recipes />
      </main>
    </>
  );
}