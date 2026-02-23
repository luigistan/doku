

## Plan: Creacion Automatica de Tablas segun el Tipo de Proyecto

### Concepto

Cuando el AI genera un sitio (por ejemplo, un e-commerce), el sistema automaticamente crea las tablas de base de datos que ese tipo de proyecto necesita. El usuario no tiene que hacer nada -- las tablas aparecen creadas en la seccion "Base de Datos" de Configuracion.

### Esquema de tablas por intent

Se define un mapa `intentDatabaseSchema` que asocia cada tipo de proyecto con las tablas y columnas que necesita:

```text
ecommerce:
  - products: name(text), description(text), price(number), image_url(url), category(text), stock(number), active(boolean)
  - orders: customer_name(text), customer_email(email), total(number), status(select), order_date(date)
  - customers: name(text), email(email), phone(text), address(text)

restaurant:
  - menu_items: name(text), description(text), price(number), category(text), image_url(url), available(boolean)
  - reservations: customer_name(text), customer_email(email), date(date), guests(number), status(select), notes(text)

fitness:
  - members: name(text), email(email), phone(text), plan(select), start_date(date), active(boolean)
  - classes: name(text), instructor(text), schedule(text), capacity(number), category(text)

clinic:
  - patients: name(text), email(email), phone(text), birth_date(date), notes(text)
  - appointments: patient_name(text), doctor(text), date(date), status(select), notes(text)

hotel:
  - rooms: name(text), type(select), price(number), capacity(number), available(boolean), description(text)
  - reservations: guest_name(text), guest_email(email), room(text), check_in(date), check_out(date), status(select)

education:
  - courses: name(text), description(text), instructor(text), price(number), duration(text), level(select)
  - students: name(text), email(email), phone(text), enrolled_date(date), course(text)

realestate:
  - properties: title(text), description(text), price(number), location(text), type(select), bedrooms(number), image_url(url)
  - inquiries: name(text), email(email), phone(text), property(text), message(text), date(date)

salon:
  - services: name(text), description(text), price(number), duration(text), category(text)
  - appointments: client_name(text), client_phone(text), service(text), date(date), status(select)

veterinary:
  - patients: pet_name(text), species(select), breed(text), owner_name(text), owner_phone(text), notes(text)
  - appointments: pet_name(text), owner_name(text), date(date), reason(text), status(select)

(landing, portfolio, blog, dashboard, agency, lawyer, accounting, photography, music, technology: sin tablas automaticas -- son sitios informativos)
```

### Flujo de ejecucion

1. El usuario pide un sitio (ej: "Crea una tienda online de zapatillas")
2. El AI clasifica como `ecommerce`, genera el HTML normalmente
3. **NUEVO**: Despues de generar el HTML, el edge function:
   a. Activa `db_enabled = true` en el proyecto
   b. Crea las tablas definidas para ese intent (`products`, `orders`, `customers`)
   c. Crea las columnas para cada tabla
4. El response incluye un nuevo campo `dbTablesCreated` con la lista de tablas creadas
5. El frontend muestra un mensaje: "Se crearon automaticamente las tablas: Productos, Pedidos, Clientes"
6. El usuario puede ver y gestionar las tablas en Configuracion > Base de Datos

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` | Agregar mapa `intentDatabaseSchema`, funcion `autoCreateProjectTables()` que crea tablas+columnas via Supabase client, llamar despues de generar HTML |
| `src/hooks/useBuilderState.ts` | Leer `dbTablesCreated` del response y mostrar mensaje al usuario |
| `src/pages/Builder.tsx` | Actualizar `dbEnabled` state cuando el AI crea tablas automaticamente |

### Detalles tecnicos

**Edge function (`builder-ai/index.ts`)**:

La funcion `autoCreateProjectTables` recibe `projectId`, `intent`, y el service role client de Supabase:

1. Verifica si el proyecto ya tiene tablas (para no duplicar si el usuario regenera)
2. Si no tiene tablas, activa `db_enabled` y crea las tablas+columnas del schema
3. Usa el service role key (ya disponible en el edge function) para bypasear RLS
4. Retorna la lista de tablas creadas

**Frontend (`useBuilderState.ts`)**:

Cuando el response incluye `dbTablesCreated`, se agrega un mensaje extra al chat:

"Se configuraron automaticamente X tablas para tu proyecto: [lista]"

Y se emite un evento para que Builder.tsx actualice el estado `dbEnabled`.

### Protecciones

- No se duplican tablas si ya existen para ese proyecto
- Solo se crean tablas para intents que tienen schema definido
- Se usa `service_role_key` en el edge function (no el anon key) para poder crear sin RLS issues
- Si falla la creacion de tablas, el sitio se genera igual (no es bloqueante)
