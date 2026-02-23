

# Plan: Integrar Ollama (Solo Ollama) con DOKU

## Contexto

Tienes Ollama instalado localmente Y una API key de Ollama Cloud (`2451a3e...`). Esto simplifica mucho la arquitectura porque Ollama Cloud tiene una API accesible desde cualquier lugar, incluyendo Edge Functions de Supabase.

## Arquitectura Simple (Solo Ollama)

```text
Usuario escribe mensaje
       |
       v
[Motor de reglas DOKU] --> confianza >= 60% --> Generar sitio
       |
       v  (confianza < 60%)
[Ollama Cloud API] --> clasificar con LLM --> Generar sitio
  https://ollama.com/api/chat
  Authorization: Bearer OLLAMA_API_KEY
```

No se necesita bridge del navegador ni Lovable AI Gateway. El Edge Function llama directamente a la API de Ollama Cloud con tu API key.

## Cambios a Implementar

### 1. NUEVO: `supabase/functions/doku-ollama/index.ts`

Edge function dedicada para la integracion con Ollama Cloud:
- Recibe `{ message, context, intents }` via POST
- Llama a `https://ollama.com/api/chat` con `Authorization: Bearer OLLAMA_API_KEY`
- System prompt especifico de DOKU con la lista de 30 intents y formato de respuesta JSON
- Usa el modelo que tengas disponible en tu cuenta Ollama (ej: `llama3`, `gpt-oss:120b-cloud`, `mistral`)
- Retorna `{ intent, confidence, entities }` compatible con BuilderResponse
- Maneja timeouts y errores

### 2. Guardar la API key como secret de Supabase

- Almacenar `OLLAMA_API_KEY` como secret seguro en Supabase
- La edge function la lee con `Deno.env.get("OLLAMA_API_KEY")`

### 3. MODIFICAR: `supabase/functions/builder-ai/index.ts`

Agregar logica para llamar a Ollama cuando la confianza del motor de reglas es baja:
- Despues de clasificar con el motor de reglas, si `confidence < 0.6`, llamar internamente a la API de Ollama Cloud
- Combinar la clasificacion del LLM con los templates HTML existentes
- El LLM solo clasifica y sugiere entidades; el HTML sigue saliendo del motor de reglas

Alternativa: en lugar de crear una edge function separada, integrar la llamada a Ollama directamente dentro de `builder-ai/index.ts` para mantener todo en un solo lugar.

### 4. MODIFICAR: `supabase/config.toml`

Registrar la nueva edge function (si se crea separada):
```text
[functions.doku-ollama]
verify_jwt = false
```

### 5. MODIFICAR: `src/services/builderService.ts`

Actualizar `generateSite()` para manejar el flujo hibrido:
- El motor de reglas sigue siendo la primera linea
- Si confianza < 60%, el mismo edge function llama a Ollama Cloud internamente
- Agregar campo `provider` al response para indicar que motor se uso ("rules" | "ollama")

### 6. MODIFICAR: `src/components/builder/ProjectSettings.tsx`

Agregar seccion "Motor de IA" con:
- Campo para seleccionar modelo de Ollama (ej: llama3, mistral, gpt-oss)
- Indicador de estado: "Ollama conectado" / "Solo motor de reglas"
- Toggle para habilitar/deshabilitar el boost con Ollama

### 7. MODIFICAR: `src/types/builder.ts`

Agregar tipo `AIProvider` al BuilderResponse:
```text
provider?: "rules" | "ollama"
```

## Detalles Tecnicos

### Prompt de Clasificacion para Ollama

```text
Eres el clasificador de intents de DOKU, un generador de sitios web en espanol.
Dado el mensaje del usuario, clasifica en uno de estos intents:
- landing: Pagina de presentacion general
- restaurant: Restaurante o cafeteria
- ecommerce: Tienda online
- portfolio: Portfolio de trabajos
- blog: Blog o revista
- fitness: Gimnasio o centro fitness
- clinic: Clinica o consultorio medico
- billing: Facturacion o sistema contable
- laundry: Lavanderia o tintoreria
- pharmacy: Farmacia
- construction: Constructora
- florist: Floristeria
- mechanic: Taller mecanico
- printing: Imprenta
[... todos los intents]

Responde SOLO con JSON valido, sin texto adicional:
{"intent":"nombre","confidence":0.0-1.0,"entities":{"businessName":"","sections":[],"colorScheme":"","industry":""}}
```

### Llamada a Ollama Cloud desde Edge Function

```text
const response = await fetch("https://ollama.com/api/chat", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${Deno.env.get("OLLAMA_API_KEY")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "llama3",  // o el modelo que tenga el usuario
    messages: [
      { role: "system", content: classificationPrompt },
      { role: "user", content: userMessage }
    ],
    stream: false,
    format: "json"
  })
});
```

### Integracion en builder-ai/index.ts (opcion recomendada)

En lugar de crear una edge function separada, agregar la llamada a Ollama directamente dentro de la funcion `classifyIntent()`:

```text
// Despues de calcular scores con el motor de reglas:
if (bestScore.confidence < 0.6) {
  const ollamaResult = await classifyWithOllama(message, intentList);
  if (ollamaResult && ollamaResult.confidence > bestScore.confidence) {
    // Usar la clasificacion de Ollama
    return { ...ollamaResult, provider: "ollama" };
  }
}
```

## Orden de Implementacion

1. Guardar `OLLAMA_API_KEY` como secret de Supabase
2. Agregar funcion `classifyWithOllama()` en `builder-ai/index.ts`
3. Integrar en el flujo de `classifyIntent()` cuando confianza < 60%
4. Actualizar tipos en `builder.ts`
5. Agregar indicador de proveedor en la respuesta
6. Agregar seccion de configuracion de Ollama en ProjectSettings
7. Deploy y pruebas

## Beneficios

- Solo Ollama, sin dependencia de otros proveedores
- Tu API key accede a modelos cloud de Ollama directamente desde el Edge Function
- Sin bridge del navegador, sin complejidad extra
- Motor de reglas sigue siendo primera linea (rapido, sin costo)
- Ollama solo se invoca cuando el motor de reglas tiene baja confianza
- Degradacion elegante: si Ollama falla, el motor de reglas sigue funcionando

