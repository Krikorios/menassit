import React, { createContext, useContext, useState, useEffect } from "react";
import { useVoice } from "@/hooks/useVoice";

interface VoiceContextType {
  isListening: boolean;
  isSupported: boolean;
  language: 'en' | 'ar';
  startListening: () => void;
  stopListening: () => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  executeVoiceCommand: (command: string) => Promise<void>;
  speak: (text: string, lang?: 'en' | 'ar') => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { isListening, startListening, stopListening, isSupported } = useVoice();
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const executeVoiceCommand = async (command: string) => {
    try {
      // Process voice commands for navigation and actions
      const lowerCommand = command.toLowerCase();
      
      if (lowerCommand.includes('navigate') || lowerCommand.includes('go to')) {
        // Handle navigation commands
        if (lowerCommand.includes('dashboard')) {
          window.location.href = '/dashboard';
        } else if (lowerCommand.includes('tasks')) {
          window.location.href = '/dashboard?tab=tasks';
        } else if (lowerCommand.includes('finance')) {
          window.location.href = '/dashboard?tab=finance';
        }
      } else if (lowerCommand.includes('create task') || lowerCommand.includes('أنشئ مهمة')) {
        // Handle task creation
        // This would integrate with your task creation API
        console.log('Voice task creation:', command);
      } else if (lowerCommand.includes('book appointment') || lowerCommand.includes('احجز موعد')) {
        // Handle appointment booking
        console.log('Voice appointment booking:', command);
      }
    } catch (error) {
      console.error('Voice command execution error:', error);
    }
  };

  const speak = (text: string, lang: 'en' | 'ar' = language) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-OM' : 'en-US'; // Omani Arabic support
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSupported,
        language,
        startListening,
        stopListening,
        setLanguage,
        executeVoiceCommand,
        speak,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoiceContext() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error("useVoiceContext must be used within a VoiceProvider");
  }
  return context;
}