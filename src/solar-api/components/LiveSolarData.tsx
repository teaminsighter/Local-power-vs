'use client';

import { motion } from 'framer-motion';
import { Zap, TrendingUp, Leaf, Euro, Home, Clock } from 'lucide-react';
import { LivePanelCalculation } from '../types/building-insights';

interface LiveSolarDataProps {
  data: LivePanelCalculation;
  isLoading?: boolean;
}

const LiveSolarData = ({ data, isLoading = false }: LiveSolarDataProps) => {
  const metrics = [
    {
      icon: Zap,
      label: 'Annual Energy',
      value: data.annualEnergyKwh.toLocaleString(),
      unit: 'kWh',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Euro,
      label: 'Monthly Savings',
      value: `€${data.monthlySavingsEur}`,
      unit: '/month',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      label: 'System Size',
      value: data.systemSizeKw.toString(),
      unit: 'kW',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Home,
      label: 'Roof Coverage',
      value: data.roofCoveragePercent.toString(),
      unit: '%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Leaf,
      label: 'CO₂ Offset',
      value: data.co2OffsetKgPerYear.toLocaleString(),
      unit: 'kg/year',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const annualSavings = data.monthlySavingsEur * 12;
  const estimatedCost = data.systemSizeKw * 1500; // €1500 per kW estimate
  const paybackYears = estimatedCost > 0 ? Math.round((estimatedCost / annualSavings) * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                  <IconComponent size={20} className={metric.color} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 font-medium">{metric.label}</div>
                  {isLoading ? (
                    <div className="h-6 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-gray-800">{metric.value}</span>
                      <span className="text-sm text-gray-500">{metric.unit}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Financial Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock size={18} className="text-primary" />
          <h3 className="font-semibold text-primary">Financial Overview</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-white/50 rounded animate-pulse" />
            <div className="h-4 bg-white/50 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-white/50 rounded animate-pulse w-1/2" />
          </div>
        ) : data.annualEnergyKwh > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Annual Savings:</span>
              <span className="font-medium text-gray-800">€{annualSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Est. System Cost:</span>
              <span className="font-medium text-gray-800">€{estimatedCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-white/50 pt-2">
              <span className="text-gray-700">Payback Period:</span>
              <span className="font-bold text-primary">
                {paybackYears > 0 ? `${paybackYears} years` : 'N/A'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600 text-sm py-2">
            Adjust panel count to see financial projections
          </div>
        )}
      </motion.div>

      {/* Environmental Impact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <Leaf size={18} className="text-emerald-600" />
          <h3 className="font-semibold text-emerald-700">Environmental Impact</h3>
        </div>
        
        {isLoading ? (
          <div className="h-4 bg-emerald-200/50 rounded animate-pulse" />
        ) : data.co2OffsetKgPerYear > 0 ? (
          <div className="space-y-1">
            <div className="text-sm text-emerald-700">
              Your solar system would offset{' '}
              <span className="font-bold">{data.co2OffsetKgPerYear.toLocaleString()} kg</span>{' '}
              of CO₂ annually
            </div>
            <div className="text-xs text-emerald-600">
              Equivalent to planting {Math.round(data.co2OffsetKgPerYear / 22)} trees per year
            </div>
          </div>
        ) : (
          <div className="text-center text-emerald-600 text-sm">
            Add panels to see environmental benefits
          </div>
        )}
      </motion.div>

      {/* System Details */}
      {data.panelCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <h3 className="font-semibold text-gray-800 mb-3">System Specifications</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Panel Count:</span>
              <span className="font-medium">{data.panelCount} panels</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Power per Panel:</span>
              <span className="font-medium">400W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Panel Dimensions:</span>
              <span className="font-medium">1.88m × 1.05m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Energy per Panel:</span>
              <span className="font-medium">
                {Math.round(data.annualEnergyKwh / data.panelCount)} kWh/year
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LiveSolarData;