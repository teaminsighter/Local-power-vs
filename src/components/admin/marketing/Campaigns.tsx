'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Facebook, Search, Mail, Linkedin, Play } from 'lucide-react';
import FacebookCampaigns from './FacebookCampaigns';
import GoogleCampaigns from './GoogleCampaigns';
import EmailCampaigns from './EmailCampaigns';
import LinkedInCampaigns from './LinkedInCampaigns';
import TikTokCampaigns from './TikTokCampaigns';

const Campaigns = () => {
  const [activeSubTab, setActiveSubTab] = useState('facebook');

  const subTabs = [
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: <Facebook className="w-4 h-4" />,
      component: FacebookCampaigns,
      color: 'text-blue-600 border-blue-600'
    },
    { 
      id: 'google', 
      name: 'Google', 
      icon: <Search className="w-4 h-4" />,
      component: GoogleCampaigns,
      color: 'text-red-600 border-red-600'
    },
    { 
      id: 'email', 
      name: 'Email', 
      icon: <Mail className="w-4 h-4" />,
      component: EmailCampaigns,
      color: 'text-green-600 border-green-600'
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: <Linkedin className="w-4 h-4" />,
      component: LinkedInCampaigns,
      color: 'text-blue-700 border-blue-700'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: <Play className="w-4 h-4" />,
      component: TikTokCampaigns,
      color: 'text-pink-600 border-pink-600'
    }
  ];

  const ActiveComponent = subTabs.find(tab => tab.id === activeSubTab)?.component || FacebookCampaigns;

  return (
    <div>
      {/* Sub-tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {subTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeSubTab === tab.id
                  ? `${tab.color} bg-gray-50`
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.icon}
              {tab.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Active Component */}
      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <ActiveComponent />
      </motion.div>
    </div>
  );
};

export default Campaigns;