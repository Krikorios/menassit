import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: Date;
  processed: boolean;
}

interface VoiceSettings {
  language: 'en-US' | 'ar-SA';
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  confidenceThreshold: number;
}

export function useEnhancedVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commandQueueRef = useRef<string[]>([]);
  
  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3,
    confidenceThreshold: 0.7,
  });

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
    recognition.maxAlternatives = settings.maxAlternatives;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Voice recognition started');
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Voice recognition ended');
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        toast({
          title: "No speech detected",
          description: "Please try speaking again",
          variant: "default",
        });
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          if (result[0].confidence >= settings.confidenceThreshold) {
            processVoiceCommand(transcript, result[0].confidence);
          }
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(finalTranscript || interimTranscript);
    };
  }, [settings, toast]);

  const processVoiceCommand = useCallback(async (command: string, confidence: number) => {
    const voiceCommand: VoiceCommand = {
      command,
      confidence,
      timestamp: new Date(),
      processed: false,
    };

    setVoiceCommands(prev => [...prev, voiceCommand]);
    commandQueueRef.current.push(command);
    
    if (!isProcessing) {
      executeCommandQueue();
    }
  }, [isProcessing]);

  const executeCommandQueue = useCallback(async () => {
    if (commandQueueRef.current.length === 0) return;
    
    setIsProcessing(true);
    
    while (commandQueueRef.current.length > 0) {
      const command = commandQueueRef.current.shift();
      if (command) {
        await executeVoiceCommand(command);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between commands
      }
    }
    
    setIsProcessing(false);
  }, []);

  const executeVoiceCommand = useCallback(async (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    try {
      // Navigation commands
      if (lowerCommand.includes('go to') || lowerCommand.includes('navigate') || lowerCommand.includes('open')) {
        if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
          setLocation('/dashboard');
          speak('Navigating to dashboard');
        } else if (lowerCommand.includes('task') && !lowerCommand.includes('create')) {
          setLocation('/dashboard?tab=tasks');
          speak('Opening tasks');
        } else if (lowerCommand.includes('finance') || lowerCommand.includes('money')) {
          setLocation('/dashboard?tab=finance');
          speak('Opening finances');
        } else if (lowerCommand.includes('voice') || lowerCommand.includes('command')) {
          setLocation('/dashboard?tab=voice');
          speak('Opening voice commands');
        } else if (lowerCommand.includes('ai') || lowerCommand.includes('chat')) {
          setLocation('/dashboard?tab=ai');
          speak('Opening AI assistant');
        }
        return;
      }

      // Task management commands
      if (lowerCommand.includes('create task') || lowerCommand.includes('new task') || lowerCommand.includes('add task')) {
        const taskTitle = extractTaskTitle(command);
        if (taskTitle) {
          await createTaskByVoice(taskTitle, command);
        } else {
          speak('What task would you like to create?');
        }
        return;
      }

      if (lowerCommand.includes('complete task') || lowerCommand.includes('finish task')) {
        const taskTitle = extractTaskTitle(command);
        if (taskTitle) {
          await completeTaskByVoice(taskTitle);
        } else {
          speak('Which task would you like to complete?');
        }
        return;
      }

      // Financial commands
      if (lowerCommand.includes('add expense') || lowerCommand.includes('record expense')) {
        const amount = extractAmount(command);
        const description = extractDescription(command);
        if (amount) {
          await addExpenseByVoice(amount, description);
        } else {
          speak('How much was the expense?');
        }
        return;
      }

      if (lowerCommand.includes('add income') || lowerCommand.includes('record income')) {
        const amount = extractAmount(command);
        const description = extractDescription(command);
        if (amount) {
          await addIncomeByVoice(amount, description);
        } else {
          speak('How much income would you like to record?');
        }
        return;
      }

      // General AI commands
      if (lowerCommand.includes('tell me a joke') || lowerCommand.includes('joke')) {
        await getJokeByVoice();
        return;
      }

      if (lowerCommand.includes('what can i say') || lowerCommand.includes('help') || lowerCommand.includes('commands')) {
        speakAvailableCommands();
        return;
      }

      // If no specific command matched, try general AI processing
      await processGeneralCommand(command);

    } catch (error) {
      console.error('Error executing voice command:', error);
      speak('Sorry, I had trouble processing that command.');
    }
  }, [setLocation, queryClient]);

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
        toast({
          title: "Task Created",
          description: `"${title}" has been added to your tasks`,
        });
      } else {
        speak('Failed to create task. Please try again.');
      }
    } catch (error) {
      speak('There was an error creating the task.');
    }
  };

  const completeTaskByVoice = async (taskTitle: string) => {
    try {
      // First get all tasks to find the matching one
      const tasksResponse = await fetch('/api/tasks', {
        credentials: 'include',
      });
      
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
            toast({
              title: "Task Completed",
              description: `"${matchingTask.title}" has been completed`,
            });
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
        toast({
          title: "Expense Recorded",
          description: `$${amount} expense has been added`,
        });
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
        toast({
          title: "Income Recorded",
          description: `$${amount} income has been added`,
        });
      }
    } catch (error) {
      speak('There was an error recording the income.');
    }
  };

  const getJokeByVoice = async () => {
    try {
      const response = await fetch('/api/ai/daily-joke', {
        credentials: 'include',
      });
      
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

  const processGeneralCommand = async (command: string) => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: command }),
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
      'Go to dashboard, tasks, finances, voice, or AI',
      'Create task followed by the task name',
      'Complete task followed by the task name',
      'Add expense or income followed by the amount',
      'Tell me a joke',
      'Or ask me any question'
    ].join('. ');
    
    speak(commands);
  };

  // Utility functions for command parsing
  const extractTaskTitle = (command: string): string | null => {
    const patterns = [
      /(?:create task|new task|add task)\s+(.+)/i,
      /(?:complete task|finish task)\s+(.+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const extractAmount = (command: string): number | null => {
    const patterns = [
      /\$(\d+(?:\.\d{2})?)/,
      /(\d+(?:\.\d{2})?)\s*dollars?/i,
      /(\d+(?:\.\d{2})?)/,
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0) return amount;
      }
    }
    return null;
  };

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

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.language;
      utterance.rate = options?.rate || 1.1; // Slightly faster for better UX
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 0.8;
      
      // Use a more natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(settings.language.split('-')[0]) && 
        (voice.name.includes('Enhanced') || voice.name.includes('Premium'))
      ) || voices.find(voice => voice.lang.startsWith(settings.language.split('-')[0]));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
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

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Auto-restart listening if it stops unexpectedly
  useEffect(() => {
    if (isListening && recognitionRef.current) {
      const recognition = recognitionRef.current;
      
      const handleEnd = () => {
        if (isListening) {
          // Restart after a short delay
          setTimeout(() => {
            if (isListening) {
              recognition.start();
            }
          }, 1000);
        }
      };
      
      recognition.addEventListener('end', handleEnd);
      return () => recognition.removeEventListener('end', handleEnd);
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    isProcessing,
    currentTranscript,
    voiceCommands,
    settings,
    startListening,
    stopListening,
    toggleListening,
    speak,
    executeVoiceCommand,
    updateSettings,
  };
}