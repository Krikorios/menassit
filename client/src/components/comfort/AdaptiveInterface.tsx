import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { 
  Zap, 
  Eye, 
  MousePointer, 
  Smartphone, 
  Palette,
  Sparkles,
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';

interface GestureState {
  mousePosition: { x: number; y: number };
  isHovering: boolean;
  clickCount: number;
  scrollDirection: 'up' | 'down' | 'none';
  interactionIntensity: number;
}

interface AdaptiveSettings {
  followCursor: boolean;
  ambientLighting: boolean;
  hapticFeedback: boolean;
  smoothAnimations: boolean;
  contextualSounds: boolean;
  adaptiveLayout: boolean;
}

const AdaptiveInterface = () => {
  const { t } = useTranslation();
  const [gesture, setGesture] = useState<GestureState>({
    mousePosition: { x: 0, y: 0 },
    isHovering: false,
    clickCount: 0,
    scrollDirection: 'none',
    interactionIntensity: 0
  });

  const [settings, setSettings] = useState<AdaptiveSettings>({
    followCursor: true,
    ambientLighting: true,
    hapticFeedback: true,
    smoothAnimations: true,
    contextualSounds: false,
    adaptiveLayout: true
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring animations for smooth cursor following
  const cursorX = useSpring(mouseX, { damping: 20, stiffness: 400 });
  const cursorY = useSpring(mouseY, { damping: 20, stiffness: 400 });

  // Transform cursor position to create parallax effect
  const backgroundX = useTransform(cursorX, [0, window.innerWidth], [-20, 20]);
  const backgroundY = useTransform(cursorY, [0, window.innerHeight], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (settings.followCursor) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        
        setGesture(prev => ({
          ...prev,
          mousePosition: { x: e.clientX, y: e.clientY },
          interactionIntensity: Math.min(prev.interactionIntensity + 1, 100)
        }));
      }
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > gesture.mousePosition.y ? 'down' : 'up';
      
      setGesture(prev => ({
        ...prev,
        scrollDirection: direction,
        interactionIntensity: Math.min(prev.interactionIntensity + 5, 100)
      }));
    };

    const handleClick = () => {
      setGesture(prev => ({
        ...prev,
        clickCount: prev.clickCount + 1,
        interactionIntensity: Math.min(prev.interactionIntensity + 10, 100)
      }));

      // Haptic feedback simulation
      if (settings.hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    };

    // Decay interaction intensity over time
    const intensityDecay = setInterval(() => {
      setGesture(prev => ({
        ...prev,
        interactionIntensity: Math.max(prev.interactionIntensity - 2, 0)
      }));
    }, 100);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      clearInterval(intensityDecay);
    };
  }, [settings.followCursor, settings.hapticFeedback, mouseX, mouseY]);

  // Dynamic lighting based on cursor position
  useEffect(() => {
    if (settings.ambientLighting) {
      const lightIntensity = gesture.interactionIntensity / 100;
      const hue = (gesture.mousePosition.x / window.innerWidth) * 360;
      
      document.documentElement.style.setProperty(
        '--adaptive-glow', 
        `hsla(${hue}, 70%, 60%, ${lightIntensity * 0.1})`
      );
    }
  }, [gesture.mousePosition, gesture.interactionIntensity, settings.ambientLighting]);

  const toggleSetting = (key: keyof AdaptiveSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getIntensityColor = () => {
    const intensity = gesture.interactionIntensity;
    if (intensity < 30) return 'bg-blue-500';
    if (intensity < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 relative"
      style={{
        backgroundImage: settings.ambientLighting ? 
          `radial-gradient(circle at ${gesture.mousePosition.x}px ${gesture.mousePosition.y}px, var(--adaptive-glow), transparent 50%)` : 
          'none'
      }}
    >
      {/* Adaptive Cursor Follower */}
      {settings.followCursor && (
        <motion.div
          className="fixed pointer-events-none z-50 w-4 h-4 rounded-full mix-blend-difference"
          style={{
            x: cursorX,
            y: cursorY,
            backgroundColor: 'white'
          }}
          animate={{
            scale: gesture.isHovering ? 1.5 : 1,
            opacity: gesture.interactionIntensity / 100
          }}
        />
      )}

      {/* Main Interface Card */}
      <Card className="p-6 bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-950 dark:to-cyan-950 border-violet-200 dark:border-violet-800 overflow-hidden relative">
        <motion.div
          style={{
            x: settings.followCursor ? backgroundX : 0,
            y: settings.followCursor ? backgroundY : 0
          }}
          className="absolute inset-0 opacity-30"
        >
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-violet-400 to-pink-400 rounded-full blur-xl" />
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full blur-xl" />
        </motion.div>

        <CardContent className="p-0 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ 
                rotate: gesture.interactionIntensity * 3.6,
                scale: 1 + (gesture.interactionIntensity / 500)
              }}
              transition={{ type: "spring", damping: 10 }}
            >
              <Zap className="h-6 w-6 text-violet-600" />
            </motion.div>
            <h3 className="text-xl font-semibold text-violet-900 dark:text-violet-100">
              {t('adaptive.title', 'Adaptive Interface')}
            </h3>
          </div>

          {/* Interaction Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div 
              className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <MousePointer className="h-4 w-4" />
                Interaction Level
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${getIntensityColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${gesture.interactionIntensity}%` }}
                    transition={{ type: "spring", damping: 20 }}
                  />
                </div>
                <span className="text-sm font-medium">{gesture.interactionIntensity}%</span>
              </div>
            </motion.div>

            <motion.div 
              className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Eye className="h-4 w-4" />
                Gestures Detected
              </div>
              <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">
                {gesture.clickCount}
              </div>
            </motion.div>
          </div>

          {/* Adaptive Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('adaptive.settings', 'Adaptive Features')}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(settings).map(([key, enabled]) => {
                const icons = {
                  followCursor: MousePointer,
                  ambientLighting: Sun,
                  hapticFeedback: Smartphone,
                  smoothAnimations: Sparkles,
                  contextualSounds: enabled ? Volume2 : VolumeX,
                  adaptiveLayout: Settings
                };
                
                const Icon = icons[key as keyof typeof icons];
                
                return (
                  <motion.button
                    key={key}
                    onClick={() => toggleSetting(key as keyof AdaptiveSettings)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      enabled
                        ? 'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-900 dark:border-violet-600 dark:text-violet-200'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-xs font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Interface Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Responsive Card 1 */}
        <motion.div
          whileHover={{ 
            scale: settings.smoothAnimations ? 1.03 : 1,
            rotateY: settings.followCursor ? 5 : 0
          }}
          transition={{ type: "spring", damping: 20 }}
        >
          <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-pink-200 dark:border-pink-800">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ 
                    rotateY: gesture.mousePosition.x / 10,
                    rotateX: gesture.mousePosition.y / 10
                  }}
                >
                  <Palette className="h-5 w-5 text-pink-600" />
                </motion.div>
                <h4 className="font-medium text-pink-900 dark:text-pink-100">
                  Dynamic Theming
                </h4>
              </div>
              <p className="text-sm text-pink-700 dark:text-pink-300">
                Interface adapts colors and lighting based on your interactions and preferences.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Responsive Card 2 */}
        <motion.div
          whileHover={{ 
            scale: settings.smoothAnimations ? 1.03 : 1,
            rotateY: settings.followCursor ? -5 : 0
          }}
          transition={{ type: "spring", damping: 20 }}
        >
          <Card className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-cyan-200 dark:border-cyan-800">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ 
                    scale: 1 + (gesture.interactionIntensity / 1000),
                    rotate: gesture.clickCount * 15
                  }}
                >
                  <Sparkles className="h-5 w-5 text-cyan-600" />
                </motion.div>
                <h4 className="font-medium text-cyan-900 dark:text-cyan-100">
                  Smart Interactions
                </h4>
              </div>
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                Elements respond intelligently to your gestures, creating a natural user experience.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Interaction Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: gesture.interactionIntensity > 50 ? 1 : 0,
          y: gesture.interactionIntensity > 50 ? 0 : 20
        }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 text-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          {t('adaptive.feedback', 'High interaction detected - interface is adapting')}
        </div>
      </motion.div>

      {/* Ambient Orbs */}
      {settings.ambientLighting && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{
                background: `linear-gradient(45deg, hsl(${(i * 120 + gesture.mousePosition.x / 5) % 360}, 70%, 60%), hsl(${(i * 120 + gesture.mousePosition.y / 5) % 360}, 70%, 80%))`
              }}
              animate={{
                x: gesture.mousePosition.x + (i - 1) * 100,
                y: gesture.mousePosition.y + (i - 1) * 50,
                scale: 1 + (gesture.interactionIntensity / 200)
              }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 200,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdaptiveInterface;