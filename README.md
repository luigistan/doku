# BuilderAI Engine 🚀

Motor de IA propio, 100% gratuito y open source, para generar sitios web dinámicamente usando NLP basado en reglas.

## ¿Qué es?

BuilderAI Engine es un constructor de sitios web inteligente que:
- **Entiende texto natural** en español e inglés
- **Extrae entidades** (nombre del negocio, secciones, colores)
- **Compone sitios dinámicamente** combinando bloques HTML
- **No requiere APIs externas** - todo corre en Supabase Edge Functions (Deno)

## Arquitectura

```
Usuario: "Quiero una landing para mi cafetería El Buen Café con menú y contacto"
                                    │
                          [Edge Function: builder-ai]
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
             1. Tokenizer    2. Intent        3. Entity
             (normaliza      Classifier       Extractor
              texto)         (tipo de sitio)  (nombre, color,
                                               secciones)
                    │               │                │
                    └───────┬───────┴────────────────┘
                            │
                   4. Template Composer
                   (combina bloques HTML)
                            │
                   5. HTML Personalizado
                            │
                      [Preview Panel]
```

## Industrias Soportadas

| Industria | Keywords | Secciones Default |
|-----------|----------|-------------------|
| Landing Page | landing, empresa, startup | hero, features, contact |
| Restaurante | restaurante, café, comida | hero, menu, contact, about |
| Portfolio | portfolio, proyectos, freelancer | hero, gallery, about, contact |
| Blog | blog, artículos, noticias | hero, blog, about |
| Dashboard | dashboard, panel, admin | hero, features |
| E-Commerce | tienda, shop, productos | hero, features, pricing |
| Fitness | gimnasio, gym, yoga | hero, pricing, features, contact |
| Agencia | agencia, servicios, marketing | hero, features, about, contact, testimonials |

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase Edge Functions (Deno)
- **NLP**: Motor propio basado en reglas (tokenizer, classifier, extractor)
- **Costo**: $0 - Sin APIs externas

## Cómo Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Haz tus cambios y commit: `git commit -m "Add: mi feature"`
4. Push: `git push origin feature/mi-feature`
5. Abre un Pull Request

### Áreas donde puedes contribuir:
- **Nuevas industrias**: Agrega más tipos de sitios en el intent classifier
- **Bloques HTML**: Crea nuevas secciones reutilizables
- **NLP mejorado**: Expande sinónimos, patrones regex, soporte multi-idioma
- **Temas de color**: Agrega más esquemas de color
- **Contenido**: Mejora el contenido predeterminado por industria

## Desarrollo Local

```sh
git clone <TU_GIT_URL>
cd <TU_PROYECTO>
npm install
npm run dev
```

## Licencia

MIT - Usa, modifica y distribuye libremente.
