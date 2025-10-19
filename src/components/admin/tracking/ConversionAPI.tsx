'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Database, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Globe,
  Key,
  Activity,
  Target,
  Users,
  X,
  Plus,
  TestTube,
  Edit
} from 'lucide-react';

interface ConversionEndpoint {
  id: string;
  name: string;
  platform: string;
  endpoint: string;
  method: 'POST' | 'GET' | 'PUT';
  status: 'active' | 'inactive' | 'error';
  lastUsed: string;
  totalConversions: number;
  successRate: number;
  avgResponseTime: number;
  events: string[];
  authentication: 'api_key' | 'oauth' | 'webhook';
}

interface ConversionEvent {
  id: string;
  eventName: string;
  platform: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  value: number;
  currency: string;
  responseTime: number;
  errorMessage?: string;
}

interface APIConfiguration {
  platform: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  webhookSecret: string;
  testMode: boolean;
}

const ConversionAPI = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [endpoints, setEndpoints] = useState<ConversionEndpoint[]>([]);
  const [recentEvents, setRecentEvents] = useState<ConversionEvent[]>([]);
  const [configurations, setConfigurations] = useState<APIConfiguration[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingMode, setTestingMode] = useState(false);
  const [showAddEndpointModal, setShowAddEndpointModal] = useState(false);
  const [showEditEndpointModal, setShowEditEndpointModal] = useState(false);
  const [showTestConversionModal, setShowTestConversionModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<ConversionEndpoint | null>(null);
  const [copyConfigSuccess, setCopyConfigSuccess] = useState(false);

  useEffect(() => {
    loadConversionData();
  }, []);

  const loadConversionData = () => {
    setIsLoading(true);

    const mockEndpoints: ConversionEndpoint[] = [
      {
        id: 'endpoint_1',
        name: 'Facebook Conversions API',
        platform: 'Facebook',
        endpoint: 'https://graph.facebook.com/v18.0/{pixel-id}/events',
        method: 'POST',
        status: 'active',
        lastUsed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        totalConversions: 1245,
        successRate: 98.5,
        avgResponseTime: 145,
        events: ['Purchase', 'Lead', 'ViewContent', 'AddToCart'],
        authentication: 'api_key'
      },
      {
        id: 'endpoint_2',
        name: 'Google Ads Conversions',
        platform: 'Google Ads',
        endpoint: 'https://googleads.googleapis.com/v14/customers/{customer-id}/conversionUploads:upload',
        method: 'POST',
        status: 'active',
        lastUsed: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        totalConversions: 892,
        successRate: 97.2,
        avgResponseTime: 189,
        events: ['conversion', 'enhanced_conversion'],
        authentication: 'oauth'
      },
      {
        id: 'endpoint_3',
        name: 'TikTok Events API',
        platform: 'TikTok',
        endpoint: 'https://business-api.tiktok.com/open_api/v1.3/event/track/',
        method: 'POST',
        status: 'inactive',
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        totalConversions: 0,
        successRate: 0,
        avgResponseTime: 0,
        events: ['CompleteRegistration', 'SubmitForm', 'ViewContent'],
        authentication: 'api_key'
      },
      {
        id: 'endpoint_4',
        name: 'Salesforce Lead API',
        platform: 'Salesforce',
        endpoint: 'https://yourinstance.salesforce.com/services/data/v57.0/sobjects/Lead/',
        method: 'POST',
        status: 'error',
        lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        totalConversions: 234,
        successRate: 85.3,
        avgResponseTime: 567,
        events: ['lead_creation', 'lead_update'],
        authentication: 'oauth'
      }
    ];

    const mockEvents: ConversionEvent[] = [
      {
        id: 'event_1',
        eventName: 'Lead',
        platform: 'Facebook',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        status: 'success',
        value: 15200,
        currency: 'EUR',
        responseTime: 134
      },
      {
        id: 'event_2',
        eventName: 'conversion',
        platform: 'Google Ads',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'success',
        value: 14800,
        currency: 'EUR',
        responseTime: 189
      },
      {
        id: 'event_3',
        eventName: 'Lead',
        platform: 'Facebook',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        status: 'failed',
        value: 16500,
        currency: 'EUR',
        responseTime: 2500,
        errorMessage: 'Invalid access token'
      },
      {
        id: 'event_4',
        eventName: 'lead_creation',
        platform: 'Salesforce',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        status: 'pending',
        value: 18000,
        currency: 'EUR',
        responseTime: 0
      }
    ];

    const mockConfigurations: APIConfiguration[] = [
      {
        platform: 'Facebook',
        clientId: 'your_facebook_app_id',
        clientSecret: '••••••••••••••••',
        accessToken: '••••••••••••••••••••••••••••••••',
        refreshToken: '••••••••••••••••••••••••••••••••',
        webhookSecret: '••••••••••••••••',
        testMode: false
      },
      {
        platform: 'Google Ads',
        clientId: 'your_google_client_id',
        clientSecret: '••••••••••••••••',
        accessToken: '••••••••••••••••••••••••••••••••',
        refreshToken: '••••••••••••••••••••••••••••••••',
        webhookSecret: '',
        testMode: false
      }
    ];

    setTimeout(() => {
      setEndpoints(mockEndpoints);
      setRecentEvents(mockEvents);
      setConfigurations(mockConfigurations);
      setSelectedPlatform('Facebook');
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const activeEndpoints = endpoints.filter(e => e.status === 'active').length;
  const totalConversions = endpoints.reduce((sum, e) => sum + e.totalConversions, 0);
  const avgSuccessRate = endpoints.length > 0 
    ? endpoints.reduce((sum, e) => sum + e.successRate, 0) / endpoints.length 
    : 0;
  const recentSuccessCount = recentEvents.filter(e => e.status === 'success').length;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading conversion API...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Conversion API</h1>
          <p className="text-gray-600 mt-1">Manage server-side conversion tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTestingMode(!testingMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              testingMode 
                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Test Mode
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <Target className="w-4 h-4" />
            Test Conversion
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeEndpoints}</p>
              <p className="text-sm text-gray-600">Active Endpoints</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalConversions.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Conversions</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgSuccessRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{recentSuccessCount}</p>
              <p className="text-sm text-gray-600">Recent Success</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h2>
        
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <motion.div
              key={endpoint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{endpoint.name}</h3>
                    <p className="text-sm text-gray-600">{endpoint.platform}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(endpoint.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                    {endpoint.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div className="text-sm">
                  <span className="text-gray-600">Conversions:</span>
                  <span className="ml-2 font-medium text-gray-900">{endpoint.totalConversions.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="ml-2 font-medium text-gray-900">{endpoint.successRate}%</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="ml-2 font-medium text-gray-900">{endpoint.avgResponseTime}ms</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Last Used:</span>
                  <span className="ml-2 font-medium text-gray-900">{new Date(endpoint.lastUsed).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {endpoint.events.map((event, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {event}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Configure
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    Test
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadConversionData}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Event</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Platform</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Status</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Value</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Response Time</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-medium text-gray-900">{event.eventName}</div>
                    {event.errorMessage && (
                      <div className="text-xs text-red-600">{event.errorMessage}</div>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm text-gray-900">{event.platform}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStatusIcon(event.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-sm font-medium text-gray-900">
                    €{event.value.toLocaleString()}
                  </td>
                  <td className="py-3 text-center text-sm text-gray-900">
                    {event.responseTime > 0 ? `${event.responseTime}ms` : '-'}
                  </td>
                  <td className="py-3 text-center text-xs text-gray-600">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {configurations.map((config) => (
                <option key={config.platform} value={config.platform}>
                  {config.platform}
                </option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSecrets(!showSecrets)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSecrets ? 'Hide' : 'Show'}
            </motion.button>
          </div>
        </div>

        {configurations
          .filter(config => config.platform === selectedPlatform)
          .map((config) => (
            <div key={config.platform} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={showSecrets ? config.clientId : '••••••••••••••••'}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.clientSecret}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    Test Mode: {config.testMode ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
                  style={{ backgroundColor: '#146443', color: 'white' }}
                >
                  <Settings className="w-4 h-4" />
                  Update Configuration
                </motion.button>
              </div>
            </div>
          ))}
      </div>

      {/* Add Endpoint Modal */}
      {showAddEndpointModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Conversion Endpoint</h2>
              <button
                onClick={() => setShowAddEndpointModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowAddEndpointModal(false); alert('Endpoint added successfully!'); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Custom CRM API"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select platform</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://api.platform.com/conversions"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authentication</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="api_key">API Key</option>
                    <option value="oauth">OAuth</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Events (comma-separated)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="purchase, lead, signup"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddEndpointModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Endpoint
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Endpoint Modal */}
      {showEditEndpointModal && editingEndpoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Endpoint: {editingEndpoint.name}</h2>
              <button
                onClick={() => setShowEditEndpointModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint Name</label>
                  <input
                    type="text"
                    defaultValue={editingEndpoint.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    defaultValue={editingEndpoint.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
                <input
                  type="url"
                  defaultValue={editingEndpoint.endpoint}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
                <input
                  type="text"
                  defaultValue={editingEndpoint.events.join(', ')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEditEndpointModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowEditEndpointModal(false);
                    alert('Endpoint updated successfully!');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Test Conversion Modal */}
      {showTestConversionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Test Conversion Event</h2>
              <button
                onClick={() => setShowTestConversionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    {endpoints.map(endpoint => (
                      <option key={endpoint.id} value={endpoint.platform}>
                        {endpoint.platform} - {endpoint.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="purchase">Purchase</option>
                    <option value="lead">Lead</option>
                    <option value="signup">Sign Up</option>
                    <option value="view_content">View Content</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value (€)</label>
                  <input
                    type="number"
                    defaultValue={1500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Data (JSON)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  rows={4}
                  defaultValue={JSON.stringify({
                    user_id: 'test_user_123',
                    email: 'test@example.com',
                    timestamp: new Date().toISOString()
                  }, null, 2)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowTestConversionModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const success = Math.random() > 0.2;
                    setShowTestConversionModal(false);
                    if (success) {
                      alert('✅ Test conversion sent successfully!\nCheck the platform dashboard for results.');
                    } else {
                      alert('❌ Test conversion failed!\nPlease check your endpoint configuration.');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  style={{ backgroundColor: '#146443' }}
                >
                  <Target className="w-4 h-4" />
                  Send Test Event
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">API Configuration</h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Enhanced Privacy & Security</h3>
                <p className="text-blue-800 text-sm">
                  Server-side conversion tracking ensures better data accuracy and privacy compliance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Timeout (ms)</label>
                  <input
                    type="number"
                    defaultValue={5000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retry Attempts</label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700">Enable automatic retries for failed requests</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-700">Log all conversion events for debugging</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfigModal(false);
                    alert('Configuration saved successfully!');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ConversionAPI;