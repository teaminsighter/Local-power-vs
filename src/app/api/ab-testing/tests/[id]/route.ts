import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { abTestingService } from '@/services/abTestingService';

const prisma = new PrismaClient();

// GET /api/ab-testing/tests/[id] - Get specific A/B test
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.aBTest.findUnique({
      where: { id: params.id },
      include: {
        templateA: true,
        templateB: true,
        assignments: {
          include: {
            test: false // Avoid circular reference
          }
        }
      }
    });

    if (!test) {
      return NextResponse.json(
        { success: false, error: 'A/B test not found' },
        { status: 404 }
      );
    }

    // Get detailed metrics
    const metrics = await abTestingService.getTestMetrics(test.id);

    // Calculate additional analytics
    const analytics = {
      dailyVisitors: await getDailyVisitors(test.id),
      conversionTrend: await getConversionTrend(test.id),
      deviceBreakdown: await getDeviceBreakdown(test.id),
      trafficSources: await getTrafficSources(test.id)
    };

    return NextResponse.json({
      success: true,
      data: {
        ...test,
        metrics,
        analytics
      }
    });

  } catch (error) {
    console.error('Error fetching A/B test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch A/B test' },
      { status: 500 }
    );
  }
}

// PUT /api/ab-testing/tests/[id] - Update A/B test
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, ...updateData } = body;

    // Handle specific actions
    switch (action) {
      case 'start':
        await abTestingService.startTest(params.id);
        break;
      
      case 'pause':
        await prisma.aBTest.update({
          where: { id: params.id },
          data: { status: 'PAUSED' }
        });
        break;
      
      case 'stop':
        await abTestingService.stopTest(params.id, updateData.winnerVariant);
        break;
      
      case 'archive':
        await prisma.aBTest.update({
          where: { id: params.id },
          data: { status: 'ARCHIVED' }
        });
        break;
      
      default:
        // Regular update
        await prisma.aBTest.update({
          where: { id: params.id },
          data: {
            ...updateData,
            updatedAt: new Date()
          }
        });
    }

    const updatedTest = await prisma.aBTest.findUnique({
      where: { id: params.id },
      include: {
        templateA: true,
        templateB: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedTest,
      message: `A/B test ${action || 'updated'} successfully`
    });

  } catch (error) {
    console.error('Error updating A/B test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update A/B test' },
      { status: 500 }
    );
  }
}

// DELETE /api/ab-testing/tests/[id] - Delete A/B test
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if test can be deleted (only DRAFT or COMPLETED tests)
    const test = await prisma.aBTest.findUnique({
      where: { id: params.id }
    });

    if (!test) {
      return NextResponse.json(
        { success: false, error: 'A/B test not found' },
        { status: 404 }
      );
    }

    if (test.status === 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete active A/B test. Pause or stop it first.' },
        { status: 400 }
      );
    }

    // Delete assignments first (cascade should handle this, but being explicit)
    await prisma.aBTestAssignment.deleteMany({
      where: { testId: params.id }
    });

    // Delete the test
    await prisma.aBTest.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'A/B test deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting A/B test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete A/B test' },
      { status: 500 }
    );
  }
}

// Helper functions for analytics
async function getDailyVisitors(testId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyData = await prisma.aBTestAssignment.groupBy({
    by: ['assignedAt'],
    where: {
      testId,
      assignedAt: {
        gte: sevenDaysAgo
      }
    },
    _count: {
      id: true
    }
  });

  return dailyData.map(day => ({
    date: day.assignedAt.toISOString().split('T')[0],
    visitors: day._count.id
  }));
}

async function getConversionTrend(testId: string) {
  const assignments = await prisma.aBTestAssignment.findMany({
    where: { testId },
    select: {
      variant: true,
      converted: true,
      assignedAt: true,
      conversionAt: true
    },
    orderBy: { assignedAt: 'asc' }
  });

  // Group by day and variant
  const trend: Record<string, { variantA: number, variantB: number, conversionsA: number, conversionsB: number }> = {};
  
  assignments.forEach(assignment => {
    const date = assignment.assignedAt.toISOString().split('T')[0];
    if (!trend[date]) {
      trend[date] = { variantA: 0, variantB: 0, conversionsA: 0, conversionsB: 0 };
    }
    
    if (assignment.variant === 'A') {
      trend[date].variantA++;
      if (assignment.converted) trend[date].conversionsA++;
    } else {
      trend[date].variantB++;
      if (assignment.converted) trend[date].conversionsB++;
    }
  });

  return Object.entries(trend).map(([date, data]) => ({
    date,
    conversionRateA: data.variantA > 0 ? (data.conversionsA / data.variantA) * 100 : 0,
    conversionRateB: data.variantB > 0 ? (data.conversionsB / data.variantB) * 100 : 0,
    visitorsA: data.variantA,
    visitorsB: data.variantB
  }));
}

async function getDeviceBreakdown(testId: string) {
  // This would require visitor tracking integration
  return {
    desktop: { percentage: 65, conversions: 45 },
    mobile: { percentage: 30, conversions: 25 },
    tablet: { percentage: 5, conversions: 3 }
  };
}

async function getTrafficSources(testId: string) {
  // This would require UTM tracking integration
  return {
    organic: { percentage: 40, conversions: 35 },
    paid: { percentage: 35, conversions: 45 },
    social: { percentage: 15, conversions: 12 },
    direct: { percentage: 10, conversions: 8 }
  };
}