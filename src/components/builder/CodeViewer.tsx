import { useState } from "react";
import { X, Copy, Check, FileCode, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeViewerProps {
  open: boolean;
  onClose: () => void;
  html: string;
  projectName: string;
}

interface FileEntry {
  name: string;
  content: string;
  language: string;
}

function extractFiles(html: string, projectName: string): FileEntry[] {
  const files: FileEntry[] = [];

  // Extract CSS
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    files.push({ name: "styles.css", content: styleMatch[1].trim(), language: "css" });
  }

  // Extract JS
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
  if (scriptMatches) {
    const jsContent = scriptMatches.map(s => s.replace(/<\/?script[^>]*>/g, "").trim()).filter(Boolean).join("\n\n");
    if (jsContent) {
      files.push({ name: "script.js", content: jsContent, language: "javascript" });
    }
  }

  // Full HTML
  files.push({ name: "index.html", content: html, language: "html" });

  // TSX component
  const tsxContent = `import React from 'react';

export default function ${projectName.replace(/[^a-zA-Z]/g, "") || "Site"}() {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`${html.replace(/`/g, "\\`")}\` }} />
  );
}
`;
  files.push({ name: "Site.tsx", content: tsxContent, language: "typescript" });

  return files;
}

export function CodeViewer({ open, onClose, html, projectName }: CodeViewerProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const files = extractFiles(html, projectName);
  const current = files[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-xl border border-border bg-surface-1 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-brain" />
            <span className="text-sm font-semibold text-foreground">Código generado</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors">
              {copied ? <Check className="h-3.5 w-3.5 text-execute" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* File tabs sidebar */}
          <div className="w-48 shrink-0 border-r border-border bg-background overflow-y-auto">
            {files.map((file, i) => (
              <button
                key={file.name}
                onClick={() => setActiveFile(i)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors",
                  activeFile === i
                    ? "bg-surface-2 text-foreground border-l-2 border-brain"
                    : "text-muted-foreground hover:bg-surface-2/50 hover:text-foreground border-l-2 border-transparent"
                )}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-mono">{file.name}</span>
              </button>
            ))}
          </div>

          {/* Code content */}
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-xs leading-relaxed text-foreground font-mono whitespace-pre-wrap break-all">
              <code>{current.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
