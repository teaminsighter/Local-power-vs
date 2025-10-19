'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Edit, TestTube, Copy, CheckCircle, Plus, Download } from 'lucide-react';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface DataLayerEvent {
  id: string;
  event_name: string;
  description: string;
  parameters: { [key: string]: string };
  trigger_condition: string;
  status: 'active' | 'inactive' | 'testing';
  created_at: string;
  fire_count: number;
}

const DataLayerEvents = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DataLayerEvent | null>(null);
  const [selectedEventForCode, setSelectedEventForCode] = useState<DataLayerEvent | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    description: '',
    parameters: '',
    trigger_condition: ''
  });

  // Mock data for existing events
  const [events] = useState<DataLayerEvent[]>([
    {
      id: '1',
      event_name: 'page_view_insights',
      description: 'Tracks page views with user context and UTM parameters',
      parameters: {
        'user_id': 'string',
        'page_url': 'string',
        'utm_source': 'string',
        'utm_medium': 'string',
        'utm_campaign': 'string',
        'timestamp': 'datetime'
      },
      trigger_condition: 'On every page load',
      status: 'active',
      created_at: '2024-09-20',
      fire_count: 15420
    },
    {
      id: '2',
      event_name: 'form_step_insights',
      description: 'Tracks form progression and step completion',
      parameters: {
        'user_id': 'string',
        'step_number': 'integer',
        'step_name': 'string',
        'step_data': 'object',
        'time_spent': 'integer',
        'drop_off_point': 'boolean'
      },
      trigger_condition: 'When user completes form step',
      status: 'active',
      created_at: '2024-09-20',
      fire_count: 8934
    },
    {
      id: '3',
      event_name: 'ten_second_stay_insights',
      description: 'Tracks engagement when user stays 10+ seconds',
      parameters: {
        'user_id': 'string',
        'page_url': 'string',
        'total_time': 'integer',
        'triggered': 'boolean'
      },
      trigger_condition: 'After 10 seconds on page',
      status: 'active',
      created_at: '2024-09-20',
      fire_count: 12567
    },
    {
      id: '4',
      event_name: 'form_submission_insights',
      description: 'Tracks form submissions with conversion value',
      parameters: {
        'user_id': 'string',
        'form_data': 'object',
        'new_submission': 'boolean',
        'conversion_value': 'float',
        'quote_value': 'float'
      },
      trigger_condition: 'On form submission success',
      status: 'active',
      created_at: '2024-09-20',
      fire_count: 1234
    },
    {
      id: '5',
      event_name: 'section_engagement_insights',
      description: 'Tracks time spent in specific page sections',
      parameters: {
        'user_id': 'string',
        'section_name': 'string',
        'time_spent': 'integer',
        'scroll_depth': 'integer'
      },
      trigger_condition: 'On section scroll and time thresholds',
      status: 'testing',
      created_at: '2024-09-25',
      fire_count: 234
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateEvent = () => {
    console.log('Creating new event:', newEvent);
    // In real implementation, this would call API
    setNewEvent({
      event_name: '',
      description: '',
      parameters: '',
      trigger_condition: ''
    });
  };

  const generateGTMCode = (event: DataLayerEvent) => {
    return `window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  'event': '${event.event_name}',
  'user_id': '{{User ID}}',
${Object.entries(event.parameters).map(([key, type]) => 
  `  '${key}': '{{${key.charAt(0).toUpperCase() + key.slice(1)}}}' // ${type}`
).join(',\n')}
});`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DataLayer Events</h1>
          <p className="text-gray-600">Configure and manage tracking events for analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const gtmData = JSON.stringify({ events, version: '1.0', exported: new Date().toISOString() }, null, 2);
              const blob = new Blob([gtmData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'gtm-container-export.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export GTM Container
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['events', 'gtm-code', 'testing'].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </motion.button>
        ))}
      </div>

      {/* Events List */}
      {activeTab === 'events' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Event Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Description</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Fires Count</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event, index) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 font-mono text-sm">
                          {event.event_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {event.created_at}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {event.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.trigger_condition}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {event.fire_count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">total fires</div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedEventForCode(event);
                            setShowCodeModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="View Code"
                        >
                          <Code className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditingEvent(event);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-green-600 hover:text-green-700"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditingEvent(event);
                            setShowTestModal(true);
                          }}
                          className="p-1 text-purple-600 hover:text-purple-700"
                          title="Test Event"
                        >
                          <TestTube className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* GTM Code Generator */}
      {activeTab === 'gtm-code' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Google Tag Manager Code Generator</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.slice(0, 2).map((event, index) => (
                <div key={event.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{event.event_name}</h4>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigator.clipboard.writeText(generateGTMCode(event));
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors flex items-center gap-1"
                    >
                      {copySuccess ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copySuccess ? 'Copied!' : 'Copy Code'}
                    </motion.button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre">
                      <code>{generateGTMCode(event)}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-medium text-blue-900">Implementation Tips</div>
                  <div className="text-blue-700 text-sm mt-1">
                    • All events automatically append "_insights" suffix<br/>
                    • User ID is generated and stored in localStorage<br/>
                    • UTM parameters are captured from URL automatically<br/>
                    • Events fire to GA4, Facebook Pixel, and custom endpoints
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Event Testing */}
      {activeTab === 'testing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Event Testing Console</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Event Trigger */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Test Event Firing</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    {events.map(event => (
                      <option key={event.id} value={event.event_name}>
                        {event.event_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Parameters (JSON)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={4}
                    placeholder='{"user_id": "test_123", "page_url": "https://example.com"}'
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const testData = { event: 'test_event', timestamp: new Date().toISOString() };
                    console.log('Test event fired:', testData);
                    alert('Test event fired successfully! Check console for details.');
                  }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Fire Test Event
                </motion.button>
              </div>
            </div>

            {/* Real-time Event Monitor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Live Event Monitor</h4>
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Monitoring
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                <div className="space-y-2 text-sm font-mono">
                  <div className="text-green-400">
                    [09:15:23] form_step_insights fired → user_123, step: 2
                  </div>
                  <div className="text-blue-400">
                    [09:15:20] page_view_insights fired → /solar-calculator
                  </div>
                  <div className="text-yellow-400">
                    [09:15:15] ten_second_stay_insights fired → user_456
                  </div>
                  <div className="text-green-400">
                    [09:14:58] form_submission_insights fired → €12,500 quote
                  </div>
                  <div className="text-blue-400">
                    [09:14:45] page_view_insights fired → /
                  </div>
                  <div className="text-gray-500">
                    [09:14:30] Monitoring started...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create DataLayer Event</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateEvent(); setShowCreateModal(false); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                  <input
                    type="text"
                    value={newEvent.event_name}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., button_click_insights"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                    placeholder="Describe what this event tracks..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parameters (JSON)</label>
                  <textarea
                    value={newEvent.parameters}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, parameters: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    rows={4}
                    placeholder='{"button_id": "string", "page_url": "string", "user_id": "string"}'
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Condition</label>
                  <input
                    type="text"
                    value={newEvent.trigger_condition}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, trigger_condition: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., On button click"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Event Modal */}
      <AnimatePresence>
        {showEditModal && editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Event: {editingEvent.event_name}</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    defaultValue={editingEvent.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    defaultValue={editingEvent.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Condition</label>
                  <input
                    type="text"
                    defaultValue={editingEvent.trigger_condition}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Code Modal */}
      <AnimatePresence>
        {showCodeModal && selectedEventForCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">GTM Code: {selectedEventForCode.event_name}</h2>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">DataLayer Push Code</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateGTMCode(selectedEventForCode));
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  >
                    {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copySuccess ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono whitespace-pre">
                    <code>{generateGTMCode(selectedEventForCode)}</code>
                  </pre>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Implementation Notes</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Place this code where the event should trigger</li>
                    <li>• Replace placeholder values with actual data</li>
                    <li>• Ensure GTM container is loaded before firing</li>
                    <li>• Test in preview mode before publishing</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Event Modal */}
      <AnimatePresence>
        {showTestModal && editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Test Event: {editingEvent.event_name}</h2>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Parameters (JSON)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    rows={6}
                    defaultValue={JSON.stringify(editingEvent.parameters, null, 2)}
                    placeholder='Enter test data in JSON format'
                  />
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <TestTube className="w-5 h-5" />
                    <span className="font-medium">Test Mode</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    This will fire a test event with the parameters above. Make sure GTM is in preview mode.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const testData = { event: editingEvent.event_name, test: true, timestamp: new Date().toISOString() };
                      window.dataLayer = window.dataLayer || [];
                      window.dataLayer.push(testData);
                      console.log('Test event fired:', testData);
                      alert('Test event fired successfully! Check GTM preview mode.');
                      setShowTestModal(false);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    Fire Test Event
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataLayerEvents;