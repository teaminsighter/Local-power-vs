/**
 * Core Web Vitals Monitoring and Performance Analytics
 * Tracks LCP, FID, CLS, FCP, TTFB and other performance metrics
 */

'use client';

export interface WebVital {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay (deprecated, use INP)
  cls?: number; // Cumulative Layout Shift
  inp?: number; // Interaction to Next Paint
  
  // Other important metrics
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  loadTime?: number;
  renderTime?: number;
  resourceLoadTime?: number;
  
  // User experience metrics
  timeToInteractive?: number;
  totalBlockingTime?: number;
  
  // Metadata
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
}

/**
 * Core Web Vitals thresholds (Google recommended)
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
};

/**
 * Performance monitoring class
 */
export class CoreWebVitalsMonitor {
  private metrics: PerformanceMetrics = {
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  };

  private listeners: ((metric: WebVital) => void)[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.isInitialized) return;
    
    // Collect device and connection info
    this.collectDeviceInfo();
    
    // Initialize web vitals tracking
    this.initializeWebVitals();
    
    // Track custom performance metrics
    this.trackCustomMetrics();
    
    this.isInitialized = true;
  }

  private collectDeviceInfo(): void {
    if (typeof navigator !== 'undefined') {
      // Device memory
      if ('deviceMemory' in navigator) {
        this.metrics.deviceMemory = (navigator as any).deviceMemory;
      }

      // Connection type
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        this.metrics.connectionType = connection?.effectiveType || connection?.type;
      }
    }
  }

  private initializeWebVitals(): void {
    // Use dynamic import to load web-vitals library if available
    this.loadWebVitalsLibrary().then((webVitals) => {
      if (webVitals) {
        webVitals.onCLS(this.handleWebVital.bind(this));
        webVitals.onFCP(this.handleWebVital.bind(this));
        webVitals.onFID(this.handleWebVital.bind(this));
        webVitals.onLCP(this.handleWebVital.bind(this));
        webVitals.onTTFB(this.handleWebVital.bind(this));
        
        // INP if available (newer metric)
        if (webVitals.onINP) {
          webVitals.onINP(this.handleWebVital.bind(this));
        }
      } else {
        // Fallback to manual tracking
        this.trackWebVitalsManually();
      }
    });
  }

  private async loadWebVitalsLibrary(): Promise<any | null> {
    try {
      // Try to load web-vitals library if installed
      const webVitals = await import('web-vitals');
      return webVitals;
    } catch {
      console.warn('web-vitals library not found, using manual tracking');
      return null;
    }
  }

  private trackWebVitalsManually(): void {
    // Manual LCP tracking
    this.trackLCP();
    
    // Manual FCP tracking
    this.trackFCP();
    
    // Manual CLS tracking
    this.trackCLS();
    
    // Manual TTFB tracking
    this.trackTTFB();
    
    // Manual FID tracking (using first input event)
    this.trackFID();
  }

  private trackLCP(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry) {
            this.handleWebVital({
              id: this.generateId(),
              name: 'LCP',
              value: lastEntry.startTime,
              delta: lastEntry.startTime,
              rating: this.getRating('LCP', lastEntry.startTime),
              navigationType: this.getNavigationType()
            });
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP tracking failed:', error);
      }
    }
  }

  private trackFCP(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              this.handleWebVital({
                id: this.generateId(),
                name: 'FCP',
                value: entry.startTime,
                delta: entry.startTime,
                rating: this.getRating('FCP', entry.startTime),
                navigationType: this.getNavigationType()
              });
              break;
            }
          }
        });
        
        observer.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('FCP tracking failed:', error);
      }
    }
  }

  private trackCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries: any[] = [];

      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue && 
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                sessionEntries = [entry];
              }

              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                this.handleWebVital({
                  id: this.generateId(),
                  name: 'CLS',
                  value: clsValue,
                  delta: entry.value,
                  rating: this.getRating('CLS', clsValue),
                  navigationType: this.getNavigationType()
                });
              }
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS tracking failed:', error);
      }
    }
  }

  private trackTTFB(): void {
    if ('performance' in window && 'timing' in performance) {
      const { timing } = performance;
      const ttfb = timing.responseStart - timing.requestStart;
      
      this.handleWebVital({
        id: this.generateId(),
        name: 'TTFB',
        value: ttfb,
        delta: ttfb,
        rating: this.getRating('TTFB', ttfb),
        navigationType: this.getNavigationType()
      });
    }
  }

  private trackFID(): void {
    let isFirstInput = true;
    
    const handleFirstInput = (event: Event) => {
      if (!isFirstInput) return;
      isFirstInput = false;

      const eventTime = event.timeStamp;
      const startTime = performance.now();
      
      // Use requestIdleCallback to measure processing time
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const processingTime = performance.now() - startTime;
          this.handleWebVital({
            id: this.generateId(),
            name: 'FID',
            value: processingTime,
            delta: processingTime,
            rating: this.getRating('FID', processingTime),
            navigationType: this.getNavigationType()
          });
        });
      }
    };

    ['mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach(type => {
      document.addEventListener(type, handleFirstInput, { once: true, passive: true });
    });
  }

  private trackCustomMetrics(): void {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.metrics.loadTime = loadTime;
    });

    // Track Time to Interactive (TTI) approximation
    this.trackTimeToInteractive();
    
    // Track resource loading times
    this.trackResourceTiming();
  }

  private trackTimeToInteractive(): void {
    if ('PerformanceObserver' in window) {
      let lastLongTask = 0;
      
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            lastLongTask = Math.max(lastLongTask, entry.startTime + entry.duration);
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        
        // Estimate TTI as max of FCP + 5 seconds or last long task
        setTimeout(() => {
          const fcp = this.metrics.fcp || 0;
          const tti = Math.max(fcp + 5000, lastLongTask);
          this.metrics.timeToInteractive = tti;
        }, 10000); // Wait 10 seconds to get a good estimate
      } catch (error) {
        console.warn('TTI tracking failed:', error);
      }
    }
  }

  private trackResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const totalResourceTime = entries.reduce((sum, entry) => 
            sum + (entry.duration || 0), 0
          );
          this.metrics.resourceLoadTime = totalResourceTime;
        });
        
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource timing tracking failed:', error);
      }
    }
  }

  private handleWebVital(metric: WebVital): void {
    // Store metric in our metrics object
    switch (metric.name) {
      case 'LCP':
        this.metrics.lcp = metric.value;
        break;
      case 'FID':
        this.metrics.fid = metric.value;
        break;
      case 'CLS':
        this.metrics.cls = metric.value;
        break;
      case 'INP':
        this.metrics.inp = metric.value;
        break;
      case 'FCP':
        this.metrics.fcp = metric.value;
        break;
      case 'TTFB':
        this.metrics.ttfb = metric.value;
        break;
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(metric));
    
    // Send to analytics if configured
    this.sendToAnalytics(metric);
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private getNavigationType(): 'navigate' | 'reload' | 'back-forward' | 'prerender' {
    if ('performance' in window && 'navigation' in performance) {
      const nav = (performance as any).navigation;
      return nav.type || 'navigate';
    }
    return 'navigate';
  }

  private generateId(): string {
    return `v3-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendToAnalytics(metric: WebVital): void {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: {
          metric_rating: metric.rating,
          navigation_type: metric.navigationType
        }
      });
    }

    // Send to internal analytics API
    this.sendToInternalAnalytics(metric);
  }

  private async sendToInternalAnalytics(metric: WebVital): Promise<void> {
    try {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metric,
          url: this.metrics.url,
          userAgent: this.metrics.userAgent,
          deviceMemory: this.metrics.deviceMemory,
          connectionType: this.metrics.connectionType,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      // Fail silently to not affect user experience
      console.debug('Failed to send web vitals to analytics:', error);
    }
  }

  /**
   * Public API methods
   */
  onMetric(callback: (metric: WebVital) => void): void {
    this.listeners.push(callback);
  }

  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getPerformanceScore(): number {
    const { lcp, fid, cls, fcp, ttfb } = this.metrics;
    let score = 100;
    
    // Deduct points based on poor metrics
    if (lcp && lcp > THRESHOLDS.LCP.poor) score -= 30;
    else if (lcp && lcp > THRESHOLDS.LCP.good) score -= 15;
    
    if (fid && fid > THRESHOLDS.FID.poor) score -= 25;
    else if (fid && fid > THRESHOLDS.FID.good) score -= 10;
    
    if (cls && cls > THRESHOLDS.CLS.poor) score -= 25;
    else if (cls && cls > THRESHOLDS.CLS.good) score -= 10;
    
    if (fcp && fcp > THRESHOLDS.FCP.poor) score -= 10;
    else if (fcp && fcp > THRESHOLDS.FCP.good) score -= 5;
    
    if (ttfb && ttfb > THRESHOLDS.TTFB.poor) score -= 10;
    else if (ttfb && ttfb > THRESHOLDS.TTFB.good) score -= 5;
    
    return Math.max(0, score);
  }

  generateReport(): {
    score: number;
    metrics: PerformanceMetrics;
    recommendations: string[];
  } {
    const score = this.getPerformanceScore();
    const recommendations: string[] = [];
    
    // Generate recommendations based on metrics
    if (this.metrics.lcp && this.metrics.lcp > THRESHOLDS.LCP.good) {
      recommendations.push('Optimize Largest Contentful Paint by reducing image sizes and improving server response times');
    }
    
    if (this.metrics.fid && this.metrics.fid > THRESHOLDS.FID.good) {
      recommendations.push('Reduce First Input Delay by optimizing JavaScript execution and reducing main thread blocking');
    }
    
    if (this.metrics.cls && this.metrics.cls > THRESHOLDS.CLS.good) {
      recommendations.push('Minimize Cumulative Layout Shift by setting image dimensions and avoiding dynamic content insertion');
    }
    
    if (this.metrics.ttfb && this.metrics.ttfb > THRESHOLDS.TTFB.good) {
      recommendations.push('Improve Time to First Byte by optimizing server response times and using CDN');
    }

    return {
      score,
      metrics: this.getCurrentMetrics(),
      recommendations
    };
  }
}

// Singleton instance
export const webVitalsMonitor = new CoreWebVitalsMonitor();

export default CoreWebVitalsMonitor;