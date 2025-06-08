import { ThemeControlPanel } from "@/components/ThemeControlPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Palette, Sparkles, Clock, Brain } from "lucide-react";

export default function ThemePage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t('theme.title', 'Adaptive Theme System')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('theme.description', 'Experience a dynamic interface that adapts to your mood, activity patterns, and time of day for optimal productivity and comfort.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">{t('theme.features.moodDetection', 'Mood Detection')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              {t('theme.features.moodDetectionDesc', 'Analyzes your activity patterns to determine energy, focus, stress, and creativity levels')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">{t('theme.features.timeAdaptation', 'Time Adaptation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              {t('theme.features.timeAdaptationDesc', 'Automatically adjusts colors based on time of day for optimal visual comfort')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">{t('theme.features.smartColors', 'Smart Colors')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              {t('theme.features.smartColorsDesc', 'Dynamic color palettes that enhance productivity and reduce eye strain')}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <ThemeControlPanel />
    </div>
  );
}