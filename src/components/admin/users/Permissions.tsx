'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  User, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Search, 
  Save, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  UserCheck,
  Palette,
  Zap,
  Globe
} from 'lucide-react';
import { ALL_ADMIN_TABS, permissionsService, type AdminTab, type UserPermission } from '@/services/permissionsService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  isActive: boolean;
}

interface PermissionState {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

const Permissions = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: PermissionState }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock users data
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@localpower.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      isActive: true
    },
    {
      id: '2',
      email: 'manager@localpower.com',
      firstName: 'Manager',
      lastName: 'Smith',
      role: 'ADMIN',
      isActive: true
    },
    {
      id: '3',
      email: 'analyst@localpower.com',
      firstName: 'Data',
      lastName: 'Analyst',
      role: 'VIEWER',
      isActive: true
    },
    {
      id: '4',
      email: 'john.doe@localpower.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ADMIN',
      isActive: true
    }
  ];

  useEffect(() => {
    // Simulate loading users
    setTimeout(() => {
      setUsers(mockUsers);
      if (mockUsers.length > 0) {
        setSelectedUser(mockUsers[0]);
        loadUserPermissions(mockUsers[0].id, mockUsers[0].role);
      }
      setLoading(false);
    }, 1000);
  }, []);

  const loadUserPermissions = async (userId: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER') => {
    try {
      // For super admins, enable all permissions
      if (role === 'SUPER_ADMIN') {
        const allPermissions: { [key: string]: PermissionState } = {};
        ALL_ADMIN_TABS.forEach(tab => {
          const key = `${tab.category}-${tab.id}`;
          allPermissions[key] = {
            canView: true,
            canEdit: true,
            canDelete: true,
            canExport: true
          };
        });
        setUserPermissions(allPermissions);
        return;
      }

      // Get default permissions for role
      const defaultPermissions = permissionsService.getDefaultPermissions(role);
      const permissionsMap: { [key: string]: PermissionState } = {};
      
      ALL_ADMIN_TABS.forEach(tab => {
        const key = `${tab.category}-${tab.id}`;
        const permission = defaultPermissions.find(p => p.category === tab.category && p.tab === tab.id);
        
        permissionsMap[key] = {
          canView: permission?.canView || false,
          canEdit: permission?.canEdit || false,
          canDelete: permission?.canDelete || false,
          canExport: permission?.canExport || false
        };
      });
      
      setUserPermissions(permissionsMap);
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    loadUserPermissions(user.id, user.role);
  };

  const handlePermissionChange = (tabKey: string, permission: keyof PermissionState, value: boolean) => {
    setUserPermissions(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        [permission]: value
      }
    }));
  };

  const handleBulkPermissionChange = (tabs: AdminTab[], permission: keyof PermissionState, value: boolean) => {
    const updates: { [key: string]: PermissionState } = {};
    tabs.forEach(tab => {
      const key = `${tab.category}-${tab.id}`;
      updates[key] = {
        ...userPermissions[key],
        [permission]: value
      };
    });
    
    setUserPermissions(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      // Convert permissions map to array format
      const permissionsArray: Partial<UserPermission>[] = [];
      
      Object.entries(userPermissions).forEach(([key, permissions]) => {
        const [category, tab] = key.split('-');
        // Only add permissions that have at least one true value
        if (permissions.canView || permissions.canEdit || permissions.canDelete || permissions.canExport) {
          permissionsArray.push({
            category,
            tab,
            ...permissions
          });
        }
      });

      await permissionsService.setUserPermissions(selectedUser.id, permissionsArray);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  const getFilteredTabs = () => {
    let filtered = ALL_ADMIN_TABS;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tab => tab.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(tab =>
        tab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tab.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getTabsByCategory = () => {
    const categories: { [key: string]: AdminTab[] } = {};
    getFilteredTabs().forEach(tab => {
      if (!categories[tab.category]) {
        categories[tab.category] = [];
      }
      categories[tab.category].push(tab);
    });
    return categories;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      case 'lead-management': return <UserCheck className="w-5 h-5" />;
      case 'page-builder': return <Palette className="w-5 h-5" />;
      case 'user-management': return <Users className="w-5 h-5" />;
      case 'ai-assistant': return <Zap className="w-5 h-5" />;
      case 'integrations': return <Globe className="w-5 h-5" />;
      case 'settings': return <Settings className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analytics': return 'bg-blue-50 border-blue-200';
      case 'lead-management': return 'bg-green-50 border-green-200';
      case 'page-builder': return 'bg-purple-50 border-purple-200';
      case 'user-management': return 'bg-red-50 border-red-200';
      case 'ai-assistant': return 'bg-yellow-50 border-yellow-200';
      case 'integrations': return 'bg-cyan-50 border-cyan-200';
      case 'settings': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VIEWER': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'analytics', name: 'Analytics Dashboard' },
    { id: 'lead-management', name: 'CRM' },
    { id: 'page-builder', name: 'Page Builder' },
    { id: 'user-management', name: 'User Management' },
    { id: 'ai-assistant', name: 'AI Assistant' },
    { id: 'integrations', name: 'Integrations' },
    { id: 'settings', name: 'Settings' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tab Permissions Management</h2>
          <p className="text-gray-600">Control which admin tabs each user can access and their permission levels</p>
        </div>
        
        <button
          onClick={handleSavePermissions}
          disabled={saving || !selectedUser}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Users</h3>
              <p className="text-sm text-gray-600 mt-1">Select a user to manage their tab permissions</p>
            </div>
            
            <div className="space-y-2 p-4">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                    selectedUser?.id === user.id
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-8 h-8 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">{user.firstName} {user.lastName}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                    {user.isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-3">
          {selectedUser ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName} - Tab Permissions
                    </h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role.replace('_', ' ')}
                  </span>
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tabs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
                  <button
                    onClick={() => handleBulkPermissionChange(getFilteredTabs(), 'canView', true)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Enable All View
                  </button>
                  <button
                    onClick={() => handleBulkPermissionChange(getFilteredTabs(), 'canView', false)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Disable All View
                  </button>
                  <button
                    onClick={() => handleBulkPermissionChange(getFilteredTabs(), 'canEdit', true)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Enable All Edit
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {Object.entries(getTabsByCategory()).map(([category, tabs]) => (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-4">
                      {getCategoryIcon(category)}
                      <h4 className="text-md font-medium text-gray-900">
                        {tabs[0]?.categoryName || category}
                      </h4>
                      <span className="text-sm text-gray-500">({tabs.length} tabs)</span>
                    </div>
                    
                    <div className={`rounded-lg border p-4 space-y-3 ${getCategoryColor(category)}`}>
                      {tabs.map((tab) => {
                        const tabKey = `${tab.category}-${tab.id}`;
                        const permissions = userPermissions[tabKey] || {
                          canView: false,
                          canEdit: false,
                          canDelete: false,
                          canExport: false
                        };
                        
                        return (
                          <div
                            key={tab.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium text-gray-900">{tab.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              {/* View Permission */}
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-600 w-12">View</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={permissions.canView}
                                    onChange={(e) => handlePermissionChange(tabKey, 'canView', e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>

                              {/* Edit Permission */}
                              <div className="flex items-center gap-2">
                                <Edit className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-gray-600 w-12">Edit</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={permissions.canEdit}
                                    onChange={(e) => handlePermissionChange(tabKey, 'canEdit', e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-600"></div>
                                </label>
                              </div>

                              {/* Delete Permission */}
                              <div className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-gray-600 w-12">Delete</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={permissions.canDelete}
                                    onChange={(e) => handlePermissionChange(tabKey, 'canDelete', e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                              </div>

                              {/* Export Permission */}
                              <div className="flex items-center gap-2">
                                <Download className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600 w-12">Export</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={permissions.canExport}
                                    onChange={(e) => handlePermissionChange(tabKey, 'canExport', e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a User</h3>
              <p className="text-gray-600">Choose a user from the list to manage their tab permissions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Permissions;