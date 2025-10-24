/**
 * Database Health Check and Performance Monitoring API
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/simple-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeMetrics = searchParams.get('metrics') === 'true';
    const clearCache = searchParams.get('clearCache') === 'true';

    // Get health check data
    const healthData = await db.healthCheck();

    return NextResponse.json(healthData, {
      status: healthData.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const healthData = await db.healthCheck();
    return NextResponse.json({ 
      success: true, 
      health: healthData 
    });

  } catch (error) {
    console.error('Database management action failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}