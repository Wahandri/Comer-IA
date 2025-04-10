import { NextResponse } from "next/server";

// Configuración del cliente Mistral
const createMistralClient = () => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY no está configurada en .env.local");

  return {
    chat: async ({ model, messages, temperature = 0.7, response_format }) => {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          response_format
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Error en la API de Mistral");
      }

      return response.json();
    }
  };
};

const client = createMistralClient();

// Contexto optimizado para Mistral
const systemPrompt = `
[ESPAÑOL] Eres un experto en medicina tradicional y remedios naturales con 30 años de experiencia. Tu tarea es generar remedios caseros seguros **en formato JSON** basados en los parámetros que te proporcionaré.

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
0 **Humor:** una pizca de humor es bienvenida, pero no en advertencias graves.
1 **Síntomas no válidos:** Si los síntomas contienen palabras que no son condiciones médicas (objetos, conceptos, verbos, etc.), activa "ok": false y explica en "warningmessage".
2 **Síntomas incompatibles:** Si los síntomas son demasiado dispares o no tienen relación médica, activa "ok": false y explica en "warningmessage".
3 **Condiciones graves:** Si los síntomas indican una condición que requiere atención médica inmediata (ataque al corazón, apendicitis, etc.), activa "ok": false y explica en "warningmessage" con urgencia.
4 **Remedios no seguros:** Si el remedio propuesto podría ser peligroso según las restricciones dadas, activa "ok": false y explica en "warningmessage".
5 **Ingredientes peligrosos:** Si la combinación de ingredientes podría ser tóxica o peligrosa, activa "ok": false y explica en "warningmessage".
6 **Humor en advertencias:** Cuando sea apropiado, añade un toque de humor a los "warningmessage" para suavizar la advertencia.
`.trim();

export async function POST(request) {
  try {
    // Validar y obtener parámetros
    const { symptoms, remedyType, duration, restrictions } = await request.json();
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json(
        { error: "Formato inválido: symptoms debe ser un array" },
        { status: 400 }
      );
    }

    // Construir el prompt del usuario
    const userPrompt = `
      Genera un remedio casero con:
      - Síntomas: ${symptoms.join(", ")}
      - Tipo: ${remedyType || "todos"}
      - Duración: ${duration || "corto"}
      - Restricciones: ${restrictions || "ninguna"}
      
      Respuesta EXCLUSIVAMENTE en el formato JSON especificado, sin texto adicional.
    `.trim();

    console.log("📤 Enviando a Mistral:", { symptoms, remedyType, duration, restrictions });

    // Llamada a la API de Mistral
    const response = await client.chat({
      model: 'mistral-medium',
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Procesamiento de la respuesta
    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("La respuesta no contiene contenido");

    // Extraer JSON (compatible con bloques de código o JSON puro)
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) jsonContent = jsonMatch[1].trim();

    // Validar y parsear
    const remedy = JSON.parse(jsonContent);
    
    if (typeof remedy.ok === 'undefined') {
      remedy.ok = true; // Forzar estructura esperada
    }

    console.log("📦 Respuesta procesada:", remedy);
    return NextResponse.json(remedy);

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { 
        ok: false,
        warningmessage: `Error al generar el remedio: ${error.message}`,
        error: error.message 
      },
      { status: 500 }
    );
  }
}