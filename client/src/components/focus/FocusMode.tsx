import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  Timer,
  Coffee,
  Target,
  Zap
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface FocusSession {
  id: string;
  duration: number;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  type: 'work' | 'break';
}

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUS_DURATIONS = {
  pomodoro: { work: 25, shortBreak: 5, longBreak: 15 },
  custom: { work: 30, shortBreak: 10, longBreak: 20 },
  deep: { work: 90, shortBreak: 20, longBreak: 30 }
};

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rain', file: '/sounds/rain.mp3' },
  { id: 'forest', name: 'Forest', file: '/sounds/forest.mp3' },
  { id: 'cafe', name: 'Café', file: '/sounds/cafe.mp3' },
  { id: 'whitenoise', name: 'White Noise', file: '/sounds/whitenoise.mp3' },
  { id: 'ocean', name: 'Ocean Waves', file: '/sounds/ocean.mp3' }
];

export default function FocusMode({ isOpen, onClose }: FocusModeProps) {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState<'work' | 'break'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [focusType, setFocusType] = useState<keyof typeof FOCUS_DURATIONS>('pomodoro');
  const [ambientSound, setAmbientSound] = useState<string>('');
  const [ambientVolume, setAmbientVolume] = useState([50]);
  const [blockDistractions, setBlockDistractions] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<Date>();

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (ambientSound && audioRef.current) {
      audioRef.current.volume = (ambientVolume?.[0] ?? 50) / 100;
      if (isActive) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [ambientSound, ambientVolume, isActive]);

  useEffect(() => {
    // Apply focus mode styles when active
    if (isActive && blockDistractions) {
      document.body.classList.add('focus-mode-active');
      
      // Hide distracting elements
      const distractingElements = document.querySelectorAll('.floating-voice-control, .notification-toast');
      distractingElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    } else {
      document.body.classList.remove('focus-mode-active');
      
      // Restore distracting elements
      const distractingElements = document.querySelectorAll('.floating-voice-control, .notification-toast');
      distractingElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
    }

    return () => {
      document.body.classList.remove('focus-mode-active');
      const distractingElements = document.querySelectorAll('.floating-voice-control, .notification-toast');
      distractingElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
    };
  }, [isActive, blockDistractions]);

  const handleSessionComplete = () => {
    const session: FocusSession = {
      id: Date.now().toString(),
      duration: getDuration(currentSession),
      completed: true,
      startTime: startTimeRef.current || new Date(),
      endTime: new Date(),
      type: currentSession
    };

    setSessions(prev => [...prev, session]);
    
    if (showNotifications && 'Notification' in window) {
      new Notification(
        currentSession === 'work' 
          ? t('focus.sessionComplete', 'Work session complete!') 
          : t('focus.breakComplete', 'Break time over!')
      );
    }

    // Auto-switch between work and break
    if (currentSession === 'work') {
      setSessionCount(prev => prev + 1);
      const isLongBreak = (sessionCount + 1) % 4 === 0;
      setCurrentSession('break');
      setTimeLeft(getDuration(isLongBreak ? 'longBreak' : 'shortBreak'));
    } else {
      setCurrentSession('work');
      setTimeLeft(getDuration('work'));
    }

    setIsActive(false);
  };

  const getDuration = (type: 'work' | 'shortBreak' | 'longBreak' | 'break') => {
    if (type === 'break') type = 'shortBreak';
    const durations = FOCUS_DURATIONS[focusType];
    return durations[type] * 60; // Convert to seconds
  };

  const startSession = () => {
    setIsActive(true);
    startTimeRef.current = new Date();
    
    // Request notification permission
    if (showNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const stopSession = () => {
    setIsActive(false);
    setTimeLeft(getDuration('work'));
    setCurrentSession('work');
    setSessionCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalDuration = getDuration(currentSession);
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const getTodaysStats = () => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => s.startTime.toDateString() === today);
    const workSessions = todaySessions.filter(s => s.type === 'work' && s.completed);
    const totalTime = workSessions.reduce((acc, s) => acc + s.duration, 0);
    
    return {
      sessions: workSessions.length,
      totalTime: Math.round(totalTime / 60), // Convert to minutes
      streak: getStreak()
    };
  };

  const getStreak = () => {
    // Calculate consecutive days with at least one completed work session
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      
      const hasSession = sessions.some(s => 
        s.startTime.toDateString() === dateString && 
        s.type === 'work' && 
        s.completed
      );
      
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const stats = getTodaysStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container mx-auto p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('focus.title', 'Focus Mode')}</h1>
          </div>
          <Button variant="outline" onClick={onClose}>
            {blockDistractions && isActive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {t('focus.exit', 'Exit Focus')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {currentSession === 'work' ? (
                    <>
                      <Zap className="h-5 w-5 text-orange-500" />
                      {t('focus.workSession', 'Work Session')}
                    </>
                  ) : (
                    <>
                      <Coffee className="h-5 w-5 text-green-500" />
                      {t('focus.breakTime', 'Break Time')}
                    </>
                  )}
                  <Badge variant="secondary">
                    {t('focus.session', 'Session')} {sessionCount + 1}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-8">
                {/* Timer Display */}
                <div className="text-8xl font-mono font-bold text-center">
                  {formatTime(timeLeft)}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md">
                  <Progress value={getProgress()} className="h-3" />
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                  {!isActive ? (
                    <Button onClick={startSession} size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      {t('focus.start', 'Start')}
                    </Button>
                  ) : (
                    <Button onClick={pauseSession} size="lg" variant="secondary" className="gap-2">
                      <Pause className="h-5 w-5" />
                      {t('focus.pause', 'Pause')}
                    </Button>
                  )}
                  <Button onClick={stopSession} size="lg" variant="outline" className="gap-2">
                    <Square className="h-5 w-5" />
                    {t('focus.stop', 'Stop')}
                  </Button>
                </div>

                {/* Session Type Selector */}
                <div className="w-full max-w-md space-y-4">
                  <Label>{t('focus.focusType', 'Focus Type')}</Label>
                  <Select value={focusType} onValueChange={(value) => {
                    setFocusType(value as keyof typeof FOCUS_DURATIONS);
                    if (!isActive) {
                      setTimeLeft(getDuration('work'));
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pomodoro">
                        {t('focus.pomodoro', 'Pomodoro')} (25/5/15)
                      </SelectItem>
                      <SelectItem value="custom">
                        {t('focus.custom', 'Custom')} (30/10/20)
                      </SelectItem>
                      <SelectItem value="deep">
                        {t('focus.deepWork', 'Deep Work')} (90/20/30)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings & Stats */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  {t('focus.todaysStats', "Today's Stats")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.sessions}</div>
                    <div className="text-sm text-muted-foreground">{t('focus.sessions', 'Sessions')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.totalTime}m</div>
                    <div className="text-sm text-muted-foreground">{t('focus.focused', 'Focused')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
                    <div className="text-sm text-muted-foreground">{t('focus.streak', 'Streak')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('focus.settings', 'Settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Block Distractions */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="block-distractions">
                    {t('focus.blockDistractions', 'Block Distractions')}
                  </Label>
                  <Switch
                    id="block-distractions"
                    checked={blockDistractions}
                    onCheckedChange={setBlockDistractions}
                  />
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">
                    {t('focus.notifications', 'Notifications')}
                  </Label>
                  <Switch
                    id="notifications"
                    checked={showNotifications}
                    onCheckedChange={setShowNotifications}
                  />
                </div>

                {/* Ambient Sound */}
                <div className="space-y-3">
                  <Label>{t('focus.ambientSound', 'Ambient Sound')}</Label>
                  <Select value={ambientSound} onValueChange={setAmbientSound}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('focus.selectSound', 'Select sound')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t('focus.noSound', 'No Sound')}
                      </SelectItem>
                      {AMBIENT_SOUNDS.map(sound => (
                        <SelectItem key={sound.id} value={sound.id}>
                          {sound.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {ambientSound && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <VolumeX className="h-4 w-4" />
                        <Volume2 className="h-4 w-4" />
                      </div>
                      <Slider
                        value={ambientVolume}
                        onValueChange={setAmbientVolume}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Audio Element */}
      {ambientSound && (
        <audio
          ref={audioRef}
          loop
          src={AMBIENT_SOUNDS.find(s => s.id === ambientSound)?.file}
        />
      )}


    </div>
  );
}