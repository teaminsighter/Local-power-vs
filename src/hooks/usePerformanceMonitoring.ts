'use client';

import { useEffect, useState } from 'react';
import { webVitalsMonitor, WebVital, PerformanceMetrics } from '@/lib/performance/core-web-vitals';

export interface UsePerformanceMonitoringOptions {
  trackPageViews?: boolean;
  reportInterval?: number;
  enableConsoleReporting?: boolean;
}

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const {
    trackPageViews = true,
    reportInterval = 30000, // 30 seconds
    enableConsoleReporting = process.env.NODE_ENV === 'development'
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsTracking(true);

    // Handle new metric measurements
    const handleMetric = (metric: WebVital) => {
      if (enableConsoleReporting) {
        console.log(`📊 ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta
        });
      }

      // Update metrics and score
      const currentMetrics = webVitalsMonitor.getCurrentMetrics();
      const currentScore = webVitalsMonitor.getPerformanceScore();
      
      setMetrics(currentMetrics);
      setScore(currentScore);
    };

    // Subscribe to web vitals
    webVitalsMonitor.onMetric(handleMetric);

    // Set up periodic reporting
    const reportingInterval = setInterval(() => {
      const currentMetrics = webVitalsMonitor.getCurrentMetrics();
      const currentScore = webVitalsMonitor.getPerformanceScore();
      
      setMetrics(currentMetrics);
      setScore(currentScore);

      if (enableConsoleReporting) {
        const report = webVitalsMonitor.generateReport();
        console.log('📈 Performance Report:', report);
      }
    }, reportInterval);

    // Track page view if enabled
    if (trackPageViews) {
      trackPageView();
    }

    // Clean up
    return () => {
      clearInterval(reportingInterval);
      setIsTracking(false);
    };
  }, [trackPageViews, reportInterval, enableConsoleReporting]);

  const trackPageView = () => {
    // Send page view event for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: document.title,
        send_to: 'GA_MEASUREMENT_ID' // Replace with actual GA ID
      });
    }
  };

  const getReport = () => {
    return webVitalsMonitor.generateReport();
  };

  const resetMetrics = () => {
    // This would require extending the webVitalsMonitor to support reset
    setMetrics(null);
    setScore(0);
  };

  return {
    metrics,
    score,
    isTracking,
    getReport,
    resetMetrics,
    trackPageView
  };
}

export default usePerformanceMonitoring;