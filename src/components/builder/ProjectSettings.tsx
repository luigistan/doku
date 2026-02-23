import { useState, useEffect, useCallback } from "react";
import { X, Trash2, Globe, Lock, Copy, Check, Loader2, AlertCircle, Database, Plus, Plug, ChevronDown, ChevronRight, Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkSlugAvailable, enableProjectDb, getAppTables, createAppTable, deleteAppTable, type AppTable } from "@/services/projectService";
import { ExternalDbForm } from "./ExternalDbForm";
import { TableDataViewer } from "./TableDataViewer";
import type { OllamaConfig } from "@/types/builder";

interface ProjectSettingsProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  projectId?: string;
  slug: string | null;
  isPublic: boolean;
  dbEnabled?: boolean;
  onUpdateName: (name: string) => void;
  onUpdateSlug: (slug: string) => void;
  onTogglePublic: (isPublic: boolean) => void;
  onDbEnabledChange?: (enabled: boolean) => void;
  onDelete: () => void;
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function ProjectSettings({
  open, onClose, projectName, projectId, slug, isPublic, dbEnabled = false,
  onUpdateName, onUpdateSlug, onTogglePublic, onDbEnabledChange, onDelete,
}: ProjectSettingsProps) {
  const [name, setName] = useState(projectName);
  const [slugInput, setSlugInput] = useState(slug || "");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tables, setTables] = useState<AppTable[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [creatingTable, setCreatingTable] = useState(false);
  const [dbTab, setDbTab] = useState<"managed" | "external">("managed");
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  // Ollama config from localStorage
  const ollamaStorageKey = projectId ? `doku_ollama_${projectId}` : "doku_ollama_default";
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>(() => {
    try {
      const stored = localStorage.getItem(ollamaStorageKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { enabled: true, model: "llama3", confidenceThreshold: 0.6 };
  });
  const [ollamaModelInput, setOllamaModelInput] = useState(ollamaConfig.model);
  const [ollamaThresholdInput, setOllamaThresholdInput] = useState(String(ollamaConfig.confidenceThreshold));

  useEffect(() => {
    setName(projectName);
    setSlugInput(slug || sanitizeSlug(projectName));
  }, [projectName, slug, open]);

  const checkSlug = useCallback(async (val: string) => {
    if (!val || val.length < 2) { setSlugStatus("idle"); return; }
    setSlugStatus("checking");
    const available = await checkSlugAvailable(val, projectId);
    setSlugStatus(available ? "available" : "taken");
  }, [projectId]);

  useEffect(() => {
    const t = setTimeout(() => { if (slugInput) checkSlug(slugInput); }, 400);
    return () => clearTimeout(t);
  }, [slugInput, checkSlug]);

  // Load tables when db is enabled
  useEffect(() => {
    if (!open || !dbEnabled || !projectId) return;
    setLoadingDb(true);
    getAppTables(projectId).then(setTables).catch(console.error).finally(() => setLoadingDb(false));
  }, [open, dbEnabled, projectId]);

  if (!open) return null;

  const handleEnableDb = async () => {
    if (!projectId) return;
    setLoadingDb(true);
    try {
      await enableProjectDb(projectId);
      onDbEnabledChange?.(true);
    } catch (e) { console.error(e); }
    finally { setLoadingDb(false); }
  };

  const handleCreateTable = async () => {
    if (!projectId || !newTableName.trim()) return;
    setCreatingTable(true);
    try {
      const t = await createAppTable(projectId, newTableName.trim());
      setTables(prev => [...prev, t]);
      setNewTableName("");
    } catch (e) { console.error(e); }
    finally { setCreatingTable(false); }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      await deleteAppTable(tableId);
      setTables(prev => prev.filter(t => t.id !== tableId));
    } catch (e) { console.error(e); }
  };

  const publicUrl = slugInput ? `https://www.doku.red/p/${slugInput}` : `https://www.doku.red/preview/${projectId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = () => {
    if (name.trim() && name !== projectName) onUpdateName(name.trim());
  };

  const handleSaveSlug = () => {
    if (slugStatus === "available" && slugInput) onUpdateSlug(slugInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-surface-1 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <h2 className="text-base font-semibold text-foreground">Configuración del proyecto</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5 overflow-y-auto flex-1">
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

          {/* Slug / Custom URL */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">URL personalizada</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono shrink-0">doku.red/p/</span>
              <div className="relative flex-1">
                <input
                  value={slugInput}
                  onChange={(e) => setSlugInput(sanitizeSlug(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground font-mono focus:outline-none focus:border-brain/60"
                  placeholder="mi-proyecto"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {slugStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {slugStatus === "available" && <Check className="h-4 w-4 text-execute" />}
                  {slugStatus === "taken" && <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
              </div>
            </div>
            {slugStatus === "taken" && (
              <p className="text-xs text-destructive">Este slug ya está en uso. Prueba con otro.</p>
            )}
            {slugStatus === "available" && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-execute flex-1">¡Disponible!</p>
                <button onClick={handleSaveSlug} className="rounded-lg bg-brain px-3 py-1.5 text-xs font-medium text-brain-foreground hover:bg-brain/90 transition-colors">
                  Guardar URL
                </button>
              </div>
            )}
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

          {/* Database */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Base de Datos</label>
            
            {/* Tabs */}
            <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
              <button
                onClick={() => setDbTab("managed")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  dbTab === "managed"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Database className="h-3.5 w-3.5" />
                DOKU Managed
              </button>
              <button
                onClick={() => setDbTab("external")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  dbTab === "external"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Plug className="h-3.5 w-3.5" />
                DB Externa
              </button>
            </div>

            {/* DOKU Managed tab */}
            {dbTab === "managed" && (
              <>
                {!dbEnabled ? (
                  <button
                    onClick={handleEnableDb}
                    disabled={loadingDb}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 transition-colors hover:bg-surface-2/80"
                  >
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">Activar Base de Datos</div>
                      <div className="text-xs text-muted-foreground">Gestiona datos de tu proyecto con tablas dinámicas</div>
                    </div>
                    {loadingDb && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-execute/40 bg-execute/10 px-3 py-2">
                      <Database className="h-4 w-4 text-execute" />
                      <span className="text-xs font-medium text-execute">Base de datos activa</span>
                    </div>

                    {loadingDb ? (
                      <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <>
                        {tables.length > 0 && (
                          <div className="space-y-1">
                            {tables.map(t => (
                              <div key={t.id} className="rounded-lg border border-border bg-background">
                                <div className="flex items-center justify-between px-3 py-2">
                                  <button
                                    onClick={() => setExpandedTable(expandedTable === t.id ? null : t.id)}
                                    className="flex items-center gap-2 text-sm text-foreground font-mono hover:text-brain transition-colors"
                                  >
                                    {expandedTable === t.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                    {t.name}
                                  </button>
                                  <button onClick={() => handleDeleteTable(t.id)} className="rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                {expandedTable === t.id && (
                                  <div className="border-t border-border px-3 pb-3">
                                    <TableDataViewer tableId={t.id} tableName={t.name} />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            value={newTableName}
                            onChange={e => setNewTableName(e.target.value)}
                            placeholder="Nombre de tabla"
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brain/60"
                            onKeyDown={e => e.key === "Enter" && handleCreateTable()}
                          />
                          <button
                            onClick={handleCreateTable}
                            disabled={creatingTable || !newTableName.trim()}
                            className="rounded-lg bg-brain px-3 py-2 text-xs font-medium text-brain-foreground hover:bg-brain/90 transition-colors disabled:opacity-50"
                          >
                            {creatingTable ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* External DB tab */}
            {dbTab === "external" && projectId && (
              <ExternalDbForm projectId={projectId} />
            )}
          </div>

          {/* Ollama AI Motor */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Motor de IA</label>
            
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-brain" />
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                ollamaConfig.enabled ? "bg-execute/10 text-execute" : "bg-muted text-muted-foreground"
              )}>
                <Zap className="h-3 w-3" />
                {ollamaConfig.enabled ? "Ollama activo" : "Solo motor de reglas"}
              </span>
            </div>

            {/* Toggle */}
            <button
              onClick={() => {
                const updated = { ...ollamaConfig, enabled: !ollamaConfig.enabled };
                setOllamaConfig(updated);
                localStorage.setItem(ollamaStorageKey, JSON.stringify(updated));
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                ollamaConfig.enabled ? "border-brain/40 bg-brain/10" : "border-border bg-surface-2"
              )}
            >
              <Brain className="h-4 w-4 text-brain" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">{ollamaConfig.enabled ? "Ollama Cloud habilitado" : "Ollama deshabilitado"}</div>
                <div className="text-xs text-muted-foreground">
                  {ollamaConfig.enabled ? "Ollama se activa cuando el motor de reglas tiene baja confianza" : "Solo se usa el motor de reglas para clasificar"}
                </div>
              </div>
            </button>

            {ollamaConfig.enabled && (
              <div className="space-y-3 rounded-lg border border-border bg-surface-2 p-3">
                {/* Model */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Modelo</label>
                  <div className="flex gap-2">
                    <input
                      value={ollamaModelInput}
                      onChange={e => setOllamaModelInput(e.target.value.replace(/:[^\s]*/g, ""))}
                      placeholder="llama3 (sin tags de versión)"
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-brain/60"
                    />
                    <button
                      onClick={() => {
                        if (!ollamaModelInput.trim()) return;
                        const updated = { ...ollamaConfig, model: ollamaModelInput.trim() };
                        setOllamaConfig(updated);
                        localStorage.setItem(ollamaStorageKey, JSON.stringify(updated));
                      }}
                      className="rounded-lg bg-brain px-3 py-2 text-xs font-medium text-brain-foreground hover:bg-brain/90 transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                {/* Threshold */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Umbral de confianza: <span className="font-mono font-semibold text-foreground">{ollamaThresholdInput}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.95"
                    step="0.05"
                    value={ollamaThresholdInput}
                    onChange={e => {
                      setOllamaThresholdInput(e.target.value);
                      const updated = { ...ollamaConfig, confidenceThreshold: parseFloat(e.target.value) };
                      setOllamaConfig(updated);
                      localStorage.setItem(ollamaStorageKey, JSON.stringify(updated));
                    }}
                    className="w-full accent-brain"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Ollama se activa si la confianza del motor de reglas es menor a este valor
                  </p>
                </div>

                {/* Info note */}
                <div className="rounded-md bg-brain/5 border border-brain/20 px-3 py-2">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    💡 El motor de reglas es rápido y sin costo. Ollama Cloud se usa como respaldo inteligente para mensajes ambiguos o industrias no cubiertas.
                  </p>
                </div>
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
