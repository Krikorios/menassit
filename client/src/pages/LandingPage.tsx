import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useVoice } from "@/hooks/useVoice";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DailyJoke from "@/components/ai/DailyJoke";
import VoiceIndicator from "@/components/voice/VoiceIndicator";
import Header from "@/components/layout/Header";
import { useTheme } from "@/context/ThemeContext";
import { 
  Mic, 
  Volume2, 
  Shield, 
  Brain, 
  CheckCircle, 
  DollarSign, 
  Calendar,
  Play,
  ArrowRight,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { isListening, startListening, stopListening, isSupported } = useVoice();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Redirect to dashboard if already authenticated
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const handleGetStarted = () => {
    setLocation("/login");
  };

  const handleVoiceDemo = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      {/* Hero Section */}
      <main className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Content */}
            <div className="space-y-8">
              {/* Daily Joke Display */}
              <DailyJoke />

              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                  {t('landing.heroTitle')}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                    {" "}MenAssist
                  </span>
                </h1>
                
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('landing.heroSubtitle')}
                </p>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center mb-3">
                      <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.taskManagement')}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('landing.taskManagementDesc')}</p>
                  </CardContent>
                </Card>
                
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mb-3">
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.financialTracking')}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('landing.financialTrackingDesc')}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGetStarted}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation("/demo")}
                  className="px-8 py-4 text-lg font-semibold border-slate-300 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500"
                >
                  <Play className="w-5 h-5 mr-2" />
                  View Demo
                </Button>
              </div>
            </div>

            {/* Right Column: Voice Demo */}
            <div className="lg:pl-8">
              <Card className="shadow-2xl border-slate-200 dark:border-slate-700">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Try Voice Commands</h3>
                    
                    {/* Voice Visualizer */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <Button
                          onClick={handleVoiceDemo}
                          disabled={!isSupported}
                          className={`w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white border-0 ${
                            isListening ? 'animate-pulse scale-110' : ''
                          }`}
                        >
                          <Mic className="w-12 h-12" />
                        </Button>
                        {isListening && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={handleVoiceDemo}
                        disabled={!isSupported}
                        className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {isListening ? 'Stop Listening' : 'Start Voice Demo'}
                      </Button>
                      
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <p className="font-medium">Try saying:</p>
                        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                          <CardContent className="p-3 text-left space-y-1">
                            <p>"Create a task to review budget"</p>
                            <p>"Add $50 expense for groceries"</p>
                            <p>"Show me today's schedule"</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-slate-800 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Complete Offline Voice AI
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Enterprise-grade task and financial management with local AI processing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Local AI Processing */}
              <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Local AI Models</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Speech-to-text and text-to-speech processing entirely offline. No data leaves your premises.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Base models included</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Swappable model architecture</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Voice Task Management */}
              <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-xl flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Voice Task Creation</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Create, update, and manage tasks using natural voice commands with intelligent parsing.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Natural language processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Smart date/time extraction</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Voice Entry */}
              <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Voice Financial Tracking</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Record expenses and income through voice with automatic categorization and receipt parsing.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Auto-categorization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Receipt OCR integration</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Complete Privacy</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    All voice processing happens locally. Zero cloud dependencies, complete data sovereignty.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">On-premise deployment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Encrypted local storage</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Processing */}
              <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Real-time Processing</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Instant voice-to-text conversion and immediate AI responses for seamless interaction.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Sub-second response time</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Continuous listening mode</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Multi-user Support */}
              <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4">
                    <Volume2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Multi-Tier Access</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Standard, Pro, and Admin user roles with progressive feature unlocking and onboarding.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Progressive onboarding</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Feature-based permissions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Voice Status Indicator */}
      <VoiceIndicator />
    </div>
  );
}
