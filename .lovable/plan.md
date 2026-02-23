

## Plan: Integracion Multi-Pagina, Preview en Vivo, AI Inteligente y Mejoras Generales

Este plan aborda los 5 problemas principales identificados:

---

### 1. Preview en vivo (sin overlay "loading" bloqueando)

**Problema:** Cada vez que el usuario envia un mensaje, `useBuilderState` pone `status: "loading"` lo cual muestra el overlay "DOKU AI" cubriendo el preview completamente. El preview anterior desaparece.

**Solucion:** Mostrar el overlay SOLO cuando no hay HTML previo. Si ya hay contenido en el preview, mantener el preview visible y mostrar un indicador pequeno (spinner en la toolbar) en vez del overlay completo.

**Cambios en `src/hooks/useBuilderState.ts`:**
- No cambiar `status` a `"loading"` si ya hay HTML en el preview -- usar un nuevo estado `"updating"` que no muestra overlay
- Cuando el resultado llega, hacer transicion suave actualizando el HTML directamente

**Cambios en `src/components/builder/PreviewPanel.tsx`:**
- Agregar status `"updating"` al `statusConfig` con un spinner discreto en la toolbar (no overlay)
- Solo mostrar el overlay "DOKU AI" cuando `status === "loading"` Y no hay HTML previo (primera generacion)
- Agregar a `PreviewState` en `types/builder.ts` el status `"updating"`

---

### 2. Integrar el sistema multi-pagina en el main handler

**Problema critico:** Las funciones `detectPageRequest`, `generatePageContent`, `parseExistingPages` y `composeMultiPageHtml` estan definidas pero NUNCA se llaman. Cuando el usuario dice "crea una pestana de clientes", el sistema lo trata como una solicitud nueva y falla con baja confianza (22%).

**Solucion:** Integrar la deteccion de paginas ANTES de la clasificacion principal en el main handler.

**Cambios en `supabase/functions/builder-ai/index.ts` (main handler, linea ~2857):**

Flujo actualizado:
```text
1. Conversational detection (ya existe)
2. [NUEVO] Page request detection (detectPageRequest)
   -> Si detecta una pagina:
      a. Cargar HTML actual del proyecto
      b. Parsear paginas existentes (parseExistingPages)
      c. Generar nueva pagina (generatePageContent)
      d. Agregar a paginas existentes
      e. Recomponer HTML completo (composeMultiPageHtml)
      f. Retornar directamente sin pasar por clasificacion
3. Classification pipeline (ya existe)
```

Esto significa que mensajes como:
- "quiero que crees una pestana que diga clientes" -- detecta `clients`, agrega la pagina
- "agrega una pagina de facturas" -- detecta `invoices`, la agrega
- "crea un dashboard" -- detecta `dashboard`, lo agrega al sistema de tabs

Tambien agregar patrones adicionales para detectar mejor las solicitudes de pestanas/tabs:
- `/(?:quiero|pon|agrega|crea)\s+(?:que\s+)?(?:una?\s+)?(?:pestana|tab|menu|opcion)\s+(?:que\s+diga\s+|de\s+|para\s+)?(\w+)/i`
- Detectar "quiero que crees una pestana en el menu que diga clientes" correctamente

---

### 3. AI mas inteligente - detectar modificaciones incrementales

**Problema:** El AI no distingue entre "crear un sitio nuevo" y "modificar el sitio actual". Cuando el usuario ya tiene un dashboard generado y dice "agrega clientes", el sistema intenta clasificar como un nuevo sitio.

**Cambios en `supabase/functions/builder-ai/index.ts`:**

**A. Mejorar el patron de pestana/tab**
- Agregar regex para detectar solicitudes de tipo "quiero que crees una pestana en el menu que diga X"
- Mapear el valor de X al `pageType` correspondiente (clientes->clients, facturas->invoices, etc.)
- Agregar deteccion flexible: "pon un tab de X", "agrega X al menu", "incluye una seccion de X"

**B. Convertir el sitio actual a multi-pagina automaticamente**
- Si el proyecto ya tiene HTML pero no es multi-pagina (no tiene markers `<!-- PAGE:... -->`), convertir el HTML existente a la primera pagina ("Inicio") antes de agregar la nueva
- Esto permite una transicion fluida de sitio landing a sistema multi-pagina

---

### 4. Generacion de imagenes con Stable Diffusion (investigacion)

**Realidad:** Ejecutar Stable Diffusion en Render.com requiere una instancia con GPU (no incluida en planes gratuitos). Con 4 CPU y 16GB RAM no es viable correr Stable Diffusion localmente.

**Alternativa gratuita viable:**
- Usar Unsplash (ya implementado) para imagenes fotograficas
- Usar SVG generados por Ollama para iconos e ilustraciones
- El modelo de Ollama puede generar descripciones de imagenes que se pasan como parametros de busqueda a Unsplash

No se necesita cambio de codigo para esto -- ya funciona con Unsplash. Si en el futuro se quiere agregar SD, se puede hacer como un segundo servicio Docker en Render con GPU.

---

### 5. Base de datos del sistema de facturacion

**Estado actual:** Las tablas se crean automaticamente via `autoCreateProjectTables` en `app_tables`/`app_columns`/`app_rows` (tablas dinamicas). El schema para `billing` ya incluye `clients`, `invoices`, `invoice_items`.

**El problema es que el HTML generado NO interactua con la base de datos.** Los datos que se ven en el preview son estaticos (hardcoded en el HTML).

Para que el sistema de facturacion funcione con datos reales, se necesitaria:
- Que el HTML generado use la API de Supabase para leer/escribir datos
- Esto requiere incluir el SDK de Supabase en el HTML generado via CDN

**Cambio propuesto:** En la generacion de paginas multi-pagina, agregar funcionalidad basica de CRUD conectando el HTML generado con la API de Supabase del proyecto (usando las tablas de `app_tables`). Esto se hara en una fase posterior - por ahora el foco esta en que las pestanas funcionen correctamente.

---

### Resumen de archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/types/builder.ts` | Agregar status `"updating"` a `PreviewState` |
| `src/hooks/useBuilderState.ts` | Usar `"updating"` en vez de `"loading"` cuando ya hay HTML, manejar respuesta de pagina incremental |
| `src/components/builder/PreviewPanel.tsx` | Mostrar overlay solo en primera generacion, spinner discreto para updates |
| `supabase/functions/builder-ai/index.ts` | Integrar `detectPageRequest` en main handler, mejorar patrones de pestana/tab, conversion automatica a multi-pagina |

### Secuencia

1. Actualizar tipos y preview para modo "updating" sin overlay
2. Integrar sistema multi-pagina en el main handler del edge function
3. Mejorar patrones de deteccion de pestanas y tabs
4. Agregar conversion automatica de sitio simple a multi-pagina
5. Deploy del edge function actualizado

