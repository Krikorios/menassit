import Redis from 'ioredis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { value: any; expires: number }> = new Map();
  private isRedisConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        this.redis = null;
        this.isRedisConnected = false;
        return;
      }

      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 0,
        lazyConnect: true,
        enableOfflineQueue: false,
        connectTimeout: 2000
      });

      this.redis.on('error', () => {
        this.isRedisConnected = false;
      });

      await this.redis.ping();
      this.isRedisConnected = true;
    } catch (error) {
      this.redis = null;
      this.isRedisConnected = false;
    }
  }

  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.getKey(key, options.prefix);

    try {
      if (this.isRedisConnected && this.redis) {
        const value = await this.redis.get(fullKey);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to memory cache
        const cached = this.memoryCache.get(fullKey);
        if (cached && cached.expires > Date.now()) {
          return cached.value;
        } else if (cached) {
          this.memoryCache.delete(fullKey);
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.getKey(key, options.prefix);
    const ttl = options.ttl || 3600; // Default 1 hour

    try {
      if (this.isRedisConnected && this.redis) {
        await this.redis.setex(fullKey, ttl, JSON.stringify(value));
      } else {
        // Fallback to memory cache
        this.memoryCache.set(fullKey, {
          value,
          expires: Date.now() + (ttl * 1000)
        });
        
        // Clean up expired entries periodically
        if (this.memoryCache.size > 1000) {
          this.cleanupMemoryCache();
        }
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.getKey(key, options.prefix);

    try {
      if (this.isRedisConnected && this.redis) {
        await this.redis.del(fullKey);
      } else {
        this.memoryCache.delete(fullKey);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string, options: CacheOptions = {}): Promise<void> {
    const fullPattern = this.getKey(pattern, options.prefix);

    try {
      if (this.isRedisConnected && this.redis) {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // For memory cache, iterate and delete matching keys
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern)) {
            this.memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expires <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Cache wrapper for functions
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, options);
    return result;
  }

  getStats() {
    return {
      redisConnected: this.isRedisConnected,
      memoryCacheSize: this.memoryCache.size,
      type: this.isRedisConnected ? 'redis' : 'memory'
    };
  }
}

export const cacheService = new CacheService();