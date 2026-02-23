
## Plan: Cambiar de llama3.1:70b a llama3.1:8b

### Contexto

El secret `LLM_MODEL` en Supabase ya deberia tener el valor correcto (`llama3.1:8b`), pero el codigo tiene `llama3.1:70b` como fallback default y parametros optimizados para el 70b. Hay que revertir a valores apropiados para el 8b.

### Cambios en `supabase/functions/builder-ai/index.ts`

| Linea | Antes | Despues |
|-------|-------|---------|
| 1952 | Comentario "70b" | Comentario "8b" |
| 1953 | `maxTokens = 500` | `maxTokens = 300` |
| 1956 | `"llama3.1:70b"` | `"llama3.1:8b"` |
| 1972 | Timeouts 120s/45s | Timeouts 60s/30s |
| 2233 | Comentario "70b, 120s, 4000 tokens" | Comentario "8b, 60s, 2000 tokens" |
| 2235 | `callLLMShort(systemPrompt, 4000)` | `callLLMShort(systemPrompt, 2000)` |
| 2238 | Umbral `500` chars | Umbral `200` chars |

### System prompt

El prompt enriquecido actual (secciones, SVGs, animaciones, Unsplash) se mantiene -- llama3.1:8b puede seguir instrucciones razonablemente bien. Solo se reducen tokens y timeouts para ser realistas con la velocidad y capacidad del 8b.

### Despues

Redesplegar la edge function `builder-ai`.
