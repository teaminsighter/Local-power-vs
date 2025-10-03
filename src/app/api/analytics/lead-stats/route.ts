import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get lead counts by status
    const statusCounts = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Get total leads
    const totalLeads = await prisma.lead.count();

    // Get leads created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLeads = await prisma.lead.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get conversion rate (converted / total contacted)
    const convertedCount = await prisma.lead.count({
      where: { status: 'CONVERTED' }
    });

    const contactedCount = await prisma.lead.count({
      where: {
        status: {
          in: ['CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED']
        }
      }
    });

    const conversionRate = contactedCount > 0 ? (convertedCount / contactedCount) * 100 : 0;

    // Get average system size and cost for converted leads
    const convertedLeadsWithSystem = await prisma.lead.findMany({
      where: { status: 'CONVERTED' },
      include: { systemDetails: true }
    });

    let avgSystemSize = 0;
    let avgEstimatedCost = 0;
    let totalRevenue = 0;

    if (convertedLeadsWithSystem.length > 0) {
      const systemSizes = convertedLeadsWithSystem
        .filter(lead => lead.systemDetails)
        .map(lead => lead.systemDetails!.systemSize);
      
      const estimatedCosts = convertedLeadsWithSystem
        .filter(lead => lead.systemDetails)
        .map(lead => lead.systemDetails!.estimatedCost);

      avgSystemSize = systemSizes.reduce((sum, size) => sum + size, 0) / systemSizes.length;
      avgEstimatedCost = estimatedCosts.reduce((sum, cost) => sum + cost, 0) / estimatedCosts.length;
      totalRevenue = estimatedCosts.reduce((sum, cost) => sum + cost, 0);
    }

    // Get top sources
    const sourceCounts = await prisma.lead.groupBy({
      by: ['source'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // Format status counts for easier consumption
    const statusStats = statusCounts.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      totalLeads,
      recentLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalRevenue: Math.round(totalRevenue),
      avgSystemSize: Math.round(avgSystemSize * 100) / 100,
      avgDealValue: Math.round(avgEstimatedCost),
      statusBreakdown: statusStats,
      topSources: sourceCounts.map(item => ({
        source: item.source,
        count: item._count.id
      })),
      pipeline: {
        new: statusStats.new || 0,
        contacted: statusStats.contacted || 0,
        qualified: statusStats.qualified || 0,
        proposal_sent: statusStats.proposal_sent || 0,
        converted: statusStats.converted || 0,
        not_interested: statusStats.not_interested || 0
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Lead Stats API Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch lead statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}