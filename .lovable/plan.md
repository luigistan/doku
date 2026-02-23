

## Plan: Loader animado "DOKU" con porcentaje en el preview

Cuando el preview esta en estado `loading`, en lugar de mostrar el iframe con el HTML por defecto, se mostrara una animacion de la palabra **DOKU** con un efecto de relleno progresivo y un porcentaje que simula el avance del analisis.

### Cambios

**Archivo: `src/components/builder/PreviewPanel.tsx`**

1. Agregar un estado local `progress` (0-100) que se incrementa gradualmente mientras `preview.status === "loading"`
   - Sube rapido al principio (0-30 en ~3s)
   - Mas lento en el medio (30-70 en ~30s)
   - Muy lento al final (70-95 en ~60s)
   - Nunca llega a 100 hasta que el status cambie a "ready"
   - Se resetea a 0 cuando cambia a "idle" o "ready"

2. Renderizar un overlay sobre el iframe cuando `status === "loading"`:
   - Fondo oscuro (bg-background)
   - La palabra **DOKU** en texto grande (~80px) con efecto de relleno usando CSS `background-clip: text` y un gradiente que avanza segun el porcentaje
   - Debajo: porcentaje numerico (ej: "42%")
   - Debajo: texto "Analizando con Ollama..."
   - Animacion suave con CSS transitions

3. El efecto de relleno se logra con:
   ```css
   background: linear-gradient(to right, #8B5CF6 {progress}%, transparent {progress}%);
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
   ```
   Donde el color solido (morado/brain) "llena" las letras de izquierda a derecha.

### Comportamiento del progreso simulado

| Rango | Velocidad | Duracion aprox |
|-------|-----------|----------------|
| 0-30% | Rapido | 3 segundos |
| 30-60% | Medio | 20 segundos |
| 60-85% | Lento | 40 segundos |
| 85-95% | Muy lento | 60 segundos |
| 95-100% | Solo al completar | Instantaneo |

Esto da feedback visual constante al usuario mientras Ollama procesa.

### Archivo unico a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/builder/PreviewPanel.tsx` | Agregar overlay de loading con animacion DOKU + porcentaje |

