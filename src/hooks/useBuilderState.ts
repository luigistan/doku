import { useState, useCallback } from "react";
import { Message, Mode, PreviewState } from "@/types/builder";
import { getDefaultHtml } from "@/lib/templates";
import { generateSite } from "@/services/builderService";

export function useBuilderState() {
  const [mode, setMode] = useState<Mode>("brain");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "¡Hola! 👋 Soy **DOKU AI**, tu motor de inteligencia artificial para crear sitios web profesionales.\n\nDescríbeme qué quieres crear y lo generaré al instante. Puedo entender:\n• Tipo de sitio (landing, restaurante, portfolio, blog, tienda, gym, agencia...)\n• Nombre del negocio\n• Secciones específicas (menú, contacto, galería, precios...)\n• Colores preferidos\n\n**Ejemplo:** \"Quiero una landing para mi cafetería El Buen Café con menú y contacto\"",
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
    async (content: string) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setPreview((p) => ({ ...p, status: "loading" }));

      try {
        const result = await generateSite(content, mode);

        if (mode === "brain" && result.plan) {
          // Brain mode: show analysis + animated plan
          const planMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "system",
            content: `🧠 **Análisis completado**\n\nHe identificado: **${result.label}** (confianza: ${Math.round(result.confidence * 100)}%)\n\n**Negocio:** ${result.entities.businessName}\n**Secciones:** ${result.entities.sections.join(", ")}\n**Color:** ${result.entities.colorScheme}\n\n**Plan de ejecución:**`,
            timestamp: new Date(),
            plan: result.plan.map((label, i) => ({
              id: `step-${i}`,
              label,
              status: "pending" as const,
            })),
          };
          setMessages((prev) => [...prev, planMsg]);
          setIsTyping(false);

          // Animate plan steps
          result.plan.forEach((_, i) => {
            setTimeout(() => {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === planMsg.id && msg.plan
                    ? {
                        ...msg,
                        plan: msg.plan.map((step, j) => ({
                          ...step,
                          status: j <= i ? ("done" as const) : j === i + 1 ? ("active" as const) : ("pending" as const),
                        })),
                      }
                    : msg
                )
              );
              if (i === (result.plan?.length ?? 0) - 1) {
                setTimeout(() => {
                  setPreview({ html: result.html, status: "ready", viewport: preview.viewport });
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: (Date.now() + 2).toString(),
                      role: "system",
                      content: `✅ **${result.entities.businessName}** generado exitosamente con ${result.entities.sections.length} secciones. ¡Revisa el preview!`,
                      timestamp: new Date(),
                    },
                  ]);
                }, 500);
              }
            }, (i + 1) * 600);
          });
        } else {
          // Execute mode: show result directly
          setPreview({ html: result.html, status: "ready", viewport: preview.viewport });
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "system",
              content: `⚡ **${result.entities.businessName}** (${result.label}) generado al instante con ${result.entities.sections.length} secciones. ¡Revisa el preview!`,
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error && err.message === "NO_MATCH"
          ? "🤔 No logré identificar qué tipo de sitio quieres. Intenta con:\n\n• **Landing page** - página de presentación\n• **Restaurante** - con menú y contacto\n• **Portfolio** - muestra de trabajos\n• **Blog** - artículos y publicaciones\n• **Dashboard** - panel de administración\n• **E-commerce** - tienda online\n• **Gimnasio** - fitness y planes\n• **Agencia** - servicios digitales"
          : `❌ Hubo un error al generar el sitio. Intenta de nuevo.\n\nDetalle: ${err}`;

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "system",
            content: errMsg,
            timestamp: new Date(),
          },
        ]);
        setPreview((p) => ({ ...p, status: "idle" }));
        setIsTyping(false);
      }
    },
    [mode, preview.viewport]
  );

  return { mode, setMode, messages, setMessages, preview, setPreview, isTyping, sendMessage };
}
