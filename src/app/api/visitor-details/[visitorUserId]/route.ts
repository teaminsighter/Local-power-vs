import { NextRequest, NextResponse } from 'next/server';
import { visitorTrackingService } from '@/services/visitorTrackingService';

export async function GET(
  request: NextRequest,
  { params }: { params: { visitorUserId: string } }
) {
  try {
    const { visitorUserId } = params;

    if (!visitorUserId) {
      return NextResponse.json(
        { error: 'Visitor user ID is required' },
        { status: 400 }
      );
    }

    // Get visitor profile
    const profile = await visitorTrackingService.getVisitorProfile(visitorUserId);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Visitor profile not found' },
        { status: 404 }
      );
    }

    // Get visitor sessions
    const sessions = await visitorTrackingService.getVisitorSessions(visitorUserId, 20);

    // Get visitor journey
    const journey = await visitorTrackingService.getVisitorJourney(visitorUserId, 100);

    return NextResponse.json({
      profile,
      sessions,
      journey
    });

  } catch (error) {
    console.error('Error fetching visitor details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor details' },
      { status: 500 }
    );
  }
}