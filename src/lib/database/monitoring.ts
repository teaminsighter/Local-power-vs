/**
 * Database Monitoring and Performance Tracking
 * Provides real-time database metrics and health monitoring
 */

import { PrismaClient } from '@prisma/client';

interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    total: number;
    maxConnections: number;
  };
  queries: {
    totalQueries: number;
    avgQueryTime: number;
    slowQueries: number;
    errorRate: number;
  };
  tables: {
    name: string;
    rowCount: number;
    sizeBytes: number;
    lastAccess: Date;
  }[];
  performance: {
    cacheHitRatio: number;
    indexUsage: number;
    deadlocks: number;
    blockedQueries: number;
  };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    lastBackup: Date | null;
    diskUsage: number;
  };
}

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  parameters?: any;
  error?: string;
  rowsAffected?: number;
}

class DatabaseMonitor {
  private prisma: PrismaClient;
  private queryMetrics: QueryMetrics[] = [];
  private maxMetricsHistory = 1000;
  private slowQueryThreshold = 1000; // ms
  private criticalErrorThreshold = 0.05; // 5%

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.setupQueryLogging();
  }

  private setupQueryLogging() {
    // Extend Prisma client with query logging
    this.prisma.$use(async (params, next) => {
      const start = Date.now();
      const timestamp = new Date();
      
      try {
        const result = await next(params);
        const duration = Date.now() - start;
        
        // Log query metrics
        this.logQuery({
          query: `${params.model}.${params.action}`,
          duration,
          timestamp,
          parameters: params.args,
          rowsAffected: Array.isArray(result) ? result.length : 1
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        
        // Log error metrics
        this.logQuery({
          query: `${params.model}.${params.action}`,
          duration,
          timestamp,
          parameters: params.args,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    });
  }

  private logQuery(metrics: QueryMetrics) {
    this.queryMetrics.push(metrics);
    
    // Maintain maximum history size
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
    }

    // Log slow queries
    if (metrics.duration > this.slowQueryThreshold) {
      console.warn(`Slow query detected: ${metrics.query} (${metrics.duration}ms)`, {
        query: metrics.query,
        duration: metrics.duration,
        parameters: metrics.parameters
      });
    }

    // Log errors
    if (metrics.error) {
      console.error(`Database query error: ${metrics.query}`, {
        query: metrics.query,
        error: metrics.error,
        parameters: metrics.parameters
      });
    }
  }

  async getMetrics(): Promise<DatabaseMetrics> {
    try {
      const [
        connectionInfo,
        queryStats,
        tableStats,
        performanceStats,
        healthStats
      ] = await Promise.all([
        this.getConnectionMetrics(),
        this.getQueryMetrics(),
        this.getTableMetrics(),
        this.getPerformanceMetrics(),
        this.getHealthMetrics()
      ]);

      return {
        connections: connectionInfo,
        queries: queryStats,
        tables: tableStats,
        performance: performanceStats,
        health: healthStats
      };
    } catch (error) {
      console.error('Error collecting database metrics:', error);
      throw error;
    }
  }

  private async getConnectionMetrics() {
    // For PostgreSQL
    try {
      const result = await this.prisma.$queryRaw<Array<{
        total_connections: number;
        active_connections: number;
        idle_connections: number;
        max_connections: number;
      }>>`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      const stats = result[0];
      return {
        active: stats.active_connections,
        idle: stats.idle_connections,
        total: stats.total_connections,
        maxConnections: stats.max_connections
      };
    } catch (error) {
      // Fallback for SQLite or connection issues
      return {
        active: 1,
        idle: 0,
        total: 1,
        maxConnections: 10
      };
    }
  }

  private getQueryMetrics() {
    const recentQueries = this.queryMetrics.filter(
      q => Date.now() - q.timestamp.getTime() < 60000 // Last minute
    );

    const totalQueries = recentQueries.length;
    const errorQueries = recentQueries.filter(q => q.error).length;
    const slowQueries = recentQueries.filter(q => q.duration > this.slowQueryThreshold).length;
    
    const avgQueryTime = totalQueries > 0 
      ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / totalQueries
      : 0;

    const errorRate = totalQueries > 0 ? errorQueries / totalQueries : 0;

    return {
      totalQueries,
      avgQueryTime,
      slowQueries,
      errorRate
    };
  }

  private async getTableMetrics() {
    try {
      // Get table statistics for PostgreSQL
      const result = await this.prisma.$queryRaw<Array<{
        table_name: string;
        row_count: bigint;
        size_bytes: bigint;
        last_access: Date;
      }>>`
        SELECT 
          schemaname || '.' || tablename as table_name,
          n_tup_ins + n_tup_upd + n_tup_del as row_count,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
          GREATEST(last_vacuum, last_autovacuum, last_analyze, last_autoanalyze) as last_access
        FROM pg_stat_user_tables
        ORDER BY size_bytes DESC
        LIMIT 20
      `;

      return result.map(row => ({
        name: row.table_name,
        rowCount: Number(row.row_count),
        sizeBytes: Number(row.size_bytes),
        lastAccess: row.last_access || new Date()
      }));
    } catch (error) {
      // Fallback table metrics for SQLite
      const tables = ['users', 'leads', 'system_details', 'visitor_tracking', 'ab_tests'];
      
      const tableStats = await Promise.all(
        tables.map(async (table) => {
          try {
            const count = await (this.prisma as any)[table].count();
            return {
              name: table,
              rowCount: count,
              sizeBytes: count * 1000, // Rough estimate
              lastAccess: new Date()
            };
          } catch {
            return {
              name: table,
              rowCount: 0,
              sizeBytes: 0,
              lastAccess: new Date()
            };
          }
        })
      );

      return tableStats;
    }
  }

  private async getPerformanceMetrics() {
    try {
      // PostgreSQL performance metrics
      const result = await this.prisma.$queryRaw<Array<{
        cache_hit_ratio: number;
        index_usage: number;
        deadlocks: number;
        blocked_queries: number;
      }>>`
        SELECT 
          round(
            100 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read))::numeric, 2
          ) as cache_hit_ratio,
          round(
            100 * sum(idx_blks_hit) / nullif(sum(idx_blks_hit) + sum(idx_blks_read), 0)::numeric, 2
          ) as index_usage,
          sum(deadlocks) as deadlocks,
          (SELECT count(*) FROM pg_stat_activity WHERE wait_event_type = 'Lock') as blocked_queries
        FROM pg_stat_database
        WHERE datname = current_database()
      `;

      const stats = result[0];
      return {
        cacheHitRatio: stats.cache_hit_ratio || 0,
        indexUsage: stats.index_usage || 0,
        deadlocks: stats.deadlocks,
        blockedQueries: stats.blocked_queries
      };
    } catch (error) {
      // Fallback metrics
      return {
        cacheHitRatio: 95,
        indexUsage: 85,
        deadlocks: 0,
        blockedQueries: 0
      };
    }
  }

  private async getHealthMetrics() {
    const queryStats = this.getQueryMetrics();
    const errorRate = queryStats.errorRate;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (errorRate > this.criticalErrorThreshold) {
      status = 'critical';
    } else if (errorRate > this.criticalErrorThreshold / 2 || queryStats.avgQueryTime > 500) {
      status = 'warning';
    }

    try {
      // Get database uptime (PostgreSQL)
      const uptimeResult = await this.prisma.$queryRaw<Array<{
        uptime_seconds: number;
      }>>`
        SELECT extract(epoch from (now() - pg_postmaster_start_time())) as uptime_seconds
      `;
      
      const uptime = uptimeResult[0]?.uptime_seconds || 0;
      
      return {
        status,
        uptime,
        lastBackup: await this.getLastBackupTime(),
        diskUsage: await this.getDiskUsage()
      };
    } catch (error) {
      return {
        status,
        uptime: process.uptime(),
        lastBackup: null,
        diskUsage: 0
      };
    }
  }

  private async getLastBackupTime(): Promise<Date | null> {
    // This would typically check backup logs or S3
    // For now, return a placeholder
    return new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  }

  private async getDiskUsage(): Promise<number> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        size_mb: number;
      }>>`
        SELECT round(pg_database_size(current_database()) / 1024 / 1024) as size_mb
      `;
      
      return result[0]?.size_mb || 0;
    } catch (error) {
      return 0;
    }
  }

  async getSlowQueries(limit = 10): Promise<QueryMetrics[]> {
    return this.queryMetrics
      .filter(q => q.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  async getErrorQueries(limit = 10): Promise<QueryMetrics[]> {
    return this.queryMetrics
      .filter(q => q.error)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getQueryTrends(timeRange = 3600000): Promise<{
    timestamps: Date[];
    avgQueryTimes: number[];
    queryVolumes: number[];
    errorRates: number[];
  }> {
    const now = Date.now();
    const intervals = 12; // 12 intervals in the time range
    const intervalDuration = timeRange / intervals;
    
    const timestamps: Date[] = [];
    const avgQueryTimes: number[] = [];
    const queryVolumes: number[] = [];
    const errorRates: number[] = [];
    
    for (let i = 0; i < intervals; i++) {
      const intervalStart = now - timeRange + (i * intervalDuration);
      const intervalEnd = intervalStart + intervalDuration;
      
      const intervalQueries = this.queryMetrics.filter(
        q => q.timestamp.getTime() >= intervalStart && q.timestamp.getTime() < intervalEnd
      );
      
      timestamps.push(new Date(intervalStart));
      queryVolumes.push(intervalQueries.length);
      
      if (intervalQueries.length > 0) {
        const avgTime = intervalQueries.reduce((sum, q) => sum + q.duration, 0) / intervalQueries.length;
        const errorCount = intervalQueries.filter(q => q.error).length;
        
        avgQueryTimes.push(avgTime);
        errorRates.push(errorCount / intervalQueries.length);
      } else {
        avgQueryTimes.push(0);
        errorRates.push(0);
      }
    }
    
    return {
      timestamps,
      avgQueryTimes,
      queryVolumes,
      errorRates
    };
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
      duration?: number;
    }>;
  }> {
    const checks = [];
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Database connectivity check
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;
      
      checks.push({
        name: 'database_connectivity',
        status: duration < 100 ? 'pass' : 'warn',
        message: `Database responds in ${duration}ms`,
        duration
      });
      
      if (duration > 100) overallStatus = 'warning';
    } catch (error) {
      checks.push({
        name: 'database_connectivity',
        status: 'fail',
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      overallStatus = 'critical';
    }

    // Query performance check
    const queryStats = this.getQueryMetrics();
    if (queryStats.errorRate > this.criticalErrorThreshold) {
      checks.push({
        name: 'query_error_rate',
        status: 'fail',
        message: `High error rate: ${(queryStats.errorRate * 100).toFixed(2)}%`
      });
      overallStatus = 'critical';
    } else if (queryStats.errorRate > this.criticalErrorThreshold / 2) {
      checks.push({
        name: 'query_error_rate',
        status: 'warn',
        message: `Elevated error rate: ${(queryStats.errorRate * 100).toFixed(2)}%`
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    } else {
      checks.push({
        name: 'query_error_rate',
        status: 'pass',
        message: `Error rate normal: ${(queryStats.errorRate * 100).toFixed(2)}%`
      });
    }

    // Average query time check
    if (queryStats.avgQueryTime > 1000) {
      checks.push({
        name: 'query_performance',
        status: 'warn',
        message: `Slow average query time: ${queryStats.avgQueryTime.toFixed(0)}ms`
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    } else {
      checks.push({
        name: 'query_performance',
        status: 'pass',
        message: `Query performance good: ${queryStats.avgQueryTime.toFixed(0)}ms avg`
      });
    }

    return {
      status: overallStatus,
      checks
    };
  }

  // Cleanup method to clear old metrics
  clearOldMetrics(olderThanMs = 3600000) { // 1 hour default
    const cutoff = Date.now() - olderThanMs;
    this.queryMetrics = this.queryMetrics.filter(
      q => q.timestamp.getTime() > cutoff
    );
  }
}

export { DatabaseMonitor, type DatabaseMetrics, type QueryMetrics };