'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Smartphone, 
  Monitor, 
  Tablet,
  ArrowDown,
  BarChart3,
  Activity,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { analyticsService, FunnelData, AddressAnalytics } from '@/services/analyticsService';

const StepAnalyticsDashboard = () => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [sessionStats, setSessionStats] = useState<any>({});
  const [addressAnalytics, setAddressAnalytics] = useState<AddressAnalytics>({
    totalSearches: 0,
    uniqueAddresses: 0,
    popularQueries: {},
    addressSelections: [],
    geographicDistribution: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const funnel = analyticsService.getFunnelData();
      const stats = analyticsService.getSessionStats();
      const addressData = analyticsService.getAddressAnalytics();
      
      setFunnelData(funnel);
      setSessionStats(stats);
      setAddressAnalytics(addressData);
      setIsLoading(false);
    }, 500);
  };



  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Step Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">User behavior analysis through solar calculator steps</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadAnalyticsData}
            className="text-gray-600 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300 hover:bg-gray-50"
          >
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessionStats.totalSessions || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#146443' }}>
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          {sessionStats.totalSessions > 0 && (
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">Real user sessions</span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessionStats.conversionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          {sessionStats.conversionRate > 0 && (
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">Actual conversions</span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Steps Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessionStats.averageStepsCompleted?.toFixed(1) || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          {sessionStats.averageStepsCompleted > 0 && (
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">Average progression</span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lead Conversions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {sessionStats.conversions || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          {sessionStats.conversions > 0 && (
            <div className="flex items-center mt-4 text-sm">
              <span className="text-gray-500">Real lead generation</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Step Funnel Analysis - Compact Professional Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Conversion Funnel</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <Activity className="w-4 h-4 mr-1" />
              Step-by-step user journey
            </div>
            <div className="text-sm text-gray-500">
              Total Sessions: <span className="font-semibold text-gray-900">{funnelData[0]?.totalEntries || 0}</span>
            </div>
          </div>
        </div>

        {/* Compact Horizontal Funnel */}
        <div className="relative">
          {/* Funnel Steps Container */}
          <div className="flex items-center justify-between mb-8">
            {funnelData.map((step, index) => {
              
              return (
                <motion.div
                  key={step.stepNumber}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="flex-1 relative group"
                >
                  {/* Funnel Step */}
                  <div 
                    className="relative mx-1 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    style={{
                      height: '120px',
                      backgroundColor: step.conversionRate >= 70 ? '#146443' : 
                                     step.conversionRate >= 50 ? '#f59e0b' : '#ef4444',
                      clipPath: index === funnelData.length - 1 
                        ? 'none' 
                        : `polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)`
                    }}
                  >
                    {/* Step Content */}
                    <div className="p-3 h-full flex flex-col justify-between text-white">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-sm font-bold">{step.stepNumber}</span>
                        </div>
                        <h4 className="text-xs font-medium truncate">{step.stepName}</h4>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold">{step.totalEntries}</div>
                        <div className="text-xs opacity-90">{step.conversionRate.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* Hover Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap">
                        <div>Entries: {step.totalEntries}</div>
                        <div>Completions: {step.completions}</div>
                        <div>Drop-offs: {step.dropOffs}</div>
                        <div>Avg. Time: {formatDuration(step.averageDuration)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Arrow */}
                  {index < funnelData.length - 1 && (
                    <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-sm">
                        <ArrowDown className="w-2 h-2 text-gray-500 transform rotate-90" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Detailed Stats Table */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Detailed Performance Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Step</th>
                    <th className="text-center py-2 font-medium text-gray-700">Entries</th>
                    <th className="text-center py-2 font-medium text-gray-700">Rate</th>
                    <th className="text-center py-2 font-medium text-gray-700">Drop-offs</th>
                    <th className="text-center py-2 font-medium text-gray-700">Avg. Time</th>
                    <th className="text-left py-2 font-medium text-gray-700">Top Choice</th>
                  </tr>
                </thead>
                <tbody>
                  {funnelData.map((step) => {
                    const topChoice = step.popularChoices && Object.entries(step.popularChoices)
                      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
                    
                    return (
                      <tr key={step.stepNumber} className="border-b border-gray-100 hover:bg-white transition-colors">
                        <td className="py-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded flex items-center justify-center mr-2 text-xs font-bold text-white"
                                 style={{ backgroundColor: '#146443' }}>
                              {step.stepNumber}
                            </div>
                            <span className="font-medium text-gray-900 truncate">{step.stepName}</span>
                          </div>
                        </td>
                        <td className="text-center py-2 font-medium">{step.totalEntries}</td>
                        <td className="text-center py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConversionColor(step.conversionRate)}`}>
                            {step.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center py-2 text-red-600 font-medium">{step.dropOffs}</td>
                        <td className="text-center py-2 text-gray-600">{formatDuration(step.averageDuration)}</td>
                        <td className="py-2">
                          {topChoice && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {topChoice[0]}: {topChoice[1]}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real Analytics - Only show when we have actual data */}
      {funnelData.length > 0 && funnelData.some(step => step.totalEntries > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Real User Analytics</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-2">Real user data will be displayed here</p>
            <p className="text-sm text-gray-500">Start using the solar calculator to generate analytics</p>
          </div>
        </motion.div>
      )}

      {/* No Data State */}
      {(!funnelData.length || !funnelData.some(step => step.totalEntries > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
            <p className="text-gray-600 mb-4">Once users start using the solar calculator, step analytics will appear here.</p>
            <p className="text-sm text-gray-500">Track user behavior, conversion rates, and step completion data in real-time.</p>
          </div>
        </motion.div>
      )}

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(sessionStats.deviceBreakdown || {}).map(([device, count]) => {
              const total = Object.values(sessionStats.deviceBreakdown || {}).reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
              
              const getDeviceIcon = () => {
                switch (device) {
                  case 'mobile': return <Smartphone className="w-5 h-5" />;
                  case 'tablet': return <Tablet className="w-5 h-5" />;
                  case 'desktop': return <Monitor className="w-5 h-5" />;
                  default: return <Monitor className="w-5 h-5" />;
                }
              };

              return (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      {getDeviceIcon()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{device}</p>
                      <p className="text-sm text-gray-500">{count as number} sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{percentage.toFixed(1)}%</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: '#146443'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Analytics Actions</h3>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadAnalyticsData}
              className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Refresh Data</p>
                  <p className="text-sm text-blue-600">Update analytics display</p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Address Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Address Search Analytics</h3>
        
        {/* Address Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{addressAnalytics.totalSearches}</p>
            <p className="text-sm text-blue-600">Total Searches</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{addressAnalytics.uniqueAddresses}</p>
            <p className="text-sm text-green-600">Unique Addresses</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {addressAnalytics.totalSearches > 0 ? (addressAnalytics.uniqueAddresses / addressAnalytics.totalSearches * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-purple-600">Unique Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Search Queries */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Popular Search Queries</h4>
            <div className="space-y-3">
              {Object.entries(addressAnalytics.popularQueries)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([query, count]) => (
                  <div key={query} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">{query}</span>
                    <span className="text-sm text-gray-600 ml-2">{count} searches</span>
                  </div>
                ))}
              {Object.keys(addressAnalytics.popularQueries).length === 0 && (
                <p className="text-gray-500 text-sm italic">No search data available</p>
              )}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Geographic Distribution</h4>
            <div className="space-y-3">
              {Object.entries(addressAnalytics.geographicDistribution)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([region, count]) => {
                  const total = Object.values(addressAnalytics.geographicDistribution).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                  
                  return (
                    <div key={region} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{region}</span>
                          <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: '#146443'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              {Object.keys(addressAnalytics.geographicDistribution).length === 0 && (
                <p className="text-gray-500 text-sm italic">No geographic data available</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StepAnalyticsDashboard;