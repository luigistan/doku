import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ==================== TOKENIZER ====================
function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
  
  const stopwords = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al",
    "y", "o", "en", "con", "por", "para", "que", "es", "se", "no", "lo",
    "su", "sus", "me", "mi", "te", "tu", "nos", "le", "les",
    "a", "e", "i", "the", "is", "are", "an", "and", "or", "for", "to", "of",
    "quiero", "necesito", "hazme", "haz", "crea", "crear", "dame", "haga",
    "hacer", "deseo", "quisiera", "podrias", "puedes", "como", "tipo",
    "pagina", "sitio", "web", "website", "page", "site",
  ]);
  
  return normalized.split(/\s+/).filter(w => w.length > 1 && !stopwords.has(w));
}

// ==================== INTENT CLASSIFIER ====================
interface IntentMatch {
  intent: string;
  confidence: number;
  label: string;
}

const intentMap: Record<string, { keywords: string[]; label: string }> = {
  landing: {
    keywords: ["landing", "principal", "home", "inicio", "bienvenida", "presentacion", "empresa", "negocio", "startup", "saas", "app"],
    label: "Landing Page",
  },
  restaurant: {
    keywords: ["restaurante", "cafeteria", "cafe", "comida", "food", "restaurant", "bar", "cocina", "gastronomia", "pizzeria", "sushi", "panaderia", "bakery", "bistro"],
    label: "Restaurante / Cafetería",
  },
  portfolio: {
    keywords: ["portfolio", "portafolio", "proyectos", "galeria", "trabajos", "curriculum", "cv", "freelancer", "fotografo", "disenador", "artista", "creativo"],
    label: "Portfolio",
  },
  blog: {
    keywords: ["blog", "articulos", "posts", "noticias", "publicaciones", "contenido", "revista", "magazine", "editorial"],
    label: "Blog",
  },
  dashboard: {
    keywords: ["dashboard", "panel", "admin", "administracion", "estadisticas", "metricas", "analytics", "control", "gestion", "crm"],
    label: "Dashboard",
  },
  ecommerce: {
    keywords: ["tienda", "ecommerce", "commerce", "shop", "productos", "comprar", "venta", "carrito", "store", "marketplace"],
    label: "E-Commerce",
  },
  fitness: {
    keywords: ["gimnasio", "gym", "fitness", "ejercicio", "entrenamiento", "deporte", "crossfit", "yoga", "pilates", "salud", "wellness"],
    label: "Fitness / Gimnasio",
  },
  agency: {
    keywords: ["agencia", "agency", "servicios", "consultoria", "marketing", "digital", "estudio", "studio", "creativa", "diseno"],
    label: "Agencia / Servicios",
  },
};

function classifyIntent(tokens: string[]): IntentMatch {
  let bestIntent = "landing";
  let bestScore = 0;
  const tokenSet = new Set(tokens);
  const tokenStr = tokens.join(" ");

  for (const [intent, { keywords, label }] of Object.entries(intentMap)) {
    let score = 0;
    for (const kw of keywords) {
      if (tokenSet.has(kw)) score += 2;
      else if (tokenStr.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  const maxPossible = Math.max(...Object.values(intentMap).map(i => i.keywords.length * 2));
  const confidence = Math.min(bestScore / Math.max(maxPossible * 0.3, 1), 1);

  return {
    intent: bestIntent,
    confidence: Math.round(confidence * 100) / 100,
    label: intentMap[bestIntent]?.label || "Landing Page",
  };
}

// ==================== ENTITY EXTRACTOR ====================
interface Entities {
  businessName: string;
  sections: string[];
  colorScheme: string;
  industry: string;
}

const colorMap: Record<string, string> = {
  rojo: "red", azul: "blue", verde: "green", morado: "purple", naranja: "orange",
  amarillo: "yellow", rosa: "pink", negro: "dark", blanco: "light", oscuro: "dark",
  claro: "light", calido: "warm", frio: "cool", elegante: "elegant", moderno: "modern",
  red: "red", blue: "blue", green: "green", purple: "purple", orange: "orange",
  dark: "dark", light: "light", warm: "warm", cool: "cool",
};

const sectionKeywords: Record<string, string[]> = {
  navbar: ["navegacion", "nav", "menu superior", "barra"],
  hero: ["hero", "principal", "banner", "portada", "header"],
  features: ["caracteristicas", "features", "servicios", "beneficios", "ventajas"],
  pricing: ["precios", "pricing", "planes", "tarifas", "costos", "paquetes"],
  gallery: ["galeria", "gallery", "fotos", "imagenes", "portfolio", "proyectos", "trabajos"],
  contact: ["contacto", "contact", "formulario", "correo", "email", "mensaje"],
  menu: ["menu", "carta", "platillos", "comidas", "bebidas", "platos"],
  testimonials: ["testimonios", "testimonials", "resenas", "opiniones", "clientes"],
  about: ["nosotros", "about", "quienes somos", "historia", "equipo", "team"],
  blog: ["blog", "articulos", "noticias", "posts"],
  footer: ["footer", "pie", "informacion"],
};

function extractEntities(text: string, tokens: string[], intent: string): Entities {
  const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Extract business name (work on original text, not normalized)
  let businessName = "";
  const namePatterns = [
    /(?:llamad[oa]|se llama|nombre(?:s)?)\s+["']?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,25}?)(?:\s+(?:con|y|que|para|donde|en)\b|$|["'])/i,
    /(?:para|de)\s+(?:mi\s+)?(?:negocio|empresa|tienda|restaurante|cafeter[ií]a|caf[eé]|gym|gimnasio|agencia|estudio)\s+["']?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,25}?)(?:\s+(?:con|y|que|para|donde|en)\b|$|["'])/i,
    /["']([^"']{2,30})["']/,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      businessName = match[1].trim();
      break;
    }
  }

  // Extract sections
  const sections: Set<string> = new Set(["navbar", "hero", "footer"]);
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        sections.add(section);
      }
    }
  }

  // Add default sections by intent
  const intentDefaults: Record<string, string[]> = {
    restaurant: ["menu", "contact", "about"],
    portfolio: ["gallery", "about", "contact"],
    blog: ["blog", "about"],
    dashboard: ["features"],
    ecommerce: ["features", "pricing"],
    fitness: ["pricing", "features", "contact"],
    agency: ["features", "about", "contact", "testimonials"],
    landing: ["features", "contact"],
  };
  for (const s of (intentDefaults[intent] || [])) {
    sections.add(s);
  }

  // Extract color
  let colorScheme = "default";
  for (const [word, scheme] of Object.entries(colorMap)) {
    if (lower.includes(word)) {
      colorScheme = scheme;
      break;
    }
  }
  if (colorScheme === "default") {
    const intentColors: Record<string, string> = {
      restaurant: "warm", fitness: "green", agency: "modern",
      portfolio: "purple", ecommerce: "blue", blog: "cool",
    };
    colorScheme = intentColors[intent] || "purple";
  }

  return {
    businessName: businessName || getDefaultName(intent),
    sections: Array.from(sections),
    colorScheme,
    industry: intent,
  };
}

function getDefaultName(intent: string): string {
  const defaults: Record<string, string> = {
    landing: "Mi Empresa", restaurant: "Mi Restaurante", portfolio: "Mi Portfolio",
    blog: "Mi Blog", dashboard: "Dashboard", ecommerce: "Mi Tienda",
    fitness: "Mi Gym", agency: "Mi Agencia",
  };
  return defaults[intent] || "Mi Sitio";
}

// ==================== COLOR SCHEMES ====================
interface ColorScheme {
  primary: string; primaryLight: string; bg: string; bgCard: string;
  text: string; textMuted: string; border: string; accent: string; gradient: string;
}

function getColors(scheme: string): ColorScheme {
  const schemes: Record<string, ColorScheme> = {
    purple: { primary: "#7c3aed", primaryLight: "#a78bfa", bg: "#0a0a0f", bgCard: "#12121a", text: "#e2e8f0", textMuted: "#94a3b8", border: "#1e1e2e", accent: "#6366f1", gradient: "linear-gradient(135deg,#7c3aed,#6366f1)" },
    warm: { primary: "#d97706", primaryLight: "#f59e0b", bg: "#0f0a05", bgCard: "#1a1208", text: "#fef3c7", textMuted: "#d4a574", border: "#2d1f0e", accent: "#ea580c", gradient: "linear-gradient(135deg,#d97706,#ea580c)" },
    green: { primary: "#059669", primaryLight: "#34d399", bg: "#0a0f0a", bgCard: "#0f1a12", text: "#d1fae5", textMuted: "#6ee7b7", border: "#1a2e1f", accent: "#10b981", gradient: "linear-gradient(135deg,#059669,#10b981)" },
    blue: { primary: "#2563eb", primaryLight: "#60a5fa", bg: "#0a0a14", bgCard: "#0f1525", text: "#dbeafe", textMuted: "#93c5fd", border: "#1e2d4a", accent: "#3b82f6", gradient: "linear-gradient(135deg,#2563eb,#3b82f6)" },
    red: { primary: "#dc2626", primaryLight: "#f87171", bg: "#0f0a0a", bgCard: "#1a0f0f", text: "#fee2e2", textMuted: "#fca5a5", border: "#2d1e1e", accent: "#ef4444", gradient: "linear-gradient(135deg,#dc2626,#ef4444)" },
    dark: { primary: "#a78bfa", primaryLight: "#c4b5fd", bg: "#09090b", bgCard: "#0f0f12", text: "#e2e8f0", textMuted: "#71717a", border: "#27272a", accent: "#8b5cf6", gradient: "linear-gradient(135deg,#a78bfa,#8b5cf6)" },
    modern: { primary: "#06b6d4", primaryLight: "#67e8f9", bg: "#0a0f14", bgCard: "#0f1820", text: "#cffafe", textMuted: "#a5f3fc", border: "#1e3a4a", accent: "#0891b2", gradient: "linear-gradient(135deg,#06b6d4,#0891b2)" },
    cool: { primary: "#6366f1", primaryLight: "#818cf8", bg: "#0a0a14", bgCard: "#12121f", text: "#e0e7ff", textMuted: "#a5b4fc", border: "#1e1e3a", accent: "#4f46e5", gradient: "linear-gradient(135deg,#6366f1,#4f46e5)" },
    elegant: { primary: "#a16207", primaryLight: "#ca8a04", bg: "#0f0d08", bgCard: "#1a1710", text: "#fef9c3", textMuted: "#d4b978", border: "#2d2810", accent: "#b45309", gradient: "linear-gradient(135deg,#a16207,#b45309)" },
    orange: { primary: "#ea580c", primaryLight: "#fb923c", bg: "#0f0a05", bgCard: "#1a1008", text: "#ffedd5", textMuted: "#fdba74", border: "#2d1f0e", accent: "#f97316", gradient: "linear-gradient(135deg,#ea580c,#f97316)" },
    pink: { primary: "#db2777", primaryLight: "#f472b6", bg: "#0f0a0d", bgCard: "#1a0f15", text: "#fce7f3", textMuted: "#f9a8d4", border: "#2d1e28", accent: "#ec4899", gradient: "linear-gradient(135deg,#db2777,#ec4899)" },
    yellow: { primary: "#ca8a04", primaryLight: "#facc15", bg: "#0f0d05", bgCard: "#1a1508", text: "#fef9c3", textMuted: "#fde047", border: "#2d2510", accent: "#eab308", gradient: "linear-gradient(135deg,#ca8a04,#eab308)" },
    light: { primary: "#6366f1", primaryLight: "#818cf8", bg: "#f8fafc", bgCard: "#ffffff", text: "#1e293b", textMuted: "#64748b", border: "#e2e8f0", accent: "#4f46e5", gradient: "linear-gradient(135deg,#6366f1,#4f46e5)" },
  };
  return schemes[scheme] || schemes.purple;
}

// ==================== TEMPLATE COMPOSER ====================
interface BlockConfig {
  name: string;
  colors: ColorScheme;
  sections: string[];
  intent: string;
}

function composeHtml(config: BlockConfig): string {
  const { name, colors: c, sections, intent } = config;
  const parts: string[] = [];

  // Base styles
  parts.push(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:${c.bg};color:${c.text}}
a{color:${c.primaryLight};text-decoration:none;transition:color 0.2s}
a:hover{color:${c.primary}}
.container{max-width:1100px;margin:0 auto;padding:0 2rem}
.btn{display:inline-block;padding:0.875rem 2rem;background:${c.gradient};color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;transition:transform 0.2s,opacity 0.2s}
.btn:hover{transform:translateY(-2px);opacity:0.9}
.section{padding:4rem 2rem}
.section-title{font-size:2rem;text-align:center;margin-bottom:2rem}
.card{background:${c.bgCard};border:1px solid ${c.border};border-radius:16px;padding:2rem;transition:transform 0.2s,border-color 0.2s}
.card:hover{transform:translateY(-4px);border-color:${c.primary}}
.grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
@media(max-width:768px){.grid-3{grid-template-columns:1fr}.nav-links{display:none!important}}
</style></head>
<body>`);

  // Navbar
  if (sections.includes("navbar")) {
    const links = sections.filter(s => !["navbar", "footer"].includes(s)).slice(0, 5);
    const linkHtml = links.map(s => `<a href="#${s}" style="color:${c.textMuted};transition:color 0.2s">${sectionLabel(s)}</a>`).join("");
    parts.push(`<nav style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem 3rem;background:${c.bgCard};border-bottom:1px solid ${c.border}">
<div style="font-size:1.4rem;font-weight:700;color:${c.primaryLight}">${name}</div>
<div class="nav-links" style="display:flex;gap:2rem">${linkHtml}</div>
</nav>`);
  }

  // Hero
  if (sections.includes("hero")) {
    const subtitle = getHeroSubtitle(intent, name);
    parts.push(`<section id="hero" style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem;background:linear-gradient(135deg,${c.bgCard} 0%,${c.bg} 100%)">
<h1 style="font-size:3.5rem;font-weight:800;margin-bottom:1rem;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent">${name}</h1>
<p style="font-size:1.25rem;color:${c.textMuted};max-width:600px;margin-bottom:2rem">${subtitle}</p>
<button class="btn">${getHeroCTA(intent)}</button>
</section>`);
  }

  // Features
  if (sections.includes("features")) {
    const feats = getFeatures(intent);
    const featsHtml = feats.map(f => `<div class="card"><h3 style="color:${c.primaryLight};margin-bottom:0.5rem;font-size:1.25rem">${f.icon} ${f.title}</h3><p style="color:${c.textMuted};line-height:1.6">${f.desc}</p></div>`).join("");
    parts.push(`<section id="features" class="section"><div class="container"><h2 class="section-title">${intent === "agency" ? "Nuestros Servicios" : "Características"}</h2><div class="grid-3">${featsHtml}</div></div></section>`);
  }

  // About
  if (sections.includes("about")) {
    parts.push(`<section id="about" class="section" style="background:${c.bgCard}"><div class="container" style="max-width:800px;text-align:center">
<h2 class="section-title">Sobre Nosotros</h2>
<p style="color:${c.textMuted};line-height:1.8;font-size:1.1rem">${getAboutText(intent, name)}</p>
</div></section>`);
  }

  // Menu (restaurant)
  if (sections.includes("menu")) {
    const items = getMenuItems(intent);
    const itemsHtml = items.map(i => `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
<div><h3 style="margin-bottom:0.25rem">${i.name}</h3><p style="color:${c.textMuted};font-size:0.9rem">${i.desc}</p></div>
<span style="color:${c.primaryLight};font-weight:700;font-size:1.25rem;white-space:nowrap">${i.price}</span>
</div>`).join("");
    parts.push(`<section id="menu" class="section"><div class="container"><h2 class="section-title">🍽️ Nuestro Menú</h2><div style="display:flex;flex-direction:column;gap:1rem;max-width:700px;margin:0 auto">${itemsHtml}</div></div></section>`);
  }

  // Gallery
  if (sections.includes("gallery")) {
    const galleryItems = Array.from({ length: 6 }, (_, i) => 
      `<div style="background:linear-gradient(135deg,${c.bgCard},${c.border});border-radius:16px;height:220px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:${c.textMuted}">📷 Proyecto ${i + 1}</div>`
    ).join("");
    parts.push(`<section id="gallery" class="section" style="background:${c.bgCard}"><div class="container"><h2 class="section-title">Galería</h2><div class="grid-3">${galleryItems}</div></div></section>`);
  }

  // Pricing
  if (sections.includes("pricing")) {
    const plans = getPricingPlans(intent);
    const plansHtml = plans.map((p, i) => {
      const highlighted = i === 1;
      return `<div class="card" style="${highlighted ? `border-color:${c.primary};position:relative` : ""}">
${highlighted ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${c.gradient};color:#fff;padding:0.25rem 1rem;border-radius:99px;font-size:0.8rem;font-weight:600">Popular</div>` : ""}
<h3 style="color:${c.primaryLight};font-size:1.3rem;margin-bottom:0.5rem">${p.name}</h3>
<div style="font-size:2.5rem;font-weight:800;margin-bottom:1rem">${p.price}</div>
<ul style="list-style:none;margin-bottom:1.5rem">${p.features.map(f => `<li style="color:${c.textMuted};padding:0.4rem 0;border-bottom:1px solid ${c.border}">✓ ${f}</li>`).join("")}</ul>
<button class="btn" style="width:100%">Elegir Plan</button>
</div>`;
    }).join("");
    parts.push(`<section id="pricing" class="section"><div class="container"><h2 class="section-title">Planes y Precios</h2><div class="grid-3">${plansHtml}</div></div></section>`);
  }

  // Testimonials
  if (sections.includes("testimonials")) {
    const testimonials = [
      { name: "Ana García", text: "Excelente servicio, superó mis expectativas. ¡Totalmente recomendado!", role: "Empresaria" },
      { name: "Carlos López", text: "Profesionales y comprometidos. El mejor equipo con el que he trabajado.", role: "Director de Marketing" },
      { name: "María Rodríguez", text: "Resultados increíbles en tiempo récord. Volveré a trabajar con ellos.", role: "CEO" },
    ];
    const testHtml = testimonials.map(t => `<div class="card" style="text-align:center">
<p style="color:${c.textMuted};font-style:italic;margin-bottom:1rem;line-height:1.6">"${t.text}"</p>
<strong>${t.name}</strong><br><span style="color:${c.textMuted};font-size:0.85rem">${t.role}</span>
</div>`).join("");
    parts.push(`<section id="testimonials" class="section" style="background:${c.bgCard}"><div class="container"><h2 class="section-title">Lo que dicen nuestros clientes</h2><div class="grid-3">${testHtml}</div></div></section>`);
  }

  // Blog
  if (sections.includes("blog")) {
    const posts = [
      { tag: "Novedades", title: "Últimas actualizaciones y mejoras", desc: "Descubre todo lo nuevo que hemos preparado para ti esta temporada." },
      { tag: "Tips", title: "Consejos para sacar el máximo provecho", desc: "Guía práctica con los mejores consejos de nuestros expertos." },
      { tag: "Historias", title: "Casos de éxito de nuestros clientes", desc: "Conoce cómo nuestros clientes han transformado sus negocios." },
    ];
    const postsHtml = posts.map(p => `<div class="card">
<span style="display:inline-block;background:${c.primary}22;color:${c.primaryLight};padding:0.25rem 0.75rem;border-radius:99px;font-size:0.8rem;margin-bottom:0.75rem">${p.tag}</span>
<h3 style="margin-bottom:0.5rem">${p.title}</h3>
<p style="color:${c.textMuted};line-height:1.6">${p.desc}</p>
</div>`).join("");
    parts.push(`<section id="blog" class="section"><div class="container"><h2 class="section-title">Blog</h2><div class="grid-3">${postsHtml}</div></div></section>`);
  }

  // Contact
  if (sections.includes("contact")) {
    parts.push(`<section id="contact" class="section" style="background:${c.bgCard}"><div class="container" style="max-width:600px">
<h2 class="section-title">Contacto</h2>
<form style="display:flex;flex-direction:column;gap:1rem" onsubmit="event.preventDefault();alert('¡Mensaje enviado!')">
<input style="padding:0.875rem 1.25rem;background:${c.bg};border:1px solid ${c.border};border-radius:12px;color:${c.text};font-size:1rem;outline:none" placeholder="Tu nombre" required>
<input style="padding:0.875rem 1.25rem;background:${c.bg};border:1px solid ${c.border};border-radius:12px;color:${c.text};font-size:1rem;outline:none" type="email" placeholder="Tu email" required>
<textarea style="padding:0.875rem 1.25rem;background:${c.bg};border:1px solid ${c.border};border-radius:12px;color:${c.text};font-size:1rem;outline:none;min-height:120px;resize:vertical" placeholder="Tu mensaje" required></textarea>
<button class="btn" type="submit">Enviar Mensaje</button>
</form>
</div></section>`);
  }

  // Footer
  if (sections.includes("footer")) {
    parts.push(`<footer style="text-align:center;padding:2rem;border-top:1px solid ${c.border};color:${c.textMuted}">
<p>© 2026 ${name}. Todos los derechos reservados.</p>
<p style="margin-top:0.5rem;font-size:0.85rem">Hecho con ❤️ por BuilderAI Engine</p>
</footer>`);
  }

  parts.push("</body></html>");
  return parts.join("\n");
}

// ==================== CONTENT HELPERS ====================
function sectionLabel(s: string): string {
  const labels: Record<string, string> = {
    hero: "Inicio", features: "Servicios", about: "Nosotros", menu: "Menú",
    gallery: "Galería", pricing: "Precios", contact: "Contacto",
    testimonials: "Testimonios", blog: "Blog",
  };
  return labels[s] || s;
}

function getHeroSubtitle(intent: string, name: string): string {
  const map: Record<string, string> = {
    landing: "Una solución moderna para hacer crecer tu negocio con tecnología de punta.",
    restaurant: `Bienvenido a ${name}. Disfruta de la mejor experiencia gastronómica con ingredientes frescos y sabores únicos.`,
    portfolio: "Desarrollador y diseñador apasionado por crear experiencias digitales excepcionales.",
    blog: "Pensamientos, ideas y reflexiones sobre tecnología, diseño y desarrollo.",
    dashboard: "Tu centro de control para gestionar y analizar todos tus datos en tiempo real.",
    ecommerce: "Descubre nuestra colección exclusiva con los mejores productos al mejor precio.",
    fitness: `Transforma tu cuerpo y mente en ${name}. Entrenamientos personalizados para todos los niveles.`,
    agency: `En ${name} convertimos tus ideas en realidad digital. Creatividad, estrategia y resultados.`,
  };
  return map[intent] || map.landing;
}

function getHeroCTA(intent: string): string {
  const map: Record<string, string> = {
    landing: "Comenzar Ahora →", restaurant: "Ver Menú →", portfolio: "Ver Proyectos →",
    blog: "Leer Artículos →", dashboard: "Ir al Panel →", ecommerce: "Ver Productos →",
    fitness: "Únete Hoy →", agency: "Contáctanos →",
  };
  return map[intent] || "Comenzar →";
}

function getFeatures(intent: string): { icon: string; title: string; desc: string }[] {
  const map: Record<string, { icon: string; title: string; desc: string }[]> = {
    landing: [
      { icon: "⚡", title: "Rápido", desc: "Rendimiento optimizado para una experiencia fluida." },
      { icon: "🔒", title: "Seguro", desc: "Protección de datos de nivel empresarial." },
      { icon: "🎨", title: "Personalizable", desc: "Adapta cada aspecto a tus necesidades." },
    ],
    restaurant: [
      { icon: "🍳", title: "Ingredientes Frescos", desc: "Seleccionamos los mejores ingredientes locales cada día." },
      { icon: "👨‍🍳", title: "Chef Experto", desc: "Nuestro equipo de chefs con experiencia internacional." },
      { icon: "🚗", title: "Delivery", desc: "Entrega a domicilio rápida y segura." },
    ],
    fitness: [
      { icon: "💪", title: "Entrenamiento Personal", desc: "Planes diseñados específicamente para tus objetivos." },
      { icon: "🏋️", title: "Equipamiento Premium", desc: "Las mejores máquinas y equipos de última generación." },
      { icon: "🧘", title: "Clases Grupales", desc: "Yoga, pilates, spinning y más clases para todos." },
    ],
    agency: [
      { icon: "🎯", title: "Estrategia Digital", desc: "Planificación y ejecución de campañas efectivas." },
      { icon: "💻", title: "Desarrollo Web", desc: "Sitios y aplicaciones web de alto rendimiento." },
      { icon: "📈", title: "Marketing", desc: "SEO, SEM y redes sociales para hacer crecer tu marca." },
    ],
    ecommerce: [
      { icon: "🚚", title: "Envío Gratis", desc: "Envío gratuito en compras mayores a $50." },
      { icon: "🔄", title: "Devoluciones Fáciles", desc: "30 días para devolver cualquier producto." },
      { icon: "💳", title: "Pago Seguro", desc: "Múltiples métodos de pago 100% seguros." },
    ],
    portfolio: [
      { icon: "🎨", title: "Diseño UI/UX", desc: "Interfaces intuitivas y visualmente impactantes." },
      { icon: "💻", title: "Desarrollo Web", desc: "Aplicaciones web modernas con las últimas tecnologías." },
      { icon: "📱", title: "Apps Móviles", desc: "Aplicaciones nativas y multiplataforma." },
    ],
    dashboard: [
      { icon: "📊", title: "Análisis en Tiempo Real", desc: "Datos actualizados al instante para decisiones rápidas." },
      { icon: "🔔", title: "Alertas Inteligentes", desc: "Notificaciones automáticas cuando algo necesita tu atención." },
      { icon: "📋", title: "Reportes", desc: "Genera reportes detallados con un solo clic." },
    ],
    blog: [
      { icon: "✍️", title: "Contenido Original", desc: "Artículos escritos por expertos en la industria." },
      { icon: "🔍", title: "Fácil de Encontrar", desc: "Categorías y tags para navegar el contenido fácilmente." },
      { icon: "💬", title: "Comunidad", desc: "Comenta y comparte tus ideas con otros lectores." },
    ],
  };
  return map[intent] || map.landing;
}

function getAboutText(intent: string, name: string): string {
  const map: Record<string, string> = {
    restaurant: `En ${name} creemos que la buena comida une a las personas. Desde nuestros inicios, nos hemos dedicado a ofrecer platillos elaborados con ingredientes frescos y recetas auténticas que reflejan nuestra pasión por la gastronomía.`,
    portfolio: `Soy un profesional creativo con más de 5 años de experiencia en diseño y desarrollo. Mi enfoque combina estética visual con funcionalidad técnica para crear productos digitales que marquen la diferencia.`,
    agency: `${name} es un equipo de creativos, estrategas y desarrolladores unidos por la pasión de crear experiencias digitales extraordinarias. Trabajamos con marcas que quieren destacar en el mundo digital.`,
    fitness: `En ${name} tu bienestar es nuestra prioridad. Contamos con instalaciones de primera clase, entrenadores certificados y una comunidad motivadora para ayudarte a alcanzar tus metas de fitness.`,
    default: `${name} nació con la misión de ofrecer soluciones innovadoras y de calidad. Nuestro equipo trabaja cada día para superar las expectativas de nuestros clientes y crear experiencias memorables.`,
  };
  return map[intent] || map.default;
}

function getMenuItems(intent: string): { name: string; desc: string; price: string }[] {
  return [
    { name: "☕ Café Americano", desc: "Café recién molido, intenso y aromático", price: "$3.50" },
    { name: "🥐 Croissant Artesanal", desc: "Horneado fresco cada mañana con mantequilla francesa", price: "$4.00" },
    { name: "🥑 Tostada de Aguacate", desc: "Pan artesanal, aguacate, huevo pochado y microgreens", price: "$8.50" },
    { name: "🥗 Ensalada Mediterránea", desc: "Mix de lechugas, tomate cherry, aceitunas y feta", price: "$9.00" },
    { name: "🍝 Pasta al Pesto", desc: "Pasta fresca con pesto casero de albahaca y piñones", price: "$12.00" },
    { name: "🍰 Cheesecake", desc: "Tarta de queso con frutos rojos de temporada", price: "$6.50" },
  ];
}

function getPricingPlans(intent: string): { name: string; price: string; features: string[] }[] {
  if (intent === "fitness") {
    return [
      { name: "Básico", price: "$29/mes", features: ["Acceso al gimnasio", "Horario limitado", "1 clase grupal/semana"] },
      { name: "Premium", price: "$59/mes", features: ["Acceso ilimitado", "Todas las clases", "1 sesión personal/mes", "Casillero"] },
      { name: "VIP", price: "$99/mes", features: ["Todo Premium", "Sesiones personales ilimitadas", "Nutricionista", "Spa y sauna"] },
    ];
  }
  return [
    { name: "Básico", price: "$9/mes", features: ["Funcionalidad básica", "1 usuario", "Soporte por email"] },
    { name: "Pro", price: "$29/mes", features: ["Todo en Básico", "5 usuarios", "Soporte prioritario", "Analytics"] },
    { name: "Enterprise", price: "$99/mes", features: ["Todo en Pro", "Usuarios ilimitados", "Soporte 24/7", "API access", "Custom branding"] },
  ];
}

// ==================== PLAN GENERATOR ====================
function generatePlan(intent: string, entities: Entities): string[] {
  const steps: string[] = [];
  const name = entities.businessName;

  if (entities.sections.includes("navbar")) steps.push(`Crear barra de navegación con "${name}"`);
  if (entities.sections.includes("hero")) steps.push(`Diseñar hero section con tema de ${intentMap[intent]?.label || intent}`);
  if (entities.sections.includes("features")) steps.push("Agregar sección de características/servicios");
  if (entities.sections.includes("about")) steps.push("Crear sección Sobre Nosotros");
  if (entities.sections.includes("menu")) steps.push("Generar menú con items gastronómicos");
  if (entities.sections.includes("gallery")) steps.push("Diseñar galería de proyectos/fotos");
  if (entities.sections.includes("pricing")) steps.push("Crear tabla de precios y planes");
  if (entities.sections.includes("testimonials")) steps.push("Agregar sección de testimonios");
  if (entities.sections.includes("blog")) steps.push("Diseñar sección de blog/artículos");
  if (entities.sections.includes("contact")) steps.push("Agregar formulario de contacto");
  if (entities.sections.includes("footer")) steps.push(`Crear footer con info de "${name}"`);
  steps.push(`Aplicar esquema de color: ${entities.colorScheme}`);
  
  return steps;
}

// ==================== MAIN HANDLER ====================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, mode } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Se requiere un mensaje" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Tokenize
    const tokens = tokenize(message);

    // 2. Classify intent
    const { intent, confidence, label } = classifyIntent(tokens);

    // 3. Extract entities
    const entities = extractEntities(message, tokens, intent);

    // 4. Get colors
    const colors = getColors(entities.colorScheme);

    // 5. Compose HTML
    const html = composeHtml({
      name: entities.businessName,
      colors,
      sections: entities.sections,
      intent,
    });

    // Build response
    const response: Record<string, unknown> = {
      intent,
      confidence,
      label,
      entities,
      html,
    };

    if (mode === "brain") {
      response.plan = generatePlan(intent, entities);
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error procesando la solicitud", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
