'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import AdminContent from './AdminContent';
import AnalyticsOverview from './analytics/AnalyticsOverview';
import AllLeads from './leads/AllLeads';
import ChatbotQuery from './ai/ChatbotQuery';
import DataLayerEvents from './tracking/DataLayerEvents';
import LandingPages from './pagebuilder/LandingPages';
import FormsBuilder from './pagebuilder/FormsBuilder';
import Templates from './pagebuilder/Templates';
import ABTesting from './pagebuilder/ABTesting';
import GoogleAds from './integrations/GoogleAds';
import FacebookAds from './integrations/FacebookAds';
import GA4Integration from './integrations/GA4Integration';
import WebhookConfiguration from './integrations/WebhookConfiguration';
import APIConfiguration from './settings/APIConfiguration';
import SolarPricing from './settings/SolarPricing';
import UserProfile from './UserProfile';
import LeadsManagement from './leads/LeadsManagement';

export interface AdminCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  tabs: AdminTab[];
}

export interface AdminTab {
  id: string;
  name: string;
  component: React.ComponentType<any>;
}

const AdminDashboard = () => {
  const [activeCategory, setActiveCategory] = useState('analytics');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add mounted state to prevent SSR mismatch
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <AdminSidebar
        activeCategory={activeCategory}
        onCategoryChange={(categoryId) => {
          setActiveCategory(categoryId);
          // Reset to first tab when category changes
          const category = adminCategories.find(c => c.id === categoryId);
          if (category && category.tabs.length > 0) {
            setActiveTab(category.tabs[0].id);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <AdminTopBar
          activeCategory={activeCategory}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Content Area */}
        <motion.div
          className="flex-1 overflow-auto"
          key={`${activeCategory}-${activeTab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <AdminContent 
            activeCategory={activeCategory}
            activeTab={activeTab}
          />
        </motion.div>
      </div>
    </div>
  );
};

// This will be imported from a separate config file
export const adminCategories: AdminCategory[] = [
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    tabs: [
      { id: 'overview', name: 'Overview', component: AnalyticsOverview },
      { id: 'leads', name: 'Lead Analysis', component: () => <div>Lead Analysis Content</div> },
      { id: 'marketing', name: 'Marketing Analysis', component: () => <div>Marketing Analysis Content</div> },
      { id: 'realtime', name: 'Real-time Tracking', component: () => <div>Real-time Content</div> }
    ]
  },
  {
    id: 'lead-management',
    name: 'Lead Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    tabs: [
      { id: 'all-leads', name: 'All Leads', component: LeadsManagement },
      { id: 'lead-analysis', name: 'Lead Analysis', component: AllLeads },
      { id: 'duplicates', name: 'Duplicate Analysis', component: () => <div>Duplicate Analysis Content</div> },
      { id: 'reports', name: 'Export/Reports', component: () => <div>Reports Content</div> }
    ]
  },
  {
    id: 'page-builder',
    name: 'Page Builder',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    tabs: [
      { id: 'landing-pages', name: 'Landing Pages', component: LandingPages },
      { id: 'forms', name: 'Forms', component: FormsBuilder },
      { id: 'templates', name: 'Templates', component: Templates },
      { id: 'ab-testing', name: 'A/B Testing', component: ABTesting }
    ]
  },
  {
    id: 'tracking',
    name: 'Tracking Setup',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    tabs: [
      { id: 'datalayer', name: 'DataLayer Events', component: DataLayerEvents },
      { id: 'gtm-config', name: 'GTM Config', component: () => <div>GTM Config Content</div> },
      { id: 'integrations', name: 'Platform Integrations', component: () => <div>Platform Integrations Content</div> },
      { id: 'conversion-api', name: 'Conversion API', component: () => <div>Conversion API Content</div> }
    ]
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    tabs: [
      { id: 'chatbot', name: 'Chatbot Query', component: ChatbotQuery },
      { id: 'auto-reports', name: 'Auto Reports', component: () => <div>Auto Reports Content</div> },
      { id: 'recommendations', name: 'Recommendations', component: () => <div>Recommendations Content</div> },
      { id: 'alerts', name: 'Performance Alerts', component: () => <div>Performance Alerts Content</div> }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    tabs: [
      { id: 'google-ads', name: 'Google Ads', component: GoogleAds },
      { id: 'facebook-ads', name: 'Facebook Ads', component: FacebookAds },
      { id: 'ga4', name: 'GA4', component: GA4Integration },
      { id: 'webhooks', name: 'Webhooks/APIs', component: WebhookConfiguration }
    ]
  },
  {
    id: 'user-management',
    name: 'User Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    tabs: [
      { id: 'profile', name: 'My Profile', component: UserProfile },
      { id: 'admin-users', name: 'Manage Users', component: () => <div>Admin Users Content</div> },
      { id: 'permissions', name: 'Permissions', component: () => <div>Permissions Content</div> },
      { id: 'activity-logs', name: 'Activity Logs', component: () => <div>Activity Logs Content</div> }
    ]
  },
  {
    id: 'system',
    name: 'System Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tabs: [
      { id: 'api-config', name: 'API Configuration', component: APIConfiguration },
      { id: 'solar-pricing', name: 'Solar Pricing', component: SolarPricing },
      { id: 'database', name: 'Database', component: () => <div>Database Content</div> },
      { id: 'backup', name: 'Backup', component: () => <div>Backup Content</div> }
    ]
  }
];

export default AdminDashboard;