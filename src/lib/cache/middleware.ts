/**
 * Cache Middleware for API Routes
 * Provides caching decorators and utilities for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { Cache, CacheKeys, CacheTags } from './redis';

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  varyBy?: string[];
  skipCache?: boolean;
  skipCacheStore?: boolean;
}

interface CacheContext {
  key: string;
  hit: boolean;
  source: 'redis' | 'memory' | 'miss';
  duration?: number;
}

/**
 * Cache middleware for API routes
 */
export function withCache(options: CacheOptions = {}) {
  return function <T extends any[], R>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const req = args[0] as NextRequest;
      const context = args[1] as any;

      // Generate cache key
      const cacheKey = generateCacheKey(req, options.varyBy || []);
      
      // Skip cache if requested
      if (options.skipCache || shouldSkipCache(req)) {
        return originalMethod.apply(this, args);
      }

      try {
        // Try to get from cache
        const start = Date.now();
        const cached = await Cache.get<any>(cacheKey);
        
        if (cached !== null) {
          const duration = Date.now() - start;
          
          // Add cache headers
          const response = NextResponse.json(cached);
          response.headers.set('X-Cache', 'HIT');
          response.headers.set('X-Cache-Duration', `${duration}ms`);
          response.headers.set('Cache-Control', `public, max-age=${options.ttl || 3600}`);
          
          return response as R;
        }

        // Execute original method
        const result = await originalMethod.apply(this, args);
        
        // Store in cache if not skipped
        if (!options.skipCacheStore && result) {
          const cacheData = extractResponseData(result);
          await Cache.set(
            cacheKey,
            cacheData,
            options.ttl || 3600,
            options.tags || []
          );
        }

        // Add cache miss headers
        if (result instanceof NextResponse) {
          result.headers.set('X-Cache', 'MISS');
          result.headers.set('Cache-Control', `public, max-age=${options.ttl || 3600}`);
        }

        return result;
      } catch (error) {
        console.error('Cache middleware error:', error);
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * Async function wrapper for caching
 */
export async function cacheWrapper<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<{ data: T; context: CacheContext }> {
  const start = Date.now();
  
  try {
    // Try cache first
    if (!options.skipCache) {
      const cached = await Cache.get<T>(key);
      if (cached !== null) {
        return {
          data: cached,
          context: {
            key,
            hit: true,
            source: 'redis',
            duration: Date.now() - start
          }
        };
      }
    }

    // Fetch fresh data
    const data = await fetcher();
    
    // Store in cache
    if (!options.skipCacheStore && data !== null && data !== undefined) {
      await Cache.set(key, data, options.ttl || 3600, options.tags || []);
    }

    return {
      data,
      context: {
        key,
        hit: false,
        source: 'miss',
        duration: Date.now() - start
      }
    };
  } catch (error) {
    console.error(`Cache wrapper error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req: NextRequest, varyBy: string[] = []): string {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  
  // Base key from pathname
  let key = pathname.replace(/\//g, ':').replace(/^:/, '');
  
  // Add query parameters
  const sortedParams = Array.from(searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  
  if (sortedParams) {
    key += `:${Buffer.from(sortedParams).toString('base64')}`;
  }
  
  // Add vary by headers
  for (const header of varyBy) {
    const value = req.headers.get(header);
    if (value) {
      key += `:${header}=${Buffer.from(value).toString('base64')}`;
    }
  }
  
  // Add HTTP method
  key += `:${req.method}`;
  
  return key;
}

/**
 * Extract response data for caching
 */
function extractResponseData(response: any): any {
  if (response instanceof NextResponse) {
    // Extract JSON data from Response object
    try {
      return response.json();
    } catch {
      return null;
    }
  }
  
  return response;
}

/**
 * Check if request should skip cache
 */
function shouldSkipCache(req: NextRequest): boolean {
  // Skip cache for non-GET requests
  if (req.method !== 'GET') {
    return true;
  }
  
  // Skip cache if no-cache header present
  const cacheControl = req.headers.get('cache-control');
  if (cacheControl?.includes('no-cache') || cacheControl?.includes('no-store')) {
    return true;
  }
  
  // Skip cache for development if specified
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_CACHE_DEV === 'true') {
    return true;
  }
  
  return false;
}

/**
 * Cache invalidation utilities
 */
export class CacheInvalidator {
  /**
   * Invalidate cache by tags
   */
  static async invalidateByTags(tags: string[]): Promise<void> {
    const promises = tags.map(tag => Cache.invalidateByTag(tag));
    await Promise.all(promises);
    console.log(`Cache invalidated for tags: ${tags.join(', ')}`);
  }

  /**
   * Invalidate cache by pattern
   */
  static async invalidateByPattern(pattern: string): Promise<void> {
    const keys = await Cache.keys(pattern);
    if (keys.length > 0) {
      const promises = keys.map(key => Cache.delete(key));
      await Promise.all(promises);
      console.log(`Cache invalidated for pattern ${pattern}: ${keys.length} keys`);
    }
  }

  /**
   * Invalidate all lead-related caches
   */
  static async invalidateLeads(): Promise<void> {
    await this.invalidateByTags([CacheTags.LEADS]);
    await this.invalidateByPattern('*leads*');
  }

  /**
   * Invalidate all user-related caches
   */
  static async invalidateUsers(): Promise<void> {
    await this.invalidateByTags([CacheTags.USERS]);
    await this.invalidateByPattern('*users*');
  }

  /**
   * Invalidate all analytics caches
   */
  static async invalidateAnalytics(): Promise<void> {
    await this.invalidateByTags([CacheTags.ANALYTICS]);
    await this.invalidateByPattern('*analytics*');
  }

  /**
   * Invalidate dashboard caches for a user
   */
  static async invalidateDashboard(userId?: string): Promise<void> {
    if (userId) {
      await this.invalidateByPattern(`*dashboard*${userId}*`);
    } else {
      await this.invalidateByTags([CacheTags.DASHBOARD]);
    }
  }
}

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  /**
   * Warm frequently accessed endpoints
   */
  static async warmCache(): Promise<void> {
    console.log('Starting cache warming...');
    
    const promises = [
      // Warm pricing data
      Cache.remember(
        CacheKeys.pricing('default'),
        () => this.fetchPricingData(),
        7200, // 2 hours
        [CacheTags.PRICING]
      ),
      
      // Warm analytics data
      Cache.remember(
        CacheKeys.analytics('overview', 'today'),
        () => this.fetchAnalyticsData('overview', 'today'),
        900, // 15 minutes
        [CacheTags.ANALYTICS]
      ),
      
      // Add more cache warming as needed
    ];

    await Promise.all(promises);
    console.log('Cache warming completed');
  }

  private static async fetchPricingData(): Promise<any> {
    // This would fetch actual pricing data
    return {
      solar_panel_cost_per_watt: 2.50,
      installation_cost_per_watt: 1.50,
      federal_tax_credit: 0.30,
      updated_at: new Date().toISOString()
    };
  }

  private static async fetchAnalyticsData(type: string, period: string): Promise<any> {
    // This would fetch actual analytics data
    return {
      leads: 0,
      conversions: 0,
      revenue: 0,
      period,
      updated_at: new Date().toISOString()
    };
  }
}

/**
 * Cache statistics and monitoring
 */
export class CacheMonitor {
  /**
   * Get cache performance statistics
   */
  static async getStats(): Promise<any> {
    return Cache.getStats();
  }

  /**
   * Health check for cache system
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    redis: boolean;
    fallback: boolean;
    latency: number;
  }> {
    const start = Date.now();
    
    try {
      // Test cache operations
      const testKey = 'health_check_' + Date.now();
      const testValue = { test: true, timestamp: Date.now() };
      
      await Cache.set(testKey, testValue, 10);
      const retrieved = await Cache.get(testKey);
      await Cache.delete(testKey);
      
      const latency = Date.now() - start;
      const stats = await Cache.getStats();
      
      return {
        status: latency < 100 ? 'healthy' : latency < 500 ? 'degraded' : 'unhealthy',
        redis: stats.redisConnected,
        fallback: stats.fallbackCacheSize > 0,
        latency
      };
    } catch (error) {
      console.error('Cache health check failed:', error);
      return {
        status: 'unhealthy',
        redis: false,
        fallback: false,
        latency: Date.now() - start
      };
    }
  }
}

// Export all utilities
export {
  type CacheOptions,
  type CacheContext,
  generateCacheKey,
  shouldSkipCache
};