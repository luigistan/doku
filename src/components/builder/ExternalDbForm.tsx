import { useState, useEffect } from "react";
import { Loader2, Trash2, Star, Wifi, WifiOff, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  testConnection,
  saveConnection,
  getConnections,
  deleteConnection,
  setDefaultConnection,
  type DbConnection,
  type ConnectionParams,
} from "@/services/connectorService";

interface ExternalDbFormProps {
  projectId: string;
}

const DB_TYPES = [
  { value: "mysql", label: "MySQL", defaultPort: 3306 },
  { value: "postgres", label: "PostgreSQL", defaultPort: 5432 },
  { value: "mssql", label: "SQL Server", defaultPort: 1433 },
];

export function ExternalDbForm({ projectId }: ExternalDbFormProps) {
  const [connections, setConnections] = useState<DbConnection[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [type, setType] = useState("mysql");
  const [host, setHost] = useState("");
  const [port, setPort] = useState(3306);
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [useSsl, setUseSsl] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [projectId]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const data = await getConnections(projectId);
      setConnections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const dbType = DB_TYPES.find((t) => t.value === newType);
    if (dbType) setPort(dbType.defaultPort);
  };

  const getParams = (): ConnectionParams => ({
    type, host, port, database, username, password, use_ssl: useSsl,
  });

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(getParams());
      setTestResult(result);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const conn = await saveConnection(projectId, getParams());
      setConnections((prev) => [...prev, conn]);
      // Reset form
      setHost("");
      setDatabase("");
      setUsername("");
      setPassword("");
      setTestResult(null);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConnection(id);
      setConnections((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultConnection(id, projectId);
      setConnections((prev) =>
        prev.map((c) => ({ ...c, is_default: c.id === id }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const formValid = host.trim() && database.trim() && username.trim() && password.trim();

  return (
    <div className="space-y-3">
      {/* Connection form */}
      <div className="space-y-2">
        {/* Type selector */}
        <div className="flex gap-1.5">
          {DB_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              className={cn(
                "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                type === t.value
                  ? "border-brain/50 bg-brain/10 text-brain"
                  : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Host + Port */}
        <div className="flex gap-2">
          <input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="Host (ej: db.example.com)"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brain/60"
          />
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brain/60"
          />
        </div>

        {/* Database */}
        <input
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
          placeholder="Base de datos"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brain/60"
        />

        {/* Username */}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brain/60"
        />

        {/* Password */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brain/60"
        />

        {/* SSL toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useSsl}
            onChange={(e) => setUseSsl(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-xs text-muted-foreground">Usar SSL</span>
        </label>

        {/* Test result */}
        {testResult && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-xs",
              testResult.success
                ? "border border-execute/40 bg-execute/10 text-execute"
                : "border border-destructive/40 bg-destructive/10 text-destructive"
            )}
          >
            {testResult.success ? testResult.message || "Conexión exitosa" : testResult.error || "Error de conexión"}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={!formValid || testing}
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2/80 transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "Probar Conexión"}
          </button>
          <button
            onClick={handleSave}
            disabled={!formValid || saving}
            className="flex-1 rounded-lg bg-brain px-3 py-2 text-xs font-medium text-brain-foreground hover:bg-brain/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : "Guardar"}
          </button>
        </div>
      </div>

      {/* Saved connections list */}
      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : connections.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Conexiones guardadas</p>
          {connections.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
            >
              {c.status === "ok" ? (
                <Wifi className="h-3.5 w-3.5 text-execute shrink-0" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-destructive shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-mono text-foreground truncate block">
                  {c.type}://{c.username}@{c.host}:{c.port}/{c.database_name}
                </span>
              </div>
              {c.is_default && (
                <span className="rounded bg-brain/20 px-1.5 py-0.5 text-[10px] font-medium text-brain shrink-0">
                  Default
                </span>
              )}
              {!c.is_default && (
                <button
                  onClick={() => handleSetDefault(c.id)}
                  className="rounded-md p-1 text-muted-foreground hover:text-brain transition-colors shrink-0"
                  title="Establecer como default"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => handleDelete(c.id)}
                className="rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
