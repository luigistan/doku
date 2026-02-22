

# 🧠 Web Builder Studio - Interface de Desarrollo

## Visión General
Crear una interfaz estilo IDE/chat similar a Lovable.dev con un panel de conversación y un panel de preview en tiempo real. El sistema tendrá dos modos de operación: **Modo Brain** (planificación) y **Modo Ejecutar** (generación de código).

---

## Fase 1: Layout Principal

### Panel dividido (Split View)
- **Panel izquierdo**: Chat/Conversación con el usuario
- **Panel derecho**: Preview del sitio web generado
- Paneles redimensionables con drag handle
- Header con logo, nombre del proyecto y controles

---

## Fase 2: Panel de Conversación

### Visor de mensajes
- Burbujas de chat diferenciadas (usuario vs sistema)
- Área de input con textarea expandible y botón de enviar
- Scroll automático al último mensaje
- Indicador de "escribiendo..."

### Selector de Modo (Toggle)
- **🧠 Modo Brain**: El sistema analiza, pregunta y planifica antes de ejecutar. Muestra un plan estructurado con pasos antes de generar código
- **⚡ Modo Ejecutar**: El sistema genera directamente el código/template basado en el input del usuario
- Toggle visible en la parte superior del chat con indicador visual del modo activo

---

## Fase 3: Panel de Preview

### Vista previa en vivo
- Iframe que renderiza el HTML/CSS/JS generado
- Barra superior con URL simulada del preview
- Botones de responsive (desktop, tablet, móvil)
- Botón de refrescar preview
- Indicador de estado (cargando, listo, error)

---

## Fase 4: Sistema de Templates (Motor sin IA)

### Generador basado en reglas
- Catálogo de templates predefinidos (landing page, portfolio, blog, dashboard, e-commerce)
- Cuando el usuario describe lo que quiere, el sistema identifica palabras clave y selecciona el template más cercano
- En Modo Brain: muestra el plan de qué template y componentes se usarán
- En Modo Ejecutar: genera el código directamente en el preview

---

## Fase 5: Preparación para futuras integraciones
- Estructura modular lista para conectar Supabase (base de datos, auth)
- Arquitectura preparada para generar links de preview compartibles
- Estado global del proyecto (mensajes, código generado, configuración)

---

## Diseño Visual
- Tema oscuro estilo IDE moderno
- Colores accent en azul/púrpura para el modo Brain y verde para modo Ejecutar
- Tipografía monospace en el preview, sans-serif en el chat
- Animaciones sutiles en transiciones de modo

