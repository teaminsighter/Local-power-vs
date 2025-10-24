/**
 * Redis Caching Implementation for Local Power
 * Provides high-performance caching for API responses and data
 */

import Redis from 'ioredis';

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  keyPrefix: string;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  defaultTTL: number;
  lazyConnect: boolean;
}

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

class RedisCache {
  private static instance: RedisCache;
  private redis: Redis | null = null;
  private fallbackCache = new Map<string, CacheItem>();
  private config: CacheConfig;
  private isConnected = false;
  private stats = {
    hits: 0,
    misses: 0,
    errors: 0,
    sets: 0,
    deletes: 0
  };

  private constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'localpower:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'), // 1 hour
      lazyConnect: true
    };
  }

  public static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      console.log('🔗 Connecting to Redis...');
      
      this.redis = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        keyPrefix: this.config.keyPrefix,
        retryDelayOnFailover: this.config.retryDelayOnFailover,
        maxRetriesPerRequest: this.config.maxRetriesPerRequest,
        lazyConnect: this.config.lazyConnect,
        enableOfflineQueue: false,
        connectTimeout: 10000,
        commandTimeout: 5000
      });

      // Event handlers
      this.redis.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis error:', error);
        this.stats.errors++;
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      // Test connection
      await this.redis.ping();
      
      console.log('✅ Redis cache initialized');
    } catch (error) {
      console.error('❌ Redis connection failed, using fallback cache:', error);
      this.redis = null;
      this.isConnected = false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (this.redis && this.isConnected) {
        const cached = await this.redis.get(key);
        if (cached) {
          this.stats.hits++;
          const parsed = JSON.parse(cached) as CacheItem<T>;
          
          // Check if expired
          if (Date.now() - parsed.timestamp > parsed.ttl * 1000) {
            await this.delete(key);
            this.stats.misses++;
            return null;
          }
          
          return parsed.data;
        }
      }

      // Fallback to in-memory cache
      const fallbackItem = this.fallbackCache.get(key);
      if (fallbackItem) {
        if (Date.now() - fallbackItem.timestamp <= fallbackItem.ttl * 1000) {
          this.stats.hits++;
          return fallbackItem.data as T;
        } else {
          this.fallbackCache.delete(key);
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      this.stats.errors++;
      return null;
    }
  }

  public async set<T>(
    key: string, 
    value: T, 
    ttl: number = this.config.defaultTTL,
    tags: string[] = []
  ): Promise<boolean> {
    try {
      const cacheItem: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        tags
      };

      // Try Redis first
      if (this.redis && this.isConnected) {
        await this.redis.setex(key, ttl, JSON.stringify(cacheItem));
        
        // Store tags for cache invalidation
        if (tags.length > 0) {
          const tagKey = `${this.config.keyPrefix}tags:`;
          for (const tag of tags) {
            await this.redis.sadd(`${tagKey}${tag}`, key);
            await this.redis.expire(`${tagKey}${tag}`, ttl);
          }
        }
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.set(key, cacheItem);
        
        // Clean up expired entries periodically
        if (this.fallbackCache.size > 1000) {
          this.cleanupFallbackCache();
        }
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      this.stats.errors++;
      return false;
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      let deleted = false;

      // Delete from Redis
      if (this.redis && this.isConnected) {
        const result = await this.redis.del(key);
        deleted = result > 0;
      }

      // Delete from fallback cache
      if (this.fallbackCache.has(key)) {
        this.fallbackCache.delete(key);
        deleted = true;
      }

      if (deleted) {
        this.stats.deletes++;
      }

      return deleted;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      this.stats.errors++;
      return false;
    }
  }

  public async invalidateByTag(tag: string): Promise<number> {
    try {
      if (!this.redis || !this.isConnected) {
        // Fallback: clear items with matching tags
        let deleted = 0;
        for (const [key, item] of this.fallbackCache.entries()) {
          if (item.tags.includes(tag)) {
            this.fallbackCache.delete(key);
            deleted++;
          }
        }
        return deleted;
      }

      const tagKey = `${this.config.keyPrefix}tags:${tag}`;
      const keys = await this.redis.smembers(tagKey);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.del(tagKey);
      }

      return keys.length;
    } catch (error) {
      console.error(`Cache invalidate by tag error for tag ${tag}:`, error);
      this.stats.errors++;
      return 0;
    }
  }

  public async clear(): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.flushdb();
      }
      
      this.fallbackCache.clear();
      console.log('🧹 Cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
      this.stats.errors++;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      if (this.redis && this.isConnected) {
        const result = await this.redis.exists(key);
        return result === 1;
      }

      return this.fallbackCache.has(key);
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  public async keys(pattern: string = '*'): Promise<string[]> {
    try {
      if (this.redis && this.isConnected) {
        return await this.redis.keys(pattern);
      }

      // Simple pattern matching for fallback
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return Array.from(this.fallbackCache.keys()).filter(key => regex.test(key));
    } catch (error) {
      console.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  public getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : '0.00';

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      isConnected: this.isConnected,
      fallbackCacheSize: this.fallbackCache.size,
      redisConnected: this.redis !== null && this.isConnected
    };
  }

  private cleanupFallbackCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.fallbackCache.entries()) {
      if (now - item.timestamp > item.ttl * 1000) {
        this.fallbackCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.isConnected = false;
      console.log('🔌 Redis disconnected');
    }
  }

  // Method chaining for fluent API
  public async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.config.defaultTTL,
    tags: string[] = []
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    await this.set(key, fresh, ttl, tags);
    return fresh;
  }

  // Batch operations
  public async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (this.redis && this.isConnected && keys.length > 0) {
        const values = await this.redis.mget(...keys);
        return values.map(value => {
          if (value) {
            try {
              const parsed = JSON.parse(value) as CacheItem<T>;
              if (Date.now() - parsed.timestamp <= parsed.ttl * 1000) {
                this.stats.hits++;
                return parsed.data;
              }
            } catch {
              // Invalid JSON, ignore
            }
          }
          this.stats.misses++;
          return null;
        });
      }

      // Fallback
      return Promise.all(keys.map(key => this.get<T>(key)));
    } catch (error) {
      console.error('Cache mget error:', error);
      this.stats.errors++;
      return keys.map(() => null);
    }
  }

  public async mset(items: Array<{ key: string; value: any; ttl?: number; tags?: string[] }>): Promise<boolean> {
    try {
      const promises = items.map(item => 
        this.set(item.key, item.value, item.ttl, item.tags)
      );
      
      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('Cache mset error:', error);
      this.stats.errors++;
      return false;
    }
  }
}

// Cache key generators
export const CacheKeys = {
  lead: (id: string) => `lead:${id}`,
  leadList: (filters: string) => `leads:list:${filters}`,
  user: (id: string) => `user:${id}`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  abTest: (testId: string) => `abtest:${testId}`,
  visitor: (visitorId: string) => `visitor:${visitorId}`,
  pricing: (region: string = 'default') => `pricing:${region}`,
  systemDetails: (leadId: string) => `system:${leadId}`,
  dashboard: (userId: string, period: string) => `dashboard:${userId}:${period}`,
  search: (query: string, filters: string) => `search:${Buffer.from(query + filters).toString('base64')}`
};

// Cache tags for invalidation
export const CacheTags = {
  LEADS: 'leads',
  USERS: 'users',
  ANALYTICS: 'analytics',
  AB_TESTS: 'ab_tests',
  VISITORS: 'visitors',
  PRICING: 'pricing',
  SYSTEM_DETAILS: 'system_details',
  DASHBOARD: 'dashboard'
};

// Singleton instance
const cache = RedisCache.getInstance();

export { cache as Cache, RedisCache, type CacheConfig, type CacheItem };