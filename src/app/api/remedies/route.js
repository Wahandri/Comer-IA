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
Eres un experto en medicina tradicional y remedios naturales con 20 años de experiencia. Tu tarea es generar remedios caseros seguros **en formato JSON** basados en los parámetros que te proporcionaré.

📌 **Formato estricto esperado en la respuesta**: SOLO DEVOLVERÁS UN JSON. Sin nada antes ni después.
{
  "ok": true,
  "warningmessage": null,
  "title": "Nombre del remedio",
  "symptoms": ["síntoma1", "síntoma2"],
  "ingredients": [
    "Ingrediente1 + cantidad/detalle",
    "Ingrediente2 + cantidad"
  ],
  "preparation": [
    "1. Paso detallado de preparación",
    "2. Indicaciones claras"
  ],
  "application": [
    "1. Modo de aplicación",
    "2. Frecuencia de uso"
  ],
  "warnings": "Advertencias importantes de seguridad",
  "tips": "Consejos adicionales",
  "description": "Explicación detallada de cómo funciona el remedio y cómo cada ingrediente o paso contribuye a aliviar los síntomas."
}

📌 **Instrucciones obligatorias**:
1 **Formato de salida:** Solo responde en **JSON válido**, sin texto adicional.  
2 **Ingredientes:** Devuelve solo una lista de nombres de ingredientes (accesibles en España) con cantidades exactas.  
3 **Pasos de preparación:** Explica cada paso con **claridad**, incluyendo tiempos de preparación si es necesario.  
4 **Modo de aplicación:** Describe cómo y cuándo aplicar el remedio (frecuencia, cantidad, etc.).  
5 **Descripción:** Agrega una explicación de cómo funciona o actúa el remedio generado.
6 **INSTRUCCIONES DE INGREDIENTES**
- La cantidad de ingredientes debe ser **proporcional** a la duración del remedio (y se explicará en los pasos).
- Asegúrate de que los ingredientes y pasos de preparación sean **fáciles de seguir** y **accesibles** (España).
7 **Coherencia:** 
  - Si se especifica una duración, **ajusta** los ingredientes y pasos de preparación a esa duración.
  - Si se especifica una restricción médica, **evita** ingredientes que la contradigan.
  - El remedio debe ser **realista y factible** con los síntomas dados.
8 **Nombre del remedio:** Debe ser **Corto y descriptivo** (Si en síntomas se añade la "enfermedad", puedes añadirla al nombre. Ej: Infusión para la Jaqueca).

🚨 **INSTRUCCIONES PARA "warningmessage":** 
1 **Síntomas no válidos:** Si los síntomas contienen palabras que no son condiciones médicas (objetos, conceptos, verbos, etc.), activa "ok": false y explica en "warningmessage".
2 **Síntomas incompatibles:** Si los síntomas son demasiado dispares o no tienen relación médica, activa "ok": false y explica en "warningmessage".
3 **Condiciones graves:** Si los síntomas indican una condición que requiere atención médica inmediata (ataque al corazón, apendicitis, etc.), activa "ok": false y explica en "warningmessage" con urgencia.
4 **Remedios no seguros:** Si el remedio propuesto podría ser peligroso según las restricciones dadas, activa "ok": false y explica en "warningmessage".
5 **Ingredientes peligrosos:** Si la combinación de ingredientes podría ser tóxica o peligrosa, activa "ok": false y explica en "warningmessage".
6 **Humor en advertencias:** Cuando sea apropiado, añade un toque de humor a los "warningmessage" para suavizar la advertencia.
`;

export async function POST(request) {
  try {
    const { symptoms, remedyType, duration, restrictions } = await request.json();

    console.log("📌 Síntomas recibidos:", symptoms);
    console.log("📌 Filtros -> Tipo de remedio:", remedyType, "| Duración:", duration, "| Restricciones:", restrictions);

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: "Debes proporcionar síntomas." }, { status: 400 });
    }

    // Construir el prompt con los parámetros específicos
    const userPrompt = `
      📌 **Parámetros de entrada**:
      - Síntomas: ${symptoms.join(", ")}
      - Tipo de remedio: ${remedyType}
      - Duración: ${duration}
      - Restricciones: ${restrictions || "ninguna"}
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
      temperature: 0.8,
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

    let remedy;
    try {
      remedy = JSON.parse(cleanedJsonContent); // Analizar el JSON limpio
    } catch (error) {
      console.error("❌ Error al analizar JSON de OpenAI:", error, cleanedJsonContent);
      return NextResponse.json({ error: "Error al procesar la respuesta de OpenAI." }, { status: 500 });
    }

    console.log("📌 Remedio generado correctamente:", remedy);
    return NextResponse.json(remedy);
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json({ error: "Error al generar el remedio." }, { status: 500 });
  }
}