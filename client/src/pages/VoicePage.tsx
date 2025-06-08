import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import { Mic, MicOff, Volume2, Settings, PlayCircle, StopCircle } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

export default function VoicePage() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const { isEnabled, isSupported, startListening, stopListening } = useVoice();

  const { data: commands = [], isLoading } = useQuery({
    queryKey: ["/api/voice/commands"],
  });

  const { data: status } = useQuery({
    queryKey: ["/api/voice/status"],
  });

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      toast({
        title: "Voice recognition stopped",
        description: "Voice commands are no longer being listened for.",
      });
    } else {
      startListening();
      setIsListening(true);
      toast({
        title: "Voice recognition started",
        description: "Say a command to interact with the application.",
      });
    }
  };

  const testTTS = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Voice assistant is working correctly!");
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voice Commands</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Control your application using voice commands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Voice Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Control
                </CardTitle>
                <CardDescription>
                  Start or stop voice recognition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Voice Recognition</span>
                  <Badge variant={isSupported ? "default" : "destructive"}>
                    {isSupported ? "Supported" : "Not Supported"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={isListening ? "default" : "secondary"}>
                    {isListening ? "Listening" : "Stopped"}
                  </Badge>
                </div>
                <Button
                  onClick={handleToggleListening}
                  disabled={!isSupported}
                  className="w-full"
                  variant={isListening ? "destructive" : "default"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Listening
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Text-to-Speech */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Text-to-Speech
                </CardTitle>
                <CardDescription>
                  Test and configure speech output
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">TTS Support</span>
                  <Badge variant={'speechSynthesis' in window ? "default" : "destructive"}>
                    {'speechSynthesis' in window ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <Button onClick={testTTS} className="w-full" variant="outline">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Test Speech
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Available Commands */}
          <Card>
            <CardHeader>
              <CardTitle>Available Voice Commands</CardTitle>
              <CardDescription>
                These are the voice commands you can use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Task Management</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>"Create task [task name]"</li>
                      <li>"Mark task [task name] complete"</li>
                      <li>"Show my tasks"</li>
                      <li>"What are my pending tasks?"</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Financial Commands</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>"Add expense [amount] for [description]"</li>
                      <li>"Add income [amount] from [source]"</li>
                      <li>"Show my balance"</li>
                      <li>"What did I spend this month?"</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Navigation</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>"Go to dashboard"</li>
                      <li>"Open tasks"</li>
                      <li>"Show finances"</li>
                      <li>"Open settings"</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">AI Assistant</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>"Tell me a joke"</li>
                      <li>"Give me productivity tips"</li>
                      <li>"Analyze my spending"</li>
                      <li>"What should I focus on today?"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Voice Commands */}
          {!isLoading && commands.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Commands</CardTitle>
                <CardDescription>
                  Your recent voice command history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commands.slice(0, 10).map((command: any) => (
                    <div key={command.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{command.transcription}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(command.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={command.processed ? "default" : "secondary"}>
                        {command.processed ? "Processed" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Setup Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Getting Started</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>Make sure your browser supports voice recognition (Chrome, Edge recommended)</li>
                    <li>Allow microphone access when prompted</li>
                    <li>Click "Start Listening" to begin voice recognition</li>
                    <li>Speak clearly and wait for the system to process your command</li>
                    <li>Commands are processed automatically and actions are executed</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tips for Better Recognition</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>Speak clearly and at a normal pace</li>
                    <li>Use the exact command phrases listed above</li>
                    <li>Ensure you're in a quiet environment</li>
                    <li>Wait for the previous command to finish processing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}