# DOKU AI 🚀

Motor de IA propio, 100% gratuito y open source, para generar sitios web dinámicamente usando NLP basado en reglas. Genera HTML profesional y también TypeScript/React.

## ¿Qué es?

DOKU AI es un constructor de sitios web inteligente que:
- **Entiende texto natural** en español e inglés
- **Extrae entidades** (nombre del negocio, secciones, colores)
- **Compone sitios dinámicamente** combinando bloques HTML con CSS moderno y JavaScript interactivo
- **Genera código TypeScript/React** para proyectos avanzados
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
                   (combina bloques HTML/React)
                            │
                   5. Código Profesional
                   (HTML + CSS + JS / TSX + React)
                            │
                      [Preview en Vivo]
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

## Funcionalidades

- ✅ Generación de sitios con NLP en español/inglés
- ✅ Preview en vivo con viewport desktop/tablet/mobile
- ✅ Autenticación con Supabase Auth
- ✅ Multi-proyecto con dashboard
- ✅ Historial de versiones auto-guardado
- ✅ Chat persistente por proyecto
- ✅ Exportar HTML descargable
- ✅ Compartir con link público
- ✅ Imágenes reales de Unsplash
- ✅ Google Fonts integrados
- ✅ SEO y Open Graph automáticos
- ✅ Accesibilidad (skip-link, aria-labels, focus states)
- ✅ Animaciones con IntersectionObserver
- ✅ Menu mobile responsive funcional

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase Edge Functions (Deno) + Supabase Auth + PostgreSQL
- **NLP**: Motor propio basado en reglas (tokenizer, classifier, extractor)
- **Costo**: $0 - Sin APIs externas

## Desarrollo Local

```sh
git clone https://github.com/luigistan/doku.git
cd doku
npm install
npm run dev
```

## Cómo Contribuir

Lee nuestra [Guía de Contribución](CONTRIBUTING.md) para detalles completos.

### Resumen rápido:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Haz tus cambios y commit: `git commit -m "feat: mi feature"`
4. Push: `git push origin feature/mi-feature`
5. Abre un Pull Request

### Áreas donde puedes contribuir:
- 🧠 Mejorar el motor NLP (sinónimos, detección de intents, multi-idioma)
- 🎨 Nuevos templates y bloques HTML/CSS
- 💻 Generación de TypeScript/React components
- 🏭 Nuevas industrias (clínica, inmobiliaria, escuela, veterinaria)
- 🌐 Traducciones a otros idiomas
- ♿ Mejorar accesibilidad (WCAG AA)
- 🧪 Escribir tests automatizados
- 📖 Documentación y tutoriales

## Licencia

MIT - Usa, modifica y distribuye libremente.
