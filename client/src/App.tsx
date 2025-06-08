import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingVoiceControl } from "@/components/voice/FloatingVoiceControl";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AdaptiveThemeProvider } from "@/context/AdaptiveThemeContext";
import { VoiceProvider } from "@/context/VoiceProvider";
import { NotificationProvider } from "@/context/NotificationProvider";
import { TourManagerProvider } from "@/components/onboarding/TourManager";
import { MoodDetector } from "@/components/MoodDetector";
import { RTLProvider } from "@/components/RTLProvider";
import { Skeleton } from "@/components/ui/skeleton";
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
import ComfortHubPage from "@/pages/ComfortHubPage";
import NotFound from "@/pages/not-found";

// Protected Route wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Check if user needs onboarding
  if (!user.onboardingComplete) {
    return <Redirect to="/onboarding" />;
  }

  return <Component />;
}

// Public route that redirects authenticated users
function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (user) {
    if (!user.onboardingComplete) {
      return <Redirect to="/onboarding" />;
    }
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PublicRoute component={LandingPage} />} />
      <Route path="/login" component={() => <PublicRoute component={LoginPage} />} />
      <Route path="/register" component={() => <PublicRoute component={LoginPage} />} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
      <Route path="/tasks" component={() => <ProtectedRoute component={TasksPage} />} />
      <Route path="/finances" component={() => <ProtectedRoute component={FinancesPage} />} />
      <Route path="/voice" component={() => <ProtectedRoute component={VoicePage} />} />
      <Route path="/ai" component={() => <ProtectedRoute component={AIPage} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={AnalyticsPage} />} />
      <Route path="/monitoring" component={() => <ProtectedRoute component={SystemMonitoringPage} />} />
      <Route path="/focus" component={() => <ProtectedRoute component={FocusPage} />} />
      <Route path="/themes" component={() => <ProtectedRoute component={ThemePage} />} />
      <Route path="/chat" component={() => <ProtectedRoute component={ChatPage} />} />
      <Route path="/comfort" component={() => <ProtectedRoute component={ComfortHubPage} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
      <Route path="/professionals" component={() => <ProtectedRoute component={ProfessionalDirectory} />} />
      <Route path="/benchmark" component={() => <ProtectedRoute component={BenchmarkPage} />} />
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
