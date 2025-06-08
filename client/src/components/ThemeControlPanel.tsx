import React from 'react';
import { useAdaptiveTheme } from '@/context/AdaptiveThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { 
  Palette, 
  Brain, 
  Zap, 
  Target, 
  AlertTriangle, 
  Sparkles,
  Clock,
  Sun,
  Moon,
  Sunset,
  Sunrise
} from 'lucide-react';

export function ThemeControlPanel() {
  const {
    currentTheme,
    mood,
    updateMood,
    timeOfDay,
    isAdaptiveMode,
    toggleAdaptiveMode,
    manualOverride,
    setManualOverride,
    availableThemes,
  } = useAdaptiveTheme();
  
  const { t } = useTranslation();

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'morning': return <Sunrise className="w-4 h-4" />;
      case 'midday': return <Sun className="w-4 h-4" />;
      case 'afternoon': return <Sun className="w-4 h-4" />;
      case 'evening': return <Sunset className="w-4 h-4" />;
      case 'night': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getMoodColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-blue-500';
    if (value >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleThemeSelect = (themeName: string) => {
    if (manualOverride === themeName) {
      setManualOverride(null);
    } else {
      setManualOverride(themeName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="w-6 h-6" />
          <h2 className="text-2xl font-bold">{t('theme.adaptiveTitle', 'Adaptive Theme Control')}</h2>
        </div>
        <Badge variant={isAdaptiveMode ? "default" : "secondary"} className="flex items-center space-x-1">
          {getTimeIcon(timeOfDay)}
          <span className="capitalize">{timeOfDay}</span>
        </Badge>
      </div>

      {/* Adaptive Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>{t('theme.adaptiveMode', 'Adaptive Mode')}</span>
          </CardTitle>
          <CardDescription>
            {t('theme.adaptiveModeDesc', 'Automatically adjust colors based on your mood and time of day')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="adaptive-mode"
              checked={isAdaptiveMode}
              onCheckedChange={toggleAdaptiveMode}
            />
            <Label htmlFor="adaptive-mode">
              {isAdaptiveMode ? t('theme.enabled', 'Enabled') : t('theme.disabled', 'Disabled')}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Current Mood Display */}
      {isAdaptiveMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>{t('theme.currentMood', 'Current Mood Analysis')}</span>
            </CardTitle>
            <CardDescription>
              {t('theme.moodDesc', 'Detected from your activity patterns and time of day')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <Label>{t('theme.energy', 'Energy')}</Label>
                  </div>
                  <span className={`font-medium ${getMoodColor(mood.energy)}`}>
                    {mood.energy}%
                  </span>
                </div>
                <Progress value={mood.energy} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <Label>{t('theme.focus', 'Focus')}</Label>
                  </div>
                  <span className={`font-medium ${getMoodColor(mood.focus)}`}>
                    {mood.focus}%
                  </span>
                </div>
                <Progress value={mood.focus} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <Label>{t('theme.stress', 'Stress')}</Label>
                  </div>
                  <span className={`font-medium ${getMoodColor(100 - mood.stress)}`}>
                    {mood.stress}%
                  </span>
                </div>
                <Progress value={mood.stress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <Label>{t('theme.creativity', 'Creativity')}</Label>
                  </div>
                  <span className={`font-medium ${getMoodColor(mood.creativity)}`}>
                    {mood.creativity}%
                  </span>
                </div>
                <Progress value={mood.creativity} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Mood Adjustment */}
      {isAdaptiveMode && (
        <Card>
          <CardHeader>
            <CardTitle>{t('theme.manualAdjustment', 'Manual Mood Adjustment')}</CardTitle>
            <CardDescription>
              {t('theme.manualAdjustmentDesc', 'Override automatic detection with manual settings')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>{t('theme.energy', 'Energy')}: {mood.energy}%</span>
                </Label>
                <Slider
                  value={[mood.energy]}
                  onValueChange={(value) => updateMood({ energy: value[0] || 0 })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>{t('theme.focus', 'Focus')}: {mood.focus}%</span>
                </Label>
                <Slider
                  value={[mood.focus]}
                  onValueChange={(value) => updateMood({ focus: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t('theme.stress', 'Stress')}: {mood.stress}%</span>
                </Label>
                <Slider
                  value={[mood.stress]}
                  onValueChange={(value) => updateMood({ stress: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('theme.creativity', 'Creativity')}: {mood.creativity}%</span>
                </Label>
                <Slider
                  value={[mood.creativity]}
                  onValueChange={(value) => updateMood({ creativity: value[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Theme Presets */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme.presets', 'Theme Presets')}</CardTitle>
          <CardDescription>
            {t('theme.presetsDesc', 'Override adaptive mode with predefined themes')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(availableThemes).map(([name, theme]) => (
              <Button
                key={name}
                variant={manualOverride === name ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center space-y-2"
                onClick={() => handleThemeSelect(name)}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                />
                <span className="text-xs font-medium capitalize">{name}</span>
              </Button>
            ))}
          </div>
          {manualOverride && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setManualOverride(null)}
              className="mt-3 w-full"
            >
              {t('theme.clearOverride', 'Clear Manual Override')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Current Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme.currentTheme', 'Current Theme')}</CardTitle>
          <CardDescription>
            {manualOverride 
              ? t('theme.manualTheme', `Manual: ${manualOverride}`)
              : t('theme.adaptiveTheme', 'Adaptive based on mood and time')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            <div className="space-y-1">
              <div
                className="w-full h-12 rounded border"
                style={{ backgroundColor: currentTheme.primary }}
              />
              <p className="text-xs text-center">{t('theme.primary', 'Primary')}</p>
            </div>
            <div className="space-y-1">
              <div
                className="w-full h-12 rounded border"
                style={{ backgroundColor: currentTheme.secondary }}
              />
              <p className="text-xs text-center">{t('theme.secondary', 'Secondary')}</p>
            </div>
            <div className="space-y-1">
              <div
                className="w-full h-12 rounded border"
                style={{ backgroundColor: currentTheme.accent }}
              />
              <p className="text-xs text-center">{t('theme.accent', 'Accent')}</p>
            </div>
            <div className="space-y-1">
              <div
                className="w-full h-12 rounded border"
                style={{ backgroundColor: currentTheme.background }}
              />
              <p className="text-xs text-center">{t('theme.background', 'Background')}</p>
            </div>
            <div className="space-y-1">
              <div
                className="w-full h-12 rounded border"
                style={{ backgroundColor: currentTheme.foreground }}
              />
              <p className="text-xs text-center">{t('theme.foreground', 'Foreground')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}