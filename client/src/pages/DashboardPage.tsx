import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import TaskList from "@/components/tasks/TaskList";
import FinancialOverview from "@/components/financial/FinancialOverview";
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import VoiceIndicator from "@/components/voice/VoiceIndicator";
import DailyJoke from "@/components/ai/DailyJoke";
import { CommandPalette } from "@/components/CommandPalette";
import { useVoiceContext } from "@/context/VoiceProvider";
import { useNotifications } from "@/context/NotificationProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  DollarSign, 
  Mic, 
  Brain, 
  Activity, 
  TrendingUp,
  Zap,
  HelpCircle
} from "lucide-react";
import { useTourManager, getMainTourSteps } from "@/components/onboarding/TourManager";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { isListening, speak } = useVoiceContext();
  const { unreadCount } = useNotifications();
  const { startTour } = useTourManager();

  const handleStartTour = () => {
    startTour("main", getMainTourSteps());
  };

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    if (user && !user.onboardingComplete) {
      setLocation("/onboarding");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const name = user.firstName || user.username;
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="dashboard-grid">
        {/* Sidebar */}
        <Sidebar className="hidden md:block" />
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {getWelcomeMessage()}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's what's happening with your tasks and finances today.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartTour}
                  className="flex items-center space-x-1 text-xs"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Take Tour</span>
                </Button>
                <Badge variant="secondary" className="text-xs">
                  {user.role === "admin" ? "Admin" : user.role === "pro" ? "Pro" : "Standard"} User
                </Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                  Voice Active
                </Badge>
              </div>
            </div>

            {/* Daily AI Joke */}
            <DailyJoke />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Quick Actions</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    Voice Ready
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Voice Task Creation */}
                  <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <Mic className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Voice Task</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Say "Create task" to get started</p>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        Try: "Create task to review budget reports"
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Voice Expense Entry */}
                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Voice Expense</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Say "Add expense" for quick entry</p>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        Try: "Add $50 expense for groceries"
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Voice Assistant */}
                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <Mic className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Assistant</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Ask questions about your data</p>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        Try: "What's my financial summary?"
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Tasks Section */}
              <div className="space-y-6">
                <TaskList limit={5} status="pending" />
                
                {/* Voice Recorder */}
                <VoiceRecorder variant="default" className="lg:hidden" />
              </div>
              
              {/* Financial Section */}
              <div className="space-y-6">
                <FinancialOverview period="month" limit={5} />
              </div>
            </div>

            {/* Voice Recorder for Desktop */}
            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="w-5 h-5" />
                    <span>Voice Commands</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                      Local Processing
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VoiceRecorder variant="default" />
                </CardContent>
              </Card>
            </div>

            {/* System Status (for Pro/Admin users) */}
            {(user.role === "pro" || user.role === "admin") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium text-sm">STT Model</p>
                        <p className="text-xs text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium text-sm">TTS Model</p>
                        <p className="text-xs text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium text-sm">AI Model</p>
                        <p className="text-xs text-muted-foreground">Ready</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium text-sm">Database</p>
                        <p className="text-xs text-muted-foreground">Connected</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Global Voice Indicator */}
      <VoiceIndicator showControls />
    </div>
  );
}
