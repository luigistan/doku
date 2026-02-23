

## Plan: Mejoras de UI en ProjectSettings + Recomendaciones + Sistema de Facturacion

Este plan cubre 3 areas que mencionaste:

---

### 1. Scroll y ancho del popup de Configuracion

**Problema:** El modal de ProjectSettings usa `overflow-y-auto` directamente en el contenedor, lo que no da un scroll suave. Ademas el ancho `max-w-2xl` puede ser insuficiente cuando hay tablas expandidas.

**Cambios en `ProjectSettings.tsx`:**
- Cambiar `max-w-2xl` a `max-w-3xl` para mas espacio
- Separar el header (fijo arriba) del contenido scrollable
- Aplicar `overflow-y-auto` solo al area de contenido, manteniendo el header siempre visible
- Agregar un borde sutil de sombra al hacer scroll para que se vea profesional

Estructura resultante:
```text
+------------------------------------------+
| Configuracion del proyecto          [X]  |  <-- Header fijo
+------------------------------------------+
| [Contenido scrollable]                   |
|   - Nombre                               |
|   - URL                                  |
|   - Dominio                              |
|   - Visibilidad                          |
|   - Base de Datos (tabs + tablas)        |
|   - Eliminar proyecto                    |
+------------------------------------------+
```

---

### 2. Que mas mejorar para que el AI entienda mejor al usuario

Basado en lo que ya tienes implementado (9 signals de clasificacion, TF-IDF, Ollama refinement, learning logs, entity memory), aqui van las mejoras mas impactantes:

**A. Agregar intent "billing" / "facturacion"** -- No existe como intent independiente. "facturacion" esta como keyword en "accounting" pero un sistema de facturacion es diferente a contabilidad. Se necesita:
- Nuevo intent `billing` con keywords: facturacion, facturas, invoice, cobro, recibo, pagos, cuentas por cobrar
- Schema de tablas auto-creadas: `invoices`, `clients`, `invoice_items`

**B. Agregar intent "login" / "auth-system"** -- El sistema no entiende cuando el usuario dice "con inicio de sesion" o "con login". Se necesita detectar esto como una entidad adicional, no como un intent separado. Agregar deteccion de:
- "con login", "con inicio de sesion", "con autenticacion", "con registro de usuarios"
- Esto se guarda como una entidad `requiresAuth: true` que modifica el HTML generado para incluir un formulario de login

**C. Mejorar deteccion de sistemas compuestos** -- Cuando el usuario dice "sistema de facturacion con login", son 2 cosas: intent=billing + requiresAuth=true. El clasificador actual no maneja bien combinaciones.

**D. Agregar mas intents utiles:**
- `inventory` -- sistema de inventario
- `crm` -- sistema de clientes
- `pos` -- punto de venta
- `booking` -- sistema de reservas generico

Estas mejoras se implementaran en el edge function `builder-ai`.

---

### 3. Sistema de facturacion con login y DOKU DB -- Estamos listos?

**Lo que ya tienes:**
- Tablas dinamicas (`app_tables`, `app_columns`, `app_rows`) con RLS
- Auto-creacion de tablas por intent (ya funciona para ecommerce, restaurant, etc.)
- Autenticacion con Supabase (login/registro ya existe en `/auth`)
- Perfiles de usuario

**Lo que falta para un sistema de facturacion completo:**
- Intent `billing` con schema de tablas (invoices, clients, invoice_items)
- El HTML generado debe incluir un formulario de login funcional
- Las tablas auto-creadas deben tener los campos correctos para facturacion

**Plan de implementacion:**

1. Agregar intent `billing` al edge function con:
   - Keywords: facturacion, facturas, invoice, cobros, recibos, billing
   - Schema: tablas `clients`, `invoices`, `invoice_items`
   - Template HTML con dashboard de facturacion

2. Agregar deteccion de `requiresAuth` como entidad booleana

3. Agregar schema de tablas para billing en `intentDatabaseSchema`

---

### Resumen de archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/builder/ProjectSettings.tsx` | Header fijo, scroll en contenido, `max-w-3xl` |
| `supabase/functions/builder-ai/index.ts` | Nuevo intent `billing`, deteccion de auth, schema de tablas |

### Secuencia

1. Primero: UI del modal (scroll + ancho) -- cambio rapido
2. Segundo: Nuevo intent `billing` con schema de tablas y keywords
3. Tercero: Deteccion de `requiresAuth` como entidad

