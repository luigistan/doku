import { useState } from "react";
import { FeedbackData } from "@/types/builder";
import { AlertTriangle, Type, LayoutList, Palette, MessageSquare } from "lucide-react";

interface FeedbackOptionsProps {
  onSubmit: (feedback: FeedbackData) => void;
}

const feedbackOptions = [
  { reason: "wrong_intent", label: "Tipo de sitio incorrecto", icon: AlertTriangle },
  { reason: "wrong_name", label: "Nombre del negocio mal", icon: Type },
  { reason: "missing_sections", label: "Faltan secciones", icon: LayoutList },
  { reason: "wrong_colors", label: "Colores no me gustan", icon: Palette },
  { reason: "other", label: "Otra cosa", icon: MessageSquare },
];

export function FeedbackOptions({ onSubmit }: FeedbackOptionsProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [textValue, setTextValue] = useState("");

  const handleClick = (reason: string) => {
    if (reason === "other") {
      setShowTextInput(true);
      return;
    }
    onSubmit({ reason });
  };

  const handleSubmitOther = () => {
    if (textValue.trim()) {
      onSubmit({ reason: "other", detail: textValue.trim() });
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {feedbackOptions.map(({ reason, label, icon: Icon }) => (
          <button
            key={reason}
            onClick={() => handleClick(reason)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground hover:border-brain/50 transition-all"
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
      {showTextInput && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitOther()}
            placeholder="Describe qué quieres ajustar..."
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brain/50"
            autoFocus
          />
          <button
            onClick={handleSubmitOther}
            disabled={!textValue.trim()}
            className="rounded-lg bg-brain px-3 py-1.5 text-xs font-medium text-brain-foreground hover:bg-brain/90 disabled:opacity-50 transition-colors"
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}
