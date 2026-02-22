import { Code2, Settings, ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";

interface HeaderProps {
  projectName?: string;
  projectId?: string;
  onOpenSettings: () => void;
  onOpenCode: () => void;
}

export function Header({ projectName, projectId, onOpenSettings, onOpenCode }: HeaderProps) {
  const navigate = useNavigate();

  const handleExport = async () => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement;
    if (!iframe?.contentDocument) return;
    const html = iframe.contentDocument.documentElement.outerHTML;
    const fullHtml = `<!DOCTYPE html>\n${html}`;

    // Extract CSS and JS
    const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    const scriptMatches = fullHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    const jsContent = scriptMatches?.map(s => s.replace(/<\/?script[^>]*>/g, "").trim()).filter(Boolean).join("\n\n") || "";

    const zip = new JSZip();
    zip.file("index.html", fullHtml);
    if (styleMatch) zip.file("styles.css", styleMatch[1].trim());
    if (jsContent) zip.file("script.js", jsContent);
    zip.file("README.md", `# ${projectName || "DOKU Site"}\n\nGenerado con DOKU AI - https://www.doku.red\n`);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName || "doku-site"}.zip`;
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
          Exportar ZIP
        </button>
        <button
          onClick={onOpenCode}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Code2 className="h-3.5 w-3.5" />
          Código
        </button>
        <button
          onClick={onOpenSettings}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
