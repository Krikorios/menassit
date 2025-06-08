import React, { createContext, useContext, useState, useEffect } from "react";
import { useVoice } from "@/hooks/useVoice";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

interface VoiceContextType {
  isListening: boolean;
  isSupported: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  language: 'en' | 'ar';
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  executeVoiceCommand: (command: string) => Promise<void>;
  speak: (text: string, lang?: 'en' | 'ar') => void;
  speakAndExecute: (text: string, command?: () => Promise<void>) => Promise<void>;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function useVoiceContext() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error("useVoiceContext must be used within a VoiceProvider");
  }
  return context;
}

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { isListening, startListening, stopListening, isSupported } = useVoice();
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const executeVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    setCurrentTranscript(command);
    
    try {
      const lowerCommand = command.toLowerCase().trim();
      
      // Navigation commands with immediate feedback
      if (lowerCommand.includes('go to') || lowerCommand.includes('navigate') || lowerCommand.includes('open')) {
        if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
          setLocation('/dashboard');
          speak('Opening dashboard');
        } else if (lowerCommand.includes('task') && !lowerCommand.includes('create')) {
          setLocation('/tasks');
          speak('Opening tasks');
        } else if (lowerCommand.includes('finance') || lowerCommand.includes('money')) {
          setLocation('/finances');
          speak('Opening finances');
        } else if (lowerCommand.includes('voice')) {
          setLocation('/voice');
          speak('Opening voice commands');
        } else if (lowerCommand.includes('ai') || lowerCommand.includes('chat')) {
          setLocation('/ai');
          speak('Opening AI assistant');
        } else if (lowerCommand.includes('analytics')) {
          setLocation('/analytics');
          speak('Opening analytics');
        } else if (lowerCommand.includes('settings')) {
          setLocation('/settings');
          speak('Opening settings');
        }
        return;
      }

      // Task management with API integration
      if (lowerCommand.includes('create task') || lowerCommand.includes('new task') || lowerCommand.includes('add task')) {
        const taskMatch = command.match(/(?:create task|new task|add task)\s+(.+)/i);
        if (taskMatch) {
          await createTaskByVoice(taskMatch[1].trim(), command);
        } else {
          speak('What task would you like to create?');
        }
        return;
      }

      if (lowerCommand.includes('complete task') || lowerCommand.includes('finish task')) {
        const taskMatch = command.match(/(?:complete task|finish task)\s+(.+)/i);
        if (taskMatch) {
          await completeTaskByVoice(taskMatch[1].trim());
        } else {
          speak('Which task would you like to complete?');
        }
        return;
      }

      // Financial management with real-time updates
      if (lowerCommand.includes('add expense') || lowerCommand.includes('record expense')) {
        const amountMatch = command.match(/(\d+(?:\.\d{2})?)/);
        if (amountMatch) {
          const description = extractDescription(command);
          await addExpenseByVoice(parseFloat(amountMatch[1]), description);
        } else {
          speak('How much was the expense?');
        }
        return;
      }

      if (lowerCommand.includes('add income') || lowerCommand.includes('record income')) {
        const amountMatch = command.match(/(\d+(?:\.\d{2})?)/);
        if (amountMatch) {
          const description = extractDescription(command);
          await addIncomeByVoice(parseFloat(amountMatch[1]), description);
        } else {
          speak('How much income would you like to record?');
        }
        return;
      }

      // AI interactions
      if (lowerCommand.includes('tell me a joke') || lowerCommand.includes('joke')) {
        await getJokeByVoice();
        return;
      }

      if (lowerCommand.includes('help') || lowerCommand.includes('commands') || lowerCommand.includes('what can i say')) {
        speakAvailableCommands();
        return;
      }

      // General AI chat processing
      await processAIChat(command);

    } catch (error) {
      console.error('Voice command execution error:', error);
      speak('Sorry, I had trouble processing that command. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Voice command processing functions
  const createTaskByVoice = async (title: string, fullCommand: string) => {
    try {
      const priority = extractPriority(fullCommand) || 'medium';
      const dueDate = extractDueDate(fullCommand);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description: `Created by voice: "${fullCommand}"`,
          priority,
          dueDate,
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        speak(`Task "${title}" created successfully with ${priority} priority`);
      } else {
        speak('Failed to create task. Please try again.');
      }
    } catch (error) {
      speak('There was an error creating the task.');
    }
  };

  const completeTaskByVoice = async (taskTitle: string) => {
    try {
      const tasksResponse = await fetch('/api/tasks', { credentials: 'include' });
      
      if (tasksResponse.ok) {
        const { tasks } = await tasksResponse.json();
        const matchingTask = tasks.find((task: any) => 
          task.title.toLowerCase().includes(taskTitle.toLowerCase())
        );

        if (matchingTask) {
          const updateResponse = await fetch(`/api/tasks/${matchingTask.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: 'completed' }),
          });

          if (updateResponse.ok) {
            queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
            speak(`Task "${matchingTask.title}" marked as completed`);
          }
        } else {
          speak(`Could not find a task matching "${taskTitle}"`);
        }
      }
    } catch (error) {
      speak('There was an error completing the task.');
    }
  };

  const addExpenseByVoice = async (amount: number, description: string) => {
    try {
      const response = await fetch('/api/financial/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'expense',
          amount,
          description: description || 'Voice recorded expense',
          category: 'general',
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/financial/records'] });
        queryClient.invalidateQueries({ queryKey: ['/api/financial/summary'] });
        speak(`Expense of $${amount} recorded successfully`);
      }
    } catch (error) {
      speak('There was an error recording the expense.');
    }
  };

  const addIncomeByVoice = async (amount: number, description: string) => {
    try {
      const response = await fetch('/api/financial/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'income',
          amount,
          description: description || 'Voice recorded income',
          category: 'general',
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/financial/records'] });
        queryClient.invalidateQueries({ queryKey: ['/api/financial/summary'] });
        speak(`Income of $${amount} recorded successfully`);
      }
    } catch (error) {
      speak('There was an error recording the income.');
    }
  };

  const getJokeByVoice = async () => {
    try {
      const response = await fetch('/api/ai/daily-joke', { credentials: 'include' });
      
      if (response.ok) {
        const { joke } = await response.json();
        speak(joke);
      } else {
        speak('Sorry, I could not get a joke right now.');
      }
    } catch (error) {
      speak('There was an error getting a joke.');
    }
  };

  const processAIChat = async (message: string) => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const { content } = await response.json();
        speak(content);
      } else {
        speak('I did not understand that command. Say "help" to hear available commands.');
      }
    } catch (error) {
      speak('I did not understand that command. Say "help" to hear available commands.');
    }
  };

  const speakAvailableCommands = () => {
    const commands = [
      'You can say:',
      'Go to dashboard, tasks, finances, voice, AI, analytics, or settings',
      'Create task followed by the task name',
      'Complete task followed by the task name',
      'Add expense or income followed by the amount',
      'Tell me a joke',
      'Or ask me any question'
    ].join('. ');
    
    speak(commands);
  };

  // Utility functions
  const extractDescription = (command: string): string => {
    const patterns = [
      /(?:for|on)\s+(.+)/i,
      /(?:expense|income)\s+(?:of\s+)?(?:\$?\d+(?:\.\d{2})?)\s+(?:for|on)\s+(.+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) return match[1].trim();
    }
    return '';
  };

  const extractPriority = (command: string): 'low' | 'medium' | 'high' | null => {
    if (command.toLowerCase().includes('high priority') || command.toLowerCase().includes('urgent')) {
      return 'high';
    }
    if (command.toLowerCase().includes('low priority')) {
      return 'low';
    }
    return null;
  };

  const extractDueDate = (command: string): string | null => {
    const today = new Date();
    
    if (command.toLowerCase().includes('today')) {
      return today.toISOString().split('T')[0];
    }
    if (command.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    if (command.toLowerCase().includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }
    return null;
  };

  const speak = (text: string, lang: 'en' | 'ar' = language) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ar' ? 'ar-OM' : 'en-US';
      utterance.rate = 1.1; // Faster for better UX
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Use enhanced voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(lang === 'ar' ? 'ar' : 'en') && 
        (voice.name.includes('Enhanced') || voice.name.includes('Premium'))
      ) || voices.find(voice => voice.lang.startsWith(lang === 'ar' ? 'ar' : 'en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakAndExecute = async (text: string, command?: () => Promise<void>) => {
    speak(text);
    if (command) {
      await command();
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSupported,
        isProcessing,
        currentTranscript,
        language,
        startListening,
        stopListening,
        toggleListening,
        setLanguage,
        executeVoiceCommand,
        speak,
        speakAndExecute,
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