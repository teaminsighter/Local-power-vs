'use client';

import React, { useEffect, useState } from 'react';
import { webVitalsMonitor, WebVital, PerformanceMetrics } from '@/lib/performance/core-web-vitals';

interface PerformanceData {
  score: number;
  metrics: PerformanceMetrics;
  recommendations: string[];
}

interface MetricCardProps {
  name: string;
  value: number | undefined;
  unit: string;
  threshold: { good: number; poor: number };
  description: string;
}

function MetricCard({ name, value, unit, threshold, description }: MetricCardProps) {
  const getRating = (val: number | undefined): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
    if (val === undefined) return 'unknown';
    if (val <= threshold.good) return 'good';
    if (val <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const rating = getRating(value);
  
  const ratingColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    'needs-improvement': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    poor: 'text-red-600 bg-red-50 border-red-200',
    unknown: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  const formatValue = (val: number | undefined): string => {
    if (val === undefined) return 'Measuring...';
    if (unit === 'ms') return `${Math.round(val)}ms`;
    if (unit === 'score') return val.toFixed(3);
    return `${val}${unit}`;
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${ratingColors[rating]}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{name}</h3>
        <span className="text-xs uppercase font-bold">{rating.replace('-', ' ')}</span>
      </div>
      
      <div className="text-2xl font-bold mb-2">
        {formatValue(value)}
      </div>
      
      <p className="text-sm opacity-75 mb-2">{description}</p>
      
      <div className="text-xs">
        <span className="text-green-600">Good: ≤{threshold.good}{unit === 'score' ? '' : unit}</span>
        <span className="mx-2">|</span>
        <span className="text-red-600">Poor: >{threshold.poor}{unit === 'score' ? '' : unit}</span>
      </div>
    </div>
  );
}

export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<WebVital[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    const handleMetric = (metric: WebVital) => {
      setRecentMetrics(prev => [...prev.slice(-9), metric]);
      updatePerformanceData();
    };

    webVitalsMonitor.onMetric(handleMetric);
    
    // Update performance data initially and periodically
    updatePerformanceData();
    const interval = setInterval(updatePerformanceData, 5000);

    return () => clearInterval(interval);
  }, []);

  const updatePerformanceData = () => {
    const report = webVitalsMonitor.generateReport();
    setPerformanceData(report);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!performanceData) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-lg shadow-lg">
        <div className="text-sm">Initializing Performance Monitor...</div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Performance Score */}
      <div 
        className="fixed bottom-4 right-4 bg-white border-2 border-gray-200 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow z-50"
        onClick={toggleVisibility}
      >
        <div className="p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">Performance</span>
          </div>
          <div className="text-2xl font-bold text-center mt-1">
            {performanceData.score}
          </div>
          <div className="text-xs text-gray-500 text-center">
            Core Web Vitals
          </div>
        </div>
      </div>

      {/* Detailed Performance Dashboard */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Performance Dashboard</h2>
                  <p className="text-gray-600">Core Web Vitals and Performance Metrics</p>
                </div>
                <button
                  onClick={toggleVisibility}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Overall Score */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {performanceData.score}/100
                  </div>
                  <div className="text-lg text-gray-700">
                    Overall Performance Score
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Based on Core Web Vitals and Performance Metrics
                  </div>
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Core Web Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard
                    name="LCP"
                    value={performanceData.metrics.lcp}
                    unit="ms"
                    threshold={{ good: 2500, poor: 4000 }}
                    description="Largest Contentful Paint - loading performance"
                  />
                  <MetricCard
                    name="FID"
                    value={performanceData.metrics.fid}
                    unit="ms"
                    threshold={{ good: 100, poor: 300 }}
                    description="First Input Delay - interactivity"
                  />
                  <MetricCard
                    name="CLS"
                    value={performanceData.metrics.cls}
                    unit="score"
                    threshold={{ good: 0.1, poor: 0.25 }}
                    description="Cumulative Layout Shift - visual stability"
                  />
                </div>
              </div>

              {/* Other Metrics */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Additional Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard
                    name="FCP"
                    value={performanceData.metrics.fcp}
                    unit="ms"
                    threshold={{ good: 1800, poor: 3000 }}
                    description="First Contentful Paint - perceived loading"
                  />
                  <MetricCard
                    name="TTFB"
                    value={performanceData.metrics.ttfb}
                    unit="ms"
                    threshold={{ good: 800, poor: 1800 }}
                    description="Time to First Byte - server responsiveness"
                  />
                  <MetricCard
                    name="TTI"
                    value={performanceData.metrics.timeToInteractive}
                    unit="ms"
                    threshold={{ good: 3800, poor: 7300 }}
                    description="Time to Interactive - full interactivity"
                  />
                </div>
              </div>

              {/* Recent Metrics Log */}
              {recentMetrics.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Recent Measurements</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {recentMetrics.map((metric, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span className="font-medium">{metric.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            metric.rating === 'good' ? 'bg-green-100 text-green-800' :
                            metric.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(metric.value)}{metric.name === 'CLS' ? '' : 'ms'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {metric.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {performanceData.recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Optimization Recommendations</h3>
                  <div className="space-y-3">
                    {performanceData.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <p className="text-amber-800 text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Device Information */}
              <div className="text-xs text-gray-500 border-t pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <strong>URL:</strong> {performanceData.metrics.url.split('?')[0]}
                  </div>
                  <div>
                    <strong>Connection:</strong> {performanceData.metrics.connectionType || 'Unknown'}
                  </div>
                  <div>
                    <strong>Memory:</strong> {performanceData.metrics.deviceMemory ? `${performanceData.metrics.deviceMemory}GB` : 'Unknown'}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {new Date(performanceData.metrics.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PerformanceMonitor;