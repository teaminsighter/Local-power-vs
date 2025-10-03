// Analytics Service for Step Tracking
// Tracks user behavior through solar calculator steps

export interface StepAnalytics {
  stepNumber: number;
  stepName: string;
  entryTime: string;
  exitTime?: string;
  duration?: number;
  completed: boolean;
  data?: any;
  userId: string;
  sessionId: string;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  stepsCompleted: number;
  finalStep: number;
  converted: boolean;
  leadGenerated: boolean;
  userAgent: string;
  referrer: string;
  device: 'mobile' | 'tablet' | 'desktop';
}

export interface FunnelData {
  stepNumber: number;
  stepName: string;
  totalEntries: number;
  completions: number;
  dropOffs: number;
  conversionRate: number;
  averageDuration: number;
  popularChoices?: { [key: string]: number };
}

export interface AddressSearchData {
  searchQuery: string;
  selectedAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  userId: string;
  sessionId: string;
}

export interface AddressAnalytics {
  totalSearches: number;
  uniqueAddresses: number;
  popularQueries: { [key: string]: number };
  addressSelections: AddressSearchData[];
  geographicDistribution: { [region: string]: number };
}

class AnalyticsService {
  private steps = [
    { number: 1, name: 'Welcome', key: 'welcome' },
    { number: 2, name: 'State Selection', key: 'state' },
    { number: 3, name: 'Solution Selection', key: 'solution' },
    { number: 4, name: 'Address Input', key: 'address' },
    { number: 5, name: 'Map Analysis', key: 'map' },
    { number: 6, name: 'Panel Configuration', key: 'panels' },
    { number: 7, name: 'Lead Capture', key: 'lead' }
  ];

  // Generate unique session ID
  generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Generate user ID (could be enhanced with actual user tracking)
  generateUserId(): string {
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  // Detect device type
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Start new session
  startSession(): SessionData {
    const sessionData: SessionData = {
      sessionId: this.generateSessionId(),
      userId: this.generateUserId(),
      startTime: new Date().toISOString(),
      stepsCompleted: 0,
      finalStep: 1,
      converted: false,
      leadGenerated: false,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      device: this.getDeviceType()
    };

    localStorage.setItem('current_session', JSON.stringify(sessionData));
    return sessionData;
  }

  // Get current session
  getCurrentSession(): SessionData | null {
    const sessionData = localStorage.getItem('current_session');
    return sessionData ? JSON.parse(sessionData) : null;
  }

  // Track step entry
  trackStepEntry(stepNumber: number, data?: any): void {
    const session = this.getCurrentSession() || this.startSession();
    const step = this.steps.find(s => s.number === stepNumber);
    
    if (!step) return;

    const stepAnalytics: StepAnalytics = {
      stepNumber,
      stepName: step.name,
      entryTime: new Date().toISOString(),
      completed: false,
      data,
      userId: session.userId,
      sessionId: session.sessionId
    };

    // Store step data
    const stepKey = `step_${stepNumber}_${session.sessionId}`;
    localStorage.setItem(stepKey, JSON.stringify(stepAnalytics));

    // Update session
    session.finalStep = Math.max(session.finalStep, stepNumber);
    localStorage.setItem('current_session', JSON.stringify(session));

    // Store in analytics history
    this.addToAnalyticsHistory('step_entry', stepAnalytics);
  }

  // Track step completion
  trackStepCompletion(stepNumber: number, data?: any): void {
    const session = this.getCurrentSession();
    if (!session) return;

    const stepKey = `step_${stepNumber}_${session.sessionId}`;
    const stepData = localStorage.getItem(stepKey);
    
    if (stepData) {
      const stepAnalytics: StepAnalytics = JSON.parse(stepData);
      stepAnalytics.exitTime = new Date().toISOString();
      stepAnalytics.completed = true;
      stepAnalytics.data = { ...stepAnalytics.data, ...data };
      
      // Calculate duration
      const entryTime = new Date(stepAnalytics.entryTime).getTime();
      const exitTime = new Date(stepAnalytics.exitTime).getTime();
      stepAnalytics.duration = Math.round((exitTime - entryTime) / 1000); // in seconds

      localStorage.setItem(stepKey, JSON.stringify(stepAnalytics));

      // Update session completion count
      session.stepsCompleted = Math.max(session.stepsCompleted, stepNumber);
      localStorage.setItem('current_session', JSON.stringify(session));

      // Store in analytics history
      this.addToAnalyticsHistory('step_completion', stepAnalytics);
    }
  }

  // Track lead conversion
  trackConversion(leadData: any): void {
    const session = this.getCurrentSession();
    if (!session) return;

    session.converted = true;
    session.leadGenerated = true;
    session.endTime = new Date().toISOString();
    
    if (session.startTime) {
      const startTime = new Date(session.startTime).getTime();
      const endTime = new Date(session.endTime).getTime();
      session.totalDuration = Math.round((endTime - startTime) / 1000);
    }

    localStorage.setItem('current_session', JSON.stringify(session));
    this.addToAnalyticsHistory('conversion', { ...session, leadData });
  }

  // Add to analytics history
  private addToAnalyticsHistory(eventType: string, data: any): void {
    const history = this.getAnalyticsHistory();
    const event = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type: eventType,
      timestamp: new Date().toISOString(),
      data
    };

    history.push(event);
    
    // Keep only last 1000 events
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    localStorage.setItem('analytics_history', JSON.stringify(history));
  }

  // Get analytics history
  getAnalyticsHistory(): any[] {
    const history = localStorage.getItem('analytics_history');
    return history ? JSON.parse(history) : [];
  }

  // Generate funnel data
  getFunnelData(): FunnelData[] {
    const history = this.getAnalyticsHistory();
    const stepEntries = history.filter(e => e.type === 'step_entry');
    const stepCompletions = history.filter(e => e.type === 'step_completion');

    return this.steps.map(step => {
      const entries = stepEntries.filter(e => e.data.stepNumber === step.number);
      const completions = stepCompletions.filter(e => e.data.stepNumber === step.number);
      
      const totalEntries = entries.length;
      const totalCompletions = completions.length;
      const dropOffs = totalEntries - totalCompletions;
      const conversionRate = totalEntries > 0 ? (totalCompletions / totalEntries) * 100 : 0;
      
      // Calculate average duration
      const durationsMS = completions
        .map(c => c.data.duration)
        .filter(d => d && d > 0);
      const averageDuration = durationsMS.length > 0 
        ? durationsMS.reduce((a, b) => a + b, 0) / durationsMS.length 
        : 0;

      // Get popular choices for specific steps
      let popularChoices: { [key: string]: number } = {};
      if (step.number === 2) { // State selection
        popularChoices = this.getPopularChoices(completions, 'selectedState');
      } else if (step.number === 3) { // Solution selection
        popularChoices = this.getPopularChoices(completions, 'selectedSolution');
      } else if (step.number === 6) { // Panel configuration
        popularChoices = this.getPopularChoices(completions, 'panelCount');
      }

      return {
        stepNumber: step.number,
        stepName: step.name,
        totalEntries,
        completions: totalCompletions,
        dropOffs,
        conversionRate,
        averageDuration,
        popularChoices: Object.keys(popularChoices).length > 0 ? popularChoices : undefined
      };
    });
  }

  // Get popular choices for a specific field
  private getPopularChoices(completions: any[], field: string): { [key: string]: number } {
    const choices: { [key: string]: number } = {};
    
    completions.forEach(completion => {
      const value = completion.data?.data?.[field];
      if (value) {
        choices[value] = (choices[value] || 0) + 1;
      }
    });

    return choices;
  }

  // Get session statistics
  getSessionStats() {
    const history = this.getAnalyticsHistory();
    const sessions = history.filter(e => e.type === 'conversion' || e.type === 'step_entry')
      .reduce((acc, event) => {
        const sessionId = event.data.sessionId;
        if (!acc[sessionId]) {
          acc[sessionId] = event.data;
        }
        return acc;
      }, {} as { [key: string]: any });

    const sessionArray = Object.values(sessions);
    const totalSessions = sessionArray.length;
    const conversions = sessionArray.filter(s => s.converted).length;
    const conversionRate = totalSessions > 0 ? (conversions / totalSessions) * 100 : 0;

    const averageStepsCompleted = sessionArray.length > 0 
      ? sessionArray.reduce((sum, s) => sum + (s.stepsCompleted || 0), 0) / sessionArray.length 
      : 0;

    const deviceBreakdown = sessionArray.reduce((acc, s) => {
      acc[s.device] = (acc[s.device] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalSessions,
      conversions,
      conversionRate,
      averageStepsCompleted,
      deviceBreakdown
    };
  }

  // Track address search
  trackAddressSearch(searchQuery: string, selectedAddress: string, coordinates?: { lat: number; lng: number }): void {
    const session = this.getCurrentSession();
    if (!session) return;

    const addressData: AddressSearchData = {
      searchQuery,
      selectedAddress,
      coordinates,
      timestamp: new Date().toISOString(),
      userId: session.userId,
      sessionId: session.sessionId
    };

    this.addToAnalyticsHistory('address_search', addressData);
  }

  // Get address analytics
  getAddressAnalytics(): AddressAnalytics {
    const history = this.getAnalyticsHistory();
    const addressEvents = history.filter(e => e.type === 'address_search');
    
    const totalSearches = addressEvents.length;
    const uniqueAddresses = new Set(addressEvents.map(e => e.data.selectedAddress)).size;
    
    // Popular search queries
    const popularQueries = addressEvents.reduce((acc, event) => {
      const query = event.data.searchQuery?.toLowerCase() || '';
      if (query) {
        acc[query] = (acc[query] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    // Geographic distribution (simplified by state/city)
    const geographicDistribution = addressEvents.reduce((acc, event) => {
      const address = event.data.selectedAddress || '';
      // Extract state/region from address (simplified)
      const parts = address.split(',');
      const region = parts[parts.length - 2]?.trim() || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalSearches,
      uniqueAddresses,
      popularQueries,
      addressSelections: addressEvents.map(e => e.data),
      geographicDistribution
    };
  }

  // Clear analytics data (for testing)
  clearAnalytics(): void {
    localStorage.removeItem('analytics_history');
    localStorage.removeItem('current_session');
    localStorage.removeItem('analytics_user_id');
  }
}

export const analyticsService = new AnalyticsService();