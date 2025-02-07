import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { ingredients, difficulty, mealType, diet, portions, appliances, regeneratePart } = await request.json();
    
    console.log("📌 Ingredientes recibidos:", ingredients);
    console.log("📌 Filtros -> Dificultad:", difficulty, "| Tipo de comida:", mealType, "| Dieta:", diet, "| Porciones:", portions);
    console.log("📌 Electrodomésticos:", appliances);
    console.log("📌 Regenerar parte:", regeneratePart);

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: "Debes proporcionar ingredientes." }, { status: 400 });
    }

    // Solución para evitar el error de hidratación en Next.js
    const randomFactor = typeof window !== "undefined" ? Math.random() : 0;

    // Construcción del prompt optimizado (sin cantidades en los ingredientes)
    let prompt = `
      Eres un chef profesional y experto en nutrición. Tu tarea es generar una receta detallada **en formato JSON** basada en los siguientes parámetros:  

      📌 **Parámetros de entrada**:
      - Ingredientes disponibles: ${ingredients.join(", ")}
      - Nivel de dificultad: ${difficulty}
      - Tipo de comida: ${mealType}
      - Restricción dietética: ${diet}
      - Cantidad de porciones: ${portions}
      - Electrodomésticos disponibles: ${appliances.join(", ") || "ninguno"}

      ---
      
      📌 **Formato estricto esperado en la respuesta **: SOLO DEVOLVERAS UN JSON. Sin nada antes ni despues.
      {
        "ok": true,
        "warningmessage": null,
        "title": "Nombre de la receta",
        "ingredients": ["Ingrediente1 + cantidad", "Ingrediente2 + cantidad", "Ingrediente3 + cantidad"],
        "steps": [
          "1. Mezcla los ingredientes en un bowl.",
          "2. Cocina a fuego medio por 10 minutos."
        ],
        "tips": "Puedes agregar un poco de limón para mejorar el sabor."
      }
      
      📌 **Instrucciones obligatorias**:
      1 **Formato de salida:** Solo responde en **JSON válido**, sin texto adicional.  
      2 **Ingredientes:** Devuelve solo una lista de nombres de ingredientes, sin cantidades.  
      3 **Pasos de preparación:** Explica cada paso con **claridad**, incluyendo tiempos de cocción si es necesario.  
      4 **Recetas únicas:** Evita generar recetas repetitivas o sin sentido.  
      5 **Coherencia:** 
         - Si se especifica una restricción dietética, **evita** ingredientes que la contradigan.
         - Si un electrodoméstico no está disponible, **no lo uses en la receta**.  
         - La receta debe ser **realista y factible** con los ingredientes dados.
         
      🚨 **INSTRUCCIONES PARA "warningmessage":** 
      1 **Recetas no seguras:** Si la receta es **poco saludable o peligrosa**, activa "ok": false y explicar en "warningmessage".
      2 **Ingredientes no compatibles con la dieta especificada:** Si la receta contiene ingredientes que contradicen la dieta, activa "ok": false y explica en "warningmessage".
      3 **Ingredientes inválidos:** Si la lista contiene palabras que no son alimentos (sentimientos, conceptos, etc), activa "ok": false.  
      4 **Advertencias:** Si la receta **no es comestible o es peligrosa** (ej: objetos, cosas, ingredientes peligrosos de ingerir), "ok": false y incluye un "warningmessage" explicando el motivo (**el mensaje tendra un poco de humor**).  
      5 **Si la receta contiene nombres propios, conceptos, verbos o palabras que no son alimentos, activa "ok": false y explica en "warningmessage": "mensaje".**
      ---

      🚨 **IMPORTANTE:** 
      - Solo responde en formato JSON válido.
      - La lista de ingredientes debe contener nombres y cantidades.  
      - Si "ok": false, no generes la receta y solo devuelve el JSON con el "ok" y "warningmessage". Los demas valores seran null.  
      - 🚀 Genera una receta completamente nueva y diferente en cada intento. Este intento (${randomFactor}) debe ser único.
    
      RECUERDA RESPONDER SIEMPRE EN FORMATO JSON VÁLIDO.
      `;

    console.log("📌 Enviando prompt a OpenAI...");

    // Llamada a la API de OpenAI con manejo de errores
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 1.2,
    });

    // Validar la respuesta antes de intentar analizarla
    if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
      console.error("❌ Respuesta inesperada de OpenAI:", response);
      return NextResponse.json({ error: "Respuesta inválida de OpenAI." }, { status: 500 });
    }

    let recipe;
    try {
      recipe = JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("❌ Error al analizar JSON de OpenAI:", error, response.choices[0].message.content);
      return NextResponse.json({ error: "Error al procesar la respuesta de OpenAI." }, { status: 500 });
    }

    console.log("📌 Receta generada correctamente:", recipe);
    return NextResponse.json(recipe);
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Error al generar la receta." }, { status: 500 });
  }
}
