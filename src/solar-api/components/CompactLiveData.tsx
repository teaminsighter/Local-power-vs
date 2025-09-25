'use client';

import { motion } from 'framer-motion';
import { Zap, Euro, TrendingUp, Leaf } from 'lucide-react';
import { LivePanelCalculation } from '../types/building-insights';

interface CompactLiveDataProps {
  data: LivePanelCalculation;
  isLoading?: boolean;
}

const CompactLiveData = ({ data, isLoading = false }: CompactLiveDataProps) => {
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
      unit: '',
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
      icon: Leaf,
      label: 'CO₂ Offset',
      value: (data.co2OffsetKgPerYear / 1000).toFixed(1),
      unit: 't/year',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Live Solar Data</h3>
        <div className="text-xs text-gray-500">Updates automatically</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-gray-50 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded ${metric.bgColor} flex items-center justify-center`}>
                  <IconComponent size={14} className={metric.color} />
                </div>
                <div className="text-xs text-gray-600 font-medium">{metric.label}</div>
              </div>
              {isLoading ? (
                <div className="h-5 bg-gray-200 rounded animate-pulse" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-800">{metric.value}</span>
                  {metric.unit && <span className="text-xs text-gray-500">{metric.unit}</span>}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CompactLiveData;