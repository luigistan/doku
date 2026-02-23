

## Plan: Hacer que DOKU sea inteligente con mensajes conversacionales y arreglar el preview

### Problema 1: El sistema no distingue mensajes conversacionales de peticiones de sitio

Cuando el usuario escribio "revisa por que no se muestra el preview", el sistema lo clasifico como intent "blog" con 10% de confianza y genero un sitio blog. Esto pasa porque **toda entrada del usuario pasa por el pipeline de generacion** sin verificar si es una pregunta, queja o mensaje conversacional.

### Problema 2: El preview no renderiza

Los logs muestran `[Hybrid] Content enrichment complete: 0/4 sections enriched` -- el LLM no genera HTML suficiente y el fallback hibrido produce JSX+React que requiere Babel CDN (~4MB). Esto se cuelga en el iframe con sandbox.

---

### Solucion

#### Cambio 1: Detectar mensajes conversacionales (builder-ai/index.ts)

Agregar un detector de mensajes no-generativos **antes** del pipeline de clasificacion. Si el mensaje es una pregunta sobre el sistema, queja, saludo, o instruccion de debugging, responder con un mensaje conversacional en lugar de generar un sitio.

```typescript
// Nuevos patrones conversacionales (antes del pipeline de clasificacion)
const conversationalPatterns = [
  /(?:no\s+(?:se\s+)?(?:muestra|carga|ve|aparece|funciona|renderiza))/i,
  /(?:por\s*que|porque)\s+(?:no|el|la|se)/i,
  /(?:revisa|revisar|checa|checar|verifica|verificar)\s/i,
  /(?:ayuda|help|problema|error|bug|falla)/i,
  /(?:como\s+(?:hago|uso|funciona|puedo))/i,
  /(?:hola|buenos?\s+dias?|buenas?\s+(?:tardes?|noches?))\s*[!?.]*$/i,
  /(?:gracias|thanks|ok|vale|listo|entendido)\s*[!?.]*$/i,
  /(?:que\s+(?:es|hace|puedo|significa))/i,
  /(?:no\s+(?:entiendo|se|puedo))/i,
  /(?:screenshot|captura|pantallazo)/i,
];
```

Si el mensaje matchea y NO contiene keywords de generacion (restaurante, landing, tienda, etc.), responder con:

```json
{
  "intent": "conversational",
  "confidence": 1.0,
  "label": "Conversacion",
  "entities": { "businessName": "", "sections": [], "colorScheme": "", "industry": "" },
  "html": "",
  "conversationalResponse": "Mensaje contextual de ayuda"
}
```

#### Cambio 2: Manejar respuesta conversacional en el frontend (useBuilderState.ts)

Si `result.intent === "conversational"`, mostrar solo el mensaje de texto sin generar preview ni pedir confirmacion:

```typescript
if (result.intent === "conversational") {
  setMessages(prev => [...prev, {
    id: (Date.now() + 1).toString(),
    role: "system",
    content: result.conversationalResponse || "No entendi tu mensaje. Describeme que sitio quieres crear.",
    timestamp: new Date(),
  }]);
  setIsTyping(false);
  setPreview(p => ({ ...p, status: "idle" }));
  return;
}
```

#### Cambio 3: Arreglar el preview - Generar HTML puro en vez de React/JSX (builder-ai/index.ts)

El template hibrido actual usa React + Babel CDN que pesa ~4MB y se cuelga. Convertir `composeReactHtml` a `composeHtml` que genere **HTML + Tailwind CSS puro** (sin React, sin Babel):

- Reemplazar `<script src="babel.min.js">` por `<script src="https://cdn.tailwindcss.com"></script>` solamente
- Convertir los componentes JSX a HTML string templates directos
- Usar vanilla JS para interactividad (scroll, mobile menu, intersection observer)
- Esto elimina ~4MB de descarga y renderiza instantaneamente

Estructura del HTML generado:

```text
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>/* CSS variables, animaciones */</style>
</head>
<body class="bg-gray-950 text-white">
  <header><!-- navbar HTML directo --></header>
  <main>
    <section id="hero"><!-- hero --></section>
    <section id="features"><!-- features --></section>
    <!-- mas secciones -->
  </main>
  <footer><!-- footer --></footer>
  <script>/* vanilla JS: scroll, mobile menu, observers */</script>
</body>
</html>
```

#### Cambio 4: Umbral de confianza minimo (builder-ai/index.ts)

Si la confianza es menor a 30%, tratar como mensaje ambiguo y preguntar al usuario que quiere en lugar de generar con datos erroneos (como el caso de "blog" con 10%).

```typescript
if (confidence < 0.3 && !isFollowUp(message)) {
  // Pedir aclaracion en vez de generar
  return conversationalResponse("No estoy seguro de que tipo de sitio quieres. Puedes decirme mas detalles?");
}
```

---

### Resumen de cambios

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/builder-ai/index.ts` | Agregar deteccion de mensajes conversacionales con patrones regex |
| `supabase/functions/builder-ai/index.ts` | Agregar umbral de confianza minimo (30%) para evitar generaciones erroneas |
| `supabase/functions/builder-ai/index.ts` | Convertir `composeReactHtml` de React+Babel a HTML+Tailwind puro |
| `src/hooks/useBuilderState.ts` | Manejar `intent === "conversational"` sin generar preview |
| `src/services/builderService.ts` | Agregar campo `conversationalResponse` al tipo `BuilderResponse` |

### Resultado esperado

- "revisa por que no se muestra el preview" -> respuesta conversacional, sin generar sitio
- "hola" -> saludo, sin generar sitio
- "crea una cafeteria con registro" -> genera sitio normalmente
- El preview carga instantaneamente sin depender de Babel/React CDN (4MB)
- Confianza menor a 30% pide aclaracion en lugar de generar basura

