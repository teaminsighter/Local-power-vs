/**
 * Client-side A/B Testing Integration
 * Production-ready script for visitor assignment and conversion tracking
 */

interface ABTestAssignment {
  visitorUserId: string;
  variant: 'A' | 'B';
  testId: string;
  isNewAssignment: boolean;
  landingPageContent?: any;
}

interface ConversionEvent {
  type: string;
  value?: number;
  metadata?: any;
}

class ABTestingClient {
  private visitorUserId: string;
  private currentAssignment: ABTestAssignment | null = null;
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.visitorUserId = this.getOrCreateVisitorId();
  }

  private getOrCreateVisitorId(): string {
    // Check localStorage first
    let visitorId = localStorage.getItem('visitor_user_id');
    
    if (!visitorId) {
      // Generate new visitor ID
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_user_id', visitorId);
    }
    
    return visitorId;
  }

  /**
   * Initialize A/B testing for current page
   */
  async initialize(currentUrl?: string): Promise<ABTestAssignment | null> {
    try {
      const url = currentUrl || window.location.pathname;
      
      const response = await fetch(`${this.baseUrl}/api/ab-testing/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorUserId: this.visitorUserId,
          currentUrl: url,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        this.currentAssignment = result.data;
        
        // Apply variant content if available
        if (this.currentAssignment?.landingPageContent) {
          this.applyVariantContent(this.currentAssignment.landingPageContent);
        }

        // Track the assignment
        this.trackPageView(url);

        return this.currentAssignment;
      }

      return null;
    } catch (error) {
      console.error('A/B testing initialization failed:', error);
      return null;
    }
  }

  /**
   * Apply variant content to the page
   */
  private applyVariantContent(content: any): void {
    try {
      if (!content) return;

      // Apply HTML changes
      if (content.html) {
        Object.entries(content.html).forEach(([selector, htmlContent]) => {
          const element = document.querySelector(selector as string);
          if (element) {
            element.innerHTML = htmlContent as string;
          }
        });
      }

      // Apply CSS changes
      if (content.css) {
        const style = document.createElement('style');
        style.textContent = content.css;
        document.head.appendChild(style);
      }

      // Apply text changes
      if (content.text) {
        Object.entries(content.text).forEach(([selector, textContent]) => {
          const element = document.querySelector(selector as string);
          if (element) {
            element.textContent = textContent as string;
          }
        });
      }

      // Apply attribute changes
      if (content.attributes) {
        Object.entries(content.attributes).forEach(([selector, attrs]) => {
          const element = document.querySelector(selector as string);
          if (element && attrs) {
            Object.entries(attrs as Record<string, string>).forEach(([attr, value]) => {
              element.setAttribute(attr, value);
            });
          }
        });
      }

      // Apply class changes
      if (content.classes) {
        Object.entries(content.classes).forEach(([selector, classes]) => {
          const element = document.querySelector(selector as string);
          if (element) {
            const classArray = Array.isArray(classes) ? classes : [classes];
            classArray.forEach(cls => element.classList.add(cls as string));
          }
        });
      }

    } catch (error) {
      console.error('Failed to apply variant content:', error);
    }
  }

  /**
   * Track conversion event
   */
  async trackConversion(event: ConversionEvent): Promise<boolean> {
    try {
      if (!this.currentAssignment) {
        console.warn('No A/B test assignment found for conversion tracking');
        return false;
      }

      const response = await fetch(`${this.baseUrl}/api/ab-testing/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorUserId: this.visitorUserId,
          testId: this.currentAssignment.testId,
          conversionValue: event.value,
          conversionType: event.type,
          metadata: {
            ...event.metadata,
            timestamp: new Date().toISOString(),
            variant: this.currentAssignment.variant,
            url: window.location.href
          }
        })
      });

      const result = await response.json();
      return result.success;

    } catch (error) {
      console.error('Conversion tracking failed:', error);
      return false;
    }
  }

  /**
   * Track page view for A/B test
   */
  private async trackPageView(url: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/track-visitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorUserId: this.visitorUserId,
          page: url,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId(),
          actions: [{
            type: 'ab_test_view',
            testId: this.currentAssignment?.testId,
            variant: this.currentAssignment?.variant,
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (error) {
      console.error('Page view tracking failed:', error);
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    
    return sessionId;
  }

  /**
   * Get current assignment info
   */
  getCurrentAssignment(): ABTestAssignment | null {
    return this.currentAssignment;
  }

  /**
   * Check if user is in specific variant
   */
  isVariant(variant: 'A' | 'B'): boolean {
    return this.currentAssignment?.variant === variant;
  }

  /**
   * Get visitor ID
   */
  getVisitorId(): string {
    return this.visitorUserId;
  }
}

// Global instance
let abTestingClient: ABTestingClient | null = null;

/**
 * Initialize A/B testing client
 */
export function initializeABTesting(baseUrl?: string): ABTestingClient {
  if (!abTestingClient) {
    abTestingClient = new ABTestingClient(baseUrl);
  }
  return abTestingClient;
}

/**
 * Get A/B testing client instance
 */
export function getABTestingClient(): ABTestingClient | null {
  return abTestingClient;
}

/**
 * Helper function for easy conversion tracking
 */
export async function trackConversion(
  type: string, 
  value?: number, 
  metadata?: any
): Promise<boolean> {
  if (!abTestingClient) {
    console.warn('A/B testing client not initialized');
    return false;
  }

  return abTestingClient.trackConversion({ type, value, metadata });
}

/**
 * Helper function to check variant
 */
export function isVariant(variant: 'A' | 'B'): boolean {
  return abTestingClient?.isVariant(variant) || false;
}

// Export types
export type { ABTestAssignment, ConversionEvent };