# Contribuir a DOKU AI 🚀

¡Gracias por tu interés en contribuir a **DOKU AI**! Este proyecto es 100% open source y toda contribución es bienvenida.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Guía de Estilo](#guía-de-estilo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Áreas de Contribución](#áreas-de-contribución)

## 📜 Código de Conducta

Este proyecto sigue un código de conducta inclusivo. Al participar, te pedimos que:

- Seas respetuoso y constructivo en tus comentarios
- Aceptes las críticas constructivas con madurez
- Te enfoques en lo que es mejor para la comunidad
- Muestres empatía hacia otros miembros

## 🤔 ¿Cómo Puedo Contribuir?

### Reportar Bugs

1. Busca en [Issues](../../issues) si el bug ya fue reportado
2. Si no existe, crea un nuevo Issue usando la plantilla **Bug Report**
3. Incluye pasos para reproducir, comportamiento esperado vs actual, y capturas de pantalla si aplica

### Sugerir Features

1. Revisa los [Issues](../../issues) existentes para evitar duplicados
2. Crea un Issue con la plantilla **Feature Request**
3. Describe el problema que resuelve y la solución propuesta

### Enviar Código

1. Haz Fork del repositorio
2. Crea una rama desde `main`
3. Implementa tus cambios
4. Envía un Pull Request

## ⚙️ Configuración del Entorno

### Prerrequisitos

- **Node.js** ≥ 18
- **npm** o **bun**
- Cuenta de [Supabase](https://supabase.com) (gratuita)

### Instalación

```bash
# 1. Fork y clona el repo
git clone https://github.com/luigistan/doku.git
cd doku

# 2. Instala dependencias
npm install

# 3. Configura variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 4. Inicia el servidor de desarrollo
npm run dev
```

### Variables de Entorno

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🔄 Flujo de Trabajo

### 1. Crear Rama

```bash
# Para features
git checkout -b feature/nombre-del-feature

# Para bugs
git checkout -b fix/nombre-del-bug

# Para docs
git checkout -b docs/nombre-del-cambio
```

### 2. Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar nuevo template de clínica médica
fix: corregir detección de idioma en entity extractor
docs: actualizar guía de contribución
style: mejorar responsive en sección de precios
refactor: simplificar lógica del intent classifier
test: agregar tests para tokenizer
```

### 3. Pull Request

- Llena la plantilla del PR completamente
- Asegúrate de que el código compila sin errores
- Incluye capturas de pantalla para cambios de UI
- Mantén los PRs enfocados (un feature/fix por PR)

## 🎨 Guía de Estilo

### TypeScript/React

- Usa **TypeScript** estricto — evita `any`
- Componentes funcionales con hooks
- Props con interfaces explícitas
- Imports con alias `@/` (ej: `@/components/ui/button`)

```tsx
// ✅ Correcto
interface CardProps {
  title: string;
  description?: string;
  onClick: () => void;
}

export function Card({ title, description, onClick }: CardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4" onClick={onClick}>
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
```

### CSS/Tailwind

- Usa tokens semánticos del design system (`text-foreground`, `bg-card`, `border-border`)
- **NO** uses colores directos (`text-white`, `bg-black`)
- Colores en HSL en `index.css`

### Edge Functions (Deno)

- TypeScript estricto
- Manejo de errores con try/catch
- CORS headers incluidos
- Respuestas JSON tipadas

## 📁 Estructura del Proyecto

```
doku-ai/
├── src/
│   ├── components/       # Componentes React
│   │   ├── builder/      # Componentes del Builder (Chat, Preview, etc.)
│   │   └── ui/           # shadcn/ui components
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilidades y templates
│   ├── pages/            # Páginas de la app
│   ├── services/         # Servicios (API calls, Supabase)
│   ├── types/            # TypeScript types
│   └── index.css         # Design system tokens
├── supabase/
│   ├── functions/        # Edge Functions (Deno)
│   │   └── builder-ai/   # Motor NLP principal
│   └── migrations/       # Migraciones SQL
└── public/               # Archivos estáticos
```

## 🎯 Áreas de Contribución

### 🧠 Motor NLP (`supabase/functions/builder-ai/`)

- Agregar nuevas industrias al `intentMap`
- Mejorar el `entityExtractor` (sinónimos, patrones regex)
- Expandir soporte multilenguaje
- Mejorar la confianza del clasificador

### 🎨 Templates y Bloques HTML

- Crear nuevos bloques de secciones (CTA, FAQ, timeline, etc.)
- Mejorar bloques existentes con mejor diseño
- Agregar más variaciones de color scheme
- Mejorar accesibilidad (WCAG AA)

### 💻 Frontend React

- Mejorar el sistema de preview en vivo
- Agregar funcionalidades al editor (drag & drop, etc.)
- Mejorar responsive design
- Performance optimizations

### 🔧 Backend Supabase

- Mejorar RLS policies
- Agregar funcionalidades de storage
- Optimizar queries
- Agregar nuevas edge functions

### 📖 Documentación

- Mejorar README
- Escribir tutoriales
- Documentar la API del motor NLP
- Traducciones a otros idiomas

## 🏷️ Labels de Issues

| Label | Descripción |
|-------|-------------|
| `bug` | Algo no funciona correctamente |
| `feature` | Nueva funcionalidad |
| `good first issue` | Ideal para nuevos contribuidores |
| `help wanted` | Se necesita ayuda de la comunidad |
| `documentation` | Mejoras a la documentación |
| `enhancement` | Mejora a funcionalidad existente |
| `nlp` | Relacionado al motor NLP |
| `ui/ux` | Mejoras visuales o de experiencia |

## ❓ ¿Preguntas?

- Abre un [Issue](../../issues) con la etiqueta `question`
- Únete a las [Discussions](../../discussions) del repo

---

¡Gracias por hacer DOKU AI mejor! 💜
