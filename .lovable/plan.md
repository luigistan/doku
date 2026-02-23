

# Plan: Integrar Ollama en la Edge Function builder-ai

## Resumen

Modificar `supabase/functions/builder-ai/index.ts` para agregar una funcion `callLLM()` que llame a tu servidor Ollama en Render (`https://ollama-doku.onrender.com`) para generar HTML con IA real, manteniendo el motor TF-IDF actual como fallback.

## Estado actual verificado

- Render: servicio `ollama-doku` building correctamente con Docker
- GitHub: repo `luigistan/ollama` con Dockerfile + start.sh
- Supabase secrets: LLM_PROVIDER, LLM_BASE_URL, LLM_MODEL configurados
- Edge function: 1968 lineas con TF-IDF, clasificador, entity extractor, templates HTML

## Cambios en un solo archivo

### `supabase/functions/builder-ai/index.ts`

**1. Nueva funcion `callLLM()` (insertar antes del handler principal)**

```text
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const provider = Deno.env.get("LLM_PROVIDER") || "gateway";
  const baseUrl = Deno.env.get("LLM_BASE_URL") || "";
  const model = Deno.env.get("LLM_MODEL") || "tinyllama";
  
  try {
    if (provider === "ollama") {
      // Ollama API format
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: `${systemPrompt}\n\nUsuario: ${userPrompt}`,
          stream: false,
        }),
        signal: AbortSignal.timeout(60000), // 60s timeout
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.response || null;
      
    } else if (provider === "gateway") {
      // Lovable AI Gateway (OpenAI-compatible format)
      const apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
    
    return null;
  } catch (err) {
    console.error("LLM call failed:", err);
    return null;
  }
}
```

**2. Funcion para construir el system prompt**

```text
function buildSystemPrompt(intent: string, label: string, entities: Entities): string {
  return `Eres un generador de sitios web profesionales.
Genera HTML completo (desde <!DOCTYPE html> hasta </html>), moderno, responsivo.
Usa Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
Usa imagenes de https://images.unsplash.com para fondos y fotos relevantes.
El diseno debe ser oscuro, moderno, profesional.

Tipo de sitio: ${intent} (${label})
Negocio: ${entities.businessName}
Secciones requeridas: ${entities.sections.join(", ")}
Esquema de colores: ${entities.colorScheme}

IMPORTANTE: Responde SOLO con el HTML completo. Sin explicaciones, sin markdown, sin backticks.
El HTML debe empezar con <!DOCTYPE html> y terminar con </html>.`;
}
```

**3. Funcion para extraer HTML de la respuesta del LLM**

```text
function extractHtmlFromResponse(response: string): string | null {
  // Buscar HTML completo en la respuesta
  const htmlMatch = response.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
  if (htmlMatch) return htmlMatch[0];
  
  // Buscar dentro de bloques de codigo markdown
  const codeMatch = response.match(/```(?:html)?\s*(<!DOCTYPE html>[\s\S]*<\/html>)\s*```/i);
  if (codeMatch) return codeMatch[1];
  
  // Si la respuesta parece HTML (empieza con < ), usarla tal cual
  if (response.trim().startsWith("<")) return response.trim();
  
  return null;
}
```

**4. Modificar el flujo principal (lineas ~1934-1951)**

Cambiar la generacion de HTML para intentar LLM primero:

```text
// ANTES:
const html = composeReactHtml({ name, colors, sections, intent });

// DESPUES:
let html: string;
const llmProvider = Deno.env.get("LLM_PROVIDER") || "none";

if (llmProvider !== "none") {
  const systemPrompt = buildSystemPrompt(intent, label, entities);
  const llmResponse = await callLLM(systemPrompt, message);
  const llmHtml = llmResponse ? extractHtmlFromResponse(llmResponse) : null;
  
  if (llmHtml && llmHtml.length > 200) {
    html = llmHtml;  // LLM genero HTML valido
  } else {
    html = composeReactHtml({ name: entities.businessName, colors, sections: entities.sections, intent });  // Fallback
  }
} else {
  html = composeReactHtml({ name: entities.businessName, colors, sections: entities.sections, intent });
}
```

## Lo que NO cambia

- Motor TF-IDF, clasificador, entity extractor: siguen funcionando para dar contexto
- `ai_learning_logs`, feedback loop, negative learning: sin cambios
- Memoria conversacional: sin cambios
- Todos los archivos del cliente: sin cambios
- `composeReactHtml()`: se mantiene como fallback

## Flujo final

```text
1. Usuario envia mensaje
2. TF-IDF clasifica intent + extrae entities (como hoy)
3. Se construye prompt con el contexto (intent, entities, secciones)
4. Se llama a Ollama via HTTP (https://ollama-doku.onrender.com/api/generate)
5. Si Ollama responde con HTML valido -> se usa ese HTML
6. Si Ollama falla o no hay HTML -> se usa composeReactHtml() (templates actuales)
7. Se loggea y se devuelve al cliente
```

## Advertencias

- El primer request despues de inactividad tardara 1-2 minutos (cold start de Render Starter)
- tinyllama es un modelo basico: el HTML puede no ser perfecto siempre
- El fallback a templates garantiza que siempre hay respuesta
- Timeout de 60 segundos para la llamada al LLM

