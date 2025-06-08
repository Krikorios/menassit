import { storage } from '../storage';
import { cacheService } from './cacheService';

interface SystemMetrics {
  userCount: number;
  activeUsers: number;
  tasksCount: number;
  financialRecordsCount: number;
  voiceCommandsCount: number;
  aiInteractionsCount: number;
  systemUptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cacheStats: any;
}

interface UserActivity {
  userId: number;
  action: string;
  resource: string;
  timestamp: Date;
  metadata?: any;
}

class MonitoringService {
  private activities: UserActivity[] = [];
  private maxActivities = 10000; // Keep last 10k activities in memory

  async getSystemMetrics(): Promise<SystemMetrics> {
    return await cacheService.wrap(
      'system:metrics',
      async () => {
        // Get user metrics
        const userStats = await this.getUserStats();
        
        // Get system stats
        const systemStats = {
          systemUptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cacheStats: cacheService.getStats()
        };

        return { ...userStats, ...systemStats };
      },
      { ttl: 300 } // Cache for 5 minutes
    );
  }

  private async getUserStats() {
    try {
      // These would be actual database queries in a real implementation
      // For now, we'll use placeholder values that represent realistic data
      const stats = {
        userCount: 0,
        activeUsers: 0,
        tasksCount: 0,
        financialRecordsCount: 0,
        voiceCommandsCount: 0,
        aiInteractionsCount: 0
      };

      // Get user count - this would be a real query
      // const userCount = await storage.getUserCount();
      
      // Get active users (last 24 hours) - this would be a real query
      // const activeUsers = await storage.getActiveUsersCount(24);
      
      // Get resource counts - these would be real queries
      // const tasksCount = await storage.getTasksCount();
      // const financialRecordsCount = await storage.getFinancialRecordsCount();
      // const voiceCommandsCount = await storage.getVoiceCommandsCount();
      // const aiInteractionsCount = await storage.getAIInteractionsCount();

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        userCount: 0,
        activeUsers: 0,
        tasksCount: 0,
        financialRecordsCount: 0,
        voiceCommandsCount: 0,
        aiInteractionsCount: 0
      };
    }
  }

  logActivity(userId: number, action: string, resource: string, metadata?: any) {
    const activity: UserActivity = {
      userId,
      action,
      resource,
      timestamp: new Date(),
      metadata
    };

    this.activities.push(activity);

    // Keep only the last N activities
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(-this.maxActivities);
    }

    // Log to console for debugging
    console.log(`User ${userId} performed ${action} on ${resource}`);
  }

  getRecentActivities(limit: number = 100): UserActivity[] {
    return this.activities
      .slice(-limit)
      .reverse(); // Most recent first
  }

  getUserActivities(userId: number, limit: number = 50): UserActivity[] {
    return this.activities
      .filter(activity => activity.userId === userId)
      .slice(-limit)
      .reverse();
  }

  async getPerformanceMetrics() {
    return await cacheService.wrap(
      'system:performance',
      async () => {
        const metrics = {
          responseTime: this.getAverageResponseTime(),
          errorRate: this.getErrorRate(),
          throughput: this.getThroughput(),
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        };

        return metrics;
      },
      { ttl: 60 } // Cache for 1 minute
    );
  }

  private getAverageResponseTime(): number {
    // In a real implementation, this would calculate from stored response times
    // For now, return a simulated value
    return Math.random() * 100 + 50; // 50-150ms
  }

  private getErrorRate(): number {
    // In a real implementation, this would calculate from error logs
    // For now, return a simulated low error rate
    return Math.random() * 2; // 0-2%
  }

  private getThroughput(): number {
    // In a real implementation, this would calculate requests per second
    // For now, return a simulated value
    return Math.random() * 50 + 10; // 10-60 requests/second
  }

  async getUsageAnalytics(timeframe: 'day' | 'week' | 'month' = 'day') {
    const cacheKey = `analytics:usage:${timeframe}`;
    
    return await cacheService.wrap(
      cacheKey,
      async () => {
        // In a real implementation, this would query actual usage data
        const hours = timeframe === 'day' ? 24 : timeframe === 'week' ? 168 : 720;
        const dataPoints = timeframe === 'day' ? 24 : timeframe === 'week' ? 7 : 30;
        
        const analytics = {
          timeframe,
          totalUsers: 0,
          activeUsers: 0,
          totalTasks: 0,
          completedTasks: 0,
          totalExpenses: 0,
          totalIncome: 0,
          voiceCommands: 0,
          aiInteractions: 0,
          chartData: Array.from({ length: dataPoints }, (_, i) => ({
            label: this.getTimeLabel(i, timeframe),
            users: Math.floor(Math.random() * 50),
            tasks: Math.floor(Math.random() * 100),
            expenses: Math.floor(Math.random() * 1000),
            voiceCommands: Math.floor(Math.random() * 200)
          }))
        };

        return analytics;
      },
      { ttl: timeframe === 'day' ? 3600 : timeframe === 'week' ? 7200 : 14400 }
    );
  }

  private getTimeLabel(index: number, timeframe: 'day' | 'week' | 'month'): string {
    const now = new Date();
    
    if (timeframe === 'day') {
      const hour = new Date(now.getTime() - (23 - index) * 60 * 60 * 1000);
      return hour.getHours().toString().padStart(2, '0') + ':00';
    } else if (timeframe === 'week') {
      const day = new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
      return day.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      const day = new Date(now.getTime() - (29 - index) * 24 * 60 * 60 * 1000);
      return day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  async getHealthCheck() {
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: await this.checkDatabaseHealth(),
        cache: this.checkCacheHealth(),
        ai: await this.checkAIHealth(),
        voice: await this.checkVoiceHealth()
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };

    // Determine overall status
    const serviceStatuses = Object.values(health.services);
    if (serviceStatuses.some(status => status === 'unhealthy')) {
      health.status = 'unhealthy';
    } else if (serviceStatuses.some(status => status === 'degraded')) {
      health.status = 'degraded';
    }

    return health;
  }

  private async checkDatabaseHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    try {
      // Simple database ping - in real implementation, check connection pool
      await storage.getUser(1);
      return 'healthy';
    } catch (error) {
      console.error('Database health check failed:', error);
      return 'unhealthy';
    }
  }

  private checkCacheHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const stats = cacheService.getStats();
    if (stats.type === 'redis' && stats.redisConnected) {
      return 'healthy';
    } else if (stats.type === 'memory') {
      return 'degraded'; // Memory cache is less optimal but functional
    } else {
      return 'unhealthy';
    }
  }

  private async checkAIHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    try {
      // In real implementation, ping AI service
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  private async checkVoiceHealth(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    try {
      // In real implementation, check voice processing services
      return 'healthy';
    } catch (error) {
      return 'degraded';
    }
  }
}

export const monitoringService = new MonitoringService();