#!/usr/bin/env node

/**
 * Demo Data Generation Script for Local Power
 * Generates comprehensive demo data for all features including:
 * - Leads and customers
 * - Solar panel installations with map locations
 * - Analytics data and visitor tracking
 * - Question responses and funnel data
 * - Marketing campaign data
 * - CRM activities and interactions
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Demo data configurations
const DEMO_CONFIG = {
  leads: 150,
  visitors: 500,
  solarInstallations: 85,
  marketingCampaigns: 12,
  questionResponses: 300,
  crmActivities: 200,
  timeRangeMonths: 6
};

// Irish locations for realistic demo data
const IRISH_LOCATIONS = [
  { city: 'Dublin', lat: 53.3498, lng: -6.2603, county: 'Dublin' },
  { city: 'Cork', lat: 51.8985, lng: -8.4756, county: 'Cork' },
  { city: 'Galway', lat: 53.2707, lng: -9.0568, county: 'Galway' },
  { city: 'Limerick', lat: 52.6638, lng: -8.6267, county: 'Limerick' },
  { city: 'Waterford', lat: 52.2593, lng: -7.1101, county: 'Waterford' },
  { city: 'Kilkenny', lat: 52.6541, lng: -7.2448, county: 'Kilkenny' },
  { city: 'Wexford', lat: 52.3369, lng: -6.4633, county: 'Wexford' },
  { city: 'Athlone', lat: 53.4234, lng: -7.9421, county: 'Westmeath' },
  { city: 'Sligo', lat: 54.2766, lng: -8.4761, county: 'Sligo' },
  { city: 'Tralee', lat: 52.2711, lng: -9.7047, county: 'Kerry' }
];

// Sample names for realistic demo data
const SAMPLE_NAMES = [
  'John Murphy', 'Sarah O\'Connor', 'Michael Kelly', 'Emma Walsh', 'David Ryan',
  'Lisa Thompson', 'James Wilson', 'Mary Fitzgerald', 'Robert Brown', 'Anna Davis',
  'Patrick O\'Sullivan', 'Claire McCarthy', 'Sean O\'Brien', 'Jennifer Collins',
  'Thomas Moore', 'Rachel Quinn', 'Kevin Lynch', 'Amy O\'Neill', 'Daniel Burke',
  'Sophie Murphy', 'Liam Byrne', 'Grace Kennedy', 'Conor Doyle', 'Hannah Smith'
];

// Solar solutions available
const SOLAR_SOLUTIONS = [
  'Solar Panels Only',
  'Solar + Battery Storage',
  'Heat Pump + Solar',
  'Full Home Energy System',
  'Commercial Solar Array'
];

// Question templates for funnel analysis
const QUESTION_RESPONSES = {
  state: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kilkenny'],
  solution: SOLAR_SOLUTIONS,
  propertyType: ['Detached House', 'Semi-Detached', 'Terraced House', 'Apartment', 'Bungalow'],
  roofType: ['Tile Roof', 'Slate Roof', 'Metal Roof', 'Flat Roof'],
  energyUsage: ['Low (< €100/month)', 'Medium (€100-200/month)', 'High (€200-300/month)', 'Very High (> €300/month)']
};

// Utility functions
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;
const randomDate = (monthsBack) => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (monthsBack * 30 * 24 * 60 * 60 * 1000));
  return new Date(pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime()));
};

const generatePhoneNumber = () => {
  const prefixes = ['086', '087', '085', '083', '089'];
  const prefix = randomElement(prefixes);
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `+353 ${prefix} ${number.toString().slice(0, 3)} ${number.toString().slice(3)}`;
};

const generateEmail = (name) => {
  const domain = randomElement(['gmail.com', 'yahoo.ie', 'hotmail.com', 'outlook.ie', 'eircom.net']);
  const cleanName = name.toLowerCase().replace(/[^a-z\\s]/g, '').replace(/\\s+/g, '.');
  return `${cleanName}@${domain}`;
};

const generateAddress = (location) => {
  const streetNumbers = randomNumber(1, 999);
  const streetNames = [
    'Main Street', 'Church Road', 'Park Avenue', 'Dublin Road', 'Cork Street',
    'Grafton Street', 'O\'Connell Street', 'Patrick Street', 'High Street', 'Mill Road'
  ];
  const streetName = randomElement(streetNames);
  return `${streetNumbers} ${streetName}, ${location.city}, ${location.county}`;
};

// Data generation functions
async function generateLeads() {
  console.log('Generating leads...');
  const leads = [];
  
  for (let i = 0; i < DEMO_CONFIG.leads; i++) {
    const location = randomElement(IRISH_LOCATIONS);
    const name = randomElement(SAMPLE_NAMES);
    const createdAt = randomDate(DEMO_CONFIG.timeRangeMonths);
    
    const lead = {
      id: `lead_${Date.now()}_${i}`,
      name: name,
      email: generateEmail(name),
      phone: generatePhoneNumber(),
      address: generateAddress(location),
      city: location.city,
      county: location.county,
      latitude: location.lat + randomFloat(-0.1, 0.1), // Slight variation for realistic spread
      longitude: location.lng + randomFloat(-0.1, 0.1),
      selectedSolution: randomElement(SOLAR_SOLUTIONS),
      propertyType: randomElement(QUESTION_RESPONSES.propertyType),
      roofType: randomElement(QUESTION_RESPONSES.roofType),
      energyUsage: randomElement(QUESTION_RESPONSES.energyUsage),
      monthlyBill: randomNumber(80, 400),
      estimatedSavings: randomNumber(1200, 4500),
      systemSize: randomFloat(3.5, 12.0),
      quotedPrice: randomNumber(8000, 25000),
      status: randomElement(['new', 'contacted', 'qualified', 'quoted', 'converted', 'lost']),
      source: randomElement(['website', 'google_ads', 'facebook', 'referral', 'direct']),
      priority: randomElement(['low', 'medium', 'high']),
      notes: 'Generated demo lead for testing purposes',
      tags: randomElement([['hot-lead'], ['qualified'], ['follow-up'], ['price-sensitive'], []]),
      createdAt: createdAt,
      updatedAt: new Date(createdAt.getTime() + randomNumber(1, 72) * 60 * 60 * 1000) // Updated within 72 hours
    };
    
    leads.push(lead);
  }
  
  return leads;
}

async function generateSolarInstallations(leads) {
  console.log('Generating solar installations...');
  const installations = [];
  
  // Select converted leads for installations
  const convertedLeads = leads.filter(lead => lead.status === 'converted');
  const installationCount = Math.min(DEMO_CONFIG.solarInstallations, convertedLeads.length);
  
  for (let i = 0; i < installationCount; i++) {
    const lead = convertedLeads[i];
    const installDate = new Date(lead.createdAt.getTime() + randomNumber(14, 90) * 24 * 60 * 60 * 1000);
    
    const installation = {
      id: `install_${Date.now()}_${i}`,
      leadId: lead.id,
      customerName: lead.name,
      address: lead.address,
      latitude: lead.latitude,
      longitude: lead.longitude,
      systemSize: lead.systemSize,
      panelCount: Math.floor(lead.systemSize * 4), // ~4 panels per kW
      inverterType: randomElement(['String Inverter', 'Power Optimizers', 'Microinverters']),
      panelBrand: randomElement(['LG', 'SunPower', 'Jinko Solar', 'Canadian Solar', 'Trina Solar']),
      batteryIncluded: randomElement([true, false]),
      batteryCapacity: randomElement([null, 5.2, 7.7, 10.24, 13.5]),
      installationCost: lead.quotedPrice,
      estimatedAnnualSavings: lead.estimatedSavings,
      warrantyYears: randomElement([10, 15, 20, 25]),
      installerName: randomElement(['Local Power Team A', 'Local Power Team B', 'Local Power Team C']),
      installationDate: installDate,
      commissioningDate: new Date(installDate.getTime() + randomNumber(1, 3) * 24 * 60 * 60 * 1000),
      status: randomElement(['planning', 'approved', 'in_progress', 'completed', 'commissioned']),
      notes: 'Demo installation for testing map functionality',
      createdAt: installDate
    };
    
    installations.push(installation);
  }
  
  return installations;
}

async function generateVisitorTracking() {
  console.log('Generating visitor tracking data...');
  const visitors = [];
  
  for (let i = 0; i < DEMO_CONFIG.visitors; i++) {
    const sessionStart = randomDate(DEMO_CONFIG.timeRangeMonths);
    const sessionDuration = randomNumber(30, 1200); // 30 seconds to 20 minutes
    
    const visitor = {
      id: `visitor_${Date.now()}_${i}`,
      sessionId: `session_${Date.now()}_${i}`,
      visitorUserId: `visitor_user_${Date.now()}_${i}`,
      page: randomElement(['/', '/solar-calculator', '/about', '/services', '/contact']),
      referrer: randomElement([
        'https://google.com',
        'https://facebook.com',
        'direct',
        'https://bing.com',
        'https://twitter.com'
      ]),
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      ipAddress: `192.168.1.${randomNumber(1, 254)}`,
      location: randomElement(IRISH_LOCATIONS),
      deviceType: randomElement(['desktop', 'mobile', 'tablet']),
      browser: randomElement(['Chrome', 'Safari', 'Firefox', 'Edge']),
      stayTime: sessionDuration,
      scrollDepth: randomNumber(25, 100),
      actions: randomNumber(1, 15),
      leadGenerated: randomElement([true, false, false, false]), // 25% lead generation rate
      conversionValue: randomElement([null, randomNumber(8000, 25000)]),
      createdAt: sessionStart,
      updatedAt: new Date(sessionStart.getTime() + sessionDuration * 1000)
    };
    
    visitors.push(visitor);
  }
  
  return visitors;
}

async function generateQuestionResponses() {
  console.log('Generating question responses...');
  const responses = [];
  
  for (let i = 0; i < DEMO_CONFIG.questionResponses; i++) {
    const responseDate = randomDate(DEMO_CONFIG.timeRangeMonths);
    
    const response = {
      id: `response_${Date.now()}_${i}`,
      sessionId: `session_${Date.now()}_${i}`,
      userId: `user_${Date.now()}_${i}`,
      stepNumber: randomNumber(1, 7),
      questionType: randomElement(['state', 'solution', 'propertyType', 'roofType', 'energyUsage']),
      questionText: 'What is your preferred solution type?',
      selectedAnswer: randomElement(QUESTION_RESPONSES.solution),
      textInput: randomElement([
        null,
        'Looking for maximum energy savings',
        'Need panels that work well in Irish weather',
        'Interested in battery storage for power outages',
        'Want to be completely energy independent'
      ]),
      timeSpent: randomNumber(5, 45), // seconds
      completed: randomElement([true, false, true, true]), // 75% completion rate
      abandonedAt: null,
      validationErrors: randomElement([[], ['invalid_format'], []]),
      createdAt: responseDate
    };
    
    responses.push(response);
  }
  
  return responses;
}

async function generateMarketingData() {
  console.log('Generating marketing campaign data...');
  const campaigns = [];
  
  const campaignTypes = [
    { platform: 'Facebook', type: 'Social Media' },
    { platform: 'Google', type: 'Search Ads' },
    { platform: 'LinkedIn', type: 'B2B' },
    { platform: 'Email', type: 'Email Marketing' },
    { platform: 'TikTok', type: 'Social Media' }
  ];
  
  for (let i = 0; i < DEMO_CONFIG.marketingCampaigns; i++) {
    const campaign = randomElement(campaignTypes);
    const startDate = randomDate(DEMO_CONFIG.timeRangeMonths);
    const budget = randomNumber(500, 2000);
    const spent = budget * randomFloat(0.6, 0.95);
    
    const campaignData = {
      id: `campaign_${Date.now()}_${i}`,
      name: `${campaign.platform} Solar Campaign ${i + 1}`,
      platform: campaign.platform,
      type: campaign.type,
      status: randomElement(['active', 'paused', 'completed']),
      budget: budget,
      spent: Math.round(spent),
      impressions: randomNumber(10000, 100000),
      clicks: randomNumber(200, 2000),
      conversions: randomNumber(5, 50),
      leads: randomNumber(3, 30),
      revenue: randomNumber(15000, 80000),
      ctr: randomFloat(1.2, 3.5),
      cpc: randomFloat(0.8, 2.5),
      conversionRate: randomFloat(2.1, 8.3),
      costPerLead: randomFloat(25, 85),
      roas: randomFloat(3.2, 12.8),
      targetAudience: randomElement(['Homeowners 35-65', 'High Income Dublin', 'Environmental Conscious', 'Energy Cost Concerned']),
      keywords: randomElement([
        ['solar panels', 'renewable energy', 'energy savings'],
        ['heat pump', 'energy efficient', 'home improvement'],
        ['dublin solar', 'cork renewable', 'irish solar company']
      ]),
      startDate: startDate,
      endDate: new Date(startDate.getTime() + randomNumber(30, 90) * 24 * 60 * 60 * 1000),
      createdAt: startDate
    };
    
    campaigns.push(campaignData);
  }
  
  return campaigns;
}

async function generateAnalyticsData() {
  console.log('Generating analytics funnel data...');
  
  // Generate step analytics data that matches our funnel
  const steps = [
    { step: 1, name: 'Welcome', baseEntries: 500 },
    { step: 2, name: 'State Selection', baseEntries: 350 },
    { step: 3, name: 'Solution Selection', baseEntries: 280 },
    { step: 4, name: 'Address Input', baseEntries: 220 },
    { step: 5, name: 'Map Analysis', baseEntries: 180 },
    { step: 6, name: 'Panel Configuration', baseEntries: 150 },
    { step: 7, name: 'Lead Capture', baseEntries: 120 }
  ];
  
  const analyticsData = steps.map(step => {
    const entries = step.baseEntries + randomNumber(-50, 50);
    const completions = Math.floor(entries * randomFloat(0.7, 0.9));
    const dropOffs = entries - completions;
    
    return {
      stepNumber: step.step,
      stepName: step.name,
      totalEntries: entries,
      completions: completions,
      dropOffs: dropOffs,
      conversionRate: ((completions / entries) * 100),
      averageDuration: randomNumber(15, 120), // seconds
      popularChoices: step.step === 2 ? 
        { 'Dublin': 45, 'Cork': 25, 'Galway': 15, 'Limerick': 15 } :
        step.step === 3 ?
        { 'Solar Panels Only': 60, 'Solar + Battery': 30, 'Heat Pump + Solar': 10 } :
        {},
      createdAt: new Date()
    };
  });
  
  return analyticsData;
}

// File system helpers
async function saveDemoDataToFiles(allData) {
  console.log('Saving demo data to JSON files...');
  
  const dataDir = path.join(__dirname, '../demo-data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Save each data type to separate files
  Object.keys(allData).forEach(dataType => {
    const filePath = path.join(dataDir, `${dataType}.json`);
    fs.writeFileSync(filePath, JSON.stringify(allData[dataType], null, 2));
    console.log(`Saved ${allData[dataType].length} ${dataType} records to ${filePath}`);
  });
  
  // Save summary
  const summary = {
    generatedAt: new Date().toISOString(),
    totalRecords: Object.values(allData).reduce((sum, arr) => sum + arr.length, 0),
    breakdown: Object.keys(allData).reduce((acc, key) => {
      acc[key] = allData[key].length;
      return acc;
    }, {}),
    config: DEMO_CONFIG
  };
  
  fs.writeFileSync(path.join(dataDir, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('Demo data generation complete!');
  console.log('Summary:', summary);
}

// Main generation function
async function generateAllDemoData() {
  try {
    console.log('🚀 Starting Local Power demo data generation...');
    console.log('Configuration:', DEMO_CONFIG);
    
    // Generate all data types
    const leads = await generateLeads();
    const installations = await generateSolarInstallations(leads);
    const visitors = await generateVisitorTracking();
    const questionResponses = await generateQuestionResponses();
    const marketingCampaigns = await generateMarketingData();
    const analyticsData = await generateAnalyticsData();
    
    const allData = {
      leads,
      installations,
      visitors,
      questionResponses,
      marketingCampaigns,
      analyticsData
    };
    
    // Save to files
    await saveDemoDataToFiles(allData);
    
    console.log('✅ Demo data generation completed successfully!');
    console.log('📁 Data saved to ./demo-data/ directory');
    console.log('🔧 Next: Run "node scripts/load-demo-data.js" to load into database');
    
    return allData;
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  generateAllDemoData().catch(console.error);
}

module.exports = { generateAllDemoData, DEMO_CONFIG };