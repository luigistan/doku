import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getProjects, createProject, deleteProject, Project } from "@/services/projectService";
import { Plus, Folder, Trash2, LogOut, Globe, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const project = await createProject(`Proyecto ${projects.length + 1}`);
      navigate(`/builder/${project.id}`);
    } catch (err) {
      toast({ title: "Error", description: "No se pudo crear el proyecto", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar este proyecto?")) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast({ title: "Proyecto eliminado" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brain text-brain-foreground text-sm font-bold">D</div>
          <span className="text-lg font-bold">DOKU AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Mis Proyectos</h1>
            <p className="text-sm text-muted-foreground mt-1">Crea y gestiona tus sitios web</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-lg bg-brain px-4 py-2.5 text-sm font-semibold text-brain-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Nuevo Proyecto
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Sin proyectos aún</h2>
            <p className="text-sm text-muted-foreground mb-6">Crea tu primer proyecto para empezar a generar sitios web con IA.</p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-brain px-5 py-2.5 text-sm font-semibold text-brain-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Crear Primer Proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/builder/${project.id}`)}
                className="group rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-brain/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-brain" />
                    <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {project.is_public ? (
                      <Globe className="h-3.5 w-3.5 text-execute" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {project.intent ? `${project.intent} · ` : ""}
                  {new Date(project.updated_at).toLocaleDateString("es")}
                </p>
                <div className="h-24 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                  {project.html ? (
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none" dangerouslySetInnerHTML={{ __html: project.html }} />
                    </div>
                  ) : (
                    "Sin contenido"
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
