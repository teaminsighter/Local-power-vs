'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, TrendingUp, Users, Eye, MousePointer, Target, Calendar, Settings, Send, Pause } from 'lucide-react';

const EmailCampaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const campaigns = [
    {
      id: 'email-welcome-series',
      name: 'Welcome Series - New Leads',
      type: 'Automation',
      status: 'active',
      recipients: 1247,
      sent: 1247,
      opened: 892,
      clicked: 234,
      converted: 67,
      openRate: 71.5,
      clickRate: 18.8,
      conversionRate: 5.4,
      revenue: 89340,
      lastSent: '2025-10-12T08:30:00'
    },
    {
      id: 'email-solar-summer',
      name: 'Solar Summer Sale 2025',
      type: 'Campaign',
      status: 'active',
      recipients: 3456,
      sent: 3456,
      opened: 2134,
      clicked: 445,
      converted: 89,
      openRate: 61.8,
      clickRate: 12.9,
      conversionRate: 2.6,
      revenue: 156780,
      lastSent: '2025-10-11T10:00:00'
    },
    {
      id: 'email-newsletter',
      name: 'Monthly Energy Newsletter',
      type: 'Newsletter',
      status: 'scheduled',
      recipients: 5672,
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      revenue: 0,
      lastSent: null,
      scheduledFor: '2025-10-15T09:00:00'
    },
    {
      id: 'email-abandoned-quote',
      name: 'Abandoned Quote Follow-up',
      type: 'Automation',
      status: 'paused',
      recipients: 567,
      sent: 567,
      opened: 234,
      clicked: 78,
      converted: 23,
      openRate: 41.3,
      clickRate: 13.8,
      conversionRate: 4.1,
      revenue: 34560,
      lastSent: '2025-10-10T14:20:00'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Campaign': return 'bg-blue-100 text-blue-800';
      case 'Automation': return 'bg-green-100 text-green-800';
      case 'Newsletter': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
            <p className="text-gray-600">Manage email marketing campaigns and automations</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-blue-700 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
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
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">5,270</p>
          <p className="text-sm text-gray-600">Emails Sent</p>
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
            <span className="text-green-600 text-sm font-medium">+8%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">58.2%</p>
          <p className="text-sm text-gray-600">Open Rate</p>
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
            <span className="text-green-600 text-sm font-medium">+5%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">15.1%</p>
          <p className="text-sm text-gray-600">Click Rate</p>
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
            <span className="text-green-600 text-sm font-medium">+18%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">€280,680</p>
          <p className="text-sm text-gray-600">Revenue Generated</p>
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
          <h3 className="text-lg font-bold text-gray-900">Email Campaigns</h3>
          <div className="text-sm text-gray-600">
            {campaigns.filter(c => c.status === 'active').length} active campaigns
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
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                        {campaign.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : campaign.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Recipients:</span>
                        <div className="font-medium">{campaign.recipients.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Open Rate:</span>
                        <div className="font-medium text-green-600">{campaign.openRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Click Rate:</span>
                        <div className="font-medium text-blue-600">{campaign.clickRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Conv. Rate:</span>
                        <div className="font-medium text-purple-600">{campaign.conversionRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversions:</span>
                        <div className="font-medium">{campaign.converted}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Revenue:</span>
                        <div className="font-medium text-yellow-600">€{campaign.revenue.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {campaign.lastSent && (
                        <span>Last sent: {new Date(campaign.lastSent).toLocaleDateString()} at {new Date(campaign.lastSent).toLocaleTimeString()}</span>
                      )}
                      {campaign.scheduledFor && (
                        <span>Scheduled for: {new Date(campaign.scheduledFor).toLocaleDateString()} at {new Date(campaign.scheduledFor).toLocaleTimeString()}</span>
                      )}
                      <span>Opened: {campaign.opened.toLocaleString()}</span>
                      <span>Clicked: {campaign.clicked.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCampaign(selectedCampaign === campaign.id ? null : campaign.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Send className="w-4 h-4" />}
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

      {/* Email Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Email Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Performing Subject Lines</h4>
            <div className="space-y-2">
              {[
                { subject: 'Your Solar Quote is Ready! 🌞', openRate: 78.5 },
                { subject: 'Save €2,000+ with Solar Panels', openRate: 72.3 },
                { subject: 'FREE Solar Survey for Your Home', openRate: 69.1 },
                { subject: 'Ireland\'s #1 Solar Installation', openRate: 65.8 }
              ].map((email, index) => (
                <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <span className="text-sm text-gray-900">{email.subject}</span>
                  <span className="text-sm font-medium text-green-600">{email.openRate}%</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Campaign Performance Trends</h4>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Performance chart</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailCampaigns;