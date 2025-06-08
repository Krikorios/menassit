import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  MessageCircle, 
  Clock, 
  Lightbulb, 
  Target,
  TrendingUp,
  Send,
  Mic,
  MicOff,
  Brain,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface SmartSuggestion {
  id: string;
  type: 'task' | 'break' | 'reminder' | 'optimization';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  timeRelevant: boolean;
}

interface UserContext {
  currentTime: string;
  workPattern: 'morning-focused' | 'afternoon-creative' | 'evening-planning';
  recentActivity: string[];
  productivity: number;
  stress: number;
}

const SmartAssistant = () => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [context, setContext] = useState<UserContext>({
    currentTime: new Date().toLocaleTimeString(),
    workPattern: 'afternoon-creative',
    recentActivity: ['Reviewed tasks', 'Checked messages', 'Updated calendar'],
    productivity: 75,
    stress: 30
  });

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setContext(prev => ({
        ...prev,
        currentTime: new Date().toLocaleTimeString()
      }));
    }, 60000);

    // Generate intelligent suggestions based on context
    generateSmartSuggestions();

    return () => clearInterval(timer);
  }, []);

  const generateSmartSuggestions = () => {
    const hour = new Date().getHours();
    const timeBasedSuggestions: SmartSuggestion[] = [];

    // Morning suggestions
    if (hour >= 8 && hour < 12) {
      timeBasedSuggestions.push({
        id: 'morning-planning',
        type: 'task',
        title: 'Plan Your Day',
        description: 'Set priorities for maximum productivity',
        action: 'Open task planner',
        priority: 'high',
        timeRelevant: true
      });
    }

    // Afternoon suggestions
    if (hour >= 12 && hour < 17) {
      timeBasedSuggestions.push({
        id: 'creative-work',
        type: 'optimization',
        title: 'Creative Session',
        description: 'Perfect time for brainstorming and innovation',
        action: 'Start creative mode',
        priority: 'medium',
        timeRelevant: true
      });
    }

    // Evening suggestions
    if (hour >= 17 || hour < 8) {
      timeBasedSuggestions.push({
        id: 'review-day',
        type: 'reminder',
        title: 'Daily Review',
        description: 'Reflect on accomplishments and plan tomorrow',
        action: 'Open review mode',
        priority: 'medium',
        timeRelevant: true
      });
    }

    // Stress-based suggestions
    if (context.stress > 50) {
      timeBasedSuggestions.push({
        id: 'stress-relief',
        type: 'break',
        title: 'Take a Mindful Break',
        description: 'Your stress levels suggest a short break would help',
        action: 'Start breathing exercise',
        priority: 'high',
        timeRelevant: false
      });
    }

    // Productivity-based suggestions
    if (context.productivity < 60) {
      timeBasedSuggestions.push({
        id: 'focus-boost',
        type: 'optimization',
        title: 'Boost Your Focus',
        description: 'Switch to focus mode for better concentration',
        action: 'Activate focus mode',
        priority: 'medium',
        timeRelevant: false
      });
    }

    setSuggestions(timeBasedSuggestions);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setMessage("How can I help you be more productive today?");
        setIsListening(false);
      }, 2000);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Process the message and provide intelligent response
      setMessage('');
    }
  };

  const executeSuggestion = (suggestion: SmartSuggestion) => {
    // Execute the suggested action
    console.log(`Executing: ${suggestion.action}`);
    
    // Remove the executed suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    
    // Add to recent activity
    setContext(prev => ({
      ...prev,
      recentActivity: [suggestion.title, ...prev.recentActivity.slice(0, 2)]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return Target;
      case 'break': return Clock;
      case 'reminder': return Calendar;
      case 'optimization': return TrendingUp;
      default: return Lightbulb;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Assistant Interface */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-purple-600" />
            </motion.div>
            <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
              {t('assistant.title', 'Smart Workspace Assistant')}
            </h3>
          </div>

          {/* Context Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Clock className="h-4 w-4" />
                Current Time
              </div>
              <div className="font-semibold text-purple-900 dark:text-purple-100">
                {context.currentTime}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Brain className="h-4 w-4" />
                Productivity
              </div>
              <div className="font-semibold text-purple-900 dark:text-purple-100">
                {context.productivity}%
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="mb-6">
            <div 
              ref={chatRef}
              className="h-32 p-4 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 overflow-y-auto mb-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {t('assistant.greeting', 'Hello! I\'m analyzing your work patterns to provide personalized assistance. How can I help optimize your productivity today?')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('assistant.placeholder', 'Ask me anything about your workflow...')}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleVoiceToggle}
                variant={isListening ? "default" : "outline"}
                size="icon"
                className={isListening ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              {t('assistant.recentActivity', 'Recent Activity')}
            </h4>
            <div className="space-y-2">
              {context.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {activity}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h4 className="text-lg font-semibold">
              {t('assistant.suggestions', 'Smart Suggestions')}
            </h4>
          </div>

          <AnimatePresence>
            {suggestions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t('assistant.noSuggestions', 'All caught up! I\'ll suggest optimizations as opportunities arise.')}</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => {
                  const Icon = getTypeIcon(suggestion.type);
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className="h-5 w-5 mt-0.5 text-gray-600 dark:text-gray-400" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                {suggestion.title}
                              </h5>
                              {suggestion.timeRelevant && (
                                <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Time-sensitive
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => executeSuggestion(suggestion)}
                          size="sm"
                          className="ml-3"
                        >
                          {suggestion.action}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <CardContent className="p-0">
          <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            {t('assistant.quickActions', 'Quick Actions')}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col">
              <Target className="h-4 w-4 mb-1" />
              <span className="text-xs">Set Goal</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col">
              <Clock className="h-4 w-4 mb-1" />
              <span className="text-xs">Time Block</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col">
              <TrendingUp className="h-4 w-4 mb-1" />
              <span className="text-xs">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SmartAssistant;