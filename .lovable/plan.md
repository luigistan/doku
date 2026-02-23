

# Plan: Corregir el error de carga recursiva del iframe (duplicacion de pantalla)

## Problema

Cuando el usuario hace clic en links de navegacion del sitio generado (ej. "Inicio", "Productos", "Contacto" en el E-Shop), la pagina completa de DOKU Builder se carga dentro del iframe del preview, causando una "pantalla duplicada" recursiva.

## Causa raiz

El navigation guard actual tiene varias debilidades:

1. **`e.target.closest('a')` falla con SVGs**: Si el click target es un elemento SVG dentro de un link, `closest` puede no encontrar el `<a>` padre, permitiendo la navegacion
2. **No bloquea cambios de `location`**: JavaScript puede cambiar `window.location.href` directamente y el guard no lo intercepta
3. **`beforeunload` no previene navegacion en iframes**: Los navegadores ignoran `e.preventDefault()` en `beforeunload` dentro de iframes con `allow-same-origin`
4. **Links generados con `href="/"`**: El LLM genera links con `href="/"` o `href="/productos"` que, al no ser `#hash`, deberian bloquearse pero pueden escapar

## Solucion

Reforzar el navigation guard en `PreviewPanel.tsx` con multiples capas de proteccion:

### Cambios en `src/components/builder/PreviewPanel.tsx`

Actualizar la funcion `injectNavigationGuard` para agregar:

1. **Click handler mas robusto**: Usar `composedPath()` para encontrar el `<a>` ancestro incluso con SVGs y Shadow DOM
2. **Convertir links peligrosos a `#`**: Un MutationObserver que automaticamente convierte cualquier `href` que no sea `#hash`, `mailto:`, `tel:` a `href="#"` tan pronto como aparece en el DOM
3. **Bloquear `location` setter**: Interceptar asignaciones a `window.location` usando `Object.defineProperty` para bloquear navegacion programatica
4. **Scroll suave para links de seccion**: Los links tipo "Inicio", "Productos" se convierten en scroll suave a la seccion correspondiente (buscando por id o por texto)

```text
Flujo corregido:
  1. HTML se carga en iframe
  2. MutationObserver escanea todos los <a> y convierte hrefs peligrosos a "#"
  3. Click handler usa composedPath() para capturar clicks en SVGs dentro de <a>
  4. location.href bloqueado por Object.defineProperty
  5. No hay forma de que el iframe navegue a la URL del builder
```

### Detalle del MutationObserver (sanitizar links)

Escanea el DOM al cargar y observa cambios para:
- `href="/"` se convierte a `href="#"`
- `href="/productos"` se convierte a `href="#productos"`
- `href="https://..."` se convierte a `href="#"` (links externos)
- `href="#contacto"` se mantiene igual (ya es hash)
- `href="mailto:..."` se mantiene igual
- `href="tel:..."` se mantiene igual

### Detalle del bloqueo de location

```text
// Prevenir window.location = "..."
Object.defineProperty(window, 'location', {
  configurable: false,
  get: function() { return currentLocation; },
  set: function() { /* bloqueado */ }
});
```

Nota: si `Object.defineProperty` en `location` no es posible (restriccion del navegador), se usa un `setInterval` de 100ms que detecta si la URL del iframe cambio y la revierte.

### Tambien aplicar a `src/pages/PublicPreview.tsx`

El preview publico (`/p/:slug` y `/preview/:projectId`) tambien tiene un iframe sin navigation guard. Aplicar la misma proteccion para evitar el mismo problema en la vista publica.

## Resultado esperado

- Los links de navegacion del sitio generado no causan recarga
- Los links `#seccion` hacen scroll suave a la seccion correspondiente
- Los formularios siguen funcionando con el CRUD SDK
- No hay forma de que el iframe cargue la URL del builder
