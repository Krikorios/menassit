import { useState } from "react";
import { useVoice } from "@/hooks/useVoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onTranscription?: (text: string) => void;
  onResult?: (result: any) => void;
  className?: string;
  variant?: "default" | "compact" | "floating";
}

export default function VoiceRecorder({ 
  onTranscription, 
  onResult, 
  className,
  variant = "default" 
}: VoiceRecorderProps) {
  const { 
    isListening, 
    isProcessing, 
    transcription, 
    isSupported, 
    startListening, 
    stopListening, 
    speak 
  } = useVoice();

  const [lastResult, setLastResult] = useState<any>(null);

  const handleToggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      try {
        const result = await startListening();
        if (result) {
          setLastResult(result);
          onResult?.(result);
          onTranscription?.(result.transcription);
        }
      } catch (error) {
        console.error("Voice recording error:", error);
      }
    }
  };

  const handlePlayback = () => {
    if (lastResult?.actionResult) {
      const message = getActionMessage(lastResult.actionResult);
      speak(message);
    } else if (transcription) {
      speak(`You said: ${transcription}`);
    }
  };

  const getActionMessage = (actionResult: any) => {
    switch (actionResult.type) {
      case 'task_created':
        return `Task "${actionResult.task.title}" has been created successfully.`;
      case 'expense_added':
        return `Expense of $${actionResult.record.amount} has been recorded.`;
      case 'income_added':
        return `Income of $${actionResult.record.amount} has been added.`;
      case 'tasks_retrieved':
        return `You have ${actionResult.tasks.length} pending tasks.`;
      case 'financial_summary':
        const { income, expenses, net } = actionResult.summary;
        return `Your current balance is $${net}. You have $${income} in income and $${expenses} in expenses.`;
      default:
        return "Command processed successfully.";
    }
  };

  if (!isSupported) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            Voice recording is not supported in your browser
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Button
          size="sm"
          variant={isListening ? "destructive" : "default"}
          onClick={handleToggleListening}
          disabled={isProcessing}
          className={cn(
            "relative",
            isListening && "voice-recording"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
        
        {transcription && (
          <Badge variant="secondary" className="text-xs">
            Voice: {transcription.slice(0, 20)}...
          </Badge>
        )}
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50",
        isListening ? "voice-status-indicator visible" : "voice-status-indicator",
        className
      )}>
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                onClick={handleToggleListening}
                disabled={isProcessing}
                className={cn(
                  "w-12 h-12 rounded-full voice-gradient",
                  isListening && "voice-recording"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : isListening ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </Button>
              
              {isListening && (
                <div className="text-sm">
                  <div className="font-medium">Listening...</div>
                  <div className="text-muted-foreground">Speak your command</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Voice Control Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "default"}
              onClick={handleToggleListening}
              disabled={isProcessing}
              className={cn(
                "w-20 h-20 rounded-full voice-gradient",
                isListening && "voice-recording"
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              ) : isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </Button>
          </div>

          {/* Status */}
          <div className="text-center">
            <h3 className="font-semibold">
              {isProcessing 
                ? "Processing..." 
                : isListening 
                  ? "Listening..." 
                  : "Ready to Listen"
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              {isListening 
                ? "Speak your command now" 
                : "Click the microphone to start"
              }
            </p>
          </div>

          {/* Transcription Display */}
          {transcription && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">Transcription:</div>
                    <div className="text-sm">{transcription}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlayback}
                    className="ml-2"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {lastResult?.intent && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{lastResult.intent}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Confidence: {Math.round(lastResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Result */}
          {lastResult?.actionResult && (
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  Action Completed:
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {getActionMessage(lastResult.actionResult)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Tips */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="font-medium">Try saying:</div>
            <div>"Create task to review budget"</div>
            <div>"Add $50 expense for groceries"</div>
            <div>"Show me my financial summary"</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
