'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Users, DollarSign, Eye, MousePointer, Target, Calendar, Settings, Pause } from 'lucide-react';

const TikTokCampaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const campaigns = [
    {
      id: 'tt-solar-gen-z',
      name: 'Solar Energy for Young Homeowners',
      status: 'active',
      budget: 500,
      spent: 378.90,
      impressions: 89450,
      views: 45670,
      clicks: 567,
      shares: 234,
      comments: 156,
      likes: 1247,
      ctr: 1.24,
      cpc: 0.67,
      engagementRate: 4.23,
      startDate: '2025-10-05',
      endDate: '2025-11-05'
    },
    {
      id: 'tt-sustainability',
      name: 'Sustainable Living Tips',
      status: 'active',
      budget: 300,
      spent: 198.60,
      impressions: 67890,
      views: 34560,
      clicks: 423,
      shares: 189,
      comments: 98,
      likes: 892,
      ctr: 1.22,
      cpc: 0.47,
      engagementRate: 3.87,
      startDate: '2025-10-01',
      endDate: '2025-10-31'
    },
    {
      id: 'tt-home-energy',
      name: 'Home Energy Efficiency Hacks',
      status: 'paused',
      budget: 400,
      spent: 267.40,
      impressions: 45670,
      views: 23890,
      clicks: 298,
      shares: 134,
      comments: 76,
      likes: 678,
      ctr: 1.25,
      cpc: 0.90,
      engagementRate: 3.64,
      startDate: '2025-09-20',
      endDate: '2025-10-20'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TikTok Campaigns</h1>
            <p className="text-gray-600">Manage TikTok advertising and content campaigns</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all hover:from-pink-600 hover:to-purple-700 flex items-center gap-2"
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
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-pink-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+32%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">€845</p>
          <p className="text-sm text-gray-600">Total Spend</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+45%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">203K</p>
          <p className="text-sm text-gray-600">Views</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+28%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,288</p>
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
            <span className="text-green-600 text-sm font-medium">+52%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">3.98%</p>
          <p className="text-sm text-gray-600">Avg Engagement Rate</p>
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
          <h3 className="text-lg font-bold text-gray-900">TikTok Campaigns</h3>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
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
                    
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Budget:</span>
                        <div className="font-medium">€{campaign.budget}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Spent:</span>
                        <div className="font-medium text-pink-600">€{campaign.spent}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Views:</span>
                        <div className="font-medium">{campaign.views.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Clicks:</span>
                        <div className="font-medium">{campaign.clicks}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Likes:</span>
                        <div className="font-medium">{campaign.likes}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Shares:</span>
                        <div className="font-medium">{campaign.shares}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Engagement:</span>
                        <div className="font-medium text-purple-600">{campaign.engagementRate}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>CTR: {campaign.ctr}%</span>
                      <span>CPC: €{campaign.cpc}</span>
                      <span>Comments: {campaign.comments}</span>
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
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Content Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Trending Hashtags</h4>
            <div className="space-y-2">
              {[
                { tag: '#SolarPower', usage: 245, engagement: 4.8 },
                { tag: '#GreenEnergy', usage: 189, engagement: 4.2 },
                { tag: '#EcoFriendly', usage: 167, engagement: 3.9 },
                { tag: '#Sustainability', usage: 134, engagement: 3.7 }
              ].map((tag, index) => (
                <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <span className="text-sm text-gray-900 font-medium">{tag.tag}</span>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{tag.usage} uses</span>
                    <span className="text-purple-600 font-medium">{tag.engagement}% engagement</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Content Types Performance</h4>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Content performance chart</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TikTokCampaigns;