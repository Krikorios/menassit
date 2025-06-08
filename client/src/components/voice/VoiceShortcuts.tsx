import { useEffect } from 'react';
import { useVoiceIntegration } from '@/hooks/useVoiceIntegration';
import { useLocation } from 'wouter';

interface VoiceShortcutsProps {
  page?: string;
  onVoiceCommand?: (command: string) => void;
}

export function VoiceShortcuts({ page, onVoiceCommand }: VoiceShortcutsProps) {
  const { speak } = useVoiceIntegration();
  const [location] = useLocation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Voice activation with Ctrl+Space
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        if (onVoiceCommand) {
          onVoiceCommand('activate');
        }
        speak('Voice assistant activated. How can I help you?');
      }

      // Quick voice commands with Ctrl+Shift+[Key]
      if (event.ctrlKey && event.shiftKey) {
        switch (event.code) {
          case 'KeyT':
            event.preventDefault();
            speak('Opening tasks');
            window.location.href = '/tasks';
            break;
          case 'KeyF':
            event.preventDefault();
            speak('Opening finances');
            window.location.href = '/finances';
            break;
          case 'KeyD':
            event.preventDefault();
            speak('Opening dashboard');
            window.location.href = '/dashboard';
            break;
          case 'KeyH':
            event.preventDefault();
            speak('Voice shortcuts: Control space to activate voice, Control shift T for tasks, Control shift F for finances, Control shift D for dashboard');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [speak, onVoiceCommand]);

  // Page-specific voice announcements
  useEffect(() => {
    const announcePageContext = () => {
      switch (page) {
        case 'tasks':
          speak('Tasks page. Say create task, complete task, or filter tasks');
          break;
        case 'finances':
          speak('Finances page. Say add expense, add income, or show summary');
          break;
        case 'dashboard':
          speak('Dashboard loaded. Say go to tasks, finances, or ask for a summary');
          break;
        case 'voice':
          speak('Voice commands page. Try saying help for available commands');
          break;
        case 'ai':
          speak('AI assistant page. Ask me anything or say tell me a joke');
          break;
      }
    };

    if (page) {
      const timer = setTimeout(announcePageContext, 1500);
      return () => clearTimeout(timer);
    }
  }, [page, speak, location]);

  return null;
}