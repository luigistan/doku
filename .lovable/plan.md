

## Plan: DOKU Connectors -- Conexion a Bases de Datos Externas

### Concepto

Ademas de la base de datos gestionada por DOKU (Supabase multi-tenant), el usuario podra conectar su propia base de datos externa (MySQL, PostgreSQL, SQL Server) desde la seccion "Base de Datos" en Configuracion. DOKU actua como gateway seguro: guarda credenciales encriptadas, prueba la conexion, y expone un API unificado.

### Nueva tabla: `db_connections`

```text
db_connections
  id          uuid PK
  project_id  uuid FK -> projects.id
  type        text (mysql | postgres | mssql)
  host        text
  port        integer
  database    text
  username    text
  password_encrypted  text (encriptado con pgcrypto)
  use_ssl     boolean default false
  status      text default 'pending' (pending | ok | fail)
  status_message text nullable
  is_default  boolean default false
  created_at  timestamp
  updated_at  timestamp
```

RLS: solo el dueno del proyecto puede ver/editar sus conexiones. El campo `password_encrypted` se encripta con `pgp_sym_encrypt` usando una clave almacenada como secret de Supabase (`DB_ENCRYPTION_KEY`).

### Funciones de base de datos

- `encrypt_db_password(password text)` -- encripta con pgcrypto
- `decrypt_db_password(encrypted text)` -- desencripta (SECURITY DEFINER, solo accesible por service role)

### Edge Function: `db-connector`

Nuevo edge function con 3 endpoints:

**POST /test** -- Prueba conexion
- Recibe: host, port, database, username, password, type, use_ssl
- Intenta conectar y hacer un `SELECT 1`
- Retorna: `{ success: true }` o `{ success: false, error: "..." }`

**POST /save** -- Guarda conexion (encripta password)
- Recibe: projectId, host, port, database, username, password, type, use_ssl
- Guarda en `db_connections` con password encriptado
- Retorna: la conexion creada (sin password)

**POST /query** -- Ejecuta query seguro (Query Builder API)
- Recibe: `{ connectionId, action, table, where, limit, orderBy }`
- Desencripta credenciales, conecta a la DB, ejecuta query parametrizado
- Solo soporta: `select`, `insert`, `update`, `delete`
- Retorna: filas de resultado

Librerias en Deno:
- MySQL: `npm:mysql2/promise`
- PostgreSQL: `npm:pg`

### Cambios en la UI

**`ProjectSettings.tsx`** -- La seccion "Base de Datos" se divide en dos tabs/opciones:

1. **DOKU Managed** (lo que ya existe) -- con el icono de Database verde y las tablas
2. **Conectar DB Externa** -- nuevo formulario:
   - Select de tipo: MySQL / PostgreSQL / SQL Server
   - Inputs: Host, Puerto, Base de datos, Usuario, Contrasena
   - Toggle SSL
   - Boton "Probar Conexion" (llama al edge function /test)
   - Boton "Guardar" (llama al edge function /save)
   - Lista de conexiones guardadas con status (ok/fail) y boton eliminar
   - Badge "Default" en la conexion principal

### Service Layer

**`src/services/connectorService.ts`** -- nuevo archivo:

- `testConnection(params)` -- llama a edge function db-connector/test
- `saveConnection(params)` -- llama a edge function db-connector/save
- `getConnections(projectId)` -- lee de `db_connections` via Supabase client
- `deleteConnection(connectionId)` -- elimina de `db_connections`
- `setDefaultConnection(connectionId)` -- marca como default

### Seguridad

- Las contrasenas NUNCA se envian al frontend despues de guardar
- Solo el edge function con service role puede desencriptar
- El endpoint `/query` valida que el usuario sea dueno del proyecto
- No se permite SQL libre -- solo Query Builder API parametrizado
- Rate limiting basico (max 100 queries/min por proyecto)

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | Crear `db_connections`, extension `pgcrypto`, funciones encrypt/decrypt, RLS |
| `supabase/functions/db-connector/index.ts` | Nuevo edge function con endpoints test/save/query |
| `supabase/config.toml` | Agregar `[functions.db-connector]` |
| `src/services/connectorService.ts` | Nuevo -- funciones CRUD para conexiones |
| `src/components/builder/ProjectSettings.tsx` | Agregar seccion "Conectar DB Externa" con form y lista |
| `src/pages/Builder.tsx` | Pasar estado de conexiones al modal |

### Secuencia de implementacion

1. Agregar secret `DB_ENCRYPTION_KEY` para encriptacion de contrasenas
2. Migracion SQL: tabla + funciones + RLS
3. Edge function `db-connector` con test/save/query
4. Service layer en frontend
5. UI en ProjectSettings con formulario de conexion

### UX final en la seccion Base de Datos

```text
Base de Datos
  [DOKU Managed]          [DB Externa]
  
  -- Tab DOKU Managed --
  (lo que ya existe: tablas del proyecto)

  -- Tab DB Externa --
  Tipo: [MySQL v]
  Host: [_____________]
  Puerto: [3306]
  Base de datos: [_____________]
  Usuario: [_____________]
  Contrasena: [_____________]
  [ ] Usar SSL
  
  [Probar Conexion]  [Guardar]
  
  -- Conexiones guardadas --
  mysql://user@host:3306/mydb  [OK]  [Default]  [x]
```

