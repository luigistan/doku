
## Plan: Mejoras al Motor AI, Links de Preview y Efecto "DOKU AI"

### 1. Efecto "DOKU AI" rellenandose con el progreso

**Problema actual:** El overlay de carga muestra solo "DOKU" con un gradiente que se rellena segun el porcentaje. El usuario quiere que diga "DOKU AI".

**Cambio en `src/components/builder/PreviewPanel.tsx`:**
- Cambiar el texto de "DOKU" a "DOKU AI" en el overlay de carga (linea 176)
- Mantener el mismo efecto de gradiente que rellena el texto de izquierda a derecha conforme sube el porcentaje
- Ajustar el tamano de fuente si es necesario para que "DOKU AI" se vea bien proporcionado

---

### 2. Mejorar la inteligencia del AI para que nunca asuma

**Problema actual:** El umbral de confianza es 0.3 (muy bajo). Cuando la confianza es entre 0.3 y 0.6, el sistema ejecuta sin preguntar, lo que puede generar sitios incorrectos.

**Cambios en `supabase/functions/builder-ai/index.ts`:**

**A. Subir el umbral de clarificacion**
- Cambiar el umbral de confianza de 0.3 a 0.45
- Cuando la confianza esta entre 0.45 y 0.65, en vez de ejecutar directamente, preguntar al usuario para confirmar: "Detecte que quieres un [tipo]. Es correcto? Si no, describeme mejor tu proyecto."
- Solo ejecutar automaticamente cuando la confianza es mayor a 0.65

**B. Agregar deteccion de mensajes ambiguos**
- Si el mensaje tiene menos de 3 tokens relevantes (despues de quitar stopwords), pedir mas detalles
- Si multiples intents tienen scores muy cercanos (diferencia menor a 2 puntos), preguntar al usuario cual prefiere

**C. Mejorar las respuestas conversacionales**
- Agregar mas patrones conversacionales: preguntas sobre el proyecto, sobre el sistema, sobre capacidades
- Cuando el usuario pregunta algo que no es generacion, responder con informacion util en vez de intentar clasificar

**D. Deteccion de intents compuestos mejorada**
- Cuando el usuario dice "sistema de X con Y", detectar ambos componentes
- Por ejemplo: "facturacion con inventario" deberia combinar schemas de ambos intents

---

### 3. Verificar que los links de preview funcionen

**Analisis del codigo actual:**
- La ruta `/preview/:projectId` y `/p/:slug` estan definidas en `App.tsx`
- `PublicPreview.tsx` consulta la tabla `projects` filtrando por `is_public = true`
- El iframe usa `sandbox="allow-scripts allow-same-origin"` lo cual es correcto

**Problema potencial:** Si el proyecto no esta marcado como publico (`is_public = false`), el link no mostrara nada. La URL bar del preview muestra la URL correcta solo cuando `isPublic && projectSlug` existen.

**Cambios en `src/pages/PublicPreview.tsx`:**
- Agregar manejo del caso donde el proyecto existe pero no es publico (mostrar mensaje diferente: "Este proyecto es privado")
- Agregar un boton para volver al inicio

**Cambios en `src/components/builder/PreviewPanel.tsx`:**
- Hacer que la URL en la barra sea clickeable y abra el preview en nueva pestana (cuando es publico)

---

### Resumen de archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/builder/PreviewPanel.tsx` | Texto "DOKU AI", URL clickeable |
| `supabase/functions/builder-ai/index.ts` | Umbral 0.45, zona de confirmacion 0.45-0.65, deteccion de ambiguedad, intents compuestos |
| `src/pages/PublicPreview.tsx` | Mejor manejo de proyectos privados, boton volver |

### Secuencia de implementacion

1. Cambio visual: "DOKU AI" en el loading overlay
2. Preview links: mejoras en PublicPreview y URL clickeable
3. AI intelligence: umbral, zona de confirmacion, deteccion de ambiguedad
