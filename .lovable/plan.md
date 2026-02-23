

# Plan: Corregir modelo Ollama - llama3.1 no existe en Cloud

## Problema

La normalizacion anterior quita el tag de version (`:8b`), pero el modelo resultante `llama3.1` tampoco existe en Ollama Cloud. Los logs confirman:

```
[Ollama] Normalizing model "llama3.1:8b" -> "llama3.1"
[Ollama] ollama.com/v1/chat/completions returned 404: model "llama3.1" not found
[Ollama] ollama.com/api/chat returned 404: model 'llama3.1' not found
```

## Solucion

### Archivo: `supabase/functions/builder-ai/index.ts` (lineas 998-1004)

Mejorar la normalizacion del modelo para mapear variantes conocidas al modelo base correcto:

```typescript
let selectedModel = modelOverride || Deno.env.get("LLM_MODEL") || "llama3";

// Normalizar modelo para Ollama Cloud
// 1. Quitar tags de version (:8b, :70b, :latest)
if (selectedModel.includes(":")) {
  const baseModel = selectedModel.split(":")[0];
  console.log(`[Ollama] Normalizing model "${selectedModel}" -> "${baseModel}"`);
  selectedModel = baseModel;
}
// 2. Mapear variantes que no existen en Ollama Cloud
const modelAliases: Record<string, string> = {
  "llama3.1": "llama3",
  "llama3.2": "llama3",
  "llama3.3": "llama3",
  "llama2": "llama3",
};
if (modelAliases[selectedModel]) {
  console.log(`[Ollama] Mapping model "${selectedModel}" -> "${modelAliases[selectedModel]}"`);
  selectedModel = modelAliases[selectedModel];
}
```

Esto convierte la cadena completa `llama3.1:8b` -> `llama3.1` -> `llama3`.

### Deploy

Redesplegar edge function `builder-ai`.

## Seccion tecnica

| Archivo | Lineas | Cambio |
|---------|--------|--------|
| `supabase/functions/builder-ai/index.ts` | 998-1004 | Agregar mapa de aliases de modelos para Ollama Cloud |
| Deploy | - | Redesplegar `builder-ai` |

## Resultado esperado

- `llama3.1:8b` se normaliza a `llama3` (que si existe en Ollama Cloud)
- `llama3.1` se normaliza a `llama3`
- Ollama Cloud responde correctamente con el modelo `llama3`
- El fallback a rules-only ya no sera necesario cuando Ollama este configurado

