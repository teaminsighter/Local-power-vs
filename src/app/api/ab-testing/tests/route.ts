import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { abTestingService } from '@/services/abTestingService';

const prisma = new PrismaClient();

// GET /api/ab-testing/tests - Get all A/B tests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause = status ? { status: status.toUpperCase() as any } : {};

    const [tests, total] = await Promise.all([
      prisma.aBTest.findMany({
        where: whereClause,
        include: {
          templateA: true,
          templateB: true,
          assignments: {
            select: {
              variant: true,
              converted: true,
              assignedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.aBTest.count({ where: whereClause })
    ]);

    // Calculate real-time metrics for each test
    const testsWithMetrics = await Promise.all(
      tests.map(async (test) => {
        const metrics = await abTestingService.getTestMetrics(test.id);
        return {
          ...test,
          metrics,
          totalAssignments: test.assignments.length,
          activeAssignments: test.assignments.filter(a => !a.converted).length
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: testsWithMetrics,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching A/B tests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch A/B tests' },
      { status: 500 }
    );
  }
}

// POST /api/ab-testing/tests - Create new A/B test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
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
      confidenceLevel = 95,
      createdBy = 'admin',
      startImmediately = false
    } = body;

    // Validation
    if (!name || !url) {
      return NextResponse.json(
        { success: false, error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    // Check for URL conflicts with existing active tests
    const existingTest = await prisma.aBTest.findFirst({
      where: {
        url,
        status: { in: ['ACTIVE', 'DRAFT'] }
      }
    });

    if (existingTest) {
      return NextResponse.json(
        { success: false, error: 'An active test already exists for this URL' },
        { status: 409 }
      );
    }

    // Create the test
    const testId = await abTestingService.createTest({
      name,
      description,
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
      createdBy
    });

    // Start immediately if requested
    if (startImmediately) {
      await abTestingService.startTest(testId);
    }

    const createdTest = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: {
        templateA: true,
        templateB: true
      }
    });

    return NextResponse.json({
      success: true,
      data: createdTest,
      message: `A/B test created successfully${startImmediately ? ' and started' : ''}`
    });

  } catch (error) {
    console.error('Error creating A/B test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create A/B test' },
      { status: 500 }
    );
  }
}