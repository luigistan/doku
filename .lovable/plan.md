

## Plan: Optimizar edge function para llama3.1:8b

### Contexto

El upgrade de tinyllama (1.1B) a llama3.1:8b es un salto enorme en capacidad. llama3.1 entiende instrucciones complejas, genera texto coherente en espanol, y puede producir HTML estructurado. Los prompts actuales estan "dumbed down" para tinyllama -- ahora podemos usar prompts mas ricos.

### Cambios en `supabase/functions/builder-ai/index.ts`

**1. Actualizar modelo default (linea 1956)**

Cambiar `"tinyllama"` a `"llama3.1:8b"` como modelo default.

**2. Aumentar parametros del modelo (lineas 1967-1971)**

- `num_predict`: de 150 a 300 (llama3.1 puede generar mas contenido de calidad)
- `temperature`: mantener en 0.7
- Timeout: de 15s a 30s (llama3.1:8b es mas lento que tinyllama pero mucho mejor)

**3. Mejorar prompts para aprovechar llama3.1 (lineas 2020-2036)**

Los prompts completion-style que usamos para tinyllama eran necesarios porque el modelo no entendia instrucciones. llama3.1 SI las entiende, asi que podemos dar instrucciones claras:

- **Hero subtitle**: Instruccion directa pidiendo un subtitulo profesional de 1-2 oraciones
- **Features**: Pedir 3 descripciones separadas por `|` con instruccion clara del formato
- **About**: Pedir 2-3 oraciones naturales para la seccion "Sobre nosotros"
- **Testimonials**: Pedir 2 testimonios con formato `Nombre - texto - cargo` separados por `|`

Todos los prompts incluiran el contexto del tipo de negocio (intent) para contenido mas relevante.

**4. Intentar generacion HTML completa como primera opcion (logica principal)**

Con llama3.1:8b, podemos intentar que el LLM genere HTML completo. Si el resultado es mayor a 200 caracteres, usarlo directamente. Si no, caer al enfoque hibrido (template + contenido enriquecido). Esto requiere:

- Aumentar `num_predict` en la llamada principal de generacion HTML a 2000
- Aumentar el timeout de la llamada principal a 60s
- Mantener el fallback hibrido como respaldo

**5. Actualizar comentarios del codigo**

Cambiar referencias de "tinyllama" a "llama3.1" en los comentarios para claridad.

### Resumen de cambios

Un solo archivo: `supabase/functions/builder-ai/index.ts`

- Linea 1952: Comentario actualizado
- Linea 1956: Modelo default a `llama3.1:8b`
- Lineas 1967-1971: `num_predict: 300`, timeout a 30s
- Lineas 2020-2036: Prompts mejorados con instrucciones claras
- Logica principal: Intentar HTML completo con timeout 60s, fallback a hibrido
- Redesplegar edge function

