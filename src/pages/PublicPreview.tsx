import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const PublicPreview = () => {
  const { projectId, slug } = useParams<{ projectId?: string; slug?: string }>();
  const navigate = useNavigate();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<"not_found" | "private" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId && !slug) return;

    const load = async () => {
      // First try without is_public filter to detect private projects
      let query = supabase
        .from("projects")
        .select("html, is_public, name");

      if (slug) {
        query = query.eq("slug", slug);
      } else if (projectId) {
        query = query.eq("id", projectId);
      }

      const { data, error: err } = await query.single();

      if (err || !data) {
        setError("not_found");
      } else if (!data.is_public) {
        setError("private");
      } else {
        setHtml(data.html);
      }
      setLoading(false);
    };

    load();
  }, [projectId, slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-xl font-bold text-foreground">
          {error === "private" ? "🔒 Proyecto privado" : "Proyecto no encontrado"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {error === "private"
            ? "Este proyecto existe pero su autor lo ha marcado como privado."
            : "Este proyecto no existe o la URL es incorrecta."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-xl font-bold text-foreground">Sin contenido</h1>
        <p className="text-sm text-muted-foreground">Este proyecto aún no tiene contenido generado.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      className="h-screen w-screen border-0"
      title="Public Preview"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default PublicPreview;
