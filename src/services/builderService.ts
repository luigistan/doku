import { supabase } from "@/integrations/supabase/client";
import { findTemplate } from "@/lib/templates";
import { ConversationalContext, FeedbackData } from "@/types/builder";

export interface BuilderResponse {
  intent: string;
  confidence: number;
  label: string;
  entities: {
    businessName: string;
    sections: string[];
    colorScheme: string;
    industry: string;
  };
  plan?: string[];
  html: string;
  logId?: string;
  conversationalResponse?: string;
  dbTablesCreated?: string[];
  provider?: "rules" | "ollama";
}

export async function generateSite(
  message: string,
  mode: "brain" | "execute",
  context?: ConversationalContext,
  projectId?: string,
  conversationHistory?: { role: string; content: string }[]
): Promise<BuilderResponse> {
  try {
    // Read Ollama config from localStorage - always send model
    const storageKey = projectId ? `doku_ollama_${projectId}` : "doku_ollama_default";
    let ollamaModel: string | undefined;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const config = JSON.parse(stored);
        ollamaModel = config.model || "gemma3";
      }
    } catch {}
    if (!ollamaModel) ollamaModel = "gemma3";

    const { data, error } = await supabase.functions.invoke("builder-ai", {
      body: {
        message,
        mode,
        previousIntent: context?.previousIntent,
        previousEntities: context?.previousEntities,
        projectId,
        conversationHistory,
        ollamaModel,
      },
    });

    if (error) throw error;
    return data as BuilderResponse;
  } catch (err) {
    console.warn("Edge function failed, using local fallback:", err);
    return localFallback(message, mode);
  }
}

export async function logInteraction(
  logId: string,
  accepted: boolean,
  feedback?: string | FeedbackData
): Promise<void> {
  try {
    const feedbackStr = typeof feedback === "object" ? JSON.stringify(feedback) : feedback;
    await supabase.functions.invoke("builder-ai", {
      body: { action: "feedback", logId, accepted, feedback: feedbackStr },
    });
  } catch (err) {
    console.warn("Failed to log interaction feedback:", err);
  }
}

function localFallback(message: string, mode: "brain" | "execute"): BuilderResponse {
  const template = findTemplate(message);
  if (!template) {
    throw new Error("NO_MATCH");
  }

  const response: BuilderResponse = {
    intent: template.id,
    confidence: 0.5,
    label: template.name,
    entities: {
      businessName: template.name,
      sections: [],
      colorScheme: "purple",
      industry: template.id,
    },
    html: template.html,
  };

  if (mode === "brain") {
    response.plan = template.planSteps;
  }

  return response;
}
