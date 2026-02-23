import { useRef, useEffect } from "react";
import { Message } from "@/types/builder";
import { Brain } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { TemplateSelector } from "./TemplateSelector";

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onSend: (message: string) => void;
  onExecute: () => void;
  onAskMore: () => void;
}

export function ChatPanel({ messages, isTyping, onSend, onExecute, onAskMore }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex h-full flex-col bg-surface-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold text-foreground">💬 Chat</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-medium text-brain">
          <Brain className="h-4 w-4" />
          Brain
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onExecute={msg.awaitingConfirmation ? onExecute : undefined}
            onAskMore={msg.awaitingConfirmation ? onAskMore : undefined}
          />
        ))}
        {/* Show templates when only the welcome message exists */}
        {messages.length <= 1 && !isTyping && (
          <TemplateSelector onSelect={onSend} />
        )}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} mode="brain" disabled={isTyping} />
    </div>
  );
}
