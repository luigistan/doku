export type Mode = "brain" | "execute";

export interface FeedbackData {
  reason: string;
  detail?: string;
}

export interface Message {
  id: string;
  role: "user" | "system";
  content: string;
  timestamp: Date;
  plan?: PlanStep[];
  awaitingConfirmation?: boolean;
  analysisData?: AnalysisData;
  showFeedbackOptions?: boolean;
}

export interface AnalysisData {
  intent: string;
  confidence: number;
  label: string;
  entities: {
    businessName: string;
    sections: string[];
    colorScheme: string;
    industry: string;
  };
  plan: string[];
}

export interface PlanStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
}

export interface ConversationalContext {
  previousIntent?: string;
  previousEntities?: {
    businessName: string;
    sections: string[];
    colorScheme: string;
    industry: string;
  };
}

export type ViewportSize = "desktop" | "tablet" | "mobile";

export interface PreviewState {
  html: string;
  status: "idle" | "loading" | "updating" | "ready" | "error";
  viewport: ViewportSize;
}

export interface Template {
  id: string;
  styleId: string;
  name: string;
  styleName: string;
  keywords: string[];
  description: string;
  html: string;
  planSteps: string[];
}
