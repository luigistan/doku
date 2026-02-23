
## Plan: Mejorar Templates, Codigo y Base de Datos en DOKU AI

Este plan aborda tres areas: (1) mas templates y mejor codigo generado, (2) inteligencia conversacional mejorada, (3) base de datos funcional end-to-end.

---

### Diagnostico Actual

**Templates (src/lib/templates.ts):**
- 17 templates base con React CDN (landing, restaurant, portfolio, blog, dashboard, ecommerce, fitness, agency, clinic, education, realestate, event, saas, login, pricing, veterinary, notfound)
- Faltan templates para: billing, inventory, crm, pos, booking, hotel, lawyer, accounting, photography, music, salon, technology
- Los intents existen en el edge function pero NO tienen templates locales, lo que causa fallback a templates genericos

**Edge Function (builder-ai):**
- 3540 lineas, bien estructurado con SmartAI (Gemini Flash) + fallback local
- El `composeReactHtml` genera HTML puro (no React) como fallback -- funciona bien
- La funcion `generatePageContent` solo tiene templates para: login, register, dashboard, clients, products, invoices, orders, settings, profile, reports, users, calendar
- El CRUD SDK se inyecta pero no se conecta con los botones "+ Agregar" de las paginas generadas

**Base de Datos:**
- Las tablas se crean correctamente en `app_tables`/`app_columns`/`app_rows` via `autoCreateProjectTables`
- El CRUD API edge function existe y funciona
- PROBLEMA: Los botones del HTML generado no disparan `DOKU_CRUD.showAddForm()` -- el SDK busca botones con texto que empiece con "+" pero el HTML generado usa `onclick` inline que no conecta con el SDK
- PROBLEMA: El SDK necesita `PROJECT_ID` que se envia via `postMessage`, pero en el multi-page HTML no se solicita correctamente

---

### Cambios Propuestos

#### 1. Agregar Templates Locales Faltantes (src/lib/templates.ts)

Agregar 12 templates que ya tienen intents definidos pero no tienen template visual:

| Template | Descripcion |
|----------|-------------|
| billing | Sistema de facturacion con tabla de facturas, clientes, totales |
| inventory | Control de inventario con stock, alertas, movimientos |
| crm | Gestion de clientes con pipeline, contactos, deals |
| pos | Punto de venta con catalogo, carrito, tickets |
| booking | Sistema de reservas/citas con calendario, servicios |
| hotel | Pagina de hotel con habitaciones, reservaciones, galeria |
| lawyer | Bufete legal con servicios, equipo, consultas |
| accounting | Despacho contable con servicios, calculadora fiscal |
| photography | Estudio fotografico con galeria masonry, paquetes |
| music | Estudio musical con reproductor, portfolio, servicios |
| salon | Salon de belleza con servicios, precios, reservas |
| technology | Empresa de tecnologia/software con features, demo |

Cada template usara `reactWrap()` con React CDN igual que los existentes, manteniendo la consistencia de estilo.

#### 2. Mejorar Conexion BD en el HTML Generado (builder-ai/index.ts)

**A. Arreglar el CRUD SDK para que los botones funcionen:**

El SDK actual escucha clicks en botones con texto "+", pero los botones del HTML generado usan `onclick` inline. Se necesita:

- Modificar `generatePageContent` para que los botones "+ Agregar" de cada pagina tengan `onclick="DOKU_CRUD.showAddForm('tableName')"` directamente
- Agregar un `data-crud-table` attribute a las tablas para que el SDK sepa donde renderizar los datos reales
- Cuando el SDK carga datos de una tabla, reemplazar el contenido estatico del `<tbody>` con datos reales de la BD

**B. Mejorar el mapeo pagina->tabla en el SDK:**

Actualmente `ptMap` mapea `clients->clients` pero no todos los tipos de pagina tienen mapeo correcto. Expandir para incluir todos los schemas de `intentDatabaseSchema`.

**C. Auto-refresh despues de crear registro:**

Cuando el usuario crea un registro via el modal, el SDK ya llama `onPageSwitch` para refrescar -- verificar que esto funciona correctamente cuando `PROJECT_ID` se recibe via `postMessage`.

#### 3. Mejorar Inteligencia Conversacional (builder-ai/index.ts)

**A. Mejorar el prompt de SmartAI:**

El prompt actual de `smartClassify` es bueno pero puede mejorarse:
- Agregar ejemplos concretos de inputs y outputs esperados (few-shot in-prompt)
- Incluir deteccion de modificaciones mas sofisticada (ej: "cambia el color del header a rojo")
- Agregar deteccion de cuando el usuario esta hablando de datos (ej: "agrega un cliente llamado Juan")

**B. Agregar intent "data_operation":**

Cuando el usuario dice "agrega un cliente llamado Juan con email juan@email.com", el sistema debe:
1. Detectar que es una operacion de datos (no una pagina nueva ni un sitio nuevo)
2. Extraer la tabla destino y los datos
3. Llamar al CRUD API directamente
4. Responder con confirmacion

Agregar nuevo tipo en `SmartAIResult`: `type: "data_operation"` con campos `tableName`, `operation` (create/read/update/delete), `data`.

**C. Mejorar respuestas conversacionales:**

- Cuando el usuario pregunta "que tablas tengo?" -> consultar `app_tables` y listar
- Cuando dice "muestra mis clientes" -> consultar `app_rows` y mostrar resumen
- Cuando dice "cuantos registros hay?" -> contar y responder

#### 4. Conectar la BD al Preview en Tiempo Real

**A. Mejorar el `getCrudSdkScript`:**

- El SDK debe cargar datos automaticamente al abrir una pagina (no solo cuando se cambia de tab)
- Agregar un `DOMContentLoaded` listener que busca tablas con `data-crud-table` y las llena con datos reales
- Los botones de "+ Agregar" deben abrir el modal con los campos correctos de la tabla

**B. Edicion inline:**

- Agregar boton de editar (lapiz) a cada fila
- Al hacer clic, abrir modal similar al de crear pero pre-llenado con los datos existentes
- Al guardar, llamar `DOKU_CRUD.update(rowId, data)`

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/lib/templates.ts` | Agregar 12 templates nuevos (billing, inventory, crm, pos, booking, hotel, lawyer, accounting, photography, music, salon, technology) |
| `supabase/functions/builder-ai/index.ts` | (1) Mejorar `generatePageContent` con botones CRUD conectados, (2) Agregar intent `data_operation` en SmartAI, (3) Mejorar prompt de SmartAI con few-shot examples, (4) Mejorar `getCrudSdkScript` con auto-load y edicion |
| `supabase/functions/crud-api/index.ts` | Sin cambios necesarios -- ya soporta todas las operaciones |
| `src/hooks/useBuilderState.ts` | Agregar manejo de intent `data_operation` para ejecutar CRUD sin generar HTML |

### Secuencia de Implementacion

1. **Templates primero:** Agregar los 12 templates faltantes en `templates.ts` (esto mejora la experiencia inmediatamente sin tocar el backend)
2. **CRUD SDK mejorado:** Actualizar `getCrudSdkScript` para auto-carga, botones conectados y edicion inline
3. **`generatePageContent` mejorado:** Agregar atributos `data-crud-table` y `onclick` correcto a los botones
4. **SmartAI mejorado:** Agregar `data_operation` intent y few-shot examples
5. **`useBuilderState` update:** Manejar `data_operation` intent
6. **Deploy** del edge function

### Detalle Tecnico: Templates Nuevos

Cada template seguira el patron existente:
```text
{
  id: "billing",
  name: "Facturacion",
  keywords: [...],
  description: "Sistema de facturacion...",
  planSteps: [...],
  html: reactWrap(`...React component code...`, "Mi Facturacion")
}
```

Los templates de tipo "sistema" (billing, inventory, crm, pos) tendran:
- Sidebar de navegacion con secciones
- Cards de metricas con datos de ejemplo
- Tablas con datos ficticios que seran reemplazados por datos reales via CRUD SDK
- Formularios funcionales conectados al CRUD

Los templates de tipo "sitio" (hotel, lawyer, accounting, photography, music, salon, technology) tendran:
- Hero section con CTA
- Seccion de servicios/features
- Formulario de contacto/reserva
- Footer profesional

### Detalle Tecnico: Data Operations

Flujo cuando el usuario dice "agrega un cliente llamado Juan":
```text
1. SmartAI detecta type="data_operation"
2. Extrae: tableName="clients", operation="create", data={name:"Juan"}
3. Edge function llama crud-api internamente
4. Retorna: conversationalResponse="Listo, agregue a Juan como cliente"
5. Frontend muestra el mensaje sin modificar el HTML
6. Si el preview tiene la pagina de clientes abierta, se refresca automaticamente
```
