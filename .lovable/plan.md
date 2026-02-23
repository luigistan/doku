
## Plan: Base de Datos Multi-Tenant para Proyectos del Usuario

### Concepto

Agregar una seccion "Base de Datos" en el modal de Configuracion del Proyecto (entre "Visibilidad" y "Eliminar proyecto"). El usuario podra activar una base de datos gestionada por DOKU para su proyecto, crear tablas dinamicas, definir columnas, y ver/editar filas -- todo sin salir del builder.

Se usa el modelo multi-tenant que propones: una sola DB de Supabase con `project_id` en cada fila y RLS que garantiza aislamiento total.

### Mejora al modelo propuesto

Tu modelo es solido. Estas son las mejoras que recomiendo:

1. **`app_tables` + `app_columns` + `app_rows`** es mejor que `app_data_json` porque:
   - Permite validacion de tipos por columna
   - Soporta indices futuros por columna
   - Permite exportar a SQL real si el usuario migra

2. **Agregar `column_type` enum** con tipos basicos: `text`, `number`, `boolean`, `date`, `email`, `url`, `select` -- esto permite que la IA genere formularios automaticos

3. **Agregar `app_rows.data` como JSONB** en lugar de una columna por campo -- esto da flexibilidad total sin alterar el schema cuando el usuario agrega columnas

4. **Toggle `db_enabled` en la tabla `projects`** para saber si el proyecto tiene DB activa

### Nuevas tablas (migracion SQL)

```text
projects (agregar columna)
  +-- db_enabled boolean default false

app_tables
  id uuid PK
  project_id uuid FK -> projects.id
  name text (nombre de la tabla del usuario)
  created_at timestamp

app_columns
  id uuid PK
  table_id uuid FK -> app_tables.id
  name text
  column_type text (text | number | boolean | date | email | url | select)
  is_required boolean default false
  default_value text nullable
  position integer default 0
  created_at timestamp

app_rows
  id uuid PK
  table_id uuid FK -> app_tables.id
  data jsonb (las columnas del usuario como JSON)
  created_at timestamp
  updated_at timestamp
```

### RLS (aislamiento total)

Todas las tablas usan la misma logica:

- SELECT/INSERT/UPDATE/DELETE: solo si el usuario es dueno del `project_id` asociado
- Para `app_columns` y `app_rows`: se valida via JOIN a `app_tables.project_id -> projects.user_id`

Ejemplo de politica:
```text
"El usuario solo puede acceder a filas donde
 app_tables.project_id pertenece a un proyecto suyo"
```

### Cambios en la UI

**`ProjectSettings.tsx`** -- nueva seccion "Base de Datos" con:

1. **Toggle de activacion**: Boton "Activar Base de Datos" que cambia `db_enabled` a true
2. **Lista de tablas**: Cuando esta activo, muestra las tablas creadas con un boton "+ Nueva tabla"
3. **Crear tabla**: Input para nombre + boton crear
4. **Indicador visual**: Icono de Database con badge verde cuando esta activo

**`projectService.ts`** -- nuevas funciones:

- `enableProjectDb(projectId)` -- actualiza `db_enabled = true`
- `getAppTables(projectId)` -- lista tablas del proyecto
- `createAppTable(projectId, name)` -- crea una tabla
- `deleteAppTable(tableId)` -- elimina tabla y sus columnas/filas en cascada

El editor completo de columnas y filas (tipo Airtable) se implementara como un componente separado `DatabaseManager.tsx` accesible desde el builder.

### Archivos a modificar/crear

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | Crear `app_tables`, `app_columns`, `app_rows` + agregar `db_enabled` a `projects` + RLS policies |
| `src/services/projectService.ts` | Agregar funciones CRUD para tablas de la app |
| `src/components/builder/ProjectSettings.tsx` | Agregar seccion "Base de Datos" con toggle y lista de tablas |
| `src/pages/Builder.tsx` | Pasar nuevo estado `dbEnabled` al modal de settings |

### Secuencia de implementacion

1. Migracion SQL: crear tablas + RLS
2. Service layer: funciones CRUD
3. UI: seccion en ProjectSettings con toggle + lista de tablas + crear tabla
