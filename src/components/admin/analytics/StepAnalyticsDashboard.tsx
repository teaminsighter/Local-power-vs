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

          {/* Step 2 Question Analysis - Beautiful Design */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mt-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Step 2: Question Analytics</h3>
              <div className="flex items-center gap-3">
                <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-blue-600 border border-blue-200">
                  182 Total Responses
                </div>
                <div className="bg-green-100 px-3 py-1 rounded-full text-sm font-medium text-green-700">
                  92% Completion Rate
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Question 1: Monthly Bill Amount */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-gray-900">💶 Enter your average monthly bill amount</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">168 responses</span>
                    <span className="text-sm font-medium text-green-600">Avg. Time: 12s</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  {[
                    { range: '€50-€100', count: 45, percentage: 26.8, color: 'bg-blue-500', time: '8s' },
                    { range: '€100-€150', count: 62, percentage: 36.9, color: 'bg-green-500', time: '10s' },
                    { range: '€150-€200', count: 38, percentage: 22.6, color: 'bg-yellow-500', time: '14s' },
                    { range: '€200+', count: 23, percentage: 13.7, color: 'bg-red-500', time: '18s' }
                  ].map((option) => (
                    <div key={option.range} className="relative">
                      <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                        <div className="text-2xl font-bold text-gray-900">{option.count}</div>
                        <div className="text-sm font-medium text-gray-700 mb-2">{option.range}</div>
                        <div className="text-xs text-gray-500 mb-2">{option.percentage}%</div>
                        <div className="text-xs text-blue-600 font-medium">⏱️ {option.time}</div>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${option.color} rounded-b-lg opacity-70`}></div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-800">
                    <strong>Insight:</strong> Most users (36.9%) have monthly bills of €100-€150. Higher bills correlate with longer decision time.
                  </div>
                </div>
              </div>

              {/* Question 2: Home Size */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-gray-900">🏠 Home size</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">175 responses</span>
                    <span className="text-sm font-medium text-green-600">Avg. Time: 6s</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                  {[
                    { option: '1-2 Bedroom', count: 28, percentage: 16.0, color: 'bg-purple-500', time: '4s' },
                    { option: '3 Bedroom', count: 67, percentage: 38.3, color: 'bg-green-500', time: '5s' },
                    { option: '4 Bedroom', count: 52, percentage: 29.7, color: 'bg-blue-500', time: '6s' },
                    { option: '5+ Bedroom', count: 21, percentage: 12.0, color: 'bg-orange-500', time: '7s' },
                    { option: 'Commercial', count: 7, percentage: 4.0, color: 'bg-red-500', time: '12s' }
                  ].map((option) => (
                    <div key={option.option} className="relative">
                      <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                        <div className="text-xl font-bold text-gray-900">{option.count}</div>
                        <div className="text-sm font-medium text-gray-700 mb-2">{option.option}</div>
                        <div className="text-xs text-gray-500 mb-2">{option.percentage}%</div>
                        <div className="text-xs text-blue-600 font-medium">⏱️ {option.time}</div>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${option.color} rounded-b-lg opacity-70`}></div>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-800">
                    <strong>Insight:</strong> 3-bedroom homes dominate (38.3%). Commercial properties take 2x longer to decide.
                  </div>
                </div>
              </div>

              {/* Question 3: Select what option applies to you */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-gray-900">⚡ Select what option applies to you</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">171 responses</span>
                    <span className="text-sm font-medium text-green-600">Avg. Time: 9s</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  {[
                    { option: 'Reduce electricity bills', count: 89, percentage: 52.0, color: 'bg-green-500', time: '7s' },
                    { option: 'Environmental reasons', count: 48, percentage: 28.1, color: 'bg-blue-500', time: '9s' },
                    { option: 'Increase property value', count: 34, percentage: 19.9, color: 'bg-purple-500', time: '12s' }
                  ].map((option) => (
                    <div key={option.option} className="relative">
                      <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                        <div className="text-2xl font-bold text-gray-900">{option.count}</div>
                        <div className="text-sm font-medium text-gray-700 mb-2">{option.option}</div>
                        <div className="text-xs text-gray-500 mb-2">{option.percentage}%</div>
                        <div className="text-xs text-blue-600 font-medium">⏱️ {option.time}</div>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${option.color} rounded-b-lg opacity-70`}></div>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-xs text-yellow-800">
                    <strong>Insight:</strong> 52% are primarily motivated by bill reduction. Property value considerations take longest to decide.
                  </div>
                </div>
              </div>

              {/* Question 4: When do you use most electricity? */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-gray-900">🕐 When do you use most electricity?</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">166 responses</span>
                    <span className="text-sm font-medium text-green-600">Avg. Time: 8s</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  {[
                    { period: 'Morning (6-12)', count: 32, percentage: 19.3, color: 'bg-yellow-500', duration: '6s' },
                    { period: 'Afternoon (12-18)', count: 41, percentage: 24.7, color: 'bg-orange-500', duration: '7s' },
                    { period: 'Evening (18-24)', count: 78, percentage: 47.0, color: 'bg-purple-500', duration: '8s' },
                    { period: 'Night (0-6)', count: 15, percentage: 9.0, color: 'bg-blue-500', duration: '11s' }
                  ].map((option) => (
                    <div key={option.period} className="relative">
                      <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                        <div className="text-xl font-bold text-gray-900">{option.count}</div>
                        <div className="text-sm font-medium text-gray-700 mb-2">{option.period}</div>
                        <div className="text-xs text-gray-500 mb-2">{option.percentage}%</div>
                        <div className="text-xs text-blue-600 font-medium">⏱️ {option.duration}</div>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${option.color} rounded-b-lg opacity-70`}></div>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-xs text-purple-800">
                    <strong>Insight:</strong> 47% use most electricity in the evening. Night users take longest to decide (11s vs 6-8s average).
                  </div>
                </div>
              </div>

              {/* Question 5: What type of home do you live in? */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-gray-900">🏡 What type of home do you live in?</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">173 responses</span>
                    <span className="text-sm font-medium text-green-600">Avg. Time: 5s</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
                  {[
                    { type: 'Detached House', count: 87, percentage: 50.3, color: 'bg-green-500', time: '4s' },
                    { type: 'Semi-Detached', count: 43, percentage: 24.9, color: 'bg-blue-500', time: '5s' },
                    { type: 'Terraced House', count: 28, percentage: 16.2, color: 'bg-purple-500', time: '6s' },
                    { type: 'Apartment', count: 12, percentage: 6.9, color: 'bg-yellow-500', time: '7s' },
                    { type: 'Bungalow', count: 3, percentage: 1.7, color: 'bg-red-500', time: '8s' }
                  ].map((option) => (
                    <div key={option.type} className="relative">
                      <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                        <div className="text-xl font-bold text-gray-900">{option.count}</div>
                        <div className="text-sm font-medium text-gray-700 mb-2">{option.type}</div>
                        <div className="text-xs text-gray-500 mb-2">{option.percentage}%</div>
                        <div className="text-xs text-blue-600 font-medium">⏱️ {option.time}</div>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${option.color} rounded-b-lg opacity-70`}></div>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-800">
                    <strong>Insight:</strong> 50.3% live in detached houses (fastest decision at 4s). Apartments/bungalows take longer due to installation complexity.
                  </div>
                </div>
              </div>

              {/* Question 6: Energy & Technical Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-gray-900">🔧 Energy & Technical Information</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">159 responses</span>
                    <span className="text-sm font-medium text-green-600">Avg. Time: 15s</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  {[
                    { info: 'Current Energy Usage', count: 78, percentage: 49.1, color: 'bg-blue-500', time: '12s' },
                    { info: 'Roof Specifications', count: 54, percentage: 34.0, color: 'bg-green-500', time: '18s' },
                    { info: 'Technical Requirements', count: 27, percentage: 16.9, color: 'bg-purple-500', time: '22s' }
                  ].map((option) => (
                    <div key={option.info} className="relative">
                      <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                        <div className="text-2xl font-bold text-gray-900">{option.count}</div>
                        <div className="text-sm font-medium text-gray-700 mb-2">{option.info}</div>
                        <div className="text-xs text-gray-500 mb-2">{option.percentage}%</div>
                        <div className="text-xs text-blue-600 font-medium">⏱️ {option.time}</div>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${option.color} rounded-b-lg opacity-70`}></div>
                    </div>
                  ))}
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-xs text-red-800">
                    <strong>Insight:</strong> Technical requirements take 22s (longest decision time). 49% focus on current usage patterns.
                  </div>
                </div>
              </div>

              {/* Overall Performance Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Question Performance Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-green-600">5s</div>
                    <div className="text-xs text-gray-700 font-medium">Fastest Question</div>
                    <div className="text-xs text-gray-500">Home Type</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-red-600">15s</div>
                    <div className="text-xs text-gray-700 font-medium">Slowest Question</div>
                    <div className="text-xs text-gray-500">Technical Info</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">94%</div>
                    <div className="text-xs text-gray-700 font-medium">Answer Accuracy</div>
                    <div className="text-xs text-gray-500">Valid Responses</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">8.5s</div>
                    <div className="text-xs text-gray-700 font-medium">Average Time</div>
                    <div className="text-xs text-gray-500">Per Question</div>
                  </div>
                </div>
              </div>
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
              const deviceBreakdown = sessionStats.deviceBreakdown || {};
              const total = Object.values(deviceBreakdown).reduce((a: number, b: unknown) => a + (b as number), 0);
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