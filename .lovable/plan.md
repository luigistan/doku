

# DOKU AI - Renombrar + Sistema de Conocimiento + Persistencia de Proyectos

## Resumen

Se renombrara el sistema completo de "Web Builder Studio / BuilderAI Engine" a **DOKU AI**, se le inyectara conocimiento profundo sobre programacion y diseno web, se implementara autenticacion de usuarios con Supabase, persistencia de proyectos (crear, guardar, listar, cargar) y funcionalidades adicionales para hacerlo autosuficiente.

---

## Fase 1: Renombrar a DOKU AI

### Archivos a modificar:
- **`src/components/builder/Header.tsx`**: Cambiar "W" por "D", "Web Builder Studio" por "DOKU AI"
- **`src/hooks/useBuilderState.ts`**: Cambiar mensaje de bienvenida de "BuilderAI Engine" a "DOKU AI"
- **`src/components/builder/PreviewPanel.tsx`**: Cambiar URL simulada de "preview.webbuilder.studio" a "preview.doku.ai"
- **`supabase/functions/builder-ai/index.ts`**: Cambiar la referencia en el footer de "BuilderAI Engine" a "DOKU AI"
- **`index.html`**: Cambiar title y meta tags a "DOKU AI"
- **`README.md`**: Renombrar toda la documentacion a DOKU AI

---

## Fase 2: Ensenarle a Programar y Disenar

Expandir el edge function `builder-ai` con un **sistema de conocimiento** integrado que le permita generar sitios de mayor calidad:

### Conocimiento de Diseno (inyectado en el Template Composer)
- **Tipografia**: Usar Google Fonts (Inter, Poppins, Playfair Display). Jerarquia h1 > h2 > h3 con escalas armoniosas
- **Espaciado**: Sistema de 8px grid. Padding/margin consistente
- **Color**: Teoria del color aplicada. Paletas con contraste WCAG AA. Colores primario, secundario, acento
- **Layout**: Principios de diseno responsive. Mobile-first. Max-width containers. CSS Grid + Flexbox
- **Componentes**: Sombras suaves, border-radius consistente, transiciones/animaciones sutiles (hover, scroll)
- **Imagenes**: Usar Unsplash via URL directa (source.unsplash.com) para fotos reales en lugar de emojis

### Conocimiento de Programacion (bloques HTML mejorados)
- **HTML semantico**: Usar `<header>`, `<main>`, `<section>`, `<article>`, `<footer>` correctamente
- **CSS moderno**: Variables CSS custom properties, clamp() para responsive, aspect-ratio, scroll-behavior smooth
- **JavaScript basico**: Animaciones con IntersectionObserver, menu hamburguesa funcional, smooth scroll, dark/light toggle
- **Accesibilidad**: aria-labels, focus states, skip-to-content link, alt text
- **SEO**: Meta description, Open Graph tags, estructura de headings correcta

### Implementacion tecnica
Se mejoraran todos los bloques HTML en el edge function para que generen codigo de mayor calidad:
- Google Fonts embebido via `<link>`
- Imagenes reales de Unsplash basadas en la industria
- CSS variables para colores (facil de cambiar)
- JavaScript para interactividad (menu mobile, scroll animations, form validation)
- Meta tags de SEO y Open Graph

---

## Fase 3: Persistencia de Proyectos con Supabase

### Tablas de base de datos (migracion SQL)

```text
profiles
  - id (uuid, PK, FK -> auth.users)
  - email (text)
  - display_name (text)
  - avatar_url (text)
  - created_at (timestamptz)

projects
  - id (uuid, PK)
  - user_id (uuid, FK -> auth.users)
  - name (text)
  - description (text)
  - html (text) -- el codigo generado
  - intent (text) -- tipo de sitio
  - entities (jsonb) -- entidades extraidas
  - thumbnail_url (text)
  - is_public (boolean, default false)
  - created_at (timestamptz)
  - updated_at (timestamptz)

project_versions
  - id (uuid, PK)
  - project_id (uuid, FK -> projects)
  - html (text)
  - message (text) -- que cambio se hizo
  - version_number (int)
  - created_at (timestamptz)

chat_messages
  - id (uuid, PK)
  - project_id (uuid, FK -> projects)
  - role (text) -- 'user' o 'system'
  - content (text)
  - plan (jsonb, nullable)
  - created_at (timestamptz)
```

### RLS Policies
- Usuarios solo pueden ver/editar sus propios proyectos
- Proyectos marcados como `is_public` pueden ser vistos por todos (solo lectura)
- Chat messages ligados al proyecto del usuario

### Trigger
- Auto-crear perfil en `profiles` al registrarse

---

## Fase 4: Autenticacion

### Nuevas paginas y componentes
- **`/auth`**: Pagina de login/registro con email y password
- **`AuthProvider`**: Context provider con estado de sesion
- **`ProtectedRoute`**: Wrapper que redirige a `/auth` si no esta logueado
- Actualizar `App.tsx` con rutas protegidas

---

## Fase 5: Dashboard de Proyectos

### Nueva pagina: `/dashboard`
- Lista de proyectos del usuario en cards
- Boton "Nuevo Proyecto" que abre el builder
- Cada card muestra: nombre, tipo de sitio, fecha, preview thumbnail
- Acciones: abrir, duplicar, eliminar, compartir (toggle is_public)

### Flujo actualizado
1. Usuario se registra/logea -> llega al Dashboard
2. Crea un nuevo proyecto -> se abre el Builder (pagina actual)
3. Al generar un sitio, se guarda automaticamente en Supabase
4. Cada mensaje del chat se guarda en `chat_messages`
5. Al hacer cambios, se crea una version en `project_versions`
6. Puede volver al Dashboard y ver/cargar todos sus proyectos

---

## Fase 6: Funcionalidades Autosuficientes Adicionales

### 1. Exportar HTML
- Boton "Descargar" en el PreviewPanel
- Genera un archivo .html descargable con todo el codigo

### 2. Compartir con Link Publico
- Toggle "Hacer publico" en el proyecto
- Ruta `/preview/:projectId` que renderiza el HTML sin necesidad de login

### 3. Historial de Versiones
- Panel lateral en el Builder para ver versiones anteriores
- Restaurar cualquier version con un clic

### 4. Editar CSS en Vivo
- Panel de "Estilos rapidos" para cambiar colores, fuentes, espaciado sin escribir
- Se aplican los cambios al HTML en tiempo real

### 5. Templates Premade
- Galeria de templates que el usuario puede elegir como punto de partida
- Se muestran como cards con preview antes de seleccionar

---

## Seccion Tecnica

### Archivos nuevos a crear
- `src/contexts/AuthContext.tsx` - Provider de autenticacion
- `src/pages/Auth.tsx` - Pagina de login/registro
- `src/pages/Dashboard.tsx` - Lista de proyectos
- `src/pages/PublicPreview.tsx` - Vista publica de un proyecto
- `src/components/builder/ProjectSidebar.tsx` - Panel lateral de versiones
- `src/components/builder/ExportButton.tsx` - Boton de exportar HTML
- `src/services/projectService.ts` - CRUD de proyectos con Supabase

### Archivos a modificar
- `src/App.tsx` - Agregar rutas y AuthProvider
- `src/pages/Index.tsx` - Conectar con proyecto activo de Supabase
- `src/hooks/useBuilderState.ts` - Auto-guardar en Supabase
- `src/components/builder/Header.tsx` - Renombrar + agregar nombre de proyecto y boton de usuario
- `src/components/builder/PreviewPanel.tsx` - Agregar boton exportar y compartir

### Orden de implementacion recomendado
1. Renombrar a DOKU AI (rapido, todos los archivos)
2. Mejorar bloques HTML con conocimiento de diseno/programacion
3. Crear tablas en Supabase (migracion)
4. Implementar autenticacion
5. Dashboard de proyectos
6. Auto-guardado y versiones
7. Exportar y compartir

