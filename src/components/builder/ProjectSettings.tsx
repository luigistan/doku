import { useState } from "react";
import { X, Trash2, Globe, Lock, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectSettingsProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  projectId?: string;
  isPublic: boolean;
  onUpdateName: (name: string) => void;
  onTogglePublic: (isPublic: boolean) => void;
  onDelete: () => void;
}

export function ProjectSettings({
  open, onClose, projectName, projectId, isPublic,
  onUpdateName, onTogglePublic, onDelete,
}: ProjectSettingsProps) {
  const [name, setName] = useState(projectName);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!open) return null;

  const publicUrl = `https://www.doku.red/preview/${projectId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = () => {
    if (name.trim() && name !== projectName) {
      onUpdateName(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Configuración del proyecto</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre del proyecto</label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brain/60"
              />
              <button onClick={handleSaveName} className="rounded-lg bg-brain px-3 py-2 text-xs font-medium text-brain-foreground hover:bg-brain/90 transition-colors">
                Guardar
              </button>
            </div>
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dominio</label>
            <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted-foreground font-mono">
              www.doku.red
            </div>
          </div>

          {/* Public toggle */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Visibilidad</label>
            <button
              onClick={() => onTogglePublic(!isPublic)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                isPublic ? "border-execute/40 bg-execute/10" : "border-border bg-surface-2"
              )}
            >
              {isPublic ? <Globe className="h-4 w-4 text-execute" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">{isPublic ? "Público" : "Privado"}</div>
                <div className="text-xs text-muted-foreground">
                  {isPublic ? "Cualquiera con el link puede verlo" : "Solo tú puedes ver este proyecto"}
                </div>
              </div>
            </button>

            {isPublic && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <span className="flex-1 truncate text-xs font-mono text-muted-foreground">{publicUrl}</span>
                <button onClick={handleCopy} className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5 text-execute" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Delete */}
          <div className="border-t border-border pt-4">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar proyecto
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-destructive text-center">¿Estás seguro? Esta acción no se puede deshacer.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-surface-2 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={onDelete} className="flex-1 rounded-lg bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors">
                    Sí, eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
