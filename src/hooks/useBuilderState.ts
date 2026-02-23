import { useState, useCallback, useRef } from "react";
import { Message, Mode, PreviewState, AnalysisData, ConversationalContext } from "@/types/builder";
import { getDefaultHtml } from "@/lib/templates";
import { generateSite, BuilderResponse, logInteraction } from "@/services/builderService";

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
  const pendingResult = useRef<BuilderResponse | null>(null);
  const conversationalContext = useRef<ConversationalContext>({});

  const executeFromResult = useCallback((result: BuilderResponse) => {
    const planMsgId = (Date.now() + 10).toString();
    const successMsgId = (Date.now() + 20).toString();
    let successAdded = false;

    const planMsg: Message = {
      id: planMsgId,
      role: "system",
      content: `⚙️ **Ejecutando plan...**`,
      timestamp: new Date(),
      plan: result.plan?.map((label, i) => ({
        id: `step-${i}`,
        label,
        status: "pending" as const,
      })),
    };
    setMessages((prev) => [...prev, planMsg]);

    if (result.plan && result.plan.length > 0) {
      const totalSteps = result.plan.length;
      result.plan.forEach((_, i) => {
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === planMsgId && msg.plan
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
          if (i === totalSteps - 1 && !successAdded) {
            successAdded = true;
            setTimeout(() => {
              setPreview((p) => ({ ...p, html: result.html, status: "ready" }));
              setMessages((prev) => [
                ...prev,
                {
                  id: successMsgId,
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
      setPreview((p) => ({ ...p, html: result.html, status: "ready" }));
    }
  }, []);

  const confirmExecution = useCallback(() => {
    if (!pendingResult.current) return;
    // Log acceptance for machine learning
    if (pendingResult.current.logId) {
      logInteraction(pendingResult.current.logId, true);
    }
    // Remove awaiting state from the message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.awaitingConfirmation ? { ...msg, awaitingConfirmation: false } : msg
      )
    );
    executeFromResult(pendingResult.current);
    pendingResult.current = null;
  }, [executeFromResult]);

  const requestAdjustment = useCallback(() => {
    // Log rejection for machine learning
    if (pendingResult.current?.logId) {
      logInteraction(pendingResult.current.logId, false, "Usuario pidió ajustes");
    }
    setMessages((prev) => [
      ...prev.map((msg) =>
        msg.awaitingConfirmation ? { ...msg, awaitingConfirmation: false } : msg
      ),
      {
        id: (Date.now() + 5).toString(),
        role: "system",
        content: "🔧 ¡Perfecto! Dime qué quieres ajustar. Puedes cambiar:\n\n• **Nombre** del negocio\n• **Secciones** (agregar/quitar)\n• **Colores** (rojo, azul, verde, oscuro, elegante...)\n• **Tipo** de sitio\n• Cualquier otro detalle\n\nEscribe los cambios y volveré a analizar.",
        timestamp: new Date(),
      },
    ]);
    pendingResult.current = null;
  }, []);

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
        const result = await generateSite(content, mode, conversationalContext.current);

        // Update conversational context for next message
        conversationalContext.current = {
          previousIntent: result.intent,
          previousEntities: result.entities,
        };

        if (mode === "brain") {
          // Brain mode: show analysis and ASK for confirmation
          pendingResult.current = result;
          const analysisMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "system",
            content: `🧠 **Análisis completado**\n\nHe identificado: **${result.label}** (confianza: ${Math.round(result.confidence * 100)}%)\n\n**Negocio:** ${result.entities.businessName}\n**Secciones:** ${result.entities.sections.join(", ")}\n**Color:** ${result.entities.colorScheme}\n\n**Plan de ejecución:**${result.plan ? "\n" + result.plan.map((s, i) => `${i + 1}. ${s}`).join("\n") : ""}\n\n¿Quieres que lo ejecute o prefieres ajustar algo?`,
            timestamp: new Date(),
            awaitingConfirmation: true,
            analysisData: {
              intent: result.intent,
              confidence: result.confidence,
              label: result.label,
              entities: result.entities,
              plan: result.plan || [],
            },
          };
          setMessages((prev) => [...prev, analysisMsg]);
          setIsTyping(false);
          setPreview((p) => ({ ...p, status: "idle" }));
        } else {
          // Execute mode: generate directly
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
    [mode, preview.viewport, executeFromResult]
  );

  return { mode, setMode, messages, setMessages, preview, setPreview, isTyping, sendMessage, confirmExecution, requestAdjustment };
}
