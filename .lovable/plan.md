

# Plan: IA Autonoma Completa sin APIs Externas

## Resumen

Convertir el sistema actual de keywords en una IA autonoma real con 3 capacidades nuevas: **TF-IDF vectorial** (entender semantica sin embeddings externos), **memoria conversacional** (entender seguimiento), y **auto-entrenamiento funcional** (el feedback loop actual no esta grabando datos).

---

## Problema Actual

1. **El feedback loop no funciona**: Todos los registros en `ai_learning_logs` tienen `user_accepted = NULL` -- el sistema graba la interaccion pero nunca actualiza si el usuario acepto o rechazo
2. **Sin comprension semantica**: "lugar para comer" no matchea con "restaurant" porque no hay relacion semantica, solo keywords
3. **Sin memoria de conversacion**: Si el usuario dice "hazme un restaurante" y luego "cambia el color a azul", el sistema no entiende el contexto
4. **Sin generalizacion**: No puede inferir que "negocio de comida callejera" es similar a "restaurant"

## Solucion: 3 Modulos de IA Autonoma

### Modulo 1: Motor TF-IDF Vectorial (Comprension Semantica)

En vez de comparar keywords exactos, el sistema calculara vectores TF-IDF para cada mensaje y los comparara con vectores pre-calculados de cada intent. Esto permite entender que "lugar para comer algo rico" es semanticamente cercano a "restaurant" sin necesidad de que la palabra "restaurant" aparezca.

**Como funciona:**
- Se pre-calcula un "documento virtual" para cada intent usando sus keywords, bigrams, y descripciones
- Cuando llega un mensaje, se calcula su vector TF-IDF
- Se compara con coseno de similitud contra todos los intents
- El intent con mayor similitud gana

**Vocabulario expandido por intent:**
- restaurant: "comida, comer, alimento, plato, gastronomia, sabor, cocina, chef, mesa, reserva, delivery..."
- ecommerce: "vender, comprar, producto, precio, oferta, envio, tienda, catalogo, pago..."
- Cada intent tendra 30-50 terminos semanticos relacionados

### Modulo 2: Memoria Conversacional

Agregar capacidad de entender mensajes de seguimiento en el contexto de una conversacion:

- Almacenar el ultimo intent y entities detectados en la sesion
- Si el usuario dice "cambia el color a azul" sin mencionar un tipo de sitio, el sistema usara el intent anterior
- Patrones de seguimiento: "cambia X", "agrega Y", "quita Z", "ponle...", "hazlo mas..."
- El cliente enviara `previousIntent` y `previousEntities` a la edge function

### Modulo 3: Auto-entrenamiento Funcional

Arreglar el feedback loop y agregar aprendizaje por refuerzo:

- **Bug fix**: El `logInteraction()` del cliente esta enviando el `logId` correctamente pero la edge function necesita la ruta de feedback funcional -- verificar y arreglar el flujo completo
- **Peso por feedback**: Interacciones con `user_accepted = true` tendran 3x mas peso en la clasificacion
- **Negative learning**: Interacciones rechazadas (`user_accepted = false`) penalizaran ese intent para mensajes similares
- **Auto-seed**: Pre-cargar 50+ interacciones base en `ai_learning_logs` con `user_accepted = true` para que el sistema tenga conocimiento inicial

---

## Seccion Tecnica

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` | Agregar motor TF-IDF, memoria conversacional, negative learning, expandir vocabulario semantico por intent |
| `src/hooks/useBuilderState.ts` | Enviar `previousIntent`/`previousEntities` en cada request, arreglar flujo de feedback |
| `src/services/builderService.ts` | Agregar parametro de contexto previo a `generateSite()` |
| `src/types/builder.ts` | Agregar tipos para contexto conversacional |
| `supabase/migrations/` | INSERT de seed data con 50+ interacciones base pre-aceptadas |

### Motor TF-IDF - Detalle Tecnico

```text
1. Construir vocabulario global (union de todos los terminos de todos los intents)
2. Para cada intent, crear "documento virtual" con sus terminos semanticos
3. Calcular IDF: log(N / df) donde N = num intents, df = cuantos intents contienen el termino
4. Para mensaje del usuario:
   a. Tokenizar
   b. Calcular TF de cada token
   c. Multiplicar TF * IDF = vector del mensaje
   d. Calcular coseno de similitud con cada intent
   e. El mayor coseno = intent mas probable
```

Esto es la misma matematica que usan los motores de busqueda clasicos, implementada en TypeScript puro dentro de la edge function. Zero dependencias externas.

### Memoria Conversacional - Flujo

```text
Usuario: "hazme un restaurante mexicano"
  -> intent: restaurant, entities: {businessName: "Mi Restaurante", colorScheme: "warm"}
  -> Se guarda como previousContext

Usuario: "cambia el color a azul"
  -> Detecta patron de seguimiento ("cambia...")
  -> No encuentra intent nuevo fuerte
  -> Usa previousContext.intent = restaurant
  -> Modifica solo colorScheme = "blue"
  -> Regenera el sitio con el cambio
```

### Seed Data - Ejemplos de Pre-carga

Se insertaran 50+ registros en `ai_learning_logs` con patrones comunes ya aceptados:

```text
"quiero una pagina para mi negocio" -> landing (accepted)
"hazme una tienda para vender ropa" -> ecommerce (accepted)
"necesito un sitio para mi restaurante" -> restaurant (accepted)
"pagina de mi barberia" -> salon (accepted)
"sitio web para mi gimnasio" -> fitness (accepted)
"quiero mostrar mis fotos" -> portfolio (accepted)
"pagina para mi consultorio dental" -> clinic (accepted)
...50+ mas cubriendo variaciones naturales
```

### Negative Learning

```text
1. Al clasificar, consultar logs con user_accepted = false
2. Si el mensaje actual es similar (Jaccard > 0.5) a uno rechazado:
   a. Penalizar el intent que fue rechazado (-3 puntos)
   b. Si el usuario dio feedback ("era para X"), boost al intent correcto
3. Esto permite que el sistema corrija errores automaticamente
```

### Sin APIs externas

- TF-IDF: implementado en TypeScript puro (40 lineas de codigo)
- Coseno de similitud: formula matematica basica
- Memoria: estado en el cliente + parametro en la request
- Auto-aprendizaje: queries SQL a `ai_learning_logs`
- Costo: $0.00 -- todo corre en la edge function existente

