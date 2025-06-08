import FocusMode from "@/components/focus/FocusMode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Timer, Brain, Volume2, Shield } from "lucide-react";

export default function FocusPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t('focus.title', 'Focus Mode')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('focus.description', 'Minimize distractions and maximize your productivity with our advanced focus tools.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="text-center">
            <Timer className="w-8 h-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">{t('focus.features.timer', 'Pomodoro Timer')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              {t('focus.features.timerDesc', 'Work in focused intervals with built-in breaks')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Volume2 className="w-8 h-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">{t('focus.features.ambient', 'Ambient Sounds')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              {t('focus.features.ambientDesc', 'Choose from nature sounds to enhance concentration')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">{t('focus.features.blocking', 'Distraction Blocking')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              {t('focus.features.blockingDesc', 'Block notifications and visual distractions')}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">{t('focus.features.tracking', 'Session Tracking')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              {t('focus.features.trackingDesc', 'Monitor your focus patterns and productivity')}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto">
        <FocusMode isOpen={true} onClose={() => {}} />
      </div>
    </div>
  );
}