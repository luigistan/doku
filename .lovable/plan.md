

# Plan: Custom Slug URLs + Limpieza de Lovable + Mejoras TypeScript

## 1. Agregar columna `slug` a la tabla `projects`

Se creara una migracion SQL para agregar una columna `slug` (texto unico) a la tabla `projects`. Este slug sera el identificador personalizable para URLs publicas como `www.doku.red/mi-proyecto`.

- Columna: `slug TEXT UNIQUE`
- Constraint: solo caracteres validos (letras, numeros, guiones)
- Se auto-genera un slug basado en el nombre del proyecto si el usuario no lo personaliza

## 2. Actualizar Project Settings con campo de Slug

Se modificara `ProjectSettings.tsx` para incluir:

- **Campo "URL personalizada"**: Input editable que muestra `www.doku.red/` + slug
- **Validacion en tiempo real**: Al escribir, se verifica en Supabase si el slug ya esta en uso
- **Indicador visual**: Check verde si esta disponible, X roja si ya existe
- **Auto-generacion**: Al crear un proyecto, se genera un slug automatico basado en el nombre (ej: "Mi Cafeteria" -> "mi-cafeteria")
- Se sanitiza el input (minusculas, sin espacios, sin caracteres especiales)

## 3. Actualizar rutas y PublicPreview

- Agregar ruta `/p/:slug` en `App.tsx` para acceder por slug personalizado
- Mantener `/preview/:projectId` como fallback por UUID
- Actualizar `PublicPreview.tsx` para buscar por slug o por ID

## 4. Actualizar projectService.ts

Nuevas funciones:
- `checkSlugAvailable(slug: string)`: Verifica si el slug esta disponible
- `updateProject` ahora acepta `slug` en los updates
- `getProjectBySlug(slug: string)`: Busca proyecto publico por slug

## 5. Eliminar carpeta `.lovable` y referencias

- Eliminar `.lovable/plan.md`
- Eliminar referencia a `lovable-tagger` de `vite.config.ts` (el import de `componentTagger`)
- Nota: `lovable-tagger` en package.json es una dev dependency del sistema y no se puede desinstalar, pero se removera del codigo activo

## 6. Mejorar templates con mas conocimiento TypeScript

Se mejoraran los templates en `src/lib/templates.ts` para incluir:
- Interfaces TypeScript explicitas en los componentes generados (ej: `interface NavItem { label: string; href: string }`)
- Tipado de props con `React.FC<Props>`
- Tipado de eventos (`React.FormEvent<HTMLFormElement>`, `React.ChangeEvent<HTMLInputElement>`)
- Custom hooks tipados (`useOnScreen`, `useScrollPosition`)
- Mas templates nuevos: **Login/Auth**, **Pricing Page**, **404 Page**

---

## Seccion Tecnica

### Migracion SQL
```text
ALTER TABLE projects ADD COLUMN slug TEXT UNIQUE;
CREATE INDEX idx_projects_slug ON projects(slug);
```

### Archivos a modificar
- `supabase/migrations/` - Nueva migracion para slug
- `src/components/builder/ProjectSettings.tsx` - Agregar campo slug con validacion
- `src/services/projectService.ts` - Funciones checkSlugAvailable, getProjectBySlug, updateProject con slug
- `src/pages/PublicPreview.tsx` - Buscar por slug ademas de por ID
- `src/App.tsx` - Agregar ruta `/p/:slug`
- `src/pages/Builder.tsx` - Pasar slug a ProjectSettings
- `vite.config.ts` - Remover import de lovable-tagger

### Archivos a eliminar
- `.lovable/plan.md` (y la carpeta `.lovable`)

### Archivos a crear
- Nueva migracion SQL para columna slug

