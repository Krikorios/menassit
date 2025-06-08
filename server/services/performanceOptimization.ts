import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  requestCount: number;
  errorRate: number;
  arabicUserMetrics?: {
    rtlRenderTime: number;
    fontLoadTime: number;
    layoutShiftScore: number;
  };
}

class PerformanceOptimizationService {
  private metrics: PerformanceMetrics[] = [];
  private activeConnections = 0;
  private requestCount = 0;
  private errorCount = 0;
  private startTime = process.hrtime();
  private cpuStart = process.cpuUsage();

  // Performance monitoring middleware
  performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();
    const cpuStart = process.cpuUsage();
    this.activeConnections++;
    this.requestCount++;

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const responseTime = seconds * 1000 + nanoseconds / 1e6;
      const cpuUsage = process.cpuUsage(cpuStart);
      
      if (res.statusCode >= 400) {
        this.errorCount++;
      }

      this.recordMetrics({
        responseTime,
        memoryUsage: process.memoryUsage(),
        cpuUsage,
        activeConnections: this.activeConnections,
        requestCount: this.requestCount,
        errorRate: this.errorCount / this.requestCount
      });

      this.activeConnections--;
    });

    next();
  };

  private recordMetrics(metrics: PerformanceMetrics) {
    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log performance alerts
    this.checkPerformanceAlerts(metrics);
  }

  private checkPerformanceAlerts(metrics: PerformanceMetrics) {
    const alerts = [];

    if (metrics.responseTime > 2000) {
      alerts.push(`High response time: ${metrics.responseTime.toFixed(2)}ms`);
    }

    if (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal > 0.9) {
      alerts.push(`High memory usage: ${((metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100).toFixed(1)}%`);
    }

    if (metrics.errorRate > 0.05) {
      alerts.push(`High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
    }

    if (alerts.length > 0) {
      console.warn('[Performance Alert]', alerts.join(', '));
    }
  }

  // Get current performance snapshot
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  // Get performance averages over time
  getAverageMetrics(timeframeMinutes: number = 15): {
    avgResponseTime: number;
    avgMemoryUsage: number;
    avgCpuUsage: number;
    totalRequests: number;
    errorRate: number;
  } {
    const cutoffTime = Date.now() - (timeframeMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter((_, index) => 
      index >= this.metrics.length - Math.min(this.metrics.length, timeframeMinutes * 4) // ~4 samples per minute
    );

    if (recentMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        avgMemoryUsage: 0,
        avgCpuUsage: 0,
        totalRequests: 0,
        errorRate: 0
      };
    }

    const totals = recentMetrics.reduce((acc, metric) => ({
      responseTime: acc.responseTime + metric.responseTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage.heapUsed,
      cpuUsage: acc.cpuUsage + (metric.cpuUsage.user + metric.cpuUsage.system),
      requests: acc.requests + 1,
      errors: acc.errors + (metric.errorRate * metric.requestCount)
    }), { responseTime: 0, memoryUsage: 0, cpuUsage: 0, requests: 0, errors: 0 });

    return {
      avgResponseTime: totals.responseTime / recentMetrics.length,
      avgMemoryUsage: totals.memoryUsage / recentMetrics.length,
      avgCpuUsage: totals.cpuUsage / recentMetrics.length,
      totalRequests: this.requestCount,
      errorRate: totals.errors / Math.max(this.requestCount, 1)
    };
  }

  // Database query optimization suggestions
  getDatabaseOptimizationSuggestions(): string[] {
    const suggestions = [];
    const avgMetrics = this.getAverageMetrics();

    if (avgMetrics.avgResponseTime > 1000) {
      suggestions.push('Consider adding database indexes for frequently queried columns');
      suggestions.push('Implement query result caching for repeated requests');
      suggestions.push('Use database connection pooling to reduce connection overhead');
    }

    if (avgMetrics.avgMemoryUsage > 500 * 1024 * 1024) { // 500MB
      suggestions.push('Implement pagination for large dataset queries');
      suggestions.push('Use database query optimization to reduce memory footprint');
    }

    return suggestions;
  }

  // Arabic-specific performance recommendations
  getArabicPerformanceRecommendations(): string[] {
    return [
      'Use font-display: swap for Arabic fonts to prevent FOIT',
      'Preload critical Arabic font weights using <link rel="preload">',
      'Implement CSS containment for Arabic text sections',
      'Use logical CSS properties (margin-inline-start) for RTL compatibility',
      'Consider font subsetting for Arabic character ranges',
      'Implement proper fallback fonts for Arabic text'
    ];
  }

  // Memory cleanup and optimization
  optimizeMemoryUsage() {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear old metrics beyond retention period
    if (this.metrics.length > 500) {
      this.metrics = this.metrics.slice(-500);
    }

    console.log('[Performance] Memory optimization completed');
  }

  // Reset performance counters
  resetCounters() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.metrics = [];
    this.startTime = process.hrtime();
    this.cpuStart = process.cpuUsage();
    console.log('[Performance] Counters reset');
  }

  // Health check with performance metrics
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: any;
    recommendations: string[];
  } {
    const avgMetrics = this.getAverageMetrics();
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    // Determine health status
    if (avgMetrics.avgResponseTime > 3000 || avgMetrics.errorRate > 0.1) {
      status = 'critical';
      recommendations.push('Immediate performance optimization required');
    } else if (avgMetrics.avgResponseTime > 1000 || avgMetrics.errorRate > 0.05) {
      status = 'warning';
      recommendations.push('Performance monitoring recommended');
    }

    return {
      status,
      metrics: {
        ...avgMetrics,
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      },
      recommendations: [
        ...recommendations,
        ...this.getDatabaseOptimizationSuggestions(),
        ...this.getArabicPerformanceRecommendations()
      ]
    };
  }
}

export const performanceOptimizationService = new PerformanceOptimizationService();