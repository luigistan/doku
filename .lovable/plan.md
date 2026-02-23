
## Plan: Sistema de Machine Learning Adaptativo para DOKU AI

### Contexto actual

El sistema ya tiene una base de ML con 91 interacciones logueadas (70 aceptadas, 2 rechazadas, 19 pendientes). Tiene 7 senales de clasificacion (phrase patterns, verb-intent, keywords, TF-IDF, dynamic keywords, few-shot, negative learning). Pero hay areas clave donde se puede hacer mucho mas inteligente:

---

### 1. Prompt Engineering mejorado para Ollama (entender al usuario)

**Problema:** Ollama recibe un prompt generico que no le da contexto sobre como interpretar lo que el usuario pide. No entiende mensajes ambiguos como "hazme algo para vender ropa" o "necesito una pagina para mi negocio de comida".

**Solucion:** Agregar un paso de "intent refinement" con Ollama ANTES de la clasificacion por reglas. Se envia el mensaje del usuario a Ollama con un prompt especifico pidiendo que extraiga: tipo de negocio, nombre, secciones y color. Esto complementa la clasificacion por reglas.

```
Prompt para Ollama:
"Analiza este mensaje de un usuario que quiere crear un sitio web.
Extrae en formato JSON: {intent, businessName, sections, color}
Intents validos: landing, restaurant, portfolio, blog, dashboard, ecommerce, fitness, agency, clinic, realestate, education, veterinary, hotel, lawyer, accounting, photography, music, salon, technology
Mensaje: [mensaje del usuario]"
```

Si Ollama responde con un intent, se usa como SENAL 8 en el clasificador con un peso alto (boost de 6).

**Archivo:** `supabase/functions/builder-ai/index.ts`

---

### 2. Weighted Learning: pesos adaptativos por frecuencia de aceptacion

**Problema:** El sistema trata todas las interacciones aceptadas igual. Si un usuario acepto "crea un restaurante" 9 veces, deberia pesar mucho mas que un intent con 2 aceptaciones.

**Solucion:** Calcular un "intent confidence boost" basado en la tasa de aceptacion historica por intent:

```
acceptanceRate[intent] = accepted[intent] / total[intent]
frequencyBoost[intent] = log(accepted[intent] + 1) * acceptanceRate
```

Este boost se aplica como SENAL 8.5 en el clasificador, multiplicando el score del intent por `1 + frequencyBoost * 0.3`.

**Archivo:** `supabase/functions/builder-ai/index.ts`

---

### 3. Contexto conversacional con memoria de sesion

**Problema:** El sistema solo guarda `previousIntent` y `previousEntities` pero no una verdadera memoria de la conversacion. Si el usuario dice "ahora hazlo azul" no sabe a que se refiere a menos que sea un follow-up inmediato.

**Solucion:** Guardar los ultimos 3 turnos de conversacion (usuario + respuesta del sistema) y enviarlos como contexto tanto al clasificador como a Ollama. Esto permite:

- Entender "cambialo" sin especificar que
- Recordar el nombre del negocio entre turnos
- Detectar cambios incrementales vs nuevas solicitudes

Se agrega un campo `conversationHistory` al body del request con los ultimos mensajes.

**Archivos:**
- `supabase/functions/builder-ai/index.ts` - recibir y usar el historial
- `src/hooks/useBuilderState.ts` - enviar los ultimos 3 mensajes como contexto

---

### 4. Auto-evaluacion de calidad del HTML generado

**Problema:** No hay forma de saber si el HTML que Ollama genero es bueno o malo, solo se valida por longitud (>500 chars).

**Solucion:** Agregar validaciones semanticas del HTML generado:

| Validacion | Criterio | Accion si falla |
|-----------|----------|-----------------|
| Tiene `<header>` | Estructura basica | Fallback hibrido |
| Tiene `<main>` | Contenido principal | Fallback hibrido |
| Tiene el nombre del negocio | Personalizacion | Inyectar nombre |
| No tiene "Lorem ipsum" | Contenido real | Regenerar con fallback |
| Tiene al menos 2 `<section>` | Secciones requeridas | Fallback hibrido |
| No tiene `undefined` o `null` como texto | Errores de template | Limpiar o fallback |

Si 2+ validaciones fallan, se usa el fallback hibrido automaticamente.

**Archivo:** `supabase/functions/builder-ai/index.ts`

---

### 5. Tabla de "entity memory" para recordar negocios del usuario

**Problema:** Si el usuario ya creo "Cafeteria El Buen Cafe" y vuelve a pedir cambios, el sistema no recuerda las entidades previas.

**Solucion:** Crear una tabla `user_entity_memory` que guarde las entidades extraidas por proyecto. Cuando el usuario envia un nuevo mensaje en el mismo proyecto, se consultan las entidades previas y se usan como contexto.

Tabla nueva:
```sql
CREATE TABLE user_entity_memory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  intent text NOT NULL,
  business_name text,
  sections text[],
  color_scheme text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

Al generar un sitio exitosamente, se guarda/actualiza la fila. Al recibir un nuevo mensaje en el mismo proyecto, se carga como contexto.

**Archivos:**
- Migracion SQL para la nueva tabla
- `supabase/functions/builder-ai/index.ts` - leer/escribir entity memory
- `src/services/builderService.ts` - enviar `projectId` al edge function
- `src/hooks/useBuilderState.ts` - pasar projectId

---

### 6. Feedback loop mejorado: aprendizaje de los rechazos

**Problema:** Solo hay 2 rechazos registrados y el sistema no pregunta POR QUE rechazo el usuario. Necesita mas datos para aprender de los errores.

**Solucion:** Cuando el usuario hace click en "Ajustar", mostrar opciones rapidas de lo que estuvo mal:

- "El tipo de sitio no es correcto"
- "El nombre del negocio esta mal"
- "Faltan secciones"
- "Los colores no me gustan"
- "Otra cosa" (texto libre)

Esta informacion se guarda en `user_feedback` del learning log como JSON estructurado, y el sistema la usa para ajustar pesos de clasificacion futura.

**Archivos:**
- `src/components/builder/ChatPanel.tsx` - opciones de feedback
- `src/hooks/useBuilderState.ts` - enviar feedback detallado
- `src/types/builder.ts` - tipo para feedback estructurado
- `supabase/functions/builder-ai/index.ts` - usar feedback en negative learning

---

### Resumen de archivos

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` | Senal 8 (Ollama refinement), pesos adaptativos, validacion HTML, entity memory, feedback mejorado |
| `src/hooks/useBuilderState.ts` | Enviar historial conversacional, projectId, feedback detallado |
| `src/services/builderService.ts` | Agregar projectId y conversationHistory al request |
| `src/types/builder.ts` | Tipo FeedbackData |
| `src/components/builder/ChatPanel.tsx` | Botones de feedback rapido al rechazar |
| Migracion SQL | Tabla `user_entity_memory` |

### Prioridad de implementacion

1. Validacion de calidad HTML (impacto inmediato, evita sitios rotos)
2. Ollama intent refinement (hace la clasificacion mas inteligente)
3. Weighted learning (aprovecha los 91 logs existentes)
4. Entity memory por proyecto (mejora follow-ups)
5. Historial conversacional (mejora contexto multi-turno)
6. Feedback loop mejorado (mejora aprendizaje a largo plazo)
