

# Plan: Corregir modelo de Ollama Cloud

## Problema

`gemma3` es un modelo LOCAL de Ollama, no esta disponible en Ollama Cloud (`ollama.com/api`). Por eso ambos endpoints devuelven 404: `"model 'gemma3' not found"`.

Segun la documentacion oficial de Ollama, los modelos cloud disponibles son:
- `gpt-oss:120b` y `gpt-oss:20b` (proposito general)
- `glm-4.7:cloud` (alto rendimiento)
- `minimax-m2.1:cloud` (rapido)

## Solucion

Cambiar el modelo default a `gpt-oss:20b` (modelo cloud real, proposito general, bueno para generar HTML) y actualizar los aliases para que todo apunte a modelos cloud validos.

## Cambios

### 1. `supabase/functions/builder-ai/index.ts`

En la funcion `callOllama` (~linea 378-393):

- Cambiar default de `"gemma3"` a `"gpt-oss:20b"`
- Actualizar `modelAliases` para mapear modelos locales a cloud:

```typescript
let selectedModel = modelOverride || Deno.env.get("LLM_MODEL") || "gpt-oss:20b";

const modelAliases: Record<string, string> = {
  "llama3": "gpt-oss:20b",
  "llama3.1": "gpt-oss:20b",
  "llama3.2": "gpt-oss:20b",
  "llama3.3": "gpt-oss:20b",
  "llama2": "gpt-oss:20b",
  "gemma3": "gpt-oss:20b",
  "qwen3": "gpt-oss:20b",
};
```

- IMPORTANTE: Eliminar la normalizacion que quita el `:` del modelo (lineas 381-385), porque los modelos cloud usan `:` como parte del nombre (`gpt-oss:20b`, `glm-4.7:cloud`).

### 2. `src/components/builder/ProjectSettings.tsx`

- Actualizar default de `"gemma3"` a `"gpt-oss:20b"` en el estado inicial
- Actualizar placeholder del input

### 3. `src/services/builderService.ts`

- Actualizar default de `"gemma3"` a `"gpt-oss:20b"`

### 4. Deploy

Redesplegar `builder-ai`.

## Seccion tecnica

| Archivo | Cambio |
|---|---|
| `supabase/functions/builder-ai/index.ts` | Default `gpt-oss:20b`, eliminar normalizacion de `:`, aliases actualizados |
| `src/components/builder/ProjectSettings.tsx` | Default y placeholder `gpt-oss:20b` |
| `src/services/builderService.ts` | Default `gpt-oss:20b` |

## Modelos cloud alternativos

Si `gpt-oss:20b` no funciona bien, se puede cambiar a:
- `gpt-oss:120b` (mas potente, mas lento)
- `glm-4.7:cloud` (alto rendimiento)
- `minimax-m2.1:cloud` (rapido)

