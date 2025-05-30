import { useVoice } from "@/hooks/useVoice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceIndicatorProps {
  className?: string;
  showControls?: boolean;
}

export default function VoiceIndicator({ className, showControls = false }: VoiceIndicatorProps) {
  const { isListening, isProcessing, transcription, isSupported, startListening, stopListening, speak } = useVoice();

  if (!isSupported) {
    return null;
  }

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTestTTS = () => {
    speak("Voice processing is working correctly. You can now use voice commands to manage your tasks and finances.");
  };

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 transition-transform duration-300",
      isListening ? "translate-y-0" : "translate-y-full",
      className
    )}>
      <Card className="shadow-lg border-primary/20 bg-background/95 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {/* Voice Status Icon */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isListening 
                ? "bg-red-500 voice-recording" 
                : "bg-primary voice-pulse"
            )}>
              {isProcessing ? (
                <Activity className="w-5 h-5 text-white animate-spin" />
              ) : isListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Status Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {isProcessing 
                    ? "Processing..." 
                    : isListening 
                      ? "Listening..." 
                      : "Voice Ready"
                  }
                </span>
                <Badge variant={isListening ? "destructive" : "secondary"} className="text-xs">
                  {isListening ? "LIVE" : "STT/TTS"}
                </Badge>
              </div>
              
              {transcription && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  "{transcription}"
                </p>
              )}
              
              {!isListening && !transcription && (
                <p className="text-xs text-muted-foreground">
                  Local AI • No internet required
                </p>
              )}
            </div>

            {/* Controls */}
            {showControls && (
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleToggleVoice}
                  disabled={isProcessing}
                  className="h-8 w-8 p-0"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTestTTS}
                  className="h-8 w-8 p-0"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
