import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ==================== SUPABASE CLIENT ====================
function getSupabaseClient() {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  return createClient(url, key);
}

// ==================== LEVENSHTEIN DISTANCE ====================
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyMatch(word: string, target: string, maxDist = 2): boolean {
  if (word === target) return true;
  if (Math.abs(word.length - target.length) > maxDist) return false;
  return levenshtein(word, target) <= maxDist;
}

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
    "pagina", "sitio", "web", "website", "page", "site", "algo",
  ]);

  return normalized.split(/\s+/).filter(w => w.length > 1 && !stopwords.has(w));
}

// ==================== BIGRAM EXTRACTION ====================
function getBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

// ==================== INTENT CLASSIFIER (Enhanced) ====================
interface IntentMatch {
  intent: string;
  confidence: number;
  label: string;
}

const intentMap: Record<string, { keywords: string[]; bigrams: string[]; label: string }> = {
  landing: {
    keywords: ["landing", "principal", "home", "inicio", "bienvenida", "presentacion", "empresa", "negocio", "startup", "saas", "app", "corporativo", "institucional"],
    bigrams: ["pagina principal", "pagina aterrizaje", "sitio corporativo"],
    label: "Landing Page",
  },
  restaurant: {
    keywords: ["restaurante", "cafeteria", "cafe", "comida", "food", "restaurant", "bar", "cocina", "gastronomia", "pizzeria", "sushi", "panaderia", "bakery", "bistro", "comedor", "taqueria", "mariscos", "asador", "buffet"],
    bigrams: ["comida rapida", "fast food", "food truck"],
    label: "Restaurante / Cafetería",
  },
  portfolio: {
    keywords: ["portfolio", "portafolio", "proyectos", "galeria", "trabajos", "curriculum", "cv", "freelancer", "disenador", "artista", "creativo"],
    bigrams: ["hoja vida", "curriculum vitae"],
    label: "Portfolio",
  },
  blog: {
    keywords: ["blog", "articulos", "posts", "noticias", "publicaciones", "contenido", "revista", "magazine", "editorial"],
    bigrams: ["sitio noticias", "pagina blog"],
    label: "Blog",
  },
  dashboard: {
    keywords: ["dashboard", "panel", "admin", "administracion", "estadisticas", "metricas", "analytics", "control", "gestion", "crm"],
    bigrams: ["panel control", "panel admin"],
    label: "Dashboard",
  },
  ecommerce: {
    keywords: ["tienda", "ecommerce", "commerce", "shop", "productos", "comprar", "venta", "carrito", "store", "marketplace", "catalogo"],
    bigrams: ["tienda online", "tienda virtual", "tienda ropa", "tienda linea"],
    label: "E-Commerce",
  },
  fitness: {
    keywords: ["gimnasio", "gym", "fitness", "ejercicio", "entrenamiento", "deporte", "crossfit", "yoga", "pilates", "wellness"],
    bigrams: ["centro deportivo", "centro fitness"],
    label: "Fitness / Gimnasio",
  },
  agency: {
    keywords: ["agencia", "agency", "consultoria", "marketing", "digital", "estudio", "studio", "creativa", "diseno", "publicidad"],
    bigrams: ["agencia digital", "agencia marketing", "estudio creativo", "agencia publicidad"],
    label: "Agencia / Servicios",
  },
  clinic: {
    keywords: ["clinica", "medico", "doctor", "hospital", "dental", "dentista", "medicina", "consultorio", "pediatra", "dermatologo", "clinic", "health", "odontologo", "fisioterapia", "rehabilitacion"],
    bigrams: ["clinica dental", "consultorio medico", "centro medico", "centro salud"],
    label: "Clínica / Salud",
  },
  realestate: {
    keywords: ["inmobiliaria", "propiedades", "apartamentos", "casas", "alquiler", "inmuebles", "departamentos", "terrenos", "lotes"],
    bigrams: ["bienes raices", "real estate", "venta inmueble", "renta departamento"],
    label: "Inmobiliaria",
  },
  education: {
    keywords: ["escuela", "academia", "cursos", "educacion", "universidad", "colegio", "formacion", "capacitacion", "clases", "tutoria", "school", "institute"],
    bigrams: ["centro educativo", "instituto formacion"],
    label: "Educación / Academia",
  },
  veterinary: {
    keywords: ["veterinaria", "mascotas", "pet", "animales", "perros", "gatos", "vet"],
    bigrams: ["clinica veterinaria", "peluqueria canina", "tienda mascotas"],
    label: "Veterinaria",
  },
  hotel: {
    keywords: ["hotel", "hospedaje", "alojamiento", "airbnb", "hostal", "resort", "motel", "posada", "cabaña", "habitaciones"],
    bigrams: ["casa rural", "bed breakfast"],
    label: "Hotel / Hospedaje",
  },
  lawyer: {
    keywords: ["abogado", "legal", "derecho", "bufete", "juridico", "notaria", "leyes", "litigio", "penalista", "civilista"],
    bigrams: ["despacho juridico", "bufete abogados", "firma legal", "asesoria legal"],
    label: "Abogado / Legal",
  },
  accounting: {
    keywords: ["contador", "contabilidad", "impuestos", "fiscal", "auditor", "contable", "facturacion", "nomina", "tributario"],
    bigrams: ["despacho contable", "asesoria fiscal", "declaracion impuestos"],
    label: "Contabilidad / Fiscal",
  },
  photography: {
    keywords: ["fotografo", "fotos", "fotografia", "sesion", "camara", "retrato", "boda", "eventos", "editorial"],
    bigrams: ["sesion fotografica", "estudio foto", "fotografia bodas", "fotografia profesional"],
    label: "Fotografía",
  },
  music: {
    keywords: ["musico", "banda", "dj", "grabacion", "disquera", "musica", "cantante", "productor", "compositor"],
    bigrams: ["estudio grabacion", "productor musical", "banda musical"],
    label: "Música / Producción",
  },
  salon: {
    keywords: ["salon", "peluqueria", "barberia", "spa", "estetica", "belleza", "cabello", "unas", "maquillaje", "corte", "barber", "nails"],
    bigrams: ["salon belleza", "centro estetica", "corte cabello", "salon unas"],
    label: "Salón de Belleza / Barbería",
  },
  technology: {
    keywords: ["tech", "software", "app", "desarrollo", "programacion", "tecnologia", "sistemas", "informatica", "devops", "cloud", "saas", "plataforma"],
    bigrams: ["empresa tecnologia", "desarrollo software", "startup tech"],
    label: "Tecnología / Software",
  },
};

// ==================== SYNONYM EXPANSION ====================
const synonymMap: Record<string, string> = {
  "restorante": "restaurante", "restaurnte": "restaurante", "restorant": "restaurante",
  "cafetria": "cafeteria", "cafetría": "cafeteria",
  "gimansio": "gimnasio", "gimnacio": "gimnasio", "gim": "gimnasio",
  "tinda": "tienda", "tiena": "tienda",
  "porfafolio": "portfolio", "portafolios": "portfolio",
  "veternaria": "veterinaria", "beterinaria": "veterinaria",
  "otel": "hotel", "ostal": "hostal",
  "peluqeria": "peluqueria", "peluquería": "peluqueria", "barveria": "barberia",
  "avogado": "abogado", "abogdo": "abogado",
  "contadur": "contador", "contaduria": "contabilidad",
  "fotografía": "fotografia", "fotografo": "fotografo",
  "musica": "musica", "musician": "musico",
  "tecnolgia": "tecnologia", "sofware": "software",
  "clinica": "clinica", "clínica": "clinica",
  "escuala": "escuela", "acadmia": "academia",
  "inmoviliaria": "inmobiliaria",
};

function expandSynonyms(tokens: string[]): string[] {
  return tokens.map(t => synonymMap[t] || t);
}

// ==================== FEW-SHOT LEARNING FROM DB ====================
interface LearningLog {
  user_message: string;
  detected_intent: string;
  detected_entities: Record<string, unknown>;
  confidence: number;
}

async function queryLearningPatterns(): Promise<LearningLog[]> {
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("ai_learning_logs")
      .select("user_message, detected_intent, detected_entities, confidence")
      .eq("user_accepted", true)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data || []) as LearningLog[];
  } catch {
    return [];
  }
}

function matchFromLearning(tokens: string[], patterns: LearningLog[]): IntentMatch | null {
  if (patterns.length === 0) return null;
  const inputStr = tokens.join(" ");

  let bestMatch: LearningLog | null = null;
  let bestSimilarity = 0;

  for (const pattern of patterns) {
    const patTokens = tokenize(pattern.user_message);
    const patStr = patTokens.join(" ");

    // Check token overlap (Jaccard similarity)
    const inputSet = new Set(tokens);
    const patSet = new Set(patTokens);
    const intersection = new Set([...inputSet].filter(x => patSet.has(x)));
    const union = new Set([...inputSet, ...patSet]);
    const jaccard = union.size > 0 ? intersection.size / union.size : 0;

    // Also check fuzzy token matching
    let fuzzyMatches = 0;
    for (const t of tokens) {
      for (const p of patTokens) {
        if (fuzzyMatch(t, p, 2)) {
          fuzzyMatches++;
          break;
        }
      }
    }
    const fuzzyScore = tokens.length > 0 ? fuzzyMatches / tokens.length : 0;

    const similarity = Math.max(jaccard, fuzzyScore);

    if (similarity > bestSimilarity && similarity > 0.5) {
      bestSimilarity = similarity;
      bestMatch = pattern;
    }
  }

  if (bestMatch) {
    return {
      intent: bestMatch.detected_intent,
      confidence: Math.min(bestSimilarity * 1.2, 1),
      label: intentMap[bestMatch.detected_intent]?.label || "Sitio Web",
    };
  }
  return null;
}

// ==================== ENHANCED CLASSIFIER ====================
function classifyIntent(tokens: string[], patterns: LearningLog[]): IntentMatch {
  // 1. Try few-shot learning first
  const learned = matchFromLearning(tokens, patterns);
  if (learned && learned.confidence > 0.7) return learned;

  // 2. Expand synonyms
  const expanded = expandSynonyms(tokens);
  const bigrams = getBigrams(expanded);
  const tokenStr = expanded.join(" ");

  let bestIntent = "landing";
  let bestScore = 0;

  for (const [intent, { keywords, bigrams: intentBigrams }] of Object.entries(intentMap)) {
    let score = 0;

    // Exact keyword match
    for (const kw of keywords) {
      if (expanded.includes(kw)) score += 3;
      else if (tokenStr.includes(kw)) score += 2;
    }

    // Fuzzy keyword match (Levenshtein)
    for (const token of expanded) {
      for (const kw of keywords) {
        if (token !== kw && fuzzyMatch(token, kw, 2)) {
          score += 1.5;
          break;
        }
      }
    }

    // Bigram match
    for (const bg of intentBigrams || []) {
      if (bigrams.includes(bg)) score += 4;
      else if (tokenStr.includes(bg.replace(" ", ""))) score += 2;
    }

    // Substring match in original text
    for (const kw of keywords) {
      if (kw.length > 3 && tokenStr.includes(kw.substring(0, kw.length - 1))) {
        score += 0.5;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  // If learned match exists but was below threshold, still prefer it over very low keyword match
  if (learned && bestScore < 2) return learned;

  const maxPossible = 15;
  const confidence = Math.min(bestScore / maxPossible, 1);

  return {
    intent: bestIntent,
    confidence: Math.round(confidence * 100) / 100,
    label: intentMap[bestIntent]?.label || "Landing Page",
  };
}

// ==================== LOG INTERACTION ====================
async function logInteraction(
  message: string,
  intent: string,
  entities: Record<string, unknown>,
  confidence: number
): Promise<string | null> {
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("ai_learning_logs")
      .insert({
        user_message: message,
        detected_intent: intent,
        detected_entities: entities,
        confidence,
      })
      .select("id")
      .single();
    if (error) throw error;
    return data?.id || null;
  } catch {
    return null;
  }
}

async function updateInteractionFeedback(
  logId: string,
  accepted: boolean,
  feedback?: string
): Promise<void> {
  try {
    const sb = getSupabaseClient();
    await sb
      .from("ai_learning_logs")
      .update({ user_accepted: accepted, user_feedback: feedback || null })
      .eq("id", logId);
  } catch {
    // silently fail
  }
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
  dorado: "elegant", plateado: "cool", turquesa: "modern", coral: "warm",
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
  faq: ["faq", "preguntas", "frecuentes", "dudas"],
  cta: ["cta", "llamada", "accion", "promocion"],
  team: ["equipo", "team", "miembros", "staff", "profesionales"],
  stats: ["estadisticas", "numeros", "cifras", "logros", "stats"],
};

function extractEntities(text: string, tokens: string[], intent: string): Entities {
  const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let businessName = "";
  const namePatterns = [
    /(?:llamad[oa]|se llama|nombre(?:s)?)\s+["']?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,25}?)(?:\s+(?:con|y|que|para|donde|en)\b|$|["'])/i,
    /(?:para|de)\s+(?:mi\s+)?(?:negocio|empresa|tienda|restaurante|cafeter[ií]a|caf[eé]|gym|gimnasio|agencia|estudio|salon|barberia|peluqueria|hotel|bufete|consultorio|clinica|veterinaria|academia)\s+["']?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,25}?)(?:\s+(?:con|y|que|para|donde|en)\b|$|["'])/i,
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
      if (lower.includes(kw)) sections.add(section);
    }
  }

  const intentDefaults: Record<string, string[]> = {
    restaurant: ["menu", "contact", "about"],
    portfolio: ["gallery", "about", "contact"],
    blog: ["blog", "about"],
    dashboard: ["features", "stats"],
    ecommerce: ["features", "pricing"],
    fitness: ["pricing", "features", "contact"],
    agency: ["features", "about", "contact", "testimonials"],
    landing: ["features", "contact"],
    clinic: ["features", "team", "contact", "faq"],
    realestate: ["features", "gallery", "contact"],
    education: ["features", "pricing", "testimonials", "contact"],
    veterinary: ["features", "team", "contact", "faq"],
    hotel: ["features", "gallery", "pricing", "contact"],
    lawyer: ["features", "about", "team", "contact", "faq"],
    accounting: ["features", "about", "contact", "faq"],
    photography: ["gallery", "about", "pricing", "contact"],
    music: ["gallery", "about", "contact"],
    salon: ["features", "pricing", "gallery", "contact"],
    technology: ["features", "about", "pricing", "contact"],
  };
  for (const s of (intentDefaults[intent] || ["features", "contact"])) sections.add(s);

  let colorScheme = "default";
  for (const [word, scheme] of Object.entries(colorMap)) {
    if (lower.includes(word)) { colorScheme = scheme; break; }
  }
  if (colorScheme === "default") {
    const intentColors: Record<string, string> = {
      restaurant: "warm", fitness: "green", agency: "modern", portfolio: "purple",
      ecommerce: "blue", blog: "cool", clinic: "blue", realestate: "elegant",
      education: "blue", veterinary: "green", hotel: "elegant", lawyer: "dark",
      accounting: "cool", photography: "dark", music: "purple", salon: "pink",
      technology: "modern",
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
    fitness: "Mi Gym", agency: "Mi Agencia", clinic: "Mi Clínica",
    realestate: "Mi Inmobiliaria", education: "Mi Academia", veterinary: "Mi Veterinaria",
    hotel: "Mi Hotel", lawyer: "Mi Bufete Legal", accounting: "Mi Contaduría",
    photography: "Mi Estudio Fotográfico", music: "Mi Estudio Musical",
    salon: "Mi Salón", technology: "Mi Tech",
  };
  return defaults[intent] || "Mi Sitio";
}

// ==================== COLOR SCHEMES ====================
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
    clinic: { hero: "modern-office", gallery: "team-meeting", about: "creative-team", default: "technology" },
    realestate: { hero: "modern-office", gallery: "modern-workspace", about: "business-team", default: "technology" },
    education: { hero: "creative-workspace", gallery: "laptop-coffee", about: "team-meeting", default: "technology" },
    veterinary: { hero: "creative-workspace", gallery: "design-project", about: "creative-team", default: "technology" },
    hotel: { hero: "modern-office", gallery: "modern-workspace", about: "business-team", default: "technology" },
    lawyer: { hero: "modern-office", gallery: "team-meeting", about: "creative-team", default: "technology" },
    accounting: { hero: "data-analytics", gallery: "computer-screen", about: "business-team", default: "technology" },
    photography: { hero: "creative-workspace", gallery: "design-project", about: "creative-team", default: "technology" },
    music: { hero: "creative-workspace", gallery: "design-project", about: "creative-team", default: "technology" },
    salon: { hero: "creative-workspace", gallery: "design-project", about: "creative-team", default: "technology" },
    technology: { hero: "technology-startup", gallery: "computer-screen", about: "business-team", default: "technology" },
  };
  const q = queries[intent]?.[section] || queries[intent]?.default || "website";
  return `https://images.unsplash.com/photo-${getImageId(q, idx)}?auto=format&fit=crop&w=800&q=80`;
}

function getImageId(query: string, idx: number): string {
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
    "laptop-coffee": ["1497366216548-37526070297c", "1498050108023-c5249f4df085", "1488190211105-8b0e65b80b4e"],
    "computer-screen": ["1551288049-bebda4e38f71", "1504868584819-f8e8954a59a3", "1460925895917-afdab827c52f"],
    "designer-working": ["1558655146-9f40138edfeb", "1545235617-9465d2a55698", "1497366811353-6870744d04b2"],
    default: ["1519389950473-47ba0277781c", "1531297484001-80022131f5a1", "1504384308228-2a36c96fd67e"],
  };
  const ids = images[query] || images.default;
  return ids[idx % ids.length];
}

// ==================== REACT/TSX COMPOSER ====================
interface BlockConfig {
  name: string;
  colors: ColorScheme;
  sections: string[];
  intent: string;
}

function composeReactHtml(config: BlockConfig): string {
  const { name, colors: c, sections, intent } = config;

  // Build React component code
  const components: string[] = [];

  // Navbar component
  if (sections.includes("navbar")) {
    const links = sections.filter(s => !["navbar", "footer"].includes(s)).slice(0, 6);
    components.push(`
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks: { label: string; href: string }[] = [
    ${links.map(s => `{ label: "${sectionLabel(s)}", href: "#${s}" }`).join(",\n    ")}
  ];

  return (
    <header style={{position:'sticky',top:0,zIndex:50,transition:'all 0.3s ease',background:scrolled?'var(--bg-card)':'transparent',borderBottom:scrolled?'1px solid var(--border)':'none',backdropFilter:scrolled?'blur(12px)':'none'}}>
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem var(--space-lg)',maxWidth:'1200px',margin:'0 auto'}}>
        <a href="#" style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',fontWeight:700,letterSpacing:'-0.02em'}} className="gradient-text">${name}</a>
        <div className="nav-links" style={{display:'flex',gap:'2rem',alignItems:'center'}}>
          {navLinks.map(l => <a key={l.href} href={l.href} style={{color:'var(--text-muted)',fontSize:'0.9rem',fontWeight:500}}>{l.label}</a>)}
          <a href="#${sections.includes("contact") ? "contact" : "hero"}" className="btn" style={{padding:'0.6rem 1.5rem',fontSize:'0.85rem'}}>${getNavCTA(intent)}</a>
        </div>
        <button className="mobile-menu-btn" onClick={()=>setMobileOpen(!mobileOpen)} style={{background:'none',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'0.5rem 0.7rem',color:'var(--text)',cursor:'pointer',display:'none',flexDirection:'column',gap:'4px'}}>
          <span style={{width:18,height:2,background:'currentColor',display:'block',borderRadius:2}}/>
          <span style={{width:18,height:2,background:'currentColor',display:'block',borderRadius:2}}/>
          <span style={{width:14,height:2,background:'currentColor',display:'block',borderRadius:2}}/>
        </button>
      </nav>
      {mobileOpen && <div style={{display:'flex',flexDirection:'column',gap:'1rem',padding:'1rem var(--space-lg)',borderTop:'1px solid var(--border)',background:'var(--bg-card)'}}>
        {navLinks.map(l => <a key={l.href} href={l.href} onClick={()=>setMobileOpen(false)} style={{color:'var(--text-muted)',fontSize:'0.95rem',padding:'0.5rem 0'}}>{l.label}</a>)}
      </div>}
    </header>
  );
};`);
  }

  // Hero component
  if (sections.includes("hero")) {
    const heroImg = getUnsplashImage(intent, "hero", 0);
    components.push(`
const Hero: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id="hero" style={{minHeight:'90vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden',background:'var(--gradient-subtle)'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 30% 50%,color-mix(in srgb,var(--primary) 8%,transparent),transparent 70%)'}}/>
      <div className="container" style={{position:'relative',zIndex:1}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--space-xl)',alignItems:'center'}}>
          <div style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(30px)',transition:'all 0.6s ease'}}>
            <div style={{display:'inline-block',background:'color-mix(in srgb,var(--primary) 12%,transparent)',color:'var(--primary-light)',padding:'0.4rem 1rem',borderRadius:99,fontSize:'0.8rem',fontWeight:600,marginBottom:'var(--space-md)',letterSpacing:'0.05em'}}>${getHeroBadge(intent)}</div>
            <h1 style={{marginBottom:'var(--space-md)'}}><span className="gradient-text">${name}</span></h1>
            <p style={{color:'var(--text-muted)',fontSize:'clamp(1rem,1.8vw,1.15rem)',marginBottom:'var(--space-lg)',maxWidth:500,lineHeight:1.8}}>${getHeroSubtitle(intent, name)}</p>
            <div style={{display:'flex',gap:'var(--space-sm)',flexWrap:'wrap'}}>
              <button className="btn">${getHeroCTA(intent)}</button>
              <button className="btn btn-outline">${getHeroSecondaryCTA(intent)}</button>
            </div>
          </div>
          <div style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(30px)',transition:'all 0.6s ease 0.2s'}}>
            <div style={{borderRadius:'var(--radius)',overflow:'hidden',boxShadow:'var(--shadow-lg)',border:'1px solid var(--border)',aspectRatio:'4/3'}}>
              <img src="${heroImg}" alt="${name}" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};`);
  }

  // Features component
  if (sections.includes("features")) {
    const feats = getFeatures(intent);
    components.push(`
const Features: React.FC = () => {
  interface Feature { icon: string; title: string; desc: string; }
  const features: Feature[] = ${JSON.stringify(feats)};

  return (
    <section id="features" className="section section-alt">
      <div className="container">
        <div className="section-header"><h2>${intent === "agency" ? "Nuestros Servicios" : "Características"}</h2><p>${getFeaturesSubtitle(intent)}</p></div>
        <div className="grid-3">
          {features.map((f, i) => (
            <div key={i} className="card" style={{transition:\`transform 0.3s ease \${i*0.1}s\`}}>
              <div style={{width:48,height:48,display:'flex',alignItems:'center',justifyContent:'center',background:'color-mix(in srgb,var(--primary) 12%,transparent)',borderRadius:'var(--radius-sm)',fontSize:'1.5rem',marginBottom:'var(--space-sm)'}}>{f.icon}</div>
              <h3 style={{marginBottom:'var(--space-xs)',color:'var(--text)'}}>{f.title}</h3>
              <p style={{color:'var(--text-muted)',lineHeight:1.7,fontSize:'0.95rem'}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};`);
  }

  // About component
  if (sections.includes("about")) {
    const aboutImg = getUnsplashImage(intent, "about", 0);
    const stats = getAboutStats(intent);
    components.push(`
const About: React.FC = () => (
  <section id="about" className="section">
    <div className="container">
      <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--space-xl)',alignItems:'center'}}>
        <div style={{borderRadius:'var(--radius)',overflow:'hidden',boxShadow:'var(--shadow-md)',border:'1px solid var(--border)',aspectRatio:'4/3'}}>
          <img src="${aboutImg}" alt="Sobre ${name}" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        </div>
        <div>
          <h2 style={{marginBottom:'var(--space-md)'}}>Sobre <span className="gradient-text">Nosotros</span></h2>
          <p style={{color:'var(--text-muted)',lineHeight:1.8,fontSize:'1.02rem',marginBottom:'var(--space-md)'}}>${getAboutText(intent, name)}</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-sm)',textAlign:'center'}}>
            ${stats.map(s => `<div style={{padding:'var(--space-sm)',borderRadius:'var(--radius-sm)',background:'var(--bg-card)',border:'1px solid var(--border)'}}><div className="gradient-text" style={{fontSize:'1.6rem',fontWeight:800,fontFamily:'var(--font-display)'}}>${s.value}</div><div style={{color:'var(--text-muted)',fontSize:'0.8rem',marginTop:2}}>${s.label}</div></div>`).join("\n            ")}
          </div>
        </div>
      </div>
    </div>
  </section>
);`);
  }

  // Menu component (restaurant)
  if (sections.includes("menu")) {
    const items = getMenuItems(intent);
    components.push(`
const Menu: React.FC = () => {
  interface MenuItem { name: string; desc: string; price: string; }
  const items: MenuItem[] = ${JSON.stringify(items)};

  return (
    <section id="menu" className="section section-alt">
      <div className="container" style={{maxWidth:750}}>
        <div className="section-header"><h2>Nuestro Menú</h2><p>Ingredientes frescos, sabores auténticos</p></div>
        <div style={{display:'flex',flexDirection:'column',gap:'var(--space-sm)'}}>
          {items.map((item, i) => (
            <div key={i} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'var(--space-md) var(--space-lg)'}}>
              <div><h3 style={{marginBottom:4,fontSize:'1.05rem'}}>{item.name}</h3><p style={{color:'var(--text-muted)',fontSize:'0.88rem'}}>{item.desc}</p></div>
              <span style={{color:'var(--primary-light)',fontWeight:700,fontSize:'1.2rem',whiteSpace:'nowrap',fontFamily:'var(--font-display)'}}>{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};`);
  }

  // Gallery component
  if (sections.includes("gallery")) {
    components.push(`
const Gallery: React.FC = () => {
  const images: string[] = [${Array.from({ length: 6 }, (_, i) => `"${getUnsplashImage(intent, "gallery", i)}"`).join(",")}];
  const [hovered, setHovered] = useState<number>(-1);

  return (
    <section id="gallery" className="section section-alt">
      <div className="container">
        <div className="section-header"><h2>Galería</h2><p>Una muestra de nuestro trabajo y dedicación</p></div>
        <div className="grid-3">
          {images.map((src, i) => (
            <div key={i} style={{borderRadius:'var(--radius)',overflow:'hidden',border:'1px solid var(--border)',aspectRatio:'4/3'}} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(-1)}>
              <img src={src} alt={\`${name} - \${i+1}\`} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s ease',transform:hovered===i?'scale(1.05)':'scale(1)'}} loading="lazy"/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};`);
  }

  // Pricing component
  if (sections.includes("pricing")) {
    const plans = getPricingPlans(intent);
    components.push(`
const Pricing: React.FC = () => {
  interface Plan { name: string; price: string; features: string[]; }
  const plans: Plan[] = ${JSON.stringify(plans)};

  return (
    <section id="pricing" className="section">
      <div className="container">
        <div className="section-header"><h2>Planes y Precios</h2><p>Elige el plan que mejor se adapte a tus necesidades</p></div>
        <div className="grid-3">
          {plans.map((p, i) => {
            const highlighted = i === 1;
            return (
              <div key={i} className="card" style={{position:'relative',textAlign:'center',...(highlighted?{borderColor:'var(--primary)',boxShadow:'0 0 40px -10px color-mix(in srgb,var(--primary) 25%,transparent)'}:{})}}>
                {highlighted && <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:'var(--gradient)',color:'#fff',padding:'0.35rem 1.25rem',borderRadius:99,fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.05em'}}>POPULAR</div>}
                <h3 style={{color:'var(--primary-light)',fontSize:'1.2rem',marginBottom:'var(--space-xs)'}}>{p.name}</h3>
                <div style={{fontSize:'2.8rem',fontWeight:800,fontFamily:'var(--font-display)',marginBottom:'var(--space-md)'}}>{p.price}</div>
                <ul style={{listStyle:'none',marginBottom:'var(--space-lg)',textAlign:'left'}}>{p.features.map((f,j)=><li key={j} style={{color:'var(--text-muted)',padding:'0.5rem 0',borderBottom:'1px solid var(--border)',fontSize:'0.92rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><span style={{color:'var(--primary-light)',fontWeight:700}}>✓</span> {f}</li>)}</ul>
                <button className={highlighted?'btn':'btn btn-outline'} style={{width:'100%'}}>Elegir Plan</button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};`);
  }

  // Testimonials component
  if (sections.includes("testimonials")) {
    const testimonials = getTestimonials();
    components.push(`
const Testimonials: React.FC = () => {
  interface Testimonial { name: string; text: string; role: string; }
  const items: Testimonial[] = ${JSON.stringify(testimonials)};

  return (
    <section id="testimonials" className="section section-alt">
      <div className="container">
        <div className="section-header"><h2>Lo que dicen nuestros clientes</h2><p>La satisfacción de nuestros clientes es nuestra mejor carta de presentación</p></div>
        <div className="grid-3">
          {items.map((t, i) => (
            <div key={i} className="card" style={{textAlign:'center'}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'var(--gradient)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto var(--space-sm)',fontSize:'1.3rem',fontWeight:700,color:'#fff'}}>{t.name[0]}</div>
              <p style={{color:'var(--text-muted)',fontStyle:'italic',marginBottom:'var(--space-sm)',lineHeight:1.7,fontSize:'0.95rem'}}>"{t.text}"</p>
              <strong style={{fontSize:'0.95rem'}}>{t.name}</strong><br/>
              <span style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{t.role}</span>
              <div style={{marginTop:'var(--space-xs)',color:'var(--primary-light)',letterSpacing:2}}>★★★★★</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};`);
  }

  // Contact component
  if (sections.includes("contact")) {
    components.push(`
const Contact: React.FC = () => {
  const [sent, setSent] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="section section-alt">
      <div className="container" style={{maxWidth:640}}>
        <div className="section-header"><h2>Contáctanos</h2><p>Estamos listos para ayudarte. Escríbenos y te responderemos pronto.</p></div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'var(--space-sm)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--space-sm)'}}>
            <input style={{padding:'0.9rem 1.25rem',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:'0.95rem',outline:'none'}} placeholder="Tu nombre" required/>
            <input style={{padding:'0.9rem 1.25rem',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:'0.95rem',outline:'none'}} type="email" placeholder="Tu email" required/>
          </div>
          <input style={{padding:'0.9rem 1.25rem',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:'0.95rem',outline:'none'}} placeholder="Asunto"/>
          <textarea style={{padding:'0.9rem 1.25rem',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:'0.95rem',outline:'none',minHeight:140,resize:'vertical'}} placeholder="Tu mensaje" required/>
          <button className="btn" type="submit" style={{alignSelf:'stretch',justifyContent:'center'}}>{sent ? '¡Enviado! ✓' : 'Enviar Mensaje →'}</button>
        </form>
      </div>
    </section>
  );
};`);
  }

  // FAQ component
  if (sections.includes("faq")) {
    const faqs = getFAQs(intent);
    components.push(`
const FAQ: React.FC = () => {
  interface FAQItem { q: string; a: string; }
  const [openIdx, setOpenIdx] = useState<number>(-1);
  const faqs: FAQItem[] = ${JSON.stringify(faqs)};

  return (
    <section id="faq" className="section">
      <div className="container" style={{maxWidth:750}}>
        <div className="section-header"><h2>Preguntas Frecuentes</h2><p>Respuestas a las dudas más comunes</p></div>
        <div style={{display:'flex',flexDirection:'column',gap:'var(--space-sm)'}}>
          {faqs.map((f, i) => (
            <div key={i} className="card" style={{cursor:'pointer'}} onClick={()=>setOpenIdx(openIdx===i?-1:i)}>
              <div style={{fontWeight:600,fontSize:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
                {f.q}
                <span style={{color:'var(--primary-light)',fontSize:'1.2rem',transition:'transform 0.3s',transform:openIdx===i?'rotate(45deg)':'none'}}>+</span>
              </div>
              {openIdx===i && <p style={{color:'var(--text-muted)',marginTop:'var(--space-sm)',lineHeight:1.7,fontSize:'0.95rem'}}>{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};`);
  }

  // Team component
  if (sections.includes("team")) {
    const members = getTeamMembers(intent);
    components.push(`
const Team: React.FC = () => {
  interface Member { name: string; role: string; bio: string; avatar: string; }
  const members: Member[] = ${JSON.stringify(members)};

  return (
    <section id="team" className="section section-alt">
      <div className="container">
        <div className="section-header"><h2>Nuestro Equipo</h2><p>Profesionales comprometidos con la excelencia</p></div>
        <div className="grid-3">
          {members.map((m, i) => (
            <div key={i} className="card" style={{textAlign:'center'}}>
              <div style={{width:80,height:80,borderRadius:'50%',background:'var(--gradient)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto var(--space-sm)',fontSize:'2rem',color:'#fff'}}>{m.avatar}</div>
              <h3 style={{marginBottom:4}}>{m.name}</h3>
              <p style={{color:'var(--primary-light)',fontSize:'0.85rem',fontWeight:500,marginBottom:'var(--space-xs)'}}>{m.role}</p>
              <p style={{color:'var(--text-muted)',fontSize:'0.88rem',lineHeight:1.6}}>{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};`);
  }

  // Footer component
  if (sections.includes("footer")) {
    const footerLinks = sections.filter(s => !["navbar", "footer", "cta", "stats"].includes(s)).slice(0, 5);
    components.push(`
const Footer: React.FC = () => (
  <footer style={{borderTop:'1px solid var(--border)',padding:'var(--space-xl) var(--space-lg) var(--space-lg)',background:'var(--bg-card)'}}>
    <div className="container">
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:'var(--space-xl)',marginBottom:'var(--space-lg)'}}>
        <div>
          <div className="gradient-text" style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',fontWeight:700,marginBottom:'var(--space-sm)'}}>${name}</div>
          <p style={{color:'var(--text-muted)',fontSize:'0.88rem',lineHeight:1.7,maxWidth:320}}>${getMetaDescription(intent, name)}</p>
        </div>
        <div>
          <h4 style={{fontSize:'0.85rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:'var(--space-sm)'}}>Navegación</h4>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            ${footerLinks.map(s => `<a href="#${s}" style={{color:'var(--text-muted)',fontSize:'0.88rem'}}>${sectionLabel(s)}</a>`).join("\n            ")}
          </div>
        </div>
        <div>
          <h4 style={{fontSize:'0.85rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-muted)',marginBottom:'var(--space-sm)'}}>Legal</h4>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <a href="#" style={{color:'var(--text-muted)',fontSize:'0.88rem'}}>Privacidad</a>
            <a href="#" style={{color:'var(--text-muted)',fontSize:'0.88rem'}}>Términos</a>
            <a href="#" style={{color:'var(--text-muted)',fontSize:'0.88rem'}}>Cookies</a>
          </div>
        </div>
      </div>
      <div style={{borderTop:'1px solid var(--border)',paddingTop:'var(--space-md)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'var(--space-sm)'}}>
        <p style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>© ${new Date().getFullYear()} ${name}. Todos los derechos reservados.</p>
        <p style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>Hecho con ❤️ por <span className="gradient-text" style={{fontWeight:600}}>DOKU AI</span></p>
      </div>
    </div>
  </footer>
);`);
  }

  // BackToTop component
  components.push(`
const BackToTop: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{position:'fixed',bottom:'2rem',right:'2rem',width:44,height:44,borderRadius:'50%',background:'var(--gradient)',color:'#fff',border:'none',cursor:'pointer',fontSize:'1.2rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--shadow-md)',zIndex:100}}>↑</button>;
};`);

  // App component
  const componentOrder = ["navbar", "hero", "features", "about", "menu", "gallery", "pricing", "testimonials", "faq", "team", "contact", "footer"];
  const componentNames: Record<string, string> = {
    navbar: "Navbar", hero: "Hero", features: "Features", about: "About", menu: "Menu",
    gallery: "Gallery", pricing: "Pricing", testimonials: "Testimonials", faq: "FAQ",
    team: "Team", contact: "Contact", footer: "Footer",
  };
  const renderedComponents = componentOrder
    .filter(s => sections.includes(s))
    .map(s => `<${componentNames[s]} />`)
    .join("\n      ");

  components.push(`
const App: React.FC = () => (
  <>
    <a href="#main-content" className="skip-link">Ir al contenido principal</a>
    <div id="main-content">
      ${renderedComponents}
    </div>
    <BackToTop />
  </>
);`);

  // Wrap in HTML with React CDN + Babel standalone
  return `<!DOCTYPE html>
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
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --font-body:'Inter',system-ui,-apple-system,sans-serif;
  --font-display:'Playfair Display',Georgia,serif;
  --primary:${c.primary};--primary-light:${c.primaryLight};--primary-dark:${c.primaryDark};
  --bg:${c.bg};--bg-alt:${c.bgAlt};--bg-card:${c.bgCard};
  --text:${c.text};--text-muted:${c.textMuted};--border:${c.border};
  --accent:${c.accent};--gradient:${c.gradient};--gradient-subtle:${c.gradientSubtle};
  --radius:16px;--radius-sm:10px;
  --shadow-sm:0 2px 8px -2px rgba(0,0,0,0.3);--shadow-md:0 8px 24px -4px rgba(0,0,0,0.4);--shadow-lg:0 20px 48px -8px rgba(0,0,0,0.5);
  --transition:0.3s cubic-bezier(0.4,0,0.2,1);
  --space-xs:0.5rem;--space-sm:1rem;--space-md:1.5rem;--space-lg:2.5rem;--space-xl:4rem;--space-2xl:6rem;
}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:var(--font-body);background:var(--bg);color:var(--text);line-height:1.7;font-size:clamp(0.95rem,1.5vw,1.05rem)}
a{color:var(--primary-light);text-decoration:none;transition:color var(--transition)}
a:hover{color:var(--primary)}
img{max-width:100%;height:auto;display:block}
.container{max-width:1140px;margin:0 auto;padding:0 var(--space-lg)}
.section{padding:var(--space-2xl) var(--space-lg)}
.section-alt{background:var(--bg-alt)}
h1,h2,h3,h4{font-family:var(--font-display);line-height:1.2;letter-spacing:-0.02em}
h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:800}
h2{font-size:clamp(1.8rem,3.5vw,2.5rem);font-weight:700}
h3{font-size:clamp(1.1rem,2vw,1.35rem);font-weight:600;font-family:var(--font-body)}
.section-header{text-align:center;margin-bottom:var(--space-xl)}
.section-header h2{margin-bottom:var(--space-sm)}
.section-header p{color:var(--text-muted);max-width:560px;margin:0 auto;font-size:1.05rem}
.gradient-text{background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.9rem 2rem;background:var(--gradient);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:0.95rem;font-weight:600;cursor:pointer;transition:transform var(--transition),box-shadow var(--transition);box-shadow:0 4px 15px -3px color-mix(in srgb,var(--primary) 40%,transparent)}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px -4px color-mix(in srgb,var(--primary) 50%,transparent)}
.btn-outline{background:transparent;border:1.5px solid var(--border);color:var(--text);box-shadow:none}
.btn-outline:hover{border-color:var(--primary);color:var(--primary-light)}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:var(--space-lg);transition:transform var(--transition),border-color var(--transition),box-shadow var(--transition)}
.card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--primary) 40%,var(--border));box-shadow:var(--shadow-md)}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-md)}
.grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--space-md)}
.skip-link{position:absolute;top:-100%;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:0.75rem 1.5rem;border-radius:0 0 var(--radius-sm) var(--radius-sm);z-index:1000;font-weight:600;transition:top 0.2s}
.skip-link:focus{top:0}
@media(max-width:768px){
  .container{padding:0 var(--space-sm)}
  .section{padding:var(--space-xl) var(--space-sm)}
  .grid-2{grid-template-columns:1fr}
  .grid-3{grid-template-columns:1fr}
  .nav-links{display:none!important}
  .mobile-menu-btn{display:flex!important}
  h1{font-size:2.2rem}
}
@media(min-width:769px){.mobile-menu-btn{display:none!important}}
:focus-visible{outline:2px solid var(--primary-light);outline-offset:2px}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-type="module">
const { useState, useEffect, useRef } = React;
${components.join("\n")}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
</script>
</body>
</html>`;
}

// ==================== CONTENT HELPERS ====================
function sectionLabel(s: string): string {
  const labels: Record<string, string> = {
    hero: "Inicio", features: "Servicios", about: "Nosotros", menu: "Menú",
    gallery: "Galería", pricing: "Precios", contact: "Contacto",
    testimonials: "Testimonios", blog: "Blog", faq: "FAQ", team: "Equipo",
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
    clinic: `${name} — Atención médica de calidad con tecnología avanzada.`,
    realestate: `${name} — Encuentra la propiedad perfecta con asesoría profesional.`,
    education: `${name} — Cursos y formación profesional de alto nivel.`,
    veterinary: `${name} — Cuidado veterinario integral para tu mascota.`,
    hotel: `${name} — Hospedaje de primera clase con servicio excepcional.`,
    lawyer: `${name} — Asesoría legal profesional y confiable.`,
    accounting: `${name} — Servicios contables y fiscales de excelencia.`,
    photography: `${name} — Fotografía profesional que captura momentos únicos.`,
    music: `${name} — Producción musical profesional y creativa.`,
    salon: `${name} — Belleza y estilo profesional para ti.`,
    technology: `${name} — Soluciones tecnológicas innovadoras.`,
  };
  return map[intent] || `${name} — Sitio web profesional.`;
}

function getNavCTA(intent: string): string {
  const map: Record<string, string> = {
    landing: "Empezar", restaurant: "Reservar", portfolio: "Contratar",
    ecommerce: "Comprar", fitness: "Inscribirme", agency: "Contactar",
    clinic: "Agendar Cita", realestate: "Ver Propiedades",
    education: "Inscribirme", veterinary: "Agendar Cita",
    hotel: "Reservar", lawyer: "Consultar", accounting: "Cotizar",
    photography: "Reservar Sesión", music: "Escuchar", salon: "Reservar Cita",
    technology: "Demo",
  };
  return map[intent] || "Contactar";
}

function getHeroBadge(intent: string): string {
  const map: Record<string, string> = {
    landing: "✦ INNOVACIÓN DIGITAL", restaurant: "✦ GASTRONOMÍA DE CALIDAD",
    portfolio: "✦ DISEÑO & DESARROLLO", blog: "✦ CONTENIDO ORIGINAL",
    dashboard: "✦ ANALYTICS EN TIEMPO REAL", ecommerce: "✦ TIENDA ONLINE",
    fitness: "✦ TRANSFORMA TU VIDA", agency: "✦ CREATIVIDAD DIGITAL",
    clinic: "✦ SALUD & BIENESTAR", realestate: "✦ TU HOGAR IDEAL",
    education: "✦ APRENDE SIN LÍMITES", veterinary: "✦ CUIDAMOS A TU MASCOTA",
    hotel: "✦ HOSPITALIDAD PREMIUM", lawyer: "✦ JUSTICIA & CONFIANZA",
    accounting: "✦ PRECISIÓN FINANCIERA", photography: "✦ CAPTURA MOMENTOS",
    music: "✦ SONIDO PROFESIONAL", salon: "✦ BELLEZA & ESTILO",
    technology: "✦ INNOVACIÓN TECH",
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
    clinic: `En ${name} tu salud está en las mejores manos. Tecnología avanzada, profesionales certificados y atención humana de calidad.`,
    realestate: `${name} te ayuda a encontrar la propiedad perfecta. Asesoría personalizada, amplio catálogo y acompañamiento integral.`,
    education: `En ${name} creemos que aprender transforma vidas. Cursos diseñados por expertos, metodología práctica y resultados comprobados.`,
    veterinary: `En ${name} cuidamos a tu mejor amigo como si fuera nuestro. Veterinarios especializados, equipamiento moderno y mucho amor.`,
    hotel: `Bienvenido a ${name}. Disfruta de una estancia inolvidable con servicio de primera clase, confort y ubicación privilegiada.`,
    lawyer: `En ${name} defendemos tus derechos con experiencia, compromiso y confidencialidad. Tu tranquilidad legal es nuestra prioridad.`,
    accounting: `${name} te ofrece soluciones contables y fiscales precisas. Optimiza tus finanzas con profesionales de confianza.`,
    photography: `En ${name} capturamos los momentos más importantes de tu vida con creatividad, pasión y un ojo experto para el detalle.`,
    music: `${name} — Producción musical de alto nivel. Desde grabación hasta masterización, hacemos que tu música suene profesional.`,
    salon: `Bienvenido a ${name}. Descubre un espacio donde la belleza y el bienestar se encuentran. Profesionales que cuidan de ti.`,
    technology: `${name} desarrolla soluciones tecnológicas innovadoras. Software a medida, apps y plataformas que impulsan tu negocio.`,
  };
  return map[intent] || map.landing;
}

function getHeroCTA(intent: string): string {
  const map: Record<string, string> = {
    landing: "Comenzar Ahora →", restaurant: "Ver Menú →", portfolio: "Ver Proyectos →",
    blog: "Leer Artículos →", dashboard: "Ir al Panel →", ecommerce: "Ver Productos →",
    fitness: "Únete Hoy →", agency: "Contáctanos →", hotel: "Reservar Ahora →",
    lawyer: "Consulta Gratis →", accounting: "Cotizar →", photography: "Ver Portfolio →",
    music: "Escuchar →", salon: "Reservar Cita →", technology: "Ver Demo →",
  };
  return map[intent] || "Comenzar →";
}

function getHeroSecondaryCTA(intent: string): string {
  const map: Record<string, string> = {
    landing: "Saber Más", restaurant: "Reservar Mesa", portfolio: "Sobre Mí",
    blog: "Suscribirme", dashboard: "Ver Demo", ecommerce: "Ofertas",
    fitness: "Ver Planes", agency: "Nuestro Trabajo", hotel: "Ver Habitaciones",
    lawyer: "Nuestros Servicios", accounting: "Servicios", photography: "Sobre Mí",
    music: "Nuestros Servicios", salon: "Servicios", technology: "Conocer Más",
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
    hotel: "Comodidades y servicios de primera clase.",
    lawyer: "Áreas de práctica y especialización.",
    accounting: "Servicios contables y fiscales integrales.",
    photography: "Tipos de sesiones y servicios fotográficos.",
    music: "Servicios de producción y grabación.",
    salon: "Servicios de belleza y cuidado personal.",
    technology: "Servicios tecnológicos de vanguardia.",
  };
  return map[intent] || "Descubre lo que podemos hacer por ti.";
}

function getFeatures(intent: string): { icon: string; title: string; desc: string }[] {
  const map: Record<string, { icon: string; title: string; desc: string }[]> = {
    landing: [
      { icon: "⚡", title: "Alto Rendimiento", desc: "Arquitectura optimizada para cargas rápidas y una experiencia de usuario fluida." },
      { icon: "🔒", title: "Seguridad Avanzada", desc: "Protección de datos con cifrado de extremo a extremo y cumplimiento de estándares." },
      { icon: "🎨", title: "Diseño Adaptable", desc: "Interfaz completamente personalizable que se adapta a la identidad de tu marca." },
    ],
    restaurant: [
      { icon: "🌿", title: "Ingredientes Frescos", desc: "Seleccionamos diariamente los mejores ingredientes de productores locales." },
      { icon: "👨‍🍳", title: "Chef con Experiencia", desc: "Nuestro equipo combina técnicas clásicas con innovación culinaria." },
      { icon: "🚗", title: "Delivery Express", desc: "Entrega a domicilio en menos de 45 minutos con empaque especial." },
    ],
    fitness: [
      { icon: "💪", title: "Entrenamiento Personal", desc: "Programas diseñados por certificados NSCA adaptados a tus objetivos." },
      { icon: "🏋️", title: "Equipamiento Premium", desc: "Máquinas de última generación en instalaciones climatizadas." },
      { icon: "🧘", title: "Clases Grupales", desc: "Más de 30 clases semanales: yoga, HIIT, spinning, pilates y más." },
    ],
    agency: [
      { icon: "🎯", title: "Estrategia Digital", desc: "Análisis de mercado, planificación y ejecución con ROI medible." },
      { icon: "💻", title: "Desarrollo Web & App", desc: "Sitios y apps de alto rendimiento con tecnologías modernas." },
      { icon: "📈", title: "Marketing & Growth", desc: "SEO, SEM, social media para posicionar y hacer crecer tu marca." },
    ],
    ecommerce: [
      { icon: "🚚", title: "Envío Gratuito", desc: "Envío sin costo en compras mayores a $50. Entrega rastreada y segura." },
      { icon: "🔄", title: "Devoluciones Fáciles", desc: "30 días para devolver cualquier producto sin preguntas." },
      { icon: "💳", title: "Pago 100% Seguro", desc: "Múltiples métodos de pago protegidos con cifrado SSL." },
    ],
    portfolio: [
      { icon: "🎨", title: "Diseño UI/UX", desc: "Interfaces intuitivas con investigación de usuarios y prototipos interactivos." },
      { icon: "💻", title: "Desarrollo Full-Stack", desc: "Aplicaciones web robustas con React, Node.js y TypeScript." },
      { icon: "📱", title: "Apps Móviles", desc: "Desarrollo nativo y cross-platform para iOS y Android." },
    ],
    dashboard: [
      { icon: "📊", title: "Analytics en Tiempo Real", desc: "Dashboards interactivos con datos actualizados al segundo." },
      { icon: "🔔", title: "Alertas Inteligentes", desc: "Notificaciones configurables para métricas clave." },
      { icon: "📋", title: "Reportes Automáticos", desc: "Generación automática de reportes en PDF y Excel." },
    ],
    blog: [
      { icon: "✍️", title: "Contenido Original", desc: "Artículos investigados y escritos por expertos de la industria." },
      { icon: "🔍", title: "Fácil Navegación", desc: "Sistema de categorías, tags y búsqueda avanzada." },
      { icon: "💬", title: "Comunidad Activa", desc: "Comenta y debate ideas con profesionales apasionados." },
    ],
    clinic: [
      { icon: "🏥", title: "Instalaciones Modernas", desc: "Equipamiento médico de última generación para diagnósticos precisos." },
      { icon: "👨‍⚕️", title: "Médicos Certificados", desc: "Profesionales con certificaciones internacionales." },
      { icon: "📋", title: "Historia Clínica Digital", desc: "Accede a tu expediente médico desde cualquier dispositivo." },
    ],
    realestate: [
      { icon: "🏠", title: "Amplio Catálogo", desc: "Miles de propiedades verificadas entre apartamentos, casas y oficinas." },
      { icon: "📊", title: "Asesoría Personalizada", desc: "Agentes certificados que te guían en todo el proceso." },
      { icon: "🔑", title: "Proceso Simplificado", desc: "Trámites digitalizados y financiamiento asesorado." },
    ],
    education: [
      { icon: "📚", title: "Cursos de Calidad", desc: "Contenido diseñado por expertos con metodología práctica." },
      { icon: "🎓", title: "Certificaciones Válidas", desc: "Diplomas y certificados reconocidos por la industria." },
      { icon: "💻", title: "Aprendizaje Flexible", desc: "Estudia a tu ritmo con acceso 24/7 desde cualquier dispositivo." },
    ],
    veterinary: [
      { icon: "🐾", title: "Atención Integral", desc: "Consultas, vacunación, cirugías y medicina preventiva." },
      { icon: "🏥", title: "Equipamiento Moderno", desc: "Rayos X digital, ecografía, laboratorio y quirófano equipado." },
      { icon: "❤️", title: "Trato con Amor", desc: "Cada mascota recibe atención con cariño y profesionalismo." },
    ],
    hotel: [
      { icon: "🛏️", title: "Habitaciones Premium", desc: "Suites y habitaciones con amenidades de lujo y vista panorámica." },
      { icon: "🍽️", title: "Restaurante Gourmet", desc: "Gastronomía internacional con ingredientes locales de primera." },
      { icon: "🏊", title: "Amenidades", desc: "Piscina, spa, gimnasio y áreas de recreación para toda la familia." },
    ],
    lawyer: [
      { icon: "⚖️", title: "Derecho Civil", desc: "Contratos, herencias, divorcios y litigios civiles con experiencia comprobada." },
      { icon: "🏢", title: "Derecho Corporativo", desc: "Constitución de empresas, fusiones y asesoría mercantil integral." },
      { icon: "📜", title: "Derecho Penal", desc: "Defensa penal especializada con enfoque estratégico y confidencial." },
    ],
    accounting: [
      { icon: "📊", title: "Contabilidad General", desc: "Registro, clasificación y análisis de todas tus operaciones financieras." },
      { icon: "💰", title: "Declaración de Impuestos", desc: "Cumplimiento fiscal optimizado para pagar solo lo justo." },
      { icon: "📋", title: "Auditoría", desc: "Revisión y verificación de estados financieros con estándares internacionales." },
    ],
    photography: [
      { icon: "📸", title: "Bodas & Eventos", desc: "Cobertura fotográfica completa de tus momentos más especiales." },
      { icon: "👤", title: "Retratos Profesionales", desc: "Sesiones individuales, familiares y corporativas con estilo único." },
      { icon: "🏢", title: "Fotografía Comercial", desc: "Producto, arquitectura e interiorismo para potenciar tu marca." },
    ],
    music: [
      { icon: "🎙️", title: "Grabación", desc: "Estudio profesional con acústica tratada y equipamiento de primera línea." },
      { icon: "🎛️", title: "Mezcla & Master", desc: "Procesamiento de audio profesional para un sonido competitivo." },
      { icon: "🎵", title: "Producción Musical", desc: "Composición, arreglos y producción completa de tus canciones." },
    ],
    salon: [
      { icon: "✂️", title: "Corte & Peinado", desc: "Estilistas expertos que crean el look perfecto para ti." },
      { icon: "💅", title: "Manicure & Pedicure", desc: "Tratamientos de uñas con productos de alta calidad y tendencias." },
      { icon: "💆", title: "Tratamientos Faciales", desc: "Limpiezas, hidrataciones y rejuvenecimiento con tecnología avanzada." },
    ],
    technology: [
      { icon: "💻", title: "Desarrollo a Medida", desc: "Software personalizado con las últimas tecnologías y mejores prácticas." },
      { icon: "☁️", title: "Cloud & DevOps", desc: "Infraestructura escalable, CI/CD y despliegues automatizados." },
      { icon: "🤖", title: "Inteligencia Artificial", desc: "Soluciones de IA y machine learning para automatizar procesos." },
    ],
  };
  return map[intent] || map.landing;
}

function getAboutText(intent: string, name: string): string {
  const map: Record<string, string> = {
    restaurant: `En ${name} creemos que la gastronomía es un arte que une culturas y personas. Nos hemos comprometido a ofrecer una experiencia culinaria excepcional.`,
    portfolio: `Soy un profesional creativo con más de 5 años transformando ideas en productos digitales de impacto.`,
    agency: `${name} nació de la convicción de que cada marca merece una presencia digital extraordinaria.`,
    fitness: `En ${name} tu bienestar integral es nuestra razón de ser. Instalaciones de clase mundial y entrenadores certificados.`,
    hotel: `${name} ofrece una experiencia de hospitalidad excepcional. Cada detalle está cuidado para hacer de tu estancia algo memorable.`,
    lawyer: `En ${name} defendemos tus derechos con profesionalismo y ética. Más de 15 años de experiencia en todas las ramas del derecho.`,
    accounting: `${name} brinda servicios contables y fiscales de precisión. Tu tranquilidad financiera es nuestra especialidad.`,
    photography: `En ${name} cada imagen cuenta una historia. Combinamos creatividad y técnica para capturar momentos irrepetibles.`,
    music: `${name} es un espacio donde la música cobra vida. Producción profesional con pasión por el sonido perfecto.`,
    salon: `${name} es tu refugio de belleza y bienestar. Profesionales apasionados que cuidan cada detalle para que te sientas increíble.`,
    technology: `${name} desarrolla soluciones tecnológicas que transforman negocios. Innovación, calidad y resultados medibles.`,
  };
  return map[intent] || `${name} nació con la misión de ofrecer soluciones innovadoras que marquen la diferencia.`;
}

function getAboutStats(intent: string): { value: string; label: string }[] {
  const map: Record<string, { value: string; label: string }[]> = {
    restaurant: [{ value: "8+", label: "Años" }, { value: "50K+", label: "Clientes" }, { value: "4.9", label: "Rating" }],
    fitness: [{ value: "2K+", label: "Miembros" }, { value: "30+", label: "Clases" }, { value: "15", label: "Entrenadores" }],
    agency: [{ value: "200+", label: "Proyectos" }, { value: "50+", label: "Clientes" }, { value: "98%", label: "Satisfacción" }],
    portfolio: [{ value: "80+", label: "Proyectos" }, { value: "40+", label: "Clientes" }, { value: "5", label: "Años" }],
    ecommerce: [{ value: "10K+", label: "Productos" }, { value: "50K+", label: "Ventas" }, { value: "4.8", label: "Rating" }],
    hotel: [{ value: "15K+", label: "Huéspedes" }, { value: "4.9", label: "Rating" }, { value: "10+", label: "Años" }],
    lawyer: [{ value: "500+", label: "Casos" }, { value: "95%", label: "Éxito" }, { value: "15+", label: "Años" }],
    accounting: [{ value: "300+", label: "Clientes" }, { value: "100%", label: "Cumplimiento" }, { value: "12+", label: "Años" }],
    photography: [{ value: "1K+", label: "Sesiones" }, { value: "5K+", label: "Fotos" }, { value: "4.9", label: "Rating" }],
    salon: [{ value: "5K+", label: "Clientes" }, { value: "15+", label: "Estilistas" }, { value: "4.8", label: "Rating" }],
    technology: [{ value: "100+", label: "Proyectos" }, { value: "50+", label: "Clientes" }, { value: "99.9%", label: "Uptime" }],
  };
  return map[intent] || [{ value: "100+", label: "Clientes" }, { value: "5+", label: "Años" }, { value: "99%", label: "Satisfacción" }];
}

function getMenuItems(_intent: string): { name: string; desc: string; price: string }[] {
  return [
    { name: "☕ Café de Especialidad", desc: "Grano arábica de altura, tostado artesanal", price: "$4.50" },
    { name: "🥐 Croissant de Mantequilla", desc: "Hojaldre artesanal con mantequilla francesa", price: "$4.00" },
    { name: "🥑 Tostada de Aguacate", desc: "Pan de masa madre, aguacate, huevo pochado", price: "$9.50" },
    { name: "🥗 Bowl Mediterráneo", desc: "Quinoa, hummus, falafel, verduras asadas", price: "$11.00" },
    { name: "🍝 Pasta Fresca al Pesto", desc: "Tagliatelle artesanal, pesto genovés", price: "$13.00" },
    { name: "🍰 Tarta de Temporada", desc: "Postre del día con frutas orgánicas", price: "$7.50" },
  ];
}

function getPricingPlans(intent: string): { name: string; price: string; features: string[] }[] {
  const map: Record<string, { name: string; price: string; features: string[] }[]> = {
    fitness: [
      { name: "Básico", price: "$29/mes", features: ["Acceso al gimnasio", "Horario 6am-10pm", "1 clase grupal/semana", "Locker diario"] },
      { name: "Premium", price: "$59/mes", features: ["Acceso 24/7", "Todas las clases", "1 sesión personal/mes", "Locker permanente", "Spa"] },
      { name: "VIP", price: "$99/mes", features: ["Todo en Premium", "2 sesiones personales/sem", "Plan nutricional", "Spa ilimitado", "Invitados gratis"] },
    ],
    hotel: [
      { name: "Estándar", price: "$89/noche", features: ["Habitación doble", "Desayuno incluido", "Wi-Fi", "TV por cable"] },
      { name: "Superior", price: "$149/noche", features: ["Suite junior", "Desayuno buffet", "Acceso a spa", "Mini bar", "Vista al jardín"] },
      { name: "Premium", price: "$249/noche", features: ["Suite presidencial", "Todo incluido", "Spa privado", "Mayordomo", "Transfer aeropuerto"] },
    ],
    salon: [
      { name: "Express", price: "$25", features: ["Corte básico", "Lavado", "Secado", "30 minutos"] },
      { name: "Completo", price: "$65", features: ["Corte + peinado", "Tratamiento capilar", "Manicure", "Café o té"] },
      { name: "VIP", price: "$120", features: ["Todo en Completo", "Coloración", "Tratamiento facial", "Masaje craneal", "Copa de vino"] },
    ],
    photography: [
      { name: "Básica", price: "$150", features: ["1 hora de sesión", "20 fotos editadas", "1 cambio de outfit", "Entrega digital"] },
      { name: "Profesional", price: "$350", features: ["3 horas de sesión", "50 fotos editadas", "3 cambios de outfit", "2 locaciones", "Entrega digital + impresa"] },
      { name: "Premium", price: "$600", features: ["Sesión completa", "100+ fotos editadas", "Cambios ilimitados", "Locación premium", "Álbum impreso", "Video behind the scenes"] },
    ],
  };
  return map[intent] || [
    { name: "Starter", price: "$9/mes", features: ["Funcionalidad esencial", "1 usuario", "5GB almacenamiento", "Soporte email"] },
    { name: "Professional", price: "$29/mes", features: ["Todo en Starter", "10 usuarios", "50GB almacenamiento", "Soporte prioritario", "API"] },
    { name: "Enterprise", price: "$99/mes", features: ["Todo en Professional", "Usuarios ilimitados", "Almacenamiento ilimitado", "Soporte 24/7", "SSO", "SLA"] },
  ];
}

function getTestimonials(): { name: string; text: string; role: string }[] {
  return [
    { name: "Ana García", text: "Superó todas mis expectativas. La calidad del resultado final es impresionante.", role: "Directora de Innovación" },
    { name: "Carlos López", text: "El equipo más profesional con el que he trabajado. Resultados excepcionales.", role: "CEO, TechStart" },
    { name: "María Rodríguez", text: "Transformaron nuestra presencia digital. 300% más de engagement.", role: "CMO, BrandCo" },
  ];
}

function getFAQs(intent: string): { q: string; a: string }[] {
  const map: Record<string, { q: string; a: string }[]> = {
    clinic: [
      { q: "¿Necesito cita previa?", a: "Sí, recomendamos agendar tu cita previamente para una atención personalizada." },
      { q: "¿Aceptan seguros médicos?", a: "Trabajamos con las principales aseguradoras del país." },
      { q: "¿Qué especialidades tienen?", a: "Contamos con medicina general, pediatría, dermatología, cardiología y más." },
      { q: "¿Tienen emergencias?", a: "Sí, atención de urgencias 24/7." },
    ],
    veterinary: [
      { q: "¿Atienden emergencias 24h?", a: "Sí, tenemos servicio de emergencias veterinarias 24 horas." },
      { q: "¿Qué animales atienden?", a: "Perros, gatos, aves, conejos y animales exóticos." },
      { q: "¿Ofrecen plan de vacunación?", a: "Sí, planes completos adaptados a la edad y raza." },
      { q: "¿Tienen peluquería?", a: "Sí, grooming profesional con tratamientos especiales." },
    ],
    hotel: [
      { q: "¿Cuál es la hora de check-in?", a: "Check-in a partir de las 15:00, check-out hasta las 12:00." },
      { q: "¿Aceptan mascotas?", a: "Sí, somos pet-friendly con áreas designadas para mascotas." },
      { q: "¿Tienen estacionamiento?", a: "Sí, estacionamiento gratuito para huéspedes." },
      { q: "¿Ofrecen transfer?", a: "Sí, servicio de transfer aeropuerto-hotel con reserva previa." },
    ],
    lawyer: [
      { q: "¿Ofrecen primera consulta gratis?", a: "Sí, la primera consulta de evaluación es sin costo." },
      { q: "¿En qué áreas se especializan?", a: "Derecho civil, penal, corporativo, laboral y familiar." },
      { q: "¿Manejan casos internacionales?", a: "Sí, tenemos experiencia en derecho internacional." },
      { q: "¿Cuáles son sus honorarios?", a: "Varían según la complejidad. Ofrecemos presupuesto personalizado." },
    ],
  };
  return map[intent] || [
    { q: "¿Cómo puedo empezar?", a: "Contáctanos a través del formulario o llámanos directamente." },
    { q: "¿Cuáles son los horarios?", a: "Lunes a viernes 9:00-18:00, sábados 9:00-14:00." },
    { q: "¿Ofrecen garantía?", a: "Sí, todos nuestros servicios incluyen garantía de satisfacción." },
    { q: "¿Cómo puedo pagar?", a: "Efectivo, tarjetas, transferencias y pagos digitales." },
  ];
}

function getTeamMembers(intent: string): { name: string; role: string; bio: string; avatar: string }[] {
  const map: Record<string, { name: string; role: string; bio: string; avatar: string }[]> = {
    clinic: [
      { name: "Dra. Laura Martínez", role: "Directora Médica", bio: "15 años de experiencia en medicina interna.", avatar: "👩‍⚕️" },
      { name: "Dr. Roberto Sánchez", role: "Cardiólogo", bio: "Fellow del American College of Cardiology.", avatar: "👨‍⚕️" },
      { name: "Dra. Patricia Vega", role: "Pediatra", bio: "Dedicada a la salud infantil desde hace 12 años.", avatar: "👩‍⚕️" },
    ],
    veterinary: [
      { name: "Dra. Sofía Ruiz", role: "Directora Veterinaria", bio: "Especialista en pequeñas especies con 10 años.", avatar: "👩‍⚕️" },
      { name: "Dr. Miguel Torres", role: "Cirujano Veterinario", bio: "Especializado en ortopedia y tejidos blandos.", avatar: "👨‍⚕️" },
      { name: "María López", role: "Groomer Profesional", bio: "Certificada en estilismo canino y felino.", avatar: "💇" },
    ],
    lawyer: [
      { name: "Lic. Fernando Reyes", role: "Socio Fundador", bio: "20 años de experiencia en derecho corporativo.", avatar: "⚖️" },
      { name: "Lic. Carmen Silva", role: "Derecho Civil", bio: "Especialista en litigios civiles y familiares.", avatar: "👩‍💼" },
      { name: "Lic. Antonio Méndez", role: "Derecho Penal", bio: "Defensor penal con amplia trayectoria.", avatar: "👨‍💼" },
    ],
  };
  return map[intent] || [
    { name: "Ana García", role: "CEO & Fundadora", bio: "Visionaria con 15+ años liderando equipos.", avatar: "👩‍💼" },
    { name: "Carlos López", role: "Director Técnico", bio: "Ingeniero de software apasionado por la innovación.", avatar: "👨‍💻" },
    { name: "María Rodríguez", role: "Directora Creativa", bio: "Diseñadora premiada con enfoque en UX.", avatar: "🎨" },
  ];
}

// ==================== PLAN GENERATOR ====================
function generatePlan(intent: string, entities: Entities): string[] {
  const steps: string[] = [];
  const name = entities.businessName;

  if (entities.sections.includes("navbar")) steps.push(`Crear navegación responsive con "${name}"`);
  if (entities.sections.includes("hero")) steps.push(`Diseñar hero section con imagen de ${intentMap[intent]?.label || intent}`);
  if (entities.sections.includes("features")) steps.push("Generar sección de características con iconos");
  if (entities.sections.includes("about")) steps.push("Crear sección Sobre Nosotros con estadísticas");
  if (entities.sections.includes("menu")) steps.push("Generar menú gastronómico con precios");
  if (entities.sections.includes("gallery")) steps.push("Diseñar galería de imágenes interactiva");
  if (entities.sections.includes("pricing")) steps.push("Crear tabla de precios con plan destacado");
  if (entities.sections.includes("testimonials")) steps.push("Agregar testimonios con ratings");
  if (entities.sections.includes("faq")) steps.push("Agregar sección de preguntas frecuentes");
  if (entities.sections.includes("team")) steps.push("Crear sección del equipo profesional");
  if (entities.sections.includes("contact")) steps.push("Agregar formulario de contacto");
  if (entities.sections.includes("footer")) steps.push("Crear footer con navegación y links");
  steps.push(`Aplicar paleta de colores: ${entities.colorScheme}`);
  steps.push("Compilar componentes React/TypeScript");
  steps.push("Inyectar animaciones e interactividad con hooks");

  return steps;
}

// ==================== MAIN HANDLER ====================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { message, mode, action, logId, accepted, feedback } = body;

    // Handle feedback logging
    if (action === "feedback" && logId) {
      await updateInteractionFeedback(logId, accepted, feedback);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Se requiere un mensaje" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Query learning patterns
    const patterns = await queryLearningPatterns();

    // 2. Tokenize and classify with enhanced NLP
    const tokens = tokenize(message);
    const { intent, confidence, label } = classifyIntent(tokens, patterns);
    const entities = extractEntities(message, tokens, intent);
    const colors = getColors(entities.colorScheme);

    // 3. Generate React/TypeScript HTML
    const html = composeReactHtml({
      name: entities.businessName,
      colors,
      sections: entities.sections,
      intent,
    });

    // 4. Log interaction for learning
    const newLogId = await logInteraction(message, intent, entities as unknown as Record<string, unknown>, confidence);

    const response: Record<string, unknown> = {
      intent,
      confidence,
      label,
      entities,
      html,
      logId: newLogId,
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
