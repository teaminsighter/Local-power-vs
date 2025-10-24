/**
 * Optimized Database Connection with Connection Pooling
 * Provides singleton Prisma client with performance optimizations
 */

import { PrismaClient } from '@prisma/client';
import { DatabaseMonitor } from './monitoring';

interface DatabaseConfig {
  url: string;
  connectionLimit?: number;
  poolTimeout?: number;
  acquireTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  logLevel?: 'info' | 'query' | 'warn' | 'error';
  enableMonitoring?: boolean;
}

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private prisma: PrismaClient | null = null;
  private monitor: DatabaseMonitor | null = null;
  private config: DatabaseConfig;
  private connectionAttempts = 0;
  private isConnected = false;
  private lastHealthCheck = 0;
  private healthCheckInterval = 60000; // 1 minute

  private constructor(config: DatabaseConfig) {
    this.config = {
      connectionLimit: 20,
      poolTimeout: 30,
      acquireTimeout: 60000,
      retryAttempts: 3,
      retryDelay: 1000,
      logLevel: process.env.NODE_ENV === 'development' ? 'query' : 'error',
      enableMonitoring: true,
      ...config
    };
  }

  public static getInstance(config?: DatabaseConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      if (!config) {
        throw new Error('Database configuration required for first initialization');
      }
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<PrismaClient> {
    if (this.prisma && this.isConnected) {
      // Perform health check if enough time has passed
      if (Date.now() - this.lastHealthCheck > this.healthCheckInterval) {
        await this.performHealthCheck();
      }
      return this.prisma;
    }

    const startTime = Date.now();
    
    try {
      console.log('🔗 Initializing database connection...');
      
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: this.config.url
          }
        },
        log: this.getLogLevels(),
        errorFormat: 'pretty'
      });

      // Configure connection pooling and timeouts
      this.configurePrismaHooks();

      // Test the connection
      await this.testConnection();
      
      // Initialize monitoring if enabled
      if (this.config.enableMonitoring) {
        this.monitor = new DatabaseMonitor(this.prisma);
        console.log('📊 Database monitoring enabled');
      }

      this.isConnected = true;
      this.connectionAttempts = 0;
      this.lastHealthCheck = Date.now();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Database connected successfully in ${duration}ms`);
      
      return this.prisma;
    } catch (error) {
      this.connectionAttempts++;
      console.error(`❌ Database connection failed (attempt ${this.connectionAttempts}):`, error);
      
      if (this.connectionAttempts < (this.config.retryAttempts || 3)) {
        console.log(`🔄 Retrying connection in ${this.config.retryDelay}ms...`);
        await this.delay(this.config.retryDelay || 1000);
        return this.connect();
      }
      
      throw new Error(`Database connection failed after ${this.connectionAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getLogLevels(): any[] {
    const logLevels = [];
    
    switch (this.config.logLevel) {
      case 'query':
        logLevels.push({ emit: 'event', level: 'query' });
        logLevels.push({ emit: 'event', level: 'info' });
        logLevels.push({ emit: 'event', level: 'warn' });
        logLevels.push({ emit: 'event', level: 'error' });
        break;
      case 'info':
        logLevels.push({ emit: 'event', level: 'info' });
        logLevels.push({ emit: 'event', level: 'warn' });
        logLevels.push({ emit: 'event', level: 'error' });
        break;
      case 'warn':
        logLevels.push({ emit: 'event', level: 'warn' });
        logLevels.push({ emit: 'event', level: 'error' });
        break;
      case 'error':
        logLevels.push({ emit: 'event', level: 'error' });
        break;
    }
    
    return logLevels;
  }

  private configurePrismaHooks() {
    if (!this.prisma) return;

    // Query logging for development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        if (e.duration > 1000) { // Log slow queries
          console.log(`🐌 Slow Query (${e.duration}ms): ${e.query}`);
          console.log(`Parameters: ${e.params}`);
        }
      });
    }

    // Error logging
    this.prisma.$on('error', (e) => {
      console.error('🔥 Database Error:', e);
    });

    // Info logging
    this.prisma.$on('info', (e) => {
      console.info('ℹ️ Database Info:', e.message);
    });

    // Warning logging
    this.prisma.$on('warn', (e) => {
      console.warn('⚠️ Database Warning:', e.message);
    });

    // Connection timeout middleware
    this.prisma.$use(async (params, next) => {
      const start = Date.now();
      
      try {
        const result = await Promise.race([
          next(params),
          this.timeoutPromise(this.config.acquireTimeout || 60000)
        ]);
        
        const duration = Date.now() - start;
        
        // Log performance metrics
        if (duration > 5000) { // 5 seconds
          console.warn(`⏱️ Long-running query detected: ${params.model}.${params.action} (${duration}ms)`);
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        console.error(`💥 Query failed after ${duration}ms: ${params.model}.${params.action}`, error);
        throw error;
      }
    });
  }

  private async testConnection(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Prisma client not initialized');
    }

    try {
      // Simple connectivity test
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Test database permissions
      await this.prisma.$queryRaw`SELECT current_user, current_database()`;
      
      console.log('✅ Database connectivity test passed');
    } catch (error) {
      console.error('❌ Database connectivity test failed:', error);
      throw error;
    }
  }

  private async performHealthCheck(): Promise<boolean> {
    if (!this.prisma) {
      this.isConnected = false;
      return false;
    }

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;
      
      this.lastHealthCheck = Date.now();
      
      if (duration > 5000) {
        console.warn(`⚠️ Database health check slow: ${duration}ms`);
        return false;
      }
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Database operation timeout after ${ms}ms`));
      }, ms);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async disconnect(): Promise<void> {
    if (this.prisma) {
      console.log('🔌 Disconnecting from database...');
      await this.prisma.$disconnect();
      this.prisma = null;
      this.isConnected = false;
      console.log('✅ Database disconnected');
    }
  }

  public getClient(): PrismaClient {
    if (!this.prisma || !this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.prisma;
  }

  public getMonitor(): DatabaseMonitor | null {
    return this.monitor;
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  public async getConnectionInfo() {
    if (!this.prisma) {
      return null;
    }

    try {
      const result = await this.prisma.$queryRaw<Array<{
        current_database: string;
        current_user: string;
        version: string;
      }>>`
        SELECT 
          current_database(),
          current_user,
          version()
      `;

      return result[0];
    } catch (error) {
      console.error('Failed to get connection info:', error);
      return null;
    }
  }

  // Method to force reconnection
  public async reconnect(): Promise<PrismaClient> {
    await this.disconnect();
    this.connectionAttempts = 0;
    return this.connect();
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    console.log('🛑 Initiating database shutdown...');
    
    // Stop monitoring cleanup
    if (this.monitor) {
      this.monitor.clearOldMetrics();
    }

    // Disconnect from database
    await this.disconnect();
    
    console.log('✅ Database shutdown complete');
  }
}

// Singleton instance management
let dbConnection: DatabaseConnection | null = null;

export function initializeDatabase(config?: DatabaseConfig): DatabaseConnection {
  if (!dbConnection) {
    const defaultConfig: DatabaseConfig = {
      url: process.env.DATABASE_URL || 'file:./dev.db',
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20'),
      poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '30'),
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
      retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
      logLevel: (process.env.DB_LOG_LEVEL as any) || (process.env.NODE_ENV === 'development' ? 'query' : 'error'),
      enableMonitoring: process.env.DB_ENABLE_MONITORING !== 'false'
    };

    dbConnection = DatabaseConnection.getInstance({ ...defaultConfig, ...config });
  }
  
  return dbConnection;
}

export async function getDatabase(): Promise<PrismaClient> {
  if (!dbConnection) {
    dbConnection = initializeDatabase();
  }
  
  return dbConnection.connect();
}

export function getDatabaseMonitor(): DatabaseMonitor | null {
  return dbConnection?.getMonitor() || null;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (dbConnection) {
    await dbConnection.shutdown();
    dbConnection = null;
  }
}

// Graceful shutdown on process termination
process.on('SIGINT', async () => {
  console.log('📱 Received SIGINT, shutting down database connection...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('📱 Received SIGTERM, shutting down database connection...');
  await closeDatabaseConnection();
  process.exit(0);
});

export { DatabaseConnection, type DatabaseConfig };