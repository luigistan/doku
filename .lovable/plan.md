
## Plan: Templates con Preview Visual en el Chat + Multiples Estilos

### Problema actual

1. Los templates en el chat son solo botones de texto sin mostrar como se ve cada uno
2. Solo hay 1 estilo por categoria (1 ecommerce, 1 restaurante, etc.)
3. El usuario no puede comparar visualmente antes de elegir

### Solucion

#### Parte 1: Sistema de Template Cards con Preview en el Chat

**Nuevo componente `TemplateCard.tsx`**
- Card compacta con mini-preview del template usando un iframe en miniatura (200x120px)
- Muestra: nombre, estilo, icono y una miniatura real del HTML renderizado
- Boton "Vista previa" que abre un popup fullscreen con el sitio completo
- Boton "Elegir este" que selecciona el template y lo envia al builder

**Nuevo componente `TemplatePreviewModal.tsx`**
- Modal fullscreen (o 90vh) que renderiza el HTML completo del template en un iframe
- Barra superior con nombre del template, boton "Elegir este template" y boton cerrar
- Toggles de viewport (desktop/tablet/mobile) para ver como se ve en cada dispositivo

**Refactor de `TemplateSelector.tsx`**
- En lugar de botones simples, mostrar las TemplateCards agrupadas por categoria
- Filtro por categoria en la parte superior (Todos, Tiendas, Restaurantes, etc.)
- Scroll horizontal por categoria para que no ocupe demasiado espacio vertical
- Cada categoria muestra sus variantes de estilo

#### Parte 2: Multiples Estilos por Categoria

Agregar variantes de estilo para cada tipo de template. Cada variante comparte el mismo `id` base pero tiene un `styleId` diferente:

| Categoria | Estilos nuevos |
|-----------|---------------|
| E-Commerce | Moderno (actual), Minimalista, Colorido/Neon |
| Restaurante | Elegante (actual), Casual/Moderno, Rustico |
| Landing Page | Corporativo (actual), Startup Gradient, Minimalista |
| Portfolio | Developer (actual), Fotografo, Creativo |
| Blog | Tech (actual), Magazine, Personal |
| Dashboard | Dark (actual), Light/Clean, Colorful |
| Fitness | Energetico (actual), Zen/Yoga, CrossFit |
| Clinica | Profesional (actual), Moderno, Calido |

Esto implica crear ~16 nuevas variantes de templates HTML (2 adicionales por las 8 categorias principales).

#### Parte 3: Estructura de Datos Actualizada

**Actualizar `Template` type en `src/types/builder.ts`:**
```typescript
export interface Template {
  id: string;           // "ecommerce"
  styleId: string;      // "ecommerce-modern", "ecommerce-minimal"
  name: string;         // "E-Commerce"
  styleName: string;    // "Moderno", "Minimalista"
  keywords: string[];
  description: string;
  html: string;
  planSteps: string[];
  thumbnail?: string;   // emoji o icono representativo
}
```

#### Parte 4: Aprendizaje Continuo de Templates Preferidos

- Cuando el usuario elige un estilo especifico, guardar esa preferencia en `ai_learning_logs`
- La proxima vez que pida el mismo tipo de sitio, priorizar el estilo que mas le gusto
- Si rechaza un estilo, bajar su prioridad para ese usuario

### Archivos a modificar/crear

| Archivo | Cambio |
|---------|--------|
| `src/types/builder.ts` | Agregar `styleId`, `styleName`, `thumbnail` al tipo Template |
| `src/lib/templates.ts` | Agregar 16+ variantes de estilos nuevos con HTML completo |
| `src/components/builder/TemplateCard.tsx` | NUEVO: card con mini-preview iframe |
| `src/components/builder/TemplatePreviewModal.tsx` | NUEVO: modal fullscreen con preview del template |
| `src/components/builder/TemplateSelector.tsx` | Refactor: grid de cards con filtro por categoria, mini-previews |
| `src/components/builder/ChatPanel.tsx` | Pasar templates como prop, integrar nuevo selector |
| `src/hooks/useBuilderState.ts` | Manejar seleccion de template con styleId |

### Detalle tecnico del mini-preview

El mini-preview usa un iframe escalado al 20% con CSS transform:
```css
iframe {
  width: 1280px;
  height: 800px;
  transform: scale(0.15);
  transform-origin: top left;
  pointer-events: none;
}
```
Dentro de un contenedor de ~200x120px con `overflow: hidden`. Esto muestra una miniatura real del sitio sin screenshots.

### Flujo del usuario

1. Usuario abre el builder, ve el mensaje de bienvenida
2. Debajo aparecen las categorias (Tiendas, Restaurantes, etc.)
3. Click en una categoria expande las variantes de estilo con mini-previews
4. Click en "Vista previa" abre modal fullscreen para ver el sitio completo
5. Click en "Elegir" envia el prompt con el estilo especifico al builder
6. El sistema usa ese template como base y lo personaliza con Ollama

### Nota importante sobre scope

Dado que crear 16 variantes completas de HTML es un volumen muy alto de codigo, se implementaran en fases:
- **Fase 1** (este plan): Infraestructura de preview cards + modal + 2-3 variantes para E-Commerce y Restaurante como prueba de concepto
- **Fase 2** (siguiente): Completar variantes para todas las categorias restantes

Esto permite validar el concepto rapidamente sin un cambio masivo de una sola vez.
