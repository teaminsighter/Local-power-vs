import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Demo Data API
 * Generates demo data specifically for admin panel display
 * This data is temporary and stored in memory only
 */

// In-memory demo data store (resets on server restart)
let demoDataStore: any = {
  generated: false,
  timestamp: null,
  leads: [],
  analytics: {},
  questionResponses: [],
  marketingCampaigns: [],
  solarInstallations: []
};

// Generate demo leads for admin panel
function generateDemoLeads() {
  const names = [
    'John Murphy', 'Sarah O\'Connor', 'Michael Kelly', 'Emma Walsh', 'David Ryan',
    'Lisa Thompson', 'James Wilson', 'Mary Fitzgerald', 'Robert Brown', 'Anna Davis'
  ];
  
  const locations = [
    { city: 'Dublin', county: 'Dublin', lat: 53.3498, lng: -6.2603 },
    { city: 'Cork', county: 'Cork', lat: 51.8985, lng: -8.4756 },
    { city: 'Galway', county: 'Galway', lat: 53.2707, lng: -9.0568 },
    { city: 'Limerick', county: 'Limerick', lat: 52.6638, lng: -8.6267 }
  ];
  
  const solutions = ['Solar Panels Only', 'Solar + Battery', 'Heat Pump + Solar', 'Full Energy System'];
  const statuses = ['new', 'contacted', 'qualified', 'quoted', 'converted', 'lost'];
  
  const leads = [];
  for (let i = 0; i < 50; i++) {
    const location = locations[Math.floor(Math.random() * locations.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    
    leads.push({
      id: `demo_lead_${i + 1}`,
      name: name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@example.com`,
      phone: `+353 86 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
      address: `${Math.floor(Math.random() * 999 + 1)} Main Street, ${location.city}`,
      city: location.city,
      county: location.county,
      selectedSolution: solutions[Math.floor(Math.random() * solutions.length)],
      monthlyBill: Math.floor(Math.random() * 300 + 80),
      estimatedSavings: Math.floor(Math.random() * 3000 + 1200),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: ['website', 'google_ads', 'facebook', 'referral'][Math.floor(Math.random() * 4)],
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 72 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return leads;
}

// Generate demo analytics for step analysis
function generateDemoAnalytics() {
  return {
    funnelData: [
      {
        stepNumber: 1,
        stepName: 'Welcome',
        totalEntries: 148,
        completions: 146,
        dropOffs: 2,
        conversionRate: 98.6,
        averageDuration: 10,
        popularChoices: {}
      },
      {
        stepNumber: 2,
        stepName: 'State Selection',
        totalEntries: 49,
        completions: 49,
        dropOffs: 0,
        conversionRate: 100.0,
        averageDuration: 24,
        popularChoices: { 'Dublin': 28, 'Cork': 12, 'Galway': 6, 'Limerick': 3 }
      },
      {
        stepNumber: 3,
        stepName: 'Solution Selection',
        totalEntries: 55,
        completions: 51,
        dropOffs: 4,
        conversionRate: 92.7,
        averageDuration: 48,
        popularChoices: { 'Solar Panels Only': 32, 'Solar + Battery': 18, 'Heat Pump + Solar': 5 }
      },
      {
        stepNumber: 4,
        stepName: 'Address Input',
        totalEntries: 55,
        completions: 14,
        dropOffs: 41,
        conversionRate: 25.5,
        averageDuration: 78,
        popularChoices: {}
      },
      {
        stepNumber: 5,
        stepName: 'Map Analysis',
        totalEntries: 18,
        completions: 11,
        dropOffs: 7,
        conversionRate: 61.1,
        averageDuration: 45,
        popularChoices: {}
      },
      {
        stepNumber: 6,
        stepName: 'Panel Configuration',
        totalEntries: 12,
        completions: 5,
        dropOffs: 7,
        conversionRate: 41.7,
        averageDuration: 50,
        popularChoices: { '6:2': 1 }
      },
      {
        stepNumber: 7,
        stepName: 'Lead Capture',
        totalEntries: 5,
        completions: 0,
        dropOffs: 5,
        conversionRate: 0.0,
        averageDuration: 0,
        popularChoices: {}
      }
    ],
    sessionStats: {
      totalSessions: 148,
      conversionRate: 3.4,
      averageStepsCompleted: 2.8,
      conversions: 5,
      deviceBreakdown: {
        desktop: 89,
        mobile: 45,
        tablet: 14
      }
    }
  };
}

// Generate demo question responses
function generateQuestionResponses() {
  const responses = [];
  const questionTypes = ['state', 'solution', 'propertyType', 'energyUsage'];
  const answers = {
    state: ['Dublin', 'Cork', 'Galway', 'Limerick'],
    solution: ['Solar Panels Only', 'Solar + Battery', 'Heat Pump + Solar'],
    propertyType: ['Detached House', 'Semi-Detached', 'Terraced House', 'Apartment'],
    energyUsage: ['Low', 'Medium', 'High', 'Very High']
  };
  
  for (let i = 0; i < 30; i++) {
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    responses.push({
      id: `demo_response_${i + 1}`,
      userId: `demo_user_${Math.floor(Math.random() * 20) + 1}`,
      stepNumber: Math.floor(Math.random() * 7) + 1,
      questionType: questionType,
      selectedAnswer: answers[questionType][Math.floor(Math.random() * answers[questionType].length)],
      textInput: Math.random() > 0.7 ? 'Looking for the best energy solution for my home' : null,
      timeSpent: Math.floor(Math.random() * 40) + 5,
      completed: Math.random() > 0.2,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return responses;
}

// Generate demo marketing campaigns
function generateMarketingCampaigns() {
  const platforms = ['Facebook', 'Google', 'LinkedIn', 'Email', 'TikTok'];
  const campaigns = [];
  
  for (let i = 0; i < 8; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const budget = Math.floor(Math.random() * 1500) + 500;
    const spent = budget * (0.6 + Math.random() * 0.3);
    
    campaigns.push({
      id: `demo_campaign_${i + 1}`,
      name: `${platform} Solar Campaign ${i + 1}`,
      platform: platform,
      status: ['active', 'paused', 'completed'][Math.floor(Math.random() * 3)],
      budget: budget,
      spent: Math.round(spent),
      impressions: Math.floor(Math.random() * 80000) + 20000,
      clicks: Math.floor(Math.random() * 1500) + 300,
      conversions: Math.floor(Math.random() * 40) + 10,
      revenue: Math.floor(Math.random() * 50000) + 20000,
      ctr: 1.2 + Math.random() * 2.0,
      cpc: 0.8 + Math.random() * 1.5,
      conversionRate: 2.0 + Math.random() * 5.0,
      startDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return campaigns;
}

// Generate demo solar installations for map
function generateSolarInstallations() {
  const installations = [];
  const locations = [
    { name: 'Murphy Family - Dublin 4', lat: 53.3342, lng: -6.2267, address: '123 Sandymount Road, Dublin 4' },
    { name: 'O\'Connor Residence - Cork', lat: 51.8985, lng: -8.4756, address: '45 Patrick Street, Cork' },
    { name: 'Walsh Farm - Galway', lat: 53.2707, lng: -9.0568, address: 'Moycullen Road, Galway' },
    { name: 'Kelly Business - Limerick', lat: 52.6638, lng: -8.6267, address: '88 O\'Connell Street, Limerick' },
    { name: 'Thompson Home - Waterford', lat: 52.2593, lng: -7.1101, address: '67 The Quay, Waterford' }
  ];
  
  locations.forEach((location, i) => {
    installations.push({
      id: `demo_install_${i + 1}`,
      name: location.name,
      address: location.address,
      latitude: location.lat,
      longitude: location.lng,
      systemSize: 3.5 + Math.random() * 8.0,
      panelCount: Math.floor(Math.random() * 30) + 15,
      installDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      monthlyGeneration: Math.floor(Math.random() * 500) + 200,
      annualSavings: Math.floor(Math.random() * 3000) + 1500,
      customerSatisfaction: 4 + Math.random()
    });
  });
  
  return installations;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'generate') {
      // Generate fresh demo data
      demoDataStore = {
        generated: true,
        timestamp: new Date().toISOString(),
        leads: generateDemoLeads(),
        analytics: generateDemoAnalytics(),
        questionResponses: generateQuestionResponses(),
        marketingCampaigns: generateMarketingCampaigns(),
        solarInstallations: generateSolarInstallations()
      };
      
      return NextResponse.json({
        success: true,
        message: 'Demo data generated successfully',
        summary: {
          leads: demoDataStore.leads.length,
          questionResponses: demoDataStore.questionResponses.length,
          marketingCampaigns: demoDataStore.marketingCampaigns.length,
          solarInstallations: demoDataStore.solarInstallations.length,
          generatedAt: demoDataStore.timestamp
        }
      });
    }
    
    if (action === 'clear') {
      // Clear demo data
      demoDataStore = {
        generated: false,
        timestamp: null,
        leads: [],
        analytics: {},
        questionResponses: [],
        marketingCampaigns: [],
        solarInstallations: []
      };
      
      return NextResponse.json({
        success: true,
        message: 'Demo data cleared successfully'
      });
    }
    
    // Return current demo data
    return NextResponse.json({
      success: true,
      generated: demoDataStore.generated,
      timestamp: demoDataStore.timestamp,
      data: demoDataStore
    });
    
  } catch (error) {
    console.error('Error with demo data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to handle demo data request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'generate') {
      // Generate fresh demo data
      demoDataStore = {
        generated: true,
        timestamp: new Date().toISOString(),
        leads: generateDemoLeads(),
        analytics: generateDemoAnalytics(),
        questionResponses: generateQuestionResponses(),
        marketingCampaigns: generateMarketingCampaigns(),
        solarInstallations: generateSolarInstallations()
      };
      
      return NextResponse.json({
        success: true,
        message: 'Demo data generated successfully',
        data: demoDataStore
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error generating demo data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate demo data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}