

# Plan: Configurar Ollama Cloud paso a paso

## Problema actual

El sistema no funciona porque falta la pieza clave: **no hay API key de Ollama configurada**. La edge function verifica `OLLAMA_API_KEY` y al no encontrarla, siempre devuelve el mensaje de error "motor de IA no disponible".

## Paso 1: Agregar el secreto OLLAMA_API_KEY

Necesitas crear una API key en tu cuenta de Ollama:
1. Ve a https://ollama.com/settings/keys
2. Crea una nueva API key
3. Lovable te pedira que la pegues como secreto de Supabase

## Paso 2: Corregir los endpoints de la API en la edge function

Segun la documentacion oficial de Ollama, los endpoints correctos para Ollama Cloud son:

| Actual (incorrecto) | Correcto (segun docs) |
|---|---|
| `https://ollama.com/v1/chat/completions` | `https://ollama.com/api/chat` |
| `https://ollama.com/api/chat` | Ya existe, mantener |

La respuesta de `/api/chat` (no-streaming) tiene este formato:
```json
{
  "model": "gemma3",
  "message": { "role": "assistant", "content": "..." },
  "done": true
}
```

Cambios en `supabase/functions/builder-ai/index.ts`:
- Reordenar endpoints: probar primero `https://ollama.com/api/chat` (API nativa)
- Mantener `https://ollama.com/v1/chat/completions` como fallback (OpenAI compat)
- Agregar `stream: false` explicitamente en ambos endpoints
- Mejorar el logging para diagnostico

## Paso 3: Actualizar la UI de configuracion

En `src/components/builder/ProjectSettings.tsx`:
- Eliminar el umbral de confianza (ya no hay motor de reglas, todo va por Ollama)
- Actualizar los textos descriptivos para reflejar que Ollama es el unico motor
- Simplificar: el toggle ya no dice "respaldo", sino "Motor principal"

## Paso 4: Actualizar el servicio del cliente

En `src/services/builderService.ts`:
- Siempre enviar `ollamaModel` al edge function (ya no es condicional basado en `enabled`)
- Eliminar la lectura de `confidenceThreshold` del localStorage

## Paso 5: Deploy y test

Redesplegar la edge function `builder-ai` con los cambios.

## Seccion tecnica - Archivos a modificar

| Archivo | Cambios |
|---|---|
| Secreto `OLLAMA_API_KEY` | Agregar via herramienta de secretos de Supabase |
| `supabase/functions/builder-ai/index.ts` | Reordenar endpoints, priorizar `/api/chat`, mejorar logging |
| `src/components/builder/ProjectSettings.tsx` | Simplificar UI, eliminar umbral, actualizar textos |
| `src/services/builderService.ts` | Siempre enviar modelo, eliminar logica condicional de `enabled` |

## Resultado esperado

1. El usuario pega su OLLAMA_API_KEY
2. La edge function usa `https://ollama.com/api/chat` con Bearer auth
3. Ollama Cloud responde con el modelo `gemma3` (o el que elija el usuario)
4. El sistema genera sitios web y responde conversacionalmente via Ollama

