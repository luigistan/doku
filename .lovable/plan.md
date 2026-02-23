

## Plan: Agregar `num_thread: 4` a los parametros de Ollama

### Contexto

Los parametros de produccion ya estan casi todos aplicados (`temperature: 0.3`, `top_p: 0.9`, `num_ctx: 4096`, `repeat_penalty: 1.12`). Solo falta **`num_thread: 4`** para aprovechar los 4 CPU del servidor Render.

### Cambio en `supabase/functions/builder-ai/index.ts`

**Linea 1972 - Agregar `num_thread: 4` a las opciones de Ollama:**

```typescript
// ANTES
options: {
  temperature: 0.3,
  top_p: 0.9,
  num_ctx: 4096,
  repeat_penalty: 1.12,
  num_predict: maxTokens,
}

// DESPUES
options: {
  temperature: 0.3,
  top_p: 0.9,
  num_ctx: 4096,
  repeat_penalty: 1.12,
  num_predict: maxTokens,
  num_thread: 4,
}
```

### Sobre la arquitectura

La arquitectura que describes ya esta implementada correctamente:

- **Frontend (React+TS)** nunca llama a Ollama directo
- **Frontend -> Supabase Edge Function (builder-ai) -> Ollama** es el flujo actual
- La edge function valida, arma el prompt con contexto, llama a Ollama y devuelve la respuesta
- El modelo se lee de `OLLAMA_MODEL` env var con fallback a `llama3.1:8b`

No se necesita crear un endpoint `/api/ai` separado porque la edge function `builder-ai` ya cumple ese rol exacto.

### Resumen

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` linea 1972 | Agregar `num_thread: 4` |

Redesplegar edge function despues del cambio.

