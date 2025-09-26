// Webhook Service
// Handles sending lead data to configured webhook endpoints

export interface WebhookPayload {
  leadId: string;
  timestamp: string;
  source: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  systemDetails?: {
    systemSize: number;
    estimatedCost: number;
    annualSavings: number;
    paybackPeriod: number;
    panelCount: number;
    address: string;
    propertyType?: string;
    roofType?: string;
    monthlyBill?: number;
    usageKwh?: number;
  };
  preferences?: {
    contactPreference: 'phone' | 'email' | 'both';
    bestTimeToCall?: string;
    installationTimeframe?: string;
    marketingConsent?: boolean;
  };
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

export interface WebhookResult {
  webhook: Webhook;
  success: boolean;
  error?: string;
  responseTime?: number;
}

class WebhookService {
  private getActiveWebhooks(): Webhook[] {
    try {
      const webhooks = localStorage.getItem('webhooks');
      if (webhooks) {
        const parsed: Webhook[] = JSON.parse(webhooks);
        return parsed.filter(webhook => webhook.active);
      }
      return [];
    } catch (error) {
      console.error('Error loading webhooks:', error);
      return [];
    }
  }

  async sendToWebhook(webhook: Webhook, payload: WebhookPayload): Promise<WebhookResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LocalPower-SolarCalculator/1.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          webhook,
          success: true,
          responseTime
        };
      } else {
        return {
          webhook,
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        webhook,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };
    }
  }

  async sendToAllWebhooks(payload: WebhookPayload): Promise<WebhookResult[]> {
    const activeWebhooks = this.getActiveWebhooks();
    
    if (activeWebhooks.length === 0) {
      console.log('No active webhooks configured');
      return [];
    }

    console.log(`Sending lead data to ${activeWebhooks.length} webhook(s)`);

    // Send to all webhooks in parallel
    const promises = activeWebhooks.map(webhook => this.sendToWebhook(webhook, payload));
    const results = await Promise.all(promises);

    // Log results
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ Webhook "${result.webhook.name}" delivered successfully (${result.responseTime}ms)`);
      } else {
        console.error(`❌ Webhook "${result.webhook.name}" failed: ${result.error} (${result.responseTime}ms)`);
      }
    });

    return results;
  }

  // Helper method to create payload from lead capture data
  createPayloadFromLead(leadData: any): WebhookPayload {
    return {
      leadId: leadData.id || `lead_${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'solar_calculator',
      contact: {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone
      },
      systemDetails: leadData.systemDetails ? {
        systemSize: leadData.systemDetails.systemSize,
        estimatedCost: leadData.systemDetails.estimatedCost,
        annualSavings: leadData.systemDetails.annualSavings,
        paybackPeriod: leadData.systemDetails.paybackPeriod,
        panelCount: leadData.systemDetails.panelCount,
        address: leadData.systemDetails.address,
        propertyType: leadData.systemDetails.propertyType,
        roofType: leadData.systemDetails.roofType,
        monthlyBill: leadData.systemDetails.monthlyBill,
        usageKwh: leadData.systemDetails.usageKwh
      } : undefined,
      preferences: {
        contactPreference: leadData.contactPreference || 'email',
        bestTimeToCall: leadData.bestTimeToCall,
        installationTimeframe: leadData.installationTimeframe,
        marketingConsent: leadData.marketingConsent
      }
    };
  }

  // Test webhook endpoint
  async testWebhook(webhook: Webhook): Promise<WebhookResult> {
    const testPayload: WebhookPayload = {
      leadId: 'test_lead_' + Date.now(),
      timestamp: new Date().toISOString(),
      source: 'test',
      contact: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+1234567890'
      },
      systemDetails: {
        systemSize: 8.5,
        estimatedCost: 25500,
        annualSavings: 1840,
        paybackPeriod: 13.9,
        panelCount: 22,
        address: '123 Test Street, Test City, TS 12345'
      },
      preferences: {
        contactPreference: 'email',
        bestTimeToCall: 'morning',
        marketingConsent: true
      }
    };

    return this.sendToWebhook(webhook, testPayload);
  }
}

export const webhookService = new WebhookService();