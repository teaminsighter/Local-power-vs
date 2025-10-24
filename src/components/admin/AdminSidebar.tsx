'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { adminCategories, AdminCategory } from './AdminDashboard';  

interface AdminSidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  categories?: AdminCategory[];
}

const AdminSidebar = ({ 
  activeCategory, 
  onCategoryChange, 
  collapsed, 
  onToggleCollapse,
  categories = adminCategories
}: AdminSidebarProps) => {
  const [companyName, setCompanyName] = useState('Local Power');

  // Load company name from settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('admin-general-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.companyName) {
            setCompanyName(settings.companyName);
          }
        } catch (error) {
          console.error('Error loading company name:', error);
        }
      }
    }
  }, []);

  return (
    <motion.div
      className="text-white flex flex-col shadow-xl admin-sidebar"
      style={{ 
        backgroundColor: '#146443',
        color: '#ffffff'
      }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white border-opacity-10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold text-white">
                {companyName}
              </h1>
              <p className="text-xs mt-1 text-white text-opacity-70">Analytics Admin Panel</p>
            </motion.div>
          )}
          
          <motion.button
            onClick={onToggleCollapse}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg transition-colors text-white hover:bg-white hover:bg-opacity-10"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} 
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Navigation Categories */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-2 px-3">
          {(categories || []).map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 relative ${
                activeCategory === category.id 
                  ? 'bg-white bg-opacity-20 shadow-lg' 
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              style={{
                color: '#ffffff'
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {/* Active indicator bar */}
              {activeCategory === category.id && (
                <motion.div
                  className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full"
                  layoutId="activeCategory"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              )}
              <div 
                className="flex-shrink-0"
                style={{
                  color: '#ffffff'
                }}
              >
                {category.icon}
              </div>
              
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <div className="text-sm font-medium truncate">
                    {category.name}
                  </div>
                  <div className="text-xs opacity-75 mt-0.5">
                    {category.tabs.length} sections
                  </div>
                </motion.div>
              )}
              
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-gray-400">Super Admin</div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;