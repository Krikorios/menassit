import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceContext } from "@/context/VoiceProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  Mic, 
  Bot, 
  User, 
  Loader2,
  Volume2,
  MessageSquare,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'voice' | 'insight';
}

interface AIChatProps {
  className?: string;
  variant?: "full" | "compact";
}

export default function AIChat({ className, variant = "full" }: AIChatProps) {
  const { user } = useAuth();
  const { speak, isListening, startListening } = useVoiceContext();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "مرحباً! I'm your AI assistant. I can help you with tasks, financial insights, and answer questions in both Arabic and English. How can I assist you today?",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // AI Chat mutation
  const chatMutation = useMutation({
    mutationFn: (message: string) => apiRequest('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, userId: user?.id }),
    }),
    onSuccess: (response) => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.content || "I'm processing your request...",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      speak(response.content);
    },
    onError: (error) => {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant", 
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // AI Insights query
  const { data: insights } = useQuery({
    queryKey: ["/api/ai/insights", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    chatMutation.mutate(message);
  };

  const handleVoiceMessage = async () => {
    try {
      const result = await startListening();
      if (result?.transcription) {
        const userMessage: Message = {
          id: `user-voice-${Date.now()}`,
          role: "user",
          content: result.transcription,
          timestamp: new Date(),
          type: "voice"
        };
        setMessages(prev => [...prev, userMessage]);
        chatMutation.mutate(result.transcription);
      }
    } catch (error) {
      console.error("Voice input error:", error);
    }
  };

  const handlePlayMessage = (content: string) => {
    speak(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (variant === "compact") {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Brain className="w-4 h-4" />
            <span>AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScrollArea className="h-48" ref={scrollRef}>
            <div className="space-y-2">
              {messages.slice(-3).map((msg) => (
                <div key={msg.id} className={cn(
                  "flex gap-2 text-xs",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] rounded-lg px-2 py-1",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-xs"
            />
            <Button size="sm" onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI Assistant</span>
            <Badge variant="secondary" className="text-xs">
              Multilingual
            </Badge>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceMessage}
              disabled={isListening}
              className="flex items-center space-x-1"
            >
              <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
              <span className="text-xs">Voice</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* AI Insights Section */}
        {insights && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">AI Insight</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {insights.content || "Your productivity is trending upward this week!"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="space-y-4 pr-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      {msg.type === "voice" && (
                        <Badge variant="outline" className="text-xs">
                          <Mic className="w-3 h-3 mr-1" />
                          Voice
                        </Badge>
                      )}
                      <span className="text-xs opacity-70">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {msg.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayMessage(msg.content)}
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything in Arabic or English..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={chatMutation.isPending}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim() || chatMutation.isPending}
            className="px-3"
          >
            {chatMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessage("Show me my financial summary")}
            className="text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Financial Summary
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessage("What tasks do I have today?")}
            className="text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Today's Tasks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessage("أنشئ مهمة جديدة")}
            className="text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Arabic Command
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}