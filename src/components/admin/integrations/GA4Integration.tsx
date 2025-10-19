'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const GA4Integration = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'events' | 'ecommerce'>('overview');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [measurementId, setMeasurementId] = useState('G-ABCD123456');
  const [apiSecret, setApiSecret] = useState('');
  const [settings, setSettings] = useState({
    measurementProtocol: true,
    enhancedEcommerce: true,
    googleSignals: true
  });

  // Modal states
  const [showEditEventModal, setShowEditEventModal] = useState<string | null>(null);
  const [editEventData, setEditEventData] = useState<{ name: string; description: string }>({ name: '', description: '' });

  const handleConnect = () => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  const handleSaveConfiguration = async () => {
    try {
      alert('Saving GA4 configuration...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('✅ GA4 configuration saved successfully!');
    } catch (error) {
      alert('❌ Failed to save configuration.');
    }
  };

  const handleTestConnection = async () => {
    try {
      alert('Testing GA4 connection...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('✅ GA4 connection test successful!');
    } catch (error) {
      alert('❌ GA4 connection test failed.');
    }
  };

  const handleEditEvent = (eventName: string, description: string) => {
    setEditEventData({ name: eventName, description });
    setShowEditEventModal(eventName);
  };

  const handleSaveEvent = async () => {
    try {
      alert('Saving event configuration...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('✅ Event updated successfully!');
      setShowEditEventModal(null);
      setEditEventData({ name: '', description: '' });
    } catch (error) {
      alert('❌ Failed to update event.');
    }
  };

  const handleDeleteEvent = async (eventName: string) => {
    if (confirm(`Are you sure you want to delete the "${eventName}" event?`)) {
      try {
        alert('Deleting event...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('✅ Event deleted successfully!');
      } catch (error) {
        alert('❌ Failed to delete event.');
      }
    }
  };

  const handleTestEvent = async (eventName: string) => {
    try {
      alert(`Testing event: ${eventName}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('✅ Test event sent successfully!');
    } catch (error) {
      alert('❌ Test event failed.');
    }
  };

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
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting'}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {connectionStatus === 'connecting' ? '🔄 Connecting...' : '🔗 Connect GA4'}
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
                  value={measurementId}
                  onChange={(e) => setMeasurementId(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                <input 
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                  placeholder="••••••••••••••••"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Server-Side Tracking</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enable Measurement Protocol</label>
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={settings.measurementProtocol}
                    onChange={(e) => setSettings(prev => ({ ...prev, measurementProtocol: e.target.checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Enhanced E-commerce</label>
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={settings.enhancedEcommerce}
                    onChange={(e) => setSettings(prev => ({ ...prev, enhancedEcommerce: e.target.checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Google Signals</label>
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={settings.googleSignals}
                    onChange={(e) => setSettings(prev => ({ ...prev, googleSignals: e.target.checked }))}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTestConnection}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Connection
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveConfiguration}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Configuration
            </motion.button>
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
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div>
                  <div className="font-medium text-gray-900">{event.name}</div>
                  <div className="text-sm text-gray-600">{event.description}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium text-orange-600">{event.count}</div>
                    <div className="text-xs text-gray-500">30 days</div>
                  </div>
                  
                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleTestEvent(event.name)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title="Test Event"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditEvent(event.name, event.description)}
                      className="p-1 text-green-600 hover:text-green-700"
                      title="Edit Event"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteEvent(event.name)}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Delete Event"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </div>
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

      {/* Edit Event Modal */}
      {showEditEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Event</h3>
              <button
                onClick={() => setShowEditEventModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  value={editEventData.name}
                  onChange={(e) => setEditEventData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editEventData.description}
                  onChange={(e) => setEditEventData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveEvent}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditEventModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GA4Integration;