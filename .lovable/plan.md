

## Plan: Explorador de Datos para DOKU Managed DB

### Situacion actual

La seccion "DOKU Managed" solo muestra una lista de nombres de tablas con opcion de crear/eliminar. El usuario no puede:
- Ver las columnas de cada tabla
- Ver los datos (filas) de cada tabla
- Agregar columnas o filas

### Que se va a construir

Un mini explorador de base de datos dentro de ProjectSettings. Al hacer clic en una tabla, se expande y muestra:

1. **Columnas de la tabla** con nombre, tipo, si es requerida, y valor por defecto
2. **Filas de datos** en formato tabla con los valores de cada columna
3. **Botones para agregar** columnas y filas
4. **Boton para eliminar** columnas y filas

```text
Base de Datos > DOKU Managed

  [Base de datos activa]

  ▶ productos
  ▼ usuarios                          [x]
    Columnas: nombre (text) | email (text) | edad (number)
    [+ Agregar columna]
    
    | nombre  | email           | edad |
    |---------|-----------------|------|
    | Carlos  | carlos@mail.com | 28   | [x]
    | Maria   | maria@mail.com  | 32   | [x]
    
    [+ Agregar fila]

  [Nueva tabla: ________] [+]
```

### Cambios tecnicos

**1. `src/services/projectService.ts`** -- Agregar funciones CRUD para columnas y filas:

- `getAppColumns(tableId)` -- obtiene columnas de una tabla
- `createAppColumn(tableId, name, type, isRequired, defaultValue)` -- crea columna
- `deleteAppColumn(columnId)` -- elimina columna
- `getAppRows(tableId)` -- obtiene filas de una tabla
- `createAppRow(tableId, data)` -- crea fila con datos JSON
- `updateAppRow(rowId, data)` -- actualiza datos de una fila
- `deleteAppRow(rowId)` -- elimina fila

Tipos exportados: `AppColumn` y `AppRow`

**2. `src/components/builder/TableDataViewer.tsx`** -- Nuevo componente

Componente que recibe un `tableId` y muestra:
- Lista de columnas con tipo y opciones
- Formulario inline para agregar columna (nombre + select de tipo: text, number, boolean, date)
- Tabla de datos con las filas existentes
- Formulario inline para agregar fila (inputs dinamicos segun columnas)
- Botones eliminar en cada fila y columna
- Estado expandido/colapsado

**3. `src/components/builder/ProjectSettings.tsx`** -- Modificar seccion managed

- Cada tabla ahora es clickeable y se expande para mostrar el `TableDataViewer`
- Se reemplaza la lista simple por un acordeon con icono de flecha
- El modal se hace un poco mas ancho (`max-w-lg` o `max-w-2xl`) para acomodar la tabla de datos

### Tipos de columna soportados

- `text` -- campo de texto
- `number` -- campo numerico
- `boolean` -- checkbox (true/false)
- `date` -- fecha

### Flujo del usuario

1. Abre Configuracion > Base de Datos > DOKU Managed
2. Ve sus tablas (ej: "productos", "usuarios")
3. Hace clic en "usuarios" -- se expande
4. Ve columnas: nombre (text), email (text), edad (number)
5. Ve filas con los datos actuales en formato tabla
6. Puede agregar nueva columna con nombre y tipo
7. Puede agregar nueva fila llenando inputs dinamicos
8. Puede eliminar filas o columnas individuales

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `src/services/projectService.ts` | Agregar CRUD de columnas y filas |
| `src/components/builder/TableDataViewer.tsx` | Nuevo -- visor de columnas y datos |
| `src/components/builder/ProjectSettings.tsx` | Integrar TableDataViewer en cada tabla, hacer modal mas ancho |

### No se necesitan migraciones

Las tablas `app_columns` y `app_rows` ya existen en la base de datos con RLS configurado. Solo falta el codigo frontend para consultarlas.

