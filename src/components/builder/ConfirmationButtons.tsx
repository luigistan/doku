import { Zap, MessageSquare } from "lucide-react";

interface ConfirmationButtonsProps {
  onExecute: () => void;
  onAskMore: () => void;
}

export function ConfirmationButtons({ onExecute, onAskMore }: ConfirmationButtonsProps) {
  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
      <button
        onClick={onExecute}
        className="flex items-center gap-1.5 rounded-lg bg-execute px-3 py-2 text-xs font-medium text-execute-foreground hover:bg-execute/90 transition-colors"
      >
        <Zap className="h-3.5 w-3.5" />
        Ejecutar ahora
      </button>
      <button
        onClick={onAskMore}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Quiero ajustar algo
      </button>
    </div>
  );
}
