import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface VoiceSettings {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  confidenceThreshold: number;
}

export function useVoiceIntegration() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const recognitionRef = useRef<any>(null);
  
  const [settings] = useState<VoiceSettings>({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    confidenceThreshold: 0.7,
  });

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        setupRecognition();
      }
    }
  }, []);

  const setupRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    
    const recognition = recognitionRef.current;
    recognition.continuous = settings.continuous;
    recognition.interimResults = settings.interimResults;
    recognition.lang = settings.language;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          if (result[0].confidence >= settings.confidenceThreshold) {
            processVoiceCommand(transcript);
          }
        }
      }

      if (finalTranscript) {
        setCurrentTranscript(finalTranscript);
      }
    };
  }, [settings]);

  const processVoiceCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    await executeVoiceCommand(command);
    setIsProcessing(false);
  }, []);

  const executeVoiceCommand = useCallback(async (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    try {
      // Navigation commands
      if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
        setLocation('/dashboard');
        speak('Opening dashboard');
        return;
      }
      
      if (lowerCommand.includes('task') && !lowerCommand.includes('create')) {
        setLocation('/dashboard');
        // Trigger tasks tab if possible
        speak('Opening tasks');
        return;
      }
      
      if (lowerCommand.includes('finance') || lowerCommand.includes('money')) {
        setLocation('/dashboard');
        speak('Opening finances');
        return;
      }

      // Task commands
      if (lowerCommand.includes('create task') || lowerCommand.includes('new task')) {
        const taskMatch = command.match(/(?:create task|new task)\s+(.+)/i);
        if (taskMatch) {
          await createTask(taskMatch[1].trim());
        } else {
          speak('What task would you like to create?');
        }
        return;
      }

      // Financial commands
      if (lowerCommand.includes('add expense')) {
        const amountMatch = command.match(/(\d+(?:\.\d{2})?)/);
        if (amountMatch) {
          await addExpense(parseFloat(amountMatch[1]), command);
        } else {
          speak('How much was the expense?');
        }
        return;
      }

      if (lowerCommand.includes('add income')) {
        const amountMatch = command.match(/(\d+(?:\.\d{2})?)/);
        if (amountMatch) {
          await addIncome(parseFloat(amountMatch[1]), command);
        } else {
          speak('How much income would you like to record?');
        }
        return;
      }

      // AI commands
      if (lowerCommand.includes('joke')) {
        await getJoke();
        return;
      }

      if (lowerCommand.includes('help') || lowerCommand.includes('commands')) {
        speakHelp();
        return;
      }

      // General AI chat
      await processAIChat(command);

    } catch (error) {
      console.error('Error executing voice command:', error);
      speak('Sorry, I had trouble processing that command.');
    }
  }, [setLocation, queryClient]);

  const createTask = async (title: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description: 'Created by voice command',
          priority: 'medium',
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        speak(`Task "${title}" created successfully`);
        toast({
          title: "Task Created",
          description: `"${title}" has been added`,
        });
      } else {
        speak('Failed to create task');
      }
    } catch (error) {
      speak('Error creating task');
    }
  };

  const addExpense = async (amount: number, description: string) => {
    try {
      const response = await fetch('/api/financial/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'expense',
          amount,
          description: description || 'Voice expense',
          category: 'general',
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/financial/records'] });
        queryClient.invalidateQueries({ queryKey: ['/api/financial/summary'] });
        speak(`Expense of $${amount} recorded`);
        toast({
          title: "Expense Added",
          description: `$${amount} expense recorded`,
        });
      }
    } catch (error) {
      speak('Error recording expense');
    }
  };

  const addIncome = async (amount: number, description: string) => {
    try {
      const response = await fetch('/api/financial/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'income',
          amount,
          description: description || 'Voice income',
          category: 'general',
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/financial/records'] });
        queryClient.invalidateQueries({ queryKey: ['/api/financial/summary'] });
        speak(`Income of $${amount} recorded`);
        toast({
          title: "Income Added",
          description: `$${amount} income recorded`,
        });
      }
    } catch (error) {
      speak('Error recording income');
    }
  };

  const getJoke = async () => {
    try {
      const response = await fetch('/api/ai/daily-joke', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        speak(data.joke);
      }
    } catch (error) {
      speak('Could not get a joke right now');
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
        const data = await response.json();
        speak(data.content);
      } else {
        speak('I did not understand that command');
      }
    } catch (error) {
      speak('I did not understand that command');
    }
  };

  const speakHelp = () => {
    const helpText = `You can say: Go to dashboard, Create task followed by the task name, Add expense or income with amount, Tell me a joke, or ask me any question`;
    speak(helpText);
  };

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.language;
      utterance.rate = 1.1;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    }
  }, [settings.language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setCurrentTranscript('');
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    isProcessing,
    currentTranscript,
    startListening,
    stopListening,
    toggleListening,
    speak,
    executeVoiceCommand,
  };
}