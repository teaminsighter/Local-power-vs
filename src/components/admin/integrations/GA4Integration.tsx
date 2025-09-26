'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const GA4Integration = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'events' | 'ecommerce'>('overview');
  const [connectionStatus] = useState<'connected' | 'disconnected'>('connected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Google Analytics 4</h1>
            <p className="text-gray-600">Advanced measurement and server-side tracking</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {connectionStatus === 'connected' ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🔗 Connect GA4
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'overview', name: 'Overview', icon: '📊' },
          { id: 'setup', name: 'Setup', icon: '⚙️' },
          { id: 'events', name: 'Events', icon: '🎯' },
          { id: 'ecommerce', name: 'E-commerce', icon: '💰' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </motion.button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Total Users', value: '45.2K', change: '+18.3% vs last month', color: 'orange' },
              { title: 'Sessions', value: '67.8K', change: '+22.1% increase', color: 'red' },
              { title: 'Conversions', value: '1,284', change: '+15.7% improvement', color: 'green' },
              { title: 'Revenue', value: '€156K', change: '+24.2% vs last month', color: 'blue' }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className={`w-12 h-12 bg-${metric.color}-500 rounded-lg flex items-center justify-center mb-4`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{metric.title}</div>
                <div className="text-xs text-gray-500">{metric.change}</div>
              </motion.div>
            ))}
          </div>

          {/* Connected Properties */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Connected GA4 Properties</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                    GA4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Local Power - Web</h4>
                    <p className="text-sm text-gray-600">Property ID: 123456789</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">45.2K</div>
                    <div className="text-xs text-gray-500">Users (30d)</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-orange-600">1,284</div>
                    <div className="text-xs text-gray-500">Conversions</div>
                  </div>
                  
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">GA4 Configuration</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Measurement ID</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                  placeholder="G-XXXXXXXXXX"
                  defaultValue="G-ABCD123456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                <input 
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Server-Side Tracking</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enable Measurement Protocol</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enhanced E-commerce</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Google Signals</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Custom Events</h3>
          
          <div className="space-y-4">
            {[
              { name: 'generate_lead', description: 'Solar calculator form completion', count: '1,234' },
              { name: 'request_quote', description: 'Quote request submission', count: '856' },
              { name: 'book_consultation', description: 'Consultation booking', count: '234' },
              { name: 'download_guide', description: 'Solar guide download', count: '1,567' }
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{event.name}</div>
                  <div className="text-sm text-gray-600">{event.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-orange-600">{event.count}</div>
                  <div className="text-xs text-gray-500">30 days</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* E-commerce Tab */}
      {activeTab === 'ecommerce' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">E-commerce Tracking</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 mb-2">Purchase Events</div>
              <div className="text-2xl font-bold text-green-900 mb-1">127</div>
              <div className="text-sm text-green-600">€156,890 revenue</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800 mb-2">Add to Cart</div>
              <div className="text-2xl font-bold text-blue-900 mb-1">543</div>
              <div className="text-sm text-blue-600">23% conversion rate</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-800 mb-2">Begin Checkout</div>
              <div className="text-2xl font-bold text-purple-900 mb-1">234</div>
              <div className="text-sm text-purple-600">54% completion</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GA4Integration;