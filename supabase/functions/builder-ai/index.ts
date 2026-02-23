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
  const { data: existingTables } = await sb.from("app_tables").select("id").eq("project_id", projectId).limit(1);
  if (existingTables && existingTables.length > 0) {
    console.log(`[AutoDB] Project ${projectId} already has tables, skipping`);
    return [];
  }

  await sb.from("projects").update({ db_enabled: true }).eq("id", projectId);
  const createdTableNames: string[] = [];

  for (const tableDef of schema) {
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

// ==================== OLLAMA CLOUD API ====================
const OLLAMA_SYSTEM_PROMPT = `Eres DOKU AI, un asistente experto en crear sitios web profesionales en español. Tu trabajo es analizar mensajes de usuarios y responder de dos formas:

1. **Si el mensaje es conversacional** (saludos, preguntas sobre ti, agradecimientos, despedidas, preguntas de ayuda, etc.):
   Responde con type="conversational" y una respuesta amigable en español.

2. **Si el mensaje pide crear o modificar un sitio web**:
   Responde con type="generative" incluyendo:
   - intent: tipo de sitio (landing, restaurant, ecommerce, portfolio, blog, dashboard, fitness, agency, clinic, realestate, education, veterinary, hotel, lawyer, accounting, photography, music, salon, technology, billing, inventory, crm, pos, booking, laundry, pharmacy, construction, florist, mechanic, printing)
   - entities: nombre del negocio, secciones detectadas, esquema de color, industria
   - plan: pasos del plan de ejecución (4-6 pasos)
   - html: Un sitio web HTML COMPLETO, profesional, responsivo y moderno

**REGLAS PARA EL HTML:**
- Debe ser un documento HTML completo (<!DOCTYPE html> hasta </html>)
- Usa CSS inline con variables CSS para colores
- Diseño oscuro moderno con gradientes sutiles
- Tipografía: Google Fonts (Inter para body, Outfit para títulos)
- Responsive con media queries
- Incluye: navbar, hero, secciones relevantes, footer
- Usa emojis/iconos Unicode para decorar
- Animaciones CSS sutiles (fade-in, hover effects)
- Imágenes de Unsplash: https://images.unsplash.com/photo-XXXXX?auto=format&fit=crop&w=800&q=80
- El HTML debe funcionar de forma independiente sin JavaScript frameworks
- Textos en español relevantes al negocio
- Mínimo 5 secciones visibles
- Calidad profesional como si fuera un diseñador premium

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
  "html": "<!DOCTYPE html>..."
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

// ==================== FALLBACK HTML (minimal, when Ollama fails) ====================
function generateFallbackHtml(businessName: string, intent: string): string {
  const colorMap: Record<string, { primary: string; bg: string; text: string }> = {
    restaurant: { primary: "#d97706", bg: "#0f0a05", text: "#fef3c7" },
    ecommerce: { primary: "#2563eb", bg: "#06080f", text: "#dbeafe" },
    fitness: { primary: "#059669", bg: "#060f0a", text: "#d1fae5" },
    landing: { primary: "#7c3aed", bg: "#0a0a0f", text: "#e8eaf0" },
    portfolio: { primary: "#7c3aed", bg: "#0a0a0f", text: "#e8eaf0" },
    clinic: { primary: "#2563eb", bg: "#06080f", text: "#dbeafe" },
    salon: { primary: "#db2777", bg: "#0f060a", text: "#fce7f3" },
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

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${businessName} - ${label}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--primary:${c.primary};--bg:${c.bg};--text:${c.text};--text-muted:${c.text}88;--border:${c.primary}20}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.container{max-width:1100px;margin:0 auto;padding:0 2rem}
nav{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2.5rem;border-bottom:1px solid var(--border)}
nav a{color:var(--primary);font-family:'Outfit',sans-serif;font-size:1.4rem;font-weight:700;text-decoration:none}
.hero{min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem}
.hero h1{font-family:'Outfit',sans-serif;font-size:clamp(2.5rem,6vw,4rem);font-weight:800;margin-bottom:1.5rem;background:linear-gradient(135deg,var(--primary),${c.text});-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{color:var(--text-muted);font-size:1.15rem;max-width:600px;margin:0 auto 2rem;line-height:1.8}
.btn{display:inline-block;background:var(--primary);color:var(--bg);padding:0.8rem 2rem;border-radius:8px;font-weight:600;text-decoration:none;border:none;cursor:pointer;font-size:1rem}
section{padding:5rem 2rem}
.section-title{text-align:center;font-family:'Outfit',sans-serif;font-size:2rem;font-weight:700;margin-bottom:3rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem}
.card{background:${c.primary}08;border:1px solid var(--border);border-radius:12px;padding:2rem}
.card h3{font-size:1.1rem;margin-bottom:0.5rem}
.card p{color:var(--text-muted);font-size:0.95rem;line-height:1.7}
footer{text-align:center;padding:3rem 2rem;border-top:1px solid var(--border);color:var(--text-muted);font-size:0.9rem}
@media(max-width:768px){nav{flex-direction:column;gap:1rem}.hero h1{font-size:2rem}}
</style>
</head>
<body>
<nav><a href="#">${businessName}</a><a href="#contact" class="btn" style="font-size:0.85rem;padding:0.6rem 1.5rem">Contacto</a></nav>
<div class="hero"><div><h1>${businessName}</h1><p>Bienvenido a ${businessName}. Somos expertos en ofrecer soluciones de ${label.toLowerCase()} de alta calidad para nuestros clientes.</p><button class="btn">Comenzar</button></div></div>
<section><h2 class="section-title">Nuestros Servicios</h2><div class="grid container">
<div class="card"><h3>⭐ Calidad Premium</h3><p>Ofrecemos servicios de la más alta calidad con atención personalizada para cada cliente.</p></div>
<div class="card"><h3>🚀 Innovación</h3><p>Utilizamos las últimas tecnologías y tendencias para ofrecer resultados excepcionales.</p></div>
<div class="card"><h3>💎 Experiencia</h3><p>Años de experiencia nos respaldan, garantizando resultados profesionales en cada proyecto.</p></div>
</div></section>
<section id="contact" style="background:${c.primary}05"><h2 class="section-title">Contacto</h2>
<div class="container" style="text-align:center"><p style="color:var(--text-muted);margin-bottom:2rem">¿Listo para empezar? Contáctanos hoy mismo.</p><button class="btn">Escríbenos</button></div></section>
<footer><p>© 2024 ${businessName}. Todos los derechos reservados. Creado con DOKU AI.</p></footer>
</body></html>`;
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
    
    // Add context to message if we have entity memory
    let enrichedMessage = message;
    if (entityMemory) {
      enrichedMessage = `[Contexto del proyecto: negocio="${entityMemory.business_name}", tipo="${entityMemory.intent}", colores="${entityMemory.color_scheme}"]\n\nMensaje del usuario: ${message}`;
    }
    if (previousEntities) {
      enrichedMessage = `[Contexto previo: negocio="${previousEntities.businessName}", industria="${previousEntities.industry}", colores="${previousEntities.colorScheme}"]\n\nMensaje del usuario: ${message}`;
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
    if (!html || html.length < 100 || !html.includes("<!DOCTYPE")) {
      console.log("[DOKU] Ollama HTML insufficient, using fallback");
      html = generateFallbackHtml(entities.businessName, intent);
    }

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
