

## Plan: Optimizar edge function para llama3.1:70b

### Contexto

llama3.1:70b es un modelo de 70 mil millones de parametros -- un salto enorme desde el 8b. Es capaz de generar HTML completo, complejo y de alta calidad en un solo paso. Los parametros actuales estan configurados para el modelo 8b y limitan innecesariamente al 70b.

### Cambios en `supabase/functions/builder-ai/index.ts`

**1. Actualizar modelo default y comentarios (lineas 1952, 1956)**
- Comentario: "Optimized for llama3.1:70b"
- Modelo default: `"llama3.1:8b"` a `"llama3.1:70b"`

**2. Aumentar parametros para aprovechar el 70b (lineas 1967-1973)**
- `num_predict`: mantener dinamico pero subir el default de 300 a 500 para snippets
- Timeout: 45s para snippets, 120s para generacion completa (el 70b es mas lento que el 8b pero genera mucho mejor contenido)
- Remover `stop` sequences para snippets tambien -- el 70b sabe cuando parar

**3. Mejorar el system prompt para generacion HTML completa (lineas 2113-2127)**

El 70b puede seguir instrucciones mucho mas detalladas. Enriquecer el prompt con:
- Pedir secciones especificas con contenido real (no lorem ipsum)
- Pedir animaciones CSS y transiciones
- Pedir iconos SVG inline o de Lucide via CDN
- Pedir estructura semantica (header, main, footer, nav)
- Especificar que use imagenes relevantes de Unsplash con parametros de busqueda adecuados

**4. Aumentar tokens para generacion completa (linea 2218)**

Cambiar la llamada de generacion HTML de `2000` a `4000` tokens. El 70b puede generar paginas mas completas y detalladas.

**5. Subir el umbral de aceptacion de HTML (linea 2221)**

Cambiar el minimo de `200` a `500` caracteres. Con el 70b, si genera menos de 500 chars probablemente algo salio mal y es mejor usar el fallback hibrido.

### Resumen de cambios

Un solo archivo: `supabase/functions/builder-ai/index.ts`

| Linea | Cambio |
|-------|--------|
| 1952 | Comentario actualizado a 70b |
| 1956 | Modelo default: `llama3.1:70b` |
| 1967-1973 | `num_predict` default 500, timeouts 45s/120s, sin stop sequences |
| 2113-2127 | System prompt enriquecido con instrucciones detalladas |
| 2216 | Comentario actualizado |
| 2218 | `callLLMShort(systemPrompt, 4000)` |
| 2221 | Umbral minimo de 200 a 500 chars |

Despues de los cambios, redesplegar la edge function `builder-ai`.

