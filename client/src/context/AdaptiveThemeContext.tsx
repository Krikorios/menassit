import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface MoodState {
  energy: number; // 0-100
  focus: number; // 0-100
  stress: number; // 0-100
  creativity: number; // 0-100
}

interface TimeOfDayTheme {
  morning: string;
  midday: string;
  afternoon: string;
  evening: string;
  night: string;
}

interface AdaptiveThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  card: string;
  cardForeground: string;
}

interface AdaptiveThemeContextType {
  currentTheme: AdaptiveThemeColors;
  mood: MoodState;
  updateMood: (newMood: Partial<MoodState>) => void;
  timeOfDay: string;
  isAdaptiveMode: boolean;
  toggleAdaptiveMode: () => void;
  manualOverride: string | null;
  setManualOverride: (theme: string | null) => void;
  availableThemes: Record<string, AdaptiveThemeColors>;
  generateThemeFromMood: (mood: MoodState, timeOfDay: string) => AdaptiveThemeColors;
}

const AdaptiveThemeContext = createContext<AdaptiveThemeContextType | undefined>(undefined);

// Predefined theme palettes for different moods and times
const THEME_PALETTES = {
  energetic: {
    primary: 'hsl(12, 76%, 61%)', // Vibrant orange
    secondary: 'hsl(45, 100%, 70%)', // Bright yellow
    accent: 'hsl(340, 82%, 52%)', // Energetic pink
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(0, 0%, 3.9%)',
    muted: 'hsl(0, 0%, 96.1%)',
    mutedForeground: 'hsl(0, 0%, 45.1%)',
    border: 'hsl(0, 0%, 89.8%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(0, 0%, 3.9%)',
  },
  calm: {
    primary: 'hsl(210, 40%, 60%)', // Soft blue
    secondary: 'hsl(158, 40%, 60%)', // Sage green
    accent: 'hsl(200, 50%, 70%)', // Light blue
    background: 'hsl(210, 40%, 98%)',
    foreground: 'hsl(210, 40%, 11%)',
    muted: 'hsl(210, 40%, 96%)',
    mutedForeground: 'hsl(210, 40%, 45%)',
    border: 'hsl(210, 40%, 90%)',
    card: 'hsl(210, 40%, 100%)',
    cardForeground: 'hsl(210, 40%, 11%)',
  },
  focused: {
    primary: 'hsl(240, 5.9%, 10%)', // Deep charcoal
    secondary: 'hsl(240, 4.8%, 95.9%)', // Very light gray
    accent: 'hsl(195, 95%, 68%)', // Bright cyan for focus
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(240, 10%, 3.9%)',
    muted: 'hsl(240, 4.8%, 95.9%)',
    mutedForeground: 'hsl(240, 5%, 64.9%)',
    border: 'hsl(240, 5.9%, 90%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(240, 10%, 3.9%)',
  },
  creative: {
    primary: 'hsl(270, 95%, 68%)', // Vibrant purple
    secondary: 'hsl(300, 95%, 68%)', // Magenta
    accent: 'hsl(45, 95%, 68%)', // Bright yellow
    background: 'hsl(280, 20%, 98%)',
    foreground: 'hsl(280, 20%, 5%)',
    muted: 'hsl(280, 20%, 95%)',
    mutedForeground: 'hsl(280, 20%, 45%)',
    border: 'hsl(280, 20%, 88%)',
    card: 'hsl(280, 20%, 100%)',
    cardForeground: 'hsl(280, 20%, 5%)',
  },
  stressed: {
    primary: 'hsl(0, 84%, 60%)', // Soft red
    secondary: 'hsl(25, 95%, 68%)', // Warm orange
    accent: 'hsl(60, 95%, 68%)', // Calming yellow
    background: 'hsl(0, 20%, 98%)',
    foreground: 'hsl(0, 20%, 10%)',
    muted: 'hsl(0, 20%, 95%)',
    mutedForeground: 'hsl(0, 20%, 45%)',
    border: 'hsl(0, 20%, 88%)',
    card: 'hsl(0, 20%, 100%)',
    cardForeground: 'hsl(0, 20%, 10%)',
  },
  // Time-based variations
  morning: {
    primary: 'hsl(45, 100%, 60%)', // Sunrise yellow
    secondary: 'hsl(30, 100%, 70%)', // Warm orange
    accent: 'hsl(200, 100%, 80%)', // Sky blue
    background: 'hsl(45, 50%, 98%)',
    foreground: 'hsl(45, 50%, 10%)',
    muted: 'hsl(45, 50%, 95%)',
    mutedForeground: 'hsl(45, 50%, 45%)',
    border: 'hsl(45, 50%, 88%)',
    card: 'hsl(45, 50%, 100%)',
    cardForeground: 'hsl(45, 50%, 10%)',
  },
  evening: {
    primary: 'hsl(250, 60%, 55%)', // Twilight purple
    secondary: 'hsl(280, 60%, 60%)', // Evening violet
    accent: 'hsl(320, 60%, 65%)', // Sunset pink
    background: 'hsl(250, 30%, 95%)',
    foreground: 'hsl(250, 30%, 15%)',
    muted: 'hsl(250, 30%, 90%)',
    mutedForeground: 'hsl(250, 30%, 50%)',
    border: 'hsl(250, 30%, 85%)',
    card: 'hsl(250, 30%, 98%)',
    cardForeground: 'hsl(250, 30%, 15%)',
  },
  night: {
    primary: 'hsl(220, 13%, 91%)', // Light gray for dark mode
    secondary: 'hsl(215, 13.8%, 34%)', // Medium gray
    accent: 'hsl(210, 40%, 98%)', // Very light for contrast
    background: 'hsl(222.2, 84%, 4.9%)', // Very dark blue
    foreground: 'hsl(210, 40%, 98%)',
    muted: 'hsl(217.2, 32.6%, 17.5%)',
    mutedForeground: 'hsl(215, 20.2%, 65.1%)',
    border: 'hsl(217.2, 32.6%, 17.5%)',
    card: 'hsl(222.2, 84%, 4.9%)',
    cardForeground: 'hsl(210, 40%, 98%)',
  },
};

export function AdaptiveThemeProvider({ children }: { children: React.ReactNode }) {
  const userContext = React.useContext(React.createContext<any>(null));
  const user = userContext?.user;
  const [mood, setMood] = useState<MoodState>({
    energy: 70,
    focus: 60,
    stress: 30,
    creativity: 50,
  });
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(true);
  const [manualOverride, setManualOverride] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [currentTheme, setCurrentTheme] = useState<AdaptiveThemeColors>(THEME_PALETTES.calm);

  // Determine time of day
  const getTimeOfDay = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }, []);

  // Generate theme based on mood and time
  const generateThemeFromMood = useCallback((moodState: MoodState, currentTimeOfDay: string): AdaptiveThemeColors => {
    // Determine dominant mood characteristic
    let dominantMood = 'calm';
    
    if (moodState.stress > 60) {
      dominantMood = 'stressed';
    } else if (moodState.energy > 75) {
      dominantMood = 'energetic';
    } else if (moodState.focus > 75) {
      dominantMood = 'focused';
    } else if (moodState.creativity > 75) {
      dominantMood = 'creative';
    }

    // Get base theme from mood
    let baseTheme = THEME_PALETTES[dominantMood as keyof typeof THEME_PALETTES];

    // Apply time-of-day modifications
    if (currentTimeOfDay === 'night') {
      baseTheme = THEME_PALETTES.night;
    } else if (currentTimeOfDay === 'morning') {
      // Blend with morning colors
      baseTheme = {
        ...baseTheme,
        primary: blendColors(baseTheme.primary, THEME_PALETTES.morning.primary, 0.3),
        secondary: blendColors(baseTheme.secondary, THEME_PALETTES.morning.secondary, 0.2),
      };
    } else if (currentTimeOfDay === 'evening') {
      // Blend with evening colors
      baseTheme = {
        ...baseTheme,
        primary: blendColors(baseTheme.primary, THEME_PALETTES.evening.primary, 0.4),
        background: blendColors(baseTheme.background, THEME_PALETTES.evening.background, 0.2),
      };
    }

    return baseTheme;
  }, []);

  // Helper function to blend HSL colors
  const blendColors = (color1: string, color2: string, ratio: number): string => {
    // Simple color blending - in a real implementation, you'd parse HSL and blend properly
    return ratio > 0.5 ? color2 : color1;
  };

  // Update mood state
  const updateMood = useCallback((newMood: Partial<MoodState>) => {
    setMood(prev => ({ ...prev, ...newMood }));
  }, []);

  // Apply theme to CSS variables
  const applyTheme = useCallback((theme: AdaptiveThemeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--foreground', theme.foreground);
    root.style.setProperty('--muted', theme.muted);
    root.style.setProperty('--muted-foreground', theme.mutedForeground);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--card-foreground', theme.cardForeground);
  }, []);

  // Auto-detect mood from user activity (simplified)
  const detectMoodFromActivity = useCallback(() => {
    if (!user) return;

    const hour = new Date().getHours();
    const currentTime = getTimeOfDay();
    
    // Simple heuristics for mood detection
    let autoMood: Partial<MoodState> = {};

    // Time-based mood adjustments
    if (currentTime === 'morning') {
      autoMood = { energy: 80, focus: 70, stress: 20 };
    } else if (currentTime === 'midday') {
      autoMood = { energy: 90, focus: 85, stress: 40 };
    } else if (currentTime === 'afternoon') {
      autoMood = { energy: 60, focus: 70, stress: 50 };
    } else if (currentTime === 'evening') {
      autoMood = { energy: 40, focus: 50, stress: 30, creativity: 70 };
    } else {
      autoMood = { energy: 20, focus: 30, stress: 20, creativity: 40 };
    }

    // Apply gradual mood changes to avoid jarring transitions
    setMood(prev => ({
      energy: Math.round((prev.energy * 0.8) + (autoMood.energy || prev.energy) * 0.2),
      focus: Math.round((prev.focus * 0.8) + (autoMood.focus || prev.focus) * 0.2),
      stress: Math.round((prev.stress * 0.8) + (autoMood.stress || prev.stress) * 0.2),
      creativity: Math.round((prev.creativity * 0.8) + (autoMood.creativity || prev.creativity) * 0.2),
    }));
  }, [user, getTimeOfDay]);

  // Update time of day periodically
  useEffect(() => {
    const updateTime = () => {
      setTimeOfDay(getTimeOfDay());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [getTimeOfDay]);

  // Auto-detect mood periodically
  useEffect(() => {
    if (isAdaptiveMode && !manualOverride) {
      detectMoodFromActivity();
    }
  }, [timeOfDay, isAdaptiveMode, manualOverride, detectMoodFromActivity]);

  // Generate and apply theme when mood or time changes
  useEffect(() => {
    if (!isAdaptiveMode && !manualOverride) return;

    let newTheme: AdaptiveThemeColors;

    if (manualOverride) {
      newTheme = THEME_PALETTES[manualOverride as keyof typeof THEME_PALETTES] || THEME_PALETTES.calm;
    } else {
      newTheme = generateThemeFromMood(mood, timeOfDay);
    }

    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  }, [mood, timeOfDay, isAdaptiveMode, manualOverride, generateThemeFromMood, applyTheme]);

  const toggleAdaptiveMode = useCallback(() => {
    setIsAdaptiveMode(prev => !prev);
    if (manualOverride) {
      setManualOverride(null);
    }
  }, [manualOverride]);

  const value: AdaptiveThemeContextType = {
    currentTheme,
    mood,
    updateMood,
    timeOfDay,
    isAdaptiveMode,
    toggleAdaptiveMode,
    manualOverride,
    setManualOverride,
    availableThemes: THEME_PALETTES,
    generateThemeFromMood,
  };

  return (
    <AdaptiveThemeContext.Provider value={value}>
      {children}
    </AdaptiveThemeContext.Provider>
  );
}

export function useAdaptiveTheme() {
  const context = useContext(AdaptiveThemeContext);
  if (context === undefined) {
    throw new Error('useAdaptiveTheme must be used within an AdaptiveThemeProvider');
  }
  return context;
}