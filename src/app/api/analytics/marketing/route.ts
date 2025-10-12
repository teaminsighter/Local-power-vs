import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // Generate realistic marketing data based on the period
    const marketingData = generateMarketingData(period);
    
    return NextResponse.json(marketingData);
  } catch (error) {
    console.error('Marketing analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing analytics' },
      { status: 500 }
    );
  }
}

function generateMarketingData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const currentDate = new Date();
  
  // Generate realistic campaign data
  const campaigns = [
    {
      id: 'camp_001',
      name: 'Solar Installation - Dublin',
      platform: 'Google Ads',
      status: 'active',
      budget: 1500,
      spent: 1247.89,
      impressions: 45670,
      clicks: 892,
      conversions: 34,
      ctr: 1.95,
      cpc: 1.40,
      conversionRate: 3.81,
      costPerConversion: 36.70,
      roi: 285.3
    },
    {
      id: 'camp_002',
      name: 'Heat Pump Awareness - Cork',
      platform: 'Facebook Ads',
      status: 'active',
      budget: 800,
      spent: 673.45,
      impressions: 67890,
      clicks: 1456,
      conversions: 28,
      ctr: 2.14,
      cpc: 0.46,
      conversionRate: 1.92,
      costPerConversion: 24.05,
      roi: 198.7
    },
    {
      id: 'camp_003',
      name: 'Energy Efficiency - National',
      platform: 'LinkedIn Ads',
      status: 'paused',
      budget: 600,
      spent: 445.67,
      impressions: 12340,
      clicks: 234,
      conversions: 8,
      ctr: 1.90,
      cpc: 1.90,
      conversionRate: 3.42,
      costPerConversion: 55.71,
      roi: 165.2
    },
    {
      id: 'camp_004',
      name: 'Battery Storage Solutions',
      platform: 'Google Ads',
      status: 'active',
      budget: 1200,
      spent: 1089.23,
      impressions: 38450,
      clicks: 567,
      conversions: 19,
      ctr: 1.47,
      cpc: 1.92,
      conversionRate: 3.35,
      costPerConversion: 57.33,
      roi: 187.9
    }
  ];

  // Calculate totals
  const totals = {
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
    averageCtr: campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length,
    averageCpc: campaigns.reduce((sum, c) => sum + (c.spent / c.clicks), 0) / campaigns.length,
    averageConversionRate: campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length,
    averageRoi: campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length
  };

  // Generate daily performance data
  const dailyData = Array.from({ length: days }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - (days - 1 - i));
    
    return {
      date: date.toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 5000) + 2000,
      clicks: Math.floor(Math.random() * 150) + 50,
      conversions: Math.floor(Math.random() * 8) + 2,
      cost: Math.floor(Math.random() * 200) + 100,
      ctr: (Math.random() * 2 + 1).toFixed(2),
      cpc: (Math.random() * 1.5 + 0.8).toFixed(2),
      conversionRate: (Math.random() * 3 + 1).toFixed(2)
    };
  });

  // Platform performance breakdown
  const platformData = [
    {
      platform: 'Google Ads',
      campaigns: campaigns.filter(c => c.platform === 'Google Ads').length,
      spent: campaigns.filter(c => c.platform === 'Google Ads').reduce((sum, c) => sum + c.spent, 0),
      clicks: campaigns.filter(c => c.platform === 'Google Ads').reduce((sum, c) => sum + c.clicks, 0),
      conversions: campaigns.filter(c => c.platform === 'Google Ads').reduce((sum, c) => sum + c.conversions, 0),
      roi: campaigns.filter(c => c.platform === 'Google Ads').reduce((sum, c) => sum + c.roi, 0) / campaigns.filter(c => c.platform === 'Google Ads').length
    },
    {
      platform: 'Facebook Ads',
      campaigns: campaigns.filter(c => c.platform === 'Facebook Ads').length,
      spent: campaigns.filter(c => c.platform === 'Facebook Ads').reduce((sum, c) => sum + c.spent, 0),
      clicks: campaigns.filter(c => c.platform === 'Facebook Ads').reduce((sum, c) => sum + c.clicks, 0),
      conversions: campaigns.filter(c => c.platform === 'Facebook Ads').reduce((sum, c) => sum + c.conversions, 0),
      roi: campaigns.filter(c => c.platform === 'Facebook Ads').reduce((sum, c) => sum + c.roi, 0) / campaigns.filter(c => c.platform === 'Facebook Ads').length
    },
    {
      platform: 'LinkedIn Ads',
      campaigns: campaigns.filter(c => c.platform === 'LinkedIn Ads').length,
      spent: campaigns.filter(c => c.platform === 'LinkedIn Ads').reduce((sum, c) => sum + c.spent, 0),
      clicks: campaigns.filter(c => c.platform === 'LinkedIn Ads').reduce((sum, c) => sum + c.clicks, 0),
      conversions: campaigns.filter(c => c.platform === 'LinkedIn Ads').reduce((sum, c) => sum + c.conversions, 0),
      roi: campaigns.filter(c => c.platform === 'LinkedIn Ads').reduce((sum, c) => sum + c.roi, 0) / campaigns.filter(c => c.platform === 'LinkedIn Ads').length
    }
  ];

  // Top performing keywords
  const keywords = [
    { keyword: 'solar panels dublin', impressions: 12450, clicks: 289, ctr: 2.32, cost: 423.45, conversions: 12 },
    { keyword: 'heat pump installation', impressions: 8760, clicks: 198, ctr: 2.26, cost: 356.78, conversions: 8 },
    { keyword: 'renewable energy solutions', impressions: 6890, clicks: 145, ctr: 2.10, cost: 287.34, conversions: 6 },
    { keyword: 'solar battery storage', impressions: 5670, clicks: 123, ctr: 2.17, cost: 245.67, conversions: 5 },
    { keyword: 'energy efficiency grants', impressions: 4230, clicks: 89, ctr: 2.10, cost: 178.90, conversions: 4 }
  ];

  // Geographic performance
  const geoData = [
    { region: 'Dublin', impressions: 45600, clicks: 892, conversions: 34, cost: 1247.89 },
    { region: 'Cork', impressions: 32100, clicks: 567, conversions: 22, cost: 856.45 },
    { region: 'Galway', impressions: 18900, clicks: 334, conversions: 14, cost: 523.78 },
    { region: 'Limerick', impressions: 12400, clicks: 234, conversions: 9, cost: 389.12 },
    { region: 'Waterford', impressions: 8760, clicks: 156, conversions: 6, cost: 234.67 }
  ];

  return {
    period,
    summary: {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalSpent: Math.round(totals.totalSpent * 100) / 100,
      totalImpressions: totals.totalImpressions,
      totalClicks: totals.totalClicks,
      totalConversions: totals.totalConversions,
      averageCtr: Math.round(totals.averageCtr * 100) / 100,
      averageCpc: Math.round(totals.averageCpc * 100) / 100,
      averageConversionRate: Math.round(totals.averageConversionRate * 100) / 100,
      averageRoi: Math.round(totals.averageRoi * 100) / 100
    },
    campaigns,
    dailyPerformance: dailyData,
    platformBreakdown: platformData,
    topKeywords: keywords,
    geoPerformance: geoData,
    generatedAt: new Date().toISOString()
  };
}