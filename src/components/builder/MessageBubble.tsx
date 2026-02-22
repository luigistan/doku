import { Message } from "@/types/builder";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-brain text-brain-foreground rounded-br-md"
            : "bg-surface-2 text-foreground rounded-bl-md border border-border"
        )}
      >
        <div className="whitespace-pre-wrap">
          {message.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>

        {message.plan && (
          <div className="mt-3 space-y-2 border-t border-border/30 pt-3">
            {message.plan.map((step) => (
              <div key={step.id} className="flex items-center gap-2 text-sm">
                {step.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-execute" />
                ) : step.status === "active" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brain" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    step.status === "done" && "text-foreground",
                    step.status === "active" && "text-brain font-medium",
                    step.status === "pending" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className={cn("mt-1.5 text-[10px]", isUser ? "text-brain-foreground/60" : "text-muted-foreground")}>
          {message.timestamp.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
