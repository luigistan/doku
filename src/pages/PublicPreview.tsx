import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const PublicPreview = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      const { data, error: err } = await supabase
        .from("projects")
        .select("html, is_public, name")
        .eq("id", projectId)
        .eq("is_public", true)
        .single();

      if (err || !data) {
        setError(true);
      } else {
        setHtml(data.html);
      }
      setLoading(false);
    };

    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-xl font-bold text-foreground">Proyecto no encontrado</h1>
        <p className="text-sm text-muted-foreground">Este proyecto no existe o no es público.</p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      className="h-screen w-screen border-0"
      title="Public Preview"
      sandbox="allow-scripts"
    />
  );
};

export default PublicPreview;
