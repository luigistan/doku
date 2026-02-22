import { useState, useCallback } from "react";
import { Message, Mode, PreviewState } from "@/types/builder";
import { findTemplate, getDefaultHtml } from "@/lib/templates";

export function useBuilderState() {
  const [mode, setMode] = useState<Mode>("brain");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "¡Hola! 👋 Soy tu asistente de desarrollo web. Describe qué tipo de sitio quieres crear y te ayudaré a construirlo.\n\nPuedes decir cosas como:\n• \"Quiero una landing page\"\n• \"Crea un portfolio\"\n• \"Necesito un blog\"\n• \"Haz un dashboard\"\n• \"Quiero una tienda online\"",
      timestamp: new Date(),
    },
  ]);
  const [preview, setPreview] = useState<PreviewState>({
    html: getDefaultHtml(),
    status: "idle",
    viewport: "desktop",
  });
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    (content: string) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      const template = findTemplate(content);

      setTimeout(() => {
        if (mode === "brain") {
          // Brain mode: show plan first
          if (template) {
            const planMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: "system",
              content: `🧠 **Análisis completado**\n\nHe identificado que quieres crear: **${template.name}**\n\n${template.description}\n\n**Plan de ejecución:**`,
              timestamp: new Date(),
              plan: template.planSteps.map((label, i) => ({
                id: `step-${i}`,
                label,
                status: "pending",
              })),
            };
            setMessages((prev) => [...prev, planMsg]);
            setIsTyping(false);

            // Animate plan steps
            template.planSteps.forEach((_, i) => {
              setTimeout(() => {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === planMsg.id && msg.plan
                      ? {
                          ...msg,
                          plan: msg.plan.map((step, j) => ({
                            ...step,
                            status: j <= i ? "done" : j === i + 1 ? "active" : "pending",
                          })),
                        }
                      : msg
                  )
                );
                // After last step, update preview
                if (i === template.planSteps.length - 1) {
                  setTimeout(() => {
                    setPreview({ html: template.html, status: "ready", viewport: preview.viewport });
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: (Date.now() + 2).toString(),
                        role: "system",
                        content: `✅ **${template.name}** generado exitosamente. Puedes ver el preview en el panel derecho.`,
                        timestamp: new Date(),
                      },
                    ]);
                  }, 500);
                }
              }, (i + 1) * 800);
            });
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "system",
                content: "🤔 No logré identificar exactamente qué tipo de sitio quieres. Intenta con:\n\n• **Landing page** - página de presentación\n• **Portfolio** - muestra de trabajos\n• **Blog** - artículos y publicaciones\n• **Dashboard** - panel de administración\n• **E-commerce** - tienda online",
                timestamp: new Date(),
              },
            ]);
            setIsTyping(false);
          }
        } else {
          // Execute mode: generate directly
          if (template) {
            setPreview({ html: template.html, status: "loading", viewport: preview.viewport });
            setTimeout(() => {
              setPreview({ html: template.html, status: "ready", viewport: preview.viewport });
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  role: "system",
                  content: `⚡ **${template.name}** generado al instante. ¡Revisa el preview!`,
                  timestamp: new Date(),
                },
              ]);
              setIsTyping(false);
            }, 1200);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "system",
                content: "No pude identificar el template. Prueba con: landing, portfolio, blog, dashboard o tienda.",
                timestamp: new Date(),
              },
            ]);
            setIsTyping(false);
          }
        }
      }, 1000);
    },
    [mode, preview.viewport]
  );

  return { mode, setMode, messages, preview, setPreview, isTyping, sendMessage };
}
