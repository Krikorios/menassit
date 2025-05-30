import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVoice } from "@/hooks/useVoice";
import { aiService } from "@/services/aiService";
import { Brain, Volume2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DailyJoke() {
  const { speak } = useVoice();
  
  const { 
    data: jokeData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["/api/ai/daily-joke"],
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 2,
  });

  const handlePlayJoke = () => {
    if (jokeData?.joke) {
      speak(jokeData.joke);
    }
  };

  const handleRefreshJoke = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-slate-800 shadow-lg border border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI Joke Unavailable</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                Failed to load today's AI joke. Please try again.
              </p>
              <Button size="sm" variant="outline" onClick={handleRefreshJoke}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">Daily AI Joke</h3>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePlayJoke}
                  className="h-8 w-8 p-0"
                  title="Play joke aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefreshJoke}
                  className="h-8 w-8 p-0"
                  title="Get new joke"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 italic mb-3">
              {jokeData?.joke || "Loading today's AI-generated joke..."}
            </p>
            
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {jokeData?.cached ? "Cached" : "Fresh"}
                </Badge>
                <span>Powered by Local AI</span>
              </div>
              
              {jokeData?.timestamp && (
                <span>
                  {new Date(jokeData.timestamp).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {jokeData?.processingTime && (
              <div className="mt-2 text-xs text-muted-foreground">
                Generated in {jokeData.processingTime}ms
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
