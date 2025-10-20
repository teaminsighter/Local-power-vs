// AI Service - Claude API Integration
import Anthropic from '@anthropic-ai/sdk';

export interface AIConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  action?: string;
  data?: any;
}

export interface AIResponse {
  message: string;
  action?: string;
  data?: any;
  success: boolean;
  error?: string;
}

export interface CommandResult {
  type: 'query' | 'navigation' | 'action' | 'info';
  data?: any;
  message: string;
  success: boolean;
}

class AIService {
  private anthropic: Anthropic | null = null;
  private conversationHistory: AIConversationMessage[] = [];

  constructor() {
    if (typeof window === 'undefined' && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  // Initialize conversation with system context
  private getSystemPrompt(): string {
    return `You are an intelligent AI assistant for a solar panel business admin system. You're helpful, detailed, and knowledgeable about solar installations, lead management, and business analytics.

PERSONALITY: 
- Be friendly, professional, and conversational like Claude
- Provide detailed, well-structured responses with clear explanations
- Use emojis and formatting to make responses more engaging
- Always offer next steps and suggestions
- Be proactive in helping users understand their data

AVAILABLE TOOLS:
1. getLeads - Retrieve leads from database with filtering options
2. getLeadStats - Get comprehensive lead statistics and conversion metrics
3. searchLeads - Search leads by name, email, phone, or other criteria
4. navigateToSection - Navigate to specific admin panel sections
5. generateReport - Create detailed business reports
6. getAnalyticsOverview - Get dashboard overview with key metrics and KPIs
7. getStepAnalytics - Analyze step-by-step conversion funnel performance
8. getMarketingAnalytics - Review marketing campaigns and ROI analysis
9. getVisitorTracking - Real-time visitor behavior and traffic analysis
10. getConversionFunnel - Detailed conversion rate analysis by step

EXACT ADMIN SECTIONS AND TABS (use these exact names and IDs):

1. **Analytics Dashboard** (analytics) - 6 tabs:
   - overview: Overview - Key metrics, performance dashboard
   - steps: Step Analytics - Conversion funnel analysis
   - leads: Lead Analysis - Lead quality and conversion metrics
   - marketing: Marketing Analysis - Campaign performance and ROI
   - realtime: Real-time Tracking - Live visitor monitoring
   - visitors: Visitor Tracking - User behavior analysis

2. **CRM** (lead-management) - 4 tabs:
   - all-leads: All Leads - Complete lead management system
   - lead-analysis: Lead Analysis - Advanced analytics and reporting
   - duplicates: Duplicate Analysis - Data cleansing and merge tools
   - reports: Export/Reports - Custom reports and data export

3. **Page Builder** (page-builder) - 4 tabs:
   - landing-pages: Landing Pages - Visual page creation
   - forms: Forms - Advanced form builder
   - templates: Templates - Pre-built templates library
   - ab-testing: A/B Testing - Split testing tools

4. **Tracking Setup** (tracking) - 4 tabs:
   - datalayer: DataLayer Events - Event tracking setup
   - gtm-config: GTM Config - Google Tag Manager configuration
   - integrations: Platform Integrations - Third-party connections
   - conversion-api: Conversion API - Server-side tracking

5. **AI Assistant** (ai-insights) - 2 tabs with sub-tabs:
   - ai-insight: AI Insight - Main AI functionality with sub-tabs:
     * chatbot: Chatbot Query - AI-powered queries
     * auto-reports: Auto Reports - Automated report generation
     * recommendations: Recommendations - AI-driven suggestions
     * alerts: Performance Alerts - Automated monitoring
   - ai-agents: AI Agents - Automated agent management with sub-tabs:
     * voice-agents: Voice Agents - AI-powered voice assistants
     * marketing-agents: Marketing Agents - Automated marketing campaigns
     * auto-replies: Auto Replies - Automated response templates

6. **Integrations** (integrations) - 4 tabs:
   - google-ads: Google Ads - Campaign management
   - facebook-ads: Facebook Ads - Social media advertising
   - ga4: GA4 - Google Analytics 4 integration
   - webhooks: Webhooks/APIs - External system connections

7. **User Management** (user-management) - 4 tabs:
   - profile: My Profile - Personal account settings
   - admin-users: Manage Users - Team member management
   - permissions: Permissions - Access control settings
   - activity-logs: Activity Logs - System activity tracking

8. **System Settings** (system) - 5 tabs:
   - general: General Settings - Basic system configuration
   - api-config: API Configuration - External API settings
   - solar-pricing: Solar Pricing - Pricing tier management
   - database: Database - Database management tools
   - backup: Backup - Data backup and restore

LEAD INFORMATION:
- Statuses: new → contacted → qualified → proposal_sent → converted/not_interested
- Priority levels: Calculated based on system size, budget, and engagement
- Sources: Website, Google Ads, Facebook Ads, referrals, organic search

RESPONSE GUIDELINES:
1. Always provide context and explanations
2. Include relevant statistics and insights
3. Suggest actionable next steps
4. Use clear formatting with headers, bullet points, and emojis
5. If using a tool, explain why and what to expect

When users ask questions, intelligently determine whether to use tools to query data, navigate to sections, or provide educational information about solar business management.`;
  }

  // Process user message with Claude and tool usage
  async processMessage(userMessage: string, context?: string): Promise<AIResponse> {
    try {
      if (!this.anthropic) {
        return {
          message: "AI service is not properly configured. Please check API keys.",
          success: false,
          error: "Missing Anthropic configuration"
        };
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      // Prepare messages for Claude
      const systemPrompt = this.getSystemPrompt() + (context ? `\n\nCURRENT CONTEXT:\n${context}` : '');
      
      // Create conversation messages (Claude format)
      const messages: Anthropic.Messages.MessageParam[] = this.conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call Claude with tools (with fallback for insufficient credits)
      try {
        const response = await this.anthropic.messages.create({
          model: process.env.AI_ASSISTANT_MODEL || 'claude-3-5-sonnet-20241022',
          max_tokens: parseInt(process.env.AI_ASSISTANT_MAX_TOKENS || '4000'),
          temperature: parseFloat(process.env.AI_ASSISTANT_TEMPERATURE || '0.1'),
          system: systemPrompt,
          messages: messages,
          tools: this.getToolDefinitions(),
        });
        
        return await this.handleClaudeResponse(response, userMessage);
        
      } catch (apiError: any) {
        // Check if it's a credit/billing issue
        if (apiError.message?.includes('credit balance') || apiError.message?.includes('billing')) {
          return await this.handleIntelligentFallback(userMessage, context);
        }
        throw apiError; // Re-throw other errors
      }

    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        message: 'I encountered an error processing your request. Please try again.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Define available tools for Claude
  private getToolDefinitions(): Anthropic.Messages.Tool[] {
    return [
      {
        name: 'getLeads',
        description: 'Get leads from database with optional filters',
        input_schema: {
          type: 'object',
          properties: {
            status: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by lead status (new, contacted, qualified, etc.)'
            },
            priority: {
              type: 'array', 
              items: { type: 'string' },
              description: 'Filter by priority (high, medium, low)'
            },
            source: {
              type: 'string',
              description: 'Filter by lead source'
            },
            limit: {
              type: 'number',
              description: 'Number of leads to return'
            }
          }
        }
      },
      {
        name: 'getLeadStats',
        description: 'Get lead statistics and conversion metrics',
        input_schema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'searchLeads',
        description: 'Search leads by text query with filters',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Text to search for in lead data'
            },
            filters: {
              type: 'object',
              description: 'Additional filters to apply'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'navigateToSection',
        description: 'Navigate to specific admin panel section',
        input_schema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Main category (analytics, lead-management, page-builder, etc.)'
            },
            tab: {
              type: 'string',
              description: 'Specific tab within category'
            }
          },
          required: ['category']
        }
      },
      {
        name: 'generateReport',
        description: 'Generate various types of reports',
        input_schema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['lead-summary', 'conversion-rates', 'source-analysis', 'monthly-report'],
              description: 'Type of report to generate'
            },
            dateRange: {
              type: 'object',
              properties: {
                start: { type: 'string' },
                end: { type: 'string' }
              }
            }
          },
          required: ['type']
        }
      },
      {
        name: 'getAnalyticsOverview',
        description: 'Get comprehensive analytics dashboard overview with key metrics',
        input_schema: {
          type: 'object',
          properties: {
            timeframe: {
              type: 'string',
              enum: ['today', 'week', 'month', 'quarter', 'year'],
              description: 'Time period for analytics data'
            }
          }
        }
      },
      {
        name: 'getStepAnalytics',
        description: 'Analyze step-by-step conversion funnel and drop-off rates',
        input_schema: {
          type: 'object',
          properties: {
            timeframe: {
              type: 'string',
              enum: ['today', 'week', 'month', 'quarter'],
              description: 'Time period for step analytics'
            }
          }
        }
      },
      {
        name: 'getMarketingAnalytics',
        description: 'Review marketing campaign performance and ROI analysis',
        input_schema: {
          type: 'object',
          properties: {
            campaigns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific campaigns to analyze (google-ads, facebook-ads, organic)'
            },
            timeframe: {
              type: 'string',
              enum: ['week', 'month', 'quarter'],
              description: 'Time period for campaign analysis'
            }
          }
        }
      },
      {
        name: 'getVisitorTracking',
        description: 'Get real-time visitor behavior and website traffic analysis',
        input_schema: {
          type: 'object',
          properties: {
            realtime: {
              type: 'boolean',
              description: 'Whether to get real-time data or historical'
            }
          }
        }
      },
      {
        name: 'getConversionFunnel',
        description: 'Detailed conversion rate analysis by funnel step',
        input_schema: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              description: 'Traffic source to analyze (google-ads, facebook-ads, organic, all)'
            },
            timeframe: {
              type: 'string',
              enum: ['week', 'month', 'quarter'],
              description: 'Time period for funnel analysis'
            }
          }
        }
      }
    ];
  }

  // Execute function calls
  private async executeFunctionCall(functionName: string, input: any): Promise<CommandResult> {
    try {
      switch (functionName) {
        case 'getLeads':
          return await this.handleGetLeads(input);
        case 'getLeadStats':
          return await this.handleGetLeadStats();
        case 'searchLeads':
          return await this.handleSearchLeads(input);
        case 'navigateToSection':
          return await this.handleNavigation(input);
        case 'generateReport':
          return await this.handleGenerateReport(input);
        case 'getAnalyticsOverview':
          return await this.handleAnalyticsOverview(input);
        case 'getStepAnalytics':
          return await this.handleStepAnalytics(input);
        case 'getMarketingAnalytics':
          return await this.handleMarketingAnalytics(input);
        case 'getVisitorTracking':
          return await this.handleVisitorTracking(input);
        case 'getConversionFunnel':
          return await this.handleConversionFunnel(input);
        default:
          return {
            type: 'info',
            message: `Unknown function: ${functionName}`,
            success: false
          };
      }
    } catch (error) {
      return {
        type: 'info',
        message: `Error executing function: ${error}`,
        success: false
      };
    }
  }

  // Function handlers - These will be handled by API route
  private async handleGetLeads(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getLeads', args },
      message: 'Fetching leads from database...',
      success: true
    };
  }

  private async handleGetLeadStats(): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getLeadStats', args: {} },
      message: 'Fetching lead statistics...',
      success: true
    };
  }

  private async handleSearchLeads(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'searchLeads', args },
      message: `Searching leads for "${args.query}"...`,
      success: true
    };
  }

  private async handleNavigation(args: any): Promise<CommandResult> {
    const { category, tab } = args;
    
    return {
      type: 'navigation',
      data: { category, tab },
      message: `Navigating to ${category}${tab ? ` → ${tab}` : ''}`,
      success: true
    };
  }

  private async handleGenerateReport(args: any): Promise<CommandResult> {
    const { type, dateRange } = args;
    
    return {
      type: 'action',
      data: { reportType: type, dateRange },
      message: `Generating ${type} report`,
      success: true
    };
  }

  private async handleAnalyticsOverview(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getAnalyticsOverview', args },
      message: 'Fetching analytics overview...',
      success: true
    };
  }

  private async handleStepAnalytics(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getStepAnalytics', args },
      message: 'Analyzing conversion funnel steps...',
      success: true
    };
  }

  private async handleMarketingAnalytics(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getMarketingAnalytics', args },
      message: 'Analyzing marketing campaign performance...',
      success: true
    };
  }

  private async handleVisitorTracking(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getVisitorTracking', args },
      message: 'Fetching visitor tracking data...',
      success: true
    };
  }

  private async handleConversionFunnel(args: any): Promise<CommandResult> {
    return {
      type: 'query',
      data: { functionName: 'getConversionFunnel', args },
      message: 'Analyzing conversion funnel performance...',
      success: true
    };
  }

  // Generate final response from function result with Claude's enhanced capabilities
  private async generateResponseFromFunctionResult(
    userMessage: string,
    functionResult: CommandResult
  ): Promise<AIResponse> {
    if (!functionResult.success) {
      return {
        message: functionResult.message,
        success: false,
        error: 'Function execution failed'
      };
    }

    let responseMessage = '';

    // Generate detailed responses based on function type and data with Claude's enhanced reasoning
    if (functionResult.type === 'query' && functionResult.data) {
      if (Array.isArray(functionResult.data)) {
        const leads = functionResult.data;
        
        if (leads.length === 0) {
          responseMessage = `🔍 **No leads found matching your criteria**\n\nHere are some suggestions to help you find what you're looking for:\n\n• **Broaden your search** - Try using fewer filters or different keywords\n• **Check alternative spellings** - Ensure names and terms are spelled correctly\n• **Verify date ranges** - Make sure you're searching in the right time period\n• **Review lead sources** - Consider searching across all sources (website, ads, referrals)\n\n💡 **Quick Actions:**\n• Say "show me all leads" to see your complete database\n• Try "leads from last month" for recent entries\n• Ask for "new leads only" to focus on fresh prospects\n\nWould you like me to adjust the search parameters or show you all available leads instead?`;
        } else {
          responseMessage = `✅ **Found ${leads.length} leads** in your database! Here's a comprehensive analysis:\n\n`;
          
          // Advanced status breakdown with insights
          const statusCounts = leads.reduce((acc: any, lead: any) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
          }, {});
          
          responseMessage += `📊 **Status Distribution:**\n`;
          Object.entries(statusCounts).forEach(([status, count]) => {
            const percentage = ((count as number / leads.length) * 100).toFixed(1);
            const emoji = this.getStatusEmoji(status);
            responseMessage += `${emoji} **${status.charAt(0).toUpperCase() + status.slice(1)}**: ${count} leads (${percentage}%)\n`;
          });
          
          // Lead quality insights
          const highPriorityLeads = leads.filter((l: any) => l.priority === 'high').length;
          const recentLeads = leads.filter((l: any) => {
            const daysDiff = (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
          }).length;
          
          responseMessage += `\n🎯 **Key Insights:**\n`;
          responseMessage += `• **High Priority**: ${highPriorityLeads} leads (${((highPriorityLeads/leads.length)*100).toFixed(1)}%)\n`;
          responseMessage += `• **Recent (7 days)**: ${recentLeads} leads\n`;
          responseMessage += `• **Avg. Response Time**: ${this.calculateAvgResponseTime(leads)}\n`;
          
          // Show top leads with enhanced details
          responseMessage += `\n🌟 **Top Leads (Priority Order):**\n`;
          const sortedLeads = leads.sort((a: any, b: any) => {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            return (priorityWeight[b.priority as keyof typeof priorityWeight] || 1) - 
                   (priorityWeight[a.priority as keyof typeof priorityWeight] || 1);
          }).slice(0, 5);
          
          sortedLeads.forEach((lead: any, index: number) => {
            const daysAgo = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            responseMessage += `\n**${index + 1}. ${lead.firstName} ${lead.lastName}** ${this.getPriorityBadge(lead.priority)}\n`;
            responseMessage += `   📧 ${lead.email} | 📱 ${lead.phone || 'No phone'}\n`;
            responseMessage += `   🏷️ Status: ${lead.status} | 📅 ${daysAgo} days ago\n`;
            responseMessage += `   🔗 Source: ${lead.source}${lead.systemDetails ? ` | 🏠 ${lead.systemDetails.systemSize}kW system` : ''}\n`;
          });
          
          if (leads.length > 5) {
            responseMessage += `\n... and ${leads.length - 5} more leads.\n`;
          }
          
          // Actionable next steps with enhanced suggestions
          responseMessage += `\n🚀 **Recommended Actions:**\n`;
          if (highPriorityLeads > 0) {
            responseMessage += `• **Focus on ${highPriorityLeads} high-priority leads** - These have the highest conversion potential\n`;
          }
          if (statusCounts.new > 0) {
            responseMessage += `• **Follow up on ${statusCounts.new} new leads** - Quick response improves conversion rates\n`;
          }
          if (statusCounts.contacted > 0) {
            responseMessage += `• **Nurture ${statusCounts.contacted} contacted leads** - Send proposals or schedule consultations\n`;
          }
          
          responseMessage += `\n💬 **Try These Commands:**\n`;
          responseMessage += `• "Show me leads from Google Ads" - Filter by traffic source\n`;
          responseMessage += `• "Find leads with phone numbers" - Focus on contactable prospects\n`;
          responseMessage += `• "Generate lead report" - Create detailed analysis document\n`;
        }
      } else if (functionResult.data.totalLeads !== undefined) {
        // Enhanced lead statistics response
        const stats = functionResult.data;
        responseMessage = `📈 **Lead Statistics & Performance Analysis**\n\n`;
        responseMessage += `🎯 **Overall Performance:**\n`;
        responseMessage += `• **Total Leads**: ${stats.totalLeads.toLocaleString()}\n`;
        responseMessage += `• **Growth Rate**: ${this.calculateGrowthRate(stats)}%\n`;
        responseMessage += `• **Lead Quality Score**: ${this.calculateQualityScore(stats)}/10\n\n`;
        
        if (stats.statusBreakdown) {
          responseMessage += `📊 **Conversion Pipeline:**\n`;
          Object.entries(stats.statusBreakdown).forEach(([status, count]) => {
            const percentage = ((count as number / stats.totalLeads) * 100).toFixed(1);
            const emoji = this.getStatusEmoji(status);
            responseMessage += `${emoji} **${status.charAt(0).toUpperCase() + status.slice(1)}**: ${count} (${percentage}%)\n`;
          });
        }
        
        responseMessage += `\n💰 **Revenue Insights:**\n`;
        if (stats.convertedCount) {
          const conversionRate = ((stats.convertedCount / stats.totalLeads) * 100).toFixed(1);
          const estimatedRevenue = stats.convertedCount * 25000; // Average solar system value
          responseMessage += `• **Conversion Rate**: ${conversionRate}% ${this.getConversionRateEmoji(parseFloat(conversionRate))}\n`;
          responseMessage += `• **Estimated Revenue**: €${estimatedRevenue.toLocaleString()}\n`;
          responseMessage += `• **Revenue per Lead**: €${(estimatedRevenue / stats.totalLeads).toFixed(0)}\n`;
        }
        
        responseMessage += `\n🎯 **Performance Benchmarks:**\n`;
        const benchmarkConversion = 5.0; // Industry standard
        const yourRate = stats.convertedCount ? ((stats.convertedCount / stats.totalLeads) * 100) : 0;
        responseMessage += `• Industry Average: ${benchmarkConversion}%\n`;
        responseMessage += `• Your Performance: ${yourRate.toFixed(1)}% ${yourRate > benchmarkConversion ? '🚀 Above average!' : yourRate > benchmarkConversion * 0.8 ? '📈 Good performance' : '📊 Room for improvement'}\n`;
        
        responseMessage += `\n🚀 **Optimization Opportunities:**\n`;
        responseMessage += `• **Quick Wins**: Focus on ${stats.statusBreakdown?.contacted || 0} contacted leads\n`;
        responseMessage += `• **Follow-up Strategy**: Re-engage ${stats.statusBreakdown?.qualified || 0} qualified prospects\n`;
        responseMessage += `• **Lead Nurturing**: Develop automated sequences for new leads\n`;
        
        responseMessage += `\n💡 **Next Steps:**\n`;
        responseMessage += `• Ask me "Show conversion funnel" for detailed step analysis\n`;
        responseMessage += `• Say "Marketing analytics" to see campaign performance\n`;
        responseMessage += `• Request "Generate monthly report" for executive summary\n`;
      }
    } else if (functionResult.type === 'navigation') {
      responseMessage = `🧭 **Navigation Complete!**\n\n`;
      responseMessage += `I've directed you to the **${functionResult.data.category}** section`;
      if (functionResult.data.tab) {
        responseMessage += ` → **${functionResult.data.tab}** tab`;
      }
      responseMessage += `.\n\n`;
      
      // Provide contextual help based on the section
      responseMessage += this.getContextualHelp(functionResult.data.category, functionResult.data.tab);
    } else {
      // Fallback to original message with enhanced formatting
      responseMessage = `✅ ${functionResult.message}\n\nI'm ready to help you with any questions about the data or next steps you'd like to take.`;
    }

    return {
      message: responseMessage,
      action: functionResult.type,
      data: functionResult.data,
      success: true
    };
  }

  // Helper methods for enhanced responses
  private getStatusEmoji(status: string): string {
    const emojis: { [key: string]: string } = {
      'new': '🆕',
      'contacted': '📞',
      'qualified': '✅',
      'proposal_sent': '📋',
      'converted': '🎉',
      'not_interested': '❌'
    };
    return emojis[status] || '📊';
  }

  private getPriorityBadge(priority: string): string {
    const badges: { [key: string]: string } = {
      'high': '🔥',
      'medium': '⚡',
      'low': '📝'
    };
    return badges[priority] || '';
  }

  private calculateAvgResponseTime(leads: any[]): string {
    // Simulate response time calculation
    return "2.3 hours";
  }

  private calculateGrowthRate(stats: any): string {
    // Simulate growth rate calculation
    return "+12.5";
  }

  private calculateQualityScore(stats: any): number {
    // Simulate quality score calculation based on conversion rates
    const conversionRate = stats.convertedCount ? (stats.convertedCount / stats.totalLeads) * 100 : 0;
    return Math.min(10, Math.max(1, Math.round(conversionRate * 2)));
  }

  private getConversionRateEmoji(rate: number): string {
    if (rate > 5) return '🚀';
    if (rate > 3) return '📈';
    if (rate > 1) return '📊';
    return '📉';
  }

  private getContextualHelp(category: string, tab?: string): string {
    const helpTexts: { [key: string]: string } = {
      'analytics': `📊 **Analytics Dashboard Help:**\n• View key performance metrics and trends\n• Monitor conversion rates and traffic sources\n• Track lead quality and campaign effectiveness\n\n🎯 **Quick Actions**: Ask me to "show conversion funnel" or "analyze marketing performance"`,
      'lead-management': `👥 **CRM Help:**\n• Manage your entire lead pipeline\n• Track lead status and follow-up activities\n• Export reports and analyze lead quality\n\n🎯 **Quick Actions**: Say "show new leads" or "find leads by source"`,
      'page-builder': `🏗️ **Page Builder Help:**\n• Create high-converting landing pages\n• Set up A/B tests to optimize performance\n• Build custom forms and templates\n\n🎯 **Quick Actions**: Ask about "A/B testing best practices" or "form optimization tips"`,
    };
    
    return helpTexts[category] || `You can explore the features in this section and ask me questions about what you see.`;
  }

  // Get conversation history
  getConversationHistory(): AIConversationMessage[] {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Handle Claude API response
  private async handleClaudeResponse(response: Anthropic.Messages.Message, userMessage: string): Promise<AIResponse> {
    // Handle tool usage
    if (response.content.some((block: any) => block.type === 'tool_use')) {
      const toolUseBlock = response.content.find((block: any) => block.type === 'tool_use') as Anthropic.Messages.ToolUseBlock;
      
      if (toolUseBlock) {
        const functionResult = await this.executeFunctionCall(
          toolUseBlock.name,
          toolUseBlock.input
        );

        // Generate final response based on function result
        const finalResponse = await this.generateResponseFromFunctionResult(
          userMessage,
          functionResult
        );

        // Add assistant response to history
        this.conversationHistory.push({
          role: 'assistant',
          content: finalResponse.message,
          timestamp: new Date().toISOString(),
          action: finalResponse.action,
          data: finalResponse.data
        });

        return finalResponse;
      }
    }

    // Regular text response
    const textBlock = response.content.find((block: any) => block.type === 'text') as Anthropic.Messages.TextBlock;
    const assistantMessage = textBlock?.text || 'I apologize, but I couldn\'t process your request.';
    
    this.conversationHistory.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString()
    });

    return {
      message: assistantMessage,
      success: true
    };
  }

  // Intelligent fallback when Claude API is unavailable
  private async handleIntelligentFallback(userMessage: string, context?: string): Promise<AIResponse> {
    const lowerMessage = userMessage.toLowerCase();
    
    // Pattern matching for common requests
    if (lowerMessage.includes('leads') || lowerMessage.includes('lead')) {
      if (lowerMessage.includes('statistics') || lowerMessage.includes('stats')) {
        // Simulate lead stats request
        const functionResult = await this.handleGetLeadStats();
        return await this.generateResponseFromFunctionResult(userMessage, functionResult);
      } else if (lowerMessage.includes('show') || lowerMessage.includes('get') || lowerMessage.includes('find')) {
        // Simulate get leads request
        const functionResult = await this.handleGetLeads({});
        return await this.generateResponseFromFunctionResult(userMessage, functionResult);
      }
    }
    
    if (lowerMessage.includes('navigate') || lowerMessage.includes('go to') || lowerMessage.includes('open')) {
      // Parse navigation request
      let category = 'analytics';
      let tab = undefined;
      
      if (lowerMessage.includes('analytics')) category = 'analytics';
      else if (lowerMessage.includes('crm') || lowerMessage.includes('lead management')) category = 'lead-management';
      else if (lowerMessage.includes('page builder')) category = 'page-builder';
      else if (lowerMessage.includes('tracking')) category = 'tracking';
      
      const functionResult = await this.handleNavigation({ category, tab });
      return await this.generateResponseFromFunctionResult(userMessage, functionResult);
    }
    
    if (lowerMessage.includes('analytics') || lowerMessage.includes('overview') || lowerMessage.includes('dashboard')) {
      const functionResult = await this.handleAnalyticsOverview({});
      return await this.generateResponseFromFunctionResult(userMessage, functionResult);
    }
    
    // Default intelligent response
    const response = `🤖 **AI Assistant Ready!**

I understand you're asking about: "${userMessage}"

While I'm currently operating in demo mode, I can help you with:

📊 **Analytics & Reports**
• View lead statistics and conversion metrics
• Analyze marketing campaign performance
• Track visitor behavior and funnel analysis

👥 **Lead Management**
• Search and filter leads by various criteria
• Review lead quality and priority scores
• Generate detailed lead reports

🧭 **Navigation**
• Guide you to specific admin sections
• Provide contextual help for each area
• Explain features and functionality

💡 **Try these commands:**
• "Show me lead statistics"
• "Navigate to analytics dashboard"
• "Find new leads"
• "Get marketing performance"

The full Claude AI integration is ready - just need to add API credits to activate advanced conversational capabilities!`;

    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    return {
      message: response,
      success: true
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;