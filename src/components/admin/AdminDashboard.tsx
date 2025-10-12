'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminContextProvider, useAdminContext } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import AdminContent from './AdminContent';
import AnalyticsOverview from './analytics/AnalyticsOverview';
import StepAnalyticsDashboard from './analytics/StepAnalyticsDashboard';
import LeadAnalytics from './analytics/LeadAnalytics';
import MarketingAnalytics from './analytics/MarketingAnalytics';
import RealTimeTracking from './analytics/RealTimeTracking';
import VisitorTrackingDashboard from './analytics/VisitorTrackingDashboard';
import VisitorAnalysis from './crm/VisitorAnalysis';
import AllLeads from './leads/AllLeads';
import DuplicateAnalysis from './leads/DuplicateAnalysis';
import ExportReports from './leads/ExportReports';
import AIInsight from './ai/AIInsight';
import AIAgents from './ai/AIAgents';
import Campaigns from './marketing/Campaigns';
import SocialMedia from './marketing/SocialMedia';
import DataLayerEvents from './tracking/DataLayerEvents';
import GTMConfig from './tracking/GTMConfig';
import PlatformIntegrations from './tracking/PlatformIntegrations';
import ConversionAPI from './tracking/ConversionAPI';
import LandingPages from './pagebuilder/LandingPages';
import FormsBuilder from './pagebuilder/FormsBuilder';
import Templates from './pagebuilder/Templates';
import ABTesting from './ABTesting';
import GoogleAds from './integrations/GoogleAds';
import FacebookAds from './integrations/FacebookAds';
import GA4Integration from './integrations/GA4Integration';
import WebhookConfiguration from './integrations/WebhookConfiguration';
import APIConfiguration from './settings/APIConfiguration';
import SolarPricing from './settings/SolarPricing';
import GeneralSettings from './settings/GeneralSettings';
import DatabaseSettings from './settings/DatabaseSettings';
import BackupSettings from './settings/BackupSettings';
import UserProfile from './UserProfile';
import LeadsManagement from './leads/LeadsManagement';
import ManageUsers from './users/ManageUsers';
import Permissions from './users/Permissions';
import ActivityLogs from './users/ActivityLogs';
import AIAssistant from './ai/AIAssistant';

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

const AdminDashboardContent = () => {
  const [activeCategory, setActiveCategory] = useState('analytics');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCategories, setFilteredCategories] = useState(adminCategories);
  const { updateContext } = useAdminContext();
  const { user } = useAuth();

  // Filter categories based on user permissions
  useEffect(() => {
    const filterCategoriesByPermissions = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/categories?userId=${user.id}`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.categories)) {
          setFilteredCategories(data.categories);
          
          // Set first available category as active if current category is not accessible
          if (data.categories.length > 0) {
            const hasAccess = data.categories.some((cat: AdminCategory) => cat.id === activeCategory);
            if (!hasAccess) {
              setActiveCategory(data.categories[0].id);
              if (data.categories[0].tabs.length > 0) {
                setActiveTab(data.categories[0].tabs[0].id);
              }
            }
          }
        } else {
          // Fallback to all categories if API fails
          setFilteredCategories(adminCategories);
        }
      } catch (error) {
        console.error('Error filtering categories:', error);
        // Fallback to all categories if filtering fails
        setFilteredCategories(adminCategories);
      } finally {
        setIsLoading(false);
      }
    };

    filterCategoriesByPermissions();
  }, [user?.id]);

  // Update context when category or tab changes
  useEffect(() => {
    const category = filteredCategories.find(c => c.id === activeCategory);
    const tab = category?.tabs.find(t => t.id === activeTab);
    
    updateContext({
      currentCategory: activeCategory,
      currentTab: activeTab,
      breadcrumb: ['Admin', category?.name || 'Unknown', tab?.name || 'Unknown'],
      availableActions: getAvailableActions(activeCategory, activeTab)
    });
  }, [activeCategory, activeTab, filteredCategories, updateContext]);

  const getAvailableActions = (category: string, tab: string): string[] => {
    const actionMap: Record<string, Record<string, string[]>> = {
      'analytics': {
        'overview': ['Refresh Data', 'Export Report', 'Change Date Range', 'View Details'],
        'steps': ['Analyze Funnel', 'Export Funnel Data', 'A/B Test Setup'],
        'leads': ['Filter Leads', 'Generate Report', 'Quality Analysis'],
        'marketing': ['Campaign Analysis', 'ROI Report', 'Budget Optimization'],
        'realtime': ['Monitor Live', 'Set Alerts', 'View Sessions'],
        'visitors': ['Behavior Analysis', 'Segment Visitors', 'Heatmap View']
      },
      'lead-management': {
        'all-leads': ['Add Lead', 'Update Status', 'Contact Lead', 'Export Leads'],
        'lead-analysis': ['Quality Score', 'Trend Analysis', 'Conversion Report'],
        'duplicates': ['Find Duplicates', 'Merge Leads', 'Clean Database'],
        'reports': ['Generate Report', 'Schedule Export', 'Custom Query']
      }
    };

    return actionMap[category]?.[tab] || ['View', 'Export', 'Refresh'];
  };

  // Navigation handler for AI assistant
  const handleAINavigation = (categoryId: string, tabId?: string) => {
    setActiveCategory(categoryId);
    if (tabId) {
      setActiveTab(tabId);
    } else {
      // Reset to first tab when category changes
      const category = adminCategories.find(c => c.id === categoryId);
      if (category && category.tabs.length > 0) {
        setActiveTab(category.tabs[0].id);
      }
    }
  };

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
    <div className="admin-panel flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <AdminSidebar
        activeCategory={activeCategory}
        onCategoryChange={(categoryId) => {
          setActiveCategory(categoryId);
          // Reset to first tab when category changes
          const category = filteredCategories.find(c => c.id === categoryId);
          if (category && category.tabs.length > 0) {
            setActiveTab(category.tabs[0].id);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        categories={filteredCategories}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <AdminTopBar
          activeCategory={activeCategory}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNavigate={(categoryId, tabId) => {
            setActiveCategory(categoryId);
            setActiveTab(tabId);
          }}
          categories={filteredCategories}
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
            categories={filteredCategories}
          />
        </motion.div>
      </div>

      {/* AI Assistant */}
      <AIAssistant onNavigate={handleAINavigation} />
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
      { id: 'steps', name: 'Step Analytics', component: StepAnalyticsDashboard },
      { id: 'leads', name: 'Lead Analysis', component: LeadAnalytics },
      { id: 'marketing', name: 'Marketing Analysis', component: MarketingAnalytics },
      { id: 'realtime', name: 'Real-time Tracking', component: RealTimeTracking },
      { id: 'visitors', name: 'Visitor Tracking', component: VisitorTrackingDashboard }
    ]
  },
  {
    id: 'lead-management',
    name: 'CRM',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    tabs: [
      { id: 'all-leads', name: 'All Leads', component: LeadsManagement },
      { id: 'lead-analysis', name: 'Lead Analysis', component: AllLeads },
      { id: 'visitor-analysis', name: 'Visitor Analysis', component: VisitorAnalysis },
      { id: 'duplicates', name: 'Duplicate Analysis', component: DuplicateAnalysis },
      { id: 'reports', name: 'Export/Reports', component: ExportReports }
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
      { id: 'templates', name: 'Templates', component: Templates }
    ]
  },
  {
    id: 'ab-testing',
    name: 'A/B Testing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    tabs: [
      { id: 'tests', name: 'Active Tests', component: ABTesting },
      { id: 'templates', name: 'Template Library', component: ABTesting },
      { id: 'analytics', name: 'Analytics', component: ABTesting }
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
      { id: 'gtm-config', name: 'GTM Config', component: GTMConfig },
      { id: 'integrations', name: 'Platform Integrations', component: PlatformIntegrations },
      { id: 'conversion-api', name: 'Conversion API', component: ConversionAPI }
    ]
  },
  {
    id: 'ai-insights',
    name: 'AI Assistant',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    tabs: [
      { id: 'ai-insight', name: 'AI Insight', component: AIInsight },
      { id: 'ai-agents', name: 'AI Agents', component: AIAgents }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    tabs: [
      { id: 'campaigns', name: 'Campaigns', component: Campaigns },
      { id: 'social-media', name: 'Social Media', component: SocialMedia }
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
      { id: 'admin-users', name: 'Manage Users', component: ManageUsers },
      { id: 'permissions', name: 'Permissions', component: Permissions },
      { id: 'activity-logs', name: 'Activity Logs', component: ActivityLogs }
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
      { id: 'general', name: 'General Settings', component: GeneralSettings },
      { id: 'api-config', name: 'API Configuration', component: APIConfiguration },
      { id: 'solar-pricing', name: 'Solar Pricing', component: SolarPricing },
      { id: 'database', name: 'Database', component: DatabaseSettings },
      { id: 'backup', name: 'Backup', component: BackupSettings }
    ]
  }
];

const AdminDashboard = () => {
  return (
    <AdminContextProvider>
      <AdminDashboardContent />
    </AdminContextProvider>
  );
};

export default AdminDashboard;