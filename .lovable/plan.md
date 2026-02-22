

# Plan: Sistema de Auto-aprendizaje + Edge Function en React/TypeScript

## Problema Identificado

El sistema actual tiene dos problemas principales:

1. **La edge function genera HTML plano** mientras los templates del cliente generan React con TypeScript. Cuando la edge function responde exitosamente, el usuario ve un sitio en HTML vanilla en vez de React.
2. **No hay aprendizaje** -- el clasificador de keywords es estatico. Si el usuario escribe algo ligeramente diferente, el sistema no lo entiende.

No se usara ninguna API externa (ni Lovable API Key, ni Gemini, ni GPT). Todo sera autonomo.

---

## 1. Crear tabla de aprendizaje `ai_learning_logs`

Nueva tabla en Supabase para almacenar patrones exitosos:

```text
ai_learning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_message TEXT NOT NULL,
  detected_intent TEXT NOT NULL,
  detected_entities JSONB,
  confidence FLOAT,
  user_accepted BOOLEAN DEFAULT NULL,
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

RLS: INSERT para todos los autenticados, SELECT para todos (para que la edge function pueda leer los patrones).

## 2. Reescribir la edge function para generar React/TypeScript

Actualmente `composeHtml()` genera HTML plano con CSS vanilla. Se reescribira para usar el mismo patron `reactWrap()` de los templates del cliente:

- Generar componentes React funcionales (Navbar, Hero, Features, Contact, etc.)
- Usar `useState`, `useEffect`, `useRef` con hooks
- Compilar en el navegador via Babel standalone + React CDN (igual que los templates locales)
- Cada seccion sera un componente React independiente dentro del output

## 3. Mejorar el NLP con auto-aprendizaje (sin API externa)

El clasificador actual usa coincidencia exacta de keywords. Se mejorara con:

**a) Distancia de Levenshtein (fuzzy matching):**
- Si el usuario escribe "restorante" o "restaurnte", el sistema lo detectara como "restaurant" usando similitud de cadenas
- Threshold: distancia <= 2 caracteres

**b) N-gramas y coincidencia parcial:**
- Analizar bigramas (pares de palabras) para detectar frases como "tienda de ropa", "clinica dental"
- Puntuar coincidencias parciales (substring match)

**c) Few-shot learning desde la base de datos:**
- Antes de clasificar, la edge function consulta las ultimas 20 interacciones exitosas (`user_accepted = true`) de `ai_learning_logs`
- Si el mensaje actual es similar (Levenshtein) a uno exitoso anterior, usa ese intent directamente con alta confianza
- Esto permite que el sistema "aprenda" de lo que los usuarios piden

**d) Expansion de sinonimos:**
- Agregar mapa de sinonimos mas amplio (ej: "pagina de aterrizaje" = landing, "negocio" = landing, "comedor" = restaurant)
- Incluir variantes con errores comunes de escritura

## 4. Agregar feedback loop en el cliente

Modificar `useBuilderState.ts` y `builderService.ts` para:

- Cuando el usuario **confirma** la ejecucion: enviar `user_accepted: true` a `ai_learning_logs`
- Cuando el usuario **pide ajustes**: enviar `user_accepted: false` + `user_feedback` con lo que pidio
- Esto alimenta el sistema de aprendizaje automatico

Se agrega nueva funcion `logInteraction()` en `builderService.ts` que llama a un endpoint de la edge function.

## 5. Agregar mas industrias y sinonimos

Expandir el `intentMap` con:
- **hotel**: hotel, hospedaje, alojamiento, airbnb, hostal, resort
- **abogado**: abogado, legal, derecho, bufete, juridico, notaria
- **contabilidad**: contador, contabilidad, impuestos, fiscal, auditor
- **fotografia**: fotografo, fotos, sesion fotografica, estudio foto
- **musica**: musico, banda, dj, estudio grabacion, disquera
- **salon**: salon belleza, peluqueria, barberia, spa, estetica
- **tecnologia**: tech, software, app, desarrollo, programacion

Cada uno con su set de secciones default, colores, textos hero, features, etc.

---

## Seccion Tecnica

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/` | Nueva migracion para tabla `ai_learning_logs` con RLS |
| `supabase/functions/builder-ai/index.ts` | Reescribir `composeHtml()` para generar React. Agregar fuzzy matching, learning DB query, endpoint de logging, nuevas industrias |
| `src/services/builderService.ts` | Agregar `logInteraction()` para feedback |
| `src/hooks/useBuilderState.ts` | Llamar `logInteraction()` al confirmar/rechazar |
| `src/integrations/supabase/types.ts` | Agregar tipos de `ai_learning_logs` |

### Flujo de auto-aprendizaje

```text
1. Usuario escribe "quiero algo para mi barberia"
2. Edge function consulta ai_learning_logs:
   - Busca mensajes similares (Levenshtein < 3)
   - Si encuentra match exitoso previo -> usa ese intent (alta confianza)
   - Si no -> clasifica con keyword + fuzzy matching
3. Detecta: intent="salon", businessName="Mi Barbería"
4. Genera React/TypeScript con componentes
5. Usuario confirma -> se guarda en ai_learning_logs (user_accepted=true)
6. Proxima vez que alguien escriba algo similar, el sistema ya "sabe"
```

### Output React generado (ejemplo)

En vez de HTML plano, la edge function generara:

```text
const { useState, useEffect, useRef } = React;

interface NavItem { label: string; href: string; }

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  // ... componente React completo
};

const Hero: React.FC = () => { ... };
const Features: React.FC = () => { ... };
const Contact: React.FC = () => { ... };

const App: React.FC = () => (
  <>
    <Navbar />
    <Hero />
    <Features />
    <Contact />
    <Footer />
  </>
);
```

Envuelto en el mismo HTML wrapper con React CDN + Babel standalone para compilacion en el navegador.

### Sin dependencias externas

- NO usa Lovable API Key
- NO usa Gemini/GPT
- TODO el NLP es local en la edge function (Deno)
- El aprendizaje es por patrones almacenados en Supabase
- El fuzzy matching usa Levenshtein implementado en TypeScript puro

