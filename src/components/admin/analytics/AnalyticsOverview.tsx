'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AnalyticsOverview = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 23,
    leadsToday: 12,
    conversionRate: 4.2,
    avgSessionDuration: 347
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 50) + 10,
        leadsToday: Math.floor(Math.random() * 20) + 5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      title: 'Total Leads',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'bg-blue-500'
    },
    {
      title: 'Conversion Rate',
      value: `${realTimeData.conversionRate}%`,
      change: '+2.3%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'bg-green-500'
    },
    {
      title: 'Revenue Attribution',
      value: '€45,678',
      change: '+18.2%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'bg-yellow-500'
    },
    {
      title: 'Active Users',
      value: realTimeData.activeUsers.toString(),
      change: 'Live',
      trend: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: 'bg-purple-500'
    }
  ];

  const topSources = [
    { name: 'Google Ads', leads: 456, conversion: 4.8, revenue: '€18,234' },
    { name: 'Facebook Ads', leads: 234, conversion: 3.2, revenue: '€12,567' },
    { name: 'Organic Search', leads: 345, conversion: 6.1, revenue: '€9,876' },
    { name: 'Direct Traffic', leads: 123, conversion: 2.9, revenue: '€4,321' },
    { name: 'Email Campaign', leads: 76, conversion: 8.2, revenue: '€2,890' }
  ];

  const recentActivity = [
    { type: 'lead', message: 'New lead from Dublin - Solar Calculator', time: '2 mins ago', icon: '👤' },
    { type: 'conversion', message: 'Quote request converted to customer', time: '5 mins ago', icon: '💰' },
    { type: 'alert', message: 'Conversion rate dropped below threshold', time: '12 mins ago', icon: '⚠️' },
    { type: 'lead', message: 'New lead from Cork - Battery System', time: '18 mins ago', icon: '👤' },
    { type: 'system', message: 'Daily backup completed successfully', time: '1 hour ago', icon: '✅' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-gray-600">Real-time insights and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Refresh Data
          </motion.button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center text-white`}>
                {metric.icon}
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                metric.trend === 'up' 
                  ? 'text-green-700 bg-green-100' 
                  : metric.trend === 'down'
                  ? 'text-red-700 bg-red-100'
                  : 'text-purple-700 bg-purple-100'
              }`}>
                {metric.change}
              </div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600">
                {metric.title}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Sources */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Performing Sources</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Live Data
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Source</th>
                  <th className="text-center py-3 text-sm font-medium text-gray-600">Leads</th>
                  <th className="text-center py-3 text-sm font-medium text-gray-600">Conv. Rate</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSources.map((source, index) => (
                  <motion.tr
                    key={source.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {source.name.charAt(0)}
                        </div>
                        <div className="font-medium text-gray-900">{source.name}</div>
                      </div>
                    </td>
                    <td className="py-4 text-center font-medium text-gray-900">{source.leads}</td>
                    <td className="py-4 text-center">
                      <span className="text-green-700 font-medium">{source.conversion}%</span>
                    </td>
                    <td className="py-4 text-right font-medium text-gray-900">{source.revenue}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-xl">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {activity.message}
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            View All Activity →
          </motion.button>
        </motion.div>
      </div>

      {/* Real-time Performance Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Real-time Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {realTimeData.activeUsers}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(realTimeData.activeUsers / 50) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {realTimeData.leadsToday}
            </div>
            <div className="text-sm text-gray-600">Leads Today</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(realTimeData.leadsToday / 20) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {Math.floor(realTimeData.avgSessionDuration / 60)}m {realTimeData.avgSessionDuration % 60}s
            </div>
            <div className="text-sm text-gray-600">Avg Session</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(realTimeData.avgSessionDuration / 600) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {realTimeData.conversionRate}%
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(realTimeData.conversionRate / 10) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsOverview;