import { NextRequest, NextResponse } from 'next/server';
import { visitorTrackingService } from '@/services/visitorTrackingService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'all';
    const isFrequentVisitor = searchParams.get('frequent') === 'true' ? true : 
                              searchParams.get('frequent') === 'false' ? false : undefined;
    const minLeadScore = searchParams.get('minLeadScore') ? parseInt(searchParams.get('minLeadScore')!) : undefined;
    const search = searchParams.get('search');

    // Build filters
    const filters: any = {};
    if (status !== 'all') filters.status = status.toUpperCase();
    if (isFrequentVisitor !== undefined) filters.isFrequentVisitor = isFrequentVisitor;
    if (minLeadScore) filters.minLeadScore = minLeadScore;

    // Get visitor profiles
    const result = await visitorTrackingService.getAllVisitorProfiles(page, limit, filters);

    // Apply search filter if provided
    let filteredVisitors = result.visitors;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredVisitors = result.visitors.filter(visitor => 
        visitor.visitorUserId.toLowerCase().includes(searchLower) ||
        (visitor.email && visitor.email.toLowerCase().includes(searchLower)) ||
        (visitor.firstName && visitor.firstName.toLowerCase().includes(searchLower)) ||
        (visitor.lastName && visitor.lastName.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      visitors: filteredVisitors,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error('Error fetching visitor analysis data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor analysis data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorUserId, updates } = body;

    if (!visitorUserId) {
      return NextResponse.json(
        { error: 'Visitor user ID is required' },
        { status: 400 }
      );
    }

    const updatedProfile = await visitorTrackingService.updateVisitorProfile(visitorUserId, updates);

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Visitor profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error updating visitor profile:', error);
    return NextResponse.json(
      { error: 'Failed to update visitor profile' },
      { status: 500 }
    );
  }
}