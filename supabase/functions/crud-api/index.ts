import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = getSupabaseClient();
    const body = await req.json();
    const { action, projectId, tableName, tableId, rowId, data } = body;

    if (!projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== LIST TABLES ====================
    if (action === "list_tables") {
      const { data: tables, error } = await sb
        .from("app_tables")
        .select("id, name, created_at")
        .eq("project_id", projectId)
        .order("created_at");

      if (error) throw error;
      return new Response(JSON.stringify({ tables }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== GET TABLE COLUMNS ====================
    if (action === "get_columns") {
      if (!tableId && !tableName) {
        return new Response(JSON.stringify({ error: "tableId or tableName required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let resolvedTableId = tableId;
      if (!resolvedTableId && tableName) {
        const { data: table } = await sb
          .from("app_tables")
          .select("id")
          .eq("project_id", projectId)
          .eq("name", tableName)
          .single();
        if (!table) {
          return new Response(JSON.stringify({ error: `Table "${tableName}" not found` }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        resolvedTableId = table.id;
      }

      const { data: columns, error } = await sb
        .from("app_columns")
        .select("id, name, column_type, is_required, default_value, position")
        .eq("table_id", resolvedTableId)
        .order("position");

      if (error) throw error;
      return new Response(JSON.stringify({ columns, tableId: resolvedTableId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== READ ROWS ====================
    if (action === "read") {
      let resolvedTableId = tableId;
      if (!resolvedTableId && tableName) {
        const { data: table } = await sb
          .from("app_tables")
          .select("id")
          .eq("project_id", projectId)
          .eq("name", tableName)
          .single();
        if (!table) {
          return new Response(JSON.stringify({ rows: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        resolvedTableId = table.id;
      }

      if (!resolvedTableId) {
        return new Response(JSON.stringify({ rows: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: rows, error } = await sb
        .from("app_rows")
        .select("id, data, created_at, updated_at")
        .eq("table_id", resolvedTableId)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return new Response(JSON.stringify({ rows: rows || [], tableId: resolvedTableId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== CREATE ROW ====================
    if (action === "create") {
      let resolvedTableId = tableId;
      if (!resolvedTableId && tableName) {
        const { data: table } = await sb
          .from("app_tables")
          .select("id")
          .eq("project_id", projectId)
          .eq("name", tableName)
          .single();
        if (!table) {
          return new Response(JSON.stringify({ error: `Table "${tableName}" not found` }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        resolvedTableId = table.id;
      }

      const { data: row, error } = await sb
        .from("app_rows")
        .insert({ table_id: resolvedTableId, data: data || {} })
        .select("id, data, created_at")
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ row }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== UPDATE ROW ====================
    if (action === "update") {
      if (!rowId) {
        return new Response(JSON.stringify({ error: "rowId required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: row, error } = await sb
        .from("app_rows")
        .update({ data: data || {}, updated_at: new Date().toISOString() })
        .eq("id", rowId)
        .select("id, data, updated_at")
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ row }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== DELETE ROW ====================
    if (action === "delete") {
      if (!rowId) {
        return new Response(JSON.stringify({ error: "rowId required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await sb
        .from("app_rows")
        .delete()
        .eq("id", rowId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[CRUD API] Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
