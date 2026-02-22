import { Mode } from "@/types/builder";
import { Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1">
      <button
        onClick={() => onModeChange("brain")}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300",
          mode === "brain"
            ? "bg-brain text-brain-foreground shadow-md glow-brain"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Brain className="h-4 w-4" />
        Brain
      </button>
      <button
        onClick={() => onModeChange("execute")}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300",
          mode === "execute"
            ? "bg-execute text-execute-foreground shadow-md glow-execute"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Zap className="h-4 w-4" />
        Ejecutar
      </button>
    </div>
  );
}
