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
  const [companyName, setCompanyName] = useState('Insighter.Digital');

  // Load and apply saved theme settings on component mount
  useEffect(() => {
    const loadSavedTheme = () => {
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('admin-general-settings');
        if (savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            const root = document.documentElement;
            
            // Apply navigation theme variables
            if (settings.navigationBackground) {
              root.style.setProperty('--admin-nav-bg', settings.navigationBackground);
              // Force update sidebar background immediately
              const sidebar = document.querySelector('.admin-sidebar') as HTMLElement;
              if (sidebar) {
                sidebar.style.backgroundColor = settings.navigationBackground;
              }
            }
            if (settings.navigationTextColor) {
              root.style.setProperty('--admin-nav-text', settings.navigationTextColor);
              // Force update sidebar text color immediately
              const sidebar = document.querySelector('.admin-sidebar') as HTMLElement;
              if (sidebar) {
                sidebar.style.color = settings.navigationTextColor;
              }
            }
            
            // Apply other theme variables
            if (settings.primaryButtonBackground) {
              root.style.setProperty('--admin-btn-primary-bg', settings.primaryButtonBackground);
            }
            if (settings.primaryButtonTextColor) {
              root.style.setProperty('--admin-btn-primary-text', settings.primaryButtonTextColor);
            }
            if (settings.primaryButtonHoverBackground) {
              root.style.setProperty('--admin-btn-primary-hover', settings.primaryButtonHoverBackground);
            }
            if (settings.primaryColor) {
              root.style.setProperty('--admin-primary', settings.primaryColor);
            }
            if (settings.backgroundColor) {
              root.style.setProperty('--admin-bg', settings.backgroundColor);
            }
            if (settings.titleColor) {
              root.style.setProperty('--admin-title', settings.titleColor);
            }
            if (settings.subtitleColor) {
              root.style.setProperty('--admin-subtitle', settings.subtitleColor);
            }
            if (settings.surfaceColor) {
              root.style.setProperty('--admin-surface', settings.surfaceColor);
            }
            if (settings.borderColor) {
              root.style.setProperty('--admin-border', settings.borderColor);
            }
            
            // Update company name if available
            if (settings.companyName) {
              setCompanyName(settings.companyName);
            }
            
            // Apply theme class if needed
            if (settings.theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
            if (settings.compactMode) {
              document.documentElement.classList.add('compact');
            }
          } catch (error) {
            console.error('Error loading saved theme settings:', error);
          }
        }
      }
    };
    
    loadSavedTheme();

    // Listen for storage changes to update settings in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-general-settings' && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          if (settings.companyName) {
            setCompanyName(settings.companyName);
          }
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Additional effect to ensure sidebar colors are applied after component mounts
  useEffect(() => {
    const sidebar = document.querySelector('.admin-sidebar') as HTMLElement;
    if (sidebar) {
      // Set default colors
      sidebar.style.backgroundColor = '#146443';
      sidebar.style.color = '#ffffff';
      
      // Load and apply saved colors if they exist
      const savedSettings = localStorage.getItem('admin-general-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.navigationBackground) {
            sidebar.style.backgroundColor = settings.navigationBackground;
          }
          if (settings.navigationTextColor) {
            sidebar.style.color = settings.navigationTextColor;
          }
        } catch (error) {
          console.error('Error applying sidebar colors:', error);
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
      <div className="p-4 border-b" style={{ borderColor: 'var(--admin-nav-border, rgba(255,255,255,0.1))' }}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold" style={{ color: 'var(--admin-nav-text, #ffffff)' }}>
                {companyName}
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--admin-nav-text, rgba(255,255,255,0.7))' }}>Analytics Admin Panel</p>
            </motion.div>
          )}
          
          <motion.button
            onClick={onToggleCollapse}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              color: 'var(--admin-nav-text, #ffffff)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--admin-nav-hover-bg, rgba(255,255,255,0.1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
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
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 shadow-lg"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
                e.currentTarget.style.setProperty('color', '#ffffff', 'important');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('background-color', 'transparent', 'important');
                e.currentTarget.style.setProperty('color', '#ffffff', 'important');
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
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