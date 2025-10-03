import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: any;
  utm_campaign: string;
  utm_source?: string;
  utm_medium?: string;
  tests: any[];
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/ab-testing/campaigns - Get all campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get campaigns with their associated A/B tests
    const whereClause = status ? { status: status.toUpperCase() as any } : {};

    const campaigns = await prisma.aBTest.findMany({
      where: {
        ...whereClause,
        // Group by UTM campaign to simulate campaign management
        NOT: {
          utmCampaign: null
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        url: true,
        startDate: true,
        endDate: true,
        visitsA: true,
        visitsB: true,
        conversionsA: true,
        conversionsB: true,
        conversionRateA: true,
        conversionRateB: true,
        createdAt: true,
        updatedAt: true,
        // Simulate UTM campaign field
        createdBy: true // We'll use this as utm_campaign for now
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Group tests by "campaign" (using createdBy as campaign identifier for now)
    const campaignGroups = campaigns.reduce((acc: Record<string, any>, test) => {
      const campaignId = test.createdBy || 'default';
      
      if (!acc[campaignId]) {
        acc[campaignId] = {
          id: campaignId,
          name: `Campaign: ${campaignId}`,
          description: `Marketing campaign for ${campaignId}`,
          status: 'ACTIVE',
          utm_campaign: campaignId,
          tests: [],
          totalVisitors: 0,
          totalConversions: 0,
          avgConversionRate: 0,
          createdAt: test.createdAt,
          updatedAt: test.updatedAt
        };
      }

      acc[campaignId].tests.push(test);
      acc[campaignId].totalVisitors += test.visitsA + test.visitsB;
      acc[campaignId].totalConversions += test.conversionsA + test.conversionsB;
      
      return acc;
    }, {});

    // Calculate average conversion rates
    Object.values(campaignGroups).forEach((campaign: any) => {
      campaign.avgConversionRate = campaign.totalVisitors > 0 
        ? (campaign.totalConversions / campaign.totalVisitors) * 100 
        : 0;
    });

    const campaignList = Object.values(campaignGroups);

    return NextResponse.json({
      success: true,
      data: campaignList,
      pagination: {
        total: campaignList.length,
        limit,
        offset,
        hasNext: false // Simple implementation
      }
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/ab-testing/campaigns - Create new campaign with A/B tests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      budget,
      targetAudience,
      utm_campaign,
      utm_source = 'website',
      utm_medium = 'organic',
      tests = [],
      startImmediately = false
    } = body;

    if (!name || !utm_campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign name and UTM campaign are required' },
        { status: 400 }
      );
    }

    // Create multiple A/B tests for this campaign
    const createdTests = [];

    for (const testConfig of tests) {
      const {
        name: testName,
        description: testDescription,
        url,
        urlMatchType = 'EXACT',
        assignmentType = 'FIFTY_FIFTY',
        customSplitA = 50,
        customSplitB = 50,
        templateAId,
        templateBId,
        landingPageA,
        landingPageB,
        minimumSampleSize = 100,
        confidenceLevel = 95
      } = testConfig;

      // Check for URL conflicts
      const existingTest = await prisma.aBTest.findFirst({
        where: {
          url,
          status: { in: ['ACTIVE', 'DRAFT'] }
        }
      });

      if (existingTest) {
        continue; // Skip this test if URL conflict exists
      }

      const test = await prisma.aBTest.create({
        data: {
          name: testName,
          description: testDescription,
          url,
          urlMatchType,
          assignmentType,
          customSplitA,
          customSplitB,
          templateAId,
          templateBId,
          landingPageA,
          landingPageB,
          minimumSampleSize,
          confidenceLevel,
          status: startImmediately ? 'ACTIVE' : 'DRAFT',
          startDate: startImmediately ? new Date() : null,
          createdBy: utm_campaign // Using this field to link to campaign
        }
      });

      createdTests.push(test);
    }

    // Create campaign tracking entry (using visitor tracking for now)
    await prisma.visitorTracking.create({
      data: {
        page: `/campaign/${utm_campaign}`,
        ipAddress: '0.0.0.0',
        userAgent: 'Campaign Manager',
        sessionId: `campaign_${utm_campaign}_${Date.now()}`,
        actions: {
          type: 'campaign_created',
          name,
          description,
          budget,
          targetAudience,
          utm_campaign,
          utm_source,
          utm_medium,
          testsCreated: createdTests.length
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        campaign: {
          id: utm_campaign,
          name,
          description,
          utm_campaign,
          utm_source,
          utm_medium,
          testsCreated: createdTests.length,
          tests: createdTests
        }
      },
      message: `Campaign created with ${createdTests.length} A/B tests`
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}