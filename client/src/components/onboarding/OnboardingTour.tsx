import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'none';
  optional?: boolean;
}

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  steps: TourStep[];
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isActive,
  onComplete,
  onSkip,
  steps
}) => {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const targetElement = document.querySelector(currentStep.target) as HTMLElement;
    if (targetElement) {
      setHighlightedElement(targetElement);
      
      // Calculate tooltip position
      const rect = targetElement.getBoundingClientRect();
      const position = currentStep.position || 'bottom';
      
      let x = rect.left + rect.width / 2;
      let y = rect.bottom + 10;
      
      switch (position) {
        case 'top':
          y = rect.top - 10;
          break;
        case 'left':
          x = rect.left - 10;
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          x = rect.right + 10;
          y = rect.top + rect.height / 2;
          break;
        case 'bottom':
        default:
          y = rect.bottom + 10;
          break;
      }
      
      setTooltipPosition({ x, y });
      
      // Scroll element into view
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
      
      // Add highlight class
      targetElement.classList.add('tour-highlight');
      
      // Add pulsing animation for interactive elements
      if (currentStep.action && currentStep.action !== 'none') {
        targetElement.classList.add('tour-pulse');
      }
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove('tour-highlight', 'tour-pulse');
      }
    };
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
  };

  if (!isActive || !currentStep) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none" />
      
      {/* Highlight spotlight */}
      {highlightedElement && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: highlightedElement.getBoundingClientRect().left - 4,
            top: highlightedElement.getBoundingClientRect().top - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
          }}
        />
      )}
      
      {/* Tooltip */}
      <Card 
        className="fixed z-50 max-w-sm bg-white dark:bg-gray-800 shadow-lg border"
        style={{
          left: Math.max(16, Math.min(tooltipPosition.x - 150, window.innerWidth - 316)),
          top: Math.max(16, Math.min(tooltipPosition.y, window.innerHeight - 200)),
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {t(currentStep.title)}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {currentStepIndex + 1} / {steps.length}
            </Badge>
            {currentStep.optional && (
              <Badge variant="outline" className="text-xs">
                {t('onboarding.optional')}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {t(currentStep.content)}
          </p>
          
          {currentStep.action && currentStep.action !== 'none' && (
            <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {currentStep.action === 'click' && t('onboarding.clickInstruction')}
                {currentStep.action === 'hover' && t('onboarding.hoverInstruction')}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-3 w-3" />
              {t('onboarding.previous')}
            </Button>
            
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStepIndex
                      ? 'bg-blue-500'
                      : index < currentStepIndex
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <Button
              size="sm"
              onClick={handleNext}
              className="flex items-center gap-1"
            >
              {isLastStep ? (
                <>
                  <Check className="h-3 w-3" />
                  {t('onboarding.finish')}
                </>
              ) : (
                <>
                  {t('onboarding.next')}
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};