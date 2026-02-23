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
  billing: [
    { name: "clients", columns: [
      { name: "name", type: "text" }, { name: "email", type: "email" }, { name: "phone", type: "text" },
      { name: "address", type: "text" }, { name: "tax_id", type: "text" }, { name: "notes", type: "text" },
    ]},
    { name: "invoices", columns: [
      { name: "invoice_number", type: "text" }, { name: "client_name", type: "text" }, { name: "issue_date", type: "date" },
      { name: "due_date", type: "date" }, { name: "subtotal", type: "number" }, { name: "tax", type: "number" },
      { name: "total", type: "number" }, { name: "status", type: "select" }, { name: "notes", type: "text" },
    ]},
    { name: "invoice_items", columns: [
      { name: "invoice_number", type: "text" }, { name: "description", type: "text" }, { name: "quantity", type: "number" },
      { name: "unit_price", type: "number" }, { name: "total", type: "number" },
    ]},
  ],
  inventory: [
    { name: "products", columns: [
      { name: "name", type: "text" }, { name: "sku", type: "text" }, { name: "category", type: "text" },
      { name: "stock", type: "number" }, { name: "min_stock", type: "number" }, { name: "price", type: "number" },
      { name: "location", type: "text" },
    ]},
    { name: "movements", columns: [
      { name: "product_name", type: "text" }, { name: "type", type: "select" }, { name: "quantity", type: "number" },
      { name: "date", type: "date" }, { name: "notes", type: "text" },
    ]},
  ],
  crm: [
    { name: "contacts", columns: [
      { name: "name", type: "text" }, { name: "email", type: "email" }, { name: "phone", type: "text" },
      { name: "company", type: "text" }, { name: "status", type: "select" }, { name: "notes", type: "text" },
    ]},
    { name: "deals", columns: [
      { name: "title", type: "text" }, { name: "contact_name", type: "text" }, { name: "value", type: "number" },
      { name: "stage", type: "select" }, { name: "expected_close", type: "date" }, { name: "notes", type: "text" },
    ]},
  ],
  pos: [
    { name: "products", columns: [
      { name: "name", type: "text" }, { name: "price", type: "number" }, { name: "category", type: "text" },
      { name: "stock", type: "number" }, { name: "barcode", type: "text" }, { name: "active", type: "boolean" },
    ]},
    { name: "sales", columns: [
      { name: "sale_number", type: "text" }, { name: "total", type: "number" }, { name: "payment_method", type: "select" },
      { name: "date", type: "date" }, { name: "cashier", type: "text" },
    ]},
  ],
  booking: [
    { name: "services", columns: [
      { name: "name", type: "text" }, { name: "description", type: "text" }, { name: "duration", type: "text" },
      { name: "price", type: "number" }, { name: "available", type: "boolean" },
    ]},
    { name: "bookings", columns: [
      { name: "client_name", type: "text" }, { name: "client_email", type: "email" }, { name: "service", type: "text" },
      { name: "date", type: "date" }, { name: "time", type: "text" }, { name: "status", type: "select" },
    ]},
  ],
  // === 6 NEW INDUSTRY INTENTS ===
  laundry: [
    { name: "orders", columns: [
      { name: "client_name", type: "text" }, { name: "phone", type: "text" }, { name: "service_type", type: "select" },
      { name: "items", type: "text" }, { name: "pickup_date", type: "date" }, { name: "delivery_date", type: "date" },
      { name: "status", type: "select" }, { name: "total", type: "number" },
    ]},
    { name: "services", columns: [
      { name: "name", type: "text" }, { name: "description", type: "text" }, { name: "price", type: "number" },
      { name: "duration", type: "text" }, { name: "category", type: "text" },
    ]},
  ],
  pharmacy: [
    { name: "products", columns: [
      { name: "name", type: "text" }, { name: "description", type: "text" }, { name: "price", type: "number" },
      { name: "category", type: "text" }, { name: "stock", type: "number" }, { name: "requires_prescription", type: "boolean" },
    ]},
    { name: "prescriptions", columns: [
      { name: "patient_name", type: "text" }, { name: "doctor", type: "text" }, { name: "medication", type: "text" },
      { name: "date", type: "date" }, { name: "status", type: "select" },
    ]},
  ],
  construction: [
    { name: "projects", columns: [
      { name: "name", type: "text" }, { name: "client", type: "text" }, { name: "location", type: "text" },
      { name: "start_date", type: "date" }, { name: "end_date", type: "date" }, { name: "budget", type: "number" },
      { name: "status", type: "select" },
    ]},
    { name: "materials", columns: [
      { name: "name", type: "text" }, { name: "quantity", type: "number" }, { name: "unit", type: "text" },
      { name: "cost", type: "number" }, { name: "supplier", type: "text" },
    ]},
  ],
  florist: [
    { name: "products", columns: [
      { name: "name", type: "text" }, { name: "description", type: "text" }, { name: "price", type: "number" },
      { name: "category", type: "text" }, { name: "image_url", type: "url" }, { name: "available", type: "boolean" },
    ]},
    { name: "orders", columns: [
      { name: "client_name", type: "text" }, { name: "phone", type: "text" }, { name: "arrangement", type: "text" },
      { name: "delivery_date", type: "date" }, { name: "delivery_address", type: "text" }, { name: "message", type: "text" },
      { name: "total", type: "number" }, { name: "status", type: "select" },
    ]},
  ],
  mechanic: [
    { name: "vehicles", columns: [
      { name: "owner_name", type: "text" }, { name: "phone", type: "text" }, { name: "make", type: "text" },
      { name: "model", type: "text" }, { name: "year", type: "number" }, { name: "plate", type: "text" },
    ]},
    { name: "work_orders", columns: [
      { name: "vehicle_plate", type: "text" }, { name: "owner_name", type: "text" }, { name: "service", type: "text" },
      { name: "diagnosis", type: "text" }, { name: "cost", type: "number" }, { name: "status", type: "select" },
      { name: "date", type: "date" },
    ]},
  ],
  printing: [
    { name: "orders", columns: [
      { name: "client_name", type: "text" }, { name: "phone", type: "text" }, { name: "product", type: "text" },
      { name: "quantity", type: "number" }, { name: "specifications", type: "text" }, { name: "total", type: "number" },
      { name: "delivery_date", type: "date" }, { name: "status", type: "select" },
    ]},
    { name: "services", columns: [
      { name: "name", type: "text" }, { name: "description", type: "text" }, { name: "price", type: "number" },
      { name: "category", type: "text" }, { name: "min_quantity", type: "number" },
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
  contar: ["accounting"], facturar: ["billing", "accounting"], auditar: ["accounting"],
  inventariar: ["inventory"], almacenar: ["inventory"],
  cotizar: ["billing"], cobrar: ["billing", "pos"],
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
  // Billing / Facturacion
  { pattern: /(?:sistema|app|aplicacion)\s+(?:de\s+)?(?:facturacion|facturas|cobros|cobro)/i, intent: "billing", boost: 6 },
  { pattern: /(?:facturar|generar\s+facturas|emitir\s+facturas)/i, intent: "billing", boost: 5 },
  { pattern: /(?:cuentas\s+por\s+cobrar|recibos|notas\s+de\s+venta)/i, intent: "billing", boost: 4 },
  // Inventory
  { pattern: /(?:sistema|app|aplicacion)\s+(?:de\s+)?(?:inventario|almacen|bodega|stock)/i, intent: "inventory", boost: 6 },
  { pattern: /(?:control\s+de\s+(?:inventario|stock|existencias))/i, intent: "inventory", boost: 5 },
  // CRM
  { pattern: /(?:sistema|app|aplicacion)\s+(?:de\s+)?(?:clientes|crm|prospectos|leads)/i, intent: "crm", boost: 5 },
  { pattern: /(?:gestion\s+de\s+clientes|seguimiento\s+de\s+clientes)/i, intent: "crm", boost: 5 },
  // POS
  { pattern: /(?:punto\s+de\s+venta|pos|terminal\s+de\s+venta|caja\s+registradora)/i, intent: "pos", boost: 6 },
  // Booking
  { pattern: /(?:sistema|app|aplicacion)\s+(?:de\s+)?(?:reservas|citas|agenda|turnos)/i, intent: "booking", boost: 5 },
  { pattern: /(?:agendar|reservar)\s+(?:citas|turnos|horarios)/i, intent: "booking", boost: 5 },
  // === 6 NEW INDUSTRY PHRASE PATTERNS ===
  { pattern: /(?:lavanderia|tintoreria|lavadero|laundry)/i, intent: "laundry", boost: 5 },
  { pattern: /(?:servicio|sistema)\s+(?:de\s+)?(?:lavado|lavanderia|tintoreria)/i, intent: "laundry", boost: 6 },
  { pattern: /(?:lavado\s+(?:en\s+)?seco|ropa\s+sucia|planchado)/i, intent: "laundry", boost: 5 },
  { pattern: /(?:farmacia|drogueria|botica)/i, intent: "pharmacy", boost: 5 },
  { pattern: /(?:venta|sistema)\s+(?:de\s+)?(?:medicamentos|farmacia)/i, intent: "pharmacy", boost: 6 },
  { pattern: /(?:constructora|empresa\s+(?:de\s+)?construccion)/i, intent: "construction", boost: 5 },
  { pattern: /(?:despacho|oficina|estudio)\s+(?:de\s+)?(?:arquitect|ingeni)/i, intent: "construction", boost: 5 },
  { pattern: /(?:remodelacion|obra|edificacion)/i, intent: "construction", boost: 4 },
  { pattern: /(?:floristeria|floreria|tienda\s+(?:de\s+)?flores)/i, intent: "florist", boost: 5 },
  { pattern: /(?:arreglos?\s+florales?|ramos?\s+(?:de\s+)?(?:flores|novia))/i, intent: "florist", boost: 5 },
  { pattern: /(?:taller\s+(?:mecanico|automotriz|de\s+autos?))/i, intent: "mechanic", boost: 6 },
  { pattern: /(?:mecanico|reparacion\s+(?:de\s+)?(?:autos?|carros?|vehiculos?))/i, intent: "mechanic", boost: 5 },
  { pattern: /(?:servicio\s+automotriz|cambio\s+(?:de\s+)?aceite)/i, intent: "mechanic", boost: 5 },
  { pattern: /(?:imprenta|impresora|papeleria)/i, intent: "printing", boost: 5 },
  { pattern: /(?:impresion|copias|serigrafia|rotulacion)/i, intent: "printing", boost: 4 },
  { pattern: /(?:tarjetas?\s+(?:de\s+)?presentacion|volantes?|lonas?|banners?)/i, intent: "printing", boost: 5 },
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
    keywords: ["contador", "contabilidad", "impuestos", "fiscal", "auditor", "contable", "nomina", "tributario"],
    bigrams: ["despacho contable", "asesoria fiscal", "declaracion impuestos"],
    label: "Contabilidad / Fiscal",
  },
  billing: {
    keywords: ["facturacion", "facturas", "invoice", "cobro", "cobros", "recibo", "recibos", "billing", "cuentas", "cotizacion", "cotizaciones", "notas"],
    bigrams: ["cuentas cobrar", "notas venta", "sistema facturacion", "generar facturas"],
    label: "Facturación",
  },
  inventory: {
    keywords: ["inventario", "almacen", "bodega", "stock", "existencias", "inventory", "warehouse", "productos"],
    bigrams: ["control inventario", "control stock", "gestion almacen"],
    label: "Inventario",
  },
  crm: {
    keywords: ["crm", "clientes", "prospectos", "leads", "contactos", "oportunidades", "pipeline", "seguimiento"],
    bigrams: ["gestion clientes", "seguimiento clientes", "base clientes"],
    label: "CRM / Gestión de Clientes",
  },
  pos: {
    keywords: ["pos", "caja", "registradora", "terminal", "venta", "ventas", "ticket", "tickets"],
    bigrams: ["punto venta", "caja registradora", "terminal venta"],
    label: "Punto de Venta",
  },
  booking: {
    keywords: ["reservas", "citas", "agenda", "turnos", "booking", "appointments", "agendar", "programar"],
    bigrams: ["sistema reservas", "sistema citas", "agendar citas"],
    label: "Reservas / Citas",
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
  // === 6 NEW INDUSTRY INTENTS ===
  laundry: {
    keywords: ["lavanderia", "tintoreria", "lavado", "planchado", "ropa", "limpieza", "lavadero", "laundry", "drycleaning", "lavada"],
    bigrams: ["lavado seco", "ropa sucia", "servicio lavanderia", "lavado planchado", "tintoreria lavanderia"],
    label: "Lavandería / Tintorería",
  },
  pharmacy: {
    keywords: ["farmacia", "medicamentos", "recetas", "drogueria", "medicina", "pastillas", "remedios", "pharmacy", "botica", "farmaceutico"],
    bigrams: ["farmacia online", "venta medicamentos", "recetas medicas", "productos farmaceuticos"],
    label: "Farmacia / Droguería",
  },
  construction: {
    keywords: ["constructora", "arquitecto", "obra", "remodelacion", "construccion", "edificacion", "contratista", "ingeniero", "planos", "proyecto"],
    bigrams: ["empresa constructora", "remodelacion casa", "obra civil", "construccion vivienda", "diseno arquitectonico"],
    label: "Constructora / Arquitectura",
  },
  florist: {
    keywords: ["floristeria", "flores", "arreglos", "ramos", "floreria", "bouquet", "florista", "plantas", "jardin", "decoracion"],
    bigrams: ["arreglos florales", "envio flores", "ramos novia", "flores evento", "floristeria online"],
    label: "Floristería",
  },
  mechanic: {
    keywords: ["taller", "mecanico", "reparacion", "auto", "carro", "vehiculo", "motor", "frenos", "afinacion", "transmision", "llantas", "neumaticos"],
    bigrams: ["taller mecanico", "reparacion auto", "taller automotriz", "servicio automotriz", "cambio aceite"],
    label: "Taller Mecánico",
  },
  printing: {
    keywords: ["imprenta", "impresion", "papeleria", "copias", "rotulacion", "serigrafia", "offset", "volantes", "tarjetas", "banner", "lonas", "vinil"],
    bigrams: ["imprenta digital", "impresion offset", "tarjetas presentacion", "lonas publicitarias", "impresion gran formato"],
    label: "Imprenta / Impresión",
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
  // New industry synonyms
  "lavandria": "lavanderia", "labanderia": "lavanderia", "lavandería": "lavanderia",
  "tintoreria": "tintoreria", "tintorría": "tintoreria",
  "farmasia": "farmacia", "farmacias": "farmacia", "farmácia": "farmacia",
  "drogueria": "drogueria", "drogería": "drogueria",
  "constructra": "constructora", "costruccion": "construccion", "construcción": "construccion",
  "arquitecto": "arquitecto", "arkitecto": "arquitecto",
  "floristeria": "floristeria", "florería": "floreria", "floreria": "floreria",
  "mecanico": "mecanico", "mecánico": "mecanico", "mekanico": "mecanico",
  "inprenta": "imprenta", "impresion": "impresion", "impresión": "impresion",
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
  // === 6 NEW INDUSTRY SEMANTIC VOCABULARIES ===
  laundry: ["lavanderia", "tintoreria", "lavado", "planchado", "ropa", "limpieza", "lavadero", "seco", "sucia", "mancha", "detergente", "entrega", "recogida", "servicio", "prenda", "camisa", "pantalon", "traje", "cobija", "cortina", "almohada"],
  pharmacy: ["farmacia", "medicamentos", "recetas", "drogueria", "medicina", "pastillas", "remedios", "botica", "farmaceutico", "antibiotico", "jarabe", "vitamina", "suplemento", "dosis", "prescripcion", "salud", "cuidado", "bienestar"],
  construction: ["constructora", "arquitecto", "obra", "remodelacion", "construccion", "edificacion", "contratista", "ingeniero", "planos", "proyecto", "cimiento", "estructura", "concreto", "acero", "vivienda", "edificio", "presupuesto", "material"],
  florist: ["floristeria", "flores", "arreglos", "ramos", "floreria", "bouquet", "florista", "plantas", "jardin", "decoracion", "rosa", "tulipan", "girasol", "orquidea", "lirio", "petalos", "novia", "evento", "corona", "maceta"],
  mechanic: ["taller", "mecanico", "reparacion", "auto", "carro", "vehiculo", "motor", "frenos", "afinacion", "transmision", "llantas", "neumaticos", "aceite", "suspension", "escape", "bateria", "alternador", "clutch", "embrague", "diagnostico"],
  printing: ["imprenta", "impresion", "papeleria", "copias", "rotulacion", "serigrafia", "offset", "volantes", "tarjetas", "banner", "lonas", "vinil", "papel", "tinta", "diseno", "grafico", "cartel", "folleto", "catalogo", "brochure"],
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

// ==================== OLLAMA CLOUD CLASSIFICATION (Signal 8) ====================
const OLLAMA_CLASSIFY_PROMPT = `Eres el clasificador de intents de DOKU, un generador de sitios web en español.
Dado el mensaje del usuario, clasifica en UNO de estos intents:
- landing: Página de presentación general o corporativa
- restaurant: Restaurante, cafetería, bar, comida
- ecommerce: Tienda online, venta de productos
- portfolio: Portfolio, trabajos, curriculum
- blog: Blog, artículos, revista
- fitness: Gimnasio, crossfit, yoga, deporte
- agency: Agencia de marketing, diseño, publicidad
- clinic: Clínica, consultorio médico, dental
- realestate: Inmobiliaria, bienes raíces
- education: Academia, cursos, escuela
- veterinary: Veterinaria, mascotas
- hotel: Hotel, hospedaje, alojamiento
- lawyer: Abogado, bufete legal
- accounting: Contador, contabilidad, fiscal
- photography: Fotografía, estudio fotográfico
- music: Música, estudio de grabación, DJ
- salon: Salón de belleza, barbería, spa
- technology: Software, tech, desarrollo
- billing: Facturación, cobros, recibos
- inventory: Inventario, almacén, stock
- crm: CRM, gestión de clientes
- pos: Punto de venta, caja registradora
- booking: Reservas, citas, agenda
- laundry: Lavandería, tintorería
- pharmacy: Farmacia, droguería
- construction: Constructora, arquitectura
- florist: Floristería, flores
- mechanic: Taller mecánico, reparación de autos
- printing: Imprenta, impresión

Responde SOLO con JSON válido, sin texto adicional:
{"intent":"nombre_del_intent","confidence":0.0-1.0,"entities":{"businessName":"nombre detectado o vacío","sections":[],"colorScheme":"color detectado o vacío","industry":"industria"}}`;

async function classifyWithOllama(message: string, modelOverride?: string): Promise<{ intent: string; confidence: number; label: string } | null> {
  const apiKey = Deno.env.get("OLLAMA_API_KEY");
  if (!apiKey) {
    console.log("[Ollama] No OLLAMA_API_KEY configured, skipping");
    return null;
  }

  // Try multiple Ollama API endpoints
  const endpoints = [
    { url: "https://api.ollama.com/v1/chat/completions", format: "openai" },
    { url: "https://ollama.com/api/chat", format: "ollama" },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`[Ollama] Trying ${endpoint.url} (${endpoint.format} format)`);
      
      const selectedModel = modelOverride || Deno.env.get("LLM_MODEL") || "llama3";
      const body = endpoint.format === "openai" 
        ? JSON.stringify({
            model: selectedModel,
            messages: [
              { role: "system", content: OLLAMA_CLASSIFY_PROMPT },
              { role: "user", content: message }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" },
          })
        : JSON.stringify({
            model: selectedModel,
            messages: [
              { role: "system", content: OLLAMA_CLASSIFY_PROMPT },
              { role: "user", content: message }
            ],
            stream: false,
            format: "json",
          });

      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body,
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        console.log(`[Ollama] ${endpoint.url} returned ${response.status}: ${await response.text()}`);
        continue;
      }

      const data = await response.json();
      
      // Extract content based on format
      let content: string;
      if (endpoint.format === "openai") {
        content = data.choices?.[0]?.message?.content || "";
      } else {
        content = data.message?.content || "";
      }

      if (!content) {
        console.log("[Ollama] Empty response content");
        continue;
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log("[Ollama] No JSON found in response:", content.substring(0, 200));
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const ollamaIntent = parsed.intent?.toLowerCase?.();
      
      if (!ollamaIntent || !intentMap[ollamaIntent]) {
        console.log(`[Ollama] Unknown intent: ${ollamaIntent}`);
        continue;
      }

      const ollamaConfidence = Math.min(Math.max(parseFloat(parsed.confidence) || 0.7, 0.1), 0.99);
      
      console.log(`[Ollama] Classified as "${ollamaIntent}" with confidence ${ollamaConfidence}`);
      
      return {
        intent: ollamaIntent,
        confidence: ollamaConfidence,
        label: intentMap[ollamaIntent]?.label || "Sitio Web",
      };
    } catch (err) {
      console.warn(`[Ollama] Error with ${endpoint.url}:`, err);
      continue;
    }
  }

  // Also try LLM_BASE_URL if configured (for self-hosted Ollama or other OpenAI-compatible APIs)
  const llmBaseUrl = Deno.env.get("LLM_BASE_URL");
  if (llmBaseUrl) {
    try {
      console.log(`[Ollama] Trying custom LLM_BASE_URL: ${llmBaseUrl}`);
      const response = await fetch(`${llmBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: Deno.env.get("LLM_MODEL") || "llama3",
          messages: [
            { role: "system", content: OLLAMA_CLASSIFY_PROMPT },
            { role: "user", content: message }
          ],
          temperature: 0.1,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const ollamaIntent = parsed.intent?.toLowerCase?.();
          if (ollamaIntent && intentMap[ollamaIntent]) {
            const ollamaConfidence = Math.min(Math.max(parseFloat(parsed.confidence) || 0.7, 0.1), 0.99);
            console.log(`[Ollama/Custom] Classified as "${ollamaIntent}" with confidence ${ollamaConfidence}`);
            return {
              intent: ollamaIntent,
              confidence: ollamaConfidence,
              label: intentMap[ollamaIntent]?.label || "Sitio Web",
            };
          }
        }
      }
    } catch (err) {
      console.warn(`[Ollama/Custom] Error:`, err);
    }
  }

  console.log("[Ollama] All endpoints failed, falling back to rules-only");
  return null;
}

// ==================== BOOTSTRAPPING CORPUS (500+ synthetic training messages) ====================
const bootstrapCorpus: { message: string; intent: string }[] = [
  // RESTAURANT (~40 variations)
  { message: "quiero un restaurante", intent: "restaurant" },
  { message: "crea una cafeteria", intent: "restaurant" },
  { message: "hazme una pagina de comida", intent: "restaurant" },
  { message: "necesito un sitio para mi restaurante", intent: "restaurant" },
  { message: "pagina para mi cafeteria", intent: "restaurant" },
  { message: "restaurante con menu y contacto", intent: "restaurant" },
  { message: "crea un restaurante de comida mexicana", intent: "restaurant" },
  { message: "web para mi taqueria", intent: "restaurant" },
  { message: "sitio web para mi pizzeria", intent: "restaurant" },
  { message: "pagina para mi bar de sushi", intent: "restaurant" },
  { message: "necesito una pagina para mi fonda", intent: "restaurant" },
  { message: "crea un sitio de comida rapida", intent: "restaurant" },
  { message: "hazme un menu digital para mi restaurante", intent: "restaurant" },
  { message: "quiero un sitio para mi panaderia", intent: "restaurant" },
  { message: "web de gastronomia", intent: "restaurant" },
  { message: "restaurante con reservaciones online", intent: "restaurant" },
  { message: "cafeteria con carta de bebidas", intent: "restaurant" },
  { message: "bistro con menu gourmet", intent: "restaurant" },
  { message: "food truck pagina web", intent: "restaurant" },
  { message: "quiero una pagina para vender comida", intent: "restaurant" },
  { message: "marisqueria con galeria", intent: "restaurant" },
  { message: "asador con menu y precios", intent: "restaurant" },
  { message: "bufete de comida china", intent: "restaurant" },
  { message: "brunch cafe con contacto", intent: "restaurant" },
  // ECOMMERCE (~40 variations)
  { message: "quiero una tienda online", intent: "ecommerce" },
  { message: "crea un ecommerce", intent: "ecommerce" },
  { message: "tienda virtual de ropa", intent: "ecommerce" },
  { message: "necesito vender productos en linea", intent: "ecommerce" },
  { message: "hazme una tienda de zapatos", intent: "ecommerce" },
  { message: "marketplace de accesorios", intent: "ecommerce" },
  { message: "shop online con carrito de compras", intent: "ecommerce" },
  { message: "catalogo de productos online", intent: "ecommerce" },
  { message: "vender articulos por internet", intent: "ecommerce" },
  { message: "tienda de joyeria con pagos", intent: "ecommerce" },
  { message: "ecommerce con checkout", intent: "ecommerce" },
  { message: "pagina para vender en linea", intent: "ecommerce" },
  { message: "tienda de ropa con carrito", intent: "ecommerce" },
  { message: "store de productos naturales", intent: "ecommerce" },
  { message: "comercio electronico de tecnologia", intent: "ecommerce" },
  { message: "tienda online de cosmeticos", intent: "ecommerce" },
  { message: "venta de artesanias online", intent: "ecommerce" },
  { message: "marketplace de productos organicos", intent: "ecommerce" },
  { message: "vender muebles por internet", intent: "ecommerce" },
  { message: "tienda de electronica", intent: "ecommerce" },
  // PORTFOLIO (~25 variations)
  { message: "quiero un portfolio", intent: "portfolio" },
  { message: "pagina de mis trabajos", intent: "portfolio" },
  { message: "crea mi portafolio", intent: "portfolio" },
  { message: "sitio web de mi curriculum", intent: "portfolio" },
  { message: "hoja de vida digital", intent: "portfolio" },
  { message: "mostrar mis proyectos", intent: "portfolio" },
  { message: "galeria de trabajos creativos", intent: "portfolio" },
  { message: "cv online profesional", intent: "portfolio" },
  { message: "portfolio de disenador", intent: "portfolio" },
  { message: "pagina de freelancer", intent: "portfolio" },
  { message: "exhibir mis obras", intent: "portfolio" },
  { message: "sitio personal con proyectos", intent: "portfolio" },
  { message: "portfolio de artista", intent: "portfolio" },
  { message: "web para mostrar mi trabajo", intent: "portfolio" },
  // LANDING (~25 variations)
  { message: "quiero una landing page", intent: "landing" },
  { message: "pagina de aterrizaje", intent: "landing" },
  { message: "crea una landing para mi startup", intent: "landing" },
  { message: "web corporativa", intent: "landing" },
  { message: "pagina de presentacion de empresa", intent: "landing" },
  { message: "sitio institucional", intent: "landing" },
  { message: "landing de producto", intent: "landing" },
  { message: "pagina de mi negocio", intent: "landing" },
  { message: "web de mi empresa", intent: "landing" },
  { message: "pagina principal de mi marca", intent: "landing" },
  { message: "sitio de presentacion corporativa", intent: "landing" },
  { message: "landing con llamada a la accion", intent: "landing" },
  { message: "pagina de inicio de empresa", intent: "landing" },
  // FITNESS (~20 variations)
  { message: "pagina para mi gimnasio", intent: "fitness" },
  { message: "web de crossfit", intent: "fitness" },
  { message: "sitio de gym con planes", intent: "fitness" },
  { message: "crea un gimnasio con clases", intent: "fitness" },
  { message: "centro deportivo web", intent: "fitness" },
  { message: "fitness con precios y horarios", intent: "fitness" },
  { message: "quiero una pagina de yoga", intent: "fitness" },
  { message: "web de pilates", intent: "fitness" },
  { message: "gimnasio con membresias", intent: "fitness" },
  { message: "hazme un gym online", intent: "fitness" },
  { message: "entrenamiento personal web", intent: "fitness" },
  { message: "box de crossfit pagina", intent: "fitness" },
  // CLINIC (~20 variations)
  { message: "pagina para mi clinica", intent: "clinic" },
  { message: "consultorio medico web", intent: "clinic" },
  { message: "clinica dental online", intent: "clinic" },
  { message: "centro de salud web", intent: "clinic" },
  { message: "crea pagina de doctor", intent: "clinic" },
  { message: "consultorio con citas", intent: "clinic" },
  { message: "clinica con especialidades", intent: "clinic" },
  { message: "web de pediatra", intent: "clinic" },
  { message: "centro medico profesional", intent: "clinic" },
  { message: "pagina de dermatologo", intent: "clinic" },
  { message: "fisioterapia pagina web", intent: "clinic" },
  { message: "rehabilitacion sitio web", intent: "clinic" },
  // AGENCY (~18 variations)
  { message: "pagina de mi agencia digital", intent: "agency" },
  { message: "agencia de marketing web", intent: "agency" },
  { message: "estudio creativo online", intent: "agency" },
  { message: "agencia de publicidad", intent: "agency" },
  { message: "consultoria digital", intent: "agency" },
  { message: "agencia de diseno web", intent: "agency" },
  { message: "estudio de branding", intent: "agency" },
  { message: "firma de marketing digital", intent: "agency" },
  { message: "agencia creativa web", intent: "agency" },
  // HOTEL (~18 variations)
  { message: "pagina para mi hotel", intent: "hotel" },
  { message: "hospedaje web", intent: "hotel" },
  { message: "airbnb pagina", intent: "hotel" },
  { message: "resort con reservaciones", intent: "hotel" },
  { message: "posada web", intent: "hotel" },
  { message: "hostal con habitaciones", intent: "hotel" },
  { message: "hotel boutique web", intent: "hotel" },
  { message: "alojamiento turistico", intent: "hotel" },
  { message: "casa rural pagina", intent: "hotel" },
  // SALON (~18 variations)
  { message: "salon de belleza web", intent: "salon" },
  { message: "peluqueria pagina", intent: "salon" },
  { message: "barberia online", intent: "salon" },
  { message: "spa con servicios", intent: "salon" },
  { message: "centro de estetica", intent: "salon" },
  { message: "salon de unas", intent: "salon" },
  { message: "barber shop web", intent: "salon" },
  { message: "peluqueria con citas", intent: "salon" },
  { message: "salon con manicure y pedicure", intent: "salon" },
  // BILLING (~20 variations)
  { message: "sistema de facturacion", intent: "billing" },
  { message: "app de facturas", intent: "billing" },
  { message: "generar facturas online", intent: "billing" },
  { message: "sistema de cobros", intent: "billing" },
  { message: "facturar electronicamente", intent: "billing" },
  { message: "cuentas por cobrar app", intent: "billing" },
  { message: "recibos y facturas sistema", intent: "billing" },
  { message: "cotizaciones online", intent: "billing" },
  { message: "notas de venta digitales", intent: "billing" },
  { message: "emitir facturas para mi negocio", intent: "billing" },
  { message: "sistema contable de facturacion", intent: "billing" },
  // INVENTORY (~15 variations)
  { message: "sistema de inventario", intent: "inventory" },
  { message: "control de stock", intent: "inventory" },
  { message: "gestion de almacen", intent: "inventory" },
  { message: "app de inventarios", intent: "inventory" },
  { message: "control de existencias", intent: "inventory" },
  { message: "bodega y almacen sistema", intent: "inventory" },
  { message: "inventario de productos", intent: "inventory" },
  { message: "registro de mercancia", intent: "inventory" },
  // CRM (~15 variations)
  { message: "sistema de clientes", intent: "crm" },
  { message: "crm para mi empresa", intent: "crm" },
  { message: "gestion de prospectos", intent: "crm" },
  { message: "seguimiento de leads", intent: "crm" },
  { message: "base de datos de contactos", intent: "crm" },
  { message: "pipeline de ventas", intent: "crm" },
  { message: "app de oportunidades de negocio", intent: "crm" },
  // POS (~15 variations)
  { message: "punto de venta", intent: "pos" },
  { message: "caja registradora digital", intent: "pos" },
  { message: "terminal de venta", intent: "pos" },
  { message: "pos para mi tienda", intent: "pos" },
  { message: "sistema de caja", intent: "pos" },
  { message: "registro de ventas", intent: "pos" },
  { message: "ticket de venta app", intent: "pos" },
  // BOOKING (~15 variations)
  { message: "sistema de reservas", intent: "booking" },
  { message: "agendar citas online", intent: "booking" },
  { message: "app de turnos", intent: "booking" },
  { message: "reservas con calendario", intent: "booking" },
  { message: "agenda de citas digital", intent: "booking" },
  { message: "programar horarios online", intent: "booking" },
  { message: "sistema de agendamiento", intent: "booking" },
  // BLOG (~15 variations)
  { message: "quiero un blog", intent: "blog" },
  { message: "pagina de articulos", intent: "blog" },
  { message: "sitio de noticias", intent: "blog" },
  { message: "revista digital", intent: "blog" },
  { message: "blog personal", intent: "blog" },
  { message: "magazine online", intent: "blog" },
  { message: "publicar articulos", intent: "blog" },
  // DASHBOARD (~12 variations)
  { message: "panel de administracion", intent: "dashboard" },
  { message: "dashboard de metricas", intent: "dashboard" },
  { message: "panel de control", intent: "dashboard" },
  { message: "admin con estadisticas", intent: "dashboard" },
  { message: "sistema de gestion interno", intent: "dashboard" },
  { message: "analytics dashboard", intent: "dashboard" },
  // REALESTATE (~15 variations)
  { message: "inmobiliaria web", intent: "realestate" },
  { message: "venta de casas online", intent: "realestate" },
  { message: "bienes raices pagina", intent: "realestate" },
  { message: "renta de departamentos", intent: "realestate" },
  { message: "alquiler de propiedades", intent: "realestate" },
  { message: "catalogo de inmuebles", intent: "realestate" },
  { message: "inmobiliaria con propiedades", intent: "realestate" },
  // EDUCATION (~12 variations)
  { message: "pagina de cursos online", intent: "education" },
  { message: "academia web", intent: "education" },
  { message: "escuela con cursos", intent: "education" },
  { message: "plataforma educativa", intent: "education" },
  { message: "instituto de capacitacion", intent: "education" },
  { message: "tutoria online", intent: "education" },
  // VETERINARY (~12 variations)
  { message: "veterinaria web", intent: "veterinary" },
  { message: "clinica de mascotas", intent: "veterinary" },
  { message: "pet shop online", intent: "veterinary" },
  { message: "hospital animal", intent: "veterinary" },
  { message: "veterinario con citas", intent: "veterinary" },
  { message: "consultorio veterinario", intent: "veterinary" },
  // LAWYER (~12 variations)
  { message: "bufete de abogados", intent: "lawyer" },
  { message: "despacho juridico web", intent: "lawyer" },
  { message: "firma legal online", intent: "lawyer" },
  { message: "abogado pagina web", intent: "lawyer" },
  { message: "asesoria legal web", intent: "lawyer" },
  { message: "notaria online", intent: "lawyer" },
  // ACCOUNTING (~10 variations)
  { message: "despacho contable web", intent: "accounting" },
  { message: "contador pagina", intent: "accounting" },
  { message: "asesoria fiscal online", intent: "accounting" },
  { message: "contabilidad web", intent: "accounting" },
  { message: "servicios contables pagina", intent: "accounting" },
  // PHOTOGRAPHY (~10 variations)
  { message: "pagina de fotografo", intent: "photography" },
  { message: "estudio fotografico web", intent: "photography" },
  { message: "fotografia de bodas", intent: "photography" },
  { message: "sesion fotografica web", intent: "photography" },
  { message: "portfolio fotografico", intent: "photography" },
  // MUSIC (~10 variations)
  { message: "estudio de grabacion web", intent: "music" },
  { message: "pagina de musico", intent: "music" },
  { message: "productor musical web", intent: "music" },
  { message: "banda musical pagina", intent: "music" },
  { message: "dj web portfolio", intent: "music" },
  // TECHNOLOGY (~10 variations)
  { message: "empresa de software", intent: "technology" },
  { message: "startup tech web", intent: "technology" },
  { message: "desarrollo de apps pagina", intent: "technology" },
  { message: "empresa de tecnologia", intent: "technology" },
  { message: "saas landing page", intent: "technology" },
  // Misspellings and informal variations
  { message: "resturante comida", intent: "restaurant" },
  { message: "quero una tinda", intent: "ecommerce" },
  { message: "gimansio con precios", intent: "fitness" },
  { message: "beterinaria de mascotas", intent: "veterinary" },
  { message: "peluqeria con citas", intent: "salon" },
  { message: "avogado pagina", intent: "lawyer" },
  { message: "inmoviliaria online", intent: "realestate" },
  { message: "cafetria menu", intent: "restaurant" },
  { message: "portafolios personal", intent: "portfolio" },
  { message: "tiena de ropa", intent: "ecommerce" },
  { message: "facturacion electronica app", intent: "billing" },
  { message: "otel con reservas", intent: "hotel" },
  { message: "sofware empresa", intent: "technology" },
  { message: "escuala de idiomas", intent: "education" },
  // Conversational-like but actually generation requests
  { message: "me puedes hacer un restaurante", intent: "restaurant" },
  { message: "podrias crear una tienda", intent: "ecommerce" },
  { message: "seria posible hacer un gym", intent: "fitness" },
  { message: "me gustaria un portfolio", intent: "portfolio" },
  { message: "quisiera una landing", intent: "landing" },
  { message: "necesitaria una pagina para vender", intent: "ecommerce" },
  // === 6 NEW INDUSTRY BOOTSTRAP CORPUS ===
  // LAUNDRY (~20 variations)
  { message: "lavanderia web", intent: "laundry" },
  { message: "pagina para mi lavanderia", intent: "laundry" },
  { message: "tintoreria online", intent: "laundry" },
  { message: "servicio de lavado y planchado", intent: "laundry" },
  { message: "quiero una pagina de lavanderia", intent: "laundry" },
  { message: "lavanderia con sistema de entregas", intent: "laundry" },
  { message: "crea un sitio para mi tintoreria", intent: "laundry" },
  { message: "lavanderia con precios y servicios", intent: "laundry" },
  { message: "lavado en seco pagina web", intent: "laundry" },
  { message: "lavandria con pedidos online", intent: "laundry" },
  { message: "hazme una lavanderia con recogida a domicilio", intent: "laundry" },
  { message: "lavadero de ropa con delivery", intent: "laundry" },
  { message: "sitio para servicio de lavado", intent: "laundry" },
  { message: "tintoreria con lista de servicios", intent: "laundry" },
  { message: "quiero un laundry service", intent: "laundry" },
  // PHARMACY (~18 variations)
  { message: "farmacia web", intent: "pharmacy" },
  { message: "pagina para mi farmacia", intent: "pharmacy" },
  { message: "drogueria online", intent: "pharmacy" },
  { message: "venta de medicamentos online", intent: "pharmacy" },
  { message: "quiero una pagina de farmacia", intent: "pharmacy" },
  { message: "farmacia con catalogo de productos", intent: "pharmacy" },
  { message: "crea un sitio para mi drogueria", intent: "pharmacy" },
  { message: "botica con delivery de medicinas", intent: "pharmacy" },
  { message: "farmacia con recetas medicas", intent: "pharmacy" },
  { message: "sitio para vender medicamentos", intent: "pharmacy" },
  { message: "farmasia online con productos", intent: "pharmacy" },
  { message: "hazme una farmacia con precios", intent: "pharmacy" },
  { message: "pagina de productos farmaceuticos", intent: "pharmacy" },
  { message: "tienda de medicinas online", intent: "pharmacy" },
  // CONSTRUCTION (~18 variations)
  { message: "constructora web", intent: "construction" },
  { message: "pagina para mi constructora", intent: "construction" },
  { message: "empresa de construccion", intent: "construction" },
  { message: "despacho de arquitectos", intent: "construction" },
  { message: "quiero una pagina de constructora", intent: "construction" },
  { message: "crea un sitio para remodelaciones", intent: "construction" },
  { message: "arquitecto con portafolio de obras", intent: "construction" },
  { message: "constructora con proyectos", intent: "construction" },
  { message: "pagina de remodelacion y construccion", intent: "construction" },
  { message: "empresa de edificacion web", intent: "construction" },
  { message: "sitio para contratista de obras", intent: "construction" },
  { message: "hazme una constructora con servicios", intent: "construction" },
  { message: "ingenieria civil pagina web", intent: "construction" },
  { message: "construccion y remodelacion sitio", intent: "construction" },
  // FLORIST (~18 variations)
  { message: "floristeria web", intent: "florist" },
  { message: "pagina para mi floristeria", intent: "florist" },
  { message: "floreria online", intent: "florist" },
  { message: "tienda de flores", intent: "florist" },
  { message: "quiero una pagina de floristeria", intent: "florist" },
  { message: "envio de flores online", intent: "florist" },
  { message: "arreglos florales pagina", intent: "florist" },
  { message: "crea un sitio para mi floreria", intent: "florist" },
  { message: "ramos de flores con envio", intent: "florist" },
  { message: "floristeria con catalogo y precios", intent: "florist" },
  { message: "hazme una pagina de flores", intent: "florist" },
  { message: "tienda online de arreglos florales", intent: "florist" },
  { message: "bouquets y coronas florales web", intent: "florist" },
  { message: "sitio para vender flores", intent: "florist" },
  // MECHANIC (~18 variations)
  { message: "taller mecanico web", intent: "mechanic" },
  { message: "pagina para mi taller", intent: "mechanic" },
  { message: "taller automotriz online", intent: "mechanic" },
  { message: "reparacion de autos pagina", intent: "mechanic" },
  { message: "quiero una pagina de taller mecanico", intent: "mechanic" },
  { message: "servicio automotriz web", intent: "mechanic" },
  { message: "taller de reparacion de carros", intent: "mechanic" },
  { message: "crea un sitio para mi taller de autos", intent: "mechanic" },
  { message: "mecanico con servicios y precios", intent: "mechanic" },
  { message: "taller con citas y diagnostico", intent: "mechanic" },
  { message: "hazme un taller mecanico con contacto", intent: "mechanic" },
  { message: "cambio de aceite y frenos web", intent: "mechanic" },
  { message: "taller de transmisiones pagina", intent: "mechanic" },
  { message: "servicio de llantas y afinacion", intent: "mechanic" },
  // PRINTING (~18 variations)
  { message: "imprenta web", intent: "printing" },
  { message: "pagina para mi imprenta", intent: "printing" },
  { message: "impresion digital online", intent: "printing" },
  { message: "copias y papeleria web", intent: "printing" },
  { message: "quiero una pagina de imprenta", intent: "printing" },
  { message: "rotulacion y serigrafia pagina", intent: "printing" },
  { message: "tarjetas de presentacion online", intent: "printing" },
  { message: "crea un sitio para mi imprenta", intent: "printing" },
  { message: "volantes y lonas publicitarias", intent: "printing" },
  { message: "imprenta con catalogo de productos", intent: "printing" },
  { message: "hazme una imprenta con precios", intent: "printing" },
  { message: "impresion gran formato web", intent: "printing" },
  { message: "banners y vinil publicitario", intent: "printing" },
  { message: "sitio para servicios de impresion", intent: "printing" },
  // Spanglish & short messages for new intents
  { message: "laundry service", intent: "laundry" },
  { message: "dry cleaning", intent: "laundry" },
  { message: "flower shop", intent: "florist" },
  { message: "auto repair", intent: "mechanic" },
  { message: "print shop", intent: "printing" },
  { message: "pharmacy store", intent: "pharmacy" },
  { message: "construction company", intent: "construction" },
  // Ambiguous cases (disambiguation training)
  { message: "salon de belleza con spa", intent: "salon" },
  { message: "spa con tratamientos faciales", intent: "salon" },
  { message: "contabilidad y facturacion", intent: "accounting" },
  { message: "solo facturacion electronica", intent: "billing" },
  { message: "tienda de mascotas", intent: "veterinary" },
  { message: "tienda de ropa online", intent: "ecommerce" },
  // Ultra-short messages
  { message: "gym", intent: "fitness" },
  { message: "tienda", intent: "ecommerce" },
  { message: "doctor", intent: "clinic" },
  { message: "abogados", intent: "lawyer" },
  { message: "flores", intent: "florist" },
  { message: "lavanderia", intent: "laundry" },
  { message: "farmacia", intent: "pharmacy" },
  { message: "taller", intent: "mechanic" },
  { message: "imprenta", intent: "printing" },
  { message: "constructora", intent: "construction" },
];

// ==================== N-GRAM PROBABILISTIC MODEL (Signal 9) ====================
interface TrigramModel {
  freq: Map<string, Map<string, number>>;
  totalPerIntent: Map<string, number>;
}

function extractTrigrams(tokens: string[]): string[] {
  const trigrams: string[] = [];
  // Pad with start/end tokens
  const padded = ["__START__", ...tokens, "__END__"];
  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.push(`${padded[i]} ${padded[i + 1]} ${padded[i + 2]}`);
  }
  // Also add bigrams as pseudo-trigrams for short messages
  for (let i = 0; i < padded.length - 1; i++) {
    trigrams.push(`__BI__ ${padded[i]} ${padded[i + 1]}`);
  }
  return trigrams;
}

function buildTrigramModel(patterns: LearningLog[]): TrigramModel {
  const freq = new Map<string, Map<string, number>>();
  const totalPerIntent = new Map<string, number>();

  // Train from learning logs (accepted patterns)
  const accepted = patterns.filter(p => p.user_accepted === true);
  for (const p of accepted) {
    const tokens = tokenize(p.user_message);
    const trigrams = extractTrigrams(tokens);
    for (const tri of trigrams) {
      if (!freq.has(tri)) freq.set(tri, new Map());
      const intentFreq = freq.get(tri)!;
      intentFreq.set(p.detected_intent, (intentFreq.get(p.detected_intent) || 0) + 1);
      totalPerIntent.set(p.detected_intent, (totalPerIntent.get(p.detected_intent) || 0) + 1);
    }
  }

  // Train from bootstrap corpus
  for (const entry of bootstrapCorpus) {
    const tokens = tokenize(entry.message);
    const trigrams = extractTrigrams(tokens);
    for (const tri of trigrams) {
      if (!freq.has(tri)) freq.set(tri, new Map());
      const intentFreq = freq.get(tri)!;
      // Bootstrap entries get 0.5 weight vs real data's 1.0
      intentFreq.set(entry.intent, (intentFreq.get(entry.intent) || 0) + 0.5);
      totalPerIntent.set(entry.intent, (totalPerIntent.get(entry.intent) || 0) + 0.5);
    }
  }

  return { freq, totalPerIntent };
}

function scoreWithNgram(tokens: string[], model: TrigramModel, intents: string[]): Record<string, number> {
  const scores: Record<string, number> = {};
  const trigrams = extractTrigrams(tokens);
  const numIntents = intents.length;

  for (const intent of intents) {
    let logProb = 0;
    let count = 0;
    for (const tri of trigrams) {
      const triFreq = model.freq.get(tri);
      const intentCount = triFreq?.get(intent) || 0;
      const total = model.totalPerIntent.get(intent) || 0;
      // Laplace smoothing
      const prob = (intentCount + 1) / (total + numIntents);
      logProb += Math.log(prob);
      count++;
    }
    if (count > 0) {
      const normalizedLogProb = logProb / count;
      scores[intent] = Math.exp(normalizedLogProb) * 5;
    }
  }
  return scores;
}

// ==================== WORD EMBEDDINGS ENGINE (Signal 10) ====================
const EMBEDDING_DIM = 32;

interface EmbeddingModel {
  vectors: Map<string, number[]>;
  centroids: Map<string, number[]>;
}

function buildCoOccurrenceMatrix(vocabulary: Record<string, string[]>, patterns: LearningLog[]): Map<string, Map<string, number>> {
  const coOccur = new Map<string, Map<string, number>>();
  
  // From semantic vocabulary (words in same intent co-occur)
  for (const terms of Object.values(vocabulary)) {
    for (let i = 0; i < terms.length; i++) {
      for (let j = i + 1; j < terms.length; j++) {
        const a = terms[i], b = terms[j];
        if (!coOccur.has(a)) coOccur.set(a, new Map());
        if (!coOccur.has(b)) coOccur.set(b, new Map());
        coOccur.get(a)!.set(b, (coOccur.get(a)!.get(b) || 0) + 1);
        coOccur.get(b)!.set(a, (coOccur.get(b)!.get(a) || 0) + 1);
      }
    }
  }

  // From learning logs
  const accepted = patterns.filter(p => p.user_accepted === true);
  for (const p of accepted) {
    const tokens = tokenize(p.user_message);
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < Math.min(i + 5, tokens.length); j++) {
        const a = tokens[i], b = tokens[j];
        if (!coOccur.has(a)) coOccur.set(a, new Map());
        if (!coOccur.has(b)) coOccur.set(b, new Map());
        coOccur.get(a)!.set(b, (coOccur.get(a)!.get(b) || 0) + 1);
        coOccur.get(b)!.set(a, (coOccur.get(b)!.get(a) || 0) + 1);
      }
    }
  }

  // From bootstrap corpus
  for (const entry of bootstrapCorpus) {
    const tokens = tokenize(entry.message);
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < Math.min(i + 5, tokens.length); j++) {
        const a = tokens[i], b = tokens[j];
        if (!coOccur.has(a)) coOccur.set(a, new Map());
        if (!coOccur.has(b)) coOccur.set(b, new Map());
        coOccur.get(a)!.set(b, (coOccur.get(a)!.get(b) || 0) + 0.5);
        coOccur.get(b)!.set(a, (coOccur.get(b)!.get(a) || 0) + 0.5);
      }
    }
  }

  return coOccur;
}

// Power iteration SVD approximation for dimensionality reduction
function powerIterationSVD(coOccur: Map<string, Map<string, number>>, dim: number): Map<string, number[]> {
  const words = Array.from(coOccur.keys());
  const wordIdx = new Map<string, number>();
  words.forEach((w, i) => wordIdx.set(w, i));
  const n = words.length;
  if (n === 0) return new Map();

  // Initialize random vectors
  const vectors = new Map<string, number[]>();
  for (const word of words) {
    const vec = Array.from({ length: dim }, () => (Math.random() - 0.5) * 0.1);
    vectors.set(word, vec);
  }

  // Power iteration (5 iterations for speed)
  for (let iter = 0; iter < 5; iter++) {
    for (const word of words) {
      const neighbors = coOccur.get(word);
      if (!neighbors) continue;
      const newVec = new Array(dim).fill(0);
      let totalWeight = 0;
      for (const [neighbor, weight] of neighbors) {
        const nVec = vectors.get(neighbor);
        if (nVec) {
          for (let d = 0; d < dim; d++) {
            newVec[d] += nVec[d] * weight;
          }
          totalWeight += weight;
        }
      }
      if (totalWeight > 0) {
        // Normalize
        let magnitude = 0;
        for (let d = 0; d < dim; d++) {
          newVec[d] /= totalWeight;
          magnitude += newVec[d] * newVec[d];
        }
        magnitude = Math.sqrt(magnitude) || 1;
        for (let d = 0; d < dim; d++) {
          newVec[d] /= magnitude;
        }
        vectors.set(word, newVec);
      }
    }
  }

  return vectors;
}

function buildEmbeddingModel(vocabulary: Record<string, string[]>, patterns: LearningLog[]): EmbeddingModel {
  const coOccur = buildCoOccurrenceMatrix(vocabulary, patterns);
  const vectors = powerIterationSVD(coOccur, EMBEDDING_DIM);

  // Compute centroids per intent
  const centroids = new Map<string, number[]>();
  for (const [intent, terms] of Object.entries(vocabulary)) {
    const centroid = new Array(EMBEDDING_DIM).fill(0);
    let count = 0;
    for (const term of terms) {
      const vec = vectors.get(term);
      if (vec) {
        for (let d = 0; d < EMBEDDING_DIM; d++) centroid[d] += vec[d];
        count++;
      }
    }
    if (count > 0) {
      for (let d = 0; d < EMBEDDING_DIM; d++) centroid[d] /= count;
      centroids.set(intent, centroid);
    }
  }

  return { vectors, centroids };
}

function vectorizeMessage(tokens: string[], model: EmbeddingModel): number[] {
  const vec = new Array(EMBEDDING_DIM).fill(0);
  let count = 0;
  for (const t of tokens) {
    const wv = model.vectors.get(t);
    if (wv) {
      for (let d = 0; d < EMBEDDING_DIM; d++) vec[d] += wv[d];
      count++;
    }
  }
  if (count > 0) {
    for (let d = 0; d < EMBEDDING_DIM; d++) vec[d] /= count;
  }
  return vec;
}

function cosineSimVec(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let d = 0; d < a.length; d++) {
    dot += a[d] * b[d];
    magA += a[d] * a[d];
    magB += b[d] * b[d];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function scoreWithEmbeddings(tokens: string[], model: EmbeddingModel): Record<string, number> {
  const scores: Record<string, number> = {};
  const msgVec = vectorizeMessage(tokens, model);
  for (const [intent, centroid] of model.centroids) {
    const sim = cosineSimVec(msgVec, centroid);
    if (sim > 0.05) {
      scores[intent] = sim * 7;
    }
  }
  return scores;
}

// ==================== MARKOV CHAIN PREDICTOR (Signal 11) ====================
const defaultTransitions: Record<string, Record<string, number>> = {
  restaurant: { modification: 0.35, page_add: 0.3, booking: 0.15, billing: 0.1 },
  ecommerce: { modification: 0.3, page_add: 0.25, inventory: 0.2, billing: 0.15 },
  fitness: { modification: 0.3, page_add: 0.25, booking: 0.2, billing: 0.1 },
  clinic: { modification: 0.25, page_add: 0.25, booking: 0.3, billing: 0.1 },
  hotel: { modification: 0.3, page_add: 0.25, booking: 0.25, billing: 0.1 },
  salon: { modification: 0.3, page_add: 0.2, booking: 0.3, billing: 0.1 },
  landing: { modification: 0.4, page_add: 0.3, ecommerce: 0.1, blog: 0.1 },
  portfolio: { modification: 0.4, page_add: 0.3, blog: 0.15 },
  billing: { modification: 0.35, page_add: 0.2, inventory: 0.2, crm: 0.15 },
  inventory: { modification: 0.3, page_add: 0.2, billing: 0.25, pos: 0.15 },
  crm: { modification: 0.3, page_add: 0.2, billing: 0.2, booking: 0.15 },
  pos: { modification: 0.35, page_add: 0.2, inventory: 0.25, billing: 0.15 },
};

function buildTransitionMatrix(conversationHistory?: { role: string; content: string }[]): Record<string, Record<string, number>> {
  // Start with defaults
  const matrix = JSON.parse(JSON.stringify(defaultTransitions)) as Record<string, Record<string, number>>;
  
  // If conversation history exists, learn from it
  if (conversationHistory && conversationHistory.length > 1) {
    // Extract intents from conversation (look for analysis messages)
    const mentionedIntents: string[] = [];
    for (const msg of conversationHistory) {
      if (msg.role === "system" && msg.content.includes("Análisis completado")) {
        for (const [intent, data] of Object.entries(intentMap)) {
          if (msg.content.includes(data.label)) {
            mentionedIntents.push(intent);
            break;
          }
        }
      }
    }
    
    // Learn transitions
    for (let i = 0; i < mentionedIntents.length - 1; i++) {
      const from = mentionedIntents[i];
      const to = mentionedIntents[i + 1];
      if (!matrix[from]) matrix[from] = {};
      matrix[from][to] = (matrix[from][to] || 0) + 0.2;
    }
  }
  
  return matrix;
}

function getMarkovBoost(previousIntent: string | undefined, candidateIntent: string, matrix: Record<string, Record<string, number>>): number {
  if (!previousIntent || !matrix[previousIntent]) return 0;
  return (matrix[previousIntent][candidateIntent] || 0) * 3;
}

// ==================== ENHANCED NER ====================
const styleColorMap: Record<string, string> = {
  profesional: "dark", corporativo: "dark", serio: "dark", formal: "dark",
  juvenil: "modern", joven: "modern", fresco: "modern", dinamico: "modern",
  minimalista: "cool", minimal: "cool", limpio: "cool", simple: "light",
  lujoso: "elegant", lujo: "elegant", premium: "elegant", exclusivo: "elegant",
  calido: "warm", acogedor: "warm", rustico: "warm", hogareño: "warm",
  moderno: "modern", contemporaneo: "modern", innovador: "modern", tech: "modern",
  divertido: "orange", alegre: "orange", colorido: "orange", vibrante: "pink",
  natural: "green", organico: "green", ecologico: "green", eco: "green",
  femenino: "pink", delicado: "pink", suave: "pink",
  clasico: "blue", tradicional: "blue", confiable: "blue",
};

function enhancedExtractEntities(text: string, tokens: string[], intent: string): { style?: string; phone?: string; schedule?: string; address?: string; tone?: string } {
  const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const extra: { style?: string; phone?: string; schedule?: string; address?: string; tone?: string } = {};

  // Detect style/tone
  for (const [style, color] of Object.entries(styleColorMap)) {
    if (lower.includes(style)) {
      extra.style = color;
      extra.tone = style;
      break;
    }
  }

  // Detect phone numbers
  const phoneMatch = text.match(/\b\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/);
  if (phoneMatch) extra.phone = phoneMatch[0];

  // Detect schedules
  const scheduleMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|hrs?)?\s*(?:a|al?|-)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|hrs?)?)/i);
  if (scheduleMatch) extra.schedule = scheduleMatch[1];

  // Detect addresses (simplified)
  const addressMatch = text.match(/(?:(?:calle|av(?:enida)?|blvd|col(?:onia)?|num(?:ero)?)\s+[A-Za-zÀ-ÿ0-9\s#.,]+)/i);
  if (addressMatch) extra.address = addressMatch[0].trim();

  return extra;
}

// ==================== CONFIDENCE CALIBRATION ====================
function calibrateConfidence(rawConfidence: number, intent: string, patterns: LearningLog[]): number {
  // Compute historical acceptance rate for this intent
  const intentLogs = patterns.filter(p => p.detected_intent === intent);
  if (intentLogs.length < 3) return rawConfidence; // Not enough data

  const accepted = intentLogs.filter(p => p.user_accepted === true).length;
  const acceptanceRate = accepted / intentLogs.length;

  // Isotonic-style calibration: adjust confidence based on historical accuracy
  // If we classify "restaurant" with 70% confidence but 95% of restaurant detections were accepted,
  // then the actual reliability is higher
  const calibrated = rawConfidence * (0.5 + 0.5 * acceptanceRate);

  // Also check: were low-confidence predictions often wrong?
  const lowConfLogs = intentLogs.filter(p => (p.confidence || 0) < 0.6);
  if (lowConfLogs.length > 2) {
    const lowConfAccepted = lowConfLogs.filter(p => p.user_accepted === true).length;
    const lowConfRate = lowConfAccepted / lowConfLogs.length;
    // If low-confidence predictions were still accurate, raise the floor
    if (lowConfRate > 0.7 && rawConfidence < 0.6) {
      return Math.max(calibrated, 0.65);
    }
  }

  // Clamp
  return Math.max(0.1, Math.min(calibrated * 1.1, 0.99));
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
async function classifyIntent(tokens: string[], originalText: string, patterns: LearningLog[], previousIntent?: string, conversationHistory?: { role: string; content: string }[]): Promise<IntentMatch> {
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

  // (Signal 8 removed - no external AI)

  // ---- SIGNAL 8.5: Weighted Learning (adaptive boosts) ----
  const weightedBoosts = computeWeightedBoosts(patterns);
  for (const [intent, boost] of Object.entries(weightedBoosts)) {
    if (scores[intent] !== undefined && boost > 0) {
      scores[intent] = scores[intent] * (1 + boost * 0.3);
    }
  }

  // ---- SIGNAL 9: N-gram Probabilistic Model ----
  const trigramModel = buildTrigramModel(patterns);
  const ngramScores = scoreWithNgram(tokens, trigramModel, Object.keys(intentMap));
  for (const [intent, nScore] of Object.entries(ngramScores)) {
    scores[intent] = (scores[intent] || 0) + nScore;
  }

  // ---- SIGNAL 10: Word Embeddings (replaces basic TF-IDF weight) ----
  const embeddingModel = buildEmbeddingModel(semanticVocabulary, patterns);
  const embeddingScores = scoreWithEmbeddings(expanded, embeddingModel);
  for (const [intent, eScore] of Object.entries(embeddingScores)) {
    scores[intent] = (scores[intent] || 0) + eScore;
  }

  // ---- SIGNAL 11: Markov Chain Contextual Prediction ----
  if (previousIntent) {
    const transMatrix = buildTransitionMatrix(conversationHistory);
    for (const intent of Object.keys(scores)) {
      const markovBoost = getMarkovBoost(previousIntent, intent, transMatrix);
      if (markovBoost > 0) {
        scores[intent] = (scores[intent] || 0) + markovBoost;
      }
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
  const absConfidence = Math.min(bestScore / 15, 1); // Raised denominator for more signals
  const gapConfidence = Math.min(gap / 8, 1);
  let confidence = Math.round(Math.min((absConfidence * 0.6 + gapConfidence * 0.4) * 1.1, 1) * 100) / 100;

  // Apply confidence calibration
  confidence = calibrateConfidence(confidence, bestIntent, patterns);

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
  requiresAuth: boolean;
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

  // Detect requiresAuth
  const authPatterns = [
    /con\s+(?:inicio\s+de\s+)?sesi[oó]n/i,
    /con\s+login/i,
    /con\s+autenticaci[oó]n/i,
    /con\s+registro\s+de\s+usuarios/i,
    /con\s+registro/i,
    /(?:inicio|iniciar)\s+(?:de\s+)?sesi[oó]n/i,
    /(?:login|signin|sign\s*in|log\s*in)/i,
    /(?:que\s+tenga|incluir|incluya)\s+(?:login|registro|autenticacion)/i,
  ];
  const requiresAuth = authPatterns.some(p => p.test(text));

  let businessName = "";
  const namePatterns = [
    // "se llama X", "llamado X"
    /(?:llamad[oa]|se llama|nombre(?:s)?)\s+["']?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,30}?)(?:\s+(?:con|y|que|para|donde|en)\b|$|["'])/i,
    // "para mi restaurante X con..."
    /(?:para|de)\s+(?:mi\s+)?(?:negocio|empresa|tienda|restaurante|cafeter[ií]a|caf[eé]|gym|gimnasio|agencia|estudio|salon|barberia|peluqueria|hotel|bufete|consultorio|clinica|veterinaria|academia|barveria|restorante)\s+["']?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{1,30}?)(?:\s+(?:con|y|que|para|donde|en)\b|$|["'])/i,
    // Generic "para [NOMBRE]" without industry restriction
    /(?:para)\s+["']?([A-ZÁÉÍÓÚÑÜ][A-Za-zÀ-ÿ\s]{1,30}?)(?:\s+(?:con|y|que|donde|en)\b|$|["'])/i,
    // Quoted names
    /["']([^"']{2,30})["']/,
    // Capitalized words after industry keywords
    /(?:restaurante|cafeteria|tienda|gym|gimnasio|hotel|salon|barberia|peluqueria|agencia|estudio|clinica|veterinaria|academia|bufete|empresa|negocio|barveria|restorante|bar|pizzeria|taqueria|bistro)\s+(?:de\s+)?(?:\w+\s+)?([A-ZÁÉÍÓÚÑÜ][A-Za-zÀ-ÿ\s]{1,30}?)(?:\s+(?:con|y|que|para|donde|en)\b|$)/,
    // Capitalized multi-word names
    /\b((?:[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+\s+){1,3}[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+)\b/,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const candidate = match[1].trim();
      const commonWords = new Set(["Quiero", "Necesito", "Hazme", "Para", "Como", "Tipo", "Algo", "Crear", "Sistema", "Pagina", "Sitio", "Web"]);
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

  // If requiresAuth detected, add auth and login sections
  if (requiresAuth) {
    sections.add("auth");
    sections.add("login");
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
    billing: ["features", "stats", "contact"],
    inventory: ["features", "stats"],
    crm: ["features", "stats", "contact"],
    pos: ["features", "stats"],
    booking: ["features", "pricing", "contact"],
    laundry: ["features", "pricing", "contact"],
    pharmacy: ["features", "pricing", "contact"],
    construction: ["features", "gallery", "about", "contact"],
    florist: ["features", "gallery", "pricing", "contact"],
    mechanic: ["features", "pricing", "contact", "faq"],
    printing: ["features", "pricing", "gallery", "contact"],
  };
  for (const s of (intentDefaults[intent] || ["features", "contact"])) sections.add(s);

  let colorScheme = "default";
  // Check explicit color mentions first
  for (const [word, scheme] of Object.entries(colorMap)) {
    if (lower.includes(word)) { colorScheme = scheme; break; }
  }
  // Then check style/tone mentions (enhanced NER)
  if (colorScheme === "default") {
    const enhancedData = enhancedExtractEntities(text, tokens, intent);
    if (enhancedData.style) colorScheme = enhancedData.style;
  }
  if (colorScheme === "default") {
    const intentColors: Record<string, string> = {
      restaurant: "warm", fitness: "green", agency: "modern", portfolio: "purple",
      ecommerce: "blue", blog: "cool", clinic: "blue", realestate: "elegant",
      education: "blue", veterinary: "green", hotel: "elegant", lawyer: "dark",
      accounting: "cool", photography: "dark", music: "purple", salon: "pink",
      technology: "modern", billing: "blue", inventory: "green", crm: "modern",
      pos: "dark", booking: "warm",
      laundry: "blue", pharmacy: "green", construction: "dark",
      florist: "pink", mechanic: "warm", printing: "cool",
    };
    colorScheme = intentColors[intent] || "purple";
  }

  return {
    businessName: businessName || getDefaultName(intent),
    sections: Array.from(sections),
    colorScheme,
    industry: intent,
    requiresAuth,
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
    billing: "Mi Facturación", inventory: "Mi Inventario", crm: "Mi CRM",
    pos: "Mi Punto de Venta", booking: "Mis Reservas",
    laundry: "Mi Lavandería", pharmacy: "Mi Farmacia", construction: "Mi Constructora",
    florist: "Mi Floristería", mechanic: "Mi Taller", printing: "Mi Imprenta",
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
  // Auth section is now rendered as a React component (AuthSection) in the JSX output
  // No need to push HTML here - it's handled in the React template below

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

  // Build complete HTML document with React 18 + Babel standalone
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  const hasAuth = sections.includes("auth") || sections.includes("login");

  // Convert HTML sections into React component functions
  const reactComponents: string[] = [];
  
  // Each section becomes a React component
  for (let i = 0; i < htmlSections.length; i++) {
    const sectionHtml = htmlSections[i]
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/onclick=/g, 'onClick=')
      .replace(/onsubmit=/g, 'onSubmit=')
      .replace(/onmouseover=/g, 'onMouseOver=')
      .replace(/onmouseout=/g, 'onMouseOut=')
      .replace(/onfocus=/g, 'onFocus=')
      .replace(/onblur=/g, 'onBlur=')
      .replace(/crossorigin/g, 'crossOrigin')
      .replace(/colspan=/g, 'colSpan=')
      .replace(/tabindex=/g, 'tabIndex=')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\{(\d+)\}/g, '{"$1"}');
    reactComponents.push(sectionHtml);
  }

  const allSectionsJSX = reactComponents.join("\n");

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
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
${hasAuth ? `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>` : ''}
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
<a href="#main-content" className="skip-link">Ir al contenido principal</a>
<div id="root"></div>

<script type="text/babel" data-presets="react,typescript">
const { useState, useEffect, useRef, useCallback } = React;

${hasAuth ? `
// Supabase Auth client
const supabaseClient = window.supabase.createClient('${supabaseUrl}', '${anonKey}');

function AuthSection() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage({ text: error.message, type: 'error' });
    else setMessage({ text: '¡Sesión iniciada correctamente!', type: 'success' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    const { error } = await supabaseClient.auth.signUp({
      email, password,
      options: { data: { display_name: name } }
    });
    setLoading(false);
    if (error) setMessage({ text: error.message, type: 'error' });
    else setMessage({ text: '¡Cuenta creada! Revisa tu email para confirmar.', type: 'success' });
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setMessage({ text: 'Sesión cerrada', type: 'success' });
  };

  if (user) {
    return (
      <section id="auth" className="section section-alt">
        <div className="container" style={{maxWidth:'480px',margin:'0 auto'}}>
          <div className="card" style={{padding:'2.5rem',textAlign:'center'}}>
            <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'var(--gradient)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',fontSize:'1.5rem',color:'#fff',fontWeight:700}}>
              {(user.email || '?')[0].toUpperCase()}
            </div>
            <h3 style={{marginBottom:'0.5rem'}}>¡Bienvenido!</h3>
            <p style={{color:'var(--text-muted)',fontSize:'0.9rem',marginBottom:'1.5rem'}}>{user.email}</p>
            <button className="btn btn-outline" onClick={handleLogout} style={{width:'100%',justifyContent:'center'}}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="auth" className="section section-alt">
      <div className="container" style={{maxWidth:'480px',margin:'0 auto'}}>
        <div className="section-header"><h2>Accede a tu cuenta</h2><p>Inicia sesión o regístrate para disfrutar de todos los beneficios</p></div>
        <div className="card" style={{padding:'2.5rem'}}>
          <div style={{display:'flex',gap:0,marginBottom:'1.5rem',borderRadius:'var(--radius-sm)',overflow:'hidden',border:'1px solid var(--border)'}}>
            <button onClick={() => setMode('login')} style={{flex:1,padding:'0.75rem',background:mode==='login'?'var(--primary)':'transparent',color:mode==='login'?'#fff':'var(--text-muted)',border:'none',cursor:'pointer',fontWeight:600,fontFamily:'var(--font-body)',fontSize:'0.9rem',transition:'all var(--transition)'}}>Iniciar Sesión</button>
            <button onClick={() => setMode('register')} style={{flex:1,padding:'0.75rem',background:mode==='register'?'var(--primary)':'transparent',color:mode==='register'?'#fff':'var(--text-muted)',border:'none',cursor:'pointer',fontWeight:600,fontFamily:'var(--font-body)',fontSize:'0.9rem',transition:'all var(--transition)'}}>Registrarse</button>
          </div>
          {message.text && (
            <div style={{padding:'0.75rem 1rem',borderRadius:'var(--radius-sm)',marginBottom:'1rem',fontSize:'0.85rem',background:message.type==='error'?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.15)',color:message.type==='error'?'#f87171':'#4ade80',border:\`1px solid \${message.type==='error'?'rgba(239,68,68,0.3)':'rgba(34,197,94,0.3)'}\`}}>
              {message.text}
            </div>
          )}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} data-real-submit="true" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div><label style={{fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'4px',display:'block'}}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required style={{width:'100%',padding:'0.75rem 1rem',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontSize:'0.95rem',fontFamily:'var(--font-body)'}}/></div>
              <div><label style={{fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'4px',display:'block'}}>Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{width:'100%',padding:'0.75rem 1rem',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontSize:'0.95rem',fontFamily:'var(--font-body)'}}/></div>
              <button className="btn" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:'0.5rem'}}>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} data-real-submit="true" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div><label style={{fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'4px',display:'block'}}>Nombre completo</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Juan Pérez" style={{width:'100%',padding:'0.75rem 1rem',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontSize:'0.95rem',fontFamily:'var(--font-body)'}}/></div>
              <div><label style={{fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'4px',display:'block'}}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required style={{width:'100%',padding:'0.75rem 1rem',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontSize:'0.95rem',fontFamily:'var(--font-body)'}}/></div>
              <div><label style={{fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'4px',display:'block'}}>Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required style={{width:'100%',padding:'0.75rem 1rem',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontSize:'0.95rem',fontFamily:'var(--font-body)'}}/></div>
              <button className="btn" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:'0.5rem'}}>{loading ? 'Creando...' : 'Crear Cuenta'}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
` : ''}

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: \`opacity 0.6s ease \${delay}s, transform 0.6s ease \${delay}s\`
    }}>
      {children}
    </div>
  );
}

function ScrollHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return null; // Header styling handled by CSS
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{position:'fixed',bottom:'2rem',right:'2rem',width:'44px',height:'44px',borderRadius:'50%',background:'var(--gradient)',color:'#fff',border:'none',cursor:'pointer',fontSize:'1.2rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--shadow-md)',zIndex:100}}>↑</button>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{cursor:'pointer'}} onClick={() => setOpen(!open)}>
      <div style={{fontWeight:600,fontSize:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
        {question}
        <span style={{color:'var(--primary-light)',fontSize:'1.2rem',transition:'transform 0.3s',transform:open?'rotate(45deg)':'none'}}>+</span>
      </div>
      {open && <p style={{color:'var(--text-muted)',marginTop:'1rem',lineHeight:1.7,fontSize:'0.95rem'}}>{answer}</p>}
    </div>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };
  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <input style={{padding:'0.9rem 1.25rem',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:'0.95rem',outline:'none'}} placeholder="Tu nombre" required/>
        <input style={{padding:'0.9rem 1.25rem',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:'0.95rem',outline:'none'}} type="email" placeholder="Tu email" required/>
      </div>
      <input style={{padding:'0.9rem 1.25rem',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:'0.95rem',outline:'none'}} placeholder="Asunto"/>
      <textarea style={{padding:'0.9rem 1.25rem',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:'0.95rem',outline:'none',minHeight:'140px',resize:'vertical'}} placeholder="Tu mensaje" required/>
      <button className="btn" type="submit" style={{width:'100%',justifyContent:'center'}}>{sent ? '✓ ¡Enviado!' : 'Enviar Mensaje →'}</button>
    </form>
  );
}

function App() {
  useEffect(() => {
    // Navbar scroll effect
    const handler = () => {
      const header = document.getElementById('site-header');
      if (header) {
        if (window.scrollY > 80) {
          header.style.background = 'var(--bg-card)';
          header.style.borderBottom = '1px solid var(--border)';
          header.style.backdropFilter = 'blur(12px)';
        } else {
          header.style.background = 'transparent';
          header.style.borderBottom = 'none';
          header.style.backdropFilter = 'none';
        }
      }
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div id="main-content">
      ${allSectionsJSX}
      ${hasAuth ? '<AuthSection />' : ''}
      <BackToTop />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
<\/script>
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

// ==================== CONTENT ENRICHMENT (No external AI) ====================
interface EnrichedContent {
  heroSubtitle?: string;
  featuresDescriptions?: string[];
  aboutText?: string;
  testimonials?: { name: string; text: string; role: string }[];
}

async function enrichContentWithLLM(intent: string, businessName: string): Promise<EnrichedContent> {
  // Local content enrichment based on industry and business name
  const heroSubtitles: Record<string, string[]> = {
    restaurant: [
      `En ${businessName} te ofrecemos una experiencia gastronómica única, con ingredientes frescos y recetas que enamoran.`,
      `Descubre los sabores auténticos de ${businessName}. Cocina artesanal preparada con pasión y dedicación.`,
      `Bienvenido a ${businessName}, donde cada platillo cuenta una historia y cada visita es memorable.`,
    ],
    ecommerce: [
      `${businessName} te trae los mejores productos con envío rápido y atención personalizada.`,
      `Explora nuestro catálogo en ${businessName}. Calidad, variedad y los mejores precios te esperan.`,
      `Compra con confianza en ${businessName}. Miles de clientes satisfechos nos respaldan.`,
    ],
    fitness: [
      `En ${businessName} transformamos tu cuerpo y tu vida con entrenamientos personalizados.`,
      `Únete a ${businessName} y alcanza tus metas fitness con nuestros programas profesionales.`,
    ],
    clinic: [
      `${businessName} — Atención médica integral con los más altos estándares de calidad y calidez humana.`,
      `Tu salud es nuestra prioridad. En ${businessName} contamos con profesionales de excelencia.`,
    ],
    agency: [
      `${businessName} transforma ideas en resultados. Estrategia digital que impulsa tu negocio.`,
      `Somos ${businessName}, tu aliado en marketing digital, diseño y desarrollo web de alto impacto.`,
    ],
    landing: [
      `${businessName} ofrece soluciones innovadoras para hacer crecer tu negocio en la era digital.`,
      `Descubre cómo ${businessName} puede transformar tu visión en realidad con tecnología de vanguardia.`,
    ],
    portfolio: [
      `Explora el trabajo creativo de ${businessName}. Cada proyecto refleja pasión por el diseño.`,
      `${businessName} — Diseño, desarrollo y creatividad al servicio de tus ideas.`,
    ],
    hotel: [
      `${businessName} te ofrece una estadía inolvidable con servicio de primera clase.`,
      `Descansa y disfruta en ${businessName}. Confort, elegancia y atención personalizada.`,
    ],
    salon: [
      `En ${businessName} resaltamos tu belleza natural con tratamientos profesionales.`,
      `Déjate consentir en ${businessName}. Estilo, tendencia y cuidado personal experto.`,
    ],
    billing: [
      `${businessName} simplifica tu facturación con herramientas intuitivas y seguras.`,
      `Gestiona facturas, clientes y cobros en un solo lugar con ${businessName}.`,
    ],
    crm: [
      `${businessName} te ayuda a gestionar tus clientes y cerrar más ventas con inteligencia.`,
      `Organiza contactos, oportunidades y seguimiento comercial con ${businessName}.`,
    ],
    inventory: [
      `Controla tu inventario en tiempo real con ${businessName}. Stock preciso, decisiones inteligentes.`,
    ],
  };

  const aboutTexts: Record<string, string[]> = {
    restaurant: [
      `${businessName} nació con la misión de ofrecer una experiencia culinaria excepcional. Nuestro equipo de chefs combina técnicas modernas con recetas tradicionales para crear platillos que deleitan todos los sentidos.`,
    ],
    ecommerce: [
      `En ${businessName} creemos que comprar en línea debe ser fácil, seguro y placentero. Desde nuestros inicios, nos hemos dedicado a ofrecer productos de calidad con un servicio al cliente excepcional.`,
    ],
    clinic: [
      `${businessName} es un centro de salud comprometido con la excelencia médica. Nuestro equipo de profesionales trabaja con tecnología de vanguardia para brindarte la mejor atención.`,
    ],
    agency: [
      `Somos ${businessName}, una agencia creativa que combina estrategia, diseño y tecnología para impulsar marcas hacia el éxito digital. Nuestro equipo multidisciplinario hace realidad las ideas más ambiciosas.`,
    ],
  };

  const subs = heroSubtitles[intent] || heroSubtitles.landing || [];
  const abouts = aboutTexts[intent] || aboutTexts.agency || [];

  return {
    heroSubtitle: subs[Math.floor(Math.random() * subs.length)],
    aboutText: abouts[Math.floor(Math.random() * abouts.length)],
  };
}

// (buildSystemPrompt and extractHtmlFromResponse removed - no external AI)

// ==================== MULTI-PAGE SYSTEM (Tab-based) ====================
interface PageDef { id: string; label: string; content: string; }

const pageRequestPatterns: { pattern: RegExp; pageType: string; label: string }[] = [
  // Tab/menu specific patterns - "quiero que crees una pestaña en el menu que diga clientes"
  { pattern: /(?:quiero|pon|agrega|crea|incluye|haz|anade|mete)\s+(?:que\s+)?(?:se\s+)?(?:cree[ns]?\s+)?(?:una?\s+)?(?:pestana|pestanas|tab|tabs|menu|opcion)\s+(?:(?:en\s+)?(?:el\s+)?(?:menu|navbar|barra)\s+)?(?:que\s+diga\s+|de\s+|para\s+|llamad[ao]\s+|con\s+(?:el\s+)?(?:nombre|titulo)\s+)?(?:de\s+)?(\w+)/i, pageType: "_dynamic_", label: "" },
  // "agrega X al menu" / "pon X en el menu"
  { pattern: /(?:agrega|pon|incluye|mete|anade)\s+(\w+)\s+(?:al|en\s+el)\s+(?:menu|navbar|barra|tabs|pestanas)/i, pageType: "_dynamic_", label: "" },
  // Direct page requests
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion|formulario)\s+(?:de\s+)?(?:login|inicio\s+de?\s*sesion|iniciar?\s*sesion)/i, pageType: "login", label: "Login" },
  { pattern: /(?:crea|haz|hazme|genera|agrega)\s+(?:un?\s+)?(?:login|inicio\s+de?\s*sesion)/i, pageType: "login", label: "Login" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion|formulario)\s+(?:de\s+)?(?:registro|registrar|sign\s*up|crear\s+cuenta)/i, pageType: "register", label: "Registro" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion|panel)\s+(?:de\s+)?(?:dashboard|panel|inicio|home|principal)/i, pageType: "dashboard", label: "Dashboard" },
  { pattern: /(?:crea|haz|hazme|genera|agrega)\s+(?:un?\s+)?(?:dashboard|panel\s+de\s+control)/i, pageType: "dashboard", label: "Dashboard" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion|tabla|lista)\s+(?:de\s+)?(?:clientes?|customers?)/i, pageType: "clients", label: "Clientes" },
  { pattern: /(?:crea|haz|hazme|genera|agrega)\s+(?:una?\s+)?(?:lista|tabla|vista)\s+(?:de\s+)?clientes/i, pageType: "clients", label: "Clientes" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion|tabla)\s+(?:de\s+)?(?:productos?|inventario|catalogo)/i, pageType: "products", label: "Productos" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion|tabla)\s+(?:de\s+)?(?:facturas?|facturacion|invoices?|cobros?|recibos?)/i, pageType: "invoices", label: "Facturas" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion|tabla)\s+(?:de\s+)?(?:pedidos?|ordenes?|orders?)/i, pageType: "orders", label: "Pedidos" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion)\s+(?:de\s+)?(?:configuracion|settings|ajustes|preferencias)/i, pageType: "settings", label: "Configuración" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion)\s+(?:de\s+)?(?:perfil|profile|mi\s+cuenta)/i, pageType: "profile", label: "Perfil" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion)\s+(?:de\s+)?(?:reportes?|informes?|reports?|estadisticas?|analytics)/i, pageType: "reports", label: "Reportes" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion|tabla)\s+(?:de\s+)?(?:usuarios?|users?|empleados?|personal|staff)/i, pageType: "users", label: "Usuarios" },
  { pattern: /(?:crea|haz|hazme|genera|agrega|pon|incluye|quiero)\s+(?:una?\s+)?(?:pagina|pantalla|vista|seccion)\s+(?:de\s+)?(?:calendario|agenda|citas?|appointments?|reservas?)/i, pageType: "calendar", label: "Calendario" },
];

// Dynamic word-to-pageType mapping for the _dynamic_ pattern
const dynamicPageTypeMap: Record<string, { pageType: string; label: string }> = {
  clientes: { pageType: "clients", label: "Clientes" },
  cliente: { pageType: "clients", label: "Clientes" },
  facturas: { pageType: "invoices", label: "Facturas" },
  factura: { pageType: "invoices", label: "Facturas" },
  facturacion: { pageType: "invoices", label: "Facturas" },
  dashboard: { pageType: "dashboard", label: "Dashboard" },
  panel: { pageType: "dashboard", label: "Dashboard" },
  inicio: { pageType: "dashboard", label: "Inicio" },
  productos: { pageType: "products", label: "Productos" },
  producto: { pageType: "products", label: "Productos" },
  inventario: { pageType: "products", label: "Inventario" },
  pedidos: { pageType: "orders", label: "Pedidos" },
  ordenes: { pageType: "orders", label: "Pedidos" },
  usuarios: { pageType: "users", label: "Usuarios" },
  empleados: { pageType: "users", label: "Empleados" },
  reportes: { pageType: "reports", label: "Reportes" },
  informes: { pageType: "reports", label: "Informes" },
  estadisticas: { pageType: "reports", label: "Estadísticas" },
  configuracion: { pageType: "settings", label: "Configuración" },
  ajustes: { pageType: "settings", label: "Ajustes" },
  perfil: { pageType: "profile", label: "Perfil" },
  cuenta: { pageType: "profile", label: "Mi Cuenta" },
  calendario: { pageType: "calendar", label: "Calendario" },
  agenda: { pageType: "calendar", label: "Agenda" },
  citas: { pageType: "calendar", label: "Citas" },
  reservas: { pageType: "calendar", label: "Reservas" },
  login: { pageType: "login", label: "Login" },
  registro: { pageType: "register", label: "Registro" },
  ventas: { pageType: "invoices", label: "Ventas" },
};

function detectPageRequest(message: string): { pageType: string; label: string } | null {
  const normalized = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const { pattern, pageType, label } of pageRequestPatterns) {
    const match = pattern.exec(normalized);
    if (match) {
      if (pageType === "_dynamic_" && match[1]) {
        const word = match[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const mapped = dynamicPageTypeMap[word];
        if (mapped) {
          console.log(`[PageRequest] Dynamic detected: "${word}" -> ${mapped.pageType} (${mapped.label})`);
          return mapped;
        }
        // If not mapped, create a generic page with the word as label
        console.log(`[PageRequest] Dynamic generic: "${word}"`);
        return { pageType: word, label: word.charAt(0).toUpperCase() + word.slice(1) };
      }
      console.log(`[PageRequest] Detected: ${pageType} (${label})`);
      return { pageType, label };
    }
  }
  return null;
}

function generatePageContent(pageType: string, c: ColorScheme, businessName: string): string {
  const pages: Record<string, string> = {
    login: `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg)"><div style="width:100%;max-width:420px;padding:2.5rem"><div style="text-align:center;margin-bottom:2rem"><h1 class="gradient-text" style="font-size:2rem;font-weight:800;margin-bottom:0.5rem">${businessName}</h1><p style="color:var(--text-muted)">Inicia sesión en tu cuenta</p></div><div class="card" style="padding:2rem"><form onsubmit="event.preventDefault();this.querySelector('button').textContent='Ingresando...';setTimeout(()=>{switchPage('dashboard');this.querySelector('button').textContent='Iniciar Sesión'},800)" style="display:flex;flex-direction:column;gap:1.2rem"><div><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">Email</label><input type="email" placeholder="tu@email.com" style="width:100%;padding:0.75rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;outline:none" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'"/></div><div><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">Contraseña</label><input type="password" placeholder="••••••••" style="width:100%;padding:0.75rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;outline:none" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'"/></div><div style="display:flex;justify-content:space-between;align-items:center"><label style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);cursor:pointer"><input type="checkbox" style="accent-color:var(--primary)"/>Recordarme</label><a href="#" style="font-size:0.85rem">¿Olvidaste?</a></div><button type="submit" class="btn" style="width:100%;justify-content:center">Iniciar Sesión</button></form><p style="text-align:center;margin-top:1.5rem;font-size:0.85rem;color:var(--text-muted)">¿No tienes cuenta? <a href="#" onclick="switchPage('register');return false" style="font-weight:600">Regístrate</a></p></div></div></div>`,
    register: `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg)"><div style="width:100%;max-width:420px;padding:2.5rem"><div style="text-align:center;margin-bottom:2rem"><h1 class="gradient-text" style="font-size:2rem;font-weight:800;margin-bottom:0.5rem">${businessName}</h1><p style="color:var(--text-muted)">Crea tu cuenta</p></div><div class="card" style="padding:2rem"><form onsubmit="event.preventDefault();this.querySelector('button').textContent='Creando...';setTimeout(()=>{switchPage('dashboard');this.querySelector('button').textContent='Crear Cuenta'},800)" style="display:flex;flex-direction:column;gap:1.2rem"><div><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">Nombre</label><input type="text" placeholder="Juan Pérez" style="width:100%;padding:0.75rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;outline:none" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'"/></div><div><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">Email</label><input type="email" placeholder="tu@email.com" style="width:100%;padding:0.75rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;outline:none" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'"/></div><div><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">Contraseña</label><input type="password" placeholder="Mínimo 8 caracteres" style="width:100%;padding:0.75rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.95rem;outline:none" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'"/></div><button type="submit" class="btn" style="width:100%;justify-content:center">Crear Cuenta</button></form><p style="text-align:center;margin-top:1.5rem;font-size:0.85rem;color:var(--text-muted)">¿Ya tienes cuenta? <a href="#" onclick="switchPage('login');return false" style="font-weight:600">Inicia sesión</a></p></div></div></div>`,
    dashboard: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><div><h1 style="font-size:1.8rem;font-weight:700">Dashboard</h1><p style="color:var(--text-muted);font-size:0.9rem">Bienvenido a ${businessName}</p></div><button class="btn" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Nuevo</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.2rem;margin-bottom:2rem"><div class="card" style="padding:1.5rem"><p style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">Ingresos</p><p style="font-size:2rem;font-weight:800" class="gradient-text">$24,580</p><p style="color:var(--primary-light);font-size:0.85rem;margin-top:0.3rem">↑ 12%</p></div><div class="card" style="padding:1.5rem"><p style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">Clientes</p><p style="font-size:2rem;font-weight:800" class="gradient-text">1,234</p><p style="color:var(--primary-light);font-size:0.85rem;margin-top:0.3rem">↑ 8%</p></div><div class="card" style="padding:1.5rem"><p style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">Pedidos</p><p style="font-size:2rem;font-weight:800" class="gradient-text">456</p><p style="color:var(--primary-light);font-size:0.85rem;margin-top:0.3rem">↑ 5%</p></div><div class="card" style="padding:1.5rem"><p style="color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">Conversión</p><p style="font-size:2rem;font-weight:800" class="gradient-text">3.2%</p><p style="color:var(--primary-light);font-size:0.85rem;margin-top:0.3rem">↑ 0.5%</p></div></div><div class="card" style="padding:1.5rem"><h3 style="margin-bottom:1rem">Actividad Reciente</h3><div style="display:flex;flex-direction:column;gap:0.8rem"><div style="display:flex;justify-content:space-between;align-items:center;padding:0.8rem;background:var(--bg-alt);border-radius:var(--radius-sm)"><div><p style="font-size:0.9rem;font-weight:500">Nuevo pedido #1234</p><p style="color:var(--text-muted);font-size:0.8rem">Hace 5 min</p></div><span style="color:var(--primary-light);font-weight:600">$320</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:0.8rem;background:var(--bg-alt);border-radius:var(--radius-sm)"><div><p style="font-size:0.9rem;font-weight:500">Cliente registrado</p><p style="color:var(--text-muted);font-size:0.8rem">Hace 12 min</p></div><span style="color:var(--accent);font-weight:600">María G.</span></div></div></div></div></div>`,
    clients: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Clientes</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('clients')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Agregar</button></div><div class="card" style="padding:0;overflow:hidden"><div style="padding:1rem 1.5rem;border-bottom:1px solid var(--border)"><input type="text" placeholder="Buscar clientes..." style="width:100%;padding:0.6rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'"/></div><table data-crud-table="clients" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Nombre</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Email</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Estado</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    products: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Productos</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('products')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Agregar</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="products" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Nombre</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Precio</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Stock</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    invoices: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Facturas</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('invoices')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Nueva</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="invoices" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Nº</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Cliente</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Fecha</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Estado</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="5" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    orders: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Pedidos</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('orders')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Nuevo</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="orders" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Pedido</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Cliente</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Estado</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    settings: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:800px;margin:0 auto"><h1 style="font-size:1.8rem;font-weight:700;margin-bottom:2rem">Configuración</h1><div class="card" style="padding:1.5rem;margin-bottom:1.2rem"><h3 style="margin-bottom:1rem">General</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"><div><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">Empresa</label><input type="text" value="${businessName}" style="width:100%;padding:0.65rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none"/></div><div><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">Email</label><input type="email" value="info@empresa.com" style="width:100%;padding:0.65rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none"/></div></div></div><button class="btn" style="width:100%;justify-content:center">Guardar</button></div></div>`,
    profile: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:800px;margin:0 auto"><h1 style="font-size:1.8rem;font-weight:700;margin-bottom:2rem">Mi Perfil</h1><div class="card" style="padding:2rem;text-align:center;margin-bottom:1.2rem"><div style="width:80px;height:80px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:#fff;margin:0 auto 1rem">JD</div><h2 style="font-size:1.3rem;margin-bottom:0.3rem">Juan Dev</h2><p style="color:var(--text-muted)">Administrador</p></div><div class="card" style="padding:1.5rem"><h3 style="margin-bottom:1rem">Datos</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"><div><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">Nombre</label><input type="text" value="Juan Dev" style="width:100%;padding:0.65rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none"/></div><div><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">Email</label><input type="email" value="juan@email.com" style="width:100%;padding:0.65rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none"/></div></div><button class="btn" style="width:100%;justify-content:center;margin-top:1.5rem">Actualizar</button></div></div></div>`,
    reports: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><h1 style="font-size:1.8rem;font-weight:700;margin-bottom:2rem">Reportes</h1><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.2rem;margin-bottom:2rem"><div class="card" style="padding:1.5rem"><h3 style="font-size:1rem;margin-bottom:0.5rem">Ventas del Mes</h3><p style="font-size:2.5rem;font-weight:800" class="gradient-text">$45,230</p><p style="color:var(--primary-light);font-size:0.85rem">↑ 18%</p></div><div class="card" style="padding:1.5rem"><h3 style="font-size:1rem;margin-bottom:0.5rem">Ticket Promedio</h3><p style="font-size:2.5rem;font-weight:800" class="gradient-text">$125</p><p style="color:var(--primary-light);font-size:0.85rem">↑ 5%</p></div><div class="card" style="padding:1.5rem"><h3 style="font-size:1rem;margin-bottom:0.5rem">Clientes Nuevos</h3><p style="font-size:2.5rem;font-weight:800" class="gradient-text">89</p><p style="color:var(--primary-light);font-size:0.85rem">↑ 23%</p></div></div></div></div>`,
    users: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Usuarios</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('users')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Nuevo</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="users" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Usuario</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Email</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Rol</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    calendar: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1000px;margin:0 auto"><h1 style="font-size:1.8rem;font-weight:700;margin-bottom:2rem">Calendario</h1><div class="card" style="padding:1.5rem"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem"><button class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.85rem">← Ant</button><h3>Enero 2024</h3><button class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.85rem">Sig →</button></div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center">${["L","M","X","J","V","S","D"].map(d=>`<div style="padding:0.5rem;font-size:0.78rem;font-weight:600;color:var(--text-muted)">${d}</div>`).join("")}${Array.from({length:31},(_,i)=>`<div style="padding:0.7rem;border-radius:var(--radius-sm);cursor:pointer;${[5,12,18].includes(i+1)?"background:color-mix(in srgb,var(--primary) 20%,transparent);color:var(--primary-light);font-weight:600":""}">${i+1}</div>`).join("")}</div></div></div></div>`,
    // Additional pages for specific intents
    contacts: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Contactos</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('contacts')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Agregar</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="contacts" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Nombre</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Email</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Teléfono</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    deals: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Oportunidades</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('deals')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Nueva</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="deals" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Nombre</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Valor</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Etapa</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    members: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Miembros</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('members')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Agregar</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="members" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Nombre</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Email</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Plan</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    reservations: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Reservaciones</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('reservations')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Nueva</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="reservations" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Cliente</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Fecha</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Estado</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    appointments: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Citas</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('appointments')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Nueva</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="appointments" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Paciente</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Doctor</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Fecha</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
    services: `<div style="padding:2rem;background:var(--bg);min-height:100vh"><div style="max-width:1200px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:700">Servicios</h1><button class="btn" onclick="DOKU_CRUD.showAddForm('services')" style="padding:0.6rem 1.5rem;font-size:0.85rem">+ Agregar</button></div><div class="card" style="padding:0;overflow:hidden"><table data-crud-table="services" style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Nombre</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Precio</th><th style="text-align:left;padding:0.8rem 1rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Duración</th><th style="text-align:right;padding:0.8rem 1.5rem;color:var(--text-muted);font-size:0.78rem;text-transform:uppercase">Acciones</th></tr></thead><tbody><tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</td></tr></tbody></table></div></div></div>`,
  };
  return pages[pageType] || `<div style="padding:2rem;background:var(--bg);min-height:100vh"><h1 style="font-size:1.8rem;font-weight:700">${pageType}</h1></div>`;
}

// ==================== CRUD SDK INJECTION ====================
function getCrudSdkScript(businessName: string): string {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  
  return `<script>
(function(){
  var API_URL='${supabaseUrl}/functions/v1/crud-api';
  var API_KEY='${anonKey}';
  var PROJECT_ID=null;
  try{var p=new URLSearchParams(window.location.search);PROJECT_ID=p.get('projectId')}catch(e){}
  window.addEventListener('message',function(e){if(e.data&&e.data.type==='doku:projectId'){PROJECT_ID=e.data.projectId;console.log('[CRUD] Project ID:',PROJECT_ID);autoLoadTables()}});
  if(window.parent!==window)window.parent.postMessage({type:'doku:requestProjectId'},'*');

  function apiCall(body){body.projectId=PROJECT_ID;return fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':API_KEY,'Authorization':'Bearer '+API_KEY},body:JSON.stringify(body)}).then(function(r){return r.json()})}

  function renderRows(container,rows,cols){
    var tb=container.querySelector('tbody');if(!tb)return;
    if(!rows||!rows.length){tb.innerHTML='<tr><td colspan="10" style="padding:2rem;text-align:center;color:var(--text-muted)">No hay datos. Clic en "+ Agregar" para crear.</td></tr>';return}
    var ks=cols?cols.map(function(c){return c.name||c}):Object.keys(rows[0].data||{});
    tb.innerHTML=rows.map(function(r){var d=r.data||{};return '<tr style="border-bottom:1px solid var(--border)" onmouseover="this.style.background=\\'var(--bg-alt)\\'" onmouseout="this.style.background=\\'transparent\\'">'+ks.map(function(k){return '<td style="padding:0.8rem 1rem">'+(d[k]!=null?d[k]:'')+'</td>'}).join('')+'<td style="padding:0.8rem 1rem;text-align:right"><button onclick="DOKU_CRUD.showEditForm(\\''+r.id+'\\',\\''+container.getAttribute('data-crud-table')+'\\')" style="background:none;border:none;color:var(--primary-light);cursor:pointer;margin-right:0.5rem" title="Editar">✏️</button><button onclick="DOKU_CRUD.deleteRow(\\''+r.id+'\\')" style="background:none;border:none;color:#ef4444;cursor:pointer" title="Eliminar">🗑️</button></td></tr>'}).join('')}

  function autoLoadTables(){
    if(!PROJECT_ID)return;
    document.querySelectorAll('[data-crud-table]').forEach(function(tbl){
      var tn=tbl.getAttribute('data-crud-table');
      apiCall({action:'get_columns',tableName:tn}).then(function(cr){
        apiCall({action:'read',tableName:tn}).then(function(r){
          if(r.rows)renderRows(tbl,r.rows,cr.columns)
        })
      }).catch(function(e){console.warn('[CRUD] Auto-load error for '+tn+':',e)})
    })
  }

  window.DOKU_CRUD={
    setProjectId:function(id){PROJECT_ID=id},
    read:function(t){return apiCall({action:'read',tableName:t})},
    create:function(t,d){return apiCall({action:'create',tableName:t,data:d})},
    update:function(rid,d){return apiCall({action:'update',rowId:rid,data:d})},
    deleteRow:function(rid){if(!confirm('¿Eliminar este registro?'))return;apiCall({action:'delete',rowId:rid}).then(function(){autoLoadTables();DOKU_CRUD.notify('✅ Registro eliminado')}).catch(function(e){DOKU_CRUD.notify('❌ Error: '+e,'error')})},
    showAddForm:function(t){
      if(!PROJECT_ID){DOKU_CRUD.notify('⚠️ Proyecto no conectado','error');return}
      var m=document.getElementById('doku-modal');if(m)m.remove();
      apiCall({action:'get_columns',tableName:t}).then(function(r){
        var cols=r.columns||[];
        var fields=cols.map(function(c){var it=c.column_type==='email'?'email':c.column_type==='number'?'number':c.column_type==='date'?'date':'text';return '<div style="margin-bottom:1rem"><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">'+c.name.replace(/_/g,' ')+(c.is_required?' *':'')+'</label><input type="'+it+'" name="'+c.name+'" '+(c.is_required?'required':'')+' style="width:100%;padding:0.65rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none;font-family:var(--font-body)"/></div>'}).join('');
        var html='<div id="doku-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px)" onclick="if(event.target===this)this.remove()"><div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:2rem;width:100%;max-width:480px;max-height:80vh;overflow-y:auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem"><h2 style="font-size:1.2rem;font-weight:700">Agregar '+t.replace(/_/g,' ')+'</h2><button onclick="document.getElementById(\\'doku-modal\\').remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem">✕</button></div><form id="doku-add-form" onsubmit="event.preventDefault();DOKU_CRUD.submitForm(\\''+t+'\\')">'+fields+'<button type="submit" class="btn" style="width:100%;justify-content:center;margin-top:0.5rem">Guardar</button></form></div></div>';
        document.body.insertAdjacentHTML('beforeend',html)
      }).catch(function(e){DOKU_CRUD.notify('❌ No se pudo cargar el formulario','error')})
    },
    showEditForm:function(rowId,tableName){
      if(!PROJECT_ID)return;
      var m=document.getElementById('doku-modal');if(m)m.remove();
      Promise.all([
        apiCall({action:'get_columns',tableName:tableName}),
        apiCall({action:'read',tableName:tableName})
      ]).then(function(results){
        var cols=results[0].columns||[];
        var rows=results[1].rows||[];
        var row=rows.find(function(r){return r.id===rowId});
        if(!row){DOKU_CRUD.notify('❌ Registro no encontrado','error');return}
        var d=row.data||{};
        var fields=cols.map(function(c){var it=c.column_type==='email'?'email':c.column_type==='number'?'number':c.column_type==='date'?'date':'text';var val=d[c.name]!=null?d[c.name]:'';return '<div style="margin-bottom:1rem"><label style="display:block;font-size:0.85rem;font-weight:500;margin-bottom:0.4rem">'+c.name.replace(/_/g,' ')+'</label><input type="'+it+'" name="'+c.name+'" value="'+String(val).replace(/"/g,'&quot;')+'" style="width:100%;padding:0.65rem 1rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:0.9rem;outline:none;font-family:var(--font-body)"/></div>'}).join('');
        var html='<div id="doku-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px)" onclick="if(event.target===this)this.remove()"><div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:2rem;width:100%;max-width:480px;max-height:80vh;overflow-y:auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem"><h2 style="font-size:1.2rem;font-weight:700">Editar registro</h2><button onclick="document.getElementById(\\'doku-modal\\').remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem">✕</button></div><form id="doku-add-form" onsubmit="event.preventDefault();DOKU_CRUD.submitEditForm(\\''+rowId+'\\')">'+fields+'<button type="submit" class="btn" style="width:100%;justify-content:center;margin-top:0.5rem">Actualizar</button></form></div></div>';
        document.body.insertAdjacentHTML('beforeend',html)
      })
    },
    submitForm:function(t){
      var f=document.getElementById('doku-add-form');if(!f)return;
      var d={};f.querySelectorAll('input').forEach(function(i){if(i.value)d[i.name]=i.value});
      var b=f.querySelector('button[type=submit]');b.textContent='Guardando...';b.disabled=true;
      DOKU_CRUD.create(t,d).then(function(){document.getElementById('doku-modal').remove();autoLoadTables();DOKU_CRUD.notify('✅ Registro creado')}).catch(function(e){b.textContent='Guardar';b.disabled=false;DOKU_CRUD.notify('❌ Error: '+e,'error')})
    },
    submitEditForm:function(rowId){
      var f=document.getElementById('doku-add-form');if(!f)return;
      var d={};f.querySelectorAll('input').forEach(function(i){d[i.name]=i.value});
      var b=f.querySelector('button[type=submit]');b.textContent='Actualizando...';b.disabled=true;
      DOKU_CRUD.update(rowId,d).then(function(){document.getElementById('doku-modal').remove();autoLoadTables();DOKU_CRUD.notify('✅ Registro actualizado')}).catch(function(e){b.textContent='Actualizar';b.disabled=false;DOKU_CRUD.notify('❌ Error: '+e,'error')})
    },
    notify:function(msg,type){var t=document.createElement('div');t.style.cssText='position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);padding:0.8rem 1.5rem;background:'+(type==='error'?'#ef4444':'var(--primary)')+';color:#fff;border-radius:var(--radius-sm);font-size:0.9rem;font-weight:500;z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.3)';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},3000)},
    onPageSwitch:function(pid){autoLoadTables()}
  };

  document.addEventListener('DOMContentLoaded',function(){setTimeout(autoLoadTables,500)});
  console.log('[CRUD] SDK v2 loaded');
})();
<` + `/script>`;
}

function parseExistingPages(html: string): PageDef[] {
  const pages: PageDef[] = [];
  const regex = /<!-- PAGE:(\w+):(.+?) -->\s*<div[^>]*class="page-content"[^>]*>([\s\S]*?)<\/div>\s*<!-- \/PAGE:\1 -->/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    pages.push({ id: match[1], label: match[2], content: match[3].trim() });
  }
  return pages;
}

function composeMultiPageHtml(pages: PageDef[], colors: ColorScheme, businessName: string): string {
  const c = colors;
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";

  // Convert page contents: class -> className etc.
  const pagesJson = JSON.stringify(pages.map(p => ({
    id: p.id,
    label: p.label,
  })));

  const pageContentDivs = pages.map((p, i) => {
    const converted = p.content
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/onclick=/g, 'onClick=')
      .replace(/onsubmit=/g, 'onSubmit=')
      .replace(/onmouseover=/g, 'onMouseOver=')
      .replace(/onmouseout=/g, 'onMouseOut=')
      .replace(/onfocus=/g, 'onFocus=')
      .replace(/onblur=/g, 'onBlur=')
      .replace(/crossorigin/g, 'crossOrigin')
      .replace(/colspan=/g, 'colSpan=')
      .replace(/tabindex=/g, 'tabIndex=')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\{(\d+)\}/g, '{"$1"}');
    return `{activePage === '${p.id}' && (
        <div>
          ${converted}
        </div>
      )}`;
  }).join("\n      ");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${businessName} — Sistema</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--font-body:'Inter',system-ui,sans-serif;--primary:${c.primary};--primary-light:${c.primaryLight};--primary-dark:${c.primaryDark};--bg:${c.bg};--bg-alt:${c.bgAlt};--bg-card:${c.bgCard};--text:${c.text};--text-muted:${c.textMuted};--border:${c.border};--accent:${c.accent};--gradient:${c.gradient};--gradient-subtle:${c.gradientSubtle};--radius:16px;--radius-sm:10px;--shadow-md:0 8px 24px -4px rgba(0,0,0,0.4);--transition:0.3s cubic-bezier(0.4,0,0.2,1)}
html{-webkit-font-smoothing:antialiased}
body{font-family:var(--font-body);background:var(--bg);color:var(--text);line-height:1.6;font-size:0.95rem}
a{color:var(--primary-light);text-decoration:none;transition:color var(--transition)}
.gradient-text{background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.8rem;background:var(--gradient);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:0.9rem;font-weight:600;cursor:pointer;transition:transform var(--transition),box-shadow var(--transition);box-shadow:0 4px 15px -3px color-mix(in srgb,var(--primary) 40%,transparent)}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px -4px color-mix(in srgb,var(--primary) 50%,transparent)}
.btn-outline{background:transparent;border:1.5px solid var(--border);color:var(--text);box-shadow:none}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;transition:border-color var(--transition)}
.card:hover{border-color:color-mix(in srgb,var(--primary) 30%,var(--border))}
.tab-bar{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:0.5rem;padding:0.8rem 1.5rem;background:var(--bg-card);border-bottom:1px solid var(--border);overflow-x:auto;backdrop-filter:blur(12px)}
.tab-bar .logo{font-weight:700;font-size:1.1rem;margin-right:1.5rem;flex-shrink:0}
@media(max-width:768px){.tab-bar{padding:0.6rem 0.8rem;gap:0.3rem;flex-wrap:wrap}}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-presets="react,typescript">
const { useState, useEffect } = React;

const pages = ${pagesJson};

function App() {
  const [activePage, setActivePage] = useState(pages[0]?.id || 'home');

  return (
    <div>
      <nav className="tab-bar">
        <span className="logo gradient-text">${businessName}</span>
        <div style={{display:'flex',gap:'0.4rem',overflowX:'auto'}}>
          {pages.map(p => (
            <button key={p.id} onClick={() => setActivePage(p.id)} style={{
              padding:'0.6rem 1.2rem',fontSize:'0.85rem',fontWeight:500,border:'none',
              background: activePage===p.id ? 'var(--primary)' : 'transparent',
              color: activePage===p.id ? '#fff' : 'var(--text-muted)',
              borderRadius:'var(--radius-sm)',cursor:'pointer',transition:'all var(--transition)',whiteSpace:'nowrap'
            }}>{p.label}</button>
          ))}
        </div>
      </nav>
      <main>
        ${pageContentDivs}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
<\/script>
${getCrudSdkScript(businessName)}
</body>
</html>`;
}

// ==================== ANTI-PATTERN GATE ====================
// Words that should NEVER trigger generation when message consists only of them
const greetingOnlyTokens = new Set([
  "hola", "hey", "oye", "buenas", "buenos", "dias", "dia", "tardes", "tarde", "noches", "noche",
  "saludos", "que", "tal", "onda", "como", "estas", "esta", "estan", "bien", "mal",
  "adios", "bye", "chao", "nos", "vemos", "hasta", "luego", "pronto",
  "gracias", "gracia", "thanks", "ok", "vale", "listo", "entendido", "perfecto", "genial", "excelente",
  "estoy", "todo", "si", "claro", "sip", "sep", "aja", "ajam",
  "quien", "eres", "puedes", "hacer", "haces", "sabes", "funcionas", "sirves",
]);

function isGreetingOnly(message: string): boolean {
  const normalized = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").trim();
  const words = normalized.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return true;
  if (words.length > 8) return false; // Long messages are likely not just greetings
  const semanticTokens = words.filter(w => !greetingOnlyTokens.has(w));
  // If ALL tokens are greeting-only OR less than 2 semantic tokens, it's conversational
  return semanticTokens.length < 2;
}

// ==================== CONVERSATIONAL DETECTION ====================
const conversationalPatterns = [
  /(?:no\s+(?:se\s+)?(?:muestra|carga|ve|aparece|funciona|renderiza))/i,
  /(?:por\s*que|porque)\s+(?:no|el|la|se)/i,
  /(?:revisa|revisar|checa|checar|verifica|verificar)\s/i,
  /(?:ayuda|help|problema|error|bug|falla)/i,
  /(?:como\s+(?:hago|uso|funciona|puedo))/i,
  // FIXED: Match greetings at START of message, not end
  /^(?:hola|hey|oye|buenas?|buenos?\s+dias?|buenas?\s+(?:tardes?|noches?)|que\s+tal|que\s+onda|saludos)\b/i,
  /(?:gracias|thanks|ok|vale|listo|entendido)\s*[!?.]*$/i,
  /(?:que\s+(?:es|hace|puedo|significa))/i,
  /(?:no\s+(?:entiendo|se|puedo))/i,
  /(?:screenshot|captura|pantallazo)/i,
  // NEW: Farewells
  /^(?:adios|bye|nos\s+vemos|hasta\s+luego|chao|chau)\b/i,
  // NEW: Identity questions
  /^(?:quien|que)\s+eres/i,
  // NEW: Status/emotion responses
  /^(?:estoy\s+bien|todo\s+bien|genial|perfecto|excelente)\s*[!?.]*$/i,
];

const generationKeywords = [
  "landing", "restaurante", "cafeteria", "cafe", "tienda", "ecommerce", "portfolio",
  "blog", "dashboard", "gimnasio", "gym", "agencia", "clinica", "inmobiliaria",
  "hotel", "abogado", "contador", "fotografo", "musica", "salon", "peluqueria",
  "barberia", "veterinaria", "escuela", "academia", "pagina", "sitio", "web",
  "crea", "crear", "hazme", "genera", "quiero", "necesito", "diseña",
  // New industries
  "lavanderia", "tintoreria", "farmacia", "drogueria", "constructora", "arquitecto",
  "floristeria", "floreria", "flores", "taller", "mecanico", "imprenta", "impresion",
];

function isConversational(message: string): string | null {
  const normalized = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // ANTI-PATTERN GATE: If message is just greetings/emotions, skip classifier entirely
  if (isGreetingOnly(message)) {
    console.log(`[AntiPattern] Message is greeting-only: "${message.substring(0, 50)}"`);
    // Determine specific response type
    if (/^(?:adios|bye|nos\s+vemos|hasta\s+luego|chao|chau)/i.test(normalized)) {
      return "👋 ¡Hasta luego! Fue un placer ayudarte. Cuando necesites crear o modificar un sitio web, aquí estaré. ¡Éxito!";
    }
    if (/(?:quien|que)\s+eres/i.test(normalized)) {
      return "🤖 Soy **DOKU AI**, un motor de inteligencia artificial 100% propio que clasifica tu mensaje y genera sitios web completos con React y base de datos.\n\n**Sin APIs externas.** Todo el procesamiento ocurre en mi motor local con:\n• 11 señales de clasificación\n• Embeddings propios de 32 dimensiones\n• Modelo n-gram probabilístico\n• Cadena de Markov predictiva\n• 30+ industrias soportadas\n\n¿Qué tipo de sitio quieres crear?";
    }
    if (/(?:gracias|thanks)/i.test(normalized)) {
      return "¡De nada! 😊 Si necesitas algo más, solo dime. Puedo:\n\n• 🆕 Crear un nuevo sitio web\n• ✏️ Modificar el sitio actual\n• 📄 Agregar nuevas páginas\n• 🎨 Cambiar colores y estilos\n\n¿En qué más te puedo ayudar?";
    }
    if (/^(?:estoy\s+bien|todo\s+bien|genial|perfecto|excelente|ok|vale|listo|entendido|si|claro)/i.test(normalized)) {
      return "¡Genial! 😄 ¿Listo para crear algo increíble? Dime qué tipo de sitio necesitas:\n\n• 🍽️ Restaurante, cafetería, food truck\n• 🛒 Tienda online, marketplace\n• 💼 Portfolio, agencia, landing\n• 🏥 Clínica, farmacia, veterinaria\n• 💰 Facturación, inventario, CRM, POS\n• 🧺 Lavandería, taller mecánico, imprenta, floristería\n• Y más...";
    }
    // Default greeting
    return "¡Hola! 👋 Soy **DOKU AI**, tu asistente para crear sitios web profesionales.\n\n¿Qué quieres crear hoy? Puedo hacer:\n• 🍽️ Restaurantes, cafeterías\n• 🛒 Tiendas online\n• 💼 Portfolios, agencias\n• 🏥 Clínicas, consultorios, farmacias\n• 💰 Facturación, inventario, CRM\n• 🧺 Lavanderías, talleres, imprentas, floristerías\n• 🏨 Hoteles, inmobiliarias\n• Y mucho más...\n\nSolo descríbeme tu negocio y lo creo al instante.";
  }

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
  if (/(?:hola|hey|buenas?|buenos?\s+dias?|buenas?\s+(?:tardes?|noches?)|que\s+tal|que\s+onda|saludos)/i.test(normalized)) {
    return "¡Hola! 👋 Soy **DOKU AI**, tu asistente para crear sitios web profesionales.\n\nDime qué quieres crear, por ejemplo:\n• *\"Quiero una landing para mi cafetería El Buen Café\"*\n• *\"Crea un portfolio con galería y contacto\"*\n• *\"Hazme una tienda online de ropa\"*\n• *\"Lavandería con sistema de entregas\"*";
  }
  if (/(?:gracias|thanks|ok|vale|listo|entendido)/i.test(normalized)) {
    return "¡De nada! 😊 Si necesitas algo más, solo dime. Puedo:\n\n• Crear un nuevo sitio\n• Modificar el sitio actual (colores, secciones, contenido)\n• Cambiar el nombre del negocio\n\n¿En qué más te puedo ayudar?";
  }
  if (/(?:como\s+(?:hago|uso|funciona|puedo))/i.test(normalized)) {
    return "📖 **¿Cómo usar DOKU AI?**\n\n1. **Describe** el sitio que quieres (tipo, nombre, secciones)\n2. **Revisa** el análisis y plan de ejecución\n3. **Confirma** o pide ajustes\n4. ¡**Listo**! Tu sitio aparece en el preview\n\n**Ejemplo:** *\"Quiero un restaurante llamado La Casa del Chef con menú, galería y contacto en colores cálidos\"*";
  }
  if (/(?:que\s+(?:puedes|sabes|haces)|que\s+es\s+doku|para\s+que\s+sirve)/i.test(normalized)) {
    return "🚀 **DOKU AI** es un generador inteligente de sitios web con motor de IA propio.\n\nPuedo crear:\n• 🍽️ Restaurantes, cafeterías\n• 🛒 Tiendas online\n• 💼 Portfolios, agencias\n• 🏥 Clínicas, farmacias, consultorios\n• 💰 Facturación, inventarios, CRM, POS\n• 🧺 Lavanderías, talleres mecánicos\n• 💐 Floristerías, imprentas\n• 🏨 Hoteles, inmobiliarias\n• 🏗️ Constructoras\n• Y mucho más...\n\nSolo dime qué necesitas y lo creo para ti.";
  }
  if (/(?:puedes\s+(?:crear|hacer|generar)|eres\s+capaz|que\s+tipo)/i.test(normalized)) {
    return "💪 ¡Puedo crear prácticamente cualquier tipo de sitio web!\n\nDime el **tipo de negocio**, el **nombre** y las **secciones** que quieres, y DOKU AI lo genera automáticamente.\n\nEjemplo: *\"Sistema de facturación con login para mi empresa TechCo\"*";
  }
  if (/^(?:adios|bye|nos\s+vemos|hasta\s+luego|chao|chau)/i.test(normalized)) {
    return "👋 ¡Hasta luego! Fue un placer ayudarte. Cuando necesites crear o modificar un sitio web, aquí estaré. ¡Éxito!";
  }
  return "🤔 No estoy seguro de qué necesitas. Soy un generador de sitios web.\n\nPara crear un sitio, descríbeme:\n• **Tipo** (restaurante, tienda, portfolio, blog, lavandería, farmacia...)\n• **Nombre** del negocio\n• **Secciones** que quieres (menú, contacto, galería...)\n\n**Ejemplo:** *\"Crea una landing para mi agencia digital TechFlow\"*";
}

// ==================== MAIN HANDLER ====================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { message, mode, action, logId, accepted, feedback, previousIntent, previousEntities, projectId, conversationHistory, ollamaModel, confidenceThreshold: userThreshold } = body;

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

    // ---- PAGE REQUEST DETECTION (multi-page incremental) ----
    const pageRequest = detectPageRequest(message);
    if (pageRequest && projectId) {
      console.log(`[MultiPage] Page request detected: ${pageRequest.pageType} for project ${projectId}`);
      try {
        const sb = getSupabaseClient();
        const { data: projectData } = await sb.from("projects").select("html, entities").eq("id", projectId).single();
        
        // Load entity memory for colors
        const mem = await loadEntityMemory(projectId);
        const colorScheme = mem?.color_scheme || "purple";
        const businessName = mem?.business_name || "Mi Proyecto";
        const c = getColors(colorScheme);
        
        // Parse existing pages from current HTML
        let existingPages: PageDef[] = [];
        if (projectData?.html && projectData.html.includes("<!-- PAGE:")) {
          existingPages = parseExistingPages(projectData.html);
          console.log(`[MultiPage] Found ${existingPages.length} existing pages`);
        } else if (projectData?.html && projectData.html.length > 200) {
          // Convert existing single-page HTML to first page
          // Extract just the body content
          const bodyMatch = projectData.html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          const bodyContent = bodyMatch ? bodyMatch[1].trim() : projectData.html;
          existingPages = [{ id: "home", label: "Inicio", content: bodyContent }];
          console.log(`[MultiPage] Converted existing single-page to 'Inicio' tab`);
        }
        
        // Check if page already exists
        const alreadyExists = existingPages.some(p => p.id === pageRequest.pageType);
        if (alreadyExists) {
          console.log(`[MultiPage] Page "${pageRequest.pageType}" already exists, skipping`);
          return new Response(
            JSON.stringify({
              intent: "conversational",
              confidence: 1.0,
              label: "Conversación",
              entities: { businessName, sections: [], colorScheme, industry: "" },
              html: "",
              conversationalResponse: `📌 La pestaña **${pageRequest.label}** ya existe en tu proyecto. ¿Quieres que la modifique? Dime qué cambios necesitas.`,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Generate new page content
        const newPageContent = generatePageContent(pageRequest.pageType, c, businessName);
        const newPage: PageDef = { id: pageRequest.pageType, label: pageRequest.label, content: newPageContent };
        
        // Compose multi-page HTML
        const allPages = [...existingPages, newPage];
        const html = composeMultiPageHtml(allPages, c, businessName);
        
        // Log interaction
        const newLogId = await logInteraction(message, "page_add", { pageType: pageRequest.pageType, label: pageRequest.label } as unknown as Record<string, unknown>, 1.0);
        
        console.log(`[MultiPage] Generated multi-page HTML with ${allPages.length} pages (${allPages.map(p=>p.label).join(", ")})`);
        
        return new Response(
          JSON.stringify({
            intent: "page_add",
            confidence: 1.0,
            label: `Agregar ${pageRequest.label}`,
            entities: { businessName, sections: allPages.map(p => p.label), colorScheme, industry: "" },
            plan: [`Detectar pestaña: ${pageRequest.label}`, `Generar contenido de ${pageRequest.label}`, `Integrar con ${existingPages.length} pestañas existentes`, "Actualizar navegación"],
            html,
            logId: newLogId,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        console.error(`[MultiPage] Error:`, err);
        // Fall through to normal classification
      }
    }

    // 0. Load entity memory if projectId provided
    let entityMemory: { intent: string; business_name: string; sections: string[]; color_scheme: string } | null = null;
    if (projectId) {
      entityMemory = await loadEntityMemory(projectId);
      if (entityMemory) {
        console.log(`[Entity Memory] Loaded for project ${projectId}: ${entityMemory.business_name} (${entityMemory.intent})`);
      }
    }

    // (Smart AI classification removed - using local classification only)

    const patterns = await queryLearningPatterns();

    // 2. Tokenize and classify with enhanced NLP + TF-IDF
    const tokens = tokenize(message);

    // 3. Determine intent using local classification
    let intent: string;
    let confidence: number;
    let label: string;

    let provider: "rules" | "ollama" = "rules";

    if (isFollowUp(message) && (previousIntent || entityMemory?.intent) && (previousEntities || entityMemory)) {
      // Follow-up message: use previous context or entity memory
      intent = previousIntent || entityMemory!.intent;
      confidence = 0.85;
      label = intentMap[intent]?.label || "Sitio Web";
    } else {
      // Local classification with TF-IDF
      console.log(`[Classifier] Using local classification`);
      const classification = await classifyIntent(tokens, message, patterns, previousIntent, conversationHistory);
      intent = classification.intent;
      confidence = classification.confidence;
      label = classification.label;

      // ---- OLLAMA FALLBACK: boost with LLM when rules confidence is low ----
      const threshold = typeof userThreshold === "number" ? userThreshold : 0.6;
      if (confidence < threshold) {
        console.log(`[Ollama Fallback] Rules confidence ${confidence} < ${threshold}, trying Ollama...`);
        const ollamaResult = await classifyWithOllama(message, ollamaModel);
        if (ollamaResult && ollamaResult.confidence > confidence) {
          console.log(`[Ollama Fallback] Ollama (${ollamaResult.intent}:${ollamaResult.confidence}) beats rules (${intent}:${confidence})`);
          intent = ollamaResult.intent;
          confidence = ollamaResult.confidence;
          label = ollamaResult.label;
          provider = "ollama";
        } else {
          console.log(`[Ollama Fallback] Rules result kept (${intent}:${confidence})`);
        }
      }
    }

    // ---- CONFIDENCE THRESHOLD: ask for clarification if too low ----
    if (confidence < 0.45 && !isFollowUp(message)) {
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

    // ---- CONFIRMATION ZONE (0.45-0.65): ask user to confirm before executing ----
    if (confidence >= 0.45 && confidence < 0.65 && !isFollowUp(message)) {
      // Check for ambiguity: if top 2 intents are very close
      const allScores = Object.entries(intentMap).map(([k]) => ({ intent: k, score: 0 }));
      // We already classified above, so use the result but ask confirmation
      console.log(`[Confirm Zone] confidence=${confidence} for "${intent}" - asking user to confirm`);
      return new Response(
        JSON.stringify({
          intent: "conversational",
          confidence,
          label: "Confirmación",
          entities: { businessName: "", sections: [], colorScheme: "", industry: "" },
          html: "",
          conversationalResponse: `🔍 Detecté que posiblemente quieres un **${label}** (confianza: ${Math.round(confidence * 100)}%).\n\n¿Es correcto? Si es así, dime algo como:\n• *\"Sí, quiero un ${label.toLowerCase()}\"*\n• *\"Correcto, se llama [nombre del negocio]\"*\n\nSi no es lo que buscas, descríbeme mejor tu proyecto con más detalles.`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---- AMBIGUITY DETECTION: short messages ----
    if (tokens.length < 3 && confidence < 0.7 && !isFollowUp(message)) {
      console.log(`[Ambiguous] Only ${tokens.length} tokens with confidence ${confidence} - asking for more details`);
      return new Response(
        JSON.stringify({
          intent: "conversational",
          confidence,
          label: "Conversación",
          entities: { businessName: "", sections: [], colorScheme: "", industry: "" },
          html: "",
          conversationalResponse: `📝 Tu mensaje es un poco corto para generar el mejor resultado.\n\nPara crear algo increíble necesito saber:\n• **Tipo de negocio** (restaurante, tienda, agencia...)\n• **Nombre** del negocio\n• **Secciones** deseadas (menú, contacto, galería...)\n• **Colores** preferidos (opcional)\n\n**Ejemplo completo:** *\"Crea un sistema de facturación llamado FacturaPro con login, en colores azules\"*`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Extract entities (previous context, entity memory)
    let entities = extractEntities(message, tokens, intent);

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

    // 5. Generate HTML using template approach (no external AI)
    let html: string;
    const enrichedContent = await enrichContentWithLLM(intent, entities.businessName);
    html = composeReactHtml({ name: entities.businessName, colors, sections: entities.sections, intent, enriched: enrichedContent });

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
      provider,
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
