import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Timer, Brain, Volume2, Shield, Target, Coffee, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import FocusMode from "@/components/focus/FocusMode";

export default function FocusPage() {
  const { t } = useTranslation();
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Focus Zone</h1>
            <p className="text-gray-600 dark:text-gray-400">Maximize your productivity with focused work sessions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center">
                <Timer className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <CardTitle className="text-lg">Pomodoro Timer</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  Work in focused 25-minute intervals with built-in breaks
                </CardDescription>
                <Button 
                  onClick={() => setIsFocusModeOpen(true)} 
                  className="w-full"
                  variant="outline"
                >
                  Start Pomodoro
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <CardTitle className="text-lg">Deep Work Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  Extended 90-minute sessions for complex tasks and deep thinking
                </CardDescription>
                <Button 
                  onClick={() => setIsFocusModeOpen(true)} 
                  className="w-full"
                  variant="outline"
                >
                  Start Deep Work
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Coffee className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <CardTitle className="text-lg">Custom Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  Create personalized focus sessions tailored to your workflow
                </CardDescription>
                <Button 
                  onClick={() => setIsFocusModeOpen(true)} 
                  className="w-full"
                  variant="outline"
                >
                  Customize Session
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-green-600" />
                  Ambient Sounds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Enhance concentration with nature sounds, white noise, or instrumental music
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rain Sounds</span>
                    <Button size="sm" variant="ghost">Play</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Forest Ambience</span>
                    <Button size="sm" variant="ghost">Play</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ocean Waves</span>
                    <Button size="sm" variant="ghost">Play</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Brown Noise</span>
                    <Button size="sm" variant="ghost">Play</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Distraction Blocking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Minimize interruptions by hiding notifications and non-essential UI elements
                </CardDescription>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Block Notifications</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hide Social Media</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Minimize UI Elements</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Configure Blocking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Focus Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">6h 30m</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Focus Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button 
              onClick={() => setIsFocusModeOpen(true)} 
              size="lg"
              className="gap-2"
            >
              <Target className="w-5 h-5" />
              Enter Focus Mode
            </Button>
          </div>
        </div>
      </div>

      <FocusMode 
        isOpen={isFocusModeOpen} 
        onClose={() => setIsFocusModeOpen(false)} 
      />
    </div>
  );
}