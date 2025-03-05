import IngredientInput from '../components/IngredientsInput/IngredientsInput';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';


export default function Home() {
  return (
    <>
      <Head>
        <title>Comer-IA</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="container">
        <img src='/logoComerIA.gif' width='300px' alt="Comer-IA Logo" className="logo" />
        <h1>Comer-IA</h1>
        <p className="description">Introduce tus ingredientes y parametros.<br/> Una IA creara una receta para ti.</p>
        <div className='box-Ingrdients'>
          <IngredientInput />
        </div>
        <Footer />
      </main>
    </>
  ); 
}
