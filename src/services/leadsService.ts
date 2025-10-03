// CRM Service
// Handles lead storage, retrieval, and notifications

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  preferredContact: 'email' | 'phone' | 'both';
  bestTimeToCall: string;
  installationTimeframe: string;
  additionalNotes: string;
  marketingConsent: boolean;
  status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  systemDetails: {
    systemSize: number;
    estimatedCost: number;
    annualSavings: number;
    paybackPeriod: number;
    address: string;
    panelCount: number;
  };
  tags: string[];
  notes: LeadNote[];
}

export interface LeadNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  type: 'call' | 'email' | 'meeting' | 'note';
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  quoted: number;
  won: number;
  lost: number;
  conversionRate: number;
  averageDealSize: number;
  totalPipelineValue: number;
}

class LeadsService {
  private readonly STORAGE_KEY = 'solar_leads';
  private readonly STATS_KEY = 'leads_stats';

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get all leads
  getLeads(): Lead[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get leads:', error);
      return [];
    }
  }

  // Get lead by ID
  getLead(id: string): Lead | null {
    const leads = this.getLeads();
    return leads.find(lead => lead.id === id) || null;
  }

  // Create new lead
  async createLead(leadData: Omit<Lead, 'id' | 'status' | 'priority' | 'source' | 'createdAt' | 'updatedAt' | 'tags' | 'notes'>): Promise<Lead> {
    try {
      // Send to database API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save lead');
      }

      console.log('Lead saved to database successfully:', result.leadId);

      // Create lead object for local use (for notifications, etc.)
      const newLead: Lead = {
        ...leadData,
        id: result.leadId,
        status: 'new',
        priority: this.calculatePriority(leadData),
        source: 'Solar Calculator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: this.generateTags(leadData),
        notes: []
      };

      // Also save to localStorage as backup and for quick access
      const leads = this.getLeads();
      leads.unshift(newLead);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
      
      // Update stats
      this.updateStats();
      
      // Send notifications
      await this.sendNotifications(newLead);
      
      // Track conversion
      await this.trackConversion(newLead);
      
      return newLead;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw new Error('Failed to save lead information');
    }
  }

  // Update lead
  updateLead(id: string, updates: Partial<Lead>): boolean {
    const leads = this.getLeads();
    const leadIndex = leads.findIndex(lead => lead.id === id);
    
    if (leadIndex === -1) return false;

    leads[leadIndex] = {
      ...leads[leadIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
      this.updateStats();
      return true;
    } catch (error) {
      console.error('Failed to update lead:', error);
      return false;
    }
  }

  // Add note to lead
  addNote(leadId: string, note: Omit<LeadNote, 'id' | 'createdAt'>): boolean {
    const lead = this.getLead(leadId);
    if (!lead) return false;

    const newNote: LeadNote = {
      ...note,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    lead.notes.push(newNote);
    lead.updatedAt = new Date().toISOString();

    return this.updateLead(leadId, lead);
  }

  // Delete lead
  deleteLead(id: string): boolean {
    const leads = this.getLeads();
    const filteredLeads = leads.filter(lead => lead.id !== id);
    
    if (filteredLeads.length === leads.length) return false;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredLeads));
      this.updateStats();
      return true;
    } catch (error) {
      console.error('Failed to delete lead:', error);
      return false;
    }
  }

  // Get lead statistics
  getStats(): LeadStats {
    const leads = this.getLeads();
    
    const stats: LeadStats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      quoted: leads.filter(l => l.status === 'quoted').length,
      won: leads.filter(l => l.status === 'won').length,
      lost: leads.filter(l => l.status === 'lost').length,
      conversionRate: 0,
      averageDealSize: 0,
      totalPipelineValue: 0
    };

    // Calculate conversion rate
    const totalProcessed = stats.won + stats.lost;
    if (totalProcessed > 0) {
      stats.conversionRate = (stats.won / totalProcessed) * 100;
    }

    // Calculate average deal size
    const wonLeads = leads.filter(l => l.status === 'won');
    if (wonLeads.length > 0) {
      stats.averageDealSize = wonLeads.reduce((sum, lead) => sum + lead.systemDetails.estimatedCost, 0) / wonLeads.length;
    }

    // Calculate pipeline value
    const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status));
    stats.totalPipelineValue = activeLeads.reduce((sum, lead) => sum + lead.systemDetails.estimatedCost, 0);

    return stats;
  }

  // Search and filter leads
  searchLeads(query: string, filters?: {
    status?: Lead['status'][];
    priority?: Lead['priority'][];
    dateRange?: { start: string; end: string };
    assignedTo?: string;
  }): Lead[] {
    let leads = this.getLeads();

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      leads = leads.filter(lead =>
        lead.firstName.toLowerCase().includes(searchTerm) ||
        lead.lastName.toLowerCase().includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm) ||
        lead.phone.includes(searchTerm) ||
        lead.address.toLowerCase().includes(searchTerm) ||
        lead.additionalNotes.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        leads = leads.filter(lead => filters.status!.includes(lead.status));
      }

      if (filters.priority && filters.priority.length > 0) {
        leads = leads.filter(lead => filters.priority!.includes(lead.priority));
      }

      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        leads = leads.filter(lead => {
          const created = new Date(lead.createdAt);
          return created >= start && created <= end;
        });
      }

      if (filters.assignedTo) {
        leads = leads.filter(lead => lead.assignedTo === filters.assignedTo);
      }
    }

    return leads;
  }

  // Calculate lead priority based on system details and preferences
  private calculatePriority(leadData: Omit<Lead, 'id' | 'status' | 'priority' | 'source' | 'createdAt' | 'updatedAt' | 'tags' | 'notes'>): Lead['priority'] {
    let score = 0;

    // System size (higher = more priority)
    if (leadData.systemDetails.systemSize >= 10) score += 3;
    else if (leadData.systemDetails.systemSize >= 6) score += 2;
    else score += 1;

    // Installation timeframe (sooner = more priority)
    switch (leadData.installationTimeframe) {
      case 'immediate': score += 3; break;
      case '1-3-months': score += 2; break;
      case '3-6-months': score += 1; break;
      default: score += 0;
    }

    // Contact preference (phone = higher priority)
    if (leadData.preferredContact === 'phone' || leadData.preferredContact === 'both') {
      score += 1;
    }

    // Marketing consent (shows engagement)
    if (leadData.marketingConsent) score += 1;

    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  // Generate tags based on lead data
  private generateTags(leadData: Omit<Lead, 'id' | 'status' | 'priority' | 'source' | 'createdAt' | 'updatedAt' | 'tags' | 'notes'>): string[] {
    const tags: string[] = [];

    // System size tags
    if (leadData.systemDetails.systemSize >= 15) tags.push('Large System');
    else if (leadData.systemDetails.systemSize >= 8) tags.push('Medium System');
    else tags.push('Small System');

    // Timeframe tags
    if (leadData.installationTimeframe === 'immediate') tags.push('Hot Lead');
    else if (leadData.installationTimeframe === '1-3-months') tags.push('Warm Lead');
    
    // Budget tags
    if (leadData.systemDetails.estimatedCost >= 25000) tags.push('High Value');
    else if (leadData.systemDetails.estimatedCost >= 15000) tags.push('Medium Value');

    // Contact preference
    if (leadData.preferredContact === 'phone') tags.push('Phone Preferred');

    return tags;
  }

  // Update statistics
  private updateStats(): void {
    const stats = this.getStats();
    try {
      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  // Send notifications (email, SMS, etc.)
  private async sendNotifications(lead: Lead): Promise<void> {
    try {
      // Get admin settings for notifications
      const apiSettings = this.getAPISettings();
      
      // Send email notification to admin team
      if (apiSettings.email) {
        await this.sendEmailNotification(lead, apiSettings.email);
      }

      // Send SMS notification if configured
      if (apiSettings.twilio) {
        await this.sendSMSNotification(lead, apiSettings.twilio);
      }

      // Send lead data to CRM/webhook if configured
      if (apiSettings.webhooks) {
        await this.sendWebhookNotification(lead, apiSettings.webhooks);
      }

    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  }

  // Track conversion events
  private async trackConversion(lead: Lead): Promise<void> {
    try {
      const apiSettings = this.getAPISettings();

      // Google Analytics 4 conversion
      if (apiSettings.ga4 && typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', {
          event_category: 'Solar Calculator',
          event_label: 'Lead Capture',
          value: lead.systemDetails.estimatedCost,
          currency: 'EUR',
          custom_parameters: {
            system_size: lead.systemDetails.systemSize,
            lead_priority: lead.priority,
            installation_timeframe: lead.installationTimeframe
          }
        });
      }

      // Facebook Pixel conversion
      if (apiSettings.facebook && typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          value: lead.systemDetails.estimatedCost,
          currency: 'EUR',
          content_name: 'Solar Calculator Lead',
          content_category: 'Solar Installation',
          custom_data: {
            system_size: lead.systemDetails.systemSize,
            priority: lead.priority,
            timeframe: lead.installationTimeframe
          }
        });
      }

      // Google Ads conversion
      if (apiSettings.google_ads && typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
          send_to: 'AW-CONVERSION_ID/LABEL', // Replace with actual conversion ID
          value: lead.systemDetails.estimatedCost,
          currency: 'EUR'
        });
      }

    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }

  // Get API settings
  private getAPISettings(): any {
    try {
      const saved = localStorage.getItem('admin_api_settings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  // Mock email notification
  private async sendEmailNotification(lead: Lead, emailConfig: any): Promise<void> {
    // In production, this would integrate with your email service
    console.log('Email notification sent:', {
      to: emailConfig.from_email,
      subject: `New Solar Lead: ${lead.firstName} ${lead.lastName}`,
      lead: lead
    });
  }

  // Mock SMS notification
  private async sendSMSNotification(lead: Lead, twilioConfig: any): Promise<void> {
    // In production, this would integrate with Twilio
    console.log('SMS notification sent:', {
      to: twilioConfig.phone_number,
      message: `New solar lead: ${lead.firstName} ${lead.lastName} - ${lead.systemDetails.systemSize}kW system - ${lead.priority} priority`,
      lead: lead
    });
  }

  // Mock webhook notification
  private async sendWebhookNotification(lead: Lead, webhookConfig: any): Promise<void> {
    // In production, this would send to your CRM/webhook endpoint
    console.log('Webhook notification sent:', {
      webhook_url: webhookConfig.url,
      lead: lead
    });
  }
}

// Export singleton instance
export const leadsService = new LeadsService();
export default leadsService;