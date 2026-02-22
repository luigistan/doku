import { Code2, Settings, ArrowLeft, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  projectName?: string;
  projectId?: string;
}

export function Header({ projectName, projectId }: HeaderProps) {
  const navigate = useNavigate();

  const handleExport = () => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement;
    if (!iframe?.contentDocument) return;
    const html = iframe.contentDocument.documentElement.outerHTML;
    const blob = new Blob([`<!DOCTYPE html>\n${html}`], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName || "doku-site"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-surface-1 px-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brain text-brain-foreground text-sm font-bold">
          D
        </div>
        <span className="text-sm font-semibold text-foreground">{projectName || "DOKU AI"}</span>
        <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          BETA
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar
        </button>
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
