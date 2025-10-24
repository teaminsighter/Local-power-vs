/**
 * Cache Status API Route
 * Provides cache health and statistics for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCacheStatus } from '@/lib/cache/init';
import { CacheMonitor } from '@/lib/cache/middleware';

export async function GET(request: NextRequest) {
  try {
    const status = await getCacheStatus();
    
    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache status API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get cache status',
      data: {
        status: 'unhealthy',
        redis: false,
        fallback: false,
        latency: 0,
        stats: null
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;
    
    switch (action) {
      case 'health_check':
        const health = await CacheMonitor.healthCheck();
        return NextResponse.json({
          success: true,
          data: health
        });
        
      case 'get_stats':
        const stats = await CacheMonitor.getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Cache status POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}