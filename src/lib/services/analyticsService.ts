import { prisma } from '@/lib/prisma';

export interface AnalyticsMetrics {
  totalLeads: number;
  leadsToday: number;
  conversionRate: number;
  totalRevenue: number;
  activeUsers: number;
  avgSessionDuration: number;
  topSources: Array<{
    name: string;
    leads: number;
    conversion: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    type: string;
    message: string;
    time: string;
    icon: string;
  }>;
  leadsGrowth: number;
  conversionGrowth: number;
  revenueGrowth: number;
}

export class AnalyticsService {
  
  async getAnalyticsMetrics(dateRange: string = '7d'): Promise<AnalyticsMetrics> {
    try {
      const now = new Date();
      const startDate = this.getStartDate(dateRange, now);
      const previousPeriodStart = this.getPreviousPeriodStart(dateRange, startDate);
      
      // Get current period metrics
      const [
        totalLeads,
        leadsToday,
        leadsThisPeriod,
        leadsPreviousPeriod,
        convertedLeads,
        convertedPreviousPeriod,
        totalRevenue,
        revenuePreviousPeriod,
        activeUsers,
        topSources,
        recentActivity
      ] = await Promise.all([
        this.getTotalLeads(),
        this.getLeadsToday(),
        this.getLeadsByPeriod(startDate, now),
        this.getLeadsByPeriod(previousPeriodStart, startDate),
        this.getConvertedLeads(startDate, now),
        this.getConvertedLeads(previousPeriodStart, startDate),
        this.getTotalRevenue(startDate, now),
        this.getTotalRevenue(previousPeriodStart, startDate),
        this.getActiveUsers(),
        this.getTopSources(startDate, now),
        this.getRecentActivity()
      ]);

      // Calculate conversion rates
      const conversionRate = leadsThisPeriod > 0 ? (convertedLeads / leadsThisPeriod) * 100 : 0;
      const previousConversionRate = leadsPreviousPeriod > 0 ? (convertedPreviousPeriod / leadsPreviousPeriod) * 100 : 0;

      // Calculate growth percentages
      const leadsGrowth = this.calculateGrowth(leadsThisPeriod, leadsPreviousPeriod);
      const conversionGrowth = this.calculateGrowth(conversionRate, previousConversionRate);
      const revenueGrowth = this.calculateGrowth(totalRevenue, revenuePreviousPeriod);

      return {
        totalLeads,
        leadsToday,
        conversionRate: Number(conversionRate.toFixed(1)),
        totalRevenue,
        activeUsers,
        avgSessionDuration: await this.getAvgSessionDuration(),
        topSources,
        recentActivity,
        leadsGrowth,
        conversionGrowth,
        revenueGrowth
      };
      
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  private async getTotalLeads(): Promise<number> {
    return await prisma.lead.count();
  }

  private async getLeadsToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.lead.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });
  }

  private async getLeadsByPeriod(startDate: Date, endDate: Date): Promise<number> {
    return await prisma.lead.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      }
    });
  }

  private async getConvertedLeads(startDate: Date, endDate: Date): Promise<number> {
    return await prisma.lead.count({
      where: {
        status: 'CONVERTED',
        updatedAt: {
          gte: startDate,
          lt: endDate
        }
      }
    });
  }

  private async getTotalRevenue(startDate: Date, endDate: Date): Promise<number> {
    const convertedLeads = await prisma.lead.findMany({
      where: {
        status: 'CONVERTED',
        updatedAt: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        systemDetails: true
      }
    });

    return convertedLeads.reduce((total, lead) => {
      return total + (lead.systemDetails?.estimatedCost || 0);
    }, 0);
  }

  private async getActiveUsers(): Promise<number> {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const uniqueUsers = await prisma.visitorTracking.findMany({
      where: {
        timestamp: {
          gte: last24Hours
        },
        isBot: false
      },
      select: {
        sessionId: true
      },
      distinct: ['sessionId']
    });

    return uniqueUsers.length;
  }

  private async getAvgSessionDuration(): Promise<number> {
    // Calculate average session duration in seconds
    const sessions = await prisma.visitorTracking.groupBy({
      by: ['sessionId'],
      _min: {
        timestamp: true
      },
      _max: {
        timestamp: true
      },
      where: {
        sessionId: {
          not: null
        },
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((total, session) => {
      if (session._min.timestamp && session._max.timestamp) {
        const duration = session._max.timestamp.getTime() - session._min.timestamp.getTime();
        return total + duration;
      }
      return total;
    }, 0);

    return Math.floor(totalDuration / sessions.length / 1000); // Convert to seconds
  }

  private async getTopSources(startDate: Date, endDate: Date): Promise<Array<{name: string; leads: number; conversion: number; revenue: number}>> {
    const leadsBySource = await prisma.lead.groupBy({
      by: ['source'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    const sources = await Promise.all(
      leadsBySource.map(async (sourceData) => {
        const convertedCount = await prisma.lead.count({
          where: {
            source: sourceData.source,
            status: 'CONVERTED',
            createdAt: {
              gte: startDate,
              lt: endDate
            }
          }
        });

        const convertedLeads = await prisma.lead.findMany({
          where: {
            source: sourceData.source,
            status: 'CONVERTED',
            createdAt: {
              gte: startDate,
              lt: endDate
            }
          },
          include: {
            systemDetails: true
          }
        });

        const revenue = convertedLeads.reduce((total, lead) => {
          return total + (lead.systemDetails?.estimatedCost || 0);
        }, 0);

        const conversionRate = sourceData._count.id > 0 ? (convertedCount / sourceData._count.id) * 100 : 0;

        return {
          name: this.formatSourceName(sourceData.source),
          leads: sourceData._count.id,
          conversion: Number(conversionRate.toFixed(1)),
          revenue: Math.round(revenue)
        };
      })
    );

    return sources;
  }

  private async getRecentActivity(): Promise<Array<{type: string; message: string; time: string; icon: string}>> {
    const recentLeads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 3,
      include: {
        systemDetails: true
      }
    });

    const recentConversions = await prisma.lead.findMany({
      where: {
        status: 'CONVERTED'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 2
    });

    const activities = [];

    // Add recent leads
    recentLeads.forEach(lead => {
      activities.push({
        type: 'lead',
        message: `New lead: ${lead.firstName} ${lead.lastName} from ${lead.systemDetails?.address.split(',').pop()?.trim() || 'Unknown location'}`,
        time: this.formatTimeAgo(lead.createdAt),
        icon: '👤'
      });
    });

    // Add recent conversions
    recentConversions.forEach(lead => {
      activities.push({
        type: 'conversion',
        message: `${lead.firstName} ${lead.lastName} converted to customer`,
        time: this.formatTimeAgo(lead.updatedAt),
        icon: '💰'
      });
    });

    // Sort by most recent
    return activities.sort((a, b) => {
      const timeA = this.parseTimeAgo(a.time);
      const timeB = this.parseTimeAgo(b.time);
      return timeA - timeB;
    }).slice(0, 5);
  }

  private getStartDate(dateRange: string, now: Date): Date {
    const date = new Date(now);
    switch (dateRange) {
      case '1d':
        date.setDate(date.getDate() - 1);
        break;
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
      default:
        date.setDate(date.getDate() - 7);
    }
    return date;
  }

  private getPreviousPeriodStart(dateRange: string, startDate: Date): Date {
    const period = new Date(startDate);
    switch (dateRange) {
      case '1d':
        period.setDate(period.getDate() - 1);
        break;
      case '7d':
        period.setDate(period.getDate() - 7);
        break;
      case '30d':
        period.setDate(period.getDate() - 30);
        break;
      case '90d':
        period.setDate(period.getDate() - 90);
        break;
      default:
        period.setDate(period.getDate() - 7);
    }
    return period;
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  }

  private formatSourceName(source: string): string {
    const sourceMap: { [key: string]: string } = {
      'website': 'Direct Website',
      'google-ads': 'Google Ads',
      'facebook-ads': 'Facebook Ads',
      'organic': 'Organic Search',
      'referral': 'Referral',
      'email': 'Email Campaign',
      'social': 'Social Media'
    };
    return sourceMap[source] || source.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  }

  private parseTimeAgo(timeString: string): number {
    const match = timeString.match(/(\d+)\s+(mins?|hours?|days?)/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    if (unit.startsWith('min')) return value;
    if (unit.startsWith('hour')) return value * 60;
    if (unit.startsWith('day')) return value * 60 * 24;
    
    return 0;
  }
}

export const analyticsService = new AnalyticsService();