import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const action = url.pathname.split("/").pop(); // test | save | delete | connections

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Get user from auth header
  const authHeader = req.headers.get("authorization") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: "No autorizado" }, 401);

  const adminClient = createClient(supabaseUrl, serviceKey);

  try {
    if (action === "test" && req.method === "POST") {
      const { type, host, port, database: dbName, username, password, use_ssl } = await req.json();

      // We test connectivity by trying to connect
      // Since Deno edge functions can't install native drivers, we validate params and do a TCP check
      // For now, we validate the params and mark as ok - real connectivity test would need native drivers
      if (!host || !port || !dbName || !username || !password || !type) {
        return json({ success: false, error: "Faltan campos requeridos" }, 400);
      }

      // Attempt TCP connection to validate host:port is reachable
      try {
        const conn = await Deno.connect({ hostname: host, port: Number(port) });
        conn.close();
        return json({ success: true, message: "Conexión exitosa" });
      } catch (e) {
        return json({ success: false, error: `No se pudo conectar a ${host}:${port} - ${e.message}` });
      }
    }

    if (action === "save" && req.method === "POST") {
      const { projectId, type, host, port, database: dbName, username, password, use_ssl } = await req.json();

      // Verify user owns the project
      const { data: project } = await adminClient
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();
      if (!project) return json({ error: "Proyecto no encontrado" }, 404);

      // Simple base64 encoding for password (in production use pgcrypto or vault)
      const passwordEncrypted = btoa(password);

      const { data: conn, error: insertErr } = await adminClient
        .from("db_connections")
        .insert({
          project_id: projectId,
          type,
          host,
          port: Number(port),
          database_name: dbName,
          username,
          password_encrypted: passwordEncrypted,
          use_ssl: use_ssl || false,
          status: "ok",
        })
        .select("id, project_id, type, host, port, database_name, username, use_ssl, status, status_message, is_default, created_at")
        .single();

      if (insertErr) return json({ error: insertErr.message }, 500);
      return json(conn);
    }

    if (action === "connections" && req.method === "GET") {
      const projectId = url.searchParams.get("projectId");
      if (!projectId) return json({ error: "projectId requerido" }, 400);

      const { data, error: fetchErr } = await adminClient
        .from("db_connections")
        .select("id, project_id, type, host, port, database_name, username, use_ssl, status, status_message, is_default, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (fetchErr) return json({ error: fetchErr.message }, 500);
      return json(data || []);
    }

    if (action === "delete" && req.method === "POST") {
      const { connectionId } = await req.json();

      // Verify user owns the connection's project
      const { data: conn } = await adminClient
        .from("db_connections")
        .select("id, project_id")
        .eq("id", connectionId)
        .single();
      if (!conn) return json({ error: "Conexión no encontrada" }, 404);

      const { data: project } = await adminClient
        .from("projects")
        .select("id")
        .eq("id", conn.project_id)
        .eq("user_id", user.id)
        .single();
      if (!project) return json({ error: "No autorizado" }, 403);

      const { error: delErr } = await adminClient
        .from("db_connections")
        .delete()
        .eq("id", connectionId);
      if (delErr) return json({ error: delErr.message }, 500);
      return json({ success: true });
    }

    if (action === "set-default" && req.method === "POST") {
      const { connectionId, projectId } = await req.json();

      // Verify ownership
      const { data: project } = await adminClient
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();
      if (!project) return json({ error: "No autorizado" }, 403);

      // Unset all defaults for project
      await adminClient
        .from("db_connections")
        .update({ is_default: false })
        .eq("project_id", projectId);

      // Set new default
      await adminClient
        .from("db_connections")
        .update({ is_default: true })
        .eq("id", connectionId);

      return json({ success: true });
    }

    return json({ error: "Endpoint no encontrado" }, 404);
  } catch (err) {
    console.error("db-connector error:", err);
    return json({ error: err.message || "Error interno" }, 500);
  }
});
