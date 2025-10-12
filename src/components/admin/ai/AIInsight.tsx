'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ChatbotQuery from './ChatbotQuery';
import AutoReports from './AutoReports';
import Recommendations from './Recommendations';
import PerformanceAlerts from './PerformanceAlerts';

interface SubTab {
  id: string;
  name: string;
  component: React.ComponentType<any>;
}

const subTabs: SubTab[] = [
  { id: 'chatbot', name: 'Chatbot Query', component: ChatbotQuery },
  { id: 'auto-reports', name: 'Auto Reports', component: AutoReports },
  { id: 'recommendations', name: 'Recommendations', component: Recommendations },
  { id: 'alerts', name: 'Performance Alerts', component: PerformanceAlerts }
];

const AIInsight = () => {
  const [activeSubTab, setActiveSubTab] = useState('chatbot');

  const currentSubTab = subTabs.find(tab => tab.id === activeSubTab);
  const CurrentComponent = currentSubTab?.component || ChatbotQuery;

  return (
    <div className="h-full flex flex-col">
      {/* Sub-tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex space-x-8 px-6">
          {subTabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSubTab === subTab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {subTab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tab Content */}
      <div className="flex-1 overflow-auto">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <CurrentComponent />
        </motion.div>
      </div>
    </div>
  );
};

export default AIInsight;