import { useState, useEffect } from 'react';
import { useVoiceIntegration } from '@/hooks/useVoiceIntegration';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingVoiceControl() {
  const {
    isListening,
    isSupported,
    isProcessing,
    currentTranscript,
    toggleListening,
    speak,
  } = useVoiceIntegration();

  const [isExpanded, setIsExpanded] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (currentTranscript) {
      setLastCommand(currentTranscript);
      setShowTranscript(true);
      const timer = setTimeout(() => setShowTranscript(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentTranscript]);

  if (!isSupported) {
    return null;
  }

  const handleVoiceToggle = () => {
    toggleListening();
    if (!isListening) {
      speak('Voice assistant activated. How can I help you?');
    }
  };

  const handleQuickCommand = (command: string) => {
    speak(command);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Transcript Display */}
      {showTranscript && currentTranscript && (
        <Card className="mb-4 max-w-xs animate-in slide-in-from-bottom-2">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground mb-1">You said:</div>
            <div className="text-sm">{currentTranscript}</div>
          </CardContent>
        </Card>
      )}

      {/* Expanded Controls */}
      {isExpanded && (
        <Card className="mb-4 w-80 animate-in slide-in-from-bottom-2">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Voice Assistant</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Quick Commands:</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickCommand('Go to dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickCommand('Go to tasks')}
                  >
                    Tasks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickCommand('Go to finances')}
                  >
                    Finances
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickCommand('Tell me a joke')}
                  >
                    Joke
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Try saying:</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• "Create task buy groceries"</div>
                  <div>• "Add expense 25 for lunch"</div>
                  <div>• "Go to dashboard"</div>
                  <div>• "What's my balance?"</div>
                </div>
              </div>

              {lastCommand && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Last Command:</div>
                  <div className="text-xs bg-muted p-2 rounded">{lastCommand}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Voice Button */}
      <div className="flex items-center gap-2">
        {isExpanded && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuickCommand('Help')}
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}

        <Button
          onClick={handleVoiceToggle}
          disabled={isProcessing}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg transition-all duration-200",
            isListening 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-primary hover:bg-primary/90",
            isProcessing && "opacity-75"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Status Indicators */}
      <div className="flex justify-center mt-2 gap-1">
        {isListening && (
          <Badge variant="destructive" className="text-xs animate-pulse">
            Listening
          </Badge>
        )}
        {isProcessing && (
          <Badge variant="default" className="text-xs">
            Processing
          </Badge>
        )}
      </div>
    </div>
  );
}