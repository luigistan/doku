import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  html: string | null;
  intent: string | null;
  entities: Record<string, unknown> | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Project[];
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("projects")
    .insert({ name, description: description || null, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, updates: { name?: string; html?: string; intent?: string; entities?: unknown; is_public?: boolean; description?: string; slug?: string }): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update(updates as Record<string, unknown>)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function getProject(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Project;
}

export async function checkSlugAvailable(slug: string, currentProjectId?: string): Promise<boolean> {
  let query = supabase.from("projects").select("id").eq("slug", slug);
  if (currentProjectId) query = query.neq("id", currentProjectId);
  const { data } = await query;
  return !data || data.length === 0;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();
  if (error) return null;
  return data as Project;
}

export async function saveVersion(projectId: string, html: string, message: string): Promise<void> {
  // Get current version count
  const { count } = await supabase
    .from("project_versions")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { error } = await supabase
    .from("project_versions")
    .insert({
      project_id: projectId,
      html,
      message,
      version_number: (count || 0) + 1,
    });
  if (error) throw error;
}

export async function saveChatMessage(projectId: string, role: string, content: string, plan?: unknown): Promise<void> {
  const { error } = await supabase
    .from("chat_messages")
    .insert({
      project_id: projectId,
      role,
      content,
      plan: plan ? JSON.parse(JSON.stringify(plan)) : null,
    });
  if (error) throw error;
}

export async function getChatMessages(projectId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

// ── App Database (multi-tenant) ──

export async function enableProjectDb(projectId: string): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ db_enabled: true } as Record<string, unknown>)
    .eq("id", projectId);
  if (error) throw error;
}

export interface AppTable {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
}

export async function getAppTables(projectId: string): Promise<AppTable[]> {
  const { data, error } = await supabase
    .from("app_tables" as any)
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as AppTable[];
}

export async function createAppTable(projectId: string, name: string): Promise<AppTable> {
  const { data, error } = await supabase
    .from("app_tables" as any)
    .insert({ project_id: projectId, name } as any)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as AppTable;
}

export async function deleteAppTable(tableId: string): Promise<void> {
  const { error } = await supabase
    .from("app_tables" as any)
    .delete()
    .eq("id", tableId);
  if (error) throw error;
}
