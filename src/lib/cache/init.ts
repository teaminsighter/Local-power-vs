/**
 * Cache Initialization
 * Handles Redis connection and cache warming on application startup
 */

import { Cache } from './redis';
import { CacheWarmer, CacheMonitor } from './middleware';

/**
 * Initialize cache system
 */
export async function initializeCache(): Promise<void> {
  try {
    console.log('🚀 Initializing cache system...');
    
    // Connect to Redis
    await Cache.connect();
    
    // Perform health check
    const health = await CacheMonitor.healthCheck();
    console.log(`📊 Cache health: ${health.status} (${health.latency}ms)`);
    
    // Warm cache if enabled
    if (process.env.CACHE_WARM_ON_START === 'true') {
      await CacheWarmer.warmCache();
    }
    
    // Schedule periodic cache warming in production
    if (process.env.NODE_ENV === 'production') {
      setInterval(async () => {
        try {
          await CacheWarmer.warmCache();
        } catch (error) {
          console.error('Scheduled cache warming failed:', error);
        }
      }, 30 * 60 * 1000); // Every 30 minutes
    }
    
    console.log('✅ Cache system initialized successfully');
  } catch (error) {
    console.error('❌ Cache initialization failed:', error);
    // Don't throw - app should work without cache
  }
}

/**
 * Graceful cache shutdown
 */
export async function shutdownCache(): Promise<void> {
  try {
    console.log('🔌 Shutting down cache system...');
    await Cache.disconnect();
    console.log('✅ Cache system shutdown complete');
  } catch (error) {
    console.error('❌ Cache shutdown error:', error);
  }
}

/**
 * Cache health monitoring for status endpoints
 */
export async function getCacheStatus(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  redis: boolean;
  fallback: boolean;
  latency: number;
  stats: any;
}> {
  try {
    const [health, stats] = await Promise.all([
      CacheMonitor.healthCheck(),
      CacheMonitor.getStats()
    ]);
    
    return {
      ...health,
      stats
    };
  } catch (error) {
    console.error('Cache status check failed:', error);
    return {
      status: 'unhealthy',
      redis: false,
      fallback: false,
      latency: 0,
      stats: null
    };
  }
}

// Setup graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await shutdownCache();
  });
  
  process.on('SIGTERM', async () => {
    await shutdownCache();
  });
}