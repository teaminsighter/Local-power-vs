import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};

    // Text search across multiple fields
    if (query.trim()) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
        { source: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Status filter
    if (status) {
      const statusArray = status.split(',').map(s => s.trim().toUpperCase());
      where.status = { in: statusArray };
    }

    // Source filter
    if (source) {
      where.source = { contains: source, mode: 'insensitive' };
    }

    // Priority filter (calculated from score)
    if (priority) {
      const priorities = priority.split(',').map(p => p.trim().toLowerCase());
      const scoreRanges = [];
      
      if (priorities.includes('high')) {
        scoreRanges.push({ score: { gte: 80 } });
      }
      if (priorities.includes('medium')) {
        scoreRanges.push({ score: { gte: 40, lt: 80 } });
      }
      if (priorities.includes('low')) {
        scoreRanges.push({ score: { lt: 40 } });
      }
      
      if (scoreRanges.length > 0) {
        where.OR = where.OR ? [...where.OR, ...scoreRanges] : scoreRanges;
      }
    }

    // Execute query
    const leads = await prisma.lead.findMany({
      where,
      include: {
        systemDetails: true
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // Transform leads to include calculated priority
    const transformedLeads = leads.map(lead => ({
      ...lead,
      priority: calculatePriority(lead.score),
      fullName: `${lead.firstName} ${lead.lastName}`,
      systemSize: lead.systemDetails?.systemSize || 0,
      estimatedValue: lead.systemDetails?.estimatedCost || 0
    }));

    return NextResponse.json(transformedLeads);

  } catch (error) {
    console.error('Lead Search API Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to search leads' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate priority from score
function calculatePriority(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}