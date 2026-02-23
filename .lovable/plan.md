

## Plan: Parametros de produccion para Ollama + llama3.1:8b

### Cambios en `supabase/functions/builder-ai/index.ts`

**1. Actualizar opciones del modelo Ollama (lineas 1963-1971)**

Reemplazar las opciones actuales con los parametros de produccion optimizados:

```typescript
// ANTES
options: {
  num_predict: maxTokens,
  temperature: 0.7,
}

// DESPUES
options: {
  temperature: 0.3,
  top_p: 0.9,
  num_ctx: 4096,
  repeat_penalty: 1.12,
  num_predict: maxTokens,
}
```

- `temperature: 0.3` - menos inventos, mas consistente
- `top_p: 0.9` - muestreo nucleus controlado
- `num_ctx: 4096` - buen contexto sin saturar RAM
- `repeat_penalty: 1.12` - evita respuestas repetitivas
- `num_predict` se mantiene dinamico via `maxTokens`

**2. Actualizar maxTokens default (linea 1953)**

Cambiar de `300` a `512` para alinearse con `num_predict: 512` recomendado:

```typescript
async function callLLMShort(prompt: string, maxTokens = 512)
```

**3. Variable de entorno del modelo (linea 1956)**

Cambiar `LLM_MODEL` a `OLLAMA_MODEL` como variable de entorno principal, con fallback:

```typescript
const model = Deno.env.get("OLLAMA_MODEL") || Deno.env.get("LLM_MODEL") || "llama3.1:8b";
```

Asi se alinea con la variable `OLLAMA_MODEL` configurada en Render.

### Resumen

| Linea | Cambio |
|-------|--------|
| 1953 | maxTokens default: 300 -> 512 |
| 1956 | Variable de entorno: `OLLAMA_MODEL` con fallback a `LLM_MODEL` |
| 1963-1971 | Opciones de produccion: temperature 0.3, top_p 0.9, num_ctx 4096, repeat_penalty 1.12 |

Redesplegar edge function `builder-ai` despues de los cambios.
