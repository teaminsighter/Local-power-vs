'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, CheckCircle, AlertCircle, Mail, MessageSquare, Phone, Settings, Plus } from 'lucide-react';

const AutoReplies = () => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const replyTemplates = [
    {
      id: 'email-inquiry',
      name: 'Email Inquiry Response',
      type: 'Email',
      trigger: 'New email received',
      status: 'active',
      responses: 142,
      avgTime: '< 30 seconds',
      successRate: 94.2,
      template: 'Thank you for your interest in solar panels! We\'ve received your inquiry and our team will respond within 2 hours.',
      conditions: ['Contains: solar, panels, quote', 'Working hours: 9-17', 'Not existing customer']
    },
    {
      id: 'phone-missed',
      name: 'Missed Call Follow-up',
      type: 'SMS',
      trigger: 'Missed phone call',
      status: 'active',
      responses: 89,
      avgTime: '< 1 minute',
      successRate: 87.6,
      template: 'Hi! We missed your call. Text us back or visit our website to get a free solar quote: localpower.ie',
      conditions: ['Call duration: < 10 seconds', 'Business hours only', 'Irish mobile numbers']
    },
    {
      id: 'chat-support',
      name: 'Website Chat Support',
      type: 'Chat',
      trigger: 'Chat initiated',
      status: 'active',
      responses: 267,
      avgTime: '< 5 seconds',
      successRate: 91.8,
      template: 'Hello! 👋 I\'m your Local Power assistant. How can I help you with solar energy today?',
      conditions: ['Website visitor', 'Not logged in', 'First message']
    },
    {
      id: 'quote-follow',
      name: 'Quote Follow-up',
      type: 'Email',
      trigger: 'Quote not viewed (24h)',
      status: 'active',
      responses: 56,
      avgTime: '24 hours',
      successRate: 73.4,
      template: 'Your solar quote is ready! Click here to view your personalized savings estimate.',
      conditions: ['Quote sent 24h ago', 'Email not opened', 'No follow-up sent']
    },
    {
      id: 'booking-confirm',
      name: 'Appointment Confirmation',
      type: 'SMS',
      trigger: 'Appointment booked',
      status: 'active',
      responses: 34,
      avgTime: '< 15 seconds',
      successRate: 98.1,
      template: 'Your solar consultation is confirmed for [DATE] at [TIME]. Our expert will call 15 mins before arrival.',
      conditions: ['Appointment scheduled', 'Customer mobile provided', 'Within 48h of booking']
    },
    {
      id: 'feedback-request',
      name: 'Installation Feedback',
      type: 'Email',
      trigger: 'Installation completed',
      status: 'paused',
      responses: 23,
      avgTime: '7 days',
      successRate: 65.2,
      template: 'How was your solar installation experience? Please share your feedback and help other Irish families go solar!',
      conditions: ['Installation status: Complete', '7 days after completion', 'Customer email available']
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email': return <Mail className="w-4 h-4" />;
      case 'SMS': return <MessageSquare className="w-4 h-4" />;
      case 'Chat': return <MessageCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Email': return 'bg-blue-100 text-blue-800';
      case 'SMS': return 'bg-green-100 text-green-800';
      case 'Chat': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auto Replies</h1>
          <p className="text-gray-600 mt-1">Automated response templates for customer communications</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Auto Reply
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+22%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">611</p>
          <p className="text-sm text-gray-600">Auto Replies Sent</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+8%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">88.9%</p>
          <p className="text-sm text-gray-600">Success Rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">-15%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">12s</p>
          <p className="text-sm text-gray-600">Avg Response Time</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">6/6</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">6</p>
          <p className="text-sm text-gray-600">Active Templates</p>
        </motion.div>
      </div>

      {/* Auto Reply Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Auto Reply Templates</h3>
          <div className="text-sm text-gray-600">
            {replyTemplates.filter(t => t.status === 'active').length} active templates
          </div>
        </div>

        <div className="space-y-4">
          {replyTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    {getTypeIcon(template.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                        {template.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {template.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{template.trigger}</p>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-800 italic">"{template.template}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Responses:</span>
                        <span className="font-medium ml-2">{template.responses}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Time:</span>
                        <span className="font-medium ml-2">{template.avgTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-medium ml-2 text-green-600">{template.successRate}%</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <button
                        onClick={() => setActiveTemplate(activeTemplate === template.id ? null : template.id)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {activeTemplate === template.id ? 'Hide' : 'Show'} Conditions
                      </button>
                    </div>

                    {activeTemplate === template.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Trigger Conditions:</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {template.conditions.map((condition, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Auto Reply Activity</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Email Inquiry Response</div>
                <div className="text-sm text-gray-600">Sent to +353 1 234 5678 • 2 minutes ago</div>
              </div>
            </div>
            <span className="text-sm text-green-600">Delivered</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Missed Call Follow-up</div>
                <div className="text-sm text-gray-600">Sent to john@example.com • 5 minutes ago</div>
              </div>
            </div>
            <span className="text-sm text-blue-600">Opened</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Website Chat Support</div>
                <div className="text-sm text-gray-600">Sent to website visitor • 8 minutes ago</div>
              </div>
            </div>
            <span className="text-sm text-purple-600">Replied</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AutoReplies;