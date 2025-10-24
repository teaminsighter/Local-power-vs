import { NextRequest, NextResponse } from 'next/server';
import { validateAndSanitize, leadFormSchema, paginationSchema } from '../../../lib/validation';
import { db } from '../../../lib/database/optimized-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate and sanitize input data
    const validation = validateAndSanitize(leadFormSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      preferredContact,
      bestTimeToCall,
      installationTimeframe,
      additionalNotes,
      marketingConsent,
      systemDetails,
      source,
      status
    } = validation.data;

    // Map preferredContact to match the enum
    const contactPreference = preferredContact === 'email' ? 'EMAIL' : 
                             preferredContact === 'phone' ? 'PHONE' : 'BOTH';

    // Create the lead with system details using optimized service
    const lead = await db.createLead({
      firstName,
      lastName,
      email,
      phone,
      contactPreference,
      bestTimeToCall,
      status: status || 'NEW',
      source: source || 'website',
      score: 75, // Default score for calculator leads
      tags: `timeframe:${installationTimeframe}${marketingConsent ? ',marketing-consent' : ''}`,
      notes: additionalNotes || null,
      systemDetails: {
        create: {
          systemSize: systemDetails.systemSize,
          estimatedCost: systemDetails.estimatedCost,
          annualSavings: systemDetails.annualSavings,
          paybackPeriod: systemDetails.paybackPeriod,
          panelCount: systemDetails.panelCount,
          roofArea: systemDetails.systemSize * 8, // Rough calculation: 8m² per kW
          monthlyBill: systemDetails.annualSavings / 12, // Estimate from savings
          usageKwh: systemDetails.systemSize * 1200, // Rough calculation: 1200 kWh per kW annually
          address: systemDetails.address || address,
          propertyType: 'residential', // Default for calculator
          roofType: 'standard' // Default for calculator
        }
      }
    });

    console.log('Lead created successfully:', {
      id: lead.id,
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      systemSize: lead.systemDetails?.systemSize
    });

    // Cache invalidation will be added back later

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Lead captured successfully'
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to capture lead',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const paramsValidation = validateAndSanitize(paginationSchema, {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20'
    });
    
    if (!paramsValidation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid query parameters',
          errors: paramsValidation.errors
        },
        { status: 400 }
      );
    }

    const { page, limit: pageSize } = paramsValidation.data;
    const offset = (page - 1) * pageSize;
    
    // Safely get and validate other parameters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');  
    const source = searchParams.get('source');
    
    // Check if demo data should be used
    const useDemoData = searchParams.get('demo') === 'true';
    
    if (useDemoData) {
      // Fetch demo data
      try {
        const demoResponse = await fetch(new URL('/api/demo/admin-data', request.url));
        const demoData = await demoResponse.json();
        
        if (demoData.success && demoData.data?.leads) {
          let filteredLeads = demoData.data.leads;
          
          // Apply filters to demo data
          if (status) {
            const statusArray = status.split(',').map(s => s.trim().toLowerCase());
            filteredLeads = filteredLeads.filter((lead: any) => 
              statusArray.includes(lead.status.toLowerCase())
            );
          }
          
          if (source) {
            filteredLeads = filteredLeads.filter((lead: any) => 
              lead.source.toLowerCase().includes(source.toLowerCase())
            );
          }
          
          // Apply pagination
          const paginatedLeads = filteredLeads.slice(offset, offset + pageSize);
          
          return NextResponse.json({
            success: true,
            leads: paginatedLeads,
            total: filteredLeads.length,
            demoData: true
          });
        }
      } catch (demoError) {
        console.error('Demo data fetch failed, falling back to database:', demoError);
      }
    }

    // Build where clause
    const where: any = {};

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
        where.OR = scoreRanges;
      }
    }

    // Execute query using optimized service
    const result = await db.getLeadsWithPagination(where, page, pageSize);

    // Transform leads to include calculated priority
    const transformedLeads = result.data.map(lead => ({
      ...lead,
      priority: calculatePriority(lead.score),
      fullName: `${lead.firstName} ${lead.lastName}`,
      systemSize: lead.systemDetails?.systemSize || 0,
      estimatedValue: lead.systemDetails?.estimatedCost || 0
    }));

    return NextResponse.json({
      success: true,
      leads: transformedLeads,
      pagination: {
        page,
        pageSize,
        hasMore: result.hasMore,
        total: result.total
      }
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch leads',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate priority from score
function calculatePriority(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}