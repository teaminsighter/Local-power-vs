/**
 * Simple Database Service
 * Basic database operations without complex optimizations
 */

import { PrismaClient } from '@prisma/client';

// Simple singleton pattern for database connection
class SimpleDatabaseService {
  private static instance: SimpleDatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
  }

  static getInstance(): SimpleDatabaseService {
    if (!this.instance) {
      this.instance = new SimpleDatabaseService();
    }
    return this.instance;
  }

  /**
   * Lead Operations
   */
  async getLeads(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    return this.prisma.lead.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        calculatorData: true,
        consultationData: true,
        visitorData: true
      }
    });
  }

  async getLeadById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        calculatorData: true,
        consultationData: true,
        visitorData: true
      }
    });
  }

  async createLead(data: any) {
    try {
      return await this.prisma.lead.create({
        data,
        include: {
          calculatorData: true,
          consultationData: true
        }
      });
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }

  async updateLead(id: string, data: any) {
    try {
      return await this.prisma.lead.update({
        where: { id },
        data,
        include: {
          calculatorData: true,
          consultationData: true
        }
      });
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  }

  /**
   * Analytics Operations
   */
  async getAnalyticsOverview() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      const [totalLeads, recentLeads, totalVisitors] = await Promise.all([
        this.prisma.lead.count(),
        this.prisma.lead.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        }),
        this.prisma.visitorTracking.count({
          where: {
            timestamp: {
              gte: thirtyDaysAgo
            }
          }
        })
      ]);

      return {
        totalLeads,
        recentLeads,
        totalVisitors,
        conversionRate: totalVisitors > 0 ? (recentLeads / totalVisitors * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Analytics overview error:', error);
      return {
        totalLeads: 0,
        recentLeads: 0,
        totalVisitors: 0,
        conversionRate: 0
      };
    }
  }

  /**
   * Visitor Tracking
   */
  async trackVisitor(visitorData: any) {
    try {
      return await this.prisma.visitorTracking.upsert({
        where: { 
          visitorUserId: visitorData.visitorUserId 
        },
        update: {
          lastSeen: new Date(),
          sessionDuration: visitorData.sessionDuration,
          pageViews: { increment: 1 }
        },
        create: visitorData
      });
    } catch (error) {
      console.error('Failed to track visitor:', error);
      throw error;
    }
  }

  /**
   * Settings Operations
   */
  async getSettings(category?: string) {
    return this.prisma.settings.findMany({
      where: category ? { category } : undefined,
      orderBy: { key: 'asc' }
    });
  }

  async updateSetting(key: string, value: any, category?: string) {
    try {
      return await this.prisma.settings.upsert({
        where: { key },
        update: { value, category },
        create: { key, value, category }
      });
    } catch (error) {
      console.error('Failed to update setting:', error);
      throw error;
    }
  }

  /**
   * Database Health Check
   */
  async healthCheck() {
    try {
      const startTime = performance.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = performance.now() - startTime;

      return {
        status: 'healthy',
        responseTime: Math.round(responseTime),
        timestamp: new Date().toISOString(),
        database: 'connected'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      };
    }
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const db = SimpleDatabaseService.getInstance();
export { SimpleDatabaseService };
export default db;