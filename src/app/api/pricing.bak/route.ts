/**
 * Pricing API Route with Redis Caching
 * Provides solar pricing data with intelligent caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheWrapper, CacheInvalidator } from '../../../lib/cache/middleware';
import { CacheKeys, CacheTags } from '../../../lib/cache/redis';

interface PricingData {
  solarPanelCostPerWatt: number;
  installationCostPerWatt: number;
  totalCostPerWatt: number;
  federalTaxCredit: number;
  avgSystemSize: number;
  avgSystemCost: number;
  avgAnnualSavings: number;
  paybackPeriod: number;
  region: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'default';
    
    const cacheKey = CacheKeys.pricing(region);

    // Use cache wrapper for pricing data
    const { data: pricingData, context } = await cacheWrapper(
      cacheKey,
      async (): Promise<PricingData> => {
        // Simulate fetching pricing data from external API or database
        // In production, this would fetch from real pricing sources
        const basePrice = 2.50; // Base price per watt
        const regionMultiplier = getRegionMultiplier(region);
        
        const solarPanelCostPerWatt = basePrice * regionMultiplier;
        const installationCostPerWatt = 1.50 * regionMultiplier;
        const totalCostPerWatt = solarPanelCostPerWatt + installationCostPerWatt;
        
        return {
          solarPanelCostPerWatt: Number(solarPanelCostPerWatt.toFixed(2)),
          installationCostPerWatt: Number(installationCostPerWatt.toFixed(2)),
          totalCostPerWatt: Number(totalCostPerWatt.toFixed(2)),
          federalTaxCredit: 0.30, // 30% federal tax credit
          avgSystemSize: 6.5, // kW
          avgSystemCost: Number((6.5 * totalCostPerWatt * 1000).toFixed(0)),
          avgAnnualSavings: Number((1200 * 0.15).toFixed(0)), // Estimate
          paybackPeriod: 8, // years
          region,
          updatedAt: new Date().toISOString()
        };
      },
      {
        ttl: 7200, // 2 hours cache for pricing data
        tags: [CacheTags.PRICING]
      }
    );

    const response = NextResponse.json({
      success: true,
      data: pricingData
    });

    // Add cache headers
    response.headers.set('X-Cache', context.hit ? 'HIT' : 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    
    if (context.duration) {
      response.headers.set('X-Cache-Duration', `${context.duration}ms`);
    }

    return response;

  } catch (error) {
    console.error('Pricing API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pricing data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'invalidate_cache':
        await CacheInvalidator.invalidateByTags([CacheTags.PRICING]);
        
        return NextResponse.json({
          success: true,
          message: 'Pricing cache invalidated'
        });

      case 'update_pricing':
        // Update pricing data (admin only)
        const { region, pricing } = body;
        
        // In a real app, this would update the pricing in database
        // For now, just invalidate cache to force refresh
        if (region) {
          await CacheInvalidator.invalidateByPattern(`*pricing*${region}*`);
        } else {
          await CacheInvalidator.invalidateByTags([CacheTags.PRICING]);
        }
        
        return NextResponse.json({
          success: true,
          message: 'Pricing updated and cache invalidated'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Pricing POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Get regional pricing multiplier
 */
function getRegionMultiplier(region: string): number {
  const multipliers: Record<string, number> = {
    'default': 1.0,
    'california': 1.15,
    'texas': 0.95,
    'florida': 1.05,
    'new-york': 1.25,
    'arizona': 0.90,
    'north-carolina': 1.00,
    'nevada': 0.92,
    'new-jersey': 1.20,
    'massachusetts': 1.30
  };

  return multipliers[region.toLowerCase()] || multipliers['default'];
}