
## Plan: Unificar URL del preview con la URL real del proyecto

### Problema
Hay dos URLs diferentes en el sistema:
- **ProjectSettings** (modal de configuracion): `https://www.doku.red/p/{slug}`
- **PreviewPanel** (barra de URL del builder): `doku.ai/s/{slug}`

Estas deben ser la misma URL. La URL correcta es la de ProjectSettings: `doku.red/p/{slug}`.

### Cambio

**Archivo: `src/components/builder/PreviewPanel.tsx` (linea 89)**

Cambiar la URL en la barra del preview para que coincida con la URL real del proyecto:

| Antes | Despues |
|-------|---------|
| `doku.ai/s/${projectSlug}` | `doku.red/p/${projectSlug}` |
| `doku.ai/preview/...` | `doku.red/preview/...` |

La logica se mantiene igual:
- Si es publico y tiene slug: mostrar `doku.red/p/{slug}`
- Si es publico sin slug: mostrar `doku.red/preview/...`
- Si es privado: mostrar el candado con "Privado"

### Detalle tecnico

Solo se modifica 1 archivo, 2 lineas en `src/components/builder/PreviewPanel.tsx`:
- Linea 89: `doku.ai/s/${projectSlug}` -> `doku.red/p/${projectSlug}`
- Linea 91: `doku.ai/preview/...` -> `doku.red/preview/...`
