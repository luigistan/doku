import { useState, useCallback, useRef } from "react";
import { Message, Mode, PreviewState, ConversationalContext, FeedbackData } from "@/types/builder";
import { getDefaultHtml } from "@/lib/templates";
import { generateSite, BuilderResponse, logInteraction } from "@/services/builderService";

export function useBuilderState(projectId?: string) {
  const mode: Mode = "brain";
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

  // Build conversation history from last 3 turns
  const getConversationHistory = useCallback(() => {
    const relevant = messages
      .filter(m => m.id !== "welcome")
      .slice(-6) // last 3 turns (user + system each)
      .map(m => ({ role: m.role, content: m.content.substring(0, 200) }));
    return relevant;
  }, [messages]);

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
    if (pendingResult.current.logId) {
      logInteraction(pendingResult.current.logId, true);
    }
    setMessages((prev) =>
      prev.map((msg) =>
        msg.awaitingConfirmation ? { ...msg, awaitingConfirmation: false } : msg
      )
    );
    executeFromResult(pendingResult.current);
    pendingResult.current = null;
  }, [executeFromResult]);

  const requestAdjustment = useCallback(() => {
    if (pendingResult.current?.logId) {
      logInteraction(pendingResult.current.logId, false, "Usuario pidió ajustes");
    }
    // Show feedback options instead of generic message
    setMessages((prev) => [
      ...prev.map((msg) =>
        msg.awaitingConfirmation ? { ...msg, awaitingConfirmation: false } : msg
      ),
      {
        id: (Date.now() + 5).toString(),
        role: "system",
        content: "🔧 **¿Qué quieres ajustar?** Selecciona una opción o escribe lo que necesitas:",
        timestamp: new Date(),
        showFeedbackOptions: true,
      },
    ]);
    pendingResult.current = null;
  }, []);

  const submitFeedback = useCallback((feedbackData: FeedbackData) => {
    // Remove feedback options from message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.showFeedbackOptions ? { ...msg, showFeedbackOptions: false } : msg
      )
    );
    
    // Add the feedback as context and prompt user
    const feedbackMessages: Record<string, string> = {
      "wrong_intent": "🔄 Entendido, el tipo de sitio no era correcto. **¿Qué tipo de sitio necesitas?** (restaurante, tienda, portfolio, blog, etc.)",
      "wrong_name": "📝 El nombre no era correcto. **¿Cuál es el nombre correcto de tu negocio?**",
      "missing_sections": "📋 Faltan secciones. **¿Qué secciones necesitas?** (menú, galería, precios, contacto, testimonios, etc.)",
      "wrong_colors": "🎨 Los colores no eran los correctos. **¿Qué colores prefieres?** (rojo, azul, verde, oscuro, elegante, moderno, cálido, etc.)",
      "other": feedbackData.detail 
        ? `📝 Entendido: "${feedbackData.detail}". Haré los ajustes necesarios. Describe los cambios que quieres.`
        : "📝 Cuéntame qué cambios necesitas y lo ajustaré.",
    };

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 6).toString(),
        role: "system",
        content: feedbackMessages[feedbackData.reason] || feedbackMessages.other,
        timestamp: new Date(),
      },
    ]);
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

      const waitMsgId = (Date.now() + 99).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: waitMsgId,
          role: "system",
          content: "🔍 Analizando tu solicitud con IA...",
          timestamp: new Date(),
        },
      ]);

      try {
        const history = getConversationHistory();
        const result = await generateSite(content, mode, conversationalContext.current, projectId, history);

        setMessages((prev) => prev.filter((msg) => msg.id !== waitMsgId));

        conversationalContext.current = {
          previousIntent: result.intent,
          previousEntities: result.entities,
        };

        if (result.intent === "conversational") {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "system",
              content: result.conversationalResponse || "No entendí tu mensaje. Descríbeme qué sitio quieres crear.",
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
          setPreview((p) => ({ ...p, status: "idle" }));
          return;
        }

        pendingResult.current = result;

        // Show DB tables created message if applicable
        if (result.dbTablesCreated && result.dbTablesCreated.length > 0) {
          window.dispatchEvent(new CustomEvent("doku:db-enabled"));
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              role: "system",
              content: `🗄️ **Base de datos configurada automáticamente**\n\nSe crearon ${result.dbTablesCreated!.length} tablas para tu proyecto: **${result.dbTablesCreated!.join(", ")}**\n\nPuedes verlas y editarlas en ⚙️ Configuración > Base de Datos.`,
              timestamp: new Date(),
            },
          ]);
        }

        const analysisMsg: Message = {
          id: (Date.now() + 3).toString(),
          role: "system",
          content: `🧠 **Análisis completado**\n\nHe identificado: **${result.label}** (confianza: ${Math.round(result.confidence * 100)}%)\n\n**Negocio:** ${result.entities.businessName}\n**Secciones:** ${result.entities.sections.join(", ")}\n**Color:** ${result.entities.colorScheme}\n\n**Plan de ejecución:**${result.plan ? "\n" + result.plan.map((s, i) => `${i + 1}. ${s}`).join("\n") : ""}\n\n¿Ejecuto o tienes aclaraciones adicionales?`,
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
      } catch (err: unknown) {
        setMessages((prev) => prev.filter((msg) => msg.id !== waitMsgId));
        
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
    [executeFromResult, projectId, getConversationHistory]
  );

  return { messages, setMessages, preview, setPreview, isTyping, sendMessage, confirmExecution, requestAdjustment, submitFeedback };
}
