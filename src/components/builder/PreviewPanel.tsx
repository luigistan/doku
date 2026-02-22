import { PreviewState, ViewportSize } from "@/types/builder";
import { Monitor, Tablet, Smartphone, RotateCcw, Globe, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
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
            onClick={onRefresh}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview iframe - using srcdoc for reliable rendering */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-surface-2 p-4">
        <div
          className="h-full overflow-hidden rounded-lg border border-border bg-background shadow-2xl transition-all duration-300"
          style={{ width: viewportWidths[preview.viewport], maxWidth: "100%" }}
        >
          <iframe
            key={preview.html.length + preview.status}
            srcDoc={preview.html}
            className="h-full w-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
