

# Plan: Mejorar la calidad del HTML generado por Ollama y hacerlo React/TypeScript

## Problema

El prompt actual le dice a Ollama que genere HTML plano ("El HTML debe funcionar de forma independiente sin JavaScript frameworks"), lo que produce sitios feos y basicos. Mientras tanto, los templates locales usan componentes React renderizados con Babel standalone y se ven profesionales.

## Causa raiz

1. El `OLLAMA_SYSTEM_PROMPT` pide HTML plano sin frameworks
2. No se usa la funcion `reactWrap()` para envolver el output del LLM
3. El prompt no incluye ejemplos de la calidad esperada ni las convenciones de estilo del proyecto

## Solucion

Cambiar el sistema para que Ollama genere **codigo de componente React** (igual que los templates locales) y luego envolver ese codigo con la misma funcion `reactWrap()` del lado del servidor.

### Cambios en `supabase/functions/builder-ai/index.ts`

**1. Agregar la funcion `reactWrap()` al edge function**

Copiar la misma logica de `src/lib/templates.ts` al edge function para envolver el output del LLM:

```text
function reactWrap(componentCode, title) {
  return `<!DOCTYPE html>
  <html lang="es">
  <head>
  <script src="react@18/umd/react.production.min.js"></script>
  <script src="react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="@babel/standalone/babel.min.js"></script>
  <link href="Inter+Playfair Display" rel="stylesheet">
  <style>/* base styles */</style>
  </head>
  <body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
  ${componentCode}
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
  </script>
  </body></html>`;
}
```

**2. Reescribir el `OLLAMA_SYSTEM_PROMPT`**

Cambiar las instrucciones para que el LLM genere codigo React en lugar de HTML plano:

- Pedir que genere un componente React funcional con `function App()`
- Usar `React.useState`, `React.useEffect`, `React.useRef` (disponibles globalmente)
- Estilos inline con objetos JavaScript (camelCase: `backgroundColor`, `fontSize`, etc.)
- Incluir hooks personalizados como `useOnScreen` para animaciones de scroll
- Google Fonts: Inter para body, Playfair Display para titulos
- Tema oscuro con gradientes (background: `#0a0a0f`)
- Incluir un ejemplo concreto de como debe verse el codigo (basado en los templates existentes)
- Mantener las reglas de `data-doku-table` y `name` para formularios

La seccion clave del nuevo prompt seria:

```text
REGLAS PARA EL CODIGO REACT:
- Genera SOLO el codigo del componente React (sin <!DOCTYPE>, sin <html>)
- Debe empezar con funciones auxiliares y terminar con function App()
- Usa React.useState, React.useEffect, React.useRef (estan disponibles globalmente)
- Estilos INLINE con objetos JavaScript: style={{backgroundColor:'#0a0a0f', fontSize:'1rem'}}
- NO uses className ni CSS externo
- Tema oscuro: fondo #0a0a0f, texto #e2e8f0, bordes #1e1e2e
- Fuentes: fontFamily:"'Inter',sans-serif" para body, "'Playfair Display',serif" para titulos
- Gradientes con WebkitBackgroundClip:'text' y WebkitTextFillColor:'transparent'
- Hover effects con onMouseOver/onMouseOut
- Navbar sticky con backdropFilter:'blur(16px)'
- Minimo 5 secciones: navbar, hero, features/servicios, contacto, footer
- Formularios con data-doku-table y name en cada campo
```

**3. Modificar el procesamiento de la respuesta del LLM (lineas 692-697)**

Cuando el LLM devuelve HTML generativo:
- Si el output contiene `function App()` (es React), envolverlo con `reactWrap()`
- Si contiene `<!DOCTYPE` (es HTML plano), usarlo tal cual (compatibilidad)
- Si es insuficiente, usar `generateFallbackHtml` actualizado

```text
Flujo:
  LLM response.html contiene "function App()" ?
    SI  -> html = reactWrap(response.html, entities.businessName)
    NO  -> contiene "<!DOCTYPE" ? usar tal cual : fallback
```

**4. Actualizar `generateFallbackHtml` a React**

Convertir el fallback actual (HTML plano) a un componente React usando `reactWrap()`, similar a los templates existentes, para que sea consistente con la calidad esperada.

### Resultado esperado

- Ollama genera componentes React con inline styles profesionales
- El sistema envuelve automaticamente con `reactWrap()` (Babel standalone + React CDN)
- Los sitios generados tienen la misma calidad visual que los templates locales
- Animaciones de scroll, hover effects, navbar sticky, counters animados
- Formularios siguen funcionando con el CRUD SDK (data-doku-table)
- El fallback tambien usa React en lugar de HTML plano

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `supabase/functions/builder-ai/index.ts` | Agregar `reactWrap()`, reescribir prompt, procesar output como React, actualizar fallback |

