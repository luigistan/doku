import { useRef, useEffect } from "react";
import { Message, Mode } from "@/types/builder";
import { ModeToggle } from "./ModeToggle";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";

interface ChatPanelProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  messages: Message[];
  isTyping: boolean;
  onSend: (message: string) => void;
  onExecute: () => void;
  onAskMore: () => void;
}

export function ChatPanel({ mode, onModeChange, messages, isTyping, onSend, onExecute, onAskMore }: ChatPanelProps) {
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
        <ModeToggle mode={mode} onModeChange={onModeChange} />
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
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} mode={mode} disabled={isTyping} />
    </div>
  );
}
