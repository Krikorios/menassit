import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DailyJoke from "@/components/ai/DailyJoke";
import VoiceIndicator from "@/components/voice/VoiceIndicator";
import Header from "@/components/layout/Header";

import { 
  Mic, 
  Brain, 
  DollarSign, 
  Calendar,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  console.log("🚀 LandingPage is rendering...");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  // Temporarily removed voice hooks that might be causing issues
  // const { isListening, startListening, stopListening, isSupported } = useVoice();

  // Log auth state for debugging
  console.log("👤 User authentication state:", user);

  // Redirect to dashboard if already authenticated
  if (user) {
    console.log("👤 User authenticated, redirecting to dashboard...");
    setLocation("/dashboard");
    return null;
  }

  const handleGetStarted = () => {
    console.log("🔘 Get Started button clicked");
    setLocation("/login");
  };

  const handleVoiceDemo = () => {
    console.log("🔘 Voice Demo button clicked");
    // Voice functionality temporarily disabled for debugging
    // if (isListening) {
    //   stopListening();
    // } else {
    //   startListening();
    // }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      {/* Hero Section */}
      <main className="relative py-12 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            
            {/* Main Hero Content */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Your Personal
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {" "}Productivity Assistant
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                Streamline your tasks, manage finances, and boost productivity with AI-powered assistance and voice control.
              </p>
            </div>

            {/* Daily Joke in a prominent card */}
            <div className="max-w-2xl mx-auto">
              <DailyJoke />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={handleVoiceDemo}
                className="border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-3 text-lg font-semibold rounded-xl transition-all"
              >
                <Mic className="w-5 h-5 mr-2" />
                Try Voice Demo
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Task Management</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Organize and track your daily tasks efficiently with smart prioritization</p>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Financial Tracking</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Monitor your expenses and achieve your financial goals with insights</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI Assistant</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Get intelligent suggestions and automation powered by advanced AI</p>
                </CardContent>
              </Card>
            </div>

            {/* Voice Control Section */}
            <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Voice-Powered Control</h2>
                <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                  Control your productivity suite with natural voice commands. Create tasks, check finances, and navigate the app hands-free.
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ Voice control supported on your device
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Voice Status Indicator */}
      <VoiceIndicator />
    </div>
  );
}