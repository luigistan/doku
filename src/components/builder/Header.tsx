import { Code2, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-surface-1 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brain text-brain-foreground text-sm font-bold">
          D
        </div>
        <span className="text-sm font-semibold text-foreground">DOKU AI</span>
        <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          BETA
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
          <Code2 className="h-3.5 w-3.5" />
          Código
        </button>
        <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
