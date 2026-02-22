export type Mode = "brain" | "execute";

export interface Message {
  id: string;
  role: "user" | "system";
  content: string;
  timestamp: Date;
  plan?: PlanStep[];
  awaitingConfirmation?: boolean;
  analysisData?: AnalysisData;
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

export type ViewportSize = "desktop" | "tablet" | "mobile";

export interface PreviewState {
  html: string;
  status: "idle" | "loading" | "ready" | "error";
  viewport: ViewportSize;
}

export interface Template {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  html: string;
  planSteps: string[];
}
