

## Plan: Arreglar la generacion de HTML truncado por Ollama

### Problema raiz

Ollama esta funcionando correctamente. El log confirma:
```
[Full LLM] HTML generated successfully (759 chars)
```

Pero 759 caracteres es un HTML roto/incompleto (solo un fondo morado sin contenido). La causa es la linea 1979 en `callLLMShort`:

```typescript
num_predict: Math.min(maxTokens, 200),
```

Cuando el handler principal llama `callLLMShort(systemPrompt, 2000)` para generar HTML completo, el cap de 200 tokens trunca la respuesta. Un sitio completo necesita al menos 1500-2000 tokens.

### Solucion

#### 1. Quitar el cap de 200 en `callLLMShort` (linea 1979)

Cambiar de:
```typescript
num_predict: Math.min(maxTokens, 200),
```
A:
```typescript
num_predict: maxTokens,
```

Esto permite que las llamadas de enrichment cortas sigan pidiendo 60-80 tokens (como antes), pero la llamada de generacion completa pueda pedir los 2000 que necesita.

#### 2. Aumentar el timeout para llamadas largas (linea 1983)

Para generar HTML completo con 2000 tokens, Ollama en Render necesita mas tiempo. Cambiar el timeout a ser proporcional:

```typescript
signal: AbortSignal.timeout(maxTokens > 500 ? 300000 : 150000),
```

- Enrichment (60-80 tokens): 150s (igual que ahora)
- Full HTML (2000 tokens): 300s (5 min)

Nota: El limite de Supabase Edge Functions es ~400s, asi que 300s esta dentro del margen.

#### 3. Mejorar el fallback hibrido (linea 2384)

Si la generacion completa falla o es demasiado corta, el sistema ya cae al fallback hibrido (`composeReactHtml`). Pero el threshold de 200 chars es muy bajo. Subirlo a 500:

```typescript
if (extractedHtml && extractedHtml.length > 500) {
```

Esto asegura que si Ollama genera HTML truncado, el sistema use el template local (que siempre funciona).

#### 4. Actualizar el mensaje de espera en el frontend

Cambiar el texto de "1-2 minutos" a "2-4 minutos" ya que la generacion completa tarda mas.

**Archivo:** `src/hooks/useBuilderState.ts`

### Resumen de archivos

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` linea 1979 | Quitar cap de 200 tokens: `num_predict: maxTokens` |
| `supabase/functions/builder-ai/index.ts` linea 1983 | Timeout proporcional: 300s para HTML completo, 150s para enrichment |
| `supabase/functions/builder-ai/index.ts` linea 2384 | Subir threshold de validacion de 200 a 500 chars |
| `src/hooks/useBuilderState.ts` | Actualizar mensaje de espera a "2-4 minutos" |

### Resultado esperado

Con estos cambios:
- Ollama genera HTML completo (~2000 tokens, ~6000+ chars)
- Si Ollama tarda demasiado o genera HTML truncado, el fallback hibrido genera el sitio con templates locales (siempre funciona)
- El usuario ve un mensaje de espera realista

