import { apiRequest } from "@/lib/queryClient";

export interface VoiceCommandResult {
  transcription: string;
  intent?: string;
  confidence: number;
  processingTime: number;
  actionResult?: any;
}

export interface VoiceStatus {
  stt: boolean;
  tts: boolean;
  initialized: boolean;
  uptime: number;
  timestamp: string;
}

export const voiceService = {
  async initialize(): Promise<{ message: string; status: string }> {
    const response = await apiRequest("POST", "/api/voice/initialize");
    return response.json();
  },

  async processCommand(audioData: string): Promise<VoiceCommandResult> {
    const response = await apiRequest("POST", "/api/voice/process-command", {
      audioData,
    });
    return response.json();
  },

  async speak(text: string, voice?: string): Promise<Blob> {
    const response = await apiRequest("POST", "/api/voice/speak", {
      text,
      voice,
    });
    return response.blob();
  },

  async getCommands(limit?: number): Promise<{ commands: any[] }> {
    const url = limit ? `/api/voice/commands?limit=${limit}` : "/api/voice/commands";
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async getStatus(): Promise<VoiceStatus> {
    const response = await apiRequest("GET", "/api/voice/status");
    return response.json();
  },
};
