import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { visitorTrackingService } from '@/services/visitorTrackingService';
import { abTestingService } from '@/services/abTestingService';

const prisma = new PrismaClient();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }
  
  return request.ip || 'unknown';
}

function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  let deviceType = 'desktop';
  if (/mobile|android|iphone|ipad|tablet/.test(ua)) {
    deviceType = /ipad|tablet/.test(ua) ? 'tablet' : 'mobile';
  }
  
  let browser = 'unknown';
  if (ua.includes('chrome')) browser = 'chrome';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('safari')) browser = 'safari';
  else if (ua.includes('edge')) browser = 'edge';
  
  let os = 'unknown';
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac')) os = 'macos';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('ios')) os = 'ios';
  
  const isBot = /bot|crawler|spider|scraper/.test(ua);
  
  return { deviceType, browser, os, isBot };
}

async function getLocationFromIP(ip: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,query`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        region: data.regionName,
        city: data.city
      };
    }
  } catch (error) {
    console.error('Failed to get location from IP:', error);
  }
  
  return {
    country: null,
    region: null,
    city: null
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, referrer, sessionId, leadId, visitorUserId, stayTime, scrollDepth, actions } = body;
    
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const { deviceType, browser, os, isBot } = parseUserAgent(userAgent);
    
    if (isBot) {
      return NextResponse.json({ 
        success: false, 
        error: 'Bot traffic not tracked' 
      });
    }

    const location = await getLocationFromIP(ip);
    
    // Generate visitor user ID if not provided
    const finalVisitorUserId = visitorUserId || visitorTrackingService.generateVisitorUserId();
    
    // Track visitor using enhanced service
    const result = await visitorTrackingService.trackVisitor({
      visitorUserId: finalVisitorUserId,
      ipAddress: ip,
      country: location.country,
      city: location.city,
      region: location.region,
      userAgent,
      page: page || 'unknown',
      referrer: referrer || null,
      sessionId: sessionId || null,
      deviceType,
      browser,
      os,
      stayTime,
      scrollDepth,
      actions,
      leadId: leadId || null
    });

    // Check for A/B test assignment
    let abTestAssignment = null;
    let landingPageContent = null;
    
    try {
      abTestAssignment = await abTestingService.assignVisitor(finalVisitorUserId, page || '/');
      
      if (abTestAssignment) {
        landingPageContent = await abTestingService.getLandingPageContent(
          abTestAssignment.testId,
          abTestAssignment.variant
        );
      }
    } catch (error) {
      console.warn('A/B test assignment failed:', error);
    }
    
    return NextResponse.json({ 
      success: true, 
      trackingId: result.trackingId,
      visitorUserId: finalVisitorUserId,
      visitorProfile: result.visitorProfile,
      location: location.country ? `${location.city}, ${location.country}` : 'Unknown',
      abTestAssignment: abTestAssignment ? {
        ...abTestAssignment,
        landingPageContent
      } : null
    });
    
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get basic counts
    const totalVisitors = await prisma.visitorTracking.count({
      where: {
        timestamp: { gte: startDate },
        isBot: false
      }
    });

    const uniqueIPs = await prisma.visitorTracking.findMany({
      where: {
        timestamp: { gte: startDate },
        isBot: false
      },
      select: { ipAddress: true },
      distinct: ['ipAddress']
    });

    // Get all visitors to extract countries and devices manually
    const allVisitors = await prisma.visitorTracking.findMany({
      where: {
        timestamp: { gte: startDate },
        isBot: false
      },
      select: {
        country: true,
        deviceType: true
      }
    });

    // Process countries
    const countryMap: Record<string, number> = {};
    allVisitors.forEach(visitor => {
      if (visitor.country) {
        countryMap[visitor.country] = (countryMap[visitor.country] || 0) + 1;
      }
    });

    const topCountries = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Process devices
    const deviceMap: Record<string, number> = {};
    allVisitors.forEach(visitor => {
      const device = visitor.deviceType || 'unknown';
      deviceMap[device] = (deviceMap[device] || 0) + 1;
    });
    
    // Get recent visitors for the table
    const recentVisitors = await prisma.visitorTracking.findMany({
      where: {
        timestamp: { gte: startDate },
        isBot: false
      },
      select: {
        id: true,
        visitorUserId: true,
        ipAddress: true,
        country: true,
        city: true,
        deviceType: true,
        browser: true,
        page: true,
        timestamp: true,
        stayTime: true,
        scrollDepth: true,
        actions: true
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    return NextResponse.json({
      totalVisitors: totalVisitors || 0,
      uniqueVisitors: uniqueIPs ? uniqueIPs.length : 0,
      topCountries,
      deviceBreakdown: deviceMap,
      recentVisitors
    });
    
  } catch (error) {
    console.error('Failed to get visitor stats:', error);
    return NextResponse.json(
      { error: 'Failed to get visitor statistics' },
      { status: 500 }
    );
  }
}