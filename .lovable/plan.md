

## Plan: Arreglar las llamadas silenciosas a Ollama y agregar diagnostico

### Problema real

Ollama esta corriendo en Render (`https://ollama-doku.onrender.com`), los secrets estan bien (`LLM_PROVIDER`, `LLM_BASE_URL`, `LLM_MODEL`), y el codigo YA tiene la logica para usar Ollama. Pero las llamadas fallan sin dejar rastro porque:

- Linea 1983: `if (!response.ok) return null;` -- no loggea el error HTTP
- Linea 2007: `console.warn("LLM short call failed:", err);` -- solo captura excepciones, no errores HTTP
- No hay health check antes de intentar 4 llamadas paralelas
- Render tiene cold starts de 30-60 segundos, y el timeout de `callLLMShort` es 30s para prompts cortos

### Cambios en `supabase/functions/builder-ai/index.ts`

#### 1. Agregar logging detallado en `callLLM` (linea 1878)

Al inicio de la funcion, loggear que provider se esta usando:

```
console.log(`[LLM] callLLM -> provider: ${provider}, url: ${baseUrl}, model: ${model}`);
```

En el error de Ollama (linea 1895-1897), ya tiene logging -- OK.

#### 2. Arreglar `callLLMShort` (linea 1958) - el problema principal

Este es el que hace las 4 llamadas de enrichment. Cambios:

- Agregar log al inicio: `console.log("[LLM] callLLMShort -> provider: ..., url: ..., model: ...")`
- Linea 1983: cambiar `if (!response.ok) return null;` a loggear el error HTTP y el body de respuesta
- Aumentar timeout de 30s a 90s para cold starts de Render
- Aumentar timeout de 60s a 120s para prompts largos

#### 3. Health check antes del enrichment (linea 2020)

Antes de lanzar las 4 llamadas paralelas en `enrichContentWithLLM`, hacer un ping rapido a Ollama:

```typescript
// Solo para Ollama: verificar que el servidor responde
if (provider === "ollama") {
  const baseUrl = Deno.env.get("LLM_BASE_URL") || "";
  try {
    const health = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(10000)
    });
    if (!health.ok) {
      console.error(`[Ollama] Health check failed: HTTP ${health.status}`);
      return enriched;
    }
    const tags = await health.json();
    console.log(`[Ollama] Server healthy. Models available:`, JSON.stringify(tags.models?.map(m => m.name) || []));
  } catch (err) {
    console.error(`[Ollama] Server unreachable at ${baseUrl}:`, err?.message || err);
    return enriched;
  }
}
```

Esto nos dira exactamente:
- Si el servidor responde
- Que modelos tiene disponibles (si el modelo configurado realmente esta descargado)

#### 4. Loggear el error detallado en callLLMShort linea 1983

Cambiar de:
```typescript
if (!response.ok) return null;
```

A:
```typescript
if (!response.ok) {
  const errBody = await response.text().catch(() => "");
  console.error(`[Ollama] callLLMShort HTTP ${response.status}: ${errBody.substring(0, 200)}`);
  return null;
}
```

### Resumen de cambios

| Archivo | Que cambia |
|---------|-----------|
| `supabase/functions/builder-ai/index.ts` | Agregar console.log al inicio de callLLM y callLLMShort con provider/url/model |
| `supabase/functions/builder-ai/index.ts` | Loggear errores HTTP detallados en callLLMShort linea 1983 |
| `supabase/functions/builder-ai/index.ts` | Health check de Ollama antes del enrichment con lista de modelos |
| `supabase/functions/builder-ai/index.ts` | Aumentar timeouts: 30s->90s y 60s->120s para cold starts de Render |

### Resultado esperado

Despues de este cambio, cuando un usuario pida generar un sitio, los logs mostraran:

```
[LLM] callLLMShort -> provider: ollama, url: https://ollama-doku.onrender.com, model: llama3.1:8b
[Ollama] Server healthy. Models available: ["llama3.1:8b"]
[Hybrid] Starting content enrichment...
[Hybrid] Content enrichment complete: 4/4 sections enriched
```

O si falla:

```
[Ollama] Server unreachable at https://ollama-doku.onrender.com: Connection timed out
```

O:

```
[Ollama] callLLMShort HTTP 404: model "llama3.1:8b" not found
```

Esto nos permite diagnosticar el problema exacto y arreglarlo.

