import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para limpiar el JSON
function cleanJson(jsonString) {
  return jsonString.replace(/,\s*([\]}])/g, '$1');
}

// Contexto inicial que se enviará una sola vez
const initialContext = `
Eres un chef profesional y experto en nutrición. Tu tarea es generar recetas detalladas **en formato JSON** basadas en los parámetros que te proporcionaré.

📌 **Formato estricto esperado en la respuesta **: SOLO DEVOLVERAS UN JSON. Sin nada antes ni después.
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
2 **Ingredientes:** Devuelve solo una lista de nombres de ingredientes.  
3 **Pasos de preparación:** Explica cada paso con **claridad** si es necesario el paso será más largo, incluyendo tiempos de cocción si es necesario.  
4 **Recetas únicas:** Evita generar recetas repetitivas o sin sentido. 
5 **EJEMPLO DE INGREDIENTES**
- En la respuesta de ingredientes podrás añadir: Sal, pimienta, aceite, agua, azúcar, etc.. Aunque no estén en la lista de ingredientes.
- Si "Receta estricta" es **false**, y los ingredientes son ["pollo", "arroz"], deberías añadir algunos ingredientes para mejorar la receta con una salsa, especias, etc.
- Si "Receta estricta" es **true**, y los ingredientes son ["pollo", "arroz"], no puedes añadir ni omitir ingredientes. 
6 **Coherencia:** 
   - Si se especifica una restricción dietética, **evita** ingredientes que la contradigan.
   - Si un electrodoméstico no está disponible, **no lo uses en la receta**.  
   - La receta debe ser **realista y factible** con los ingredientes dados.
7 **Nombre de la receta:** Debe ser **creativo y atractivo**.
   
🚨 **INSTRUCCIONES PARA "warningmessage":** 
1 **Recetas no seguras:** Si la receta es **poco saludable o peligrosa**, activa "ok": false y explica en "warningmessage".
2 **Ingredientes no compatibles con la dieta especificada:** Si la receta contiene ingredientes que contradicen la dieta, activa "ok": false y explica en "warningmessage".
3 **Ingredientes inválidos:** Si la lista contiene palabras que no son alimentos (sentimientos, conceptos, etc), activa "ok": false.  
4 **Advertencias:** Si la receta **no es comestible o es peligrosa** (ej: objetos, cosas, ingredientes peligrosos de ingerir), "ok": false y incluye un "warningmessage" explicando el motivo (**el mensaje tendrá un poco de humor**).  
5 **Si la receta contiene nombres propios, conceptos, verbos o palabras que no son alimentos, activa "ok": false y explica en "warningmessage": "mensaje".**
`;

export async function POST(request) {
  try {
    const { ingredients, difficulty, mealType, diet, portions, appliances, regeneratePart, useStrictIngredients } = await request.json();

    console.log("📌 Ingredientes recibidos:", ingredients);
    console.log("📌 Filtros -> Dificultad:", difficulty, "| Tipo de comida:", mealType, "| Dieta:", diet, "| Porciones:", portions);
    console.log("📌 Electrodomésticos:", appliances);
    console.log("📌 Regenerar parte:", regeneratePart);
    console.log("📌 Usar solo ingredientes seleccionados:", useStrictIngredients);

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: "Debes proporcionar ingredientes." }, { status: 400 });
    }

    // Construir el prompt con los parámetros específicos
    const userPrompt = `
      📌 **Parámetros de entrada**:
      - Ingredientes disponibles: ${ingredients.join(", ")}
      - Nivel de dificultad: ${difficulty}
      - Tipo de comida: ${mealType}
      - Restricción dietética: ${diet}
      - Cantidad de porciones: ${portions}
      - Electrodomésticos disponibles: ${appliances.join(", ") || "ninguno"}
      - Receta estricta: ${useStrictIngredients ? "true" : "false"}
    `;

    // Array de mensajes que incluye el contexto inicial y el prompt del usuario
    const messages = [
      { role: "system", content: initialContext }, // Contexto inicial
      { role: "user", content: userPrompt },       // Parámetros específicos
    ];

    console.log("📌 Enviando prompt a OpenAI...");

    // Llamada a la API de OpenAI con manejo de errores
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages, // Usar el array de mensajes
      temperature: 1.2,
    });

    // Validar la respuesta antes de intentar analizarla
    if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
      console.error("❌ Respuesta inesperada de OpenAI:", response);
      return NextResponse.json({ error: "Respuesta inválida de OpenAI." }, { status: 500 });
    }

    // Limpiar la respuesta para extraer solo el JSON
    const rawContent = response.choices[0].message.content;

    // Intentar extraer el JSON de un bloque ```json ``` (si existe)
    let jsonContent = rawContent.match(/```json\s*([\s\S]*?)\s*```/);

    // Si no se encuentra un bloque ```json ```, asumir que la respuesta es directamente un JSON
    if (!jsonContent || !jsonContent[1]) {
      jsonContent = rawContent; // Usar la respuesta completa como JSON
    } else {
      jsonContent = jsonContent[1].trim(); // Extraer el JSON del bloque ```json ```
    }

    // Validar que el contenido es un JSON válido
    if (!jsonContent) {
      console.error("❌ No se encontró JSON válido en la respuesta:", rawContent);
      return NextResponse.json({ error: "Formato de respuesta inválido." }, { status: 500 });
    }

    // Limpiar el JSON antes de analizarlo
    const cleanedJsonContent = cleanJson(jsonContent);

    let recipe;
    try {
      recipe = JSON.parse(cleanedJsonContent); // Analizar el JSON limpio
    } catch (error) {
      console.error("❌ Error al analizar JSON de OpenAI:", error, cleanedJsonContent);
      return NextResponse.json({ error: "Error al procesar la respuesta de OpenAI." }, { status: 500 });
    }

    console.log("📌 Receta generada correctamente:", recipe);
    return NextResponse.json(recipe);
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Error al generar la receta." }, { status: 500 });
  }
}