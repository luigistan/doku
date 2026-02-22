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
    .replace(/[\u0300-\u036f]/g, "")
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

  for (const [intent, { keywords }] of Object.entries(intentMap)) {
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

  const sections: Set<string> = new Set(["navbar", "hero", "footer"]);
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        sections.add(section);
      }
    }
  }

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

// ==================== COLOR SCHEMES (WCAG AA) ====================
interface ColorScheme {
  primary: string; primaryLight: string; primaryDark: string;
  bg: string; bgAlt: string; bgCard: string;
  text: string; textMuted: string; border: string;
  accent: string; gradient: string; gradientSubtle: string;
}

function getColors(scheme: string): ColorScheme {
  const schemes: Record<string, ColorScheme> = {
    purple: {
      primary: "#7c3aed", primaryLight: "#a78bfa", primaryDark: "#5b21b6",
      bg: "#0a0a0f", bgAlt: "#0e0e16", bgCard: "#13131d",
      text: "#e8eaf0", textMuted: "#8b92a8", border: "#1f2037",
      accent: "#6366f1", gradient: "linear-gradient(135deg,#7c3aed 0%,#6366f1 50%,#818cf8 100%)",
      gradientSubtle: "linear-gradient(180deg,#0e0e16 0%,#0a0a0f 100%)",
    },
    warm: {
      primary: "#d97706", primaryLight: "#f59e0b", primaryDark: "#92400e",
      bg: "#0f0a05", bgAlt: "#140f08", bgCard: "#1c1610",
      text: "#fef3c7", textMuted: "#b8a078", border: "#302010",
      accent: "#ea580c", gradient: "linear-gradient(135deg,#d97706 0%,#ea580c 50%,#f59e0b 100%)",
      gradientSubtle: "linear-gradient(180deg,#140f08 0%,#0f0a05 100%)",
    },
    green: {
      primary: "#059669", primaryLight: "#34d399", primaryDark: "#065f46",
      bg: "#060f0a", bgAlt: "#0a150e", bgCard: "#0f1f15",
      text: "#d1fae5", textMuted: "#6aab8a", border: "#153025",
      accent: "#10b981", gradient: "linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%)",
      gradientSubtle: "linear-gradient(180deg,#0a150e 0%,#060f0a 100%)",
    },
    blue: {
      primary: "#2563eb", primaryLight: "#60a5fa", primaryDark: "#1e40af",
      bg: "#06080f", bgAlt: "#0a0f18", bgCard: "#0f1525",
      text: "#dbeafe", textMuted: "#7093c5", border: "#1a2a4a",
      accent: "#3b82f6", gradient: "linear-gradient(135deg,#2563eb 0%,#3b82f6 50%,#60a5fa 100%)",
      gradientSubtle: "linear-gradient(180deg,#0a0f18 0%,#06080f 100%)",
    },
    red: {
      primary: "#dc2626", primaryLight: "#f87171", primaryDark: "#991b1b",
      bg: "#0f0606", bgAlt: "#150a0a", bgCard: "#1f0f0f",
      text: "#fee2e2", textMuted: "#c07070", border: "#301515",
      accent: "#ef4444", gradient: "linear-gradient(135deg,#dc2626 0%,#ef4444 50%,#f87171 100%)",
      gradientSubtle: "linear-gradient(180deg,#150a0a 0%,#0f0606 100%)",
    },
    dark: {
      primary: "#a78bfa", primaryLight: "#c4b5fd", primaryDark: "#7c3aed",
      bg: "#09090b", bgAlt: "#0d0d10", bgCard: "#121216",
      text: "#e8e8ed", textMuted: "#6b6b7a", border: "#222230",
      accent: "#8b5cf6", gradient: "linear-gradient(135deg,#a78bfa 0%,#8b5cf6 50%,#7c3aed 100%)",
      gradientSubtle: "linear-gradient(180deg,#0d0d10 0%,#09090b 100%)",
    },
    modern: {
      primary: "#06b6d4", primaryLight: "#67e8f9", primaryDark: "#0e7490",
      bg: "#060a0f", bgAlt: "#0a1018", bgCard: "#0f1820",
      text: "#cffafe", textMuted: "#60a5b8", border: "#152535",
      accent: "#0891b2", gradient: "linear-gradient(135deg,#06b6d4 0%,#0891b2 50%,#67e8f9 100%)",
      gradientSubtle: "linear-gradient(180deg,#0a1018 0%,#060a0f 100%)",
    },
    cool: {
      primary: "#6366f1", primaryLight: "#818cf8", primaryDark: "#4338ca",
      bg: "#06060f", bgAlt: "#0a0a16", bgCard: "#12121f",
      text: "#e0e7ff", textMuted: "#7580b5", border: "#1a1a35",
      accent: "#4f46e5", gradient: "linear-gradient(135deg,#6366f1 0%,#4f46e5 50%,#818cf8 100%)",
      gradientSubtle: "linear-gradient(180deg,#0a0a16 0%,#06060f 100%)",
    },
    elegant: {
      primary: "#a16207", primaryLight: "#ca8a04", primaryDark: "#713f12",
      bg: "#0c0a06", bgAlt: "#11100a", bgCard: "#1a1710",
      text: "#fef9c3", textMuted: "#b8a060", border: "#28220e",
      accent: "#b45309", gradient: "linear-gradient(135deg,#a16207 0%,#b45309 50%,#ca8a04 100%)",
      gradientSubtle: "linear-gradient(180deg,#11100a 0%,#0c0a06 100%)",
    },
    orange: {
      primary: "#ea580c", primaryLight: "#fb923c", primaryDark: "#9a3412",
      bg: "#0f0806", bgAlt: "#15100a", bgCard: "#1f1510",
      text: "#ffedd5", textMuted: "#c08050", border: "#2d1a0a",
      accent: "#f97316", gradient: "linear-gradient(135deg,#ea580c 0%,#f97316 50%,#fb923c 100%)",
      gradientSubtle: "linear-gradient(180deg,#15100a 0%,#0f0806 100%)",
    },
    pink: {
      primary: "#db2777", primaryLight: "#f472b6", primaryDark: "#9d174d",
      bg: "#0f060a", bgAlt: "#150a10", bgCard: "#1f1018",
      text: "#fce7f3", textMuted: "#c070a0", border: "#301520",
      accent: "#ec4899", gradient: "linear-gradient(135deg,#db2777 0%,#ec4899 50%,#f472b6 100%)",
      gradientSubtle: "linear-gradient(180deg,#150a10 0%,#0f060a 100%)",
    },
    yellow: {
      primary: "#ca8a04", primaryLight: "#facc15", primaryDark: "#854d0e",
      bg: "#0c0a05", bgAlt: "#121008", bgCard: "#1a1510",
      text: "#fef9c3", textMuted: "#b8a050", border: "#282008",
      accent: "#eab308", gradient: "linear-gradient(135deg,#ca8a04 0%,#eab308 50%,#facc15 100%)",
      gradientSubtle: "linear-gradient(180deg,#121008 0%,#0c0a05 100%)",
    },
    light: {
      primary: "#4f46e5", primaryLight: "#6366f1", primaryDark: "#3730a3",
      bg: "#fafbff", bgAlt: "#f1f3f9", bgCard: "#ffffff",
      text: "#1a1a2e", textMuted: "#555580", border: "#e0e0f0",
      accent: "#6366f1", gradient: "linear-gradient(135deg,#4f46e5 0%,#6366f1 50%,#818cf8 100%)",
      gradientSubtle: "linear-gradient(180deg,#f1f3f9 0%,#fafbff 100%)",
    },
  };
  return schemes[scheme] || schemes.purple;
}

// ==================== UNSPLASH IMAGE HELPER ====================
function getUnsplashImage(intent: string, section: string, idx: number): string {
  const queries: Record<string, Record<string, string>> = {
    restaurant: { hero: "restaurant-interior", gallery: "food-plating", about: "chef-cooking", default: "restaurant" },
    fitness: { hero: "gym-workout", gallery: "fitness-training", about: "personal-trainer", default: "fitness" },
    portfolio: { hero: "creative-workspace", gallery: "design-project", about: "designer-working", default: "portfolio" },
    agency: { hero: "modern-office", gallery: "team-meeting", about: "creative-team", default: "agency" },
    ecommerce: { hero: "online-shopping", gallery: "product-photography", about: "warehouse", default: "ecommerce" },
    blog: { hero: "writing-desk", gallery: "laptop-coffee", about: "journalist", default: "blog" },
    landing: { hero: "technology-startup", gallery: "modern-workspace", about: "business-team", default: "technology" },
    dashboard: { hero: "data-analytics", gallery: "computer-screen", about: "office-team", default: "dashboard" },
  };
  const q = queries[intent]?.[section] || queries[intent]?.default || "website";
  return `https://images.unsplash.com/photo-${getImageId(q, idx)}?auto=format&fit=crop&w=800&q=80`;
}

function getImageId(query: string, idx: number): string {
  // Curated image IDs from Unsplash for reliable loading
  const images: Record<string, string[]> = {
    "restaurant-interior": ["1517248135467-4c7edcad34c4", "1552566626-52f8b828add9", "1414235077428-338989a2e8c0"],
    "food-plating": ["1504674900247-0877df9cc836", "1476224203421-9ac39bcb3327", "1493770348161-369560ae357d"],
    "chef-cooking": ["1556910103-1c02745aae4d", "1577219491135-ce391730fb2c", "1581299894007-aaa50297cf16"],
    "gym-workout": ["1534438327276-14e5300c3a48", "1571019614242-c5c5dee9f50b", "1517836357463-d25dfeac3438"],
    "fitness-training": ["1549060279-7e168fcee0c2", "1518611012118-696072aa579a", "1574680096145-d05b13a77d6b"],
    "personal-trainer": ["1571019613454-1cb2f99b2d8b", "1581009146145-b5ef050c2e1e", "1518310383802-640c2de311b2"],
    "creative-workspace": ["1497366216548-37526070297c", "1497366811353-6870744d04b2", "1498050108023-c5249f4df085"],
    "design-project": ["1558655146-9f40138edfeb", "1561070791-2526d30994b5", "1545235617-9465d2a55698"],
    "modern-office": ["1497366216548-37526070297c", "1497366811353-6870744d04b2", "1504384308228-2a36c96fd67e"],
    "team-meeting": ["1522071820927-318a6a811055", "1517245386807-bb43f82c33c4", "1552664730-d307ca884978"],
    "creative-team": ["1522071820927-318a6a811055", "1600880292203-757bb62b4baf", "1542744173-8e7e1ba1577f"],
    "online-shopping": ["1556742049-0cfed4f6a45d", "1472851294608-062f824d29cc", "1460925895917-afdab827c52f"],
    "product-photography": ["1523275335684-37898b6baf30", "1505740420928-5e560c06d30e", "1526170375885-4d8ecf77b99f"],
    "technology-startup": ["1519389950473-47ba0277781c", "1504384308228-2a36c96fd67e", "1531297484001-80022131f5a1"],
    "writing-desk": ["1455390582262-044cdead277a", "1488190211105-8b0e65b80b4e", "1501504905252-473c47e087f8"],
    "data-analytics": ["1551288049-bebda4e38f71", "1460925895917-afdab827c52f", "1504868584819-f8e8954a59a3"],
    default: ["1519389950473-47ba0277781c", "1531297484001-80022131f5a1", "1504384308228-2a36c96fd67e"],
  };
  const ids = images[query] || images.default;
  return ids[idx % ids.length];
}

// ==================== TEMPLATE COMPOSER (Professional Quality) ====================
interface BlockConfig {
  name: string;
  colors: ColorScheme;
  sections: string[];
  intent: string;
}

function composeHtml(config: BlockConfig): string {
  const { name, colors: c, sections, intent } = config;
  const parts: string[] = [];

  // Professional HTML head with Google Fonts, SEO, accessibility
  parts.push(`<!DOCTYPE html>
<html lang="es" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${intentMap[intent]?.label || "Sitio Web"}</title>
<meta name="description" content="${getMetaDescription(intent, name)}">
<meta property="og:title" content="${name}">
<meta property="og:description" content="${getMetaDescription(intent, name)}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
/* ===== CSS Reset + Custom Properties ===== */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --font-body:'Inter',system-ui,-apple-system,sans-serif;
  --font-display:'Playfair Display',Georgia,serif;
  --primary:${c.primary};
  --primary-light:${c.primaryLight};
  --primary-dark:${c.primaryDark};
  --bg:${c.bg};
  --bg-alt:${c.bgAlt};
  --bg-card:${c.bgCard};
  --text:${c.text};
  --text-muted:${c.textMuted};
  --border:${c.border};
  --accent:${c.accent};
  --gradient:${c.gradient};
  --gradient-subtle:${c.gradientSubtle};
  --radius:16px;
  --radius-sm:10px;
  --shadow-sm:0 2px 8px -2px rgba(0,0,0,0.3);
  --shadow-md:0 8px 24px -4px rgba(0,0,0,0.4);
  --shadow-lg:0 20px 48px -8px rgba(0,0,0,0.5);
  --transition:0.3s cubic-bezier(0.4,0,0.2,1);
  --space-xs:0.5rem;--space-sm:1rem;--space-md:1.5rem;--space-lg:2.5rem;--space-xl:4rem;--space-2xl:6rem;
}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body{font-family:var(--font-body);background:var(--bg);color:var(--text);line-height:1.7;font-size:clamp(0.95rem,1.5vw,1.05rem)}
a{color:var(--primary-light);text-decoration:none;transition:color var(--transition)}
a:hover{color:var(--primary)}
img{max-width:100%;height:auto;display:block}

/* ===== Layout ===== */
.container{max-width:1140px;margin:0 auto;padding:0 var(--space-lg)}
.section{padding:var(--space-2xl) var(--space-lg)}
.section-alt{background:var(--bg-alt)}

/* ===== Typography ===== */
h1,h2,h3,h4{font-family:var(--font-display);line-height:1.2;letter-spacing:-0.02em}
h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:800}
h2{font-size:clamp(1.8rem,3.5vw,2.5rem);font-weight:700}
h3{font-size:clamp(1.1rem,2vw,1.35rem);font-weight:600;font-family:var(--font-body)}
.section-header{text-align:center;margin-bottom:var(--space-xl)}
.section-header h2{margin-bottom:var(--space-sm)}
.section-header p{color:var(--text-muted);max-width:560px;margin:0 auto;font-size:1.05rem}
.gradient-text{background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

/* ===== Buttons ===== */
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.9rem 2rem;background:var(--gradient);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:0.95rem;font-weight:600;cursor:pointer;transition:transform var(--transition),box-shadow var(--transition);box-shadow:0 4px 15px -3px color-mix(in srgb,var(--primary) 40%,transparent)}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px -4px color-mix(in srgb,var(--primary) 50%,transparent)}
.btn:active{transform:translateY(0)}
.btn:focus-visible{outline:2px solid var(--primary-light);outline-offset:2px}
.btn-outline{background:transparent;border:1.5px solid var(--border);color:var(--text);box-shadow:none}
.btn-outline:hover{border-color:var(--primary);color:var(--primary-light);box-shadow:0 4px 15px -3px color-mix(in srgb,var(--primary) 20%,transparent)}

/* ===== Cards ===== */
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:var(--space-lg);transition:transform var(--transition),border-color var(--transition),box-shadow var(--transition)}
.card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--primary) 40%,var(--border));box-shadow:var(--shadow-md)}

/* ===== Grid ===== */
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-md)}
.grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--space-md)}

/* ===== Animations ===== */
.fade-up{opacity:0;transform:translateY(30px);transition:opacity 0.6s ease,transform 0.6s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}

/* ===== Responsive ===== */
@media(max-width:768px){
  .container{padding:0 var(--space-sm)}
  .section{padding:var(--space-xl) var(--space-sm)}
  .grid-2{grid-template-columns:1fr}
  .grid-3{grid-template-columns:1fr}
  .nav-links{display:none!important}
  .mobile-menu-btn{display:flex!important}
  .hero-content h1{font-size:2.2rem}
}
@media(min-width:769px){.mobile-menu-btn{display:none!important}}

/* ===== Focus & Accessibility ===== */
:focus-visible{outline:2px solid var(--primary-light);outline-offset:2px}
.skip-link{position:absolute;top:-100%;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:0.75rem 1.5rem;border-radius:0 0 var(--radius-sm) var(--radius-sm);z-index:1000;font-weight:600;transition:top 0.2s}
.skip-link:focus{top:0}
</style>
</head>
<body>
<a href="#main-content" class="skip-link">Ir al contenido principal</a>`);

  // ===== NAVBAR =====
  if (sections.includes("navbar")) {
    const links = sections.filter(s => !["navbar", "footer"].includes(s)).slice(0, 6);
    const linkHtml = links.map(s =>
      `<a href="#${s}" style="color:var(--text-muted);font-size:0.9rem;font-weight:500;transition:color var(--transition);letter-spacing:0.01em" onmouseover="this.style.color='var(--primary-light)'" onmouseout="this.style.color='var(--text-muted)'">${sectionLabel(s)}</a>`
    ).join("");
    parts.push(`
<header role="banner">
<nav aria-label="Navegación principal" style="display:flex;justify-content:space-between;align-items:center;padding:1rem var(--space-lg);max-width:1200px;margin:0 auto;position:relative">
  <a href="#" style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:var(--text);letter-spacing:-0.02em" aria-label="${name} - Inicio">
    <span class="gradient-text">${name}</span>
  </a>
  <div class="nav-links" style="display:flex;gap:2rem;align-items:center">${linkHtml}
    <a href="#${sections.includes("contact") ? "contact" : "hero"}" class="btn" style="padding:0.6rem 1.5rem;font-size:0.85rem">${getNavCTA(intent)}</a>
  </div>
  <button class="mobile-menu-btn" onclick="document.getElementById('mobile-nav').classList.toggle('open')" aria-label="Abrir menú" aria-expanded="false" style="background:none;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.5rem 0.7rem;color:var(--text);cursor:pointer;display:none;flex-direction:column;gap:4px">
    <span style="width:18px;height:2px;background:currentColor;display:block;border-radius:2px"></span>
    <span style="width:18px;height:2px;background:currentColor;display:block;border-radius:2px"></span>
    <span style="width:14px;height:2px;background:currentColor;display:block;border-radius:2px"></span>
  </button>
</nav>
<div id="mobile-nav" style="display:none;flex-direction:column;gap:1rem;padding:1rem var(--space-lg);border-top:1px solid var(--border);background:var(--bg-card)">
  ${links.map(s => `<a href="#${s}" style="color:var(--text-muted);font-size:0.95rem;padding:0.5rem 0" onclick="document.getElementById('mobile-nav').style.display='none'">${sectionLabel(s)}</a>`).join("")}
</div>
<style>#mobile-nav.open{display:flex}</style>
</header>`);
  }

  // ===== HERO =====
  if (sections.includes("hero")) {
    const heroImg = getUnsplashImage(intent, "hero", 0);
    parts.push(`
<section id="hero" aria-labelledby="hero-heading" style="min-height:90vh;display:flex;align-items:center;position:relative;overflow:hidden;background:var(--gradient-subtle)">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,color-mix(in srgb,var(--primary) 8%,transparent),transparent 70%)"></div>
  <div class="container" style="position:relative;z-index:1">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);align-items:center">
      <div class="hero-content fade-up">
        <div style="display:inline-block;background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary-light);padding:0.4rem 1rem;border-radius:99px;font-size:0.8rem;font-weight:600;margin-bottom:var(--space-md);letter-spacing:0.05em">${getHeroBadge(intent)}</div>
        <h1 id="hero-heading" style="margin-bottom:var(--space-md)"><span class="gradient-text">${name}</span></h1>
        <p style="color:var(--text-muted);font-size:clamp(1rem,1.8vw,1.15rem);margin-bottom:var(--space-lg);max-width:500px;line-height:1.8">${getHeroSubtitle(intent, name)}</p>
        <div style="display:flex;gap:var(--space-sm);flex-wrap:wrap">
          <button class="btn">${getHeroCTA(intent)}</button>
          <button class="btn btn-outline">${getHeroSecondaryCTA(intent)}</button>
        </div>
      </div>
      <div class="fade-up" style="transition-delay:0.2s">
        <div style="border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-lg);border:1px solid var(--border);aspect-ratio:4/3">
          <img src="${heroImg}" alt="${name} - ${intentMap[intent]?.label}" style="width:100%;height:100%;object-fit:cover" loading="eager">
        </div>
      </div>
    </div>
  </div>
</section>`);
  }

  // ===== FEATURES =====
  if (sections.includes("features")) {
    const feats = getFeatures(intent);
    const featsHtml = feats.map((f, i) => `
      <div class="card fade-up" style="transition-delay:${i * 0.1}s">
        <div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--primary) 12%,transparent);border-radius:var(--radius-sm);font-size:1.5rem;margin-bottom:var(--space-sm)">${f.icon}</div>
        <h3 style="margin-bottom:var(--space-xs);color:var(--text)">${f.title}</h3>
        <p style="color:var(--text-muted);line-height:1.7;font-size:0.95rem">${f.desc}</p>
      </div>`).join("");
    parts.push(`
<section id="features" class="section section-alt" aria-labelledby="features-heading">
  <div class="container">
    <div class="section-header fade-up">
      <h2 id="features-heading">${intent === "agency" ? "Nuestros Servicios" : "Características"}</h2>
      <p>${getFeaturesSubtitle(intent)}</p>
    </div>
    <div class="grid-3">${featsHtml}</div>
  </div>
</section>`);
  }

  // ===== ABOUT =====
  if (sections.includes("about")) {
    const aboutImg = getUnsplashImage(intent, "about", 0);
    parts.push(`
<section id="about" class="section" aria-labelledby="about-heading">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);align-items:center" class="grid-2">
      <div class="fade-up" style="border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-md);border:1px solid var(--border);aspect-ratio:4/3">
        <img src="${aboutImg}" alt="Sobre ${name}" style="width:100%;height:100%;object-fit:cover" loading="lazy">
      </div>
      <div class="fade-up" style="transition-delay:0.15s">
        <h2 id="about-heading" style="margin-bottom:var(--space-md)">Sobre <span class="gradient-text">Nosotros</span></h2>
        <p style="color:var(--text-muted);line-height:1.8;font-size:1.02rem;margin-bottom:var(--space-md)">${getAboutText(intent, name)}</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-sm);text-align:center">
          ${getAboutStats(intent).map(s => `<div style="padding:var(--space-sm);border-radius:var(--radius-sm);background:var(--bg-card);border:1px solid var(--border)"><div style="font-size:1.6rem;font-weight:800;font-family:var(--font-display)" class="gradient-text">${s.value}</div><div style="color:var(--text-muted);font-size:0.8rem;margin-top:2px">${s.label}</div></div>`).join("")}
        </div>
      </div>
    </div>
  </div>
</section>`);
  }

  // ===== MENU (restaurant) =====
  if (sections.includes("menu")) {
    const items = getMenuItems(intent);
    const itemsHtml = items.map((item, i) => `
      <div class="card fade-up" style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-md) var(--space-lg);transition-delay:${i * 0.08}s">
        <div>
          <h3 style="margin-bottom:4px;font-size:1.05rem">${item.name}</h3>
          <p style="color:var(--text-muted);font-size:0.88rem">${item.desc}</p>
        </div>
        <span style="color:var(--primary-light);font-weight:700;font-size:1.2rem;white-space:nowrap;font-family:var(--font-display)">${item.price}</span>
      </div>`).join("");
    parts.push(`
<section id="menu" class="section section-alt" aria-labelledby="menu-heading">
  <div class="container" style="max-width:750px">
    <div class="section-header fade-up">
      <h2 id="menu-heading">Nuestro Menú</h2>
      <p>Ingredientes frescos, sabores auténticos</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:var(--space-sm)">${itemsHtml}</div>
  </div>
</section>`);
  }

  // ===== GALLERY =====
  if (sections.includes("gallery")) {
    const galleryHtml = Array.from({ length: 6 }, (_, i) => {
      const img = getUnsplashImage(intent, "gallery", i);
      return `<div class="fade-up" style="border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);aspect-ratio:4/3;transition-delay:${i * 0.08}s">
        <img src="${img}" alt="${name} - Proyecto ${i + 1}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" loading="lazy">
      </div>`;
    }).join("");
    parts.push(`
<section id="gallery" class="section section-alt" aria-labelledby="gallery-heading">
  <div class="container">
    <div class="section-header fade-up">
      <h2 id="gallery-heading">Galería</h2>
      <p>Una muestra de nuestro trabajo y dedicación</p>
    </div>
    <div class="grid-3">${galleryHtml}</div>
  </div>
</section>`);
  }

  // ===== PRICING =====
  if (sections.includes("pricing")) {
    const plans = getPricingPlans(intent);
    const plansHtml = plans.map((p, i) => {
      const highlighted = i === 1;
      return `
      <div class="card fade-up" style="position:relative;text-align:center;${highlighted ? `border-color:var(--primary);box-shadow:0 0 40px -10px color-mix(in srgb,var(--primary) 25%,transparent)` : ""};transition-delay:${i * 0.1}s">
        ${highlighted ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--gradient);color:#fff;padding:0.35rem 1.25rem;border-radius:99px;font-size:0.78rem;font-weight:700;letter-spacing:0.05em">POPULAR</div>` : ""}
        <h3 style="color:var(--primary-light);font-size:1.2rem;margin-bottom:var(--space-xs)">${p.name}</h3>
        <div style="font-size:2.8rem;font-weight:800;font-family:var(--font-display);margin-bottom:var(--space-md)">${p.price}</div>
        <ul style="list-style:none;margin-bottom:var(--space-lg);text-align:left">${p.features.map(f => `<li style="color:var(--text-muted);padding:0.5rem 0;border-bottom:1px solid var(--border);font-size:0.92rem;display:flex;align-items:center;gap:0.5rem"><span style="color:var(--primary-light);font-weight:700">✓</span> ${f}</li>`).join("")}</ul>
        <button class="btn${highlighted ? "" : " btn-outline"}" style="width:100%">Elegir Plan</button>
      </div>`;
    }).join("");
    parts.push(`
<section id="pricing" class="section" aria-labelledby="pricing-heading">
  <div class="container">
    <div class="section-header fade-up">
      <h2 id="pricing-heading">Planes y Precios</h2>
      <p>Elige el plan que mejor se adapte a tus necesidades</p>
    </div>
    <div class="grid-3">${plansHtml}</div>
  </div>
</section>`);
  }

  // ===== TESTIMONIALS =====
  if (sections.includes("testimonials")) {
    const testimonials = getTestimonials();
    const testHtml = testimonials.map((t, i) => `
      <div class="card fade-up" style="text-align:center;transition-delay:${i * 0.1}s">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-sm);font-size:1.3rem;font-weight:700;color:#fff">${t.name[0]}</div>
        <p style="color:var(--text-muted);font-style:italic;margin-bottom:var(--space-sm);line-height:1.7;font-size:0.95rem">"${t.text}"</p>
        <strong style="font-size:0.95rem">${t.name}</strong><br>
        <span style="color:var(--text-muted);font-size:0.82rem">${t.role}</span>
        <div style="margin-top:var(--space-xs);color:var(--primary-light);letter-spacing:2px">★★★★★</div>
      </div>`).join("");
    parts.push(`
<section id="testimonials" class="section section-alt" aria-labelledby="testimonials-heading">
  <div class="container">
    <div class="section-header fade-up">
      <h2 id="testimonials-heading">Lo que dicen nuestros clientes</h2>
      <p>La satisfacción de nuestros clientes es nuestra mejor carta de presentación</p>
    </div>
    <div class="grid-3">${testHtml}</div>
  </div>
</section>`);
  }

  // ===== BLOG =====
  if (sections.includes("blog")) {
    const posts = getBlogPosts();
    const postsHtml = posts.map((p, i) => `
      <article class="card fade-up" style="transition-delay:${i * 0.1}s">
        <div style="border-radius:var(--radius-sm);overflow:hidden;margin:-var(--space-lg) -var(--space-lg) var(--space-md);aspect-ratio:16/9;background:var(--bg-alt)">
          <img src="${getUnsplashImage(intent, "gallery", i)}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover" loading="lazy">
        </div>
        <span style="display:inline-block;background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary-light);padding:0.3rem 0.8rem;border-radius:99px;font-size:0.75rem;font-weight:600;margin-bottom:var(--space-xs);letter-spacing:0.03em">${p.tag}</span>
        <h3 style="margin-bottom:var(--space-xs)">${p.title}</h3>
        <p style="color:var(--text-muted);line-height:1.7;font-size:0.92rem">${p.desc}</p>
      </article>`).join("");
    parts.push(`
<section id="blog" class="section" aria-labelledby="blog-heading">
  <div class="container">
    <div class="section-header fade-up">
      <h2 id="blog-heading">Blog</h2>
      <p>Artículos, noticias y reflexiones de nuestro equipo</p>
    </div>
    <div class="grid-3">${postsHtml}</div>
  </div>
</section>`);
  }

  // ===== CONTACT =====
  if (sections.includes("contact")) {
    parts.push(`
<section id="contact" class="section section-alt" aria-labelledby="contact-heading">
  <div class="container" style="max-width:640px">
    <div class="section-header fade-up">
      <h2 id="contact-heading">Contáctanos</h2>
      <p>Estamos listos para ayudarte. Escríbenos y te responderemos pronto.</p>
    </div>
    <form class="fade-up" style="display:flex;flex-direction:column;gap:var(--space-sm)" onsubmit="event.preventDefault();this.querySelector('button').textContent='¡Enviado! ✓';this.querySelector('button').style.background='var(--accent)'" aria-label="Formulario de contacto">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm)">
        <input style="padding:0.9rem 1.25rem;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-body);font-size:0.95rem;outline:none;transition:border-color var(--transition)" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'" placeholder="Tu nombre" required aria-label="Nombre">
        <input style="padding:0.9rem 1.25rem;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-body);font-size:0.95rem;outline:none;transition:border-color var(--transition)" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'" type="email" placeholder="Tu email" required aria-label="Email">
      </div>
      <input style="padding:0.9rem 1.25rem;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-body);font-size:0.95rem;outline:none;transition:border-color var(--transition)" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'" placeholder="Asunto" aria-label="Asunto">
      <textarea style="padding:0.9rem 1.25rem;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-body);font-size:0.95rem;outline:none;min-height:140px;resize:vertical;transition:border-color var(--transition)" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'" placeholder="Tu mensaje" required aria-label="Mensaje"></textarea>
      <button class="btn" type="submit" style="align-self:stretch;justify-content:center">Enviar Mensaje →</button>
    </form>
  </div>
</section>`);
  }

  // ===== FOOTER =====
  if (sections.includes("footer")) {
    parts.push(`
<footer role="contentinfo" style="border-top:1px solid var(--border);padding:var(--space-xl) var(--space-lg) var(--space-lg);background:var(--bg-card)">
  <div class="container">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-md)">
      <div>
        <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:700;margin-bottom:0.3rem" class="gradient-text">${name}</div>
        <p style="color:var(--text-muted);font-size:0.85rem">© ${new Date().getFullYear()} ${name}. Todos los derechos reservados.</p>
      </div>
      <div style="display:flex;gap:var(--space-md)">
        ${["Privacidad", "Términos", "Contacto"].map(l => `<a href="#" style="color:var(--text-muted);font-size:0.85rem;transition:color var(--transition)" onmouseover="this.style.color='var(--primary-light)'" onmouseout="this.style.color='var(--text-muted)'">${l}</a>`).join("")}
      </div>
    </div>
    <div style="text-align:center;margin-top:var(--space-lg);padding-top:var(--space-md);border-top:1px solid var(--border)">
      <p style="color:var(--text-muted);font-size:0.78rem">Hecho con ❤️ por <span class="gradient-text" style="font-weight:600">DOKU AI</span></p>
    </div>
  </div>
</footer>`);
  }

  // ===== JavaScript: IntersectionObserver animations + mobile menu =====
  parts.push(`
<script>
// Scroll animations with IntersectionObserver
document.addEventListener('DOMContentLoaded',()=>{
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})
  },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.fade-up').forEach(el=>observer.observe(el));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      const target=document.querySelector(a.getAttribute('href'));
      if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  // Mobile menu toggle
  const menuBtn=document.querySelector('.mobile-menu-btn');
  if(menuBtn){
    menuBtn.addEventListener('click',()=>{
      const expanded=menuBtn.getAttribute('aria-expanded')==='true';
      menuBtn.setAttribute('aria-expanded',String(!expanded));
    });
  }
});
</script>
</body>
</html>`);

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

function getMetaDescription(intent: string, name: string): string {
  const map: Record<string, string> = {
    landing: `${name} — Soluciones innovadoras para hacer crecer tu negocio.`,
    restaurant: `${name} — Disfruta de la mejor experiencia gastronómica.`,
    portfolio: `${name} — Portfolio profesional de diseño y desarrollo.`,
    blog: `${name} — Artículos y reflexiones sobre tecnología y diseño.`,
    dashboard: `${name} — Panel de control y analíticas en tiempo real.`,
    ecommerce: `${name} — Tu tienda online con los mejores productos.`,
    fitness: `${name} — Transforma tu cuerpo con entrenamientos profesionales.`,
    agency: `${name} — Agencia digital creativa. Estrategia, diseño y desarrollo.`,
  };
  return map[intent] || `${name} — Sitio web profesional.`;
}

function getNavCTA(intent: string): string {
  const map: Record<string, string> = {
    landing: "Empezar", restaurant: "Reservar", portfolio: "Contratar",
    ecommerce: "Comprar", fitness: "Inscribirme", agency: "Contactar",
    default: "Contactar",
  };
  return map[intent] || map.default;
}

function getHeroBadge(intent: string): string {
  const map: Record<string, string> = {
    landing: "✦ INNOVACIÓN DIGITAL", restaurant: "✦ GASTRONOMÍA DE CALIDAD",
    portfolio: "✦ DISEÑO & DESARROLLO", blog: "✦ CONTENIDO ORIGINAL",
    dashboard: "✦ ANALYTICS EN TIEMPO REAL", ecommerce: "✦ TIENDA ONLINE",
    fitness: "✦ TRANSFORMA TU VIDA", agency: "✦ CREATIVIDAD DIGITAL",
  };
  return map[intent] || "✦ BIENVENIDO";
}

function getHeroSubtitle(intent: string, name: string): string {
  const map: Record<string, string> = {
    landing: "Soluciones modernas y escalables para impulsar el crecimiento de tu negocio con tecnología de última generación.",
    restaurant: `Bienvenido a ${name}. Una experiencia gastronómica única con ingredientes frescos, recetas auténticas y un ambiente inolvidable.`,
    portfolio: "Diseñador y desarrollador apasionado por crear experiencias digitales que combinan estética impecable con funcionalidad excepcional.",
    blog: "Ideas, reflexiones y análisis profundos sobre tecnología, diseño y el futuro del desarrollo digital.",
    dashboard: "Tu centro de comando para gestionar, analizar y optimizar todos tus datos con inteligencia en tiempo real.",
    ecommerce: "Descubre nuestra colección curada con productos exclusivos, envío rápido y la mejor experiencia de compra online.",
    fitness: `Transforma tu cuerpo y mente en ${name}. Entrenamientos personalizados, equipamiento premium y una comunidad que te impulsa.`,
    agency: `En ${name} convertimos ideas en experiencias digitales memorables. Estrategia, creatividad y resultados medibles.`,
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

function getHeroSecondaryCTA(intent: string): string {
  const map: Record<string, string> = {
    landing: "Saber Más", restaurant: "Reservar Mesa", portfolio: "Sobre Mí",
    blog: "Suscribirme", dashboard: "Ver Demo", ecommerce: "Ofertas",
    fitness: "Ver Planes", agency: "Nuestro Trabajo",
  };
  return map[intent] || "Más Info";
}

function getFeaturesSubtitle(intent: string): string {
  const map: Record<string, string> = {
    landing: "Todo lo que necesitas para llevar tu negocio al siguiente nivel.",
    restaurant: "Lo que nos hace especiales y únicos.",
    portfolio: "Servicios que ofrezco para tu proyecto.",
    agency: "Soluciones completas para tu presencia digital.",
    fitness: "Todo lo que necesitas para alcanzar tus metas.",
    ecommerce: "Ventajas de comprar con nosotros.",
    default: "Descubre lo que podemos hacer por ti.",
  };
  return map[intent] || map.default;
}

function getFeatures(intent: string): { icon: string; title: string; desc: string }[] {
  const map: Record<string, { icon: string; title: string; desc: string }[]> = {
    landing: [
      { icon: "⚡", title: "Alto Rendimiento", desc: "Arquitectura optimizada para cargas rápidas y una experiencia de usuario fluida en cualquier dispositivo." },
      { icon: "🔒", title: "Seguridad Avanzada", desc: "Protección de datos con cifrado de extremo a extremo y cumplimiento de estándares internacionales." },
      { icon: "🎨", title: "Diseño Adaptable", desc: "Interfaz completamente personalizable que se adapta a la identidad de tu marca." },
    ],
    restaurant: [
      { icon: "🌿", title: "Ingredientes Frescos", desc: "Seleccionamos diariamente los mejores ingredientes de productores locales y orgánicos certificados." },
      { icon: "👨‍🍳", title: "Chef con Experiencia", desc: "Nuestro equipo de chefs combina técnicas clásicas con innovación culinaria contemporánea." },
      { icon: "🚗", title: "Delivery Express", desc: "Entrega a domicilio en menos de 45 minutos con empaque especial que mantiene la calidad." },
    ],
    fitness: [
      { icon: "💪", title: "Entrenamiento Personal", desc: "Programas diseñados por certificados NSCA adaptados a tus objetivos y nivel de fitness." },
      { icon: "🏋️", title: "Equipamiento Premium", desc: "Máquinas de última generación Technogym y Life Fitness en instalaciones climatizadas." },
      { icon: "🧘", title: "Clases Grupales", desc: "Más de 30 clases semanales: yoga, HIIT, spinning, pilates, boxeo y mucho más." },
    ],
    agency: [
      { icon: "🎯", title: "Estrategia Digital", desc: "Análisis de mercado, planificación estratégica y ejecución de campañas con ROI medible." },
      { icon: "💻", title: "Desarrollo Web & App", desc: "Sitios y aplicaciones de alto rendimiento con tecnologías modernas y arquitectura escalable." },
      { icon: "📈", title: "Marketing & Growth", desc: "SEO, SEM, social media y content marketing para posicionar y hacer crecer tu marca." },
    ],
    ecommerce: [
      { icon: "🚚", title: "Envío Gratuito", desc: "Envío sin costo en compras mayores a $50. Entrega rastreada y segura a todo el país." },
      { icon: "🔄", title: "Devoluciones Fáciles", desc: "30 días para devolver cualquier producto sin preguntas. Proceso simple y rápido." },
      { icon: "💳", title: "Pago 100% Seguro", desc: "Múltiples métodos de pago protegidos con cifrado SSL y verificación de fraude." },
    ],
    portfolio: [
      { icon: "🎨", title: "Diseño UI/UX", desc: "Interfaces intuitivas con investigación de usuarios, wireframing y prototipos interactivos." },
      { icon: "💻", title: "Desarrollo Full-Stack", desc: "Aplicaciones web robustas con React, Node.js, TypeScript y bases de datos modernas." },
      { icon: "📱", title: "Apps Móviles", desc: "Desarrollo nativo y cross-platform para iOS y Android con experiencias fluidas." },
    ],
    dashboard: [
      { icon: "📊", title: "Analytics en Tiempo Real", desc: "Dashboards interactivos con datos actualizados al segundo para decisiones informadas." },
      { icon: "🔔", title: "Alertas Inteligentes", desc: "Sistema de notificaciones configurable que te avisa cuando métricas clave requieren atención." },
      { icon: "📋", title: "Reportes Automáticos", desc: "Generación automática de reportes en PDF, Excel y presentaciones con un solo clic." },
    ],
    blog: [
      { icon: "✍️", title: "Contenido Original", desc: "Artículos investigados y escritos por expertos con años de experiencia en la industria." },
      { icon: "🔍", title: "Fácil Navegación", desc: "Sistema de categorías, tags y búsqueda avanzada para encontrar exactamente lo que buscas." },
      { icon: "💬", title: "Comunidad Activa", desc: "Comenta, comparte y debate ideas con una comunidad de profesionales apasionados." },
    ],
  };
  return map[intent] || map.landing;
}

function getAboutText(intent: string, name: string): string {
  const map: Record<string, string> = {
    restaurant: `En ${name} creemos que la gastronomía es un arte que une culturas y personas. Desde nuestros inicios, nos hemos comprometido a ofrecer una experiencia culinaria excepcional con ingredientes de la más alta calidad, recetas que honran la tradición y un servicio que hace sentir a cada comensal como en casa.`,
    portfolio: `Soy un profesional creativo con más de 5 años transformando ideas en productos digitales de impacto. Mi enfoque combina investigación de usuarios, diseño visual de alto nivel y desarrollo técnico robusto para crear experiencias que no solo se ven increíbles, sino que generan resultados medibles.`,
    agency: `${name} nació de la convicción de que cada marca merece una presencia digital extraordinaria. Somos un equipo multidisciplinario de estrategas, diseñadores y desarrolladores que trabajan en sinergia para crear soluciones digitales que conectan marcas con personas de manera auténtica y efectiva.`,
    fitness: `En ${name} tu bienestar integral es nuestra razón de ser. Contamos con instalaciones de clase mundial, entrenadores certificados internacionalmente y una comunidad vibrante que te motivará a superar tus límites. Porque creemos que cada persona merece sentirse en su mejor versión.`,
    default: `${name} nació con la misión de ofrecer soluciones innovadoras que marquen la diferencia. Nuestro equipo combina experiencia, creatividad y tecnología de punta para superar las expectativas de nuestros clientes y construir relaciones duraderas basadas en resultados.`,
  };
  return map[intent] || map.default;
}

function getAboutStats(intent: string): { value: string; label: string }[] {
  const map: Record<string, { value: string; label: string }[]> = {
    restaurant: [{ value: "8+", label: "Años" }, { value: "50K+", label: "Clientes" }, { value: "4.9", label: "Rating" }],
    fitness: [{ value: "2K+", label: "Miembros" }, { value: "30+", label: "Clases" }, { value: "15", label: "Entrenadores" }],
    agency: [{ value: "200+", label: "Proyectos" }, { value: "50+", label: "Clientes" }, { value: "98%", label: "Satisfacción" }],
    portfolio: [{ value: "80+", label: "Proyectos" }, { value: "40+", label: "Clientes" }, { value: "5", label: "Años" }],
    ecommerce: [{ value: "10K+", label: "Productos" }, { value: "50K+", label: "Ventas" }, { value: "4.8", label: "Rating" }],
    default: [{ value: "100+", label: "Clientes" }, { value: "5+", label: "Años" }, { value: "99%", label: "Satisfacción" }],
  };
  return map[intent] || map.default;
}

function getMenuItems(_intent: string): { name: string; desc: string; price: string }[] {
  return [
    { name: "☕ Café de Especialidad", desc: "Grano arábica de altura, tostado artesanal. Notas de chocolate y cítricos", price: "$4.50" },
    { name: "🥐 Croissant de Mantequilla", desc: "Hojaldre artesanal con mantequilla francesa AOP, horneado fresco cada mañana", price: "$4.00" },
    { name: "🥑 Tostada de Aguacate", desc: "Pan de masa madre, aguacate, huevo pochado, microgreens y aceite de trufa", price: "$9.50" },
    { name: "🥗 Bowl Mediterráneo", desc: "Quinoa, hummus, falafel, verduras asadas, tahini y za'atar", price: "$11.00" },
    { name: "🍝 Pasta Fresca al Pesto", desc: "Tagliatelle artesanal, pesto genovés, piñones tostados y parmesano DOP", price: "$13.00" },
    { name: "🍰 Tarta de Temporada", desc: "Postre del día elaborado con frutas orgánicas de estación y crema artesanal", price: "$7.50" },
  ];
}

function getPricingPlans(intent: string): { name: string; price: string; features: string[] }[] {
  if (intent === "fitness") {
    return [
      { name: "Básico", price: "$29/mes", features: ["Acceso al gimnasio", "Horario 6am-10pm", "1 clase grupal/semana", "Locker diario"] },
      { name: "Premium", price: "$59/mes", features: ["Acceso ilimitado 24/7", "Todas las clases grupales", "1 sesión personal/mes", "Locker permanente", "Área de spa"] },
      { name: "VIP", price: "$99/mes", features: ["Todo en Premium", "Sesiones personales 2x/sem", "Plan nutricional", "Spa y sauna ilimitado", "Invitados gratis"] },
    ];
  }
  return [
    { name: "Starter", price: "$9/mes", features: ["Funcionalidad esencial", "1 usuario", "5GB almacenamiento", "Soporte por email"] },
    { name: "Professional", price: "$29/mes", features: ["Todo en Starter", "Hasta 10 usuarios", "50GB almacenamiento", "Soporte prioritario", "Integraciones API"] },
    { name: "Enterprise", price: "$99/mes", features: ["Todo en Professional", "Usuarios ilimitados", "Almacenamiento ilimitado", "Soporte 24/7 dedicado", "SSO & seguridad avanzada", "SLA garantizado"] },
  ];
}

function getTestimonials(): { name: string; text: string; role: string }[] {
  return [
    { name: "Ana García", text: "Superó todas mis expectativas. La atención al detalle y la calidad del resultado final son impresionantes. Sin duda volveré.", role: "Directora de Innovación" },
    { name: "Carlos López", text: "El equipo más profesional con el que he trabajado. Entienden las necesidades del negocio y entregan resultados excepcionales.", role: "CEO, TechStart" },
    { name: "María Rodríguez", text: "Transformaron completamente nuestra presencia digital. Los números hablan por sí solos: 300% más de engagement.", role: "CMO, BrandCo" },
  ];
}

function getBlogPosts(): { tag: string; title: string; desc: string }[] {
  return [
    { tag: "Tendencias", title: "Las 10 tendencias digitales que dominarán este año", desc: "Exploramos las tecnologías y estrategias que están redefiniendo el panorama digital para empresas de todos los tamaños." },
    { tag: "Guías", title: "Guía completa: Optimiza tu presencia online", desc: "Pasos prácticos y herramientas para maximizar tu visibilidad y conversiones en el mundo digital." },
    { tag: "Casos de Éxito", title: "Cómo duplicamos las ventas de nuestro cliente", desc: "Un análisis detallado de la estrategia integral que implementamos para lograr resultados extraordinarios." },
  ];
}

// ==================== PLAN GENERATOR ====================
function generatePlan(intent: string, entities: Entities): string[] {
  const steps: string[] = [];
  const name = entities.businessName;

  if (entities.sections.includes("navbar")) steps.push(`Crear navegación responsive con "${name}"`);
  if (entities.sections.includes("hero")) steps.push(`Diseñar hero section profesional con imagen de ${intentMap[intent]?.label || intent}`);
  if (entities.sections.includes("features")) steps.push("Generar sección de características con iconos y descripciones");
  if (entities.sections.includes("about")) steps.push("Crear sección Sobre Nosotros con estadísticas");
  if (entities.sections.includes("menu")) steps.push("Generar menú gastronómico con precios");
  if (entities.sections.includes("gallery")) steps.push("Diseñar galería de imágenes con hover effects");
  if (entities.sections.includes("pricing")) steps.push("Crear tabla de precios con plan destacado");
  if (entities.sections.includes("testimonials")) steps.push("Agregar testimonios con ratings");
  if (entities.sections.includes("blog")) steps.push("Diseñar sección de artículos del blog");
  if (entities.sections.includes("contact")) steps.push("Agregar formulario de contacto con validación");
  if (entities.sections.includes("footer")) steps.push(`Crear footer profesional con links`);
  steps.push(`Aplicar paleta de colores: ${entities.colorScheme}`);
  steps.push("Inyectar animaciones de scroll con IntersectionObserver");
  steps.push("Optimizar SEO con meta tags y estructura semántica");

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

    const tokens = tokenize(message);
    const { intent, confidence, label } = classifyIntent(tokens);
    const entities = extractEntities(message, tokens, intent);
    const colors = getColors(entities.colorScheme);

    const html = composeHtml({
      name: entities.businessName,
      colors,
      sections: entities.sections,
      intent,
    });

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
