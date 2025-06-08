import React, { createContext, useContext, useEffect } from 'react';
import { useEnhancedVoice } from '@/hooks/useEnhancedVoice';

interface EnhancedVoiceContextType {
  isListening: boolean;
  isSupported: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  voiceCommands: any[];
  settings: any;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  speak: (text: string, options?: any) => void;
  executeVoiceCommand: (command: string) => Promise<void>;
  updateSettings: (settings: any) => void;
}

const EnhancedVoiceContext = createContext<EnhancedVoiceContextType | undefined>(undefined);

export function EnhancedVoiceProvider({ children }: { children: React.ReactNode }) {
  const voiceSystem = useEnhancedVoice();

  // Initialize voice system on mount
  useEffect(() => {
    if (voiceSystem.isSupported) {
      console.log('Enhanced voice system initialized');
    }
  }, [voiceSystem.isSupported]);

  return (
    <EnhancedVoiceContext.Provider value={voiceSystem}>
      {children}
    </EnhancedVoiceContext.Provider>
  );
}

export function useEnhancedVoiceContext() {
  const context = useContext(EnhancedVoiceContext);
  if (context === undefined) {
    throw new Error('useEnhancedVoiceContext must be used within an EnhancedVoiceProvider');
  }
  return context;
}