'use client';

import { motion } from 'framer-motion';
import { adminCategories } from './AdminDashboard';

interface AdminTopBarProps {
  activeCategory: string;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const AdminTopBar = ({ activeCategory, activeTab, onTabChange }: AdminTopBarProps) => {
  const currentCategory = adminCategories.find(cat => cat.id === activeCategory);
  
  if (!currentCategory) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#146443' }}>
              {currentCategory.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentCategory.name}
              </h2>
              <p className="text-sm text-gray-500">
                Manage and analyze your {currentCategory.name.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Export Data
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors text-sm font-medium shadow-sm"
          >
            + Add New
          </motion.button>

          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </motion.button>
        </div>
      </div>

      {/* Dynamic Tab Navigation */}
      <div className="px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {currentCategory.tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2'
                  : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300'
              }`}
              style={activeTab === tab.id ? { color: '#146443', borderColor: '#146443' } : {}}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {tab.name}
              
              {/* Active Tab Indicator */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                  layoutId={`activeTab-${activeCategory}`}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-600">
          <span className="text-green-600 font-medium">Admin</span>
          <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{currentCategory.name}</span>
          <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-green-600">
            {currentCategory.tabs.find(tab => tab.id === activeTab)?.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminTopBar;