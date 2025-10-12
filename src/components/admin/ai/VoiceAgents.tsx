'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Phone, Settings, Play, Pause, Volume2, Users } from 'lucide-react';

const VoiceAgents = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const voiceAgents = [
    {
      id: 'sales-agent',
      name: 'Solar Sales Agent',
      status: 'active',
      calls: 142,
      conversion: 18.5,
      description: 'Handles initial sales inquiries and product demonstrations',
      language: 'English (Irish)',
      voice: 'Sarah - Professional Female'
    },
    {
      id: 'support-agent',
      name: 'Customer Support Agent',
      status: 'active',
      calls: 89,
      conversion: 85.2,
      description: 'Provides technical support and installation guidance',
      language: 'English (Irish)',
      voice: 'Michael - Friendly Male'
    },
    {
      id: 'booking-agent',
      name: 'Appointment Booking Agent',
      status: 'paused',
      calls: 67,
      conversion: 72.1,
      description: 'Schedules consultations and site surveys',
      language: 'English (Irish)',
      voice: 'Emma - Warm Female'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voice Agents</h1>
          <p className="text-gray-600 mt-1">Manage AI-powered voice assistants for customer interactions</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-green-700 flex items-center gap-2"
        >
          <Mic className="w-4 h-4" />
          Create Voice Agent
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
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">298</p>
          <p className="text-sm text-gray-600">Total Calls Today</p>
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
          <p className="text-2xl font-bold text-gray-900">58.6%</p>
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
              <Volume2 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+5%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">4.2/5</p>
          <p className="text-sm text-gray-600">Customer Satisfaction</p>
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
            <span className="text-green-600 text-sm font-medium">3/3</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-600">Active Agents</p>
        </motion.div>
      </div>

      {/* Voice Agents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Voice Agents</h3>
          <div className="text-sm text-gray-600">
            {voiceAgents.length} agents configured
          </div>
        </div>

        <div className="space-y-4">
          {voiceAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                    <p className="text-sm text-gray-600">{agent.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Voice: {agent.voice}</span>
                      <span>Language: {agent.language}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{agent.calls}</div>
                    <div className="text-xs text-gray-500">Calls</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{agent.conversion}%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {agent.status}
                    </span>
                    
                    <button
                      onClick={() => setActiveAgent(activeAgent === agent.id ? null : agent.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Real-time Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Live Call Activity</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-900">Solar Sales Agent</span>
              <span className="text-sm text-gray-600">• Active call with +353 1 234 5678</span>
            </div>
            <span className="text-sm text-green-600">2:34 duration</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-900">Customer Support Agent</span>
              <span className="text-sm text-gray-600">• Active call with +353 21 987 6543</span>
            </div>
            <span className="text-sm text-blue-600">0:47 duration</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceAgents;