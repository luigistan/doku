
## Plan: Mejoras al Motor AI, Links de Preview y Efecto "DOKU AI"

### ✅ 1. Efecto "DOKU AI" rellenandose con el progreso — COMPLETADO
- Texto cambiado de "DOKU" a "DOKU AI" en el overlay de carga
- Mantiene el efecto de gradiente que rellena de izquierda a derecha

### ✅ 2. URL clickeable en PreviewPanel — COMPLETADO
- La URL en la barra del preview ahora es un link clickeable cuando es publico
- Abre en nueva pestaña con hover effect

### ✅ 3. Mejorar PublicPreview — COMPLETADO
- Detecta proyectos privados vs no encontrados (mensajes diferentes)
- Botón "Volver al inicio" en todos los estados de error
- Maneja caso de proyecto sin contenido

### ✅ 4. Mejorar inteligencia del AI — COMPLETADO
- Umbral subido de 0.3 a 0.45
- Zona de confirmación 0.45-0.65: pregunta al usuario antes de ejecutar
- Detección de mensajes ambiguos (< 3 tokens con confianza < 0.7)
- Más patrones conversacionales: "qué puedes hacer", "qué es DOKU", capacidades
- Solo ejecuta automáticamente con confianza > 0.65
