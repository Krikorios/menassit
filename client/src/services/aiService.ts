import { apiRequest } from "@/lib/queryClient";

export interface JokeResponse {
  joke: string;
  category?: string;
  cached: boolean;
  processingTime?: number;
  timestamp: string;
}

export interface ChatResponse {
  response: string;
  processingTime: number;
  modelUsed: string;
  timestamp: string;
}

export interface InsightResponse {
  insight: string;
  type: string;
  processingTime: number;
  modelUsed: string;
  timestamp: string;
}

export interface AIStatus {
  loaded: boolean;
  modelPath: string;
  initialized: boolean;
  uptime: number;
  timestamp: string;
}

export const aiService = {
  async getDailyJoke(): Promise<JokeResponse> {
    const response = await apiRequest("GET", "/api/ai/daily-joke");
    return response.json();
  },

  async generateJoke(personalized: boolean = false): Promise<JokeResponse> {
    const url = personalized ? "/api/ai/generate-joke?personalized=true" : "/api/ai/generate-joke";
    const response = await apiRequest("POST", url);
    return response.json();
  },

  async chat(message: string): Promise<ChatResponse> {
    const response = await apiRequest("POST", "/api/ai/chat", { message });
    return response.json();
  },

  async generateInsight(type: "financial" | "productivity" | "general"): Promise<InsightResponse> {
    const response = await apiRequest("POST", "/api/ai/generate-insight", { type });
    return response.json();
  },

  async getInteractions(type?: string, limit?: number): Promise<{ interactions: any[] }> {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (limit) params.append("limit", limit.toString());
    
    const url = `/api/ai/interactions${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async getStatus(): Promise<AIStatus> {
    const response = await apiRequest("GET", "/api/ai/status");
    return response.json();
  },
};
