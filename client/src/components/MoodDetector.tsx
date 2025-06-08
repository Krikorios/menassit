import React, { useEffect, useCallback } from 'react';
import { useAdaptiveTheme } from '@/context/AdaptiveThemeContext';
import { useAuth } from '@/hooks/useAuth';

interface ActivityMetrics {
  tasksCompleted: number;
  focusSessionsCompleted: number;
  timeSpentInApp: number;
  clickFrequency: number;
  typingSpeed: number;
  pausesBetweenActions: number;
}

export function MoodDetector() {
  const { updateMood, isAdaptiveMode } = useAdaptiveTheme();
  const { user } = useAuth();

  const analyzeMoodFromActivity = useCallback((metrics: ActivityMetrics) => {
    let energy = 50;
    let focus = 50;
    let stress = 50;
    let creativity = 50;

    // Energy level indicators
    if (metrics.clickFrequency > 0.8) energy += 20;
    if (metrics.typingSpeed > 40) energy += 15;
    if (metrics.timeSpentInApp > 2) energy += 10;
    if (metrics.tasksCompleted > 3) energy += 15;

    // Focus level indicators
    if (metrics.focusSessionsCompleted > 0) focus += 25;
    if (metrics.pausesBetweenActions < 2) focus += 15;
    if (metrics.timeSpentInApp > 1 && metrics.clickFrequency < 0.5) focus += 20;

    // Stress level indicators
    if (metrics.clickFrequency > 1.2) stress += 25;
    if (metrics.pausesBetweenActions > 5) stress += 15;
    if (metrics.typingSpeed > 60) stress += 10;
    if (metrics.tasksCompleted === 0 && metrics.timeSpentInApp > 1) stress += 20;

    // Creativity level indicators
    const currentHour = new Date().getHours();
    if (currentHour >= 18 && currentHour <= 22) creativity += 15; // Evening creativity boost
    if (metrics.pausesBetweenActions > 3 && metrics.pausesBetweenActions < 6) creativity += 10; // Thoughtful pauses
    if (metrics.tasksCompleted > 0 && metrics.focusSessionsCompleted > 0) creativity += 20;

    // Normalize values to 0-100 range
    energy = Math.max(0, Math.min(100, energy));
    focus = Math.max(0, Math.min(100, focus));
    stress = Math.max(0, Math.min(100, stress));
    creativity = Math.max(0, Math.min(100, creativity));

    return { energy, focus, stress, creativity };
  }, []);

  const trackUserActivity = useCallback(() => {
    if (!isAdaptiveMode || !user) return;

    // Initialize activity tracking
    let clickCount = 0;
    let keystrokes = 0;
    let lastActivity = Date.now();
    let sessionStart = Date.now();
    let pauseCount = 0;
    let totalPauseTime = 0;

    // Track mouse clicks
    const handleClick = () => {
      clickCount++;
      const now = Date.now();
      if (now - lastActivity > 3000) { // 3 second pause
        pauseCount++;
        totalPauseTime += now - lastActivity;
      }
      lastActivity = now;
    };

    // Track keyboard activity
    const handleKeydown = () => {
      keystrokes++;
      const now = Date.now();
      if (now - lastActivity > 3000) {
        pauseCount++;
        totalPauseTime += now - lastActivity;
      }
      lastActivity = now;
    };

    // Track mouse movement for engagement
    const handleMouseMove = () => {
      lastActivity = Date.now();
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousemove', handleMouseMove);

    // Analyze activity every 5 minutes
    const analysisInterval = setInterval(() => {
      const sessionDuration = (Date.now() - sessionStart) / 1000 / 60; // minutes
      const clickFrequency = clickCount / sessionDuration;
      const typingSpeed = keystrokes / sessionDuration;
      const avgPauseTime = pauseCount > 0 ? totalPauseTime / pauseCount / 1000 : 0;

      // Get task completion data from localStorage (simplified)
      const tasksCompleted = parseInt(localStorage.getItem('dailyTasksCompleted') || '0');
      const focusSessionsCompleted = parseInt(localStorage.getItem('dailyFocusSessions') || '0');

      const metrics: ActivityMetrics = {
        tasksCompleted,
        focusSessionsCompleted,
        timeSpentInApp: sessionDuration,
        clickFrequency,
        typingSpeed,
        pausesBetweenActions: avgPauseTime,
      };

      const detectedMood = analyzeMoodFromActivity(metrics);
      updateMood(detectedMood);

      // Reset counters for next analysis period
      clickCount = 0;
      keystrokes = 0;
      pauseCount = 0;
      totalPauseTime = 0;
      sessionStart = Date.now();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(analysisInterval);
    };
  }, [isAdaptiveMode, user, analyzeMoodFromActivity, updateMood]);

  useEffect(() => {
    const cleanup = trackUserActivity();
    return cleanup;
  }, [trackUserActivity]);

  // This component doesn't render anything visible
  return null;
}