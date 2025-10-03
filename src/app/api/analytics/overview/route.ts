import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analyticsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '7d';
    
    const metrics = await analyticsService.getAnalyticsMetrics(dateRange);
    
    return NextResponse.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}