

## Homepage Full Widescreen

### Problema actual

La pagina Home tiene dos restricciones de ancho:

1. **Global en `src/App.css`**: `#root { max-width: 1280px }` -- limita TODA la app a 1280px
2. **Por seccion en `Home.tsx`**: Contenedores con `max-w-4xl` (896px) y `max-w-6xl` (1152px)

### Cambios

**1. `src/App.css`** -- Eliminar la restriccion global de `#root`
- Quitar `max-width: 1280px`, `margin: 0 auto`, `padding: 2rem`, y `text-align: center`
- Este archivo tiene estilos legacy de Vite que ya no aplican

**2. `src/pages/Home.tsx`** -- Expandir todas las secciones a full-width
- **Nav**: Cambiar `max-w-6xl` a `max-w-7xl` para que el nav use mas espacio pero mantenga limites razonables
- **Hero**: Cambiar `max-w-4xl` a `max-w-5xl` para el texto, pero el HeroDemo usara ancho completo
- **Stats**: Cambiar `max-w-4xl` a `max-w-7xl` para distribuir mejor los stats
- **Features**: Cambiar `max-w-6xl` a `max-w-7xl` para que las 3 columnas tengan mas espacio
- **How it works**: Cambiar `max-w-4xl` a `max-w-5xl`
- **Collaborate**: Cambiar `max-w-4xl` a `max-w-6xl`
- **CTA**: Cambiar `max-w-2xl` a `max-w-3xl`
- **Footer**: Cambiar `max-w-6xl` a `max-w-7xl`
- Las secciones con fondo (stats, how it works) ya son full-width en su contenedor exterior

### Resultado

El sitio ocupara todo el ancho de pantalla en monitores grandes (1920px+), con contenido que respira y se distribuye mejor. Las secciones con fondo se extienden edge-to-edge. El contenido de texto mantiene limites legibles pero mas amplios.

