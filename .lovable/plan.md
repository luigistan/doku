

## Plan: Arreglar preview, agregar templates en chat, y limpiar toda referencia al Gateway

### 1. Arreglar duplicacion del preview al hacer click en menus

**Causa:** El iframe tiene `sandbox="allow-scripts allow-same-origin"`. Con `allow-same-origin`, los links `href="#menu"` pueden causar que el iframe cargue la app padre dentro de si mismo, duplicando la interfaz.

**Solucion:** Quitar `allow-same-origin` del sandbox en `PreviewPanel.tsx` (linea 126).

**Archivo:** `src/components/builder/PreviewPanel.tsx`

---

### 2. Corregir defaults del modelo: eliminar "tinyllama" y "gateway"

El codigo tiene 3 lugares donde el default es `"gateway"` o `"tinyllama"` en vez de `"ollama"` y `"llama3.1:8b"`:

| Linea | Codigo actual | Correccion |
|-------|--------------|------------|
| 1879 | `Deno.env.get("LLM_PROVIDER") \|\| "gateway"` | `\|\| "ollama"` |
| 1881 | `Deno.env.get("LLM_MODEL") \|\| "tinyllama"` | `\|\| "llama3.1:8b"` |
| 1960 | `Deno.env.get("LLM_PROVIDER") \|\| "gateway"` | `\|\| "ollama"` |
| 2028 | `Deno.env.get("LLM_PROVIDER") \|\| "gateway"` | `\|\| "ollama"` |

Esto asegura que si los secrets no estan configurados, SIEMPRE se use Ollama como default.

**Archivo:** `supabase/functions/builder-ai/index.ts`

---

### 3. Selector de templates en el chat

Crear un componente `TemplateSelector` que muestre tarjetas clickeables con los templates disponibles. Se muestra debajo del mensaje de bienvenida cuando el usuario no ha enviado mensajes aun.

Templates a mostrar (12 tarjetas con icono y nombre):

| Icono | Template | Prompt |
|-------|----------|--------|
| Rocket | Landing Page | "Crea una landing page profesional" |
| UtensilsCrossed | Restaurante | "Crea un sitio para restaurante" |
| Briefcase | Portfolio | "Crea un portfolio profesional" |
| ShoppingCart | E-Commerce | "Crea una tienda online" |
| FileText | Blog | "Crea un blog" |
| LayoutDashboard | Dashboard | "Crea un dashboard administrativo" |
| Dumbbell | Gimnasio | "Crea un sitio para gimnasio" |
| Stethoscope | Clinica | "Crea un sitio para clinica medica" |
| Building | Inmobiliaria | "Crea un sitio de bienes raices" |
| Laptop | SaaS | "Crea una landing para producto SaaS" |
| GraduationCap | Educacion | "Crea un sitio de cursos online" |
| PawPrint | Veterinaria | "Crea un sitio para veterinaria" |

Al hacer click, se envia el prompt automaticamente como si el usuario lo escribiera.

**Archivos:**
- Nuevo: `src/components/builder/TemplateSelector.tsx`
- Modificar: `src/components/builder/ChatPanel.tsx`

---

### 4. Persistencia: toast al recuperar progreso

Cuando el usuario vuelve a un proyecto que tiene HTML guardado, mostrar un toast informativo: "Progreso recuperado. Tu sitio esta listo en el preview."

**Archivo:** `src/pages/Builder.tsx`

---

### 5. Confirmacion de Ollama

Los logs muestran que Ollama SI funciona:
```
[Full LLM] HTML generated successfully (733 chars)
[LLM] callLLMShort -> provider: ollama, url: https://ollama-doku.onrender.com, model: llama3.1:8b
```

A veces hace timeout por cold starts de Render, pero cuando el servidor esta caliente, responde correctamente. Con los defaults corregidos (punto 2), NUNCA se usara el gateway.

---

### Resumen de archivos

| Archivo | Cambio |
|---------|--------|
| `src/components/builder/PreviewPanel.tsx` | Quitar `allow-same-origin` del sandbox |
| `supabase/functions/builder-ai/index.ts` | Cambiar defaults de "gateway"/"tinyllama" a "ollama"/"llama3.1:8b" |
| `src/components/builder/TemplateSelector.tsx` | NUEVO - Grid de templates clickeables |
| `src/components/builder/ChatPanel.tsx` | Insertar TemplateSelector |
| `src/pages/Builder.tsx` | Toast al recuperar progreso |

