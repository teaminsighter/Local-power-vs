import { NextRequest, NextResponse } from 'next/server';
import { abTestingService } from '@/services/abTestingService';

// POST /api/ab-testing/convert - Record conversion for A/B test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      visitorUserId, 
      testId, 
      conversionValue, 
      conversionType = 'lead',
      metadata = {} 
    } = body;

    if (!visitorUserId || !testId) {
      return NextResponse.json(
        { success: false, error: 'visitorUserId and testId are required' },
        { status: 400 }
      );
    }

    // Record the conversion
    await abTestingService.recordConversion({
      visitorUserId,
      testId,
      conversionValue,
      conversionType,
      metadata
    });

    // Get updated test metrics
    const metrics = await abTestingService.getTestMetrics(testId);

    return NextResponse.json({
      success: true,
      data: {
        conversionRecorded: true,
        testMetrics: metrics
      },
      message: 'Conversion recorded successfully'
    });

  } catch (error) {
    console.error('Error recording conversion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record conversion' },
      { status: 500 }
    );
  }
}

// GET /api/ab-testing/convert - Get conversion data for a test
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const timeRange = searchParams.get('timeRange') || '7d';

    if (!testId) {
      return NextResponse.json(
        { success: false, error: 'testId is required' },
        { status: 400 }
      );
    }

    // Calculate time range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get conversion data
    const conversionData = await getConversionAnalytics(testId, startDate, now);

    return NextResponse.json({
      success: true,
      data: conversionData
    });

  } catch (error) {
    console.error('Error getting conversion data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get conversion data' },
      { status: 500 }
    );
  }
}

// Helper function to get conversion analytics
async function getConversionAnalytics(testId: string, startDate: Date, endDate: Date) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Get all assignments within date range
    const assignments = await prisma.aBTestAssignment.findMany({
      where: {
        testId,
        assignedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        variant: true,
        converted: true,
        conversionValue: true,
        assignedAt: true,
        conversionAt: true,
        timeOnPage: true
      }
    });

    // Calculate metrics by variant
    const variantA = assignments.filter(a => a.variant === 'A');
    const variantB = assignments.filter(a => a.variant === 'B');

    const variantAConverted = variantA.filter(a => a.converted);
    const variantBConverted = variantB.filter(a => a.converted);

    // Daily breakdown
    const dailyData: Record<string, {
      date: string,
      visitorsA: number,
      visitorsB: number,
      conversionsA: number,
      conversionsB: number,
      revenueA: number,
      revenueB: number
    }> = {};

    assignments.forEach(assignment => {
      const date = assignment.assignedAt.toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          visitorsA: 0,
          visitorsB: 0,
          conversionsA: 0,
          conversionsB: 0,
          revenueA: 0,
          revenueB: 0
        };
      }

      if (assignment.variant === 'A') {
        dailyData[date].visitorsA++;
        if (assignment.converted) {
          dailyData[date].conversionsA++;
          dailyData[date].revenueA += assignment.conversionValue || 0;
        }
      } else {
        dailyData[date].visitorsB++;
        if (assignment.converted) {
          dailyData[date].conversionsB++;
          dailyData[date].revenueB += assignment.conversionValue || 0;
        }
      }
    });

    // Calculate conversion funnels
    const conversionFunnel = await getConversionFunnel(testId, startDate, endDate);

    return {
      summary: {
        variantA: {
          visitors: variantA.length,
          conversions: variantAConverted.length,
          conversionRate: variantA.length > 0 ? (variantAConverted.length / variantA.length) * 100 : 0,
          revenue: variantAConverted.reduce((sum, a) => sum + (a.conversionValue || 0), 0),
          avgTimeOnPage: variantA.reduce((sum, a) => sum + (a.timeOnPage || 0), 0) / variantA.length
        },
        variantB: {
          visitors: variantB.length,
          conversions: variantBConverted.length,
          conversionRate: variantB.length > 0 ? (variantBConverted.length / variantB.length) * 100 : 0,
          revenue: variantBConverted.reduce((sum, a) => sum + (a.conversionValue || 0), 0),
          avgTimeOnPage: variantB.reduce((sum, a) => sum + (a.timeOnPage || 0), 0) / variantB.length
        }
      },
      dailyBreakdown: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)),
      conversionFunnel,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    };

  } finally {
    await prisma.$disconnect();
  }
}

// Helper function for conversion funnel analysis
async function getConversionFunnel(testId: string, startDate: Date, endDate: Date) {
  // This would integrate with visitor tracking to show:
  // 1. Page Views
  // 2. Form Started
  // 3. Form Completed
  // 4. Lead Converted
  
  return {
    variantA: {
      pageViews: 1000,
      formStarted: 300,
      formCompleted: 150,
      leadConverted: 75
    },
    variantB: {
      pageViews: 950,
      formStarted: 320,
      formCompleted: 180,
      leadConverted: 95
    }
  };
}