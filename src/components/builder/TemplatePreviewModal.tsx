import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Monitor, Tablet, Smartphone, X, Check } from "lucide-react";

type Viewport = "desktop" | "tablet" | "mobile";

const viewportWidths: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

interface TemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  html: string;
  name: string;
  onSelect: () => void;
}

export function TemplatePreviewModal({ open, onClose, html, name, onSelect }: TemplatePreviewModalProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");

  const viewportButtons: { id: Viewport; icon: typeof Monitor; label: string }[] = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex h-[92vh] max-w-[95vw] flex-col gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">{name}</DialogTitle>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border bg-surface-1 px-4 py-2.5">
          <span className="text-sm font-semibold text-foreground">{name}</span>

          <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-0.5">
            {viewportButtons.map((v) => (
              <button
                key={v.id}
                onClick={() => setViewport(v.id)}
                className={`rounded-md p-1.5 transition-colors ${
                  viewport === v.id
                    ? "bg-brain text-brain-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={v.label}
              >
                <v.icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelect();
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-brain px-4 py-1.5 text-sm font-semibold text-brain-foreground transition-colors hover:bg-brain/80"
            >
              <Check className="h-4 w-4" />
              Elegir este template
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview iframe */}
        <div className="flex flex-1 items-start justify-center overflow-auto bg-black/30 p-4">
          <iframe
            srcDoc={html}
            title={`Full preview: ${name}`}
            sandbox="allow-scripts"
            className="h-full rounded-lg border border-border bg-white transition-all duration-300"
            style={{
              width: viewportWidths[viewport],
              maxWidth: "100%",
              minHeight: "100%",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
