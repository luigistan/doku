import { useState, useEffect, useRef } from "react";
import { PreviewState, ViewportSize } from "@/types/builder";
import { Monitor, Tablet, Smartphone, RotateCcw, Globe, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  preview: PreviewState;
  onViewportChange: (viewport: ViewportSize) => void;
  onRefresh: () => void;
}

const viewportWidths: Record<ViewportSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const statusConfig = {
  idle: { icon: Globe, label: "Listo", color: "text-muted-foreground" },
  loading: { icon: Loader2, label: "Generando...", color: "text-brain" },
  ready: { icon: CheckCircle2, label: "Listo", color: "text-execute" },
  error: { icon: AlertCircle, label: "Error", color: "text-destructive" },
};

export function PreviewPanel({ preview, onViewportChange, onRefresh }: PreviewPanelProps) {
  const StatusIcon = statusConfig[preview.status].icon;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);

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
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span className="font-mono">preview.doku.ai</span>
          </div>
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
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

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
