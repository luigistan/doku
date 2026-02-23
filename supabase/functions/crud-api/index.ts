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
          // Auto-create table and columns from the submitted data
          console.log(`[CRUD API] Auto-creating table "${tableName}" for project ${projectId}`);
          const { data: newTable, error: tableErr } = await sb
            .from("app_tables")
            .insert({ project_id: projectId, name: tableName })
            .select("id")
            .single();

          if (tableErr || !newTable) {
            console.error("[CRUD API] Failed to auto-create table:", tableErr);
            return new Response(JSON.stringify({ error: `Failed to create table "${tableName}"` }), {
              status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          resolvedTableId = newTable.id;

          // Create columns from data keys
          if (data && typeof data === "object") {
            const keys = Object.keys(data);
            const columnsToInsert = keys.map((key, idx) => {
              const val = data[key];
              let colType = "text";
              if (typeof val === "number") colType = "number";
              else if (typeof val === "boolean") colType = "boolean";
              else if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) colType = "date";
              else if (typeof val === "string" && /@/.test(val)) colType = "email";
              return { table_id: resolvedTableId, name: key, column_type: colType, position: idx, is_required: idx === 0 };
            });
            if (columnsToInsert.length > 0) {
              await sb.from("app_columns").insert(columnsToInsert);
            }
          }

          // Enable db on project
          await sb.from("projects").update({ db_enabled: true }).eq("id", projectId);
          console.log(`[CRUD API] Auto-created table "${tableName}" with ${Object.keys(data || {}).length} columns`);
        } else {
          resolvedTableId = table.id;
        }
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
