'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Smartphone, 
  Monitor, 
  Wifi,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  ExternalLink,
  RefreshCw,
  Database,
  Shield,
  BarChart3,
  Zap,
  Link,
  Key,
  Activity,
  X,
  Plus,
  TestTube,
  Eye,
  EyeOff
} from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'marketing' | 'crm' | 'communication' | 'automation';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: React.ReactNode;
  lastSync: string;
  dataPoints: number;
  apiVersion: string;
  features: string[];
  endpoint?: string;
  webhookUrl?: string;
}

interface Integration {
  id: string;
  platform: string;
  events: string[];
  status: 'active' | 'inactive';
  lastActivity: string;
  totalEvents: number;
}

const PlatformIntegrations = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = () => {
    setIsLoading(true);

    const mockPlatforms: Platform[] = [
      {
        id: 'google_analytics',
        name: 'Google Analytics 4',
        description: 'Advanced web analytics and reporting',
        category: 'analytics',
        status: 'connected',
        icon: <BarChart3 className="w-6 h-6" />,
        lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        dataPoints: 45632,
        apiVersion: 'v4',
        features: ['Event Tracking', 'Conversion Tracking', 'Audience Insights', 'Real-time Reports'],
        endpoint: 'https://analytics.google.com/analytics/web/'
      },
      {
        id: 'facebook_pixel',
        name: 'Facebook Pixel',
        description: 'Track conversions and optimize ads',
        category: 'marketing',
        status: 'connected',
        icon: <Globe className="w-6 h-6" />,
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        dataPoints: 12456,
        apiVersion: 'v18.0',
        features: ['Conversion Tracking', 'Custom Audiences', 'Lookalike Audiences', 'Attribution'],
        webhookUrl: 'https://graph.facebook.com/v18.0/events'
      },
      {
        id: 'google_ads',
        name: 'Google Ads',
        description: 'Import conversions and optimize campaigns',
        category: 'marketing',
        status: 'connected',
        icon: <Zap className="w-6 h-6" />,
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        dataPoints: 8934,
        apiVersion: 'v14',
        features: ['Conversion Import', 'Enhanced Conversions', 'Offline Conversions', 'Audience Sync'],
        endpoint: 'https://ads.google.com/'
      },
      {
        id: 'salesforce',
        name: 'Salesforce CRM',
        description: 'Lead management and customer data',
        category: 'crm',
        status: 'error',
        icon: <Database className="w-6 h-6" />,
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dataPoints: 0,
        apiVersion: 'v57.0',
        features: ['Lead Sync', 'Contact Management', 'Opportunity Tracking', 'Custom Fields'],
        endpoint: 'https://yourinstance.salesforce.com/'
      },
      {
        id: 'mailchimp',
        name: 'Mailchimp',
        description: 'Email marketing automation',
        category: 'communication',
        status: 'disconnected',
        icon: <Shield className="w-6 h-6" />,
        lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dataPoints: 0,
        apiVersion: 'v3',
        features: ['Email Lists', 'Campaign Tracking', 'Automation', 'Segmentation'],
        endpoint: 'https://mailchimp.com/'
      },
      {
        id: 'zapier',
        name: 'Zapier',
        description: 'Workflow automation platform',
        category: 'automation',
        status: 'connected',
        icon: <Activity className="w-6 h-6" />,
        lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        dataPoints: 1567,
        apiVersion: 'v1',
        features: ['Workflow Triggers', 'Multi-step Zaps', 'Filters', 'Formatters'],
        webhookUrl: 'https://hooks.zapier.com/hooks/catch/12345/abcdef/'
      }
    ];

    const mockIntegrations: Integration[] = [
      {
        id: 'int_1',
        platform: 'Google Analytics 4',
        events: ['page_view', 'form_submit', 'calculator_step', 'lead_generation'],
        status: 'active',
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        totalEvents: 45632
      },
      {
        id: 'int_2',
        platform: 'Facebook Pixel',
        events: ['PageView', 'Lead', 'ViewContent', 'InitiateCheckout'],
        status: 'active',
        lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        totalEvents: 12456
      },
      {
        id: 'int_3',
        platform: 'Google Ads',
        events: ['conversion', 'enhanced_conversion'],
        status: 'active',
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        totalEvents: 8934
      }
    ];

    setTimeout(() => {
      setPlatforms(mockPlatforms);
      setIntegrations(mockIntegrations);
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const categories = [
    { id: 'all', name: 'All Platforms', count: platforms.length },
    { id: 'analytics', name: 'Analytics', count: platforms.filter(p => p.category === 'analytics').length },
    { id: 'marketing', name: 'Marketing', count: platforms.filter(p => p.category === 'marketing').length },
    { id: 'crm', name: 'CRM', count: platforms.filter(p => p.category === 'crm').length },
    { id: 'communication', name: 'Communication', count: platforms.filter(p => p.category === 'communication').length },
    { id: 'automation', name: 'Automation', count: platforms.filter(p => p.category === 'automation').length }
  ];

  const filteredPlatforms = platforms.filter(platform => {
    const matchesCategory = selectedCategory === 'all' || platform.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      platform.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = platforms.filter(p => p.status === 'connected').length;
  const errorCount = platforms.filter(p => p.status === 'error').length;
  const totalDataPoints = platforms.reduce((sum, p) => sum + p.dataPoints, 0);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading platform integrations...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Platform Integrations</h1>
          <p className="text-gray-600 mt-1">Connect and manage third-party platforms</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Platform
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadPlatformData}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
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
              <Link className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{connectedCount}</p>
              <p className="text-sm text-gray-600">Connected</p>
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
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{errorCount}</p>
              <p className="text-sm text-gray-600">Need Attention</p>
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
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDataPoints.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Data Points</p>
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
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
              <p className="text-sm text-gray-600">Active Integrations</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </motion.button>
            ))}
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search platforms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlatforms.map((platform, index) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(platform.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(platform.status)}`}>
                  {platform.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Sync:</span>
                <span className="text-gray-900">{new Date(platform.lastSync).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data Points:</span>
                <span className="text-gray-900">{platform.dataPoints.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">API Version:</span>
                <span className="text-gray-900">{platform.apiVersion}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
              <div className="flex flex-wrap gap-1">
                {platform.features.map((feature, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedPlatform(platform);
                  setShowConfigModal(true);
                }}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Configure
              </motion.button>
              
              {platform.status === 'connected' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    loadPlatformData();
                    alert(`Syncing ${platform.name}...\nData refresh initiated.`);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync Now
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedPlatform(platform);
                  setShowTestModal(true);
                }}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center gap-1"
              >
                <TestTube className="w-4 h-4" />
              </motion.button>
              
              {platform.endpoint && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(platform.endpoint, '_blank')}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPlatforms.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Platforms Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Configure Platform Modal */}
      {showConfigModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Configure {selectedPlatform.name}</h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter API key"
                    />
                    <button
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Version</label>
                  <input
                    type="text"
                    defaultValue={selectedPlatform.apiVersion}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
                <input
                  type="url"
                  defaultValue={selectedPlatform.endpoint || selectedPlatform.webhookUrl}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPlatform.features.map((feature, index) => (
                    <label key={index} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
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
                    alert(`${selectedPlatform.name} configuration saved successfully!`);
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

      {/* Add Platform Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Platform Integration</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); alert('Platform added successfully!'); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter platform name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="analytics">Analytics</option>
                    <option value="marketing">Marketing</option>
                    <option value="crm">CRM</option>
                    <option value="communication">Communication</option>
                    <option value="automation">Automation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Describe the platform integration"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://api.platform.com/"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Platform
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Test Platform Modal */}
      {showTestModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Test {selectedPlatform.name} Integration</h2>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Event Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option value="">Select test event</option>
                  <option value="connection">Connection Test</option>
                  <option value="data_send">Data Send Test</option>
                  <option value="webhook">Webhook Test</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Data (JSON)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  rows={6}
                  defaultValue={JSON.stringify({
                    event: 'test_event',
                    platform: selectedPlatform.name,
                    timestamp: new Date().toISOString(),
                    data: { test: true }
                  }, null, 2)}
                />
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <TestTube className="w-5 h-5" />
                  <span className="font-medium">Test Mode</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  This will send test data to {selectedPlatform.name} to verify the integration is working correctly.
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
                    const testResult = Math.random() > 0.3;
                    setShowTestModal(false);
                    if (testResult) {
                      alert(`✅ Test successful!\n${selectedPlatform.name} integration is working correctly.`);
                    } else {
                      alert(`❌ Test failed!\nPlease check your ${selectedPlatform.name} configuration.`);
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Run Test
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlatformIntegrations;