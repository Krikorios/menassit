import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/page-header';
import { MessageSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/Sidebar';
import { 
  MessageCircle, 
  Search, 
  Send, 
  UserPlus,
  Settings,
  Plus,
  Users,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [newChat, setNewChat] = useState({
    name: '',
    type: 'group' as 'direct' | 'group',
    description: ''
  });

  // Fetch chats
  const { data: chats, isLoading } = useQuery({
    queryKey: ['/api/chats'],
    queryFn: async () => {
      const response = await fetch('/api/chats');
      if (!response.ok) throw new Error('Failed to fetch chats');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch contacts
  const { data: contacts } = useQuery({
    queryKey: ['/api/contacts'],
    queryFn: async () => {
      const response = await fetch('/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch messages for selected chat
  const { data: messages } = useQuery({
    queryKey: ['/api/chats', selectedChat, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/chats/${selectedChat}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedChat
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (contactData: typeof newContact) => {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      if (!response.ok) throw new Error('Failed to create contact');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setContactOpen(false);
      setNewContact({ name: '', email: '', phone: '', notes: '' });
      toast({ title: "Contact added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add contact", variant: "destructive" });
    }
  });

  // Create chat mutation
  const createChatMutation = useMutation({
    mutationFn: async (chatData: typeof newChat) => {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData)
      });
      if (!response.ok) throw new Error('Failed to create chat');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      setChatOpen(false);
      setNewChat({ name: '', type: 'group', description: '' });
      toast({ title: "Chat created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create chat", variant: "destructive" });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; type: string }) => {
      const response = await fetch(`/api/chats/${selectedChat}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats', selectedChat, 'messages'] });
      setNewMessage('');
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name) {
      toast({ title: "Please enter a contact name", variant: "destructive" });
      return;
    }
    createContactMutation.mutate(newContact);
  };

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChat.name) {
      toast({ title: "Please enter a chat name", variant: "destructive" });
      return;
    }
    createChatMutation.mutate(newChat);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    sendMessageMutation.mutate({
      content: newMessage,
      type: 'text'
    });
  };

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!user) return;

    const wsUrl = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsUrl}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('Connected to chat WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        queryClient.invalidateQueries({ queryKey: ['/api/chats', data.chatId, 'messages'] });
        queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      }
    };

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [user, queryClient]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredChats = chats?.filter((chat: any) => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar className="w-64 border-r" />
        <div className="flex-1 flex">
          {/* Chat List Skeleton */}
          <div className="w-80 border-r border-border bg-background">
            <div className="p-4 border-b">
              <PageHeader title="Messages" description="Your conversations" />
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <ListSkeleton key={i} />
              ))}
            </div>
          </div>
          
          {/* Chat Content Skeleton */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <MessageSkeleton key={i} isOwn={i % 3 === 0} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <PageHeader
            title="Messages"
            description="Chat with contacts and professionals"
          >
            <div className="flex gap-2">
              <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    New Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                    <DialogDescription>
                      Add a new contact to your network.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateContact} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Contact name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@example.com"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Optional notes about this contact..."
                        value={newContact.notes}
                        onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                      />
                    </div>
                    <Button type="submit" disabled={createContactMutation.isPending}>
                      {createContactMutation.isPending ? "Adding..." : "Add Contact"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Chat</DialogTitle>
                    <DialogDescription>
                      Start a new conversation or group chat.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateChat} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chatName">Chat Name</Label>
                      <Input
                        id="chatName"
                        placeholder="Enter chat name"
                        value={newChat.name}
                        onChange={(e) => setNewChat({ ...newChat, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chatType">Chat Type</Label>
                      <select
                        id="chatType"
                        value={newChat.type}
                        onChange={(e) => setNewChat({ ...newChat, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="direct">Direct Message</option>
                        <option value="group">Group Chat</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Optional chat description..."
                        value={newChat.description}
                        onChange={(e) => setNewChat({ ...newChat, description: e.target.value })}
                      />
                    </div>
                    <Button type="submit" disabled={createChatMutation.isPending}>
                      {createChatMutation.isPending ? "Creating..." : "Create Chat"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </PageHeader>

          <div className="grid grid-cols-12 gap-6 h-[600px]">
            {/* Chat List */}
            <Card className="col-span-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Conversations</h3>
                  <Settings className="w-4 h-4 text-gray-400" />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {filteredChats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs text-gray-400">Start a new chat to begin</p>
                    </div>
                  ) : (
                    filteredChats.map((chat: any) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b ${
                          selectedChat === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {chat.name?.charAt(0) || <Users className="w-4 h-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{chat.name || 'Unnamed Chat'}</p>
                              <span className="text-xs text-gray-400">
                                {chat.updatedAt && new Date(chat.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {chat.type === 'group' ? 'Group chat' : 'Direct message'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card className="col-span-8">
              {selectedChat ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {filteredChats.find((c: any) => c.id === selectedChat)?.name?.charAt(0) || <Users className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {filteredChats.find((c: any) => c.id === selectedChat)?.name || 'Chat'}
                          </h3>
                          <p className="text-sm text-gray-500">Active now</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex flex-col h-[500px]">
                    <ScrollArea className="flex-1 p-4">
                      {messages && messages.length > 0 ? (
                        <div className="space-y-4">
                          {messages.map((message: any) => (
                            <div
                              key={message.id}
                              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.senderId === user?.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3 opacity-60" />
                                  <span className="text-xs opacity-60">
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>No messages yet</p>
                            <p className="text-sm text-gray-400">Start the conversation!</p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" size="sm" disabled={sendMessageMutation.isPending}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p className="text-gray-400">Choose a chat from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Contacts Section */}
          {contacts && contacts.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <h3 className="font-semibold">Your Contacts</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.map((contact: any) => (
                    <div key={contact.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarFallback>{contact.name?.charAt(0) || 'C'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contact.name}</p>
                        <p className="text-sm text-gray-500 truncate">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-xs text-gray-400">{contact.phone}</p>
                        )}
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
  );
}