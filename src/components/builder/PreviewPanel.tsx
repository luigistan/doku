import { useState, useEffect, useRef, useCallback } from "react";
import { PreviewState, ViewportSize } from "@/types/builder";
import { Monitor, Tablet, Smartphone, RotateCcw, Globe, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  preview: PreviewState;
  onViewportChange: (viewport: ViewportSize) => void;
  onRefresh: () => void;
  projectSlug?: string | null;
  isPublic?: boolean;
}

const viewportWidths: Record<ViewportSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const statusConfig = {
  idle: { icon: Globe, label: "Listo", color: "text-muted-foreground" },
  loading: { icon: Loader2, label: "Generando...", color: "text-brain" },
  updating: { icon: Loader2, label: "Actualizando...", color: "text-brain" },
  ready: { icon: CheckCircle2, label: "Listo", color: "text-execute" },
  error: { icon: AlertCircle, label: "Error", color: "text-destructive" },
};

function useSimulatedProgress(isLoading: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      let p: number;
      if (elapsed < 3) {
        p = (elapsed / 3) * 30;
      } else if (elapsed < 23) {
        p = 30 + ((elapsed - 3) / 20) * 30;
      } else if (elapsed < 63) {
        p = 60 + ((elapsed - 23) / 40) * 25;
      } else {
        p = 85 + ((elapsed - 63) / 60) * 10;
      }
      setProgress(Math.min(p, 95));
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  return progress;
}

export function PreviewPanel({ preview, onViewportChange, onRefresh, projectSlug, isPublic }: PreviewPanelProps) {
  const StatusIcon = statusConfig[preview.status].icon;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const progress = useSimulatedProgress(preview.status === "loading");

  // Detect if the preview seems stuck (HTML is set but iframe might not render)
  useEffect(() => {
    if (preview.status !== "ready" || !preview.html || preview.html.length < 100) {
      setLoadFailed(false);
      return;
    }

    // Give it 12 seconds to render, then show warning
    const timeout = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        const body = doc?.body;
        // If body has no visible content (just empty root div), it likely failed
        if (body && body.innerText.trim().length < 10) {
          setLoadFailed(true);
        }
      } catch {
        // Cross-origin - can't check, assume ok
      }
    }, 12000);

    setLoadFailed(false);
    return () => clearTimeout(timeout);
  }, [preview.html, preview.status]);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Viewport toggles */}
          <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-0.5">
            {([
              { key: "desktop" as ViewportSize, icon: Monitor },
              { key: "tablet" as ViewportSize, icon: Tablet },
              { key: "mobile" as ViewportSize, icon: Smartphone },
            ]).map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onViewportChange(key)}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  preview.viewport === key
                    ? "bg-surface-3 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* URL bar */}
          {isPublic && projectSlug ? (
            <a
              href={`/p/${projectSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-brain transition-colors"
            >
              <Globe className="h-3 w-3" />
              <span className="font-mono">doku.red/p/{projectSlug}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span className="font-mono">
                {isPublic ? "doku.red/preview/..." : "🔒 Privado"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status */}
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", statusConfig[preview.status].color)}>
            <StatusIcon className={cn("h-3.5 w-3.5", preview.status === "loading" && "animate-spin")} />
            {statusConfig[preview.status].label}
          </div>

          {/* Refresh */}
          <button
            onClick={() => { setLoadFailed(false); onRefresh(); }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="relative flex flex-1 items-start justify-center overflow-auto bg-surface-2 p-4">
        <div
          className="h-full overflow-hidden rounded-lg border border-border bg-background shadow-2xl transition-all duration-300"
          style={{ width: viewportWidths[preview.viewport], maxWidth: "100%" }}
        >
          <iframe
            ref={iframeRef}
            key={preview.html.length + preview.status}
            srcDoc={preview.html}
            className="h-full w-full border-0"
            title="Preview"
            sandbox="allow-scripts"
          />
        </div>

        {/* Subtle updating indicator (no overlay, preview stays visible) */}
        {preview.status === "updating" && (
          <div className="absolute top-16 right-6 z-10 flex items-center gap-2 rounded-lg border border-border bg-surface-1/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brain" />
            <span className="text-xs font-medium text-foreground">Actualizando...</span>
          </div>
        )}

        {/* DOKU loading overlay - only for first generation */}
        {preview.status === "loading" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background">
            <div
              className="select-none text-[80px] font-black tracking-widest leading-none transition-all duration-300"
              style={{
                background: `linear-gradient(to right, hsl(var(--brain)) ${progress}%, hsl(var(--muted-foreground) / 0.2) ${progress}%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              DOKU AI
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground tabular-nums">
              {Math.round(progress)}%
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Analizando con DOKU AI...
            </p>
          </div>
        )}

        {/* Load failure overlay */}
        {loadFailed && (
          <div className="absolute inset-4 flex items-center justify-center">
            <div className="rounded-xl border border-border bg-surface-1/95 p-6 text-center shadow-lg backdrop-blur-sm">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-yellow-500" />
              <p className="mb-2 text-sm font-medium text-foreground">El preview puede estar cargando</p>
              <p className="mb-4 text-xs text-muted-foreground">
                Los scripts externos (React/Babel) pueden tardar en cargar.
              </p>
              <button
                onClick={() => { setLoadFailed(false); onRefresh(); }}
                className="inline-flex items-center gap-2 rounded-lg bg-brain px-4 py-2 text-sm font-medium text-brain-foreground transition-colors hover:bg-brain/90"
              >
                <RefreshCw className="h-4 w-4" />
                Refrescar preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
