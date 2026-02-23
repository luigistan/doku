import { supabase } from "@/integrations/supabase/client";

export interface DbConnection {
  id: string;
  project_id: string;
  type: "mysql" | "postgres" | "mssql";
  host: string;
  port: number;
  database_name: string;
  username: string;
  use_ssl: boolean;
  status: "pending" | "ok" | "fail";
  status_message: string | null;
  is_default: boolean;
  created_at: string;
}

export interface ConnectionParams {
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  use_ssl: boolean;
}

async function invokeConnector(action: string, body?: unknown, method = "POST") {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/db-connector`;
  
  const url = method === "GET" && body
    ? `${baseUrl}/${action}?${new URLSearchParams(body as Record<string, string>).toString()}`
    : `${baseUrl}/${action}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    ...(method !== "GET" && body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error en el conector");
  return data;
}

export async function testConnection(params: ConnectionParams): Promise<{ success: boolean; error?: string; message?: string }> {
  return invokeConnector("test", params);
}

export async function saveConnection(projectId: string, params: ConnectionParams): Promise<DbConnection> {
  return invokeConnector("save", { projectId, ...params });
}

export async function getConnections(projectId: string): Promise<DbConnection[]> {
  return invokeConnector("connections", { projectId }, "GET");
}

export async function deleteConnection(connectionId: string): Promise<void> {
  await invokeConnector("delete", { connectionId });
}

export async function setDefaultConnection(connectionId: string, projectId: string): Promise<void> {
  await invokeConnector("set-default", { connectionId, projectId });
}
