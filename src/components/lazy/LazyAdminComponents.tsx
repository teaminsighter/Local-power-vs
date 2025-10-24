/**
 * Lazy-Loaded Admin Components
 * Heavy admin components split into separate bundles
 */

import { createLazyComponent } from '@/lib/optimization/lazy-loader';

// Admin Dashboard Components
export const LazyAdminDashboard = createLazyComponent(
  () => import('../admin/AdminDashboard'),
  {
    loading: <AdminSkeleton />,
    chunkName: 'admin-dashboard'
  }
);

export const LazyAdminContent = createLazyComponent(
  () => import('../admin/AdminContent'),
  {
    loading: <AdminSkeleton />,
    chunkName: 'admin-content'
  }
);

// Analytics Components
export const LazyAnalyticsOverview = createLazyComponent(
  () => import('../admin/analytics/AnalyticsOverview'),
  {
    loading: <ChartSkeleton />,
    chunkName: 'analytics-overview'
  }
);

export const LazyLeadAnalytics = createLazyComponent(
  () => import('../admin/analytics/LeadAnalytics'),
  {
    loading: <ChartSkeleton />,
    chunkName: 'lead-analytics'
  }
);

export const LazyMarketingAnalytics = createLazyComponent(
  () => import('../admin/analytics/MarketingAnalytics'),
  {
    loading: <ChartSkeleton />,
    chunkName: 'marketing-analytics'
  }
);

export const LazyVisitorTrackingDashboard = createLazyComponent(
  () => import('../admin/analytics/VisitorTrackingDashboard'),
  {
    loading: <ChartSkeleton />,
    chunkName: 'visitor-tracking'
  }
);

// AI Components
export const LazyAIAssistant = createLazyComponent(
  () => import('../admin/ai/AIAssistant'),
  {
    loading: <AISkeleton />,
    chunkName: 'ai-assistant'
  }
);

export const LazyAIAgents = createLazyComponent(
  () => import('../admin/ai/AIAgents'),
  {
    loading: <AISkeleton />,
    chunkName: 'ai-agents'
  }
);

// Leads Management
export const LazyLeadsManagement = createLazyComponent(
  () => import('../admin/leads/LeadsManagement'),
  {
    loading: <TableSkeleton />,
    chunkName: 'leads-management'
  }
);

export const LazyAllLeads = createLazyComponent(
  () => import('../admin/leads/AllLeads'),
  {
    loading: <TableSkeleton />,
    chunkName: 'all-leads'
  }
);

// Settings Components
export const LazySolarPricing = createLazyComponent(
  () => import('../admin/settings/SolarPricing'),
  {
    loading: <SettingsSkeleton />,
    chunkName: 'solar-pricing'
  }
);

export const LazyDatabaseSettings = createLazyComponent(
  () => import('../admin/settings/DatabaseSettings'),
  {
    loading: <SettingsSkeleton />,
    chunkName: 'database-settings'
  }
);

export const LazyAPIConfiguration = createLazyComponent(
  () => import('../admin/settings/APIConfiguration'),
  {
    loading: <SettingsSkeleton />,
    chunkName: 'api-configuration'
  }
);

// Marketing Components
export const LazyCampaigns = createLazyComponent(
  () => import('../admin/marketing/Campaigns'),
  {
    loading: <MarketingSkeleton />,
    chunkName: 'campaigns'
  }
);

export const LazyEmailCampaigns = createLazyComponent(
  () => import('../admin/marketing/EmailCampaigns'),
  {
    loading: <MarketingSkeleton />,
    chunkName: 'email-campaigns'
  }
);

export const LazySocialMedia = createLazyComponent(
  () => import('../admin/marketing/SocialMedia'),
  {
    loading: <MarketingSkeleton />,
    chunkName: 'social-media'
  }
);

// Skeleton Components
function AdminSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AISkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
      <div className="flex space-x-2">
        <div className="h-10 bg-gray-200 rounded animate-pulse flex-1" />
        <div className="h-10 bg-gray-200 rounded animate-pulse w-20" />
      </div>
    </div>
  );
}

function MarketingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}