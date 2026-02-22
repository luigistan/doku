import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Mode } from "@/types/builder";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  mode: Mode;
  disabled?: boolean;
}

export function ChatInput({ onSend, mode, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  return (
    <div className="border-t border-border bg-surface-1 p-3">
      <div className={cn(
        "flex items-end gap-2 rounded-xl border bg-background p-2 transition-colors",
        mode === "brain" ? "border-brain/30 focus-within:border-brain/60" : "border-execute/30 focus-within:border-execute/60"
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={mode === "brain" ? "Describe qué quieres crear..." : "Escribe y genera al instante..."}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 scrollbar-thin"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
            mode === "brain"
              ? "bg-brain text-brain-foreground hover:bg-brain/90 disabled:opacity-30"
              : "bg-execute text-execute-foreground hover:bg-execute/90 disabled:opacity-30"
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
