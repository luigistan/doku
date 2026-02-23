

# Plan: Corregir Ollama API - Eliminar servidor muerto y sanitizar modelo

## Problemas identificados en los logs

1. **Modelo `llama3.1:8b` sigue enviandose** desde el localStorage del frontend como `modelOverride`, y los endpoints de Ollama Cloud devuelven `404 model not found`
2. **`LLM_BASE_URL` apunta a `ollama-doku.onrender.com`** que ya no existe - causa intentos innecesarios que siempre fallan con 404
3. **No hay sanitizacion del modelo** recibido del frontend

## Cambios propuestos

### Archivo: `supabase/functions/builder-ai/index.ts`

#### 1. Sanitizar modelo recibido (linea 998)

Agregar normalizacion del modelo antes de usarlo. Si el modelo tiene un tag de version como `:8b`, `:70b`, etc., quitarlo porque Ollama Cloud no los soporta:

```typescript
let selectedModel = modelOverride || Deno.env.get("LLM_MODEL") || "llama3";
// Ollama Cloud no soporta tags de version como :8b, :70b - usar modelo base
if (selectedModel.includes(":")) {
  const baseModel = selectedModel.split(":")[0];
  console.log(`[Ollama] Normalizing model "${selectedModel}" -> "${baseModel}"`);
  selectedModel = baseModel;
}
```

#### 2. Eliminar bloque de `LLM_BASE_URL` (lineas 1079-1153)

Eliminar completamente el bloque que intenta conectarse al `LLM_BASE_URL` custom (el servidor de Render que ya no existe). La conexion a Ollama es solo por API Cloud con los endpoints oficiales `ollama.com`.

Si en el futuro se necesita un servidor self-hosted, se puede re-agregar. Pero ahora solo genera errores y retrasos.

#### 3. Tambien sanitizar el modelo en el bloque principal (linea 998)

Aplicar la misma normalizacion en la linea donde se define `selectedModel` dentro del loop de endpoints.

### Archivo: `src/components/builder/ProjectSettings.tsx`

Verificar que el modelo por defecto sea `llama3` y agregar una nota indicando que no se deben usar tags de version (`:8b`, `:70b`).

### Deploy

Redesplegar edge function `builder-ai` despues de los cambios.

## Seccion tecnica

| Archivo | Lineas | Cambio |
|---------|--------|--------|
| `supabase/functions/builder-ai/index.ts` | 998 | Agregar sanitizacion de modelo (quitar `:8b` etc.) |
| `supabase/functions/builder-ai/index.ts` | 1079-1153 | Eliminar bloque completo de `LLM_BASE_URL` / servidor custom |
| `src/components/builder/ProjectSettings.tsx` | - | Verificar default `llama3` |
| Deploy | - | Redesplegar `builder-ai` |

## Resultado esperado

- Ollama Cloud recibe `llama3` o `llama3.1` (sin `:8b`) y responde correctamente
- No se intenta conectar al servidor muerto de Render
- Menos latencia al eliminar intentos fallidos innecesarios
- Los endpoints correctos `ollama.com/v1/chat/completions` y `ollama.com/api/chat` funcionan con el modelo normalizado

