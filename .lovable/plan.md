
# Plan: Corregir Endpoints de Ollama API

## Problema

Los logs muestran que Ollama falla en todos los endpoints:
- `https://api.ollama.com/v1/chat/completions` -> **401 unauthorized** (dominio incorrecto)
- `https://ollama.com/api/chat` -> **404 model 'llama3.1:8b' not found** (modelo no existe en la nube)
- `https://ollama-doku.onrender.com` -> tambien fallo

## Causa Raiz

Segun la documentacion oficial de Ollama:

1. **El dominio `api.ollama.com` no existe.** El correcto es `ollama.com`
2. **La ruta OpenAI-compatible es `/v1/chat/completions`** (no bajo `api.ollama.com`)
3. **La ruta nativa de Ollama es `/api/chat`** (esta correcta pero el modelo `llama3.1:8b` no existe en la nube de Ollama)

### Endpoints correctos segun documentacion oficial:
- **Nativo Ollama Cloud:** `https://ollama.com/api/chat`
- **OpenAI-compatible Cloud:** `https://ollama.com/v1/chat/completions`

## Cambios en `supabase/functions/builder-ai/index.ts`

### 1. Corregir array de endpoints (lineas 989-992)

Cambiar de:
```text
{ url: "https://api.ollama.com/v1/chat/completions", format: "openai" },
{ url: "https://ollama.com/api/chat", format: "ollama" },
```

A:
```text
{ url: "https://ollama.com/v1/chat/completions", format: "openai" },
{ url: "https://ollama.com/api/chat", format: "ollama" },
```

### 2. Corregir modelo por defecto (linea 998)

El modelo por defecto debe ser `llama3` (sin version especifica) ya que `llama3.1:8b` no esta disponible en Ollama Cloud:

```text
const selectedModel = modelOverride || Deno.env.get("LLM_MODEL") || "llama3";
```

Esto ya esta correcto en el codigo, pero el usuario puede haber configurado `llama3.1:8b` en los secrets `LLM_MODEL` o en el UI de ProjectSettings. Se debe verificar que el default en ProjectSettings tambien sea `llama3`.

### 3. Corregir ruta del LLM_BASE_URL custom (linea 1084)

Actualmente hace:
```text
fetch(`${llmBaseUrl}/chat/completions`, ...)
```

Si `LLM_BASE_URL` es algo como `https://ollama-doku.onrender.com`, la ruta correcta depende del formato:
- Para OpenAI-compatible: `${llmBaseUrl}/v1/chat/completions`
- Para nativo Ollama: `${llmBaseUrl}/api/chat`

Cambiar para intentar ambos formatos con el `LLM_BASE_URL` custom, primero OpenAI-compatible y luego nativo.

### 4. Verificar modelo en ProjectSettings

En `src/components/builder/ProjectSettings.tsx`, el default del modelo ya es `llama3`. Solo confirmar que no haya referencia a `llama3.1:8b`.

## Resumen de cambios

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` | Corregir URL de `api.ollama.com` a `ollama.com`, mejorar fallback de LLM_BASE_URL con ambas rutas |
| Deploy | Redesplegar edge function |

## Resultado esperado

- El endpoint OpenAI-compatible (`ollama.com/v1/chat/completions`) responde correctamente con el API key
- Si falla, el nativo (`ollama.com/api/chat`) actua como segundo intento
- Si ambos fallan, el `LLM_BASE_URL` custom intenta con las rutas correctas
- El modelo por defecto es `llama3` que si existe en Ollama Cloud
