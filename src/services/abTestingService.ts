/**
 * Production-Ready A/B Testing Engine
 * High-performance, scalable A/B testing system for production use
 */

import { PrismaClient } from '@prisma/client';
import { statisticsService, StatisticalResult } from './statisticsService';

const prisma = new PrismaClient();

export interface ABTestConfig {
  name: string;
  description?: string;
  url: string;
  urlMatchType: 'EXACT' | 'PATTERN' | 'REGEX';
  assignmentType: 'FIFTY_FIFTY' | 'ALTERNATING' | 'CUSTOM_SPLIT';
  customSplitA?: number;
  customSplitB?: number;
  templateAId?: string;
  templateBId?: string;
  landingPageA?: any;
  landingPageB?: any;
  minimumSampleSize?: number;
  confidenceLevel?: number;
  createdBy: string;
}

export interface VisitorAssignment {
  visitorUserId: string;
  variant: 'A' | 'B';
  testId: string;
  isNewAssignment: boolean;
}

export interface ConversionData {
  visitorUserId: string;
  testId: string;
  conversionValue?: number;
  conversionType?: string;
  metadata?: any;
}

export interface ABTestMetrics {
  testId: string;
  visitsA: number;
  visitsB: number;
  conversionsA: number;
  conversionsB: number;
  conversionRateA: number;
  conversionRateB: number;
  statisticalAnalysis: StatisticalResult;
  lastUpdated: Date;
}

export class ABTestingService {
  
  /**
   * Create a new A/B test
   */
  async createTest(config: ABTestConfig): Promise<string> {
    try {
      const test = await prisma.aBTest.create({
        data: {
          name: config.name,
          description: config.description,
          url: config.url,
          urlMatchType: config.urlMatchType,
          assignmentType: config.assignmentType,
          customSplitA: config.customSplitA || 50,
          customSplitB: config.customSplitB || 50,
          templateAId: config.templateAId,
          templateBId: config.templateBId,
          landingPageA: config.landingPageA,
          landingPageB: config.landingPageB,
          minimumSampleSize: config.minimumSampleSize || 100,
          confidenceLevel: config.confidenceLevel || 95,
          createdBy: config.createdBy,
          status: 'DRAFT'
        }
      });

      return test.id;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      throw new Error('Failed to create A/B test');
    }
  }

  /**
   * Start an A/B test
   */
  async startTest(testId: string): Promise<void> {
    try {
      await prisma.aBTest.update({
        where: { id: testId },
        data: {
          status: 'ACTIVE',
          startDate: new Date()
        }
      });
    } catch (error) {
      console.error('Error starting A/B test:', error);
      throw new Error('Failed to start A/B test');
    }
  }

  /**
   * Assign visitor to A/B test variant
   * High-performance method with caching considerations
   */
  async assignVisitor(visitorUserId: string, currentUrl: string): Promise<VisitorAssignment | null> {
    try {
      // Find active test for this URL
      const activeTest = await this.findActiveTestForUrl(currentUrl);
      if (!activeTest) {
        return null;
      }

      // Check if visitor already has assignment
      const existingAssignment = await prisma.aBTestAssignment.findUnique({
        where: {
          testId_visitorUserId: {
            testId: activeTest.id,
            visitorUserId
          }
        }
      });

      if (existingAssignment) {
        return {
          visitorUserId,
          variant: existingAssignment.variant,
          testId: activeTest.id,
          isNewAssignment: false
        };
      }

      // Create new assignment
      const variant = this.determineVariant(activeTest);
      
      await prisma.aBTestAssignment.create({
        data: {
          testId: activeTest.id,
          visitorUserId,
          variant,
          ipAddress: await this.getVisitorIP(visitorUserId),
          userAgent: await this.getVisitorUserAgent(visitorUserId)
        }
      });

      // Update visit count
      await this.incrementVisitCount(activeTest.id, variant);

      return {
        visitorUserId,
        variant,
        testId: activeTest.id,
        isNewAssignment: true
      };

    } catch (error) {
      console.error('Error assigning visitor to A/B test:', error);
      return null; // Graceful degradation
    }
  }

  /**
   * Record conversion for A/B test
   */
  async recordConversion(data: ConversionData): Promise<void> {
    try {
      // Update assignment with conversion
      await prisma.aBTestAssignment.update({
        where: {
          testId_visitorUserId: {
            testId: data.testId,
            visitorUserId: data.visitorUserId
          }
        },
        data: {
          converted: true,
          conversionAt: new Date(),
          conversionValue: data.conversionValue
        }
      });

      // Get variant to update conversion count
      const assignment = await prisma.aBTestAssignment.findUnique({
        where: {
          testId_visitorUserId: {
            testId: data.testId,
            visitorUserId: data.visitorUserId
          }
        }
      });

      if (assignment) {
        await this.incrementConversionCount(data.testId, assignment.variant);
        
        // Update test statistics
        await this.updateTestStatistics(data.testId);
      }

    } catch (error) {
      console.error('Error recording A/B test conversion:', error);
      throw new Error('Failed to record conversion');
    }
  }

  /**
   * Get A/B test metrics and analysis
   */
  async getTestMetrics(testId: string): Promise<ABTestMetrics | null> {
    try {
      const test = await prisma.aBTest.findUnique({
        where: { id: testId },
        include: {
          assignments: true
        }
      });

      if (!test) {
        return null;
      }

      // Calculate metrics
      const visitsA = test.visitsA;
      const visitsB = test.visitsB;
      const conversionsA = test.conversionsA;
      const conversionsB = test.conversionsB;
      
      const conversionRateA = visitsA > 0 ? conversionsA / visitsA : 0;
      const conversionRateB = visitsB > 0 ? conversionsB / visitsB : 0;

      // Statistical analysis
      const statisticalAnalysis = statisticsService.calculateStatistics({
        visitorsA: visitsA,
        conversionsA,
        visitorsB: visitsB,
        conversionsB,
        confidenceLevel: test.confidenceLevel,
        minimumDetectableEffect: 0.1, // 10% minimum detectable effect
        statisticalPower: 0.8 // 80% power
      });

      return {
        testId,
        visitsA,
        visitsB,
        conversionsA,
        conversionsB,
        conversionRateA,
        conversionRateB,
        statisticalAnalysis,
        lastUpdated: test.updatedAt
      };

    } catch (error) {
      console.error('Error getting A/B test metrics:', error);
      return null;
    }
  }

  /**
   * Get landing page content for variant
   */
  async getLandingPageContent(testId: string, variant: 'A' | 'B'): Promise<any> {
    try {
      const test = await prisma.aBTest.findUnique({
        where: { id: testId },
        include: {
          templateA: variant === 'A',
          templateB: variant === 'B'
        }
      });

      if (!test) {
        return null;
      }

      // Return template content or custom HTML
      if (variant === 'A') {
        return test.templateA?.content || test.landingPageA;
      } else {
        return test.templateB?.content || test.landingPageB;
      }

    } catch (error) {
      console.error('Error getting landing page content:', error);
      return null;
    }
  }

  /**
   * Stop A/B test and declare winner
   */
  async stopTest(testId: string, winnerVariant?: 'A' | 'B'): Promise<void> {
    try {
      const updateData: any = {
        status: 'COMPLETED',
        endDate: new Date()
      };

      if (winnerVariant) {
        updateData.winnerVariant = winnerVariant;
      }

      await prisma.aBTest.update({
        where: { id: testId },
        data: updateData
      });

    } catch (error) {
      console.error('Error stopping A/B test:', error);
      throw new Error('Failed to stop A/B test');
    }
  }

  /**
   * Auto-analyze tests and provide recommendations
   */
  async analyzeActiveTests(): Promise<void> {
    try {
      const activeTests = await prisma.aBTest.findMany({
        where: { status: 'ACTIVE' }
      });

      for (const test of activeTests) {
        const metrics = await this.getTestMetrics(test.id);
        if (!metrics) continue;

        const { statisticalAnalysis } = metrics;
        
        // Auto-stop if we have a clear winner with statistical significance
        if (statisticalAnalysis.isStatisticallySignificant && 
            statisticalAnalysis.recommendation.startsWith('stop_winner')) {
          
          const winnerVariant = statisticalAnalysis.recommendation === 'stop_winner_A' ? 'A' : 'B';
          await this.stopTest(test.id, winnerVariant);
          
          // Log the decision
          console.log(`Auto-stopped test ${test.id}: Winner is variant ${winnerVariant}`);
        }

        // Update statistical fields in database
        await prisma.aBTest.update({
          where: { id: test.id },
          data: {
            conversionRateA: statisticalAnalysis.conversionRateA,
            conversionRateB: statisticalAnalysis.conversionRateB,
            statisticalSignificance: statisticalAnalysis.isStatisticallySignificant,
            confidenceLevel: statisticalAnalysis.confidenceLevel
          }
        });
      }

    } catch (error) {
      console.error('Error analyzing active tests:', error);
    }
  }

  /**
   * Private helper methods
   */

  private async findActiveTestForUrl(url: string) {
    const tests = await prisma.aBTest.findMany({
      where: { status: 'ACTIVE' }
    });

    for (const test of tests) {
      if (this.urlMatches(url, test.url, test.urlMatchType)) {
        return test;
      }
    }

    return null;
  }

  private urlMatches(currentUrl: string, testUrl: string, matchType: string): boolean {
    switch (matchType) {
      case 'EXACT':
        return currentUrl === testUrl;
      
      case 'PATTERN':
        // Convert wildcard pattern to regex
        const regexPattern = testUrl.replace(/\*/g, '.*').replace(/\?/g, '\\?');
        return new RegExp(`^${regexPattern}$`).test(currentUrl);
      
      case 'REGEX':
        try {
          return new RegExp(testUrl).test(currentUrl);
        } catch {
          return false;
        }
      
      default:
        return false;
    }
  }

  private determineVariant(test: any): 'A' | 'B' {
    switch (test.assignmentType) {
      case 'FIFTY_FIFTY':
        return Math.random() < 0.5 ? 'A' : 'B';
      
      case 'ALTERNATING':
        const totalVisits = test.visitsA + test.visitsB;
        return totalVisits % 2 === 0 ? 'A' : 'B';
      
      case 'CUSTOM_SPLIT':
        const splitA = test.customSplitA || 50;
        return Math.random() * 100 < splitA ? 'A' : 'B';
      
      default:
        return 'A';
    }
  }

  private async incrementVisitCount(testId: string, variant: 'A' | 'B'): Promise<void> {
    const field = variant === 'A' ? 'visitsA' : 'visitsB';
    
    await prisma.aBTest.update({
      where: { id: testId },
      data: {
        [field]: {
          increment: 1
        }
      }
    });
  }

  private async incrementConversionCount(testId: string, variant: 'A' | 'B'): Promise<void> {
    const field = variant === 'A' ? 'conversionsA' : 'conversionsB';
    
    await prisma.aBTest.update({
      where: { id: testId },
      data: {
        [field]: {
          increment: 1
        }
      }
    });
  }

  private async updateTestStatistics(testId: string): Promise<void> {
    const metrics = await this.getTestMetrics(testId);
    if (!metrics) return;

    await prisma.aBTest.update({
      where: { id: testId },
      data: {
        conversionRateA: metrics.conversionRateA,
        conversionRateB: metrics.conversionRateB,
        statisticalSignificance: metrics.statisticalAnalysis.isStatisticallySignificant
      }
    });
  }

  private async getVisitorIP(visitorUserId: string): Promise<string | null> {
    try {
      const visitor = await prisma.visitorTracking.findFirst({
        where: { visitorUserId },
        orderBy: { timestamp: 'desc' }
      });
      return visitor?.ipAddress || null;
    } catch {
      return null;
    }
  }

  private async getVisitorUserAgent(visitorUserId: string): Promise<string | null> {
    try {
      const visitor = await prisma.visitorTracking.findFirst({
        where: { visitorUserId },
        orderBy: { timestamp: 'desc' }
      });
      return visitor?.userAgent || null;
    } catch {
      return null;
    }
  }

  /**
   * Performance monitoring methods
   */

  async getPerformanceMetrics(): Promise<{
    activeTests: number;
    totalAssignments: number;
    averageResponseTime: number;
    errorRate: number;
  }> {
    try {
      const [activeTestsCount, totalAssignments] = await Promise.all([
        prisma.aBTest.count({ where: { status: 'ACTIVE' } }),
        prisma.aBTestAssignment.count()
      ]);

      return {
        activeTests: activeTestsCount,
        totalAssignments,
        averageResponseTime: 0, // Would implement with actual timing
        errorRate: 0 // Would implement with error tracking
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {
        activeTests: 0,
        totalAssignments: 0,
        averageResponseTime: 0,
        errorRate: 100
      };
    }
  }

  /**
   * Cleanup and maintenance
   */
  async cleanupOldTests(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await prisma.aBTest.updateMany({
        where: {
          status: 'COMPLETED',
          endDate: {
            lt: cutoffDate
          }
        },
        data: {
          status: 'ARCHIVED'
        }
      });
    } catch (error) {
      console.error('Error cleaning up old tests:', error);
    }
  }
}

export const abTestingService = new ABTestingService();