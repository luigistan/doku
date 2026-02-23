

# Plan: Hacer que los formularios del preview guarden datos automaticamente en la base de datos

## Problema detectado

Cuando un usuario genera un sitio (ej. CRM, restaurante, etc.), el sistema crea correctamente las tablas en la base de datos (`app_tables`, `app_columns`), pero los formularios del HTML generado **no guardan datos** por dos razones:

1. El "navigation guard" en `PreviewPanel.tsx` intercepta TODOS los form submit y solo muestra "Enviado correctamente" sin guardar nada
2. El HTML generado no incluye ningun script para comunicarse con el `crud-api`

## Confirmacion del stack tecnologico

Si, el proyecto esta construido con **TypeScript + React** (Vite + Tailwind CSS + shadcn/ui + Supabase). Los sitios generados se renderizan como HTML puro dentro de un iframe.

## Solucion

Inyectar un "DOKU CRUD SDK" en el HTML del preview que permita a los formularios guardar datos automaticamente en la base de datos del proyecto.

## Cambios por archivo

### 1. `src/components/builder/PreviewPanel.tsx`

Modificar la funcion `injectNavigationGuard` para:
- Detectar formularios con el atributo `data-doku-table` (ej. `<form data-doku-table="contacts">`)
- Esos formularios SI se envian al `crud-api` via `fetch`
- Formularios SIN ese atributo siguen siendo interceptados como antes (comportamiento actual)
- Inyectar un script SDK que:
  - Solicita el `projectId` al parent via `postMessage`
  - Al hacer submit de un form con `data-doku-table`, recoge los campos del formulario, los empaqueta como JSON, y los envia a la edge function `crud-api`
  - Muestra feedback visual al usuario (exito o error)

```text
Flujo:
[Usuario llena form] -> [submit] -> [SDK detecta data-doku-table]
  -> [fetch POST /crud-api { action:"create", projectId, tableName, data }]
  -> [Muestra "Guardado" o "Error"]
```

### 2. `supabase/functions/builder-ai/index.ts`

Actualizar el `OLLAMA_SYSTEM_PROMPT` para instruir al LLM que:
- Los formularios de contacto/registro/reservas deben incluir `data-doku-table="nombre_tabla"`
- Los campos del formulario deben usar `name="nombre_columna"` que coincida con las columnas de la tabla
- Ejemplo: `<form data-doku-table="contacts"><input name="name"><input name="email">...</form>`

Tambien actualizar la funcion `generateFallbackHtml` para incluir el atributo `data-doku-table="contacts"` en el formulario de contacto del fallback.

### 3. `supabase/functions/crud-api/index.ts`

No necesita cambios significativos. Ya soporta `action: "create"` con `tableName` y `data`. Solo verificar que `verify_jwt = false` esta configurado (ya lo esta en `config.toml`).

## Seccion tecnica - Script SDK inyectado

El SDK se inyectara automaticamente en el HTML del preview:

```text
(function() {
  var projectId = null;
  var SUPABASE_URL = "[URL del proyecto]";
  var SUPABASE_KEY = "[anon key]";

  // Solicitar projectId al parent
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'doku:projectId') {
      projectId = e.data.projectId;
    }
  });
  parent.postMessage({ type: 'doku:requestProjectId' }, '*');

  // Interceptar forms con data-doku-table
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form.hasAttribute('data-doku-table')) return;
    e.preventDefault();

    var tableName = form.getAttribute('data-doku-table');
    var formData = new FormData(form);
    var data = {};
    formData.forEach(function(v, k) { data[k] = v; });

    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'Enviando...'; btn.disabled = true; }

    fetch(SUPABASE_URL + '/functions/v1/crud-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({
        action: 'create',
        projectId: projectId,
        tableName: tableName,
        data: data
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (btn) { btn.textContent = 'Enviado!'; }
      form.reset();
      setTimeout(function() {
        if (btn) { btn.textContent = 'Enviar'; btn.disabled = false; }
      }, 2500);
    })
    .catch(function() {
      if (btn) { btn.textContent = 'Error - Reintentar'; btn.disabled = false; }
    });
  });
})();
```

### 4. Variables de entorno

El SDK necesita la URL de Supabase y la anon key. Estas ya estan disponibles como variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`), se pasaran al script desde el componente React.

## Resultado esperado

1. El usuario dice "Crea un CRM para mi empresa"
2. Ollama genera HTML con formularios que incluyen `data-doku-table="contacts"`
3. Se crean automaticamente las tablas `contacts` y `deals` en la BD
4. El usuario llena un formulario en el preview
5. Los datos se guardan automaticamente en `app_rows` vinculados a la tabla correcta
6. El usuario puede ver los datos en Configuracion > Base de Datos

