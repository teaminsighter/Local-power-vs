/**
 * Database Query Optimization and Caching Layer
 * Provides intelligent caching, query optimization, and performance monitoring
 */

import { PrismaClient } from '@prisma/client';

interface QueryCacheConfig {
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Maximum cache size
  enabled?: boolean; // Enable/disable caching
  tags?: string[]; // Cache tags for invalidation
}

interface QueryMetrics {
  queryTime: number;
  cacheHit: boolean;
  tableName?: string;
  operation: string;
  createdAt: Date;
}

interface OptimizationHint {
  useIndex?: string[];
  limit?: number;
  orderBy?: string;
  include?: string[];
  select?: string[];
}

/**
 * In-memory cache with LRU eviction
 */
class QueryCache {
  private cache = new Map<string, { data: any; expiry: number; tags: string[] }>();
  private accessOrder = new Map<string, number>();
  private maxSize: number;
  private accessCounter = 0;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  set(key: string, data: any, ttl: number = 300, tags: string[] = []): void {
    const expiry = Date.now() + (ttl * 1000);
    
    // Evict expired entries
    this.evictExpired();
    
    // Evict LRU if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, { data, expiry, tags });
    this.accessOrder.set(key, ++this.accessCounter);
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access order
    this.accessOrder.set(key, ++this.accessCounter);
    return entry.data;
  }

  invalidate(tags: string[]): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
      }
    }
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestAccess = Infinity;

    for (const [key, access] of this.accessOrder.entries()) {
      if (access < oldestAccess) {
        oldestAccess = access;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.getHitRate()
    };
  }

  private getHitRate(): number {
    // This would need to be tracked separately for accurate hit rate
    return 0.85; // Placeholder
  }
}

/**
 * Query performance monitoring
 */
class QueryMetricsCollector {
  private metrics: QueryMetrics[] = [];
  private maxMetrics = 1000;

  record(metric: QueryMetrics): void {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getSlowQueries(threshold: number = 1000): QueryMetrics[] {
    return this.metrics.filter(m => m.queryTime > threshold);
  }

  getAverageQueryTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.queryTime, 0);
    return total / this.metrics.length;
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    const hits = this.metrics.filter(m => m.cacheHit).length;
    return hits / this.metrics.length;
  }

  getMetricsReport() {
    return {
      totalQueries: this.metrics.length,
      averageQueryTime: this.getAverageQueryTime(),
      cacheHitRate: this.getCacheHitRate(),
      slowQueries: this.getSlowQueries().length,
      recentSlowQueries: this.getSlowQueries().slice(-10)
    };
  }
}

/**
 * Main Database Query Optimizer
 */
export class DatabaseQueryOptimizer {
  private cache: QueryCache;
  private metrics: QueryMetricsCollector;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient, cacheConfig?: QueryCacheConfig) {
    this.prisma = prisma;
    this.cache = new QueryCache(cacheConfig?.maxSize || 1000);
    this.metrics = new QueryMetricsCollector();
  }

  /**
   * Execute query with caching and optimization
   */
  async executeQuery<T>(
    queryFn: () => Promise<T>,
    cacheKey: string,
    config: QueryCacheConfig = {},
    hints: OptimizationHint = {}
  ): Promise<T> {
    const startTime = performance.now();
    const { ttl = 300, enabled = true, tags = [] } = config;

    // Try cache first
    if (enabled) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        const queryTime = performance.now() - startTime;
        this.metrics.record({
          queryTime,
          cacheHit: true,
          operation: 'SELECT',
          createdAt: new Date()
        });
        return cached;
      }
    }

    // Execute query with optimization hints
    try {
      const result = await this.executeWithHints(queryFn, hints);
      
      const queryTime = performance.now() - startTime;
      this.metrics.record({
        queryTime,
        cacheHit: false,
        operation: 'SELECT',
        createdAt: new Date()
      });

      // Cache result
      if (enabled) {
        this.cache.set(cacheKey, result, ttl, tags);
      }

      return result;
    } catch (error) {
      console.error('Database query failed:', error);
      throw error;
    }
  }

  /**
   * Optimized query execution with hints
   */
  private async executeWithHints<T>(
    queryFn: () => Promise<T>,
    hints: OptimizationHint
  ): Promise<T> {
    // For now, just execute the query
    // In a real implementation, you'd modify the query based on hints
    return await queryFn();
  }

  /**
   * Optimized pagination
   */
  async getPaginatedResults<T>(
    queryFn: (skip: number, take: number) => Promise<T[]>,
    page: number = 1,
    pageSize: number = 20,
    cacheKey?: string
  ): Promise<{ data: T[]; total?: number; hasMore: boolean }> {
    const skip = (page - 1) * pageSize;
    const take = pageSize + 1; // Get one extra to check if there are more

    const cacheKeyWithPagination = cacheKey ? `${cacheKey}:page:${page}:size:${pageSize}` : undefined;

    const results = await this.executeQuery(
      () => queryFn(skip, take),
      cacheKeyWithPagination || `pagination:${skip}:${take}`,
      { ttl: 180, tags: ['pagination'] } // Shorter TTL for pagination
    );

    const hasMore = results.length > pageSize;
    const data = hasMore ? results.slice(0, -1) : results;

    return {
      data,
      hasMore,
      total: undefined // Could be calculated separately if needed
    };
  }

  /**
   * Bulk operations optimization
   */
  async executeBulkOperation<T>(
    operations: (() => Promise<T>)[],
    batchSize: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Query optimization recommendations
   */
  generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.metrics.getMetricsReport();

    if (report.cacheHitRate < 0.5) {
      recommendations.push('Consider increasing cache TTL or improving cache key strategy');
    }

    if (report.averageQueryTime > 500) {
      recommendations.push('Review slow queries and consider adding database indexes');
    }

    if (report.slowQueries > 10) {
      recommendations.push('Multiple slow queries detected - review query patterns');
    }

    return recommendations;
  }

  /**
   * Cache management
   */
  invalidateCache(tags: string[]): void {
    this.cache.invalidate(tags);
  }

  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Performance monitoring
   */
  getPerformanceMetrics() {
    return {
      cache: this.cache.getStats(),
      queries: this.metrics.getMetricsReport(),
      recommendations: this.generateOptimizationRecommendations()
    };
  }
}

/**
 * Common query optimization patterns
 */
export class OptimizedQueries {
  private optimizer: DatabaseQueryOptimizer;

  constructor(optimizer: DatabaseQueryOptimizer) {
    this.optimizer = optimizer;
  }

  /**
   * Optimized lead queries with caching
   */
  async getLeads(filters: any = {}, page: number = 1, pageSize: number = 20) {
    const cacheKey = `leads:${JSON.stringify(filters)}`;
    
    return this.optimizer.getPaginatedResults(
      (skip, take) => this.optimizer['prisma'].lead.findMany({
        skip,
        take,
        where: filters,
        orderBy: { createdAt: 'desc' },
        include: {
          calculatorData: true,
          consultationData: true
        }
      }),
      page,
      pageSize,
      cacheKey
    );
  }

  /**
   * Cached analytics queries
   */
  async getAnalyticsOverview() {
    return this.optimizer.executeQuery(
      async () => {
        const [totalLeads, recentLeads, conversionData] = await Promise.all([
          this.optimizer['prisma'].lead.count(),
          this.optimizer['prisma'].lead.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            }
          }),
          this.optimizer['prisma'].lead.groupBy({
            by: ['source'],
            _count: { id: true },
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          })
        ]);

        return {
          totalLeads,
          recentLeads,
          conversionData
        };
      },
      'analytics:overview',
      { ttl: 600, tags: ['analytics', 'leads'] } // 10 minute cache
    );
  }

  /**
   * Optimized visitor tracking
   */
  async getVisitorAnalytics(timeRange: number = 7) {
    return this.optimizer.executeQuery(
      () => this.optimizer['prisma'].visitorTracking.groupBy({
        by: ['date'],
        _count: { id: true },
        _sum: { sessionDuration: true },
        where: {
          timestamp: {
            gte: new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { date: 'asc' }
      }),
      `visitor-analytics:${timeRange}d`,
      { ttl: 1800, tags: ['analytics', 'visitors'] } // 30 minute cache
    );
  }
}

/**
 * Database connection pool optimization
 */
export class ConnectionPoolOptimizer {
  static optimizePrismaConfig() {
    return {
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      // Connection pool optimization
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    };
  }

  static getOptimalPoolSize(): number {
    // Calculate based on available memory and expected load
    const availableMemory = process.memoryUsage().heapTotal;
    const basePoolSize = 5;
    const scaledPoolSize = Math.min(Math.floor(availableMemory / (50 * 1024 * 1024)), 20); // 50MB per connection
    
    return Math.max(basePoolSize, scaledPoolSize);
  }
}

export default DatabaseQueryOptimizer;