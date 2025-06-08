import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/ui/page-header';
import { 
  MessageCircle, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Mic,
  Users,
  Settings,
  UserPlus,
  Briefcase
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  isProfessional?: boolean;
  professionalType?: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'voice';
  isEdited?: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: number;
  name?: string;
  type: 'direct' | 'group' | 'professional_service';
  participants: any[];
  messages: Message[];
}

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch contacts/chats
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['/api/chats'],
    enabled: !!user,
  });

  // Fetch messages for selected chat
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/chats', selectedChat, 'messages'],
    enabled: !!selectedChat,
  });

  // Fetch professional services
  const { data: professionalServices = [] } = useQuery({
    queryKey: ['/api/professional-services'],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { chatId: number; content: string; type: string }) => {
      return apiRequest(`/api/chats/${messageData.chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats', selectedChat, 'messages'] });
      setNewMessage('');
    },
  });

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('Connected to chat WebSocket');
      websocket.send(JSON.stringify({ type: 'join', userId: user.id }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
        if (data.chatId === selectedChat) {
          queryClient.invalidateQueries({ queryKey: ['/api/chats', selectedChat, 'messages'] });
        }
      }
    };

    websocket.onclose = () => {
      console.log('Chat WebSocket disconnected');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [user, selectedChat, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    sendMessageMutation.mutate({
      chatId: selectedChat,
      content: newMessage.trim(),
      type: 'text'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter((chat: any) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants?.some((p: any) => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background" dir={t('common.direction')}>
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('chat.title')}
            </h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('chat.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Professional Services Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{t('chat.professionalServices')}</span>
          </div>
          <ScrollArea className="h-24">
            <div className="flex gap-2">
              {professionalServices.slice(0, 4).map((service: any) => (
                <Card key={service.id} className="p-2 min-w-[100px] cursor-pointer hover:bg-accent">
                  <div className="text-center">
                    <Avatar className="h-8 w-8 mx-auto mb-1">
                      <AvatarImage src={service.avatar} />
                      <AvatarFallback>{service.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs font-medium truncate">{service.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {service.type}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChats.map((chat: any) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                  selectedChat === chat.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>
                        {chat.name?.[0] || chat.participants?.[0]?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {chat.name || chat.participants?.[0]?.name}
                        {chat.isProfessional && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {chat.professionalType}
                          </Badge>
                        )}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage || t('chat.noMessages')}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="text-xs h-5 w-5 p-0 flex items-center justify-center">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>US</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{t('chat.selectedChat')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t('chat.lastSeen')} 2 {t('chat.minutesAgo')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message: Message, index: number) => {
                  const isFromUser = message.senderId === user?.id;
                  const showDate = index === 0 || 
                    formatDate(message.timestamp) !== formatDate(messages[index - 1]?.timestamp);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(message.timestamp)}
                          </Badge>
                        </div>
                      )}
                      
                      <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex gap-2 max-w-[70%]">
                          {!isFromUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div
                            className={`rounded-lg p-3 ${
                              isFromUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(message.timestamp)}
                              </span>
                              {message.isEdited && (
                                <span className="text-xs opacity-70">{t('chat.edited')}</span>
                              )}
                              {isFromUser && (
                                <div className="text-xs opacity-70">
                                  {message.status === 'read' ? '✓✓' : '✓'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder={t('chat.typeMessage')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-12"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('chat.welcome')}</h2>
              <p className="text-muted-foreground max-w-md">
                {t('chat.welcomeDescription')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}