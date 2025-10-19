import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analyticsService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '7d';
    
    // For demo purposes, return generated analytics data
    const demoMetrics = {
      totalLeads: 127,
      leadsToday: 8,
      conversionRate: 3.4,
      totalRevenue: 245680,
      activeUsers: 1247,
      avgSessionDuration: 4.2,
      topSources: [
        { name: 'Google Ads', leads: 45, conversion: 4.2, revenue: 89340 },
        { name: 'Facebook', leads: 32, conversion: 2.8, revenue: 67520 },
        { name: 'Direct', leads: 28, conversion: 5.1, revenue: 58900 },
        { name: 'Referral', leads: 22, conversion: 3.7, revenue: 29920 }
      ],
      recentActivity: [
        { type: 'lead', message: 'New lead from Dublin', time: '2 minutes ago', icon: '👤' },
        { type: 'conversion', message: 'Quote converted to sale', time: '15 minutes ago', icon: '💰' },
        { type: 'lead', message: 'New lead from Cork', time: '1 hour ago', icon: '👤' },
        { type: 'system', message: 'Solar calculator updated', time: '2 hours ago', icon: '🔧' }
      ],
      leadsGrowth: 12.5,
      conversionGrowth: 8.3,
      revenueGrowth: 15.7
    };
    
    console.log('Demo mode: Returning generated analytics metrics for dateRange:', dateRange);
    
    return NextResponse.json({
      success: true,
      data: demoMetrics,
      demoMode: true
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