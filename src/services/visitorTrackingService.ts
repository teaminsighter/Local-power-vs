import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface VisitorProfile {
  id: string;
  visitorUserId: string;
  fingerprint?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  firstVisit: Date;
  lastVisit: Date;
  totalVisits: number;
  totalSessionTime: number;
  totalPagesViewed: number;
  conversionScore: number;
  isFrequentVisitor: boolean;
  leadScore: number;
  tags?: string;
  notes?: string;
  status: 'ANONYMOUS' | 'IDENTIFIED' | 'LEAD' | 'CUSTOMER';
}

export interface VisitorSession {
  id: string;
  visitorUserId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pagesVisited: any[];
  actionsPerformed: any[];
  entryPage: string;
  exitPage?: string;
  referrer?: string;
  deviceInfo: any;
  conversionEvents?: any[];
  dropOffPoint?: string;
}

export interface VisitorTrackingData {
  visitorUserId: string;
  ipAddress: string;
  country?: string;
  city?: string;
  region?: string;
  userAgent?: string;
  page: string;
  referrer?: string;
  sessionId?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  stayTime?: number;
  exitPage?: string;
  actions?: any;
  scrollDepth?: number;
  leadId?: string;
}

export class VisitorTrackingService {
  
  /**
   * Generate a unique visitor user ID
   */
  generateVisitorUserId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `visitor_${timestamp}_${randomStr}`;
  }

  /**
   * Generate browser fingerprint for visitor identification
   */
  generateFingerprint(userAgent: string, acceptLanguage?: string, timezone?: string): string {
    const components = [
      userAgent,
      acceptLanguage || 'unknown',
      timezone || 'unknown',
      // Add more fingerprinting components as needed
    ];
    
    // Simple hash function for fingerprinting
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get or create visitor profile
   */
  async getOrCreateVisitorProfile(
    visitorUserId: string, 
    fingerprint: string,
    initialData?: Partial<VisitorProfile>
  ): Promise<VisitorProfile> {
    try {
      // Try to find existing visitor by fingerprint first
      let visitor = await prisma.visitorProfile.findUnique({
        where: { fingerprint }
      });

      if (visitor) {
        // Update last visit and visit count
        visitor = await prisma.visitorProfile.update({
          where: { id: visitor.id },
          data: {
            lastVisit: new Date(),
            totalVisits: { increment: 1 },
            isFrequentVisitor: visitor.totalVisits >= 2 // Mark as frequent after 3+ visits
          }
        });
        return visitor as VisitorProfile;
      }

      // Create new visitor profile
      const now = new Date();
      visitor = await prisma.visitorProfile.create({
        data: {
          visitorUserId,
          fingerprint,
          firstVisit: now,
          lastVisit: now,
          totalVisits: 1,
          totalSessionTime: 0,
          totalPagesViewed: 0,
          conversionScore: 0,
          isFrequentVisitor: false,
          leadScore: 10, // Initial lead score
          status: 'ANONYMOUS',
          ...initialData
        }
      });

      return visitor as VisitorProfile;
    } catch (error) {
      console.error('Error creating/updating visitor profile:', error);
      throw error;
    }
  }

  /**
   * Track visitor activity
   */
  async trackVisitor(data: VisitorTrackingData): Promise<{ trackingId: string; visitorProfile: VisitorProfile }> {
    try {
      const fingerprint = this.generateFingerprint(data.userAgent || '');
      
      // Get or create visitor profile
      const visitorProfile = await this.getOrCreateVisitorProfile(data.visitorUserId, fingerprint);

      // Create tracking record
      const tracking = await prisma.visitorTracking.create({
        data: {
          visitorUserId: data.visitorUserId,
          ipAddress: data.ipAddress,
          country: data.country,
          city: data.city,
          region: data.region,
          userAgent: data.userAgent,
          page: data.page,
          referrer: data.referrer,
          sessionId: data.sessionId,
          deviceType: data.deviceType,
          browser: data.browser,
          os: data.os,
          stayTime: data.stayTime,
          exitPage: data.exitPage,
          actions: data.actions,
          scrollDepth: data.scrollDepth,
          leadId: data.leadId,
          isBot: false
        }
      });

      // Update visitor profile stats
      await this.updateVisitorStats(data.visitorUserId, data.page, data.stayTime);

      return {
        trackingId: tracking.id,
        visitorProfile
      };
    } catch (error) {
      console.error('Error tracking visitor:', error);
      throw error;
    }
  }

  /**
   * Update visitor statistics
   */
  private async updateVisitorStats(visitorUserId: string, page: string, stayTime?: number): Promise<void> {
    try {
      const updates: any = {
        totalPagesViewed: { increment: 1 },
        lastVisit: new Date()
      };

      if (stayTime && stayTime > 0) {
        updates.totalSessionTime = { increment: stayTime };
      }

      await prisma.visitorProfile.update({
        where: { visitorUserId },
        data: updates
      });
    } catch (error) {
      console.error('Error updating visitor stats:', error);
    }
  }

  /**
   * Start visitor session
   */
  async startSession(
    visitorUserId: string,
    sessionId: string,
    entryPage: string,
    referrer?: string,
    deviceInfo?: any
  ): Promise<VisitorSession> {
    try {
      const session = await prisma.visitorSession.create({
        data: {
          visitorUserId,
          sessionId,
          startTime: new Date(),
          pagesVisited: [{ page: entryPage, timestamp: new Date(), timeSpent: 0 }],
          actionsPerformed: [],
          entryPage,
          referrer,
          deviceInfo: deviceInfo || {}
        }
      });

      return session as VisitorSession;
    } catch (error) {
      console.error('Error starting visitor session:', error);
      throw error;
    }
  }

  /**
   * End visitor session
   */
  async endSession(sessionId: string, exitPage?: string, dropOffPoint?: string): Promise<void> {
    try {
      const session = await prisma.visitorSession.findFirst({
        where: { sessionId }
      });

      if (session) {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

        await prisma.visitorSession.update({
          where: { id: session.id },
          data: {
            endTime,
            duration,
            exitPage,
            dropOffPoint
          }
        });

        // Update visitor profile with session duration
        await prisma.visitorProfile.update({
          where: { visitorUserId: session.visitorUserId },
          data: {
            totalSessionTime: { increment: duration }
          }
        });
      }
    } catch (error) {
      console.error('Error ending visitor session:', error);
    }
  }

  /**
   * Get visitor profile by visitor user ID
   */
  async getVisitorProfile(visitorUserId: string): Promise<VisitorProfile | null> {
    try {
      const visitor = await prisma.visitorProfile.findUnique({
        where: { visitorUserId }
      });
      return visitor as VisitorProfile | null;
    } catch (error) {
      console.error('Error getting visitor profile:', error);
      return null;
    }
  }

  /**
   * Get visitor sessions
   */
  async getVisitorSessions(visitorUserId: string, limit: number = 10): Promise<VisitorSession[]> {
    try {
      const sessions = await prisma.visitorSession.findMany({
        where: { visitorUserId },
        orderBy: { startTime: 'desc' },
        take: limit
      });
      return sessions as VisitorSession[];
    } catch (error) {
      console.error('Error getting visitor sessions:', error);
      return [];
    }
  }

  /**
   * Get visitor journey (all tracking records)
   */
  async getVisitorJourney(visitorUserId: string, limit: number = 50): Promise<any[]> {
    try {
      const journey = await prisma.visitorTracking.findMany({
        where: { visitorUserId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });
      return journey;
    } catch (error) {
      console.error('Error getting visitor journey:', error);
      return [];
    }
  }

  /**
   * Update visitor profile information
   */
  async updateVisitorProfile(
    visitorUserId: string, 
    updates: Partial<VisitorProfile>
  ): Promise<VisitorProfile | null> {
    try {
      const visitor = await prisma.visitorProfile.update({
        where: { visitorUserId },
        data: updates
      });
      return visitor as VisitorProfile;
    } catch (error) {
      console.error('Error updating visitor profile:', error);
      return null;
    }
  }

  /**
   * Get all visitor profiles with pagination
   */
  async getAllVisitorProfiles(
    page: number = 1, 
    limit: number = 50,
    filters?: {
      status?: string;
      isFrequentVisitor?: boolean;
      minLeadScore?: number;
    }
  ): Promise<{ visitors: VisitorProfile[]; total: number; totalPages: number }> {
    try {
      const where: any = {};
      
      if (filters?.status) where.status = filters.status;
      if (filters?.isFrequentVisitor !== undefined) where.isFrequentVisitor = filters.isFrequentVisitor;
      if (filters?.minLeadScore) where.leadScore = { gte: filters.minLeadScore };

      const [visitors, total] = await Promise.all([
        prisma.visitorProfile.findMany({
          where,
          orderBy: { lastVisit: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.visitorProfile.count({ where })
      ]);

      return {
        visitors: visitors as VisitorProfile[],
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting visitor profiles:', error);
      return { visitors: [], total: 0, totalPages: 0 };
    }
  }
}

export const visitorTrackingService = new VisitorTrackingService();