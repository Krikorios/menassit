import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { 
  Activity, 
  Server,
  Database,
  Zap,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Users,
  Mic,
  Brain,
  TrendingUp,
  Monitor,
  Cpu,
  HardDrive
} from "lucide-react";

export default function SystemMonitoringPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    if (user && (user.role !== "admin" && user.role !== "pro")) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Real-time system metrics
  const { data: systemMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/admin/metrics"],
    refetchInterval: refreshInterval,
    enabled: user?.role === "admin"
  });

  // Performance data
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/admin/performance"],
    refetchInterval: refreshInterval,
    enabled: user?.role === "admin" || user?.role === "pro"
  });

  // Usage analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics", timeframe],
    refetchInterval: 60000, // 1 minute for analytics
    enabled: user?.role === "admin"
  });

  // Health check
  const { data: healthCheck, isLoading: healthLoading } = useQuery({
    queryKey: ["/health"],
    refetchInterval: 15000, // 15 seconds
    enabled: true
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "pro")) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'unhealthy': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="dashboard-grid">
        <Sidebar className="hidden md:block" />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">System Monitoring</h1>
                <p className="text-muted-foreground mt-1">
                  Real-time system health and performance metrics
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5000">5s</SelectItem>
                    <SelectItem value="15000">15s</SelectItem>
                    <SelectItem value="30000">30s</SelectItem>
                    <SelectItem value="60000">1m</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">Auto-refresh</Badge>
              </div>
            </div>

            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">System Status</p>
                      <div className="flex items-center mt-1">
                        {healthCheck?.status === 'healthy' ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <Badge className={getStatusColor(healthCheck?.status || 'unknown')}>
                          {healthCheck?.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    <Server className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                      <p className="text-lg font-bold">
                        {healthCheck?.metrics?.uptime ? formatUptime(healthCheck.metrics.uptime) : 'N/A'}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                      <p className="text-lg font-bold">
                        {performanceData?.responseTime ? `${Math.round(performanceData.responseTime)}ms` : 'N/A'}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                      <p className="text-lg font-bold">
                        {healthCheck?.metrics?.memory ? formatBytes(healthCheck.metrics.memory.heapUsed) : 'N/A'}
                      </p>
                    </div>
                    <HardDrive className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Service Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {healthCheck?.services && Object.entries(healthCheck.services).map(([service, status]) => (
                    <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{service}</p>
                        <Badge className={getStatusColor(status as string)} size="sm">
                          {status as string}
                        </Badge>
                      </div>
                      <div className="w-2 h-2 rounded-full" 
                           style={{backgroundColor: status === 'healthy' ? '#10b981' : status === 'degraded' ? '#f59e0b' : '#ef4444'}} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="system">System Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Response Time</span>
                          <span>{performanceData?.responseTime ? `${Math.round(performanceData.responseTime)}ms` : 'N/A'}</span>
                        </div>
                        <Progress value={performanceData?.responseTime ? Math.min(performanceData.responseTime / 2, 100) : 0} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Error Rate</span>
                          <span>{performanceData?.errorRate ? `${performanceData.errorRate.toFixed(2)}%` : 'N/A'}</span>
                        </div>
                        <Progress value={performanceData?.errorRate || 0} className="bg-red-100" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Throughput</span>
                          <span>{performanceData?.throughput ? `${Math.round(performanceData.throughput)} req/s` : 'N/A'}</span>
                        </div>
                        <Progress value={performanceData?.throughput ? Math.min(performanceData.throughput * 2, 100) : 0} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Memory Usage Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {healthCheck?.metrics?.memory && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Heap Used</p>
                              <p className="font-semibold">{formatBytes(healthCheck.metrics.memory.heapUsed)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Heap Total</p>
                              <p className="font-semibold">{formatBytes(healthCheck.metrics.memory.heapTotal)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">External</p>
                              <p className="font-semibold">{formatBytes(healthCheck.metrics.memory.external)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">RSS</p>
                              <p className="font-semibold">{formatBytes(healthCheck.metrics.memory.rss)}</p>
                            </div>
                          </div>
                          <Progress 
                            value={(healthCheck.metrics.memory.heapUsed / healthCheck.metrics.memory.heapTotal) * 100} 
                            className="w-full"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                {user.role === "admin" && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Usage Analytics</h3>
                      <Select value={timeframe} onValueChange={(value: 'day' | 'week' | 'month') => setTimeframe(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">24 Hours</SelectItem>
                          <SelectItem value="week">7 Days</SelectItem>
                          <SelectItem value="month">30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Users</p>
                              <p className="text-2xl font-bold">{analyticsData?.totalUsers || 0}</p>
                            </div>
                            <Users className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Voice Commands</p>
                              <p className="text-2xl font-bold">{analyticsData?.voiceCommands || 0}</p>
                            </div>
                            <Mic className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">AI Interactions</p>
                              <p className="text-2xl font-bold">{analyticsData?.aiInteractions || 0}</p>
                            </div>
                            <Brain className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Tasks Created</p>
                              <p className="text-2xl font-bold">{analyticsData?.totalTasks || 0}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {analyticsData?.chartData && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Usage Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={analyticsData.chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Area 
                                  type="monotone" 
                                  dataKey="users" 
                                  stackId="1"
                                  stroke="#8884d8" 
                                  fill="#8884d8" 
                                  fillOpacity={0.6}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="voiceCommands" 
                                  stackId="1"
                                  stroke="#82ca9d" 
                                  fill="#82ca9d" 
                                  fillOpacity={0.6}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cache Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {systemMetrics?.cacheStats && (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Cache Type</span>
                            <Badge variant="outline">{systemMetrics.cacheStats.type}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Redis Connected</span>
                            <Badge className={systemMetrics.cacheStats.redisConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {systemMetrics.cacheStats.redisConnected ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Memory Cache Size</span>
                            <span>{systemMetrics.cacheStats.memoryCacheSize} items</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>User Count</span>
                          <span>{systemMetrics?.userCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Users</span>
                          <span>{systemMetrics?.activeUsers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Tasks</span>
                          <span>{systemMetrics?.tasksCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Financial Records</span>
                          <span>{systemMetrics?.financialRecordsCount || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}