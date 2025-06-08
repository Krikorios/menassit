import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  Coffee, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Zap, 
  Smile,
  Brain,
  Wind
} from 'lucide-react';

interface ComfortState {
  mood: 'energetic' | 'focused' | 'relaxed' | 'creative';
  ambiance: 'morning' | 'afternoon' | 'evening' | 'night';
  soundscape: 'silent' | 'nature' | 'coffee-shop' | 'rain';
  energy: number; // 0-100
}

const ComfortZone = () => {
  const { t } = useTranslation();
  const [comfort, setComfort] = useState<ComfortState>({
    mood: 'focused',
    ambiance: 'afternoon',
    soundscape: 'silent',
    energy: 75
  });
  
  const [isActive, setIsActive] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('afternoon');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setTimeOfDay('night');
    else if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const moodOptions = [
    { key: 'energetic', icon: Zap, color: 'bg-orange-500', label: 'Energetic' },
    { key: 'focused', icon: Brain, color: 'bg-blue-500', label: 'Focused' },
    { key: 'relaxed', icon: Wind, color: 'bg-green-500', label: 'Relaxed' },
    { key: 'creative', icon: Smile, color: 'bg-purple-500', label: 'Creative' }
  ];

  const ambianceOptions = [
    { key: 'morning', icon: Sun, gradient: 'from-yellow-200 to-orange-300' },
    { key: 'afternoon', icon: Sun, gradient: 'from-blue-200 to-cyan-300' },
    { key: 'evening', icon: Moon, gradient: 'from-purple-200 to-pink-300' },
    { key: 'night', icon: Moon, gradient: 'from-indigo-800 to-purple-900' }
  ];

  const soundscapeOptions = [
    { key: 'silent', icon: VolumeX, label: 'Silent Focus' },
    { key: 'nature', icon: Wind, label: 'Nature Sounds' },
    { key: 'coffee-shop', icon: Coffee, label: 'Coffee Shop' },
    { key: 'rain', icon: Volume2, label: 'Gentle Rain' }
  ];

  const activateComfortMode = () => {
    setIsActive(true);
    document.body.style.transition = 'all 0.5s ease';
    
    // Apply ambient lighting based on selection
    const root = document.documentElement;
    switch (comfort.ambiance) {
      case 'morning':
        root.style.setProperty('--comfort-bg', 'linear-gradient(135deg, #fef3c7, #fed7aa)');
        break;
      case 'afternoon':
        root.style.setProperty('--comfort-bg', 'linear-gradient(135deg, #dbeafe, #a7f3d0)');
        break;
      case 'evening':
        root.style.setProperty('--comfort-bg', 'linear-gradient(135deg, #e9d5ff, #fbcfe8)');
        break;
      case 'night':
        root.style.setProperty('--comfort-bg', 'linear-gradient(135deg, #1e1b4b, #581c87)');
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              {t('comfort.title', 'Personal Comfort Zone')}
            </h3>
          </div>
          
          {/* Mood Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              {t('comfort.mood', 'How are you feeling?')}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {moodOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.key}
                    onClick={() => setComfort(prev => ({ ...prev, mood: option.key as any }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      comfort.mood === option.key
                        ? `${option.color} text-white border-transparent`
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Ambiance Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              {t('comfort.ambiance', 'Preferred ambiance')}
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {ambianceOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.key}
                    onClick={() => setComfort(prev => ({ ...prev, ambiance: option.key as any }))}
                    className={`p-3 rounded-lg bg-gradient-to-br ${option.gradient} ${
                      comfort.ambiance === option.key ? 'ring-2 ring-blue-500' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="h-4 w-4 mx-auto text-white" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Soundscape Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              {t('comfort.soundscape', 'Background sounds')}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {soundscapeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.key}
                    onClick={() => setComfort(prev => ({ ...prev, soundscape: option.key as any }))}
                    className={`p-2 rounded-lg border text-sm ${
                      comfort.soundscape === option.key
                        ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Icon className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs">{option.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Energy Level */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              {t('comfort.energy', 'Energy level')}
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={comfort.energy}
                onChange={(e) => setComfort(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <Badge variant="outline" className="min-w-[3rem]">
                {comfort.energy}%
              </Badge>
            </div>
          </div>

          {/* Activate Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={activateComfortMode}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Heart className="h-4 w-4 mr-2" />
              {isActive ? t('comfort.active', 'Comfort Zone Active') : t('comfort.activate', 'Activate Comfort Zone')}
            </Button>
          </motion.div>

          {/* Status */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200 text-sm">
                  <Heart className="h-4 w-4" />
                  <span>{t('comfort.status', 'Your comfort zone is now optimized for productivity')}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <CardContent className="p-0">
          <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            {t('comfort.quickActions', 'Quick Comfort Actions')}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-auto p-3">
              <Coffee className="h-4 w-4 mb-1" />
              <span className="text-xs">Break Time</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3">
              <Brain className="h-4 w-4 mb-1" />
              <span className="text-xs">Focus Mode</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ComfortZone;