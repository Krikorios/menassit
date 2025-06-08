import React, { createContext, useContext, useState, useEffect } from 'react';
import { OnboardingTour, TourStep } from './OnboardingTour';
import { useAuth } from '@/hooks/useAuth';

interface TourManagerContextType {
  startTour: (tourId: string, steps: TourStep[]) => void;
  skipTour: () => void;
  completeTour: () => void;
  isActive: boolean;
  currentTour: string | null;
}

const TourManagerContext = createContext<TourManagerContextType | undefined>(undefined);

export const useTourManager = () => {
  const context = useContext(TourManagerContext);
  if (!context) {
    throw new Error('useTourManager must be used within a TourManagerProvider');
  }
  return context;
};

interface TourManagerProviderProps {
  children: React.ReactNode;
}

export const TourManagerProvider: React.FC<TourManagerProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [currentSteps, setCurrentSteps] = useState<TourStep[]>([]);

  // Check if user should see onboarding tour
  useEffect(() => {
    if (user && !user.hasCompletedOnboarding) {
      // Auto-start main tour for new users
      const mainTourSteps = getMainTourSteps();
      startTour('main', mainTourSteps);
    }
  }, [user]);

  const startTour = (tourId: string, steps: TourStep[]) => {
    setCurrentTour(tourId);
    setCurrentSteps(steps);
    setIsActive(true);
  };

  const skipTour = () => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentSteps([]);
    
    // Mark onboarding as completed if it's the main tour
    if (currentTour === 'main' && user) {
      markOnboardingComplete();
    }
  };

  const completeTour = () => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentSteps([]);
    
    // Mark onboarding as completed if it's the main tour
    if (currentTour === 'main' && user) {
      markOnboardingComplete();
    }
  };

  const markOnboardingComplete = async () => {
    try {
      const response = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Failed to mark onboarding as complete');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value = {
    startTour,
    skipTour,
    completeTour,
    isActive,
    currentTour,
  };

  return (
    <TourManagerContext.Provider value={value}>
      {children}
      <OnboardingTour
        isActive={isActive}
        onComplete={completeTour}
        onSkip={skipTour}
        steps={currentSteps}
      />
    </TourManagerContext.Provider>
  );
};

// Define tour steps for different sections
export const getMainTourSteps = (): TourStep[] => [
  {
    id: 'welcome',
    target: '[data-tour="sidebar"]',
    title: 'onboarding.welcome.title',
    content: 'onboarding.welcome.content',
    position: 'right'
  },
  {
    id: 'navigation',
    target: '[data-tour="sidebar-nav"]',
    title: 'onboarding.navigation.title',
    content: 'onboarding.navigation.content',
    position: 'right',
    action: 'hover'
  },
  {
    id: 'dashboard',
    target: '[data-tour="dashboard-link"]',
    title: 'onboarding.dashboard.title',
    content: 'onboarding.dashboard.content',
    position: 'right',
    action: 'click'
  },
  {
    id: 'tasks',
    target: '[data-tour="tasks-section"]',
    title: 'onboarding.tasks.title',
    content: 'onboarding.tasks.content',
    position: 'bottom'
  },
  {
    id: 'create-task',
    target: '[data-tour="create-task-btn"]',
    title: 'onboarding.createTask.title',
    content: 'onboarding.createTask.content',
    position: 'bottom',
    action: 'click',
    optional: true
  },
  {
    id: 'finances',
    target: '[data-tour="finances-link"]',
    title: 'onboarding.finances.title',
    content: 'onboarding.finances.content',
    position: 'right'
  },
  {
    id: 'voice-control',
    target: '[data-tour="voice-button"]',
    title: 'onboarding.voice.title',
    content: 'onboarding.voice.content',
    position: 'top',
    optional: true
  },
  {
    id: 'ai-assistant',
    target: '[data-tour="ai-link"]',
    title: 'onboarding.ai.title',
    content: 'onboarding.ai.content',
    position: 'right'
  },
  {
    id: 'profile',
    target: '[data-tour="profile-menu"]',
    title: 'onboarding.profile.title',
    content: 'onboarding.profile.content',
    position: 'left'
  },
  {
    id: 'settings',
    target: '[data-tour="settings-link"]',
    title: 'onboarding.settings.title',
    content: 'onboarding.settings.content',
    position: 'left',
    optional: true
  }
];

export const getTasksTourSteps = (): TourStep[] => [
  {
    id: 'task-list',
    target: '[data-tour="task-list"]',
    title: 'onboarding.taskList.title',
    content: 'onboarding.taskList.content',
    position: 'top'
  },
  {
    id: 'task-filters',
    target: '[data-tour="task-filters"]',
    title: 'onboarding.taskFilters.title',
    content: 'onboarding.taskFilters.content',
    position: 'bottom'
  },
  {
    id: 'task-create',
    target: '[data-tour="task-create-form"]',
    title: 'onboarding.taskCreate.title',
    content: 'onboarding.taskCreate.content',
    position: 'left'
  }
];

export const getFinancesTourSteps = (): TourStep[] => [
  {
    id: 'financial-overview',
    target: '[data-tour="financial-overview"]',
    title: 'onboarding.financialOverview.title',
    content: 'onboarding.financialOverview.content',
    position: 'top'
  },
  {
    id: 'add-record',
    target: '[data-tour="add-record-btn"]',
    title: 'onboarding.addRecord.title',
    content: 'onboarding.addRecord.content',
    position: 'bottom',
    action: 'click'
  },
  {
    id: 'budget-planner',
    target: '[data-tour="budget-planner"]',
    title: 'onboarding.budgetPlanner.title',
    content: 'onboarding.budgetPlanner.content',
    position: 'left'
  }
];

export const getVoiceTourSteps = (): TourStep[] => [
  {
    id: 'voice-recorder',
    target: '[data-tour="voice-recorder"]',
    title: 'onboarding.voiceRecorder.title',
    content: 'onboarding.voiceRecorder.content',
    position: 'top'
  },
  {
    id: 'voice-commands',
    target: '[data-tour="voice-commands"]',
    title: 'onboarding.voiceCommands.title',
    content: 'onboarding.voiceCommands.content',
    position: 'bottom'
  },
  {
    id: 'voice-shortcuts',
    target: '[data-tour="voice-shortcuts"]',
    title: 'onboarding.voiceShortcuts.title',
    content: 'onboarding.voiceShortcuts.content',
    position: 'left'
  }
];