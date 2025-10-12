'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, MousePointer, DollarSign, Eye, Target, Calendar, Settings, Play, Pause } from 'lucide-react';

const GoogleCampaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const campaigns = [
    {
      id: 'google-solar-search',
      name: 'Solar Panel Installation - Dublin',
      type: 'Search',
      status: 'active',
      budget: 1200,
      spent: 987.40,
      impressions: 45670,
      clicks: 892,
      conversions: 34,
      ctr: 1.95,
      cpc: 1.11,
      conversionRate: 3.81,
      costPerConversion: 29.04,
      keywords: 156
    },
    {
      id: 'google-display',
      name: 'Renewable Energy Awareness',
      type: 'Display',
      status: 'active',
      budget: 800,
      spent: 634.80,
      impressions: 128450,
      clicks: 567,
      conversions: 18,
      ctr: 0.44,
      cpc: 1.12,
      conversionRate: 3.17,
      costPerConversion: 35.27,
      keywords: 89
    },
    {
      id: 'google-shopping',
      name: 'Solar Equipment Shopping',
      type: 'Shopping',
      status: 'paused',
      budget: 600,
      spent: 423.60,
      impressions: 23890,
      clicks: 234,
      conversions: 12,
      ctr: 0.98,
      cpc: 1.81,
      conversionRate: 5.13,
      costPerConversion: 35.30,
      keywords: 45
    }
  ];

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'Search': return 'bg-blue-100 text-blue-800';
      case 'Display': return 'bg-green-100 text-green-800';
      case 'Shopping': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'Search': return <Search className="w-4 h-4" />;
      case 'Display': return <Eye className="w-4 h-4" />;
      case 'Shopping': return <Target className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 rounded-lg flex items-center justify-center">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Google Ads Campaigns</h1>
            <p className="text-gray-600">Manage Google Search, Display, and Shopping campaigns</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-blue-700 flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Create Campaign
        </motion.button>
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
            <span className="text-green-600 text-sm font-medium">+18%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">€2,045</p>
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
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">198K</p>
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
            <span className="text-green-600 text-sm font-medium">+8%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,693</p>
          <p className="text-sm text-gray-600">Clicks</p>
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
            <span className="text-green-600 text-sm font-medium">+22%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">64</p>
          <p className="text-sm text-gray-600">Conversions</p>
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
          <h3 className="text-lg font-bold text-gray-900">Campaign Performance</h3>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 rounded-lg flex items-center justify-center">
                    {getCampaignTypeIcon(campaign.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCampaignTypeColor(campaign.type)}`}>
                        {campaign.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-sm mb-3">
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
                        <span className="text-gray-600">Conv. Rate:</span>
                        <div className="font-medium">{campaign.conversionRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversions:</span>
                        <div className="font-medium text-green-600">{campaign.conversions}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>CPC: €{campaign.cpc}</span>
                      <span>Cost/Conv: €{campaign.costPerConversion}</span>
                      <span>Keywords: {campaign.keywords}</span>
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
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Keywords Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Keywords</h3>
        <div className="space-y-3">
          {[
            { keyword: 'solar panels dublin', impressions: 12450, clicks: 289, ctr: 2.32, cpc: 1.24 },
            { keyword: 'solar installation ireland', impressions: 8760, clicks: 198, ctr: 2.26, cpc: 1.18 },
            { keyword: 'renewable energy solutions', impressions: 6890, clicks: 145, ctr: 2.10, cpc: 1.35 },
            { keyword: 'solar panel cost', impressions: 5420, clicks: 123, ctr: 2.27, cpc: 1.42 },
            { keyword: 'heat pump installation', impressions: 4670, clicks: 98, ctr: 2.10, cpc: 1.51 }
          ].map((keyword, index) => (
            <div key={keyword.keyword} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-900">{keyword.keyword}</span>
              </div>
              <div className="grid grid-cols-4 gap-6 text-sm">
                <div className="text-right">
                  <div className="font-medium">{keyword.impressions.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Impressions</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{keyword.clicks}</div>
                  <div className="text-xs text-gray-500">Clicks</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{keyword.ctr}%</div>
                  <div className="text-xs text-gray-500">CTR</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">€{keyword.cpc}</div>
                  <div className="text-xs text-gray-500">CPC</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default GoogleCampaigns;