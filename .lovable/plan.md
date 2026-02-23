

## Plan: Preview Interactivo en el Homepage + Estrategia de Inteligencia Avanzada

### Parte 1: Demo Interactivo en el Homepage

El mockup estatico actual (lineas 64-106 de `Home.tsx`) se reemplaza con un componente animado que simula en tiempo real como DOKU AI crea un e-commerce paso a paso.

**Nuevo componente: `src/components/home/HeroDemo.tsx`**

Una animacion autonoma que corre en loop infinito simulando una sesion real del builder:

1. **Fase 1 (0-2s)**: Aparece el prompt del usuario con efecto de "typing" letra por letra: *"Quiero una tienda online para vender zapatillas con catalogo y carrito"*
2. **Fase 2 (2-4s)**: El sistema responde con analisis animado (aparecen bullets uno por uno):
   - Tipo: E-Commerce
   - Secciones: 6 detectadas
   - Nombre: Sneaker Store
   - Confianza: 94%
3. **Fase 3 (4-5s)**: Barra de progreso "Generando..." con el efecto DOKU fill
4. **Fase 4 (5-8s)**: En el panel derecho aparece un iframe real con un mini e-commerce HTML (usando uno de los templates existentes de la libreria, escalado al 25%)
5. **Fase 5 (8-10s)**: Pausa para que el usuario vea el resultado
6. **Loop**: Resetea y repite con un prompt diferente (rota entre 3 prompts: tienda, restaurante, portfolio)

**Estructura visual:**
- Misma ventana estilo browser (dots rojo/amarillo/verde + barra URL)
- Lado izquierdo: chat simulado con typing animation
- Lado derecho: preview que transiciona de vacio a un sitio real renderizado en iframe

**Detalles de la animacion:**
- `useEffect` con `setInterval` manejando un state machine (fase actual)
- Typing effect: incrementa un indice de caracteres cada 40ms
- Bullets: aparecen con `opacity` transition cada 400ms
- Preview: fade-in del iframe con `opacity` y `scale` transition
- 3 demos que rotan: E-Commerce, Restaurante, Portfolio
- Los HTML se importan directamente de `src/lib/templates.ts`

**Archivos:**

| Archivo | Cambio |
|---------|--------|
| `src/components/home/HeroDemo.tsx` | NUEVO: componente de demo animado con state machine |
| `src/pages/Home.tsx` | Reemplazar mockup estatico (lineas 64-106) con `<HeroDemo />` |

---

### Parte 2: Estrategia de Inteligencia con Ollama (Nivel Arquitecto)

Actualmente Ollama se usa para generar HTML y para extraer intent (Signal 8). Para convertirlo en un verdadero "arquitecto de sistemas", se necesitan estos cambios en el edge function:

**1. System Prompt de Arquitecto**

Actualizar el prompt de Ollama en `builder-ai/index.ts` para que actue como diseñador de sistemas, no solo generador de HTML. El prompt debe instruirlo a:

- Analizar requerimientos como un arquitecto de software
- Proponer estructura de componentes (Header, Hero, Features, etc.)
- Definir el flujo de datos del sitio
- Generar HTML que siga patrones de diseño profesional
- Responder conversacionalmente cuando el usuario hace preguntas (no todo es "genera un sitio")

**2. Respuesta Estructurada con Tool Calling**

En lugar de pedirle texto libre a Ollama, usar un formato de respuesta estructurada:

```json
{
  "analysis": {
    "intent": "ecommerce",
    "businessName": "Sneaker Store",
    "sections": ["hero", "catalog", "cart", "about", "contact"],
    "colorScheme": "ocean",
    "complexity": "medium"
  },
  "architecture": {
    "components": ["Navbar", "HeroBanner", "ProductGrid", "CartSidebar", "Footer"],
    "dataFlow": "Products -> Cart -> Checkout"
  },
  "html": "... codigo completo ..."
}
```

Esto permite que el sistema ENTIENDA lo que genero y pueda iterar sobre el.

**3. Aprendizaje Continuo en Vivo**

El sistema ya tiene `ai_learning_logs` con 91 entradas. Para que aprenda en vivo:

- Cada vez que un usuario acepta, el sistema incrementa el peso de esos tokens para ese intent
- Cada vez que rechaza, el negative learning reduce la probabilidad de esa combinacion
- Los patrones se recargan en cada request (ya se hace con `queryLearningPatterns()`)
- Agregar un cache de 5 minutos para no consultar la DB en cada request

**4. Memoria de Contexto Mejorada**

Ya se implemento `conversationHistory` y `user_entity_memory`. Para hacerlo mas inteligente:

- Cuando el usuario dice "cambia el color" o "hazlo mas moderno", Ollama recibe el HTML anterior + la instruccion y genera solo las modificaciones
- El edge function detecta si es un mensaje de "modificacion" (contiene "cambia", "modifica", "hazlo", "ponle") vs uno de "creacion nueva"

**Archivos:**

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` | System prompt de arquitecto, deteccion de modificacion vs creacion, cache de patterns |

---

### Resumen de prioridades

1. **HeroDemo interactivo** - impacto visual inmediato en la homepage
2. **System prompt de arquitecto** - mejora calidad de generacion
3. **Deteccion modificacion vs creacion** - mejora la experiencia conversacional
4. **Cache de learning patterns** - mejora rendimiento

