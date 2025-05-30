import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import { Brain, MessageSquare, Lightbulb, Laugh, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AIPage() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: dailyJoke } = useQuery({
    queryKey: ["/api/ai/daily-joke"],
  });

  const { data: status } = useQuery({
    queryKey: ["/api/ai/status"],
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ["/api/ai/interactions"],
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await apiRequest("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      
      const aiMessage = { 
        role: "assistant", 
        content: response.content || "I'm here to help! How can I assist you today?", 
        timestamp: new Date() 
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedJoke = async () => {
    try {
      const response = await apiRequest("/api/ai/joke", {
        method: "POST",
      });
      toast({
        title: "Here's a joke for you!",
        description: response.content || "Why don't tasks ever get lonely? Because they always have deadlines to meet!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate joke. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateInsight = async (type: string) => {
    try {
      const response = await apiRequest("/api/ai/insight", {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Insight`,
        description: response.content || "Here's an insight based on your data!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate insight. Please try again.",
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Chat with your AI assistant and get personalized insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    AI Chat
                  </CardTitle>
                  <CardDescription>
                    Have a conversation with your AI assistant
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-auto space-y-4 mb-4">
                    {chatHistory.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Start a conversation with your AI assistant!</p>
                        <p className="text-sm mt-2">Try asking about your tasks, finances, or request insights.</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}>
                            <p>{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-300">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !message.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* AI Features Sidebar */}
            <div className="space-y-6">
              {/* AI Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Model Status</span>
                      <Badge variant={status?.loaded ? "default" : "secondary"}>
                        {status?.loaded ? "Ready" : "Loading"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Interactions Today</span>
                      <Badge variant="outline">
                        {interactions.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Get instant AI-powered assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={generatePersonalizedJoke} className="w-full" variant="outline">
                    <Laugh className="w-4 h-4 mr-2" />
                    Get a Joke
                  </Button>
                  <Button onClick={() => generateInsight('productivity')} className="w-full" variant="outline">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Productivity Insight
                  </Button>
                  <Button onClick={() => generateInsight('financial')} className="w-full" variant="outline">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Financial Insight
                  </Button>
                  <Button onClick={() => generateInsight('general')} className="w-full" variant="outline">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    General Insight
                  </Button>
                </CardContent>
              </Card>

              {/* Daily Joke */}
              {dailyJoke && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Laugh className="w-5 h-5" />
                      Daily Joke
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic">"{dailyJoke.joke}"</p>
                  </CardContent>
                </Card>
              )}

              {/* Recent Interactions */}
              {interactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Interactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {interactions.slice(0, 5).map((interaction: any) => (
                        <div key={interaction.id} className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="font-medium">{interaction.type}</div>
                          <div className="text-gray-600 dark:text-gray-300">
                            {new Date(interaction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}