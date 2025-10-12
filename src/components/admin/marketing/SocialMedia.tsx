'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle } from 'lucide-react';
import ContentCalendar from './ContentCalendar';
import Comments from './Comments';

const SocialMedia = () => {
  const [activeSubTab, setActiveSubTab] = useState('content-calendar');

  const subTabs = [
    { 
      id: 'content-calendar', 
      name: 'Content Calendar', 
      icon: <Calendar className="w-4 h-4" />,
      component: ContentCalendar,
      color: 'text-purple-600 border-purple-600'
    },
    { 
      id: 'comments', 
      name: 'Comments', 
      icon: <MessageCircle className="w-4 h-4" />,
      component: Comments,
      color: 'text-green-600 border-green-600'
    }
  ];

  const ActiveComponent = subTabs.find(tab => tab.id === activeSubTab)?.component || ContentCalendar;

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

export default SocialMedia;