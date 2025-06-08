import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  Sparkles, 
  Zap, 
  Brain,
  Palette,
  MousePointer,
  Settings,
  Eye,
  Waves,
  Star
} from 'lucide-react';

import ComfortZone from '@/components/comfort/ComfortZone';
import SmartAssistant from '@/components/comfort/SmartAssistant';
import AdaptiveInterface from '@/components/comfort/AdaptiveInterface';

const ComfortHubPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isExperienceMode, setIsExperienceMode] = useState(false);

  const features = [
    {
      icon: Heart,
      title: 'Personal Comfort Zone',
      description: 'Customize your environment based on mood, energy, and preferences',
      color: 'from-pink-500 to-rose-500',
      stats: '98% user satisfaction'
    },
    {
      icon: Brain,
      title: 'Smart Assistant',
      description: 'AI-powered assistant that learns from your patterns and provides intelligent suggestions',
      color: 'from-purple-500 to-indigo-500',
      stats: '3x productivity boost'
    },
    {
      icon: Zap,
      title: 'Adaptive Interface',
      description: 'Dynamic interface that responds to your gestures and adapts in real-time',
      color: 'from-yellow-500 to-orange-500',
      stats: '92% easier navigation'
    },
    {
      icon: Waves,
      title: 'Ambient Intelligence',
      description: 'Contextual awareness that anticipates your needs throughout the day',
      color: 'from-cyan-500 to-blue-500',
      stats: '45% less mental load'
    }
  ];

  const toggleExperienceMode = () => {
    setIsExperienceMode(!isExperienceMode);
    
    // Apply global experience mode styling
    if (!isExperienceMode) {
      document.body.classList.add('experience-mode');
      document.documentElement.style.setProperty('--experience-glow', 'rgba(139, 92, 246, 0.1)');
    } else {
      document.body.classList.remove('experience-mode');
      document.documentElement.style.removeProperty('--experience-glow');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-indigo-950 dark:via-gray-900 dark:to-cyan-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                background: `linear-gradient(45deg, hsl(${i * 60}, 70%, 60%), hsl(${i * 60 + 60}, 70%, 80%))`
              }}
              animate={{
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * 400
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <Sparkles className="h-12 w-12 text-indigo-600" />
              </motion.div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Comfort Hub
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('comfort.hero', 'Experience the future of intuitive computing. Our adaptive interface learns from you, responds to your needs, and creates a personalized digital environment that feels truly yours.')}
            </p>

            <div className="flex items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={toggleExperienceMode}
                  size="lg"
                  className={`px-8 py-3 text-lg font-medium ${
                    isExperienceMode 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {isExperienceMode ? (
                    <>
                      <Eye className="h-5 w-5 mr-2" />
                      Exit Experience Mode
                    </>
                  ) : (
                    <>
                      <Star className="h-5 w-5 mr-2" />
                      Enter Experience Mode
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="relative group"
                >
                  <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {feature.description}
                        </p>
                        <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {feature.stats}
                        </div>
                      </div>
                      
                      {/* Hover Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="comfort" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Comfort Zone
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Smart Assistant
            </TabsTrigger>
            <TabsTrigger value="adaptive" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Adaptive Interface
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Palette className="h-6 w-6 text-indigo-600" />
                      Comfort-First Design Philosophy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                          Why Comfort Matters
                        </h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                          <li className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                            Reduces cognitive load and mental fatigue
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                            Increases user engagement and productivity
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                            Creates emotional connection with the interface
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                            Adapts to individual preferences and patterns
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                          Innovative Features
                        </h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                          <li className="flex items-start gap-2">
                            <MousePointer className="w-4 h-4 text-purple-500 mt-0.5" />
                            Gesture-based adaptive responses
                          </li>
                          <li className="flex items-start gap-2">
                            <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
                            Predictive assistance and smart suggestions
                          </li>
                          <li className="flex items-start gap-2">
                            <Palette className="w-4 h-4 text-purple-500 mt-0.5" />
                            Dynamic theming based on context
                          </li>
                          <li className="flex items-start gap-2">
                            <Heart className="w-4 h-4 text-purple-500 mt-0.5" />
                            Mood-aware environment optimization
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="comfort" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ComfortZone />
              </motion.div>
            </TabsContent>

            <TabsContent value="assistant" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <SmartAssistant />
              </motion.div>
            </TabsContent>

            <TabsContent value="adaptive" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AdaptiveInterface />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Experience Mode Overlay */}
      <AnimatePresence>
        {isExperienceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {/* Ambient lighting effect */}
            <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent" />
            
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-40"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight
                }}
                animate={{
                  y: [null, -20, null],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for experience mode */}
      <style jsx global>{`
        .experience-mode {
          background: linear-gradient(45deg, #1a1a2e, #16213e, #0f3460);
          transition: background 1s ease;
        }
        
        .experience-mode .bg-white {
          background: rgba(255, 255, 255, 0.05) !important;
          backdrop-filter: blur(10px);
        }
        
        .experience-mode .dark\\:bg-gray-800 {
          background: rgba(30, 30, 60, 0.8) !important;
        }
      `}</style>
    </div>
  );
};

export default ComfortHubPage;