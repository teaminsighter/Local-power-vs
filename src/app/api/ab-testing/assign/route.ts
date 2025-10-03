import { NextRequest, NextResponse } from 'next/server';
import { abTestingService } from '@/services/abTestingService';

// POST /api/ab-testing/assign - Assign visitor to A/B test variant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorUserId, currentUrl, userAgent, ipAddress } = body;

    if (!visitorUserId || !currentUrl) {
      return NextResponse.json(
        { success: false, error: 'visitorUserId and currentUrl are required' },
        { status: 400 }
      );
    }

    // Get visitor assignment
    const assignment = await abTestingService.assignVisitor(visitorUserId, currentUrl);

    if (!assignment) {
      // No active test for this URL
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active A/B test for this URL'
      });
    }

    // Get landing page content for the assigned variant
    const landingPageContent = await abTestingService.getLandingPageContent(
      assignment.testId, 
      assignment.variant
    );

    return NextResponse.json({
      success: true,
      data: {
        ...assignment,
        landingPageContent,
        isNewAssignment: assignment.isNewAssignment
      }
    });

  } catch (error) {
    console.error('Error assigning visitor to A/B test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign visitor' },
      { status: 500 }
    );
  }
}

// GET /api/ab-testing/assign - Get existing assignment for visitor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorUserId = searchParams.get('visitorUserId');
    const currentUrl = searchParams.get('currentUrl');

    if (!visitorUserId || !currentUrl) {
      return NextResponse.json(
        { success: false, error: 'visitorUserId and currentUrl are required' },
        { status: 400 }
      );
    }

    // Check for existing assignment
    const assignment = await abTestingService.assignVisitor(visitorUserId, currentUrl);

    if (!assignment) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active A/B test for this URL'
      });
    }

    // Get landing page content
    const landingPageContent = await abTestingService.getLandingPageContent(
      assignment.testId, 
      assignment.variant
    );

    return NextResponse.json({
      success: true,
      data: {
        ...assignment,
        landingPageContent
      }
    });

  } catch (error) {
    console.error('Error getting visitor assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get visitor assignment' },
      { status: 500 }
    );
  }
}