import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/aiService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Process the message with AI service including context
    const response = await aiService.processMessage(message.trim(), context);

    // If the response contains a function call, execute it
    if (response.success && response.data && response.data.functionName) {
      const functionResult = await executeDatabaseFunction(response.data.functionName, response.data.args);
      
      // Update response with actual data
      response.data = functionResult.data;
      response.message = functionResult.message;
      response.success = functionResult.success;
    }
    
    // Handle analysis actions
    if (response.success && response.data && response.data.action) {
      const actionResult = await executeAnalysisAction(response.data.action, response.data, context);
      
      // Update response with analysis results
      response.message = actionResult.message;
      response.data = actionResult.data;
      response.success = actionResult.success;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    return NextResponse.json(
      { 
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Execute analysis actions
async function executeAnalysisAction(action: string, data: any, context: string) {
  try {
    switch (action) {
      case 'analyzeTab':
        return await handleTabAnalysis(data, context);
      case 'contextualHelp':
        return await handleContextualHelp(data, context);
      default:
        return {
          data: null,
          message: `Analysis action ${action} not implemented`,
          success: false
        };
    }
  } catch (error) {
    return {
      data: null,
      message: `Error executing analysis: ${error}`,
      success: false
    };
  }
}

// Handle tab analysis
async function handleTabAnalysis(data: any, context: string) {
  try {
    // Parse context to get current tab information
    const contextLines = context.split('\n');
    let currentSection = 'unknown';
    let currentTab = 'unknown';
    let availableActions: string[] = [];
    
    for (const line of contextLines) {
      if (line.includes('Current Section:')) {
        currentSection = line.split(':')[1]?.trim() || 'unknown';
      }
      if (line.includes('Current Tab:')) {
        currentTab = line.split(':')[1]?.trim() || 'unknown';
      }
      if (line.includes('Available Actions:')) {
        const actionsStr = line.split(':')[1]?.trim() || '';
        availableActions = actionsStr.split(',').map(a => a.trim()).filter(a => a);
      }
    }

    // Generate comprehensive analysis based on current tab
    const analysis = await generateTabAnalysis(currentSection, currentTab, availableActions);
    
    return {
      data: {
        currentSection,
        currentTab,
        availableActions,
        analysis
      },
      message: analysis,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      message: `Error analyzing tab: ${error}`,
      success: false
    };
  }
}

// Handle contextual help
async function handleContextualHelp(data: any, context: string) {
  try {
    const helpType = data.helpType || 'general';
    const contextLines = context.split('\n');
    let currentSection = 'unknown';
    let currentTab = 'unknown';
    
    for (const line of contextLines) {
      if (line.includes('Current Section:')) {
        currentSection = line.split(':')[1]?.trim() || 'unknown';
      }
      if (line.includes('Current Tab:')) {
        currentTab = line.split(':')[1]?.trim() || 'unknown';
      }
    }

    const help = generateContextualHelp(currentSection, currentTab, helpType);
    
    return {
      data: { helpType, currentSection, currentTab },
      message: help,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      message: `Error providing help: ${error}`,
      success: false
    };
  }
}

// Generate comprehensive tab analysis
async function generateTabAnalysis(section: string, tab: string, actions: string[]) {
  const analysisMap: Record<string, Record<string, string>> = {
    'analytics': {
      'overview': `
📊 **Analytics Overview Tab Analysis**

**Current Location:** Analytics Dashboard → Overview
**Purpose:** Central performance monitoring and KPI tracking

**Key Features Available:**
• **Performance Metrics Dashboard** - Total leads (1,234), conversion rate (4.2%), revenue attribution (€45,678)
• **Top Traffic Sources** - Google Ads, Facebook Ads, Organic Search performance comparison
• **Real-time Data Updates** - Live metrics refreshing automatically
• **Interactive Charts** - Click to drill down into specific metrics

**Available Actions:** ${actions.join(', ')}

**What You Can Do Right Now:**
1. **Monitor Performance** - View current KPIs and trends
2. **Export Data** - Download reports for external analysis
3. **Change Date Range** - Adjust timeframe for historical analysis
4. **Analyze Sources** - Click on traffic sources for detailed breakdown

**Insights & Recommendations:**
• Your conversion rate of 4.2% is above industry average (2-3%)
• Google Ads is your top performer - consider increasing budget
• Use the export feature to create monthly reports for stakeholders
      `,
      'steps': `
📈 **Step Analytics Tab Analysis**

**Current Location:** Analytics Dashboard → Step Analytics
**Purpose:** Conversion funnel optimization and drop-off analysis

**Key Features Available:**
• **Conversion Funnel Visualization** - Step-by-step user journey mapping
• **Drop-off Rate Analysis** - Identify where users exit the process
• **A/B Testing Integration** - Compare funnel performance across variants
• **Optimization Suggestions** - AI-powered recommendations for improvement

**Available Actions:** ${actions.join(', ')}

**Current Funnel Performance:**
1. Landing Page View: 100% (1,250 visitors)
2. Calculator Started: 70% (875 visitors) - 30% drop-off
3. System Sized: 52% (650 visitors) - 25.7% drop-off
4. Contact Info: 33.6% (420 visitors) - 32.1% drop-off ⚠️ Major issue
5. Lead Submitted: 22.8% (285 visitors)

**Critical Insights:**
• **Biggest drop-off** occurs at Contact Info step (32.1%)
• This suggests trust or form complexity issues
• Consider simplifying the contact form or adding trust signals

**Recommended Actions:**
1. A/B test shorter contact forms
2. Add customer testimonials near contact section
3. Implement progressive disclosure for optional fields
      `,
      'leads': `
📋 **Lead Analysis Tab Analysis**

**Current Location:** Analytics Dashboard → Lead Analysis
**Purpose:** Lead quality assessment and conversion optimization

**Key Features Available:**
• **Lead Quality Scoring** - Automated high/medium/low prioritization
• **Source Performance Analysis** - ROI by traffic channel
• **Conversion Timeline Tracking** - Lead lifecycle progression
• **Predictive Analytics** - Lead conversion probability scoring

**Available Actions:** ${actions.join(', ')}

**Current Lead Metrics:**
• Total Leads: 1,234
• High Priority: 15% (185 leads) - Focus on these first
• Medium Priority: 60% (740 leads) - Good conversion potential
• Low Priority: 25% (309 leads) - Nurture campaign candidates

**Quality Insights:**
• Google Ads leads show 23% higher conversion rate
• Leads with phone numbers convert 40% better
• Morning form submissions have 18% higher close rate

**Optimization Opportunities:**
1. Prioritize phone number collection
2. Focus follow-up efforts on morning leads
3. Increase Google Ads budget allocation
      `
    },
    'lead-management': {
      'all-leads': `
👥 **All Leads Tab Analysis**

**Current Location:** CRM → All Leads
**Purpose:** Complete lead lifecycle management and tracking

**Key Features Available:**
• **Lead Status Management** - Track progression through sales pipeline
• **Contact History** - Full communication timeline per lead
• **Priority Scoring** - Automated lead quality assessment
• **Bulk Operations** - Mass updates and actions

**Available Actions:** ${actions.join(', ')}

**Current Pipeline Status:**
• New Leads: 45% (requiring immediate attention)
• Contacted: 25% (in active conversation)
• Qualified: 20% (ready for proposals)
• Proposal Sent: 8% (awaiting decision)
• Converted: 2% (closed won) 🎉

**Urgent Actions Needed:**
1. **Contact 185 new leads** from past 48 hours
2. **Follow up** on 98 qualified leads waiting for proposals
3. **Update status** for 67 leads marked as "contacted" over 1 week ago

**Productivity Tips:**
• Use bulk operations for status updates
• Filter by "High Priority" for best ROI focus
• Set up automated reminders for follow-ups
      `
    }
  };

  return analysisMap[section]?.[tab] || `
📄 **Tab Analysis: ${section} → ${tab}**

**Current Location:** ${section} → ${tab}
**Available Actions:** ${actions.join(', ')}

**Features:** This section contains tools and features specific to ${tab} management.

**What You Can Do:**
• Explore the available actions listed above
• Use the navigation to switch between related tabs
• Ask me specific questions about this section's capabilities

**Need More Help?** Ask me:
• "How do I use [specific feature]?"
• "What are the best practices for this section?"
• "Show me examples of how to optimize this workflow"
  `;
}

// Generate contextual help
function generateContextualHelp(section: string, tab: string, helpType: string) {
  const baseHelp = `
🆘 **Help: ${section} → ${tab}**

**${helpType.toUpperCase()} HELP**

Based on your current location in the admin panel, here's how to get the most out of this section:

**Quick Start:**
1. Familiarize yourself with the available actions in the interface
2. Use the data filters to focus on relevant information
3. Export reports for external analysis and sharing

**Best Practices:**
• Regular monitoring ensures optimal performance
• Use bulk operations for efficiency
• Set up automated alerts for important metrics

**Common Tasks:**
• Data analysis and reporting
• Performance optimization
• System configuration and maintenance

**Need Specific Help?** Ask me:
• "How do I [specific task] in this section?"
• "What's the best way to [specific goal]?"
• "Show me examples of [specific feature]"
  `;

  return baseHelp;
}

// Execute database functions
async function executeDatabaseFunction(functionName: string, args: any) {
  try {
    switch (functionName) {
      case 'getLeads':
        return await handleGetLeads(args);
      case 'getLeadStats':
        return await handleGetLeadStats();
      case 'searchLeads':
        return await handleSearchLeads(args);
      case 'getAnalyticsOverview':
        return await handleAnalyticsOverview(args);
      case 'getStepAnalytics':
        return await handleStepAnalytics(args);
      case 'getMarketingAnalytics':
        return await handleMarketingAnalytics(args);
      case 'getVisitorTracking':
        return await handleVisitorTracking(args);
      case 'getConversionFunnel':
        return await handleConversionFunnel(args);
      case 'getBrowserStats':
        return await handleBrowserStats(args);
      case 'getDeviceStats':
        return await handleDeviceStats(args);
      default:
        return {
          data: null,
          message: `Function ${functionName} not implemented`,
          success: false
        };
    }
  } catch (error) {
    return {
      data: null,
      message: `Error executing ${functionName}: ${error}`,
      success: false
    };
  }
}

// Database function handlers
async function handleGetLeads(args: any) {
  try {
    const leads = await prisma.lead.findMany({
      take: args.limit || 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      data: leads,
      message: `Found ${leads.length} leads in your database`,
      success: true
    };
  } catch (error) {
    return {
      data: [],
      message: `Error fetching leads: ${error}`,
      success: false
    };
  }
}

async function handleGetLeadStats() {
  try {
    const totalLeads = await prisma.lead.count();
    
    return {
      data: { totalLeads },
      message: `You have ${totalLeads} total leads in your database`,
      success: true
    };
  } catch (error) {
    return {
      data: { totalLeads: 0 },
      message: `Error fetching lead statistics: ${error}`,
      success: false
    };
  }
}

async function handleSearchLeads(args: any) {
  try {
    const { query } = args;
    
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } }
        ]
      },
      take: 20
    });

    return {
      data: leads,
      message: `Found ${leads.length} leads matching "${query}"`,
      success: true
    };
  } catch (error) {
    return {
      data: [],
      message: `Error searching leads: ${error}`,
      success: false
    };
  }
}

function calculatePriority(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// Analytics handler functions
async function handleAnalyticsOverview(args: any) {
  try {
    const timeframe = args.timeframe || 'month';
    
    // Get comprehensive analytics data
    const totalLeads = await prisma.lead.count();
    const totalVisitors = await prisma.visitorTracking.count();
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get leads in timeframe
    const recentLeads = await prisma.lead.count({
      where: { createdAt: { gte: startDate } }
    });

    // Get visitors in timeframe
    const recentVisitors = await prisma.visitorTracking.count({
      where: { timestamp: { gte: startDate } }
    });

    // Calculate conversion rate
    const conversionRate = recentVisitors > 0 ? (recentLeads / recentVisitors * 100).toFixed(2) : '0';

    // Get top sources
    const topSources = await prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    const analytics = {
      timeframe,
      overview: {
        totalLeads,
        totalVisitors,
        recentLeads,
        recentVisitors,
        conversionRate: parseFloat(conversionRate)
      },
      topSources: topSources.map(item => ({
        source: item.source,
        leads: item._count.id
      }))
    };

    return {
      data: analytics,
      message: `Analytics overview for the past ${timeframe}`,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      message: `Error fetching analytics overview: ${error}`,
      success: false
    };
  }
}

async function handleStepAnalytics(args: any) {
  try {
    const timeframe = args.timeframe || 'month';

    // Mock step analytics data - in production, this would come from tracking
    const stepData = {
      timeframe,
      steps: [
        { step: 'Landing Page View', visitors: 1250, rate: 100 },
        { step: 'Calculator Started', visitors: 875, rate: 70 },
        { step: 'System Sized', visitors: 650, rate: 52 },
        { step: 'Contact Info', visitors: 420, rate: 33.6 },
        { step: 'Lead Submitted', visitors: 285, rate: 22.8 },
        { step: 'Quote Requested', visitors: 145, rate: 11.6 },
        { step: 'Installation Booked', visitors: 58, rate: 4.6 }
      ],
      dropoffPoints: [
        { from: 'Landing Page', to: 'Calculator', dropoff: 30 },
        { from: 'Calculator', to: 'System Size', dropoff: 25.7 },
        { from: 'Contact Info', to: 'Lead Submit', dropoff: 32.1 }
      ]
    };

    return {
      data: stepData,
      message: `Step-by-step analytics for the past ${timeframe}`,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      message: `Error fetching step analytics: ${error}`,
      success: false
    };
  }
}

async function handleMarketingAnalytics(args: any) {
  try {
    const timeframe = args.timeframe || 'month';
    const campaigns = args.campaigns || ['google-ads', 'facebook-ads', 'organic'];

    // Get lead sources data
    const leadSources = await prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
      where: {
        source: { in: campaigns }
      }
    });

    // Mock campaign performance data
    const campaignData = {
      timeframe,
      campaigns: [
        {
          name: 'Google Ads',
          source: 'google-ads',
          leads: leadSources.find(s => s.source === 'google-ads')?._count.id || 0,
          clicks: 2450,
          impressions: 45000,
          cost: 1250,
          cpl: 89.3,
          roas: 3.2
        },
        {
          name: 'Facebook Ads',
          source: 'facebook-ads', 
          leads: leadSources.find(s => s.source === 'facebook-ads')?._count.id || 0,
          clicks: 1820,
          impressions: 35000,
          cost: 890,
          cpl: 74.2,
          roas: 2.8
        },
        {
          name: 'Organic Search',
          source: 'organic',
          leads: leadSources.find(s => s.source === 'organic')?._count.id || 0,
          clicks: 3200,
          impressions: 28000,
          cost: 0,
          cpl: 0,
          roas: 0
        }
      ],
      totalSpend: 2140,
      totalLeads: leadSources.reduce((sum, s) => sum + s._count.id, 0)
    };

    return {
      data: campaignData,
      message: `Marketing analytics for the past ${timeframe}`,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      message: `Error fetching marketing analytics: ${error}`,
      success: false
    };
  }
}

async function handleVisitorTracking(args: any) {
  try {
    const realtime = args.realtime || false;

    if (realtime) {
      // Get visitors from last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const realtimeVisitors = await prisma.visitorTracking.count({
        where: { timestamp: { gte: oneHourAgo } }
      });

      const activePages = await prisma.visitorTracking.groupBy({
        by: ['page'],
        _count: { id: true },
        where: { timestamp: { gte: oneHourAgo } },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      });

      const visitorData = {
        realtime: true,
        activeVisitors: realtimeVisitors,
        topPages: activePages.map(page => ({
          page: page.page,
          visitors: page._count.id
        })),
        lastUpdate: new Date().toISOString()
      };

      return {
        data: visitorData,
        message: 'Real-time visitor tracking data',
        success: true
      };
    } else {
      // Get historical visitor data
      const totalVisitors = await prisma.visitorTracking.count();
      
      const topPages = await prisma.visitorTracking.groupBy({
        by: ['page'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      });

      const visitorData = {
        realtime: false,
        totalVisitors,
        topPages: topPages.map(page => ({
          page: page.page,
          visitors: page._count.id
        }))
      };

      return {
        data: visitorData,
        message: 'Historical visitor tracking data',
        success: true
      };
    }
  } catch (error) {
    return {
      data: null,
      message: `Error fetching visitor data: ${error}`,
      success: false
    };
  }
}

async function handleConversionFunnel(args: any) {
  try {
    const source = args.source || 'all';
    const timeframe = args.timeframe || 'month';

    // Build filter for source
    const sourceFilter = source === 'all' ? {} : { source: { contains: source } };

    // Get leads data
    const totalLeads = await prisma.lead.count({ where: sourceFilter });
    
    const statusCounts = await prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
      where: sourceFilter
    });

    // Calculate funnel metrics
    const funnel = {
      source,
      timeframe,
      steps: [
        {
          stage: 'Visitors',
          count: 5000, // Mock visitor data
          rate: 100
        },
        {
          stage: 'Leads Generated',
          count: totalLeads,
          rate: (totalLeads / 5000 * 100).toFixed(1)
        },
        {
          stage: 'Contacted',
          count: statusCounts.find(s => s.status === 'CONTACTED')?._count.id || 0,
          rate: 0
        },
        {
          stage: 'Qualified',
          count: statusCounts.find(s => s.status === 'QUALIFIED')?._count.id || 0,
          rate: 0
        },
        {
          stage: 'Converted',
          count: statusCounts.find(s => s.status === 'CONVERTED')?._count.id || 0,
          rate: 0
        }
      ]
    };

    // Calculate rates for each step
    funnel.steps.forEach((step, index) => {
      if (index > 0) {
        const previousCount = funnel.steps[index - 1].count;
        step.rate = previousCount > 0 ? (step.count / previousCount * 100).toFixed(1) : '0';
      }
    });

    return {
      data: funnel,
      message: `Conversion funnel analysis for ${source} traffic`,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      message: `Error analyzing conversion funnel: ${error}`,
      success: false
    };
  }
}

async function handleBrowserStats(args: any) {
  try {
    const timeframe = args.timeframe || 'week';
    
    // Calculate date filter
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01'); // Far past date
        break;
    }

    // Get browser statistics
    const browserStats = await prisma.visitorTracking.groupBy({
      by: ['browser'],
      _count: { id: true },
      where: {
        timestamp: { gte: startDate },
        browser: { not: null },
        isBot: false
      },
      orderBy: { _count: { id: 'desc' } }
    });

    const totalVisitors = browserStats.reduce((sum, stat) => sum + stat._count.id, 0);
    
    const browserData = {
      timeframe,
      totalVisitors,
      browsers: browserStats.map(stat => ({
        browser: stat.browser || 'Unknown',
        users: stat._count.id,
        percentage: ((stat._count.id / totalVisitors) * 100).toFixed(1)
      }))
    };

    // Find Safari specifically
    const safariUsers = browserStats.find(s => s.browser?.toLowerCase().includes('safari'))?._count.id || 0;
    const safariPercentage = totalVisitors > 0 ? ((safariUsers / totalVisitors) * 100).toFixed(1) : '0';

    return {
      data: browserData,
      message: `📊 **Browser Usage Statistics (${timeframe})**

**Total Users Analyzed:** ${totalVisitors.toLocaleString()}

**Safari Users:** ${safariUsers.toLocaleString()} users (${safariPercentage}%) 🧭

**All Browsers:**
${browserData.browsers.map(b => `• **${b.browser}**: ${b.users.toLocaleString()} users (${b.percentage}%)`).join('\n')}

**Key Insights:**
${safariUsers > 0 ? `• Safari accounts for ${safariPercentage}% of your traffic` : '• No Safari users detected in this timeframe'}
• Top browser: ${browserData.browsers[0]?.browser || 'Unknown'} with ${browserData.browsers[0]?.percentage || '0'}%
• Browser diversity: ${browserData.browsers.length} different browsers detected`,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      message: `Error fetching browser statistics: ${error}`,
      success: false
    };
  }
}

async function handleDeviceStats(args: any) {
  try {
    const timeframe = args.timeframe || 'week';
    
    // Calculate date filter
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
    }

    // Get device statistics
    const deviceStats = await prisma.visitorTracking.groupBy({
      by: ['deviceType'],
      _count: { id: true },
      where: {
        timestamp: { gte: startDate },
        deviceType: { not: null },
        isBot: false
      },
      orderBy: { _count: { id: 'desc' } }
    });

    const totalUsers = deviceStats.reduce((sum, stat) => sum + stat._count.id, 0);
    
    const deviceData = {
      timeframe,
      totalUsers,
      devices: deviceStats.map(stat => ({
        device: stat.deviceType || 'Unknown',
        users: stat._count.id,
        percentage: ((stat._count.id / totalUsers) * 100).toFixed(1)
      }))
    };

    // Find mobile specifically
    const mobileUsers = deviceStats.find(s => s.deviceType?.toLowerCase().includes('mobile'))?._count.id || 0;
    const mobilePercentage = totalUsers > 0 ? ((mobileUsers / totalUsers) * 100).toFixed(1) : '0';

    const desktopUsers = deviceStats.find(s => s.deviceType?.toLowerCase().includes('desktop'))?._count.id || 0;
    const desktopPercentage = totalUsers > 0 ? ((desktopUsers / totalUsers) * 100).toFixed(1) : '0';

    return {
      data: deviceData,
      message: `📱 **Device Usage Statistics (${timeframe})**

**Total Users Analyzed:** ${totalUsers.toLocaleString()}

**Mobile Users:** ${mobileUsers.toLocaleString()} users (${mobilePercentage}%) 📱
**Desktop Users:** ${desktopUsers.toLocaleString()} users (${desktopPercentage}%) 💻

**All Device Types:**
${deviceData.devices.map(d => `• **${d.device}**: ${d.users.toLocaleString()} users (${d.percentage}%)`).join('\n')}

**Key Insights:**
${mobileUsers > 0 ? `• Mobile traffic accounts for ${mobilePercentage}% of users` : '• No mobile users detected in this timeframe'}
${desktopUsers > 0 ? `• Desktop traffic accounts for ${desktopPercentage}% of users` : '• No desktop users detected in this timeframe'}
• ${mobileUsers > desktopUsers ? 'Mobile-first audience' : 'Desktop-primary audience'}
• Total device types: ${deviceData.devices.length}`,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      message: `Error fetching device statistics: ${error}`,
      success: false
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get conversation history
    const history = aiService.getConversationHistory();
    
    return NextResponse.json({
      history,
      success: true
    });

  } catch (error) {
    console.error('Get AI Chat History Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get conversation history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear conversation history
    aiService.clearHistory();
    
    return NextResponse.json({
      message: 'Conversation history cleared',
      success: true
    });

  } catch (error) {
    console.error('Clear AI Chat History Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to clear conversation history' },
      { status: 500 }
    );
  }
}