

## Plan: Hacer que Ollama/tinyllama funcione perfectamente con un enfoque hibrido

### El problema actual

tinyllama (1.1B parametros) no puede generar una pagina HTML completa de 2000+ caracteres. Solo produce ~62 caracteres. El sistema actual le pide que genere TODO el HTML desde cero, lo cual es imposible para un modelo tan pequeno.

### La solucion: Enfoque hibrido (Templates + tinyllama como "escritor de contenido")

En vez de pedirle a tinyllama que genere HTML completo, usaremos el **motor de templates que ya funciona perfectamente** y le pediremos a tinyllama solo que genere **contenido personalizado** en texto corto:

- Subtitulo del hero (1-2 oraciones)
- Descripciones de features/servicios (1 oracion cada una)
- Descripcion "Sobre nosotros" (2-3 oraciones)
- Testimonios ficticios (1 oracion cada uno)

Esto son tareas de ~50-100 tokens que tinyllama SI puede hacer bien.

```text
FLUJO ACTUAL (falla):
  Usuario -> "Cafeteria El Buen Cafe"
  -> tinyllama: "Genera TODO el HTML" -> 62 chars -> FALLA -> fallback a template generico

FLUJO NUEVO (hibrido):
  Usuario -> "Cafeteria El Buen Cafe"
  -> TF-IDF detecta intent: restaurant
  -> tinyllama: "Escribe un subtitulo para cafeteria El Buen Cafe" -> "Cafe artesanal..."
  -> tinyllama: "Describe 3 servicios de una cafeteria" -> textos cortos
  -> Template engine genera HTML con contenido personalizado de tinyllama
```

### Cambios tecnicos

**Archivo: `supabase/functions/builder-ai/index.ts`**

1. **Nueva funcion `callLLMForContent`**: Hace multiples llamadas pequenas a tinyllama con prompts simples y cortos. Cada llamada pide solo 1-2 oraciones (max_tokens: 100). Incluye parametros optimizados para tinyllama: `temperature: 0.7`, `num_predict: 100`.

2. **Nueva funcion `enrichContentWithLLM`**: Orquesta las llamadas a tinyllama para generar contenido personalizado:
   - Subtitulo del hero personalizado para el negocio
   - 3 descripciones de servicios/features
   - 1 parrafo "sobre nosotros"
   - 2-3 testimonios

3. **Modificar la logica principal (lineas 2042-2060)**: En vez de intentar generar HTML completo con el LLM y fallar, el flujo sera:
   - Siempre usar el template engine para generar HTML (ya funciona perfecto)
   - Si Ollama esta disponible, enriquecer el contenido del template con texto generado por tinyllama
   - Si Ollama falla, usar el contenido estatico del template (comportamiento actual)

4. **Modificar las funciones de contenido**: Las funciones como `getHeroSubtitle`, `getFeatures`, `getFeaturesSubtitle` aceptaran un parametro opcional de contenido enriquecido por LLM que reemplaza el texto estatico.

5. **Optimizar parametros de Ollama**: En la llamada a `/api/generate`, agregar:
   - `num_predict: 100` (limitar la longitud de respuesta)
   - `temperature: 0.7` (creatividad controlada)
   - `stop: ["\n\n"]` (evitar respuestas demasiado largas)

6. **Timeout mas corto**: Reducir el timeout de 60s a 15s para cada llamada pequena, ya que son respuestas cortas.

### Resultado esperado

- Los templates siguen generando el HTML completo (siempre funciona)
- tinyllama personaliza el texto dentro del template (cuando esta disponible)
- Si tinyllama falla o es lento, el template se usa con contenido estatico (sin interrupcion)
- El preview siempre se renderiza correctamente

### Pasos de implementacion

1. Crear la funcion `callLLMShort` optimizada para respuestas cortas de tinyllama
2. Crear la funcion `enrichContentWithLLM` que genera contenido personalizado
3. Modificar `composeReactHtml` y las funciones de contenido para aceptar contenido enriquecido
4. Cambiar la logica principal para usar el enfoque hibrido (template + LLM content)
5. Redesplegar la edge function `builder-ai`
6. Probar generando un sitio para verificar que tinyllama personaliza el contenido

