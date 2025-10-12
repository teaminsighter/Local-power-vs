'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Mail, MessageSquare, Users, Calendar, BarChart3, Zap } from 'lucide-react';

const MarketingAgents = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const marketingAgents = [
    {
      id: 'email-agent',
      name: 'Email Campaign Agent',
      type: 'Email Marketing',
      status: 'active',
      campaigns: 12,
      performance: 24.8,
      description: 'Automated email sequences for lead nurturing and customer retention',
      lastActive: '2 minutes ago',
      metrics: {
        sent: 2847,
        opened: 892,
        clicked: 234,
        converted: 89
      }
    },
    {
      id: 'social-agent',
      name: 'Social Media Agent',
      type: 'Social Marketing',
      status: 'active',
      campaigns: 8,
      performance: 18.2,
      description: 'Manages Facebook, Instagram and LinkedIn campaigns',
      lastActive: '5 minutes ago',
      metrics: {
        posts: 156,
        engagement: 3247,
        clicks: 567,
        leads: 78
      }
    },
    {
      id: 'retargeting-agent',
      name: 'Retargeting Agent',
      type: 'Display Ads',
      status: 'active',
      campaigns: 6,
      performance: 31.5,
      description: 'Retargets website visitors with personalized ad campaigns',
      lastActive: '1 minute ago',
      metrics: {
        impressions: 45670,
        clicks: 892,
        conversions: 67,
        cost: 456.78
      }
    },
    {
      id: 'seo-agent',
      name: 'SEO Optimization Agent',
      type: 'Content Marketing',
      status: 'paused',
      campaigns: 4,
      performance: 15.7,
      description: 'Optimizes content and manages keyword strategies',
      lastActive: '1 hour ago',
      metrics: {
        keywords: 234,
        rankings: 89,
        traffic: 1456,
        conversions: 23
      }
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Agents</h1>
          <p className="text-gray-600 mt-1">AI-powered marketing automation and campaign management</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-green-700 flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Create Marketing Agent
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
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+18%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">30</p>
          <p className="text-sm text-gray-600">Active Campaigns</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+24%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">22.8%</p>
          <p className="text-sm text-gray-600">Avg Conversion Rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,247</p>
          <p className="text-sm text-gray-600">Leads Generated</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-red-600 text-sm font-medium">-5%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">€2,456</p>
          <p className="text-sm text-gray-600">Cost per Lead</p>
        </motion.div>
      </div>

      {/* Marketing Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {marketingAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  {agent.type === 'Email Marketing' && <Mail className="w-6 h-6 text-white" />}
                  {agent.type === 'Social Marketing' && <MessageSquare className="w-6 h-6 text-white" />}
                  {agent.type === 'Display Ads' && <Target className="w-6 h-6 text-white" />}
                  {agent.type === 'Content Marketing' && <BarChart3 className="w-6 h-6 text-white" />}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {agent.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{agent.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">{agent.campaigns}</div>
                <div className="text-xs text-gray-500">Active Campaigns</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">{agent.performance}%</div>
                <div className="text-xs text-gray-500">Performance Score</div>
              </div>
            </div>

            {/* Agent-specific metrics */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
              {Object.entries(agent.metrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-sm font-medium text-gray-900">{value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 capitalize">{key}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">Last active: {agent.lastActive}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  View Details
                </button>
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Configure
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Campaign Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Campaign Actions
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-500">
            <div>
              <div className="font-medium text-gray-900">Email Campaign: Solar Summer Sale</div>
              <div className="text-sm text-gray-600">Email Campaign Agent • Scheduled for 2:00 PM</div>
            </div>
            <span className="text-sm text-blue-600">Today</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 border-l-4 border-green-500">
            <div>
              <div className="font-medium text-gray-900">Social Media: Weekend Promotion</div>
              <div className="text-sm text-gray-600">Social Media Agent • Scheduled for 6:00 PM</div>
            </div>
            <span className="text-sm text-green-600">Today</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 border-l-4 border-purple-500">
            <div>
              <div className="font-medium text-gray-900">Retargeting: Cart Abandonment</div>
              <div className="text-sm text-gray-600">Retargeting Agent • Triggered by user behavior</div>
            </div>
            <span className="text-sm text-purple-600">Ongoing</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MarketingAgents;