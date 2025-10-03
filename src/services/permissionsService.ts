import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserPermission {
  id: string;
  userId: string;
  category: string;
  tab: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface AdminTab {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  permissions?: UserPermission;
}

// All available admin tabs across categories
export const ALL_ADMIN_TABS: AdminTab[] = [
  // Analytics Dashboard
  { id: 'overview', name: 'Overview', category: 'analytics', categoryName: 'Analytics Dashboard' },
  { id: 'steps', name: 'Step Analytics', category: 'analytics', categoryName: 'Analytics Dashboard' },
  { id: 'leads', name: 'Lead Analysis', category: 'analytics', categoryName: 'Analytics Dashboard' },
  { id: 'marketing', name: 'Marketing Analysis', category: 'analytics', categoryName: 'Analytics Dashboard' },
  { id: 'realtime', name: 'Real-time Tracking', category: 'analytics', categoryName: 'Analytics Dashboard' },
  { id: 'visitors', name: 'Visitor Tracking', category: 'analytics', categoryName: 'Analytics Dashboard' },
  
  // CRM
  { id: 'all-leads', name: 'All Leads', category: 'lead-management', categoryName: 'CRM' },
  { id: 'lead-analysis', name: 'Lead Analysis', category: 'lead-management', categoryName: 'CRM' },
  { id: 'visitor-analysis', name: 'Visitor Analysis', category: 'lead-management', categoryName: 'CRM' },
  { id: 'duplicates', name: 'Duplicate Analysis', category: 'lead-management', categoryName: 'CRM' },
  { id: 'reports', name: 'Export/Reports', category: 'lead-management', categoryName: 'CRM' },
  
  // Page Builder
  { id: 'landing-pages', name: 'Landing Pages', category: 'page-builder', categoryName: 'Page Builder' },
  { id: 'forms', name: 'Forms', category: 'page-builder', categoryName: 'Page Builder' },
  { id: 'templates', name: 'Templates', category: 'page-builder', categoryName: 'Page Builder' },
  { id: 'ab-testing', name: 'A/B Testing', category: 'page-builder', categoryName: 'Page Builder' },
  
  // User Management
  { id: 'manage-users', name: 'Manage Users', category: 'user-management', categoryName: 'User Management' },
  { id: 'activity-logs', name: 'Activity Logs', category: 'user-management', categoryName: 'User Management' },
  { id: 'permissions', name: 'Permissions', category: 'user-management', categoryName: 'User Management' },
  
  // AI Assistant
  { id: 'chatbot', name: 'Chatbot Query', category: 'ai-assistant', categoryName: 'AI Assistant' },
  { id: 'recommendations', name: 'Recommendations', category: 'ai-assistant', categoryName: 'AI Assistant' },
  { id: 'performance-alerts', name: 'Performance Alerts', category: 'ai-assistant', categoryName: 'AI Assistant' },
  
  // Integrations
  { id: 'google-ads', name: 'Google Ads', category: 'integrations', categoryName: 'Integrations' },
  { id: 'facebook-ads', name: 'Facebook Ads', category: 'integrations', categoryName: 'Integrations' },
  { id: 'ga4', name: 'GA4 Integration', category: 'integrations', categoryName: 'Integrations' },
  { id: 'conversion-api', name: 'Conversion API', category: 'integrations', categoryName: 'Integrations' },
  { id: 'platform-integrations', name: 'Platform Integrations', category: 'integrations', categoryName: 'Integrations' },
  { id: 'gtm-config', name: 'GTM Config', category: 'integrations', categoryName: 'Integrations' },
  { id: 'data-layer', name: 'Data Layer Events', category: 'integrations', categoryName: 'Integrations' },
  
  // Settings
  { id: 'database', name: 'Database Settings', category: 'settings', categoryName: 'Settings' },
  { id: 'pricing', name: 'Pricing Tiers', category: 'settings', categoryName: 'Settings' },
  { id: 'system', name: 'System Settings', category: 'settings', categoryName: 'Settings' }
];

export class PermissionsService {
  
  /**
   * Get user permissions for all tabs
   */
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      const permissions = await prisma.userPermission.findMany({
        where: { userId }
      });
      return permissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Get user permissions with tab details
   */
  async getUserPermissionsWithTabs(userId: string): Promise<AdminTab[]> {
    try {
      const permissions = await this.getUserPermissions(userId);
      
      return ALL_ADMIN_TABS.map(tab => ({
        ...tab,
        permissions: permissions.find(p => p.category === tab.category && p.tab === tab.id)
      }));
    } catch (error) {
      console.error('Error getting user permissions with tabs:', error);
      return [];
    }
  }

  /**
   * Check if user has permission for specific tab
   */
  async hasPermission(
    userId: string, 
    category: string, 
    tab: string, 
    action: 'view' | 'edit' | 'delete' | 'export' = 'view'
  ): Promise<boolean> {
    try {
      // Super admins have all permissions
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user?.role === 'SUPER_ADMIN') {
        return true;
      }

      const permission = await prisma.userPermission.findUnique({
        where: {
          userId_category_tab: {
            userId,
            category,
            tab
          }
        }
      });

      if (!permission) return false;

      switch (action) {
        case 'view': return permission.canView;
        case 'edit': return permission.canEdit;
        case 'delete': return permission.canDelete;
        case 'export': return permission.canExport;
        default: return false;
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Set user permissions for multiple tabs
   */
  async setUserPermissions(userId: string, permissions: Partial<UserPermission>[]): Promise<void> {
    try {
      // Delete existing permissions for the user
      await prisma.userPermission.deleteMany({
        where: { userId }
      });

      // Create new permissions
      if (permissions.length > 0) {
        await prisma.userPermission.createMany({
          data: permissions.map(p => ({
            userId,
            category: p.category!,
            tab: p.tab!,
            canView: p.canView || false,
            canEdit: p.canEdit || false,
            canDelete: p.canDelete || false,
            canExport: p.canExport || false
          }))
        });
      }
    } catch (error) {
      console.error('Error setting user permissions:', error);
      throw error;
    }
  }

  /**
   * Update specific permission
   */
  async updatePermission(
    userId: string,
    category: string,
    tab: string,
    permissions: {
      canView?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
      canExport?: boolean;
    }
  ): Promise<void> {
    try {
      await prisma.userPermission.upsert({
        where: {
          userId_category_tab: {
            userId,
            category,
            tab
          }
        },
        update: permissions,
        create: {
          userId,
          category,
          tab,
          canView: permissions.canView || false,
          canEdit: permissions.canEdit || false,
          canDelete: permissions.canDelete || false,
          canExport: permissions.canExport || false
        }
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      throw error;
    }
  }

  /**
   * Get default permissions for a role
   */
  getDefaultPermissions(role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER'): Partial<UserPermission>[] {
    if (role === 'SUPER_ADMIN') {
      // Super admins get all permissions
      return ALL_ADMIN_TABS.map(tab => ({
        category: tab.category,
        tab: tab.id,
        canView: true,
        canEdit: true,
        canDelete: true,
        canExport: true
      }));
    }

    if (role === 'ADMIN') {
      // Admins get most permissions except user management
      return ALL_ADMIN_TABS
        .filter(tab => tab.category !== 'user-management')
        .map(tab => ({
          category: tab.category,
          tab: tab.id,
          canView: true,
          canEdit: true,
          canDelete: tab.category !== 'settings', // Can't delete settings
          canExport: true
        }));
    }

    // Viewers get limited read-only access
    const viewerTabs = [
      'overview', 'steps', 'leads', 'marketing', 'realtime', 'visitors', // Analytics
      'all-leads', 'lead-analysis', 'visitor-analysis', 'reports' // CRM (read-only)
    ];

    return ALL_ADMIN_TABS
      .filter(tab => viewerTabs.includes(tab.id))
      .map(tab => ({
        category: tab.category,
        tab: tab.id,
        canView: true,
        canEdit: false,
        canDelete: false,
        canExport: tab.id === 'reports' // Only reports export for viewers
      }));
  }

  /**
   * Initialize permissions for new user
   */
  async initializeUserPermissions(userId: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER'): Promise<void> {
    try {
      const defaultPermissions = this.getDefaultPermissions(role);
      await this.setUserPermissions(userId, defaultPermissions);
    } catch (error) {
      console.error('Error initializing user permissions:', error);
      throw error;
    }
  }

  /**
   * Get filtered admin categories based on user permissions
   */
  async getFilteredAdminCategories(userId: string, adminCategories: any[]): Promise<any[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      // Super admins see everything
      if (user?.role === 'SUPER_ADMIN') {
        return adminCategories;
      }

      const permissions = await this.getUserPermissions(userId);
      
      return adminCategories.map(category => ({
        ...category,
        tabs: category.tabs.filter((tab: any) => {
          const permission = permissions.find(p => 
            p.category === category.id && p.tab === tab.id
          );
          return permission?.canView === true;
        })
      })).filter(category => category.tabs.length > 0);

    } catch (error) {
      console.error('Error filtering admin categories:', error);
      return [];
    }
  }
}

export const permissionsService = new PermissionsService();