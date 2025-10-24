/**
 * Optimized Database Service
 * High-performance database operations with caching and optimization
 */

import { PrismaClient } from '@prisma/client';
// import DatabaseQueryOptimizer, { OptimizedQueries } from './query-optimizer';

// Singleton pattern for database connection
class OptimizedDatabaseService {
  private static instance: OptimizedDatabaseService;
  private prisma: PrismaClient;
  // private optimizer: DatabaseQueryOptimizer;
  // private queries: OptimizedQueries;
  private connectionPool: number;

  private constructor() {
    // Optimized Prisma configuration
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });

    // Temporarily disable optimizer
    // this.optimizer = new DatabaseQueryOptimizer(this.prisma, {
    //   ttl: 300, // 5 minutes default
    //   maxSize: 1000,
    //   enabled: true
    // });

    // this.queries = new OptimizedQueries(this.optimizer);
    this.connectionPool = this.calculateOptimalPoolSize();

    // Setup connection event handlers
    this.setupEventHandlers();
  }

  static getInstance(): OptimizedDatabaseService {
    if (!this.instance) {
      this.instance = new OptimizedDatabaseService();
    }
    return this.instance;
  }

  private calculateOptimalPoolSize(): number {
    const baseSize = 5;
    const maxSize = 20;
    
    // Adjust based on environment
    if (process.env.NODE_ENV === 'production') {
      return Math.min(parseInt(process.env.DB_POOL_SIZE || '10'), maxSize);
    }
    
    return baseSize;
  }

  private setupEventHandlers(): void {
    // Log connection events in development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        if (e.duration > 1000) { // Log slow queries
          console.warn(`🐌 Slow Query (${e.duration}ms):`, e.query);
        }
      });
    }
  }

  /**
   * Optimized Lead Operations
   */
  async getLeadsWithPagination(
    filters: any = {},
    page: number = 1,
    pageSize: number = 20
  ) {
    const skip = (page - 1) * pageSize;
    
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        skip,
        take: pageSize,
        where: filters,
        orderBy: { createdAt: 'desc' },
        include: {
          systemDetails: true
        }
      }),
      this.prisma.lead.count({ where: filters })
    ]);

    return {
      data,
      total,
      hasMore: skip + pageSize < total
    };
  }

  async getLeadById(id: string, includeRelations: boolean = true) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: includeRelations ? {
        systemDetails: true
      } : undefined
    });
  }

  async createLead(data: any) {
    try {
      const lead = await this.prisma.lead.create({
        data,
        include: {
          systemDetails: true
        }
      });

      // Invalidate related caches (disabled for now due to missing optimizer)
      // this.optimizer.invalidateCache(['leads', 'analytics']);
      
      return lead;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }

  async updateLead(id: string, data: any) {
    try {
      const lead = await this.prisma.lead.update({
        where: { id },
        data,
        include: {
          systemDetails: true
        }
      });

      // Invalidate specific caches (disabled for now due to missing optimizer)
      // this.optimizer.invalidateCache(['leads', `lead:${id}`, 'analytics']);
      
      return lead;
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  }

  /**
   * Optimized Analytics Operations
   */
  async getAnalyticsOverview() {
    // Simplified analytics overview without optimizer
    const totalLeads = await this.prisma.lead.count();
    const newLeads = await this.prisma.lead.count({
      where: { status: 'NEW' }
    });
    const qualifiedLeads = await this.prisma.lead.count({
      where: { status: 'QUALIFIED' }
    });
    
    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      conversionRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0
    };
  }

  async getLeadAnalytics(timeRange: number = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeRange * 24 * 60 * 60 * 1000);

    const [sourceBreakdown, totalLeads] = await Promise.all([
      // Lead sources
      this.prisma.lead.groupBy({
        by: ['source'],
        _count: { id: true },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Total leads in period
      this.prisma.lead.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ]);

    return {
      sourceBreakdown,
      totalLeads,
      timeRange
    };
  }

  /**
   * Optimized Visitor Tracking
   */
  async trackVisitor(visitorData: any) {
    try {
      // Create visitor tracking record
      const visitor = await this.prisma.visitorTracking.create({
        data: visitorData
      });

      // Invalidate visitor analytics cache (disabled for now)
      // this.optimizer.invalidateCache(['visitors', 'analytics']);
      
      return visitor;
    } catch (error) {
      console.error('Failed to track visitor:', error);
      throw error;
    }
  }

  async getVisitorAnalytics(timeRange: number = 7) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeRange * 24 * 60 * 60 * 1000);
    
    const totalVisitors = await this.prisma.visitorTracking.count({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    return {
      totalVisitors,
      timeRange
    };
  }

  /**
   * Optimized Settings Operations
   */
  async getSettings(category?: string) {
    // Note: Settings table not yet implemented in schema
    // Return empty array for now
    return [];
  }

  async updateSetting(key: string, value: any, category?: string) {
    // Note: Settings table not yet implemented in schema
    // Return mock setting for now
    return { key, value, category };
  }

  /**
   * Bulk Operations
   */
  async bulkCreateLeads(leadsData: any[]) {
    const results = [];
    for (const data of leadsData) {
      try {
        const lead = await this.prisma.lead.create({ data });
        results.push(lead);
      } catch (error) {
        console.error('Failed to create lead in bulk:', error);
        results.push({ error: error.message });
      }
    }
    return results;
  }

  async bulkUpdateLeads(updates: { id: string; data: any }[]) {
    const results = [];
    for (const update of updates) {
      try {
        const lead = await this.prisma.lead.update({
          where: { id: update.id },
          data: update.data
        });
        results.push(lead);
      } catch (error) {
        console.error('Failed to update lead in bulk:', error);
        results.push({ error: error.message });
      }
    }
    return results;
  }

  /**
   * Raw SQL for complex queries
   */
  async executeRawQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return this.prisma.$queryRawUnsafe<T[]>(sql, ...params);
  }

  /**
   * Database Health Check
   */
  async healthCheck() {
    try {
      const startTime = performance.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = performance.now() - startTime;

      return {
        status: 'healthy',
        responseTime: Math.round(responseTime),
        database: 'connected',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Performance Monitoring
   */
  getPerformanceMetrics() {
    return {
      connections: this.connectionPool,
      queries: 0,
      cacheHits: 0,
      timestamp: new Date().toISOString()
    };
  }

  clearCache(tags?: string[]) {
    // Cache clearing disabled (no optimizer available)
    console.log('Cache clearing requested but optimizer not available');
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const db = OptimizedDatabaseService.getInstance();

// Export types and utilities
export { OptimizedDatabaseService };
export default db;