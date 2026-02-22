import { supabase } from "@/integrations/supabase/client";
import { findTemplate } from "@/lib/templates";

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
}

export async function generateSite(
  message: string,
  mode: "brain" | "execute"
): Promise<BuilderResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("builder-ai", {
      body: { message, mode },
    });

    if (error) throw error;
    return data as BuilderResponse;
  } catch (err) {
    console.warn("Edge function failed, using local fallback:", err);
    return localFallback(message, mode);
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
