

# Plan: Corregir el error de formularios y hacer que la base de datos sea completamente automatica

## Problema diagnosticado

Se encontraron 3 problemas encadenados que causan el "Error - Reintentar":

1. **Tablas existentes bloquean la creacion de nuevas**: El proyecto ya tenia tablas `contacts` y `deals` (de una generacion anterior). Cuando se detecto el intent `billing`, AutoDB vio que ya habia tablas y no creo las nuevas (`clients`, `invoices`, `users`).

2. **El LLM no sabe que tablas existen**: El system prompt le dice al LLM que use ciertos nombres de tabla, pero no le informa cuales ya estan creadas en el proyecto. El HTML generado referencia `users`, `clients`, `invoices` pero esas tablas no existen.

3. **El crud-api falla silenciosamente**: Cuando recibe `tableName="users"` y la tabla no existe, devuelve 404 sin intentar crearla.

## Solucion (3 cambios)

### 1. `supabase/functions/crud-api/index.ts` - Auto-crear tablas que no existen

Cuando el action es `create` y la tabla no se encuentra, en vez de devolver 404, crearla automaticamente con las columnas extraidas del `data` enviado.

```text
Flujo actual:
  form submit -> crud-api -> "Table not found" -> ERROR

Flujo corregido:
  form submit -> crud-api -> tabla no existe? -> crearla con columnas del data -> insertar row -> OK
```

Cambios especificos:
- En la seccion `action === "create"`, si la tabla no existe:
  1. Crear registro en `app_tables` con el nombre recibido
  2. Crear columnas en `app_columns` basadas en las keys del objeto `data`
  3. Insertar el row normalmente en `app_rows`

### 2. `supabase/functions/builder-ai/index.ts` - Pasar tablas existentes al LLM

Antes de llamar a Ollama, consultar las tablas existentes del proyecto y agregarlas al prompt para que el LLM use los nombres correctos.

Cambios especificos:
- Cargar tablas existentes con sus columnas antes de llamar a `callOllama`
- Agregar al mensaje del usuario un contexto como: `[TABLAS EXISTENTES: contacts(name,email,phone,company,status,notes), deals(title,contact_name,value,stage,expected_close,notes)]`
- Asi el LLM generara `data-doku-table="contacts"` en vez de inventar nombres

### 3. `supabase/functions/builder-ai/index.ts` - AutoDB no debe bloquear por tablas de otro intent

Modificar `autoCreateProjectTables` para que en vez de verificar "si hay alguna tabla, skip", verifique tabla por tabla si ya existe.

Cambios especificos:
- En vez de `if (existingTables.length > 0) return`, consultar las tablas existentes por nombre
- Solo crear las tablas del schema que NO existan aun
- Asi si el proyecto tenia `contacts`/`deals` y ahora necesita `clients`/`invoices`, se crean las que faltan

### 4. Deploy

Redesplegar `builder-ai` y `crud-api`.

## Seccion tecnica

| Archivo | Cambio |
|---|---|
| `supabase/functions/crud-api/index.ts` | Auto-crear tabla + columnas cuando no existe (en action "create") |
| `supabase/functions/builder-ai/index.ts` | Pasar tablas existentes al LLM como contexto; AutoDB crea solo tablas faltantes |

### Auto-creacion de tabla en crud-api (pseudocodigo)

```text
if (action === "create") {
  // Intentar resolver tabla
  let table = buscar en app_tables por nombre y projectId

  if (!table) {
    // Auto-crear tabla
    table = INSERT en app_tables (project_id, name)
    
    // Crear columnas basadas en las keys del data
    for (key in data) {
      INSERT en app_columns (table_id, name, column_type: inferir_tipo(data[key]))
    }
    
    // Habilitar db_enabled en el proyecto
    UPDATE projects SET db_enabled = true WHERE id = projectId
  }

  // Insertar row normalmente
  INSERT en app_rows (table_id, data)
}
```

### Contexto de tablas para el LLM

```text
// Antes de llamar a callOllama:
const existingTables = await cargar tablas y columnas del proyecto
const tableContext = existingTables.map(t => 
  t.name + "(" + t.columns.join(",") + ")"
).join(", ");

// Agregar al mensaje:
message += "\n[TABLAS BD: " + tableContext + "]"
```

## Resultado esperado

1. El usuario dice "crea un sistema de facturacion"
2. El LLM ve las tablas existentes y las usa, o usa nombres nuevos
3. Si las tablas no existen, se crean automaticamente al primer envio del formulario
4. El registro de "hola@hola.com" se guarda correctamente en la BD
5. No mas errores "Table not found"

