import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Users, Zap, Brain, Server, Gauge, AlertCircle, Target } from "lucide-react";

interface AnalyticsData {
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
  user: {
    activeUsers: number;
    sessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  business: {
    tasksCompleted: number;
    revenueGenerated: number;
    clientSatisfaction: number;
    growthRate: number;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  aiInsights: {
    productivityScore: number;
    efficiencyTrends: number[];
    recommendedActions: string[];
    workspaceOptimization: number;
  };
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
  format: 'number' | 'percentage' | 'currency' | 'time';
}

export default function RealTimeAnalytics() {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return await response.json() as AnalyticsData;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatValue = (value: number | string, format: MetricCard['format']) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'time':
        return `${value}ms`;
      default:
        return value.toString();
    }
  };

  const MetricCardComponent = ({ metric }: { metric: MetricCard }) => {
    const IconComponent = metric.icon;
    const isPositive = metric.change >= 0;
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
          <IconComponent className={`h-4 w-4 ${metric.color}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metric.color}`}>
            {formatValue(metric.value, metric.format)}
          </div>
          <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{metric.change.toFixed(1)}% from last period
          </p>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Analytics Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400">
              Unable to load real-time analytics data. Please check your connection and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performanceMetrics: MetricCard[] = [
    {
      title: "Response Time",
      value: analyticsData.performance.responseTime,
      change: -5.2,
      icon: Zap,
      color: "text-blue-600",
      format: "time"
    },
    {
      title: "Throughput",
      value: analyticsData.performance.throughput,
      change: 12.3,
      icon: TrendingUp,
      color: "text-green-600",
      format: "number"
    },
    {
      title: "Error Rate",
      value: analyticsData.performance.errorRate,
      change: -15.1,
      icon: AlertCircle,
      color: "text-red-600",
      format: "percentage"
    },
    {
      title: "Uptime",
      value: analyticsData.performance.uptime,
      change: 0.1,
      icon: Server,
      color: "text-green-600",
      format: "percentage"
    }
  ];

  const userMetrics: MetricCard[] = [
    {
      title: "Active Users",
      value: analyticsData.user.activeUsers,
      change: 8.2,
      icon: Users,
      color: "text-purple-600",
      format: "number"
    },
    {
      title: "Session Duration",
      value: `${analyticsData.user.sessionDuration}min`,
      change: 15.7,
      icon: Activity,
      color: "text-orange-600",
      format: "number"
    },
    {
      title: "Bounce Rate",
      value: analyticsData.user.bounceRate,
      change: -8.3,
      icon: TrendingUp,
      color: "text-red-600",
      format: "percentage"
    },
    {
      title: "Conversion Rate",
      value: analyticsData.user.conversionRate,
      change: 22.1,
      icon: Target,
      color: "text-green-600",
      format: "percentage"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {performanceMetrics.map((metric, index) => (
            <MetricCardComponent key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* User Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {userMetrics.map((metric, index) => (
            <MetricCardComponent key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* System Health */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-blue-600" />
                Resource Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory</span>
                  <span>{analyticsData.system.memoryUsage}%</span>
                </div>
                <Progress value={analyticsData.system.memoryUsage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU</span>
                  <span>{analyticsData.system.cpuUsage}%</span>
                </div>
                <Progress value={analyticsData.system.cpuUsage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk</span>
                  <span>{analyticsData.system.diskUsage}%</span>
                </div>
                <Progress value={analyticsData.system.diskUsage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Productivity Score</span>
                    <span>{analyticsData.aiInsights.productivityScore}%</span>
                  </div>
                  <Progress value={analyticsData.aiInsights.productivityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Workspace Optimization</span>
                    <span>{analyticsData.aiInsights.workspaceOptimization.toFixed(0)}%</span>
                  </div>
                  <Progress value={analyticsData.aiInsights.workspaceOptimization} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analyticsData.aiInsights.recommendedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}