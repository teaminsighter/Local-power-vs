'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, MousePointer, Target } from 'lucide-react';

interface DailyPerformance {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: string;
  cpc: string;
  conversionRate: string;
}

interface MarketingChartProps {
  dailyData: DailyPerformance[];
  selectedMetric?: string;
}

const MarketingChart = ({ dailyData, selectedMetric = 'cost' }: MarketingChartProps) => {
  const [activeMetric, setActiveMetric] = useState(selectedMetric);

  const metrics = [
    { key: 'cost', label: 'Cost', icon: DollarSign, color: '#3B82F6', format: (val: number) => `€${val}` },
    { key: 'clicks', label: 'Clicks', icon: MousePointer, color: '#10B981', format: (val: number) => val.toString() },
    { key: 'conversions', label: 'Conversions', icon: Target, color: '#F59E0B', format: (val: number) => val.toString() },
    { key: 'impressions', label: 'Impressions', icon: TrendingUp, color: '#8B5CF6', format: (val: number) => val.toLocaleString() }
  ];

  const currentMetric = metrics.find(m => m.key === activeMetric) || metrics[0];
  
  // Get the values for the selected metric
  const values = dailyData.map(d => {
    switch (activeMetric) {
      case 'cost': return d.cost;
      case 'clicks': return d.clicks;
      case 'conversions': return d.conversions;
      case 'impressions': return d.impressions;
      default: return d.cost;
    }
  });

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  // Calculate trend
  const firstValue = values[0] || 0;
  const lastValue = values[values.length - 1] || 0;
  const trend = lastValue > firstValue ? 'up' : 'down';
  const trendPercent = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Performance Trend</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600">Last {dailyData.length} days</span>
            <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trendPercent).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        {/* Metric selector */}
        <div className="flex gap-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeMetric === metric.key
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {metric.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart area */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-3">
          <span>{currentMetric.format(maxValue)}</span>
          <span>{currentMetric.format((maxValue + minValue) / 2)}</span>
          <span>{currentMetric.format(minValue)}</span>
        </div>
        
        {/* Chart */}
        <div className="ml-12 h-full flex items-end justify-between gap-1">
          {dailyData.map((day, index) => {
            const value = values[index];
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center group cursor-pointer">
                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="w-full rounded-t-sm group-hover:opacity-80 transition-opacity relative"
                  style={{ backgroundColor: currentMetric.color, minHeight: '2px' }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div className="font-medium">{currentMetric.format(value)}</div>
                      <div className="text-gray-300">{new Date(day.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Date label */}
                <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-600">Total</div>
          <div className="font-semibold text-gray-900">
            {currentMetric.format(values.reduce((sum, val) => sum + val, 0))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Average</div>
          <div className="font-semibold text-gray-900">
            {currentMetric.format(values.reduce((sum, val) => sum + val, 0) / values.length)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Best Day</div>
          <div className="font-semibold text-gray-900">
            {currentMetric.format(maxValue)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Growth</div>
          <div className={`font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '+' : ''}{trendPercent.toFixed(1)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketingChart;