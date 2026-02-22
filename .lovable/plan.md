

# Motor de IA Propio "BuilderAI Engine" - Open Source

## Que se construye
Un motor inteligente propio que corre en Supabase Edge Functions (Deno), capaz de:
- Entender lo que el usuario quiere crear analizando su texto
- Extraer entidades (colores, nombre del negocio, secciones deseadas)
- Componer sitios web dinamicamente combinando bloques
- Mejorar con el tiempo guardando patrones en Supabase (auto-aprendizaje basado en datos)
- Todo 100% gratuito, sin APIs externas, open source

## Arquitectura

```text
Usuario escribe: "Quiero una landing para mi cafeteria El Buen Cafe con menu y contacto"
                                    |
                          [Edge Function: builder-ai]
                                    |
                    +---------------+----------------+
                    |               |                |
             1. Tokenizer    2. Intent        3. Entity
             (normaliza      Classifier       Extractor
              texto)         (que tipo de     (nombre, color,
                              sitio quiere)    secciones)
                    |               |                |
                    +-------+-------+----------------+
                            |
                   4. Template Composer
                   (combina bloques HTML segun
                    las entidades extraidas)
                            |
                   5. HTML Personalizado
                   "El Buen Cafe" con menu
                    y seccion de contacto
                            |
                      [Preview Panel]
```

## Cambios por archivo

### 1. Edge Function: `supabase/functions/builder-ai/index.ts`
Motor principal con 4 modulos:

- **Tokenizer**: Normaliza el texto (quita acentos, minusculas, separa palabras)
- **IntentClassifier**: Clasifica la intencion usando puntaje ponderado con sinonimos expandidos (landing, portfolio, blog, dashboard, tienda, restaurante, gimnasio, etc.)
- **EntityExtractor**: Extrae del texto:
  - Nombre del negocio (busca patrones como "llamado X", "se llama X", "para mi X")
  - Secciones deseadas (menu, contacto, galeria, precios, testimonios, etc.)
  - Esquema de color (si menciona colores)
  - Industria/nicho
- **TemplateComposer**: Genera HTML dinamico combinando bloques segun las entidades. No es un template fijo - compone secciones individuales (hero, navbar, features, pricing, gallery, contact, footer) segun lo que el usuario pidio

### 2. Bloques HTML reutilizables: `supabase/functions/builder-ai/blocks.ts`
Libreria de secciones HTML independientes que se combinan:
- `navbar(config)` - Barra de navegacion con nombre y links
- `hero(config)` - Seccion principal con titulo y CTA
- `features(config)` - Grid de caracteristicas
- `pricing(config)` - Tabla de precios
- `gallery(config)` - Galeria de imagenes/proyectos
- `contact(config)` - Formulario de contacto
- `menu(config)` - Menu de restaurante/cafeteria
- `testimonials(config)` - Testimonios
- `footer(config)` - Footer con info

Cada bloque acepta parametros (nombre, colores, textos) para personalizar el output.

### 3. Diccionario de NLP: `supabase/functions/builder-ai/nlp.ts`
- Mapa de sinonimos en espanol e ingles
- Patrones regex para extraccion de entidades
- Stopwords para filtrar
- Mapa de industrias con contenido predeterminado (cafeteria -> items de cafe, gimnasio -> planes de entrenamiento, etc.)

### 4. Actualizar `src/services/builderService.ts` (nuevo)
- Servicio frontend que llama al edge function
- Envia el mensaje del usuario y el modo (brain/execute)
- Recibe el HTML generado y el plan de pasos

### 5. Actualizar `src/hooks/useBuilderState.ts`
- Reemplazar `findTemplate()` por llamada al edge function `builder-ai`
- En modo Brain: el edge function devuelve primero un plan (JSON) con las entidades detectadas y secciones a generar, luego el HTML
- En modo Execute: devuelve HTML directamente
- Mantener templates locales como fallback si el edge function falla

### 6. Actualizar `src/lib/templates.ts`
- Mantener como fallback offline
- Agregar mas templates: restaurante, gimnasio, agencia, SaaS

### 7. Preparacion Open Source
- Actualizar `README.md` con documentacion del proyecto, como contribuir, y arquitectura
- El repo de GitHub se puede hacer publico desde la configuracion de GitHub

## Seccion Tecnica

### Formato de respuesta del Edge Function

```text
POST /builder-ai
Body: { "message": "...", "mode": "brain" | "execute" }

Respuesta modo Brain:
{
  "intent": "restaurant",
  "confidence": 0.85,
  "entities": {
    "businessName": "El Buen Cafe",
    "sections": ["navbar", "hero", "menu", "contact", "footer"],
    "colorScheme": "warm",
    "industry": "cafeteria"
  },
  "plan": [
    "Crear navbar con 'El Buen Cafe'",
    "Disenar hero con tema de cafeteria",
    "Generar menu con items de cafe",
    "Agregar formulario de contacto",
    "Crear footer con horarios"
  ],
  "html": "<full generated html>"
}

Respuesta modo Execute:
{
  "intent": "restaurant",
  "html": "<full generated html>"
}
```

### Como funciona el "auto-aprendizaje"
No es machine learning real, sino un sistema de retroalimentacion:
1. Se guarda en Supabase cada interaccion (mensaje del usuario, intent detectado, entidades)
2. Con el tiempo se puede analizar que patrones de texto llevan a que templates
3. Se puede expandir el diccionario de sinonimos basado en los mensajes reales
4. Esto se implementara en una fase posterior con tablas en Supabase

### Industrias soportadas inicialmente
- General (landing page generica)
- Restaurante/Cafeteria (con menu de comidas)
- Fitness/Gimnasio (con planes y horarios)
- Portfolio/Freelancer (con proyectos)
- Blog/Contenido (con articulos)
- E-commerce/Tienda (con productos)
- Dashboard/Admin (con metricas)
- Agencia/Servicios (con servicios ofrecidos)

### Dependencias
- Ninguna nueva - todo se construye con Deno nativo en el edge function
- El frontend solo necesita `fetch` para llamar al edge function

