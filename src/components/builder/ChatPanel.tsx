import { useRef, useEffect, useState } from "react";
import { Message, FeedbackData } from "@/types/builder";
import { Brain } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { TemplateSelector } from "./TemplateSelector";

const quickCategories = [
  { id: "landing", icon: "🚀", label: "Landing Page" },
  { id: "restaurant", icon: "🍽️", label: "Restaurante" },
  { id: "ecommerce", icon: "🛒", label: "Tienda Online" },
  { id: "portfolio", icon: "💼", label: "Portfolio" },
  { id: "blog", icon: "✍️", label: "Blog" },
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "fitness", icon: "💪", label: "Gimnasio" },
  { id: "medical", icon: "🏥", label: "Clínica" },
  { id: "saas", icon: "⚡", label: "SaaS" },
];

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onSend: (message: string) => void;
  onExecute: () => void;
  onAskMore: () => void;
  onFeedback?: (feedback: FeedbackData) => void;
}

export function ChatPanel({ messages, isTyping, onSend, onExecute, onAskMore, onFeedback }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, selectedCategory]);

  const isInitial = messages.length <= 1 && !isTyping;

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
            onFeedback={msg.showFeedbackOptions ? onFeedback : undefined}
          />
        ))}

        {/* Conversational template flow */}
        {isInitial && !selectedCategory && (
          <div className="rounded-xl bg-surface-2 p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">
              🎯 ¿Qué quieres desarrollar hoy?
            </p>
            <p className="text-xs text-muted-foreground">
              Selecciona una categoría para ver templates disponibles, o escríbeme directamente lo que necesitas.
            </p>
            <div className="flex flex-wrap gap-2">
              {quickCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-surface-1 border border-border px-3 py-2 text-xs font-medium text-foreground transition-all hover:border-brain hover:bg-brain/10 hover:text-brain"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isInitial && selectedCategory && (
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver a categorías
            </button>
            <TemplateSelector onSelect={onSend} initialCategory={selectedCategory} />
          </div>
        )}

        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} mode="brain" disabled={isTyping} />
    </div>
  );
}
