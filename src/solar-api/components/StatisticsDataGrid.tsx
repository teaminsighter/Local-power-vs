'use client';

import { motion } from 'framer-motion';
import { Cloud, Clock, Leaf, Home, Target, Sun } from 'lucide-react';
import { ProcessedBuildingData } from '../types/building-insights';

interface StatisticsDataGridProps {
  buildingData?: ProcessedBuildingData;
  currentLocation: { lat: number; lng: number };
  isLoading?: boolean;
}

const StatisticsDataGrid = ({ buildingData, currentLocation, isLoading = false }: StatisticsDataGridProps) => {
  // Mock weather data (in real implementation, this would come from weather API)
  const weatherData = {
    avgSunHours: 3.8,
    avgTemp: 12,
    rainDays: 185,
    cloudCover: 62
  };

  // Time-based calculations
  const timeData = {
    peakSunHours: buildingData ? Math.round(buildingData.roofSegments[0]?.sunshineHours[5] || 1500) : 0,
    bestMonths: 'Jun-Aug',
    optimalTilt: buildingData ? Math.round(buildingData.roofSegments[0]?.pitch || 35) : 0,
    yearRound: '85%'
  };

  // Environmental impact
  const environmentData = {
    co2PerYear: buildingData ? Math.round(buildingData.maxPanels * 400 * 0.295) : 0,
    treesEquivalent: buildingData ? Math.round((buildingData.maxPanels * 400 * 0.295) / 22) : 0,
    homesPowered: buildingData ? Math.round((buildingData.maxPanels * 400 * 1.5) / 4000) : 0,
    offsetPercentage: 85
  };

  // Grid layout: Top row (Building Information, Roof Recommendations, Solar Potential)
  // Bottom row: Weather Data, Time Based Data, Environment Data  
  const dataBoxes = [
    // TOP ROW
    {
      title: 'Building Information',
      icon: Home,
      color: 'bg-orange-100/60 text-orange-700',
      data: buildingData ? [
        { label: 'Roof Area', value: `${Math.round(buildingData.totalRoofArea)} m²` },
        { label: 'Segments', value: `${buildingData.roofSegments.length}` },
        { label: 'Quality', value: buildingData.imageryQuality }
      ] : [
        { label: 'Analyzing...', value: '-' },
        { label: 'Loading...', value: '-' },
        { label: 'Processing...', value: '-' }
      ]
    },
    {
      title: 'Roof Recommendations',
      icon: Target,
      color: 'bg-red-100/60 text-red-700',
      data: buildingData ? [
        { label: 'Max Panels', value: `${buildingData.maxPanels}` },
        { label: 'Orientation', value: `${Math.round(buildingData.roofSegments[0]?.azimuth || 180)}°` },
        { label: 'Tilt', value: `${Math.round(buildingData.roofSegments[0]?.pitch || 35)}°` }
      ] : [
        { label: 'Calculating...', value: '-' },
        { label: 'Analyzing...', value: '-' },
        { label: 'Processing...', value: '-' }
      ]
    },
    {
      title: 'Solar Potential',
      icon: Sun,
      color: 'bg-yellow-100/60 text-yellow-700',
      data: buildingData ? [
        { label: 'Max Size', value: `${Math.round(buildingData.maxPanels * 0.4)}kW` },
        { label: 'Generation', value: `${Math.round(buildingData.maxPanels * 400 * 1.5 / 1000)}MWh` },
        { label: 'Rating', value: 'Excellent' }
      ] : [
        { label: 'Computing...', value: '-' },
        { label: 'Estimating...', value: '-' },
        { label: 'Evaluating...', value: '-' }
      ]
    },
    // BOTTOM ROW
    {
      title: 'Weather Data',
      icon: Cloud,
      color: 'bg-blue-100/60 text-blue-700',
      data: [
        { label: 'Sun Hours', value: `${weatherData.avgSunHours}h/day` },
        { label: 'Avg Temp', value: `${weatherData.avgTemp}°C` },
        { label: 'Cloud Cover', value: `${weatherData.cloudCover}%` }
      ]
    },
    {
      title: 'Time Based Data',
      icon: Clock,
      color: 'bg-purple-100/60 text-purple-700',
      data: [
        { label: 'Peak Hours', value: `${timeData.peakSunHours}h/yr` },
        { label: 'Best Months', value: timeData.bestMonths },
        { label: 'Efficiency', value: timeData.yearRound }
      ]
    },
    {
      title: 'Environment Data',
      icon: Leaf,
      color: 'bg-green-100/60 text-green-700',
      data: [
        { label: 'CO₂ Saved', value: `${(environmentData.co2PerYear / 1000).toFixed(1)}t/yr` },
        { label: 'Trees Equal', value: `${environmentData.treesEquivalent}` },
        { label: 'Offset', value: `${environmentData.offsetPercentage}%` }
      ]
    }
  ];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">Statistical Analysis</h3>
        <div className="text-xs text-gray-500">
          {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
        </div>
      </div>
      
      <div className="w-full grid grid-cols-3 gap-3" style={{ minHeight: '220px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {dataBoxes.map((box, index) => {
          const IconComponent = box.icon;
          
          return (
            <motion.div
              key={box.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4 hover:shadow-xl hover:bg-white/80 transition-all duration-300 flex flex-col justify-between min-w-0"
              style={{ minHeight: '100px' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-lg ${box.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <IconComponent size={12} />
                </div>
                <h4 className="text-sm font-bold text-gray-800 leading-tight">{box.title}</h4>
              </div>
              
              <div className="space-y-2 flex-1">
                {box.data.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 truncate pr-2">{item.label}:</span>
                    {isLoading ? (
                      <div className="h-3 w-10 bg-gray-200/60 rounded animate-pulse flex-shrink-0" />
                    ) : (
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StatisticsDataGrid;