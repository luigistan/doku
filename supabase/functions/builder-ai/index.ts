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
async function autoCreateProjectTables(projectId: string, intent: string): Promise<string[]> {
  const schema = intentDatabaseSchema[intent];
  if (!schema) {
    console.log(`[AutoDB] No schema defined for intent: ${intent}`);
    return [];
  }

  const sb = getSupabaseClient();
  
  // Get existing table names for this project
  const { data: existingTables } = await sb.from("app_tables").select("id, name").eq("project_id", projectId);
  const existingNames = new Set((existingTables || []).map((t: { name: string }) => t.name));

  await sb.from("projects").update({ db_enabled: true }).eq("id", projectId);
  const createdTableNames: string[] = [];

  for (const tableDef of schema) {
    // Skip tables that already exist
    if (existingNames.has(tableDef.name)) {
      console.log(`[AutoDB] Table "${tableDef.name}" already exists, skipping`);
      continue;
    }

    const { data: tableData, error: tableError } = await sb
      .from("app_tables").insert({ project_id: projectId, name: tableDef.name }).select("id").single();

    if (tableError || !tableData) {
      console.error(`[AutoDB] Error creating table ${tableDef.name}:`, tableError);
      continue;
    }

    const columnsToInsert = tableDef.columns.map((col, idx) => ({
      table_id: tableData.id, name: col.name, column_type: col.type, position: idx, is_required: idx === 0,
    }));

    await sb.from("app_columns").insert(columnsToInsert);
    createdTableNames.push(tableDef.name);
  }

  console.log(`[AutoDB] Created ${createdTableNames.length} tables for ${intent}: ${createdTableNames.join(", ")}`);
  return createdTableNames;
}

// ==================== ENTITY MEMORY ====================
async function loadEntityMemory(projectId: string): Promise<{ intent: string; business_name: string; sections: string[]; color_scheme: string } | null> {
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from("user_entity_memory")
      .select("intent, business_name, sections, color_scheme")
      .eq("project_id", projectId).single();
    if (error || !data) return null;
    return data as { intent: string; business_name: string; sections: string[]; color_scheme: string };
  } catch { return null; }
}

async function saveEntityMemory(projectId: string, intent: string, entities: { businessName: string; sections: string[]; colorScheme: string }): Promise<void> {
  try {
    const sb = getSupabaseClient();
    await sb.from("user_entity_memory").upsert({
      project_id: projectId, intent,
      business_name: entities.businessName, sections: entities.sections, color_scheme: entities.colorScheme,
    }, { onConflict: "project_id" });
  } catch (err) { console.warn("[Entity Memory] Failed to save:", err); }
}

// ==================== LOGGING ====================
async function logInteraction(message: string, intent: string, entities: Record<string, unknown>, confidence: number): Promise<string | null> {
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb.from("ai_learning_logs")
      .insert({ user_message: message, detected_intent: intent, detected_entities: entities, confidence })
      .select("id").single();
    if (error) throw error;
    return data?.id || null;
  } catch { return null; }
}

async function updateInteractionFeedback(logId: string, accepted: boolean, feedback?: string): Promise<void> {
  try {
    const sb = getSupabaseClient();
    await sb.from("ai_learning_logs").update({ user_accepted: accepted, user_feedback: feedback || null }).eq("id", logId);
  } catch { /* silently fail */ }
}

// ==================== REACT WRAP (mirrors src/lib/templates.ts) ====================
function reactWrap(componentCode: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer}
input,textarea,select{font-family:inherit}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:#12121a}
::-webkit-scrollbar-thumb{background:#2d2d3f;border-radius:3px}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-type="module" data-presets="react,typescript">
${componentCode}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
<\/script>
</body>
</html>`;
}

// ==================== OLLAMA CLOUD API ====================
const OLLAMA_SYSTEM_PROMPT = `Eres DOKU AI, un asistente experto en crear sitios web profesionales en español. Tu trabajo es analizar mensajes de usuarios y responder de dos formas:

1. **Si el mensaje es conversacional** (saludos, preguntas sobre ti, agradecimientos, despedidas, preguntas de ayuda, etc.):
   Responde con type="conversational" y una respuesta amigable en español.

2. **Si el mensaje pide crear o modificar un sitio web**:
   Responde con type="generative" incluyendo:
   - intent: tipo de sitio (landing, restaurant, ecommerce, portfolio, blog, dashboard, fitness, agency, clinic, realestate, education, veterinary, hotel, lawyer, accounting, photography, music, salon, technology, billing, inventory, crm, pos, booking, laundry, pharmacy, construction, florist, mechanic, printing)
   - entities: nombre del negocio, secciones detectadas, esquema de color, industria
   - plan: pasos del plan de ejecución (4-6 pasos)
   - html: Código de COMPONENTE REACT (NO documento HTML completo)

**REGLAS CRÍTICAS PARA EL CÓDIGO REACT:**
- Genera SOLO el código del componente React (SIN <!DOCTYPE>, SIN <html>, SIN <head>, SIN <body>)
- El código debe empezar con funciones auxiliares/hooks y terminar con function App()
- Usa React.useState, React.useEffect, React.useRef (están disponibles globalmente, NO uses import)
- Estilos INLINE con objetos JavaScript en camelCase: style={{backgroundColor:'#0a0a0f', fontSize:'1rem', borderRadius:16}}
- NO uses className, NO uses CSS externo, NO uses Tailwind
- Tema oscuro profesional: fondo #0a0a0f, texto #e2e8f0, bordes #1e1e2e, cards #12121a
- Fuentes: fontFamily:"'Inter',sans-serif" para body, "'Playfair Display',serif" para títulos
- Gradientes de texto con WebkitBackgroundClip:'text' y WebkitTextFillColor:'transparent'
- Hover effects con onMouseOver/onMouseOut cambiando estilos dinámicamente
- Navbar sticky con position:'sticky', top:0, backdropFilter:'blur(16px)', zIndex:50
- Mínimo 5 secciones: navbar, hero, features/servicios, contacto, footer
- Usa emojis/iconos Unicode como decoración visual
- Links de navegación con href="#seccion" para scroll suave
- Botones con gradientes, box-shadow y border-radius
- Animaciones de aparición usando IntersectionObserver (hook useOnScreen)
- Contadores animados para estadísticas
- Responsive con clamp() para font-size y grid con auto-fit

**HOOK useOnScreen QUE DEBES INCLUIR:**
function useOnScreen(ref) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

**EJEMPLO DE ESTRUCTURA DEL CÓDIGO QUE DEBES GENERAR:**
const { useState, useEffect, useRef } = React;

function useOnScreen(ref) { /* ... */ }
function Counter({ end, label }) { /* componente de contador animado */ }
function Navbar() { /* navbar sticky con blur */ }
function Hero() { /* hero con gradientes y CTAs */ }
function Features() { /* cards con animaciones de scroll */ }
function Contact() { /* formulario con data-doku-table */ }
function App() {
  return <><Navbar /><Hero /><Features /><Contact /><footer>...</footer></>;
}

**REGLA CRÍTICA - FORMULARIOS CON BASE DE DATOS:**
- TODOS los formularios DEBEN incluir el atributo data-doku-table="nombre_tabla"
- El nombre de la tabla debe coincidir con las tablas del negocio (contacts, reservations, orders, appointments, bookings, inquiries, etc.)
- Cada campo input/textarea/select del formulario DEBE tener el atributo name="nombre_columna"
- Ejemplo: <form data-doku-table="contacts"><input name="name" placeholder="Nombre" required /><input name="email" type="email" placeholder="Email" /><textarea name="notes" placeholder="Mensaje" /><button type="submit">Enviar</button></form>

RESPONDE SIEMPRE con JSON válido (sin markdown, sin backticks):
{
  "type": "conversational" | "generative",
  "conversationalResponse": "texto si es conversacional",
  "intent": "tipo si es generativo",
  "confidence": 0.0-1.0,
  "label": "etiqueta legible del intent",
  "entities": {
    "businessName": "nombre detectado",
    "sections": ["navbar","hero","features","contact","footer"],
    "colorScheme": "esquema de color",
    "industry": "industria"
  },
  "plan": ["paso 1", "paso 2", ...],
  "html": "const { useState, useEffect, useRef } = React; ... function App() { ... }"
}`;

interface OllamaResponse {
  type: "conversational" | "generative";
  conversationalResponse?: string;
  intent?: string;
  confidence?: number;
  label?: string;
  entities?: {
    businessName: string;
    sections: string[];
    colorScheme: string;
    industry: string;
  };
  plan?: string[];
  html?: string;
}

async function callOllama(message: string, modelOverride?: string, conversationHistory?: { role: string; content: string }[]): Promise<OllamaResponse | null> {
  const apiKey = Deno.env.get("OLLAMA_API_KEY");
  if (!apiKey) {
    console.log("[Ollama] No OLLAMA_API_KEY configured");
    return null;
  }

  let selectedModel = modelOverride || Deno.env.get("LLM_MODEL") || "gpt-oss:20b";
  
  // Map local-only models to cloud-available models
  // DO NOT strip ":" from model names - cloud models use it (e.g. gpt-oss:20b, glm-4.7:cloud)
  const modelAliases: Record<string, string> = {
    "llama3": "gpt-oss:20b", "llama3.1": "gpt-oss:20b", "llama3.2": "gpt-oss:20b",
    "llama3.3": "gpt-oss:20b", "llama2": "gpt-oss:20b", "gemma3": "gpt-oss:20b",
    "qwen3": "gpt-oss:20b",
  };
  if (modelAliases[selectedModel]) {
    console.log(`[Ollama] Mapping local model "${selectedModel}" -> "${modelAliases[selectedModel]}"`);
    selectedModel = modelAliases[selectedModel];
  }

  // Build messages array with conversation history
  const messages: { role: string; content: string }[] = [
    { role: "system", content: OLLAMA_SYSTEM_PROMPT },
  ];
  
  // Add recent conversation history for context
  if (conversationHistory && conversationHistory.length > 0) {
    const recent = conversationHistory.slice(-4);
    for (const msg of recent) {
      messages.push({ role: msg.role === "system" ? "assistant" : msg.role, content: msg.content.substring(0, 300) });
    }
  }
  
  messages.push({ role: "user", content: message });

  // Try Ollama Cloud endpoints - native API first, then OpenAI compat as fallback
  const endpoints = [
    { url: "https://ollama.com/api/chat", format: "ollama" },
    { url: "https://ollama.com/v1/chat/completions", format: "openai" },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`[Ollama] Trying ${endpoint.url} with model ${selectedModel}`);
      
      const body = endpoint.format === "ollama"
        ? JSON.stringify({
            model: selectedModel,
            messages,
            stream: false,
          })
        : JSON.stringify({
            model: selectedModel,
            messages,
            temperature: 0.7,
            max_tokens: 8000,
            stream: false,
          });

      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body,
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.log(`[Ollama] ${endpoint.url} returned ${response.status}: ${errText.substring(0, 200)}`);
        continue;
      }

      const data = await response.json();
      console.log(`[Ollama] Raw response keys: ${Object.keys(data).join(", ")}`);
      
      let content: string;
      if (endpoint.format === "openai") {
        content = data.choices?.[0]?.message?.content || "";
      } else {
        // Native Ollama format: { "message": { "role": "assistant", "content": "..." }, "done": true }
        content = data.message?.content || data.response || "";
      }

      if (!content) {
        console.log("[Ollama] Empty response");
        continue;
      }

      console.log(`[Ollama] Got response (${content.length} chars)`);

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log("[Ollama] No JSON found in response");
        // If the response isn't JSON, treat it as conversational
        return {
          type: "conversational",
          conversationalResponse: content.substring(0, 500),
        };
      }

      try {
        const parsed = JSON.parse(jsonMatch[0]) as OllamaResponse;
        console.log(`[Ollama] Parsed response: type=${parsed.type}, intent=${parsed.intent}`);
        return parsed;
      } catch (parseErr) {
        console.log("[Ollama] JSON parse error, treating as conversational");
        return {
          type: "conversational",
          conversationalResponse: content.substring(0, 500),
        };
      }
    } catch (err) {
      console.warn(`[Ollama] Error with ${endpoint.url}:`, err);
      continue;
    }
  }

  console.log("[Ollama] All endpoints failed");
  return null;
}

// ==================== FALLBACK HTML (React component, when Ollama fails) ====================
function generateFallbackHtml(businessName: string, intent: string): string {
  const colorMap: Record<string, { primary: string; primaryRgb: string; accent: string }> = {
    restaurant: { primary: "#d97706", primaryRgb: "217,119,6", accent: "#f59e0b" },
    ecommerce: { primary: "#2563eb", primaryRgb: "37,99,235", accent: "#3b82f6" },
    fitness: { primary: "#059669", primaryRgb: "5,150,105", accent: "#10b981" },
    landing: { primary: "#7c3aed", primaryRgb: "124,58,237", accent: "#6366f1" },
    portfolio: { primary: "#7c3aed", primaryRgb: "124,58,237", accent: "#818cf8" },
    clinic: { primary: "#2563eb", primaryRgb: "37,99,235", accent: "#60a5fa" },
    salon: { primary: "#db2777", primaryRgb: "219,39,119", accent: "#ec4899" },
  };
  const c = colorMap[intent] || colorMap.landing;
  const labelMap: Record<string, string> = {
    restaurant: "Restaurante", ecommerce: "Tienda Online", fitness: "Gimnasio",
    landing: "Landing Page", portfolio: "Portfolio", clinic: "Clínica", salon: "Salón",
    blog: "Blog", dashboard: "Dashboard", agency: "Agencia", hotel: "Hotel",
    billing: "Facturación", inventory: "Inventario", crm: "CRM", pos: "Punto de Venta",
    booking: "Reservas", laundry: "Lavandería", pharmacy: "Farmacia",
    construction: "Constructora", florist: "Floristería", mechanic: "Taller Mecánico",
    printing: "Imprenta", veterinary: "Veterinaria", education: "Academia",
    realestate: "Inmobiliaria", lawyer: "Abogado", accounting: "Contabilidad",
    photography: "Fotografía", music: "Música", technology: "Tecnología",
  };
  const label = labelMap[intent] || "Sitio Web";

  const componentCode = `
const { useState, useEffect, useRef } = React;

function useOnScreen(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function Counter({ end, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, end]);
  return <div ref={ref} style={{textAlign:'center'}}><div style={{fontSize:'2.5rem',fontWeight:800,background:'linear-gradient(135deg,${c.primary},${c.accent})',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{count}+</div><div style={{color:'#94a3b8',fontSize:'0.9rem'}}>{label}</div></div>;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return <nav style={{position:'sticky',top:0,zIndex:50,backdropFilter:'blur(16px)',background:scrolled?'rgba(10,10,15,0.95)':'rgba(10,10,15,0.7)',borderBottom:'1px solid #1e1e2e',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'background 0.3s'}}>
    <div style={{fontSize:'1.3rem',fontWeight:700,color:'#e2e8f0'}}>${businessName}</div>
    <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
      {['Inicio','Servicios','Contacto'].map(l => <a key={l} href={\\\`#\\\${l.toLowerCase()}\\\`} style={{color:'#94a3b8',fontSize:'0.9rem',transition:'color 0.2s'}} onMouseOver={e=>e.target.style.color='${c.primary}'} onMouseOut={e=>e.target.style.color='#94a3b8'}>{l}</a>)}
      <button style={{padding:'0.6rem 1.5rem',background:'linear-gradient(135deg,${c.primary},${c.accent})',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.85rem',boxShadow:'0 4px 15px rgba(${c.primaryRgb},0.3)'}}>Empezar</button>
    </div>
  </nav>;
}

function Hero() {
  return <section id="inicio" style={{minHeight:'85vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'4rem 2rem',background:'radial-gradient(ellipse at 50% 0%,rgba(${c.primaryRgb},0.12) 0%,transparent 60%)'}}>
    <span style={{background:'${c.primary}22',color:'${c.primary}',padding:'0.4rem 1rem',borderRadius:99,fontSize:'0.85rem',marginBottom:'1.5rem',border:'1px solid ${c.primary}44'}}>✦ ${label}</span>
    <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:800,marginBottom:'1rem',background:'linear-gradient(135deg,${c.primary},${c.accent})',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',maxWidth:700}}>Bienvenido a ${businessName}</h1>
    <p style={{fontSize:'1.15rem',color:'#94a3b8',maxWidth:600,marginBottom:'2rem'}}>Somos expertos en ofrecer soluciones de ${label.toLowerCase()} de alta calidad para nuestros clientes.</p>
    <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',justifyContent:'center'}}>
      <button style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,${c.primary},${c.accent})',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.95rem',boxShadow:'0 4px 15px rgba(${c.primaryRgb},0.3)'}}>Comenzar Ahora →</button>
      <button style={{padding:'0.85rem 2rem',background:'transparent',border:'1.5px solid #2d2d3f',color:'#e2e8f0',borderRadius:10,fontWeight:600,fontSize:'0.95rem'}}>Saber Más</button>
    </div>
  </section>;
}

function Features() {
  const items = [
    { icon: '⭐', title: 'Calidad Premium', desc: 'Ofrecemos servicios de la más alta calidad con atención personalizada.' },
    { icon: '🚀', title: 'Innovación', desc: 'Utilizamos las últimas tecnologías y tendencias del mercado.' },
    { icon: '💎', title: 'Experiencia', desc: 'Años de experiencia garantizando resultados profesionales.' },
    { icon: '🤝', title: 'Soporte 24/7', desc: 'Equipo dedicado disponible las 24 horas para ayudarte.' },
  ];
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  return <section ref={ref} id="servicios" style={{padding:'5rem 2rem',background:'#0e0e16'}}>
    <div style={{textAlign:'center',marginBottom:'3rem'}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,marginBottom:'0.5rem'}}>Nuestros Servicios</h2><p style={{color:'#94a3b8'}}>Todo lo que necesitas en un solo lugar</p></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
      {items.map((f,i) => <div key={i} style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:16,padding:'2rem',transition:'transform 0.3s,border-color 0.3s',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transitionDelay:\\\`\\\${i*100}ms\\\`}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='${c.primary}66'}} onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='#1e1e2e'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>{f.icon}</div>
        <h3 style={{fontSize:'1.15rem',fontWeight:600,marginBottom:'0.5rem'}}>{f.title}</h3>
        <p style={{color:'#94a3b8',fontSize:'0.95rem'}}>{f.desc}</p>
      </div>)}
    </div>
  </section>;
}

function Stats() {
  return <section style={{padding:'4rem 2rem',display:'flex',justifyContent:'center',gap:'4rem',flexWrap:'wrap'}}>
    <Counter end={500} label="Clientes" /><Counter end={50} label="Proyectos" /><Counter end={99} label="% Satisfacción" /><Counter end={24} label="Soporte (hrs)" />
  </section>;
}

function Contact() {
  const [sent, setSent] = useState(false);
  return <section id="contacto" style={{padding:'5rem 2rem',textAlign:'center'}}>
    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',fontWeight:700,marginBottom:'0.5rem'}}>Contáctanos</h2>
    <p style={{color:'#94a3b8',marginBottom:'2rem'}}>¿Listo para empezar? Envíanos un mensaje</p>
    {sent ? <p style={{color:'#34d399',fontSize:'1.1rem'}}>✅ ¡Mensaje enviado exitosamente!</p> :
    <form data-doku-table="contacts" style={{maxWidth:500,margin:'0 auto',display:'flex',flexDirection:'column',gap:'1rem'}} onSubmit={e=>{e.preventDefault();setSent(true)}}>
      <input name="name" style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="Tu nombre" required />
      <input name="email" type="email" style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="tu@email.com" required />
      <input name="phone" style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none'}} placeholder="Tu teléfono" />
      <textarea name="notes" style={{background:'#12121a',border:'1px solid #1e1e2e',borderRadius:10,padding:'0.85rem 1rem',color:'#e2e8f0',outline:'none',resize:'vertical',minHeight:120}} placeholder="Tu mensaje..." required />
      <button type="submit" style={{padding:'0.85rem 2rem',background:'linear-gradient(135deg,${c.primary},${c.accent})',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.95rem'}}>Enviar Mensaje</button>
    </form>}
  </section>;
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  if (!show) return null;
  return <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{position:'fixed',bottom:24,right:24,width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,${c.primary},${c.accent})',color:'#fff',border:'none',fontSize:'1.2rem',zIndex:99,boxShadow:'0 4px 15px rgba(${c.primaryRgb},0.4)'}}>↑</button>;
}

function App() {
  return <><Navbar /><Hero /><Stats /><Features /><Contact /><footer style={{borderTop:'1px solid #1e1e2e',padding:'2rem',textAlign:'center',color:'#64748b',fontSize:'0.85rem'}}>© 2026 ${businessName}. Todos los derechos reservados. Creado con DOKU AI.</footer><BackToTop /></>;
}
`;

  return reactWrap(componentCode, `${businessName} - ${label}`);
}

// ==================== MAIN HANDLER ====================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { message, mode, action, logId, accepted, feedback, previousIntent, previousEntities, projectId, conversationHistory, ollamaModel, confidenceThreshold: _userThreshold } = body;

    // Handle feedback logging
    if (action === "feedback" && logId) {
      await updateInteractionFeedback(logId, accepted, feedback);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Se requiere un mensaje" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load entity memory for context
    let entityMemory: { intent: string; business_name: string; sections: string[]; color_scheme: string } | null = null;
    if (projectId) {
      entityMemory = await loadEntityMemory(projectId);
      if (entityMemory) {
        console.log(`[Entity Memory] Loaded for project ${projectId}: ${entityMemory.business_name} (${entityMemory.intent})`);
      }
    }

    // ---- CALL OLLAMA FOR EVERYTHING ----
    console.log(`[DOKU] Processing message: "${message.substring(0, 80)}..."`);
    
    // Load existing tables context for the LLM
    let tableContext = "";
    if (projectId) {
      try {
        const sb = getSupabaseClient();
        const { data: tables } = await sb.from("app_tables").select("id, name").eq("project_id", projectId);
        if (tables && tables.length > 0) {
          const tableDetails: string[] = [];
          for (const t of tables) {
            const { data: cols } = await sb.from("app_columns").select("name").eq("table_id", t.id).order("position");
            const colNames = (cols || []).map((c: { name: string }) => c.name).join(",");
            tableDetails.push(`${t.name}(${colNames})`);
          }
          tableContext = `\n[TABLAS BD EXISTENTES: ${tableDetails.join(", ")}. USA estos nombres exactos en data-doku-table y name de los campos.]`;
          console.log(`[DOKU] Table context: ${tableContext}`);
        }
      } catch (err) {
        console.warn("[DOKU] Failed to load table context:", err);
      }
    }

    // Add context to message if we have entity memory
    let enrichedMessage = message;
    if (entityMemory) {
      enrichedMessage = `[Contexto del proyecto: negocio="${entityMemory.business_name}", tipo="${entityMemory.intent}", colores="${entityMemory.color_scheme}"]\n\nMensaje del usuario: ${message}`;
    }
    if (previousEntities) {
      enrichedMessage = `[Contexto previo: negocio="${previousEntities.businessName}", industria="${previousEntities.industry}", colores="${previousEntities.colorScheme}"]\n\nMensaje del usuario: ${message}`;
    }
    // Append table context so LLM uses correct table names
    if (tableContext) {
      enrichedMessage += tableContext;
    }

    const ollamaResult = await callOllama(enrichedMessage, ollamaModel, conversationHistory);

    // If Ollama failed completely, use minimal fallback
    if (!ollamaResult) {
      console.log("[DOKU] Ollama failed, using fallback");
      return new Response(JSON.stringify({
        intent: "conversational",
        confidence: 1.0,
        label: "Conversación",
        entities: { businessName: "", sections: [], colorScheme: "", industry: "" },
        html: "",
        conversationalResponse: "⚠️ El motor de IA no está disponible en este momento. Por favor verifica la configuración de Ollama en ⚙️ Configuración del proyecto.\n\nAsegúrate de que:\n• La API key de Ollama esté configurada\n• El modelo seleccionado exista en Ollama Cloud\n• Tu conexión a internet esté activa",
        provider: "ollama",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---- HANDLE CONVERSATIONAL RESPONSE ----
    if (ollamaResult.type === "conversational") {
      console.log("[DOKU] Conversational response from Ollama");
      return new Response(JSON.stringify({
        intent: "conversational",
        confidence: 1.0,
        label: "Conversación",
        entities: { businessName: "", sections: [], colorScheme: "", industry: "" },
        html: "",
        conversationalResponse: ollamaResult.conversationalResponse || "¿En qué puedo ayudarte? Descríbeme el sitio web que quieres crear.",
        provider: "ollama",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---- HANDLE GENERATIVE RESPONSE ----
    const intent = ollamaResult.intent || "landing";
    const confidence = Math.min(Math.max(ollamaResult.confidence || 0.8, 0.1), 0.99);
    const label = ollamaResult.label || "Sitio Web";
    const entities = ollamaResult.entities || {
      businessName: entityMemory?.business_name || "Mi Sitio",
      sections: ["navbar", "hero", "features", "contact", "footer"],
      colorScheme: entityMemory?.color_scheme || "purple",
      industry: intent,
    };

    // Use Ollama-generated HTML or fallback
    let html = ollamaResult.html || "";
    if (!html || html.length < 100) {
      console.log("[DOKU] Ollama HTML insufficient, using fallback");
      html = generateFallbackHtml(entities.businessName, intent);
    } else if (html.includes("function App()") && !html.includes("<!DOCTYPE")) {
      // LLM generated React component code — wrap it
      console.log("[DOKU] Wrapping React component with reactWrap()");
      html = reactWrap(html, entities.businessName || "Mi Sitio");
    } else if (!html.includes("<!DOCTYPE")) {
      // Not React, not full HTML — fallback
      console.log("[DOKU] Output is neither React nor full HTML, using fallback");
      html = generateFallbackHtml(entities.businessName, intent);
    }
    // else: already a full HTML doc, use as-is

    const plan = ollamaResult.plan || [
      `Analizar solicitud: ${label}`,
      `Identificar negocio: ${entities.businessName}`,
      `Generar diseño con secciones`,
      `Aplicar esquema de colores: ${entities.colorScheme}`,
      "Renderizar sitio web",
    ];

    // Save entity memory
    if (projectId) {
      await saveEntityMemory(projectId, intent, entities);
    }

    // Auto-create database tables
    let dbTablesCreated: string[] = [];
    if (projectId && intent !== "conversational") {
      try {
        dbTablesCreated = await autoCreateProjectTables(projectId, intent);
      } catch (err) {
        console.error("[AutoDB] Failed:", err);
      }
    }

    // Log interaction
    const newLogId = await logInteraction(message, intent, entities as unknown as Record<string, unknown>, confidence);

    const response: Record<string, unknown> = {
      intent, confidence, label, entities, html,
      logId: newLogId,
      provider: "ollama",
    };

    if (dbTablesCreated.length > 0) {
      response.dbTablesCreated = dbTablesCreated;
    }

    if (mode === "brain") {
      response.plan = plan;
    }

    console.log(`[DOKU] Responding: intent=${intent}, confidence=${confidence}, html=${html.length} chars`);

    return new Response(JSON.stringify(response), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("[DOKU] Error:", error);
    return new Response(
      JSON.stringify({ error: "Error procesando la solicitud", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
