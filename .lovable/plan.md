
# Plan: Sistema de Generacion Completo con TypeScript, React y Base de Datos

## Problemas Identificados

1. **El iframe con `sandbox="allow-scripts"` bloquea las llamadas fetch**: Sin `allow-same-origin`, el CRUD SDK no puede hacer peticiones HTTP al API de Supabase, lo que deja la base de datos completamente inoperativa en el preview.

2. **El HTML generado NO usa TypeScript ni React**: A pesar del nombre `composeReactHtml`, la funcion genera HTML puro con CSS y JavaScript vanilla. Solo los templates locales en `templates.ts` usan React via CDN, pero el edge function genera HTML estatico.

3. **La autenticacion en sitios generados es solo visual**: El formulario de login/registro en los sitios generados no tiene logica real - solo muestra inputs sin conectar a Supabase Auth.

4. **El contenido no se personaliza**: La funcion `enrichContentWithLLM` retorna vacio `{}` despues de remover los proveedores de IA, dejando todo el contenido como texto generico de template.

5. **Duplicacion de pantalla**: El `sandbox` sin `allow-same-origin` soluciona la duplicacion pero rompe la funcionalidad de base de datos. Se necesita un enfoque diferente.

---

## Solucion Propuesta

### 1. Corregir el sandbox del iframe para permitir CRUD

**Archivo**: `src/components/builder/PreviewPanel.tsx`

- Cambiar `sandbox="allow-scripts"` a `sandbox="allow-scripts allow-same-origin allow-forms"`
- Mejorar el `injectNavigationGuard` para interceptar TODAS las formas de navegacion de manera robusta:
  - Override de `window.location` setter
  - Override de `history.pushState` y `history.replaceState`
  - Bloqueo de `window.open`
  - Interceptar `<a>` clicks que apunten fuera del contenido
  - Permitir hash links (`#seccion`) y protocolos seguros (`mailto:`, `tel:`)

### 2. Convertir `composeReactHtml` a generar React real

**Archivo**: `supabase/functions/builder-ai/index.ts`

- Reescribir `composeReactHtml` para que genere componentes React reales usando la misma estrategia de CDN que `templates.ts` (React 18 via unpkg + Babel standalone)
- Los componentes incluiran:
  - `useState` para formularios y tabs
  - `useEffect` para animaciones con IntersectionObserver
  - Manejo de estado para auth tabs (login/registro)
  - Integracion directa con el CRUD SDK via `window.DOKU_CRUD`

### 3. Conectar formularios de auth a Supabase Auth real

**Archivo**: `supabase/functions/builder-ai/index.ts` (seccion auth del template)

- El formulario de login/registro se conectara al Supabase Auth client
- Inyectar el SDK de Supabase (via CDN) en los sitios generados que tengan auth
- Los formularios usaran `supabase.auth.signUp()` y `supabase.auth.signInWithPassword()`
- Mostrar mensajes de exito/error reales
- Guardar sesion del usuario

### 4. Mejorar contenido de templates con datos contextuales

**Archivo**: `supabase/functions/builder-ai/index.ts`

- En lugar de depender de IA externa, mejorar la funcion `enrichContentWithLLM` para generar contenido contextual basado en el intent y nombre del negocio usando templates de texto predefinidos mas variados
- Crear un banco de textos por industria (subtitulos hero, descripciones about, testimonios) con variaciones aleatorias

### 5. Verificar que el CRUD SDK funcione end-to-end

- Probar que las tablas se crean automaticamente segun el intent
- Probar que el CRUD SDK puede leer/escribir datos desde el preview
- Verificar que los formularios de auth registran usuarios reales

---

## Detalles Tecnicos

### Cambios en PreviewPanel.tsx

```text
iframe sandbox="allow-scripts allow-same-origin allow-forms"

Navigation guard mejorado:
- document.addEventListener('click', handler) - bloquea links externos
- Object.defineProperty(window, 'location', {...}) - bloquea reasignacion
- window.open = () => null
- history.pushState/replaceState override
- Permite: #hash, mailto:, tel:, javascript:void
- Bloquea: URLs absolutas, rutas relativas que salgan del contenido
```

### Estructura del React generado

```text
<!DOCTYPE html>
<html>
<head>
  <script src="react@18/umd/react.production.min.js">
  <script src="react-dom@18/umd/react-dom.production.min.js">
  <script src="@babel/standalone/babel.min.js">
  <script src="@supabase/supabase-js@2"> (solo si auth habilitado)
  <style>CSS variables + clases</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    // Componentes React con useState, useEffect
    function Navbar() { ... }
    function Hero() { ... }
    function Features() { ... }
    function AuthSection() { 
      // Supabase auth real
      const [mode, setMode] = useState('login');
      const handleSubmit = async () => {
        const { error } = await supabase.auth.signUp({...});
      };
    }
    function App() { return <>...</> }
    ReactDOM.createRoot(root).render(<App/>);
  </script>
  <script>CRUD SDK</script>
</body>
</html>
```

### Orden de implementacion

1. Fix sandbox + navigation guard (PreviewPanel.tsx)
2. Convertir composeReactHtml a React real (builder-ai/index.ts)
3. Integrar Supabase Auth en templates de auth
4. Enriquecer contenido contextual
5. Deploy y prueba end-to-end
