'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, TrendingUp, Users, DollarSign, Eye, MousePointer, Target, Calendar, Settings, Play, Pause, X } from 'lucide-react';

const LinkedInCampaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);

  const campaigns = [
    {
      id: 'li-b2b-solar',
      name: 'B2B Solar Solutions',
      status: 'active',
      budget: 1000,
      spent: 756.20,
      impressions: 15670,
      clicks: 234,
      leads: 23,
      connections: 89,
      ctr: 1.49,
      cpc: 3.23,
      costPerLead: 32.88,
      startDate: '2025-10-01',
      endDate: '2025-10-31'
    },
    {
      id: 'li-commercial',
      name: 'Commercial Energy Efficiency',
      status: 'active',
      budget: 800,
      spent: 598.40,
      impressions: 12340,
      clicks: 167,
      leads: 18,
      connections: 67,
      ctr: 1.35,
      cpc: 3.58,
      costPerLead: 33.24,
      startDate: '2025-09-25',
      endDate: '2025-10-25'
    },
    {
      id: 'li-thought-leadership',
      name: 'Renewable Energy Thought Leadership',
      status: 'paused',
      budget: 600,
      spent: 423.80,
      impressions: 8940,
      clicks: 134,
      leads: 12,
      connections: 45,
      ctr: 1.50,
      cpc: 3.16,
      costPerLead: 35.32,
      startDate: '2025-09-15',
      endDate: '2025-10-15'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
            <Linkedin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Campaigns</h1>
            <p className="text-gray-600">Manage LinkedIn advertising and lead generation campaigns</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="LinkedIn Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-blue-800 flex items-center gap-2"
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
            <span className="text-green-600 text-sm font-medium">+22%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">€1,778</p>
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
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+18%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">36.9K</p>
          <p className="text-sm text-gray-600">Impressions</p>
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
            <span className="text-green-600 text-sm font-medium">+14%</span>
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
            <span className="text-green-600 text-sm font-medium">+25%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">53</p>
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
          <h3 className="text-lg font-bold text-gray-900">LinkedIn Campaigns</h3>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
                    <Linkedin className="w-6 h-6 text-white" />
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
                        <span className="text-gray-600">Impressions:</span>
                        <div className="font-medium">{campaign.impressions.toLocaleString()}</div>
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
                      <span>Connections: {campaign.connections}</span>
                      <span>Period: {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCampaign(selectedCampaign === campaign.id ? null : campaign.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  <button 
                    onClick={() => {
                      setEditingCampaign(campaign);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Industry Targeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Industry Performance</h3>
        <div className="space-y-3">
          {[
            { industry: 'Manufacturing', impressions: 8750, clicks: 145, ctr: 1.66, leads: 12 },
            { industry: 'Construction', impressions: 7890, clicks: 128, ctr: 1.62, leads: 11 },
            { industry: 'Real Estate', impressions: 6420, clicks: 98, ctr: 1.53, leads: 8 },
            { industry: 'Technology', impressions: 5890, clicks: 89, ctr: 1.51, leads: 7 },
            { industry: 'Hospitality', impressions: 4670, clicks: 67, ctr: 1.43, leads: 5 }
          ].map((industry, index) => (
            <div key={industry.industry} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-900">{industry.industry}</span>
              </div>
              <div className="grid grid-cols-4 gap-6 text-sm">
                <div className="text-right">
                  <div className="font-medium">{industry.impressions.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Impressions</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{industry.clicks}</div>
                  <div className="text-xs text-gray-500">Clicks</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{industry.ctr}%</div>
                  <div className="text-xs text-gray-500">CTR</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">{industry.leads}</div>
                  <div className="text-xs text-gray-500">Leads</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create LinkedIn Campaign</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Objective</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="lead-generation">Lead Generation</option>
                    <option value="brand-awareness">Brand Awareness</option>
                    <option value="website-traffic">Website Traffic</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget (€)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bid Strategy</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="auto">Automatic Bidding</option>
                    <option value="cpc">Manual CPC</option>
                    <option value="cpm">Cost per 1000 Impressions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Industries</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Manufacturing, Construction, Real Estate"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Titles</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="CEO, CFO, Facilities Manager, Operations Director"
                ></textarea>
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
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && editingCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Campaign: {editingCampaign.name}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    defaultValue={editingCampaign.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    defaultValue={editingCampaign.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget (€)</label>
                  <input
                    type="number"
                    defaultValue={editingCampaign.budget}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Lead (€)</label>
                  <input
                    type="number"
                    defaultValue={editingCampaign.costPerLead}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">LinkedIn Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Ad Account ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="GMT">GMT (Dublin)</option>
                  <option value="EST">EST (New York)</option>
                  <option value="PST">PST (Los Angeles)</option>
                </select>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="conversion-tracking" className="mr-2" />
                <label htmlFor="conversion-tracking" className="text-sm text-gray-700">Enable conversion tracking</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800">
                Save Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LinkedInCampaigns;