

# Plan: Usar modelo real de Ollama Cloud

## Problema

`llama3` no existe en Ollama Cloud. Los logs siguen mostrando 404 porque estamos mapeando todo a un modelo inexistente. La lista de modelos cloud disponibles incluye: `qwen3`, `gemma3`, `deepseek-v3.1`, `qwen3-coder`, entre otros.

## Solucion

Cambiar el modelo default a `gemma3` (ligero, gratuito, multilenguaje) y actualizar el mapa de aliases para que todas las variantes de llama apunten a un modelo que si existe.

## Cambios

### 1. `supabase/functions/builder-ai/index.ts` (linea 998-1014)

```typescript
// Antes
let selectedModel = modelOverride || Deno.env.get("LLM_MODEL") || "llama3";
const modelAliases: Record<string, string> = {
  "llama3.1": "llama3",
  "llama3.2": "llama3",
  "llama3.3": "llama3",
  "llama2": "llama3",
};

// Despues
let selectedModel = modelOverride || Deno.env.get("LLM_MODEL") || "gemma3";
const modelAliases: Record<string, string> = {
  "llama3": "gemma3",
  "llama3.1": "gemma3",
  "llama3.2": "gemma3",
  "llama3.3": "gemma3",
  "llama2": "gemma3",
};
```

### 2. `src/components/builder/ProjectSettings.tsx`

Actualizar el default del estado de `ollamaConfig` de `"llama3"` a `"gemma3"` y actualizar el placeholder del input.

### 3. `src/types/builder.ts`

Sin cambios (la interfaz `OllamaConfig` no necesita modificacion).

### 4. Deploy

Redesplegar edge function `builder-ai`.

## Seccion tecnica

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` | Default `gemma3`, aliases de llama -> `gemma3` |
| `src/components/builder/ProjectSettings.tsx` | Default config `gemma3`, placeholder actualizado |
| Deploy | Redesplegar `builder-ai` |

## Modelos alternativos disponibles en Ollama Cloud

Si `gemma3` no funciona, se puede probar con `qwen3` o `qwen3-coder` como respaldo.

## Resultado esperado

- Ollama Cloud responde correctamente con `gemma3` (modelo real y disponible)
- Usuarios con `llama3.1:8b` en localStorage se normalizan automaticamente a `gemma3`
- El clasificador AI funciona como fallback cuando el motor de reglas tiene baja confianza

