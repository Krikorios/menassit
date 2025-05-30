import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceContext } from "@/context/VoiceProvider";
import { 
  Search, 
  Home, 
  CheckSquare, 
  DollarSign, 
  Users, 
  Calendar, 
  Settings, 
  Mic,
  Moon,
  Sun,
  LogOut,
  Plus
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isListening, startListening, stopListening, speak } = useVoiceContext();

  const commands: Command[] = [
    // Navigation
    {
      id: "nav-home",
      title: "Go to Dashboard",
      subtitle: "Navigate to main dashboard",
      icon: <Home className="w-4 h-4" />,
      action: () => setLocation("/dashboard"),
      category: "Navigation",
      keywords: ["dashboard", "home", "main"],
    },
    {
      id: "nav-tasks",
      title: "View Tasks",
      subtitle: "Open task management",
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => setLocation("/dashboard?tab=tasks"),
      category: "Navigation", 
      keywords: ["tasks", "todo", "work"],
    },
    {
      id: "nav-finance",
      title: "Financial Records",
      subtitle: "Manage income and expenses",
      icon: <DollarSign className="w-4 h-4" />,
      action: () => setLocation("/dashboard?tab=finance"),
      category: "Navigation",
      keywords: ["finance", "money", "budget", "expenses"],
    },
    {
      id: "nav-professionals",
      title: "Professional Directory",
      subtitle: "Find and connect with professionals",
      icon: <Users className="w-4 h-4" />,
      action: () => setLocation("/professionals"),
      category: "Navigation",
      keywords: ["professionals", "directory", "services"],
    },
    
    // Actions
    {
      id: "action-new-task",
      title: "Create New Task",
      subtitle: "Add a new task to your list",
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        setLocation("/dashboard?tab=tasks&action=new");
        speak("Creating new task");
      },
      category: "Actions",
      keywords: ["create", "new", "task", "add"],
    },
    {
      id: "action-new-expense",
      title: "Add Expense",
      subtitle: "Record a new expense",
      icon: <DollarSign className="w-4 h-4" />,
      action: () => {
        setLocation("/dashboard?tab=finance&action=expense");
        speak("Adding new expense");
      },
      category: "Actions",
      keywords: ["expense", "add", "money", "spend"],
    },
    {
      id: "action-new-income",
      title: "Add Income",
      subtitle: "Record new income",
      icon: <DollarSign className="w-4 h-4" />,
      action: () => {
        setLocation("/dashboard?tab=finance&action=income");
        speak("Adding new income");
      },
      category: "Actions",
      keywords: ["income", "add", "money", "earn"],
    },
    
    // Voice
    {
      id: "voice-toggle",
      title: isListening ? "Stop Voice Recognition" : "Start Voice Recognition",
      subtitle: "Toggle voice commands",
      icon: <Mic className="w-4 h-4" />,
      action: () => {
        if (isListening) {
          stopListening();
          speak("Voice recognition stopped");
        } else {
          startListening();
          speak("Voice recognition started");
        }
      },
      category: "Voice",
      keywords: ["voice", "microphone", "speech", "listen"],
    },
    
    // Settings
    {
      id: "settings-theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      subtitle: "Toggle application theme",
      icon: theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      action: () => {
        toggleTheme();
        speak(`Switched to ${theme === "dark" ? "light" : "dark"} mode`);
      },
      category: "Settings",
      keywords: ["theme", "dark", "light", "appearance"],
    },
    {
      id: "settings-logout",
      title: "Sign Out",
      subtitle: "Log out of your account",
      icon: <LogOut className="w-4 h-4" />,
      action: () => {
        logout();
        speak("Signed out successfully");
      },
      category: "Account",
      keywords: ["logout", "sign out", "exit"],
    },
  ];

  // Filter commands based on user role
  const availableCommands = commands.filter(command => {
    if (command.id === "nav-professionals" && user?.role === "standard") {
      return false; // Hide professional directory for standard users
    }
    return true;
  });

  const filteredCommands = availableCommands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  );

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {} as Record<string, Command[]>);

  const handleCommandSelect = (command: Command) => {
    command.action();
    onOpenChange(false);
    setQuery("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && filteredCommands.length > 0) {
      handleCommandSelect(filteredCommands[0]);
    }
  };

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="border-b p-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search commands or say something..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <Badge variant="outline" className="text-xs">
              {isListening ? "Listening..." : "⌘K"}
            </Badge>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No commands found. Try voice commands in Arabic or English.
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                {commands.map((command) => (
                  <button
                    key={command.id}
                    onClick={() => handleCommandSelect(command)}
                    className="w-full flex items-center space-x-3 px-2 py-2 text-left hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  >
                    {command.icon}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{command.title}</div>
                      {command.subtitle && (
                        <div className="text-sm text-muted-foreground truncate">
                          {command.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-accent rounded">⌘K</kbd> to open • 
          <kbd className="px-1 py-0.5 bg-accent rounded ml-1">↵</kbd> to select • 
          Voice commands supported in Arabic and English
        </div>
      </DialogContent>
    </Dialog>
  );
}