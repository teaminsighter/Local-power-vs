'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, TrendingUp, Users, DollarSign, Eye, MousePointer, Target, Calendar, Settings, Play, Pause } from 'lucide-react';

const FacebookCampaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState([
    {
      id: 'fb-solar-awareness',
      name: 'Solar Panel Awareness',
      status: 'active',
      budget: 800,
      spent: 634.50,
      reach: 12450,
      engagement: 847,
      clicks: 234,
      leads: 18,
      ctr: 1.88,
      cpc: 2.71,
      costPerLead: 35.25,
      startDate: '2025-10-01',
      endDate: '2025-10-31'
    },
    {
      id: 'fb-heat-pump',
      name: 'Heat Pump Installation',
      status: 'active',
      budget: 600,
      spent: 467.80,
      reach: 8930,
      engagement: 623,
      clicks: 189,
      leads: 14,
      ctr: 2.12,
      cpc: 2.47,
      costPerLead: 33.41,
      startDate: '2025-09-25',
      endDate: '2025-10-25'
    },
    {
      id: 'fb-battery-storage',
      name: 'Battery Storage Solutions',
      status: 'paused',
      budget: 400,
      spent: 298.45,
      reach: 5670,
      engagement: 398,
      clicks: 112,
      leads: 8,
      ctr: 1.97,
      cpc: 2.66,
      costPerLead: 37.31,
      startDate: '2025-09-15',
      endDate: '2025-10-15'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleCreateCampaign = () => {
    setShowCreateModal(true);
  };

  const handleToggleCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';
        return { ...campaign, status: newStatus };
      }
      return campaign;
    }));
  };

  const handleEditCampaign = (campaignId: string) => {
    setShowEditModal(campaignId);
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  const handleCreateNewCampaign = (campaignData: any) => {
    const newCampaign = {
      id: `fb-${Date.now()}`,
      name: campaignData.name,
      status: 'active',
      budget: campaignData.budget,
      spent: 0,
      reach: 0,
      engagement: 0,
      clicks: 0,
      leads: 0,
      ctr: 0,
      cpc: 0,
      costPerLead: 0,
      startDate: campaignData.startDate,
      endDate: campaignData.endDate
    };
    setCampaigns(prev => [...prev, newCampaign]);
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Facebook className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facebook Campaigns</h1>
            <p className="text-gray-600">Manage Facebook and Instagram advertising campaigns</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenSettings}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Facebook Campaign Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateCampaign}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <Target className="w-4 h-4" />
            Create Campaign
          </motion.button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+15%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">€1,401</p>
          <p className="text-sm text-gray-600">Total Spend</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+8%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">27,050</p>
          <p className="text-sm text-gray-600">Total Reach</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-red-600 text-sm font-medium">-2%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">535</p>
          <p className="text-sm text-gray-600">Total Clicks</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">40</p>
          <p className="text-sm text-gray-600">Leads Generated</p>
        </motion.div>
      </div>

      {/* Campaigns List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Active Campaigns</h3>
          <div className="text-sm text-gray-600">
            {campaigns.filter(c => c.status === 'active').length} of {campaigns.length} campaigns active
          </div>
        </div>

        <div className="space-y-4">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Budget:</span>
                        <div className="font-medium">€{campaign.budget}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Spent:</span>
                        <div className="font-medium text-blue-600">€{campaign.spent}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Reach:</span>
                        <div className="font-medium">{campaign.reach.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Clicks:</span>
                        <div className="font-medium">{campaign.clicks}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">CTR:</span>
                        <div className="font-medium">{campaign.ctr}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Leads:</span>
                        <div className="font-medium text-green-600">{campaign.leads}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>Cost per Lead: €{campaign.costPerLead}</span>
                      <span>CPC: €{campaign.cpc}</span>
                      <span>Period: {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleCampaign(campaign.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                  >
                    {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  <button 
                    onClick={() => handleEditCampaign(campaign.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit Campaign"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Performance</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Performance chart will be displayed here</p>
            <p className="text-sm text-gray-500">Integration with Facebook Analytics API</p>
          </div>
        </div>
      </motion.div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create Facebook Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Solar Panel Awareness Q4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Objective</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Lead Generation</option>
                    <option>Traffic</option>
                    <option>Conversions</option>
                    <option>Brand Awareness</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Budget (€)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Duration</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>30 days</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Age range (e.g., 25-65)"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Location (e.g., Ireland)"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests & Behaviors</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="e.g., Solar energy, Home improvement, Environmental sustainability"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleCreateNewCampaign({
                    name: "New Campaign",
                    budget: 800,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
                  });
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Campaign
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Campaign</h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  defaultValue={campaigns.find(c => c.id === showEditModal)?.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Budget (€)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  defaultValue={campaigns.find(c => c.id === showEditModal)?.budget}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditModal(null)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Facebook Campaign Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Campaign Duration</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>30 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto-pause Low Performers</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@localpower.ie"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSettingsModal(false)}
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

export default FacebookCampaigns;