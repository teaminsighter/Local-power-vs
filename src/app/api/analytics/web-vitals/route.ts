/**
 * Web Vitals Analytics API
 * Collects and stores Core Web Vitals data for performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/optimized-service';

interface WebVitalData {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
  url: string;
  userAgent: string;
  deviceMemory?: number;
  connectionType?: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WebVitalData;
    
    // Validate required fields
    if (!body.name || !body.value || !body.url) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, value, url'
      }, { status: 400 });
    }

    // Extract additional data from request
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';
    
    const country = request.headers.get('cf-ipcountry') || 
                    request.headers.get('x-country') || 
                    'unknown';

    // Store web vital data (using raw query for performance)
    const webVitalEntry = await db.executeRawQuery(`
      INSERT INTO web_vitals (
        metric_name, metric_value, rating, navigation_type,
        url, user_agent, device_memory, connection_type,
        ip_address, country, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `, [
      body.name,
      body.value,
      body.rating,
      body.navigationType,
      body.url,
      body.userAgent,
      body.deviceMemory || null,
      body.connectionType || null,
      ip,
      country,
      new Date(body.timestamp)
    ]);

    // For SQLite, use a simpler approach if the above fails
    if (!webVitalEntry) {
      console.log('Web vital recorded:', {
        name: body.name,
        value: body.value,
        rating: body.rating,
        url: body.url.split('?')[0] // Remove query params for privacy
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Web vital recorded successfully'
    });

  } catch (error) {
    console.error('Failed to record web vital:', error);
    
    // Don't fail the request to avoid affecting user experience
    return NextResponse.json({
      success: false,
      error: 'Failed to record web vital'
    }, { status: 200 }); // Return 200 to avoid client-side errors
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get('days') || '7');
    const metric = searchParams.get('metric');
    const url = searchParams.get('url');

    // Build query conditions
    const conditions: string[] = [];
    const params: any[] = [];
    
    // Time range filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);
    conditions.push('created_at >= ?');
    params.push(startDate);

    // Metric filter
    if (metric) {
      conditions.push('metric_name = ?');
      params.push(metric);
    }

    // URL filter
    if (url) {
      conditions.push('url LIKE ?');
      params.push(`%${url}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get aggregated web vitals data
    const vitalsData = await db.executeRawQuery(`
      SELECT 
        metric_name,
        AVG(metric_value) as avg_value,
        MIN(metric_value) as min_value,
        MAX(metric_value) as max_value,
        COUNT(*) as sample_count,
        SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END) as good_count,
        SUM(CASE WHEN rating = 'needs-improvement' THEN 1 ELSE 0 END) as improvement_count,
        SUM(CASE WHEN rating = 'poor' THEN 1 ELSE 0 END) as poor_count
      FROM web_vitals 
      ${whereClause}
      GROUP BY metric_name
      ORDER BY metric_name
    `, params);

    // Get performance trends
    const trendsData = await db.executeRawQuery(`
      SELECT 
        DATE(created_at) as date,
        metric_name,
        AVG(metric_value) as avg_value,
        COUNT(*) as sample_count
      FROM web_vitals 
      ${whereClause}
      GROUP BY DATE(created_at), metric_name
      ORDER BY date DESC, metric_name
      LIMIT 100
    `, params);

    // Calculate performance score
    const performanceScore = calculatePerformanceScore(vitalsData);

    return NextResponse.json({
      success: true,
      data: {
        vitals: vitalsData,
        trends: trendsData,
        performanceScore,
        timeRange,
        summary: {
          totalSamples: vitalsData.reduce((sum: number, v: any) => sum + v.sample_count, 0),
          avgScore: performanceScore,
          metricsTracked: vitalsData.length
        }
      }
    });

  } catch (error) {
    console.error('Failed to fetch web vitals:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch web vitals data'
    }, { status: 500 });
  }
}

function calculatePerformanceScore(vitalsData: any[]): number {
  if (!vitalsData.length) return 0;

  let totalScore = 0;
  let metricCount = 0;

  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    INP: { good: 200, poor: 500 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 }
  };

  for (const vital of vitalsData) {
    const threshold = thresholds[vital.metric_name as keyof typeof thresholds];
    if (!threshold) continue;

    const avgValue = vital.avg_value;
    let score = 100;

    if (avgValue > threshold.poor) score = 0;
    else if (avgValue > threshold.good) score = 50;

    totalScore += score;
    metricCount++;
  }

  return metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
}