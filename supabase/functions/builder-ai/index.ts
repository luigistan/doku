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

// ==================== INTENT DATABASE SCHEMA ====================
const intentDatabaseSchema: Record<string, { name: string; columns: { name: string; type: string }[] }[]> = {
  ecommerce: [
    { name: "products", columns: [
      { name: "name", type: "text" }, { name: "description", type: "text" }, { name: "price", type: "number" },
      { name: "image_url", type: "url" }, { name: "category", type: "text" }, { name: "stock", type: "number" }, { name: "active", type: "boolean" },
    ]},
    { name: "orders", columns: [
      { name: "customer_name", type: "text" }, { name: "customer_email", type: "email" }, { name: "total", type: "number" },
      { name: "status", type: "select" }, { name: "order_date", type: "date" },
    ]},
    { name: "customers", columns: [
      { name: "name", type: "text" }, { name: "email", type: "email" }, { name: "phone", type: "text" }, { name: "address", type: "text" },
    ]},
  ],
  restaurant: [
    { name: "menu_items", columns: [
      { name: "name", type: "text" }, { name: "description", type: "text" }, { name: "price", type: "number" },
      { name: "category", type: "text" }, { name: "image_url", type: "url" }, { name: "available", type: "boolean" },
    ]},
    { name: "reservations", columns: [
      { name: "customer_name", type: "text" }, { name: "customer_email", type: "email" }, { name: "date", type: "date" },
      { name: "guests", type: "number" }, { name: "status", type: "select" }, { name: "notes", type: "text" },
    ]},
  ],
  fitness: [
    { name: "members", columns: [
      { name: "name", type: "text" }, { name: "email", type: "email" }, { name: "phone", type: "text" },
      { name: "plan", type: "select" }, { name: "start_date", type: "date" }, { name: "active", type: "boolean" },
    ]},
    { name: "classes", columns: [
      { name: "name", type: "text" }, { name: "instructor", type: "text" }, { name: "schedule", type: "text" },
      { name: "capacity", type: "number" }, { name: "category", type: "text" },
    ]},
  ],
  clinic: [
    { name: "patients", columns: [
      { name: "name", type: "text" }, { name: "email", type: "email" }, { name: "phone", type: "text" },
      { name: "birth_date", type: "date" }, { name: "notes", type: "text" },
    ]},
    { name: "appointments", columns: [
      { name: "patient_name", type: "text" }, { name: "doctor", type: "text" }, { name: "date", type: "date" },
      { name: "status", type: "select" }, { name: "notes", type: "text" },
    ]},
  ],
  hotel: [
    { name: "rooms", columns: [
      { name: "name", type: "text" }, { name: "type", type: "select" }, { name: "price", type: "number" },
      { name: "capacity", type: "number" }, { name: "available", type: "boolean" }, { name: "description", type: "text" },
    ]},
    { name: "reservations", columns: [
      { name: "guest_name", type: "text" }, { name: "guest_email", type: "email" }, { name: "room", type: "text" },
      { name: "check_in", type: "date" }, { name: "check_out", type: "date" }, { name: "status", type: "select" },
    ]},
  ],
  education: [
    { name: "courses", columns: [
      { name: "name", type: "text" }, { name: "description", type: "text" }, { name: "instructor", type: "text" },
      { name: "price", type: "number" }, { name: "duration", type: "text" }, { name: "level", type: "select" },
    ]},
    { name: "students", columns: [
      { name: "name", type: "text" }, { name: "email", type: "email" }, { name: "phone", type: "text" },
      { name: "enrolled_date", type: "date" }, { name: "course", type: "text" },
    ]},
  ],
  realestate: [
    { name: "properties", columns: [
      { name: "title", type: "text" }, { name: "description", type: "text" }, { name: "price", type: "number" },
      { name: "location", type: "text" }, { name: "type", type: "select" }, { name: "bedrooms", type: "number" }, { name: "image_url", type: "url" },
    ]},
    { name: "inquiries", columns: [
      { name: "name", type: "text" }, { name: "email", type: "email" }, { name: "phone", type: "text" },
      { name: "property", type: "text" }, { name: "message", type: "text" }, { name: "date", type: "date" },
    ]},
  ],
  salon: [
    { name: "services", columns: [
      { name: "name", type: "text" }, { name: "description", type: "text" }, { name: "price", type: "number" },
      { name: "duration", type: "text" }, { name: "category", type: "text" },
    ]},
    { name: "appointments", columns: [
      { name: "client_name", type: "text" }, { name: "client_phone", type: "text" }, { name: "service", type: "text" },
      { name: "date", type: "date" }, { name: "status", type: "select" },
    ]},
  ],
  veterinary: [
    { name: "patients", columns: [
      { name: "pet_name", type: "text" }, { name: "species", type: "select" }, { name: "breed", type: "text" },
      { name: "owner_name", type: "text" }, { name: "owner_phone", type: "text" }, { name: "notes", type: "text" },
    ]},
    { name: "appointments", columns: [
      { name: "pet_name", type: "text" }, { name: "owner_name", type: "text" }, { name: "date", type: "date" },
      { name: "reason", type: "text" }, { name: "status", type: "select" },
    ]},
  ],
};

// ==================== AUTO CREATE PROJECT TABLES ====================
async function autoCreateProjectTables(
  projectId: string,
  intent: string
): Promise<string[]> {
  const schema = intentDatabaseSchema[intent];
  if (!schema) {
    console.log(`[AutoDB] No schema defined for intent: ${intent}`);
    return [];
  }

  const sb = getSupabaseClient();

  // Check if project already has tables
  const { data: existingTables } = await sb
    .from("app_tables")
    .select("id")
    .eq("project_id", projectId)
    .limit(1);

  if (existingTables && existingTables.length > 0) {
    console.log(`[AutoDB] Project ${projectId} already has tables, skipping auto-creation`);
    return [];
  }

  // Enable db_enabled on project
  await sb.from("projects").update({ db_enabled: true }).eq("id", projectId);

  const createdTableNames: string[] = [];

  for (const tableDef of schema) {
    // Create table
    const { data: tableData, error: tableError } = await sb
      .from("app_tables")
      .insert({ project_id: projectId, name: tableDef.name })
      .select("id")
      .single();

    if (tableError || !tableData) {
      console.error(`[AutoDB] Error creating table ${tableDef.name}:`, tableError);
      continue;
    }

    // Create columns
    const columnsToInsert = tableDef.columns.map((col, idx) => ({
      table_id: tableData.id,
      name: col.name,
      column_type: col.type,
      position: idx,
      is_required: idx === 0, // first column is required
    }));

    const { error: colError } = await sb.from("app_columns").insert(columnsToInsert);
    if (colError) {
      console.error(`[AutoDB] Error creating columns for ${tableDef.name}:`, colError);
    }

    createdTableNames.push(tableDef.name);
  }

  console.log(`[AutoDB] Created ${createdTableNames.length} tables for ${intent}: ${createdTableNames.join(", ")}`);
  return createdTableNames;
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

// Normalized similarity (0-1, higher = more similar)
function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// ==================== VERB-INTENT MAPPING ====================
// Action verbs strongly indicate what the user wants to DO
const verbIntentMap: Record<string, string[]> = {
  // Commerce verbs
  vender: ["ecommerce"], comprar: ["ecommerce"], comercializar: ["ecommerce"],
  ofrecer: ["ecommerce", "landing"], promocionar: ["landing", "agency"],
  // Food verbs
  cocinar: ["restaurant"], servir: ["restaurant"], reservar: ["restaurant", "hotel"],
  // Creative verbs
  mostrar: ["portfolio", "gallery"], exhibir: ["portfolio", "gallery"],
  fotografiar: ["photography"], capturar: ["photography"],
  disenar: ["agency", "portfolio"], grabar: ["music"],
  // Professional verbs
  defender: ["lawyer"], litigar: ["lawyer"], demandar: ["lawyer"],
  diagnosticar: ["clinic"], operar: ["clinic"], curar: ["clinic", "veterinary"],
  contar: ["accounting"], facturar: ["accounting"], auditar: ["accounting"],
  ensenar: ["education"], capacitar: ["education"], formar: ["education"],
  entrenar: ["fitness"], ejercitar: ["fitness"],
  hospedar: ["hotel"], alojar: ["hotel"],
  cortar: ["salon"], peinar: ["salon"], maquillar: ["salon"],
  programar: ["technology"], desarrollar: ["technology", "agency"],
  // Generic intent verbs
  publicar: ["blog"], escribir: ["blog"],
  administrar: ["dashboard"], gestionar: ["dashboard"],
};

// ==================== PHRASE PATTERN MATCHING ====================
// Common sentence patterns that strongly indicate intent
const phrasePatterns: { pattern: RegExp; intent: string; boost: number }[] = [
  // Commerce patterns
  { pattern: /(?:quiero|necesito|deseo)\s+vender/i, intent: "ecommerce", boost: 5 },
  { pattern: /tienda\s+(?:de|para|en\s+linea|online|virtual)/i, intent: "ecommerce", boost: 5 },
  { pattern: /(?:venta|ventas)\s+(?:de|en\s+linea|online)/i, intent: "ecommerce", boost: 4 },
  { pattern: /(?:carrito|checkout|catalogo)\s+(?:de\s+)?(?:compras|productos)/i, intent: "ecommerce", boost: 5 },
  // Restaurant patterns
  { pattern: /(?:menu|carta)\s+(?:de\s+)?(?:comida|platillos|bebidas)/i, intent: "restaurant", boost: 5 },
  { pattern: /(?:restaurante|cafeteria|cafe|comedor|taqueria|pizzeria)/i, intent: "restaurant", boost: 4 },
  { pattern: /(?:reserv(?:ar|acion))\s+(?:de\s+)?mesa/i, intent: "restaurant", boost: 5 },
  // Portfolio patterns
  { pattern: /(?:mostrar|exhibir)\s+(?:mis|mi)\s+(?:trabajos|proyectos|portfolio|obra)/i, intent: "portfolio", boost: 5 },
  { pattern: /(?:hoja\s+de\s+vida|curriculum|cv)/i, intent: "portfolio", boost: 4 },
  // Professional patterns
  { pattern: /(?:consultorio|clinica|centro)\s+(?:medico|dental|salud)/i, intent: "clinic", boost: 5 },
  { pattern: /(?:bufete|despacho|firma)\s+(?:legal|juridic|abogad)/i, intent: "lawyer", boost: 5 },
  { pattern: /(?:despacho|oficina)\s+(?:contable|fiscal|contadur)/i, intent: "accounting", boost: 5 },
  { pattern: /(?:salon|centro)\s+(?:de\s+)?(?:belleza|estetica)/i, intent: "salon", boost: 5 },
  { pattern: /(?:peluqueria|barberia|barber\s*shop)/i, intent: "salon", boost: 5 },
  { pattern: /(?:estudio)\s+(?:de\s+)?(?:fotografia|foto)/i, intent: "photography", boost: 5 },
  { pattern: /(?:estudio)\s+(?:de\s+)?(?:grabacion|musica)/i, intent: "music", boost: 5 },
  { pattern: /(?:empresa|startup)\s+(?:de\s+)?(?:tecnologia|software|tech)/i, intent: "technology", boost: 5 },
  // Education patterns
  { pattern: /(?:academia|escuela|cursos|instituto)\s+(?:de|para|online)/i, intent: "education", boost: 4 },
  // Real estate patterns
  { pattern: /(?:bienes\s+raices|inmobiliaria|inmuebles)/i, intent: "realestate", boost: 5 },
  { pattern: /(?:venta|renta|alquiler)\s+(?:de\s+)?(?:casas|departamentos|propiedades)/i, intent: "realestate", boost: 5 },
  // Hotel patterns
  { pattern: /(?:hotel|hostal|hospedaje|airbnb|resort|posada)/i, intent: "hotel", boost: 4 },
  // Fitness patterns
  { pattern: /(?:gimnasio|gym|crossfit|box\s+de\s+crossfit)/i, intent: "fitness", boost: 4 },
  // Dashboard / Blog / Agency
  { pattern: /(?:panel|dashboard)\s+(?:de\s+)?(?:control|admin)/i, intent: "dashboard", boost: 5 },
  { pattern: /(?:blog|revista|magazine)\s+(?:personal|profesional|digital)/i, intent: "blog", boost: 4 },
  { pattern: /(?:agencia)\s+(?:de\s+)?(?:marketing|digital|publicidad|diseno|creativa)/i, intent: "agency", boost: 5 },
  // Veterinary
  { pattern: /(?:veterinaria|clinica\s+veterinaria|pet\s*shop)/i, intent: "veterinary", boost: 5 },
];

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

// ==================== FEW-SHOT LEARNING FROM DB (Enhanced + 5min Cache) ====================
interface LearningLog {
  user_message: string;
  detected_intent: string;
  detected_entities: Record<string, unknown>;
  confidence: number;
  created_at: string;
  user_accepted: boolean | null;
}

let cachedPatterns: LearningLog[] | null = null;
let cachedPatternsTime = 0;
const PATTERN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function queryLearningPatterns(): Promise<LearningLog[]> {
  // Return cached if fresh
  if (cachedPatterns && (Date.now() - cachedPatternsTime) < PATTERN_CACHE_TTL) {
    console.log(`[Cache] Using cached patterns (${cachedPatterns.length} entries, age: ${Math.round((Date.now() - cachedPatternsTime) / 1000)}s)`);
    return cachedPatterns;
  }

  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("ai_learning_logs")
      .select("user_message, detected_intent, detected_entities, confidence, created_at, user_accepted")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    cachedPatterns = (data || []) as LearningLog[];
    cachedPatternsTime = Date.now();
    console.log(`[Cache] Refreshed patterns cache: ${cachedPatterns.length} entries`);
    return cachedPatterns;
  } catch {
    return cachedPatterns || [];
  }
}

// Auto-expand keywords from learning logs - builds dynamic synonym map
function buildDynamicKeywords(patterns: LearningLog[]): Map<string, Map<string, number>> {
  // Maps intent -> (token -> frequency)
  const intentTokenFreq = new Map<string, Map<string, number>>();

  for (const p of patterns) {
    const tokens = tokenize(p.user_message);
    if (!intentTokenFreq.has(p.detected_intent)) {
      intentTokenFreq.set(p.detected_intent, new Map());
    }
    const freqMap = intentTokenFreq.get(p.detected_intent)!;
    for (const t of tokens) {
      freqMap.set(t, (freqMap.get(t) || 0) + 1);
    }
  }

  return intentTokenFreq;
}

function matchFromLearning(tokens: string[], originalText: string, patterns: LearningLog[]): IntentMatch | null {
  if (patterns.length === 0) return null;

  let bestMatch: LearningLog | null = null;
  let bestScore = 0;
  const now = Date.now();

  for (const pattern of patterns) {
    const patTokens = tokenize(pattern.user_message);

    // 1. Token overlap (Jaccard similarity)
    const inputSet = new Set(tokens);
    const patSet = new Set(patTokens);
    const intersection = new Set([...inputSet].filter(x => patSet.has(x)));
    const union = new Set([...inputSet, ...patSet]);
    const jaccard = union.size > 0 ? intersection.size / union.size : 0;

    // 2. Fuzzy token matching
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

    // 3. Full string similarity
    const fullSim = stringSimilarity(
      tokens.join(" "),
      patTokens.join(" ")
    );

    // 4. Temporal decay - recent patterns get higher weight
    const ageMs = now - new Date(pattern.created_at).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0.5, 1 - ageDays / 60); // Decay over 60 days, min 0.5

    // Combine signals
    const rawScore = Math.max(jaccard, fuzzyScore, fullSim * 0.9);
    const finalScore = rawScore * recencyBoost;

    if (finalScore > bestScore && finalScore > 0.4) {
      bestScore = finalScore;
      bestMatch = pattern;
    }
  }

  if (bestMatch) {
    return {
      intent: bestMatch.detected_intent,
      confidence: Math.min(bestScore * 1.15, 0.99),
      label: intentMap[bestMatch.detected_intent]?.label || "Sitio Web",
    };
  }
  return null;
}

// ==================== TF-IDF VECTORIAL ENGINE ====================
const semanticVocabulary: Record<string, string[]> = {
  landing: ["landing", "principal", "home", "inicio", "empresa", "negocio", "startup", "corporativo", "institucional", "presentacion", "marca", "producto", "servicio", "innovacion", "digital", "profesional", "moderno", "compania", "organizacion", "fundacion"],
  restaurant: ["restaurante", "cafeteria", "cafe", "comida", "food", "bar", "cocina", "gastronomia", "pizzeria", "sushi", "panaderia", "bistro", "comedor", "taqueria", "mariscos", "asador", "buffet", "comer", "alimento", "plato", "sabor", "chef", "mesa", "reserva", "delivery", "receta", "ingrediente", "menu", "carta", "gourmet", "culinario", "hambre", "cenar", "almorzar", "desayunar", "brunch", "bebida", "postre", "comedor", "fonda"],
  portfolio: ["portfolio", "portafolio", "proyectos", "galeria", "trabajos", "curriculum", "cv", "freelancer", "disenador", "artista", "creativo", "muestra", "exhibir", "mostrar", "obra", "talento", "habilidades", "experiencia", "profesional"],
  blog: ["blog", "articulos", "posts", "noticias", "publicaciones", "contenido", "revista", "magazine", "editorial", "escribir", "publicar", "lectura", "opinion", "columna", "periodismo", "autor"],
  dashboard: ["dashboard", "panel", "admin", "administracion", "estadisticas", "metricas", "analytics", "control", "gestion", "crm", "reportes", "datos", "graficas", "monitoreo"],
  ecommerce: ["tienda", "ecommerce", "commerce", "shop", "productos", "comprar", "venta", "carrito", "store", "marketplace", "catalogo", "vender", "precio", "oferta", "envio", "pago", "pedido", "inventario", "articulo", "mercancia", "comercio", "negocio", "ropa", "zapatos", "accesorios", "joyeria", "moda"],
  fitness: ["gimnasio", "gym", "fitness", "ejercicio", "entrenamiento", "deporte", "crossfit", "yoga", "pilates", "wellness", "salud", "musculo", "fuerza", "cardio", "rutina", "nutricion", "proteina", "cuerpo", "atleta"],
  agency: ["agencia", "agency", "consultoria", "marketing", "digital", "estudio", "studio", "creativa", "diseno", "publicidad", "branding", "estrategia", "campaña", "cliente", "proyecto", "solucion"],
  clinic: ["clinica", "medico", "doctor", "hospital", "dental", "dentista", "medicina", "consultorio", "pediatra", "dermatologo", "health", "odontologo", "fisioterapia", "rehabilitacion", "salud", "paciente", "cita", "tratamiento", "diagnostico", "enfermedad", "cirugia"],
  realestate: ["inmobiliaria", "propiedades", "apartamentos", "casas", "alquiler", "inmuebles", "departamentos", "terrenos", "lotes", "bienes", "raices", "venta", "renta", "hipoteca", "construccion", "edificio"],
  education: ["escuela", "academia", "cursos", "educacion", "universidad", "colegio", "formacion", "capacitacion", "clases", "tutoria", "school", "institute", "aprender", "ensenar", "estudiante", "profesor", "maestro", "leccion", "diploma"],
  veterinary: ["veterinaria", "mascotas", "pet", "animales", "perros", "gatos", "vet", "cachorro", "gatito", "vacuna", "consulta", "animal", "peludito", "canino", "felino"],
  hotel: ["hotel", "hospedaje", "alojamiento", "airbnb", "hostal", "resort", "motel", "posada", "cabana", "habitaciones", "reservacion", "huesped", "turismo", "vacaciones", "descanso", "suite"],
  lawyer: ["abogado", "legal", "derecho", "bufete", "juridico", "notaria", "leyes", "litigio", "penalista", "civilista", "defensa", "demanda", "juicio", "asesor", "contrato"],
  accounting: ["contador", "contabilidad", "impuestos", "fiscal", "auditor", "contable", "facturacion", "nomina", "tributario", "balance", "finanzas", "declaracion", "sat"],
  photography: ["fotografo", "fotos", "fotografia", "sesion", "camara", "retrato", "boda", "eventos", "editorial", "imagen", "foto", "lente", "estudio", "album"],
  music: ["musico", "banda", "dj", "grabacion", "disquera", "musica", "cantante", "productor", "compositor", "cancion", "album", "concierto", "sonido", "audio", "instrumento"],
  salon: ["salon", "peluqueria", "barberia", "spa", "estetica", "belleza", "cabello", "unas", "maquillaje", "corte", "barber", "nails", "peinado", "tinte", "tratamiento", "facial", "manicure"],
  technology: ["tech", "software", "app", "desarrollo", "programacion", "tecnologia", "sistemas", "informatica", "devops", "cloud", "saas", "plataforma", "codigo", "web", "aplicacion", "inteligencia", "artificial"],
};

// Pre-compute IDF values
function computeIDF(vocabulary: Record<string, string[]>): Map<string, number> {
  const allTerms = new Set<string>();
  const intentCount = Object.keys(vocabulary).length;
  const termDocFreq = new Map<string, number>();

  for (const terms of Object.values(vocabulary)) {
    const uniqueTerms = new Set(terms);
    for (const t of uniqueTerms) {
      allTerms.add(t);
      termDocFreq.set(t, (termDocFreq.get(t) || 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, df] of termDocFreq) {
    idf.set(term, Math.log((intentCount + 1) / (df + 1)) + 1); // smoothed IDF
  }
  return idf;
}

function computeTFVector(tokens: string[], idf: Map<string, number>): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) || 0) + 1);
  }
  const vector = new Map<string, number>();
  for (const [term, freq] of tf) {
    const idfVal = idf.get(term) || 0;
    if (idfVal > 0) {
      vector.set(term, (freq / tokens.length) * idfVal);
    }
  }
  return vector;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, magA = 0, magB = 0;
  for (const [k, v] of a) {
    magA += v * v;
    const bv = b.get(k);
    if (bv) dot += v * bv;
  }
  for (const [, v] of b) magB += v * v;
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const cachedIDF = computeIDF(semanticVocabulary);
const cachedIntentVectors = new Map<string, Map<string, number>>();
for (const [intent, terms] of Object.entries(semanticVocabulary)) {
  cachedIntentVectors.set(intent, computeTFVector(terms, cachedIDF));
}

// ==================== CONVERSATIONAL MEMORY ====================
const followUpPatterns = [
  /^(?:cambia|cambiar|cambiale|modificar?)\s/i,
  /^(?:agrega|agregar|anadir?|anade|pon|ponle|incluir?|incluye)\s/i,
  /^(?:quita|quitar|elimina|eliminar|remueve|remover|saca|sacar)\s/i,
  /^(?:hazlo|hazla|hacelo|hacerlo|que sea)\s/i,
  /^(?:mejor|mas|menos)\s/i,
  /(?:color|colores)\s+(?:a\s+)?(?:rojo|azul|verde|morado|naranja|amarillo|rosa|negro|blanco|oscuro|claro|calido|frio|elegante|moderno|dorado|plateado|turquesa|coral)/i,
  /(?:nombre|llamar|llamalo|llamala)\s/i,
];

// Detect if message is a modification request (vs new creation)
const modificationPatterns = [
  /^(?:cambia|cambiar|cambiale|modificar?|modifica)\s/i,
  /^(?:agrega|agregar|anadir?|anade|pon|ponle|incluir?|incluye|mete|meter)\s/i,
  /^(?:quita|quitar|elimina|eliminar|remueve|remover|saca|sacar|borra|borrar)\s/i,
  /^(?:hazlo|hazla|hacelo|hacerlo|que sea|que quede)\s/i,
  /(?:mas|menos)\s+(?:moderno|elegante|oscuro|claro|grande|pequeno|simple|profesional|colorido|serio|divertido|minimalista)/i,
  /(?:cambia|pon|ponle)\s+(?:el\s+)?(?:color|fondo|titulo|nombre|fuente|texto|imagen)/i,
  /(?:mueve|mover|reordena|reordenar|intercambia)\s/i,
];

function isModification(message: string): boolean {
  const normalized = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return modificationPatterns.some(p => p.test(normalized));
}

function isFollowUp(message: string): boolean {
  const normalized = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return followUpPatterns.some(p => p.test(normalized));
}

// ==================== NEGATIVE LEARNING ====================
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

function applyNegativeLearning(
  scores: Record<string, number>,
  tokens: string[],
  patterns: LearningLog[]
): void {
  const rejectedPatterns = patterns.filter(p => p.user_accepted === false);
  const acceptedPatterns = patterns.filter(p => p.user_accepted === true);

  for (const rejected of rejectedPatterns) {
    const rejTokens = tokenize(rejected.user_message);
    const sim = jaccardSimilarity(tokens, rejTokens);
    if (sim > 0.4) {
      // Penalize the rejected intent
      scores[rejected.detected_intent] = (scores[rejected.detected_intent] || 0) - 3 * sim;
      // If feedback suggests another intent, boost it
      if (rejected.user_accepted === false && rejected.detected_entities) {
        const entities = rejected.detected_entities as Record<string, unknown>;
        if (entities.suggestedIntent && typeof entities.suggestedIntent === "string") {
          scores[entities.suggestedIntent] = (scores[entities.suggestedIntent] || 0) + 2;
        }
      }
    }
  }

  // Boost accepted patterns (3x weight)
  for (const accepted of acceptedPatterns) {
    const accTokens = tokenize(accepted.user_message);
    const sim = jaccardSimilarity(tokens, accTokens);
    if (sim > 0.3) {
      scores[accepted.detected_intent] = (scores[accepted.detected_intent] || 0) + 3 * sim;
    }
  }
}

// ==================== OLLAMA INTENT REFINEMENT (SIGNAL 8) ====================
async function ollamaIntentRefinement(message: string): Promise<{ intent?: string; businessName?: string; sections?: string[]; color?: string } | null> {
  try {
    const validIntents = Object.keys(intentMap).join(", ");
    const prompt = `Analiza este mensaje de un usuario que quiere crear un sitio web.
Extrae en formato JSON (sin explicaciones, SOLO el JSON): {"intent": "...", "businessName": "...", "sections": ["..."], "color": "..."}
Intents validos: ${validIntents}
Si no puedes determinar un campo, usa null.
Mensaje: "${message}"`;
    
    const result = await callLLMShort(prompt, 150);
    if (!result) return null;
    
    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.intent && Object.keys(intentMap).includes(parsed.intent)) {
      console.log(`[Signal 8] Ollama refinement: intent=${parsed.intent}, name=${parsed.businessName}`);
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn("[Signal 8] Ollama refinement failed:", err);
    return null;
  }
}

// ==================== WEIGHTED LEARNING (SIGNAL 8.5) ====================
function computeWeightedBoosts(patterns: LearningLog[]): Record<string, number> {
  const intentStats: Record<string, { accepted: number; total: number }> = {};
  
  for (const p of patterns) {
    if (!intentStats[p.detected_intent]) {
      intentStats[p.detected_intent] = { accepted: 0, total: 0 };
    }
    intentStats[p.detected_intent].total++;
    if (p.user_accepted === true) {
      intentStats[p.detected_intent].accepted++;
    }
  }
  
  const boosts: Record<string, number> = {};
  for (const [intent, stats] of Object.entries(intentStats)) {
    if (stats.total > 0) {
      const acceptanceRate = stats.accepted / stats.total;
      boosts[intent] = Math.log(stats.accepted + 1) * acceptanceRate;
    }
  }
  
  return boosts;
}

// ==================== HTML QUALITY VALIDATION ====================
interface HtmlValidationResult {
  passed: boolean;
  failCount: number;
  issues: string[];
}

function validateHtmlQuality(html: string, businessName: string): HtmlValidationResult {
  const issues: string[] = [];
  
  if (!/<header/i.test(html)) issues.push("missing_header");
  if (!/<main/i.test(html) && !/<section/i.test(html)) issues.push("missing_main");
  if (businessName && businessName !== "Mi Sitio" && !html.includes(businessName)) issues.push("missing_business_name");
  if (/lorem ipsum/i.test(html)) issues.push("has_lorem_ipsum");
  const sectionCount = (html.match(/<section/gi) || []).length;
  if (sectionCount < 2) issues.push("insufficient_sections");
  if (/\bundefined\b|>null</i.test(html)) issues.push("has_undefined_null");
  
  const failCount = issues.length;
  return { passed: failCount < 2, failCount, issues };
}

// ==================== ENTITY MEMORY (per project) ====================
async function loadEntityMemory(projectId: string): Promise<{ intent: string; business_name: string; sections: string[]; color_scheme: string } | null> {
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("user_entity_memory")
      .select("intent, business_name, sections, color_scheme")
      .eq("project_id", projectId)
      .single();
    if (error || !data) return null;
    return data as { intent: string; business_name: string; sections: string[]; color_scheme: string };
  } catch {
    return null;
  }
}

async function saveEntityMemory(projectId: string, intent: string, entities: Entities): Promise<void> {
  try {
    const sb = getSupabaseClient();
    await sb
      .from("user_entity_memory")
      .upsert({
        project_id: projectId,
        intent,
        business_name: entities.businessName,
        sections: entities.sections,
        color_scheme: entities.colorScheme,
      }, { onConflict: "project_id" });
  } catch (err) {
    console.warn("[Entity Memory] Failed to save:", err);
  }
}

// ==================== ENHANCED CLASSIFIER (Multi-Signal Fusion + TF-IDF) ====================
async function classifyIntent(tokens: string[], originalText: string, patterns: LearningLog[], ollamaRefinement?: { intent?: string; businessName?: string; sections?: string[]; color?: string } | null): Promise<IntentMatch> {
  const scores: Record<string, number> = {};

  // Initialize all intents
  for (const intent of Object.keys(intentMap)) {
    scores[intent] = 0;
  }

  // ---- SIGNAL 1: Phrase pattern matching (highest priority) ----
  const normalizedText = originalText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const { pattern, intent, boost } of phrasePatterns) {
    if (pattern.test(normalizedText)) {
      scores[intent] = (scores[intent] || 0) + boost;
    }
  }

  // ---- SIGNAL 2: Verb-intent mapping ----
  for (const token of tokens) {
    for (const [verb, intents] of Object.entries(verbIntentMap)) {
      if (fuzzyMatch(token, verb, 1)) {
        for (const intent of intents) {
          scores[intent] = (scores[intent] || 0) + 2.5;
        }
      }
    }
  }

  // ---- SIGNAL 3: Keyword matching (exact + fuzzy) ----
  const expanded = expandSynonyms(tokens);
  const bigrams = getBigrams(expanded);

  for (const [intent, { keywords, bigrams: intentBigrams }] of Object.entries(intentMap)) {
    for (const kw of keywords) {
      if (expanded.includes(kw)) scores[intent] += 3;
      else if (normalizedText.includes(kw) && kw.length > 3) scores[intent] += 2;
    }
    for (const token of expanded) {
      for (const kw of keywords) {
        if (token !== kw && fuzzyMatch(token, kw, 2)) {
          scores[intent] += 1.5;
          break;
        }
      }
    }
    for (const bg of intentBigrams || []) {
      if (bigrams.includes(bg)) scores[intent] += 4;
      else if (normalizedText.includes(bg)) scores[intent] += 3;
    }
    for (const kw of keywords) {
      if (kw.length > 4 && normalizedText.includes(kw.substring(0, kw.length - 1))) {
        scores[intent] += 0.5;
      }
    }
  }

  // ---- SIGNAL 4: TF-IDF Vectorial Semantic Matching ----
  const messageVector = computeTFVector(expanded, cachedIDF);
  for (const [intent, intentVector] of cachedIntentVectors) {
    const similarity = cosineSimilarity(messageVector, intentVector);
    if (similarity > 0.05) {
      scores[intent] = (scores[intent] || 0) + similarity * 6;
    }
  }

  // ---- SIGNAL 5: Dynamic keywords from learning logs ----
  const dynamicKW = buildDynamicKeywords(patterns.filter(p => p.user_accepted !== false));
  for (const [intent, freqMap] of dynamicKW) {
    for (const token of expanded) {
      const freq = freqMap.get(token);
      if (freq) {
        scores[intent] = (scores[intent] || 0) + Math.min(freq * 0.5, 2);
      }
      for (const [learnedToken, f] of freqMap) {
        if (token !== learnedToken && fuzzyMatch(token, learnedToken, 1)) {
          scores[intent] = (scores[intent] || 0) + Math.min(f * 0.3, 1);
        }
      }
    }
  }

  // ---- SIGNAL 6: Few-shot learning from DB ----
  const acceptedPatterns = patterns.filter(p => p.user_accepted !== false);
  const learned = matchFromLearning(tokens, originalText, acceptedPatterns);
  if (learned && learned.confidence > 0.6) {
    scores[learned.intent] = (scores[learned.intent] || 0) + learned.confidence * 8;
  }

  // ---- SIGNAL 7: Negative learning (penalize rejected, boost accepted) ----
  applyNegativeLearning(scores, tokens, patterns);

  // ---- SIGNAL 8: Ollama Intent Refinement ----
  if (ollamaRefinement?.intent && scores[ollamaRefinement.intent] !== undefined) {
    scores[ollamaRefinement.intent] = (scores[ollamaRefinement.intent] || 0) + 6;
    console.log(`[Signal 8] Boosted "${ollamaRefinement.intent}" by +6 from Ollama refinement`);
  }

  // ---- SIGNAL 8.5: Weighted Learning (adaptive boosts) ----
  const weightedBoosts = computeWeightedBoosts(patterns);
  for (const [intent, boost] of Object.entries(weightedBoosts)) {
    if (scores[intent] !== undefined && boost > 0) {
      scores[intent] = scores[intent] * (1 + boost * 0.3);
    }
  }

  // Find best scoring intent
  let bestIntent = "landing";
  let bestScore = 0;
  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  if (learned && learned.confidence > 0.7 && bestScore < 3) {
    return learned;
  }

  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const gap = sortedScores.length > 1 ? sortedScores[0] - sortedScores[1] : sortedScores[0];
  const absConfidence = Math.min(bestScore / 12, 1);
  const gapConfidence = Math.min(gap / 6, 1);
  const confidence = Math.round(Math.min((absConfidence * 0.6 + gapConfidence * 0.4) * 1.1, 1) * 100) / 100;

  return {
    intent: bestIntent,
    confidence: Math.max(confidence, 0.1),
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
  auth: ["registro", "registrar", "registrarse", "signup", "sign up", "crear cuenta", "cuenta nueva"],
  login: ["login", "iniciar sesion", "inicio sesion", "ingresar", "acceder", "signin", "sign in", "entrar"],
  "user-panel": ["historial", "consumido", "mis pedidos", "mi cuenta", "perfil", "dashboard usuario", "panel usuario", "lo que ha consumido", "lo que he consumido"],
};

function extractEntities(text: string, tokens: string[], intent: string): Entities {
  const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let businessName = "";
  const namePatterns = [
    // "se llama X", "llamado X"
    /(?:llamad[oa]|se llama|nombre(?:s)?)\s+["']?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,30}?)(?:\s+(?:con|y|que|para|donde|en)\b|$|["'])/i,
    // "para mi restaurante X con..."
    /(?:para|de)\s+(?:mi\s+)?(?:negocio|empresa|tienda|restaurante|cafeter[ií]a|caf[eé]|gym|gimnasio|agencia|estudio|salon|barberia|peluqueria|hotel|bufete|consultorio|clinica|veterinaria|academia|barveria|restorante)\s+["']?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,30}?)(?:\s+(?:con|y|que|para|donde|en)\b|$|["'])/i,
    // Quoted names
    /["']([^"']{2,30})["']/,
    // "comida mexicana La Tlayuda" — capitalized words after industry keywords
    /(?:restaurante|cafeteria|tienda|gym|gimnasio|hotel|salon|barberia|peluqueria|agencia|estudio|clinica|veterinaria|academia|bufete|empresa|negocio|barveria|restorante|bar|pizzeria|taqueria|bistro)\s+(?:de\s+)?(?:\w+\s+)?([A-ZÁÉÍÓÚÑÜ][A-Za-zÀ-ÿ\s]{1,30}?)(?:\s+(?:con|y|que|para|donde|en)\b|$)/,
    // Capitalized multi-word names (2+ words starting with uppercase) anywhere in text
    /\b((?:[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+\s+){1,3}[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+)\b/,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const candidate = match[1].trim();
      // Validate it's not a common word/verb
      const commonWords = new Set(["Quiero", "Necesito", "Hazme", "Para", "Como", "Tipo", "Algo", "Crear"]);
      if (!commonWords.has(candidate) && candidate.length > 2) {
        businessName = candidate;
        break;
      }
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

// ==================== PURE HTML COMPOSER (No React/Babel) ====================
interface BlockConfig {
  name: string;
  colors: ColorScheme;
  sections: string[];
  intent: string;
  enriched?: EnrichedContent;
}

function composeReactHtml(config: BlockConfig): string {
  const { name, colors: c, sections, intent, enriched } = config;

  // Build pure HTML sections
  const htmlSections: string[] = [];

  // Navbar
  if (sections.includes("navbar")) {
    const links = sections.filter(s => !["navbar", "footer"].includes(s)).slice(0, 6);
    htmlSections.push(`
  <header id="site-header" style="position:sticky;top:0;z-index:50;transition:all 0.3s ease;background:transparent">
    <nav style="display:flex;justify-content:space-between;align-items:center;padding:1rem 2.5rem;max-width:1200px;margin:0 auto">
      <a href="#" class="gradient-text" style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;letter-spacing:-0.02em">${name}</a>
      <div class="nav-links" style="display:flex;gap:2rem;align-items:center">
        ${links.map(s => `<a href="#${s}" style="color:var(--text-muted);font-size:0.9rem;font-weight:500;transition:color var(--transition)">${sectionLabel(s)}</a>`).join("\n        ")}
        <a href="#${sections.includes("contact") ? "contact" : "hero"}" class="btn" style="padding:0.6rem 1.5rem;font-size:0.85rem">${getNavCTA(intent)}</a>
      </div>
      <button id="mobile-menu-btn" class="mobile-menu-btn" style="background:none;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.5rem 0.7rem;color:var(--text);cursor:pointer;display:none;flex-direction:column;gap:4px">
        <span style="width:18px;height:2px;background:currentColor;display:block;border-radius:2px"></span>
        <span style="width:18px;height:2px;background:currentColor;display:block;border-radius:2px"></span>
        <span style="width:14px;height:2px;background:currentColor;display:block;border-radius:2px"></span>
      </button>
    </nav>
    <div id="mobile-menu" style="display:none;flex-direction:column;gap:1rem;padding:1rem 2.5rem;border-top:1px solid var(--border);background:var(--bg-card)">
      ${links.map(s => `<a href="#${s}" class="mobile-link" style="color:var(--text-muted);font-size:0.95rem;padding:0.5rem 0">${sectionLabel(s)}</a>`).join("\n      ")}
    </div>
  </header>`);
  }

  // Hero
  if (sections.includes("hero")) {
    const heroImg = getUnsplashImage(intent, "hero", 0);
    htmlSections.push(`
  <section id="hero" style="min-height:90vh;display:flex;align-items:center;position:relative;overflow:hidden;background:var(--gradient-subtle)">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,color-mix(in srgb,var(--primary) 8%,transparent),transparent 70%)"></div>
    <div class="container" style="position:relative;z-index:1">
      <div class="hero-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center">
        <div class="fade-in">
          <div style="display:inline-block;background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary-light);padding:0.4rem 1rem;border-radius:99px;font-size:0.8rem;font-weight:600;margin-bottom:1.5rem;letter-spacing:0.05em">${getHeroBadge(intent)}</div>
          <h1 style="margin-bottom:1.5rem"><span class="gradient-text">${name}</span></h1>
          <p style="color:var(--text-muted);font-size:clamp(1rem,1.8vw,1.15rem);margin-bottom:2.5rem;max-width:500px;line-height:1.8">${enriched?.heroSubtitle ? enriched.heroSubtitle.replace(/"/g, '&quot;') : getHeroSubtitle(intent, name)}</p>
          <div style="display:flex;gap:1rem;flex-wrap:wrap">
            <button class="btn">${getHeroCTA(intent)}</button>
            <button class="btn btn-outline">${getHeroSecondaryCTA(intent)}</button>
          </div>
        </div>
        <div class="fade-in" style="animation-delay:0.2s">
          <div style="border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-lg);border:1px solid var(--border);aspect-ratio:4/3">
            <img src="${heroImg}" alt="${name}" style="width:100%;height:100%;object-fit:cover" loading="lazy"/>
          </div>
        </div>
      </div>
    </div>
  </section>`);
  }

  // Features
  if (sections.includes("features")) {
    let feats = getFeatures(intent);
    if (enriched?.featuresDescriptions && enriched.featuresDescriptions.length > 0) {
      feats = feats.map((f, i) => ({ ...f, desc: enriched.featuresDescriptions![i] || f.desc }));
    }
    htmlSections.push(`
  <section id="features" class="section">
    <div class="container">
      <div class="section-header"><h2>Nuestros Servicios</h2><p>${getFeaturesSubtitle(intent)}</p></div>
      <div class="grid-3">
        ${feats.map((f, i) => `<div class="card fade-in" style="animation-delay:${i * 0.1}s">
          <div style="width:56px;height:56px;border-radius:14px;background:color-mix(in srgb,var(--primary) 12%,transparent);display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1rem">${f.icon}</div>
          <h3 style="margin-bottom:0.5rem">${f.title}</h3>
          <p style="color:var(--text-muted);font-size:0.92rem;line-height:1.7">${f.desc}</p>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`);
  }

  // About
  if (sections.includes("about")) {
    const aboutImg = getUnsplashImage(intent, "about", 0);
    const aboutText = enriched?.aboutText || getAboutText(intent, name);
    const stats = getAboutStats(intent);
    htmlSections.push(`
  <section id="about" class="section section-alt">
    <div class="container">
      <div class="section-header"><h2>Sobre Nosotros</h2></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center">
        <div class="fade-in">
          <div style="border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-md);border:1px solid var(--border)">
            <img src="${aboutImg}" alt="Sobre ${name}" style="width:100%;height:auto;object-fit:cover" loading="lazy"/>
          </div>
        </div>
        <div class="fade-in" style="animation-delay:0.15s">
          <p style="color:var(--text-muted);font-size:1.05rem;line-height:1.8;margin-bottom:2rem">${aboutText}</p>
          <div style="display:flex;gap:2rem;flex-wrap:wrap">
            ${stats.map(s => `<div><div class="gradient-text" style="font-size:2rem;font-weight:800;font-family:var(--font-display)">${s.value}</div><div style="color:var(--text-muted);font-size:0.85rem">${s.label}</div></div>`).join("\n            ")}
          </div>
        </div>
      </div>
    </div>
  </section>`);
  }

  // Menu
  if (sections.includes("menu")) {
    const menuItems = getMenuItems(intent);
    htmlSections.push(`
  <section id="menu" class="section">
    <div class="container">
      <div class="section-header"><h2>Nuestro Menú</h2><p>Descubre nuestras deliciosas opciones</p></div>
      <div class="grid-2">
        ${menuItems.map((item, i) => `<div class="card fade-in" style="display:flex;justify-content:space-between;align-items:center;animation-delay:${i * 0.05}s">
          <div>
            <h3 style="margin-bottom:4px">${item.name}</h3>
            <p style="color:var(--text-muted);font-size:0.88rem">${item.desc}</p>
          </div>
          <span class="gradient-text" style="font-weight:700;font-size:1.1rem;white-space:nowrap">${item.price}</span>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`);
  }

  // Gallery
  if (sections.includes("gallery")) {
    htmlSections.push(`
  <section id="gallery" class="section section-alt">
    <div class="container">
      <div class="section-header"><h2>Galería</h2><p>Nuestro trabajo habla por sí mismo</p></div>
      <div class="grid-3">
        ${[0,1,2,3,4,5].map(i => `<div class="card fade-in" style="padding:0;overflow:hidden;animation-delay:${i * 0.08}s">
          <img src="${getUnsplashImage(intent, "gallery", i)}" alt="Galería ${i+1}" style="width:100%;height:250px;object-fit:cover;transition:transform var(--transition)" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" loading="lazy"/>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`);
  }

  // Pricing
  if (sections.includes("pricing")) {
    const plans = getPricingPlans(intent);
    htmlSections.push(`
  <section id="pricing" class="section">
    <div class="container">
      <div class="section-header"><h2>Planes y Precios</h2><p>Elige el plan que mejor se adapte a ti</p></div>
      <div class="grid-3">
        ${plans.map((plan, i) => `<div class="card fade-in" style="text-align:center;position:relative;${plan.featured ? 'border-color:var(--primary);box-shadow:0 0 30px color-mix(in srgb,var(--primary) 20%,transparent)' : ''};animation-delay:${i * 0.1}s">
          ${plan.featured ? '<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--gradient);padding:4px 16px;border-radius:99px;font-size:0.75rem;font-weight:700;color:#fff;letter-spacing:0.05em">POPULAR</div>' : ''}
          <h3 style="margin-bottom:0.5rem">${plan.name}</h3>
          <div class="gradient-text" style="font-size:2.5rem;font-weight:800;font-family:var(--font-display);margin-bottom:0.5rem">${plan.price}</div>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1.5rem">${plan.period}</p>
          <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:2rem;text-align:left">
            ${plan.features.map(f => `<div style="display:flex;align-items:center;gap:0.5rem;color:var(--text-muted);font-size:0.9rem"><span style="color:var(--primary-light)">✓</span> ${f}</div>`).join("\n            ")}
          </div>
          <button class="btn${plan.featured ? '' : ' btn-outline'}" style="width:100%;justify-content:center">Elegir Plan</button>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`);
  }

  // Testimonials
  if (sections.includes("testimonials")) {
    const testimonials = enriched?.testimonials && enriched.testimonials.length > 0 ? enriched.testimonials : getTestimonials();
    htmlSections.push(`
  <section id="testimonials" class="section section-alt">
    <div class="container">
      <div class="section-header"><h2>Lo que dicen nuestros clientes</h2><p>La satisfacción de nuestros clientes es nuestra mejor carta de presentación</p></div>
      <div class="grid-3">
        ${testimonials.map((t, i) => `<div class="card fade-in" style="text-align:center;animation-delay:${i * 0.1}s">
          <div style="width:56px;height:56px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.3rem;font-weight:700;color:#fff">${t.name[0]}</div>
          <p style="color:var(--text-muted);font-style:italic;margin-bottom:1rem;line-height:1.7;font-size:0.95rem">"${t.text}"</p>
          <strong style="font-size:0.95rem">${t.name}</strong><br/>
          <span style="color:var(--text-muted);font-size:0.82rem">${t.role}</span>
          <div style="margin-top:0.5rem;color:var(--primary-light);letter-spacing:2px">★★★★★</div>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`);
  }

  // Contact
  if (sections.includes("contact")) {
    htmlSections.push(`
  <section id="contact" class="section section-alt">
    <div class="container" style="max-width:640px">
      <div class="section-header"><h2>Contáctanos</h2><p>Estamos listos para ayudarte. Escríbenos y te responderemos pronto.</p></div>
      <form id="contact-form" style="display:flex;flex-direction:column;gap:1rem">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <input style="padding:0.9rem 1.25rem;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-body);font-size:0.95rem;outline:none" placeholder="Tu nombre" required/>
          <input style="padding:0.9rem 1.25rem;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-body);font-size:0.95rem;outline:none" type="email" placeholder="Tu email" required/>
        </div>
        <input style="padding:0.9rem 1.25rem;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-body);font-size:0.95rem;outline:none" placeholder="Asunto"/>
        <textarea style="padding:0.9rem 1.25rem;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-family:var(--font-body);font-size:0.95rem;outline:none;min-height:140px;resize:vertical" placeholder="Tu mensaje" required></textarea>
        <button class="btn" type="submit" style="width:100%;justify-content:center">Enviar Mensaje →</button>
      </form>
    </div>
  </section>`);
  }

  // FAQ
  if (sections.includes("faq")) {
    const faqs = getFAQs(intent);
    htmlSections.push(`
  <section id="faq" class="section">
    <div class="container" style="max-width:750px">
      <div class="section-header"><h2>Preguntas Frecuentes</h2><p>Respuestas a las dudas más comunes</p></div>
      <div style="display:flex;flex-direction:column;gap:1rem">
        ${faqs.map((f, i) => `<div class="card faq-item" data-idx="${i}" style="cursor:pointer">
          <div style="font-weight:600;font-size:1rem;display:flex;justify-content:space-between;align-items:center;gap:1rem">
            ${f.q}
            <span class="faq-icon" style="color:var(--primary-light);font-size:1.2rem;transition:transform 0.3s">+</span>
          </div>
          <p class="faq-answer" style="color:var(--text-muted);margin-top:1rem;line-height:1.7;font-size:0.95rem;display:none">${f.a}</p>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`);
  }

  // Team
  if (sections.includes("team")) {
    const members = getTeamMembers(intent);
    htmlSections.push(`
  <section id="team" class="section section-alt">
    <div class="container">
      <div class="section-header"><h2>Nuestro Equipo</h2><p>Profesionales comprometidos con la excelencia</p></div>
      <div class="grid-3">
        ${members.map((m, i) => `<div class="card fade-in" style="text-align:center;animation-delay:${i * 0.1}s">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:2rem;color:#fff">${m.avatar}</div>
          <h3 style="margin-bottom:4px">${m.name}</h3>
          <p style="color:var(--primary-light);font-size:0.85rem;font-weight:500;margin-bottom:0.5rem">${m.role}</p>
          <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.6">${m.bio}</p>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`);
  }

  // Auth
  if (sections.includes("auth") || sections.includes("login")) {
    htmlSections.push(`
  <section id="auth" class="section section-alt">
    <div class="container" style="max-width:480px;margin:0 auto">
      <div class="section-header"><h2>Accede a tu cuenta</h2><p>Inicia sesión o regístrate para disfrutar de todos los beneficios</p></div>
      <div class="card" style="padding:2.5rem">
        <div style="display:flex;gap:0;margin-bottom:1.5rem;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--border)">
          <button id="tab-login" onclick="switchAuthTab('login')" style="flex:1;padding:0.75rem;background:var(--primary);color:#fff;border:none;cursor:pointer;font-weight:600;font-family:var(--font-body);font-size:0.9rem;transition:all var(--transition)">Iniciar Sesión</button>
          <button id="tab-register" onclick="switchAuthTab('register')" style="flex:1;padding:0.75rem;background:transparent;color:var(--text-muted);border:none;cursor:pointer;font-weight:600;font-family:var(--font-body);font-size:0.9rem;transition:all var(--transition)">Registrarse</button>
        </div>
        <form id="login-form" onsubmit="event.preventDefault()" style="display:flex;flex-direction:column;gap:1rem">
          <div><label style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;display:block">Email</label><input type="email" placeholder="tu@email.com" style="width:100%;padding:0.75rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;font-family:var(--font-body)"/></div>
          <div><label style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;display:block">Contraseña</label><input type="password" placeholder="••••••••" style="width:100%;padding:0.75rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;font-family:var(--font-body)"/></div>
          <button class="btn" style="width:100%;justify-content:center;margin-top:0.5rem">Iniciar Sesión</button>
          <p style="text-align:center;font-size:0.82rem;color:var(--text-muted)">¿Olvidaste tu contraseña? <a href="#" style="color:var(--primary-light)">Recupérala aquí</a></p>
        </form>
        <form id="register-form" onsubmit="event.preventDefault()" style="display:none;flex-direction:column;gap:1rem">
          <div><label style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;display:block">Nombre completo</label><input type="text" placeholder="Juan Pérez" style="width:100%;padding:0.75rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;font-family:var(--font-body)"/></div>
          <div><label style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;display:block">Email</label><input type="email" placeholder="tu@email.com" style="width:100%;padding:0.75rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;font-family:var(--font-body)"/></div>
          <div><label style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;display:block">Contraseña</label><input type="password" placeholder="Mínimo 8 caracteres" style="width:100%;padding:0.75rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;font-family:var(--font-body)"/></div>
          <button class="btn" style="width:100%;justify-content:center;margin-top:0.5rem">Crear Cuenta</button>
          <p style="text-align:center;font-size:0.82rem;color:var(--text-muted)">Al registrarte aceptas nuestros <a href="#" style="color:var(--primary-light)">términos y condiciones</a></p>
        </form>
      </div>
    </div>
  </section>`);
  }

  // User Panel
  if (sections.includes("user-panel")) {
    htmlSections.push(`
  <section id="user-panel" class="section">
    <div class="container">
      <div class="section-header"><h2>Mi Panel</h2><p>Consulta tu historial y resumen de actividad</p></div>
      <div class="grid-3" style="margin-bottom:4rem">
        <div class="card" style="text-align:center"><div style="font-size:2rem;margin-bottom:8px">💰</div><div class="gradient-text" style="font-size:1.8rem;font-weight:800;font-family:var(--font-display)">$63.00</div><p style="color:var(--text-muted);font-size:0.85rem">Total consumido</p></div>
        <div class="card" style="text-align:center"><div style="font-size:2rem;margin-bottom:8px">📋</div><div class="gradient-text" style="font-size:1.8rem;font-weight:800;font-family:var(--font-display)">4</div><p style="color:var(--text-muted);font-size:0.85rem">Pedidos realizados</p></div>
        <div class="card" style="text-align:center"><div style="font-size:2rem;margin-bottom:8px">⭐</div><div class="gradient-text" style="font-size:1.8rem;font-weight:800;font-family:var(--font-display)">Gold</div><p style="color:var(--text-muted);font-size:0.85rem">Nivel de membresía</p></div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:1.5rem;font-size:1.1rem">📜 Historial de Consumo</h3>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse">
            <thead><tr style="border-bottom:1px solid var(--border)">
              <th style="text-align:left;padding:0.75rem;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em">Fecha</th>
              <th style="text-align:left;padding:0.75rem;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em">Items</th>
              <th style="text-align:right;padding:0.75rem;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em">Total</th>
            </tr></thead>
            <tbody>
              <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.75rem;font-size:0.9rem">2024-01-15</td><td style="padding:0.75rem;font-size:0.9rem;color:var(--text-muted)">Café Especialidad x2, Croissant</td><td style="padding:0.75rem;font-size:0.9rem;text-align:right;font-weight:600;color:var(--primary-light)">$13.00</td></tr>
              <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.75rem;font-size:0.9rem">2024-01-12</td><td style="padding:0.75rem;font-size:0.9rem;color:var(--text-muted)">Bowl Mediterráneo, Jugo Natural</td><td style="padding:0.75rem;font-size:0.9rem;text-align:right;font-weight:600;color:var(--primary-light)">$15.50</td></tr>
              <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.75rem;font-size:0.9rem">2024-01-08</td><td style="padding:0.75rem;font-size:0.9rem;color:var(--text-muted)">Tostada de Aguacate, Cappuccino</td><td style="padding:0.75rem;font-size:0.9rem;text-align:right;font-weight:600;color:var(--primary-light)">$14.00</td></tr>
              <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.75rem;font-size:0.9rem">2024-01-05</td><td style="padding:0.75rem;font-size:0.9rem;color:var(--text-muted)">Pasta al Pesto, Tarta de Temporada</td><td style="padding:0.75rem;font-size:0.9rem;text-align:right;font-weight:600;color:var(--primary-light)">$20.50</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>`);
  }

  // Footer
  if (sections.includes("footer")) {
    const footerLinks = sections.filter(s => !["navbar", "footer", "cta", "stats"].includes(s)).slice(0, 5);
    htmlSections.push(`
  <footer style="border-top:1px solid var(--border);padding:4rem 2.5rem 2.5rem;background:var(--bg-card)">
    <div class="container">
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:4rem;margin-bottom:2.5rem">
        <div>
          <div class="gradient-text" style="font-family:var(--font-display);font-size:1.3rem;font-weight:700;margin-bottom:1rem">${name}</div>
          <p style="color:var(--text-muted);font-size:0.88rem;line-height:1.7;max-width:320px">${getMetaDescription(intent, name)}</p>
        </div>
        <div>
          <h4 style="font-size:0.85rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:1rem">Navegación</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            ${footerLinks.map(s => `<a href="#${s}" style="color:var(--text-muted);font-size:0.88rem">${sectionLabel(s)}</a>`).join("\n            ")}
          </div>
        </div>
        <div>
          <h4 style="font-size:0.85rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:1rem">Legal</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem">
            <a href="#" style="color:var(--text-muted);font-size:0.88rem">Privacidad</a>
            <a href="#" style="color:var(--text-muted);font-size:0.88rem">Términos</a>
            <a href="#" style="color:var(--text-muted);font-size:0.88rem">Cookies</a>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
        <p style="color:var(--text-muted);font-size:0.78rem">© ${new Date().getFullYear()} ${name}. Todos los derechos reservados.</p>
        <p style="color:var(--text-muted);font-size:0.78rem">Hecho con ❤️ por <span class="gradient-text" style="font-weight:600">DOKU AI</span></p>
      </div>
    </div>
  </footer>`);
  }

  // Build complete HTML document (pure HTML + CSS, NO React/Babel)
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
.fade-in{opacity:0;transform:translateY(20px);animation:fadeInUp 0.6s ease forwards}
@keyframes fadeInUp{to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){
  .container{padding:0 var(--space-sm)}
  .section{padding:var(--space-xl) var(--space-sm)}
  .grid-2{grid-template-columns:1fr}
  .grid-3{grid-template-columns:1fr}
  .hero-grid{grid-template-columns:1fr!important}
  .nav-links{display:none!important}
  .mobile-menu-btn{display:flex!important}
  h1{font-size:2.2rem}
}
@media(min-width:769px){.mobile-menu-btn{display:none!important}}
:focus-visible{outline:2px solid var(--primary-light);outline-offset:2px}
</style>
</head>
<body>
<a href="#main-content" class="skip-link">Ir al contenido principal</a>
<div id="main-content">
${htmlSections.join("\n")}
</div>

<!-- Back to top -->
<button id="back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" style="position:fixed;bottom:2rem;right:2rem;width:44px;height:44px;border-radius:50%;background:var(--gradient);color:#fff;border:none;cursor:pointer;font-size:1.2rem;display:none;align-items:center;justify-content:center;box-shadow:var(--shadow-md);z-index:100">↑</button>

<script>
// Navbar scroll effect
window.addEventListener('scroll',function(){
  var header=document.getElementById('site-header');
  if(header){
    if(window.scrollY>80){
      header.style.background='var(--bg-card)';
      header.style.borderBottom='1px solid var(--border)';
      header.style.backdropFilter='blur(12px)';
    }else{
      header.style.background='transparent';
      header.style.borderBottom='none';
      header.style.backdropFilter='none';
    }
  }
  var btn=document.getElementById('back-to-top');
  if(btn) btn.style.display=window.scrollY>400?'flex':'none';
});

// Mobile menu
var menuBtn=document.getElementById('mobile-menu-btn');
var mobileMenu=document.getElementById('mobile-menu');
if(menuBtn&&mobileMenu){
  menuBtn.addEventListener('click',function(){
    mobileMenu.style.display=mobileMenu.style.display==='flex'?'none':'flex';
  });
  document.querySelectorAll('.mobile-link').forEach(function(link){
    link.addEventListener('click',function(){mobileMenu.style.display='none';});
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(function(item){
  item.addEventListener('click',function(){
    var answer=this.querySelector('.faq-answer');
    var icon=this.querySelector('.faq-icon');
    var isOpen=answer.style.display==='block';
    document.querySelectorAll('.faq-answer').forEach(function(a){a.style.display='none';});
    document.querySelectorAll('.faq-icon').forEach(function(i){i.style.transform='none';});
    if(!isOpen){answer.style.display='block';icon.style.transform='rotate(45deg)';}
  });
});

// Auth tab switching
function switchAuthTab(tab){
  var loginForm=document.getElementById('login-form');
  var registerForm=document.getElementById('register-form');
  var tabLogin=document.getElementById('tab-login');
  var tabRegister=document.getElementById('tab-register');
  if(!loginForm||!registerForm) return;
  if(tab==='login'){
    loginForm.style.display='flex';registerForm.style.display='none';
    tabLogin.style.background='var(--primary)';tabLogin.style.color='#fff';
    tabRegister.style.background='transparent';tabRegister.style.color='var(--text-muted)';
  }else{
    loginForm.style.display='none';registerForm.style.display='flex';
    tabRegister.style.background='var(--primary)';tabRegister.style.color='#fff';
    tabLogin.style.background='transparent';tabLogin.style.color='var(--text-muted)';
  }
}

// Contact form
var contactForm=document.getElementById('contact-form');
if(contactForm){
  contactForm.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=this.querySelector('button[type=submit]');
    btn.textContent='¡Enviado! ✓';btn.style.opacity='0.7';
  });
}

// Intersection Observer for fade-in
var observer=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting) entry.target.style.animationPlayState='running';
  });
},{threshold:0.1});
document.querySelectorAll('.fade-in').forEach(function(el){
  el.style.animationPlayState='paused';
  observer.observe(el);
});
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
    auth: "Cuenta", login: "Acceder", "user-panel": "Mi Panel",
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
  if (entities.sections.includes("auth") || entities.sections.includes("login")) steps.push("Crear formulario de registro e inicio de sesión");
  if (entities.sections.includes("user-panel")) steps.push("Agregar panel de usuario con historial de consumo");
  if (entities.sections.includes("contact")) steps.push("Agregar formulario de contacto");
  if (entities.sections.includes("footer")) steps.push("Crear footer con navegación y links");
  steps.push(`Aplicar paleta de colores: ${entities.colorScheme}`);
  steps.push("Compilar componentes React/TypeScript");
  steps.push("Inyectar animaciones e interactividad con hooks");

  return steps;
}

// ==================== LLM PROVIDER (Ollama / Gateway / OpenAI) ====================
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const provider = Deno.env.get("LLM_PROVIDER") || "ollama";
  const baseUrl = Deno.env.get("LLM_BASE_URL") || "";
  const model = Deno.env.get("LLM_MODEL") || "llama3.1:8b";
  console.log(`[LLM] callLLM -> provider: ${provider}, url: ${baseUrl}, model: ${model}`);

  try {
    if (provider === "ollama") {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: `${systemPrompt}\n\nUsuario: ${userPrompt}`,
          stream: false,
        }),
        signal: AbortSignal.timeout(150000),
      });
      if (!response.ok) {
        console.error("Ollama error:", response.status, await response.text().catch(() => ""));
        return null;
      }
      const data = await response.json();
      return data.response || null;

    } else if (provider === "gateway") {
      const apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) {
        console.error("Gateway error:", response.status, await response.text().catch(() => ""));
        return null;
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;

    } else if (provider === "openai") {
      const apiKey = Deno.env.get("LLM_API_KEY") || "";
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }

    return null;
  } catch (err) {
    console.error("LLM call failed:", err);
    return null;
  }
}

// ==================== SHORT LLM CALLS (Optimized for llama3.1:8b) ====================
async function callLLMShort(prompt: string, maxTokens = 512): Promise<string | null> {
  const provider = Deno.env.get("LLM_PROVIDER") || "ollama";
  const baseUrl = Deno.env.get("LLM_BASE_URL") || "";
  const model = Deno.env.get("OLLAMA_MODEL") || Deno.env.get("LLM_MODEL") || "llama3.1:8b";
  console.log(`[LLM] callLLMShort -> provider: ${provider}, url: ${baseUrl}, model: ${model}`);

  try {
    if (provider === "ollama") {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            num_ctx: 2048,
            repeat_penalty: 1.12,
            num_predict: maxTokens,
            num_thread: 4,
          },
        }),
        signal: AbortSignal.timeout(maxTokens > 500 ? 300000 : 150000),
      });
      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        console.error(`[Ollama] callLLMShort HTTP ${response.status}: ${errBody.substring(0, 200)}`);
        return null;
      }
      const data = await response.json();
      const text = (data.response || "").trim();
      return text.length > 5 ? text : null;

    } else if (provider === "gateway") {
      const apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          stream: false,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    }
    return null;
  } catch (err) {
    console.warn("LLM short call failed:", err);
    return null;
  }
}

// ==================== CONTENT ENRICHMENT WITH LLM ====================
interface EnrichedContent {
  heroSubtitle?: string;
  featuresDescriptions?: string[];
  aboutText?: string;
  testimonials?: { name: string; text: string; role: string }[];
}

async function enrichContentWithLLM(intent: string, businessName: string): Promise<EnrichedContent> {
  const enriched: EnrichedContent = {};
  const provider = Deno.env.get("LLM_PROVIDER") || "ollama";
  if (provider === "none") return enriched;

  console.log(`[Hybrid] Starting content enrichment with LLM for: ${businessName} (${intent})`);

  // Health check for Ollama before parallel calls
  if (provider === "ollama") {
    const baseUrl = Deno.env.get("LLM_BASE_URL") || "";
    try {
      const health = await fetch(`${baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(15000)
      });
      if (!health.ok) {
        console.error(`[Ollama] Health check failed: HTTP ${health.status}`);
        return enriched;
      }
      const tags = await health.json();
      console.log(`[Ollama] Server healthy. Models available:`, JSON.stringify(tags.models?.map((m: any) => m.name) || []));
    } catch (err: any) {
      console.error(`[Ollama] Server unreachable at ${baseUrl}:`, err?.message || err);
      return enriched;
    }
  }

  // For Ollama on slow servers: only run 2 enrichments sequentially to stay within time limits
  const isOllama = provider === "ollama";
  console.log(`[Hybrid] Running ${isOllama ? '2 sequential' : '4 parallel'} enrichment prompts...`);

  if (isOllama) {
    // Sequential: only hero + about (2 calls, ~2-3 min total)
    const heroResult = await callLLMShort(
      `Subtitulo corto para "${businessName}" (${intent}). Responde SOLO el texto, maximo 15 palabras:`, 60
    ).catch(() => null);
    
    if (heroResult && heroResult.length > 5 && heroResult.length < 300) {
      enriched.heroSubtitle = heroResult.replace(/^["']|["']$/g, "").replace(/^(Subtitulo|Subtitle)\s*[:.-]\s*/i, "").trim();
      console.log(`[Hybrid] Hero subtitle enriched`);
    }

    const aboutResult = await callLLMShort(
      `2 oraciones para "Sobre nosotros" de "${businessName}" (${intent}). Solo texto, sin titulos:`, 80
    ).catch(() => null);
    
    if (aboutResult && aboutResult.length > 10) {
      enriched.aboutText = aboutResult.replace(/^["']|["']$/g, "").trim();
      console.log(`[Hybrid] About text enriched`);
    }

    const enrichedCount = (enriched.heroSubtitle ? 1 : 0) + (enriched.aboutText ? 1 : 0);
    console.log(`[Hybrid] Content enrichment complete: ${enrichedCount}/2 sections enriched`);
    return enriched;
  }

  // Non-Ollama: run all 4 in parallel (fast providers)
  const [heroResult, featResult, aboutResult, testimonialsResult] = await Promise.allSettled([
    callLLMShort(`Subtitulo corto para "${businessName}" (${intent}). Solo texto:`, 80),
    callLLMShort(`3 servicios de "${businessName}" (${intent}) separados por |. Solo texto:`, 100),
    callLLMShort(`2 oraciones para "Sobre nosotros" de "${businessName}" (${intent}). Solo texto:`, 100),
    callLLMShort(`2 testimonios de "${businessName}" (${intent}). Formato: Nombre - texto - cargo. Separados por |:`, 120),
  ]);

  // Process hero subtitle
  if (heroResult.status === "fulfilled" && heroResult.value) {
    let cleaned = heroResult.value
      .replace(/^["']|["']$/g, "")
      .replace(/^(Subtitulo|Subtitle|Titulo)\s*[:.-]\s*/i, "")
      .replace(/^\n+/, "")
      .trim();
    // Remove if it just repeats the business name
    if (cleaned.toLowerCase().startsWith(businessName.toLowerCase())) {
      const rest = cleaned.substring(businessName.length).replace(/^[\s:.-]+/, "").trim();
      if (rest.length > 5) cleaned = rest;
    }
    if (cleaned.length > 5 && cleaned.length < 300) {
      enriched.heroSubtitle = cleaned;
      console.log(`[Hybrid] Hero subtitle enriched: ${cleaned.substring(0, 50)}...`);
    }
  }

  // Process feature descriptions
  if (featResult.status === "fulfilled" && featResult.value) {
    // Accept | or newlines as separators
    const rawParts = featResult.value.split(/[|\n]/).map(s => s.trim());
    const parts = rawParts
      .map(s => s.replace(/^\d+[\.\)\-]\s*/, "").replace(/^[-•]\s*/, "").trim()) // Clean numbering
      .filter(s => s.length > 5);
    if (parts.length >= 2) {
      enriched.featuresDescriptions = parts.slice(0, 3);
      console.log(`[Hybrid] Features enriched: ${parts.length} descriptions`);
    }
  }

  // Process about text
  if (aboutResult.status === "fulfilled" && aboutResult.value) {
    let cleaned = aboutResult.value
      .replace(/^["']|["']$/g, "")
      .replace(/^\d+[\.\)]\s*/gm, "") // Remove numbering like "1. "
      .replace(/^[-•]\s*/gm, "")
      .replace(/^(Sobre nosotros|About)\s*[:.-]\s*/i, "")
      .trim();
    // Prepend business name if the LLM continued from "es"
    if (cleaned.length > 5 && !cleaned.toLowerCase().includes(businessName.toLowerCase())) {
      cleaned = `${businessName} es ${cleaned}`;
    }
    if (cleaned.length > 10 && cleaned.length < 500) {
      enriched.aboutText = cleaned;
      console.log(`[Hybrid] About text enriched: ${cleaned.substring(0, 50)}...`);
    }
  }

  // Process testimonials
  if (testimonialsResult.status === "fulfilled" && testimonialsResult.value) {
    const parts = testimonialsResult.value.split("|").map(s => s.trim()).filter(s => s.length > 10);
    if (parts.length >= 1) {
      enriched.testimonials = parts.slice(0, 3).map((t, i) => {
        // Try to parse "Name - "text" - role" format
        const match = t.match(/^([^-"]+)\s*[-–]\s*"?([^"]+)"?\s*[-–]\s*(.+)$/);
        if (match) {
          return { name: match[1].trim(), text: match[2].trim(), role: match[3].trim() };
        }
        return {
          name: ["Laura Méndez", "Carlos Ortiz", "Sofía Rivera"][i] || "Cliente",
          text: t.replace(/^["']|["']$/g, "").trim(),
          role: "Cliente satisfecho",
        };
      });
      console.log(`[Hybrid] Testimonials enriched: ${enriched.testimonials.length} items`);
    }
  }

  const enrichedCount = Object.keys(enriched).length;
  console.log(`[Hybrid] Content enrichment complete: ${enrichedCount}/4 sections enriched`);
  return enriched;
}

function buildSystemPrompt(intent: string, label: string, entities: Entities, isModificationRequest = false, previousHtml?: string): string {
  const architectPreamble = `Eres DOKU AI, un arquitecto de software y diseñador web experto.
Tu tarea es diseñar y generar sistemas web completos y profesionales.

PROCESO DE DISEÑO (piensa como arquitecto antes de generar):
1. ANALISIS: Identifica el tipo de negocio, audiencia objetivo y objetivos del sitio
2. ARQUITECTURA: Define la estructura de componentes (Header, Hero, Features, etc.)
3. FLUJO DE DATOS: Determina como interactuan las secciones entre si
4. DISENO VISUAL: Aplica principios de UI/UX profesional
5. GENERACION: Produce codigo HTML completo y funcional

`;

  const modificationContext = isModificationRequest && previousHtml
    ? `CONTEXTO DE MODIFICACION:
El usuario quiere MODIFICAR un sitio existente, NO crear uno nuevo.
Aplica SOLO los cambios solicitados al HTML existente, manteniendo todo lo demas igual.
HTML ACTUAL (modifica este):
${previousHtml.substring(0, 3000)}${previousHtml.length > 3000 ? "\n... [truncado]" : ""}

IMPORTANTE: Responde con el HTML COMPLETO modificado (desde <!DOCTYPE html> hasta </html>).
Mantiene la estructura, estilos y contenido existente. Solo cambia lo que el usuario pidio.

`
    : "";

  return `${architectPreamble}${modificationContext}GENERA HTML COMPLETO (desde <!DOCTYPE html> hasta </html>) con las siguientes caracteristicas:

TECNOLOGIAS:
- Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Iconos SVG inline para elementos visuales (flechas, estrellas, iconos de redes sociales, etc.)
- Imagenes relevantes de Unsplash: https://images.unsplash.com/photo-[id]?w=800&q=80 (usa parametros de busqueda adecuados al tipo de negocio)

ESTRUCTURA SEMANTICA OBLIGATORIA:
- <header> con navegacion <nav> y logo/nombre del negocio
- <main> con las secciones solicitadas
- <footer> con informacion de contacto, redes sociales y copyright

DISENO Y ESTILO:
- Esquema de colores: ${entities.colorScheme} - usa una paleta coherente y profesional
- Diseno oscuro, moderno y premium con gradientes sutiles
- Animaciones CSS: transiciones hover en botones y tarjetas, fade-in para secciones
- Tipografia con jerarquia clara (hero grande y bold, subtitulos medios, texto body legible)
- Fully responsive con clases de Tailwind (mobile-first)

CONTENIDO:
- Escribe contenido REAL y relevante para "${entities.businessName}" (tipo: ${intent}/${label})
- NO uses Lorem Ipsum ni texto placeholder
- Incluye llamadas a la accion (CTAs) convincentes
- Testimonios con nombres y cargos realistas si se piden

SECCIONES REQUERIDAS: ${entities.sections.join(", ")}

${entities.sections.includes("auth") || entities.sections.includes("login") ? `SECCION DE AUTENTICACION:
- Incluye un formulario de registro (nombre, email, contraseña) con diseño moderno tipo modal o card
- Incluye un formulario de inicio de sesión (email, contraseña) con opción de alternar entre registro/login
- Usa tabs o toggle para cambiar entre "Registrarse" e "Iniciar Sesión"
- Botones estilizados con hover effects
- Los formularios son visuales/estaticos (no funcionales), pero deben verse profesionales y realistas
` : ""}${entities.sections.includes("user-panel") ? `PANEL DE USUARIO:
- Incluye una sección que simule un dashboard/panel de usuario logueado
- Muestra un historial de consumo/pedidos con tabla o cards (datos de ejemplo realistas)
- Incluye nombre del usuario, avatar placeholder, y resumen de actividad
- Diseño tipo dashboard con cards de estadísticas (total gastado, pedidos, favoritos)
` : ""}RESPUESTA ESTRUCTURADA:
Antes del HTML, opcionalmente incluye un bloque JSON de arquitectura:
\`\`\`json
{"analysis":{"intent":"${intent}","businessName":"${entities.businessName}","sections":${JSON.stringify(entities.sections)},"complexity":"medium"},"architecture":{"components":["Navbar","Hero","Features","Contact","Footer"],"dataFlow":"User -> Sections -> CTA -> Contact"}}
\`\`\`

IMPORTANTE: Responde UNICAMENTE con el HTML completo. Sin explicaciones, sin markdown, sin backticks.
El HTML debe empezar con <!DOCTYPE html> y terminar con </html>.`;
}

function extractHtmlFromResponse(response: string): string | null {
  const htmlMatch = response.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
  if (htmlMatch) return htmlMatch[0];

  const codeMatch = response.match(/```(?:html)?\s*(<!DOCTYPE html>[\s\S]*<\/html>)\s*```/i);
  if (codeMatch) return codeMatch[1];

  if (response.trim().startsWith("<")) return response.trim();

  return null;
}

// ==================== CONVERSATIONAL DETECTION ====================
const conversationalPatterns = [
  /(?:no\s+(?:se\s+)?(?:muestra|carga|ve|aparece|funciona|renderiza))/i,
  /(?:por\s*que|porque)\s+(?:no|el|la|se)/i,
  /(?:revisa|revisar|checa|checar|verifica|verificar)\s/i,
  /(?:ayuda|help|problema|error|bug|falla)/i,
  /(?:como\s+(?:hago|uso|funciona|puedo))/i,
  /(?:hola|buenos?\s+dias?|buenas?\s+(?:tardes?|noches?))\s*[!?.]*$/i,
  /(?:gracias|thanks|ok|vale|listo|entendido)\s*[!?.]*$/i,
  /(?:que\s+(?:es|hace|puedo|significa))/i,
  /(?:no\s+(?:entiendo|se|puedo))/i,
  /(?:screenshot|captura|pantallazo)/i,
];

const generationKeywords = [
  "landing", "restaurante", "cafeteria", "cafe", "tienda", "ecommerce", "portfolio",
  "blog", "dashboard", "gimnasio", "gym", "agencia", "clinica", "inmobiliaria",
  "hotel", "abogado", "contador", "fotografo", "musica", "salon", "peluqueria",
  "barberia", "veterinaria", "escuela", "academia", "pagina", "sitio", "web",
  "crea", "crear", "hazme", "genera", "quiero", "necesito", "diseña",
];

function isConversational(message: string): string | null {
  const normalized = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const matchesConversational = conversationalPatterns.some(p => p.test(normalized));
  if (!matchesConversational) return null;
  
  // Check if it also contains generation keywords
  const hasGenerationKeyword = generationKeywords.some(kw => normalized.includes(kw));
  if (hasGenerationKeyword) return null;
  
  // Determine contextual response
  if (/no\s+(?:se\s+)?(?:muestra|carga|ve|aparece|funciona|renderiza)/i.test(normalized)) {
    return "🔧 Entiendo que hay un problema con la visualización. Te recomiendo:\n\n1. **Refrescar el preview** usando el botón de refresh (↻)\n2. **Verificar** que el sitio se haya generado correctamente\n3. Si el problema persiste, **descríbeme qué sitio quieres** y lo regeneraré\n\nRecuerda que primero debes pedirme crear un sitio, por ejemplo: *\"Crea una cafetería llamada El Buen Café con menú y contacto\"*";
  }
  if (/(?:revisa|revisar|checa|checar|verifica|verificar)/i.test(normalized)) {
    return "👀 Estoy aquí para ayudarte. Si algo no se ve bien, dime:\n\n• **Qué esperabas ver** vs qué ves actualmente\n• **Qué cambios** quieres hacer al sitio\n\nPuedo modificar colores, secciones, nombre del negocio, o regenerar el sitio completo. Solo descríbeme qué necesitas.";
  }
  if (/(?:hola|buenos?\s+dias?|buenas?\s+(?:tardes?|noches?))/i.test(normalized)) {
    return "¡Hola! 👋 Soy **DOKU AI**, tu asistente para crear sitios web profesionales.\n\nDime qué quieres crear, por ejemplo:\n• *\"Quiero una landing para mi cafetería El Buen Café\"*\n• *\"Crea un portfolio con galería y contacto\"*\n• *\"Hazme una tienda online de ropa\"*";
  }
  if (/(?:gracias|thanks|ok|vale|listo|entendido)/i.test(normalized)) {
    return "¡De nada! 😊 Si necesitas algo más, solo dime. Puedo:\n\n• Crear un nuevo sitio\n• Modificar el sitio actual (colores, secciones, contenido)\n• Cambiar el nombre del negocio\n\n¿En qué más te puedo ayudar?";
  }
  if (/(?:como\s+(?:hago|uso|funciona|puedo))/i.test(normalized)) {
    return "📖 **¿Cómo usar DOKU AI?**\n\n1. **Describe** el sitio que quieres (tipo, nombre, secciones)\n2. **Revisa** el análisis y plan de ejecución\n3. **Confirma** o pide ajustes\n4. ¡**Listo**! Tu sitio aparece en el preview\n\n**Ejemplo:** *\"Quiero un restaurante llamado La Casa del Chef con menú, galería y contacto en colores cálidos\"*";
  }
  return "🤔 No estoy seguro de qué necesitas. Soy un generador de sitios web.\n\nPara crear un sitio, descríbeme:\n• **Tipo** (restaurante, tienda, portfolio, blog...)\n• **Nombre** del negocio\n• **Secciones** que quieres (menú, contacto, galería...)\n\n**Ejemplo:** *\"Crea una landing para mi agencia digital TechFlow\"*";
}

// ==================== MAIN HANDLER ====================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { message, mode, action, logId, accepted, feedback, previousIntent, previousEntities, projectId, conversationHistory } = body;

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

    // ---- CONVERSATIONAL DETECTION (before classification pipeline) ----
    const conversationalResponse = isConversational(message);
    if (conversationalResponse) {
      console.log(`[Conversational] Message detected as non-generative: "${message.substring(0, 50)}..."`);
      return new Response(
        JSON.stringify({
          intent: "conversational",
          confidence: 1.0,
          label: "Conversación",
          entities: { businessName: "", sections: [], colorScheme: "", industry: "" },
          html: "",
          conversationalResponse,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 0. Load entity memory if projectId provided
    let entityMemory: { intent: string; business_name: string; sections: string[]; color_scheme: string } | null = null;
    if (projectId) {
      entityMemory = await loadEntityMemory(projectId);
      if (entityMemory) {
        console.log(`[Entity Memory] Loaded for project ${projectId}: ${entityMemory.business_name} (${entityMemory.intent})`);
      }
    }

    // 1. Query learning patterns (includes accepted + rejected for negative learning)
    const patterns = await queryLearningPatterns();

    // 2. Tokenize and classify with enhanced NLP + TF-IDF
    const tokens = tokenize(message);

    // 2.5. Run Ollama intent refinement in parallel with classification prep
    // Include conversation history for better context
    const contextualMessage = conversationHistory && conversationHistory.length > 0
      ? `Contexto previo:\n${conversationHistory.map((h: { role: string; content: string }) => `${h.role}: ${h.content}`).join("\n")}\n\nMensaje actual: ${message}`
      : message;
    const ollamaRefinement = await ollamaIntentRefinement(contextualMessage);

    // 3. Check for conversational follow-up
    let intent: string;
    let confidence: number;
    let label: string;

    if (isFollowUp(message) && (previousIntent || entityMemory?.intent) && (previousEntities || entityMemory)) {
      // Follow-up message: use previous context or entity memory
      intent = previousIntent || entityMemory!.intent;
      confidence = 0.85;
      label = intentMap[intent]?.label || "Sitio Web";
    } else {
      // New message: full classification with TF-IDF + all signals + Ollama refinement
      const classification = await classifyIntent(tokens, message, patterns, ollamaRefinement);
      intent = classification.intent;
      confidence = classification.confidence;
      label = classification.label;
    }

    // ---- CONFIDENCE THRESHOLD: if too low, ask for clarification ----
    if (confidence < 0.3 && !isFollowUp(message)) {
      console.log(`[Low Confidence] ${confidence} for intent "${intent}" - asking clarification`);
      return new Response(
        JSON.stringify({
          intent: "conversational",
          confidence,
          label: "Conversación",
          entities: { businessName: "", sections: [], colorScheme: "", industry: "" },
          html: "",
          conversationalResponse: `🤔 No estoy seguro de qué tipo de sitio quieres crear (confianza: ${Math.round(confidence * 100)}%).\n\nPuedes ser más específico? Por ejemplo:\n• *\"Crea un restaurante llamado La Casa del Chef\"*\n• *\"Hazme una landing page para mi startup\"*\n• *\"Quiero un portfolio con galería y contacto\"*\n\nMientras más detalles me des, mejor será el resultado.`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Extract entities (merging with previous context, entity memory, and Ollama refinement)
    let entities = extractEntities(message, tokens, intent);

    // Merge Ollama refinement entities
    if (ollamaRefinement) {
      const defaultName = getDefaultName(intent);
      if (ollamaRefinement.businessName && entities.businessName === defaultName) {
        entities.businessName = ollamaRefinement.businessName;
      }
      if (ollamaRefinement.sections && ollamaRefinement.sections.length > 0) {
        entities.sections = [...new Set([...entities.sections, ...ollamaRefinement.sections])];
      }
      if (ollamaRefinement.color && entities.colorScheme === "default") {
        entities.colorScheme = colorMap[ollamaRefinement.color.toLowerCase()] || ollamaRefinement.color;
      }
    }

    // Merge with entity memory for follow-ups
    const mergeEntities = previousEntities || (entityMemory ? {
      businessName: entityMemory.business_name,
      sections: entityMemory.sections,
      colorScheme: entityMemory.color_scheme,
      industry: entityMemory.intent,
    } : null);

    if (mergeEntities && isFollowUp(message)) {
      const defaultName = getDefaultName(intent);
      entities = {
        businessName: entities.businessName !== defaultName ? entities.businessName : (mergeEntities.businessName || defaultName),
        sections: entities.sections.length > 3 ? entities.sections : [...new Set([...(mergeEntities.sections || []), ...entities.sections])],
        colorScheme: entities.colorScheme !== "default" && entities.colorScheme !== (({
          restaurant: "warm", fitness: "green", agency: "modern", portfolio: "purple",
          ecommerce: "blue", blog: "cool", clinic: "blue", realestate: "elegant",
          education: "blue", veterinary: "green", hotel: "elegant", lawyer: "dark",
          accounting: "cool", photography: "dark", music: "purple", salon: "pink",
          technology: "modern",
        } as Record<string, string>)[intent] || "purple") ? entities.colorScheme : (mergeEntities.colorScheme || entities.colorScheme),
        industry: intent,
      };
    }

    const colors = getColors(entities.colorScheme);

    // 5. Generate HTML - Try FULL LLM generation first, fallback to hybrid
    let html: string;

    // Detect if this is a modification request
    const isModificationRequest = isModification(message) || isFollowUp(message);
    
    // For modifications, try to get previous HTML from project
    let previousHtml: string | undefined;
    if (isModificationRequest && projectId) {
      try {
        const sb = getSupabaseClient();
        const { data } = await sb.from("projects").select("html").eq("id", projectId).single();
        if (data?.html) {
          previousHtml = data.html;
          console.log(`[Modification] Loaded previous HTML (${previousHtml.length} chars) for modification request`);
        }
      } catch {
        console.warn("[Modification] Could not load previous HTML");
      }
    }

    // Step A: Attempt full HTML generation with LLM (60s timeout, 2000 tokens)
    const systemPrompt = buildSystemPrompt(intent, label, entities, isModificationRequest, previousHtml);
    const fullHtmlResult = await callLLMShort(systemPrompt, 2000);
    const extractedHtml = fullHtmlResult ? extractHtmlFromResponse(fullHtmlResult) : null;

    if (extractedHtml && extractedHtml.length > 500) {
      // Validate HTML quality before accepting
      const validation = validateHtmlQuality(extractedHtml, entities.businessName);
      if (validation.passed) {
        html = extractedHtml;
        console.log(`[Full LLM] HTML generated and validated (${extractedHtml.length} chars)${isModificationRequest ? " [MODIFICATION]" : ""}`);
      } else {
        console.log(`[Full LLM] HTML failed validation (${validation.failCount} issues: ${validation.issues.join(", ")}), falling back`);
        // Try to fix minor issues
        let fixedHtml = extractedHtml;
        if (validation.issues.includes("missing_business_name") && entities.businessName) {
          fixedHtml = fixedHtml.replace(/<title>[^<]*<\/title>/, `<title>${entities.businessName}</title>`);
        }
        if (validation.issues.includes("has_undefined_null")) {
          fixedHtml = fixedHtml.replace(/\bundefined\b/g, "").replace(/>null</g, "><");
        }
        // Re-validate
        const reValidation = validateHtmlQuality(fixedHtml, entities.businessName);
        if (reValidation.passed) {
          html = fixedHtml;
          console.log(`[Full LLM] HTML fixed and validated after cleanup`);
        } else {
          // Fallback to hybrid
          console.log(`[Hybrid] Full LLM still failing, using hybrid`);
          const enrichedContent = await enrichContentWithLLM(intent, entities.businessName);
          html = composeReactHtml({ name: entities.businessName, colors, sections: entities.sections, intent, enriched: enrichedContent });
        }
      }
    } else {
      // Step B: Fallback to hybrid approach
      console.log(`[Hybrid] Full LLM generation insufficient, falling back to hybrid approach`);
      const enrichedContent = await enrichContentWithLLM(intent, entities.businessName);
      html = composeReactHtml({ name: entities.businessName, colors, sections: entities.sections, intent, enriched: enrichedContent });
    }

    // 6. Save entity memory for this project
    if (projectId) {
      await saveEntityMemory(projectId, intent, entities);
    }

    // 7. Auto-create database tables based on intent
    let dbTablesCreated: string[] = [];
    if (projectId && intent !== "conversational") {
      try {
        dbTablesCreated = await autoCreateProjectTables(projectId, intent);
      } catch (err) {
        console.error("[AutoDB] Failed to auto-create tables (non-blocking):", err);
      }
    }

    // 8. Log interaction for learning
    const newLogId = await logInteraction(message, intent, entities as unknown as Record<string, unknown>, confidence);

    const response: Record<string, unknown> = {
      intent,
      confidence,
      label,
      entities,
      html,
      logId: newLogId,
    };

    if (dbTablesCreated.length > 0) {
      response.dbTablesCreated = dbTablesCreated;
    }

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
