import { Eye, Check } from "lucide-react";

interface TemplateCardProps {
  name: string;
  styleName?: string;
  html: string;
  icon?: string;
  onPreview: () => void;
  onSelect: () => void;
}

export function TemplateCard({ name, styleName, html, icon, onPreview, onSelect }: TemplateCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface-2 transition-all hover:border-brain hover:shadow-lg">
      {/* Mini-preview via scaled iframe */}
      <button
        type="button"
        onClick={onPreview}
        className="relative h-[130px] w-full cursor-pointer overflow-hidden bg-black/40"
        aria-label={`Vista previa de ${name}`}
      >
        <iframe
          srcDoc={html}
          title={`Preview ${name}`}
          sandbox="allow-scripts"
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{
            width: "1280px",
            height: "800px",
            transform: "scale(0.16)",
            border: "none",
          }}
          tabIndex={-1}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50">
          <span className="flex items-center gap-1.5 rounded-lg bg-brain px-3 py-1.5 text-xs font-semibold text-brain-foreground opacity-0 transition-opacity group-hover:opacity-100">
            <Eye className="h-3.5 w-3.5" />
            Vista previa
          </span>
        </div>
      </button>

      {/* Info + select */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-lg">{icon}</span>}
          <div className="truncate">
            <span className="block truncate text-sm font-medium text-foreground">{name}</span>
            {styleName && (
              <span className="block truncate text-[11px] text-muted-foreground">{styleName}</span>
            )}
          </div>
        </div>
        <button
          onClick={onSelect}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-brain px-2.5 py-1.5 text-xs font-semibold text-brain-foreground transition-colors hover:bg-brain/80"
        >
          <Check className="h-3 w-3" />
          Elegir
        </button>
      </div>
    </div>
  );
}
