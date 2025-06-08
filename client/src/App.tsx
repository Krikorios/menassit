import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingVoiceControl } from "@/components/voice/FloatingVoiceControl";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AdaptiveThemeProvider } from "@/context/AdaptiveThemeContext";
import { VoiceProvider } from "@/context/VoiceProvider";
import { NotificationProvider } from "@/context/NotificationProvider";
import { TourManagerProvider } from "@/components/onboarding/TourManager";
import { MoodDetector } from "@/components/MoodDetector";
import { RTLProvider } from "@/components/RTLProvider";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import ProfessionalDirectory from "@/pages/ProfessionalDirectory";
import OnboardingPage from "@/pages/OnboardingPage";
import TasksPage from "@/pages/TasksPage";
import FinancesPage from "@/pages/FinancesPage";
import VoicePage from "@/pages/VoicePage";
import AIPage from "@/pages/AIPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SystemMonitoringPage from "@/pages/SystemMonitoringPage";
import SettingsPage from "@/pages/SettingsPage";
import FocusPage from "@/pages/FocusPage";
import ThemePage from "@/pages/ThemePage";
import BenchmarkPage from "@/pages/BenchmarkPage";
import ChatPage from "@/pages/ChatPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={LoginPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/finances" component={FinancesPage} />
      <Route path="/voice" component={VoicePage} />
      <Route path="/ai" component={AIPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/monitoring" component={SystemMonitoringPage} />
      <Route path="/focus" component={FocusPage} />
      <Route path="/themes" component={ThemePage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/professionals" component={ProfessionalDirectory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RTLProvider>
        <ThemeProvider>
          <AuthProvider>
            <AdaptiveThemeProvider>
              <NotificationProvider>
                <VoiceProvider>
                  <TourManagerProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Router />
                      <FloatingVoiceControl />
                      <MoodDetector />
                    </TooltipProvider>
                  </TourManagerProvider>
                </VoiceProvider>
              </NotificationProvider>
            </AdaptiveThemeProvider>
          </AuthProvider>
        </ThemeProvider>
      </RTLProvider>
    </QueryClientProvider>
  );
}

export default App;
