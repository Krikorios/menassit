import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceBenchmark } from '@/components/PerformanceBenchmark';
import { Header } from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Activity, 
  BarChart3, 
  Zap, 
  Globe,
  Database,
  Cpu,
  Network,
  HardDrive
} from 'lucide-react';

export default function BenchmarkPage() {
  const { t } = useTranslation();

  const performanceInsights = [
    {
      category: 'Frontend Performance',
      icon: <Zap className="h-5 w-5" />,
      description: 'React rendering, bundle size, and Core Web Vitals analysis',
      metrics: ['First Contentful Paint', 'Largest Contentful Paint', 'Cumulative Layout Shift']
    },
    {
      category: 'Backend Performance',
      icon: <Database className="h-5 w-5" />,
      description: 'API response times, database query optimization, and server metrics',
      metrics: ['Response Time', 'Query Performance', 'Memory Usage']
    },
    {
      category: 'Network Optimization',
      icon: <Network className="h-5 w-5" />,
      description: 'Asset delivery, caching strategies, and CDN performance',
      metrics: ['Asset Size', 'Cache Hit Rate', 'Network Requests']
    },
    {
      category: 'Arabic RTL Performance',
      icon: <Globe className="h-5 w-5" />,
      description: 'Right-to-left layout rendering and Arabic font optimization',
      metrics: ['RTL Render Time', 'Font Loading', 'Layout Shifts']
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Performance Benchmark</h1>
              <p className="text-muted-foreground">
                Comprehensive analysis of application performance across all systems
              </p>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceInsights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {insight.icon}
                      <CardTitle className="text-sm font-medium">
                        {insight.category}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    <div className="space-y-1">
                      {insight.metrics.map((metric, metricIndex) => (
                        <Badge key={metricIndex} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Benchmark Tool */}
            <PerformanceBenchmark />

            {/* Performance Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Optimization Guide
                </CardTitle>
                <CardDescription>
                  Best practices for maintaining optimal application performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="frontend" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="frontend">Frontend</TabsTrigger>
                    <TabsTrigger value="backend">Backend</TabsTrigger>
                    <TabsTrigger value="database">Database</TabsTrigger>
                    <TabsTrigger value="arabic">Arabic RTL</TabsTrigger>
                  </TabsList>

                  <TabsContent value="frontend" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Frontend Optimization</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Bundle Size Optimization</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Implement code splitting with React.lazy()</li>
                            <li>• Enable tree shaking for unused imports</li>
                            <li>• Use dynamic imports for heavy components</li>
                            <li>• Optimize image assets with WebP format</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">React Performance</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Use React.memo for expensive components</li>
                            <li>• Implement useMemo for complex calculations</li>
                            <li>• Use useCallback for event handlers</li>
                            <li>• Avoid inline objects in JSX props</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="backend" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Backend Optimization</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">API Performance</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Implement response caching with Redis</li>
                            <li>• Use compression middleware for responses</li>
                            <li>• Add request rate limiting</li>
                            <li>• Optimize serialization with faster JSON parsers</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Server Resources</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Monitor memory usage and garbage collection</li>
                            <li>• Use connection pooling for databases</li>
                            <li>• Implement graceful shutdowns</li>
                            <li>• Add health check endpoints</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="database" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Database Optimization</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Query Performance</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Add indexes for frequently queried columns</li>
                            <li>• Use query analysis tools (EXPLAIN)</li>
                            <li>• Implement pagination for large datasets</li>
                            <li>• Avoid N+1 query problems</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Connection Management</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Configure appropriate pool sizes</li>
                            <li>• Monitor connection timeouts</li>
                            <li>• Use read replicas for scaling</li>
                            <li>• Implement connection health checks</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="arabic" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Arabic RTL Optimization</h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Font Performance</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Use font-display: swap for Arabic fonts</li>
                            <li>• Preload critical Arabic font variants</li>
                            <li>• Implement font subsetting for Arabic characters</li>
                            <li>• Use web fonts with proper fallbacks</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">RTL Layout Performance</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Use CSS logical properties (margin-inline)</li>
                            <li>• Avoid layout thrashing during direction changes</li>
                            <li>• Optimize text rendering with CSS containment</li>
                            <li>• Use direction-aware icons and images</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Adaptive Theme RTL</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Cache RTL calculations for theme changes</li>
                            <li>• Use CSS variables for direction-aware styling</li>
                            <li>• Implement smooth transitions for RTL switches</li>
                            <li>• Optimize color contrast for Arabic text</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}