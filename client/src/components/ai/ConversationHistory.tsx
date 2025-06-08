import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  BookOpen, 
  Trash2, 
  Download, 
  Star,
  Clock,
  Brain,
  User,
  Bot,
  Volume2
} from "lucide-react";

interface Conversation {
  id: number;
  type: string;
  prompt: string;
  response: string;
  modelUsed: string;
  processingTime: number;
  wasSpoken: boolean;
  rating?: number;
  tags?: string[];
  createdAt: string;
}

interface ConversationStats {
  totalConversations: number;
  averageRating: number;
  totalProcessingTime: number;
  favoriteTopics: string[];
  mostUsedModel: string;
}

export function ConversationHistory() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/ai/conversations", searchQuery, typeFilter],
    queryFn: () => apiRequest(`/api/ai/conversations?search=${searchQuery}&type=${typeFilter}`),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/ai/conversations/stats"],
    queryFn: () => apiRequest("/api/ai/conversations/stats"),
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/ai/conversations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations/stats"] });
      toast({
        title: t("success.deleted"),
        description: t("ai.conversationDeleted"),
      });
    },
  });

  const rateConversationMutation = useMutation({
    mutationFn: ({ id, rating }: { id: number; rating: number }) => 
      apiRequest(`/api/ai/conversations/${id}/rate`, {
        method: "POST",
        body: JSON.stringify({ rating }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations/stats"] });
      toast({
        title: t("success.updated"),
        description: t("ai.conversationRated"),
      });
    },
  });

  const exportConversationsMutation = useMutation({
    mutationFn: () => apiRequest("/api/ai/conversations/export"),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: t("success.exported"),
        description: t("ai.conversationsExported"),
      });
    },
  });

  const filteredConversations = conversations.filter((conv: Conversation) => {
    const matchesSearch = !searchQuery || 
      conv.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.response.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || conv.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const conversationTypes = [
    { value: "all", label: t("ai.allTypes") },
    { value: "joke", label: t("ai.jokes") },
    { value: "insight", label: t("ai.insights") },
    { value: "response", label: t("ai.responses") },
    { value: "task_help", label: t("ai.taskHelp") },
    { value: "financial_advice", label: t("ai.financialAdvice") },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "joke": return "😄";
      case "insight": return "💡";
      case "task_help": return "✅";
      case "financial_advice": return "💰";
      default: return "💬";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("ai.conversationHistory")}</h2>
        <Button 
          variant="outline" 
          onClick={() => exportConversationsMutation.mutate()}
          disabled={exportConversationsMutation.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("ai.exportConversations")}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("ai.totalConversations")}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("ai.averageRating")}</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating?.toFixed(1) || "N/A"}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("ai.averageResponseTime")}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalProcessingTime / stats.totalConversations)?.toFixed(0) || "N/A"}ms</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("ai.mostUsedModel")}</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{stats.mostUsedModel || "N/A"}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("ai.searchConversations")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          {conversationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation: Conversation) => (
            <Card key={conversation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(conversation.type)}</span>
                    <Badge variant="secondary">{t(`ai.${conversation.type}`)}</Badge>
                    {conversation.wasSpoken && (
                      <Badge variant="outline" className="text-xs">
                        <Volume2 className="h-3 w-3 mr-1" />
                        {t("ai.spoken")}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {conversation.processingTime}ms
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(conversation.createdAt), "MMM dd, yyyy HH:mm")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteConversationMutation.mutate(conversation.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("ai.userPrompt")}</p>
                      <p className="text-sm">{conversation.prompt}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("ai.aiResponse")}</p>
                      <p className="text-sm">{conversation.response}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {t("ai.model")}: {conversation.modelUsed}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => rateConversationMutation.mutate({ id: conversation.id, rating: star })}
                        className={`h-4 w-4 ${
                          (conversation.rating || 0) >= star 
                            ? "text-yellow-400 fill-current" 
                            : "text-gray-300"
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("ai.noConversations")}</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery || typeFilter !== "all" 
                  ? t("ai.noMatchingConversations") 
                  : t("ai.noConversationsDescription")
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed View Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("ai.conversationDetails")}</DialogTitle>
            <DialogDescription>
              {selectedConversation && format(new Date(selectedConversation.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
            </DialogDescription>
          </DialogHeader>
          {selectedConversation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t("ai.type")}:</span>
                  <Badge variant="secondary" className="ml-2">
                    {t(`ai.${selectedConversation.type}`)}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">{t("ai.processingTime")}:</span>
                  <span className="ml-2">{selectedConversation.processingTime}ms</span>
                </div>
                <div>
                  <span className="font-medium">{t("ai.model")}:</span>
                  <span className="ml-2">{selectedConversation.modelUsed}</span>
                </div>
                <div>
                  <span className="font-medium">{t("ai.wasSpoken")}:</span>
                  <span className="ml-2">{selectedConversation.wasSpoken ? t("common.yes") : t("common.no")}</span>
                </div>
              </div>
              
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t("ai.userPrompt")}</h4>
                    <p className="text-sm bg-muted p-3 rounded">{selectedConversation.prompt}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t("ai.aiResponse")}</h4>
                    <p className="text-sm bg-muted p-3 rounded">{selectedConversation.response}</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}