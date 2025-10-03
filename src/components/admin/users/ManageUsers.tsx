'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Crown,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  Key,
  Lock,
  Unlock
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'sales' | 'support' | 'viewer';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  avatar?: string;
  department: string;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  loginCount: number;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  activeToday: number;
}

const ManageUsers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadUsersData();
  }, []);

  const loadUsersData = () => {
    setIsLoading(true);

    const mockUsers: User[] = [
      {
        id: 'user_1',
        name: 'John Anderson',
        email: 'john.anderson@localpower.com',
        phone: '+61 2 9876 5432',
        role: 'admin',
        status: 'active',
        department: 'Management',
        lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['full_access', 'user_management', 'system_settings'],
        loginCount: 342,
        isEmailVerified: true,
        isTwoFactorEnabled: true
      },
      {
        id: 'user_2',
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@localpower.com',
        phone: '+61 2 9876 5433',
        role: 'manager',
        status: 'active',
        department: 'Sales',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['lead_management', 'analytics_view', 'report_generation'],
        loginCount: 245,
        isEmailVerified: true,
        isTwoFactorEnabled: false
      },
      {
        id: 'user_3',
        name: 'Michael Chen',
        email: 'michael.chen@localpower.com',
        phone: '+61 2 9876 5434',
        role: 'sales',
        status: 'active',
        department: 'Sales',
        lastLogin: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['lead_view', 'lead_edit', 'calculator_access'],
        loginCount: 186,
        isEmailVerified: true,
        isTwoFactorEnabled: true
      },
      {
        id: 'user_4',
        name: 'Emma Thompson',
        email: 'emma.thompson@localpower.com',
        phone: '+61 2 9876 5435',
        role: 'support',
        status: 'pending',
        department: 'Customer Support',
        lastLogin: '',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['support_tickets', 'customer_view'],
        loginCount: 0,
        isEmailVerified: false,
        isTwoFactorEnabled: false
      },
      {
        id: 'user_5',
        name: 'David Wilson',
        email: 'david.wilson@localpower.com',
        phone: '+61 2 9876 5436',
        role: 'viewer',
        status: 'suspended',
        department: 'Marketing',
        lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['analytics_view'],
        loginCount: 67,
        isEmailVerified: true,
        isTwoFactorEnabled: false
      },
      {
        id: 'user_6',
        name: 'Lisa Rodriguez',
        email: 'lisa.rodriguez@localpower.com',
        phone: '+61 2 9876 5437',
        role: 'sales',
        status: 'inactive',
        department: 'Sales',
        lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['lead_view', 'calculator_access'],
        loginCount: 98,
        isEmailVerified: true,
        isTwoFactorEnabled: false
      }
    ];

    const mockStats: UserStats = {
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      pendingUsers: mockUsers.filter(u => u.status === 'pending').length,
      suspendedUsers: mockUsers.filter(u => u.status === 'suspended').length,
      newUsersThisMonth: mockUsers.filter(u => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return new Date(u.createdAt) > thirtyDaysAgo;
      }).length,
      activeToday: mockUsers.filter(u => {
        if (!u.lastLogin) return false;
        const today = new Date();
        const loginDate = new Date(u.lastLogin);
        return loginDate.toDateString() === today.toDateString();
      }).length
    };

    setTimeout(() => {
      setUsers(mockUsers);
      setStats(mockStats);
      setIsLoading(false);
    }, 1000);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'manager': return 'text-purple-600 bg-purple-100';
      case 'sales': return 'text-blue-600 bg-blue-100';
      case 'support': return 'text-green-600 bg-green-100';
      case 'viewer': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'manager': return <Shield className="w-4 h-4" />;
      case 'sales': return <Users className="w-4 h-4" />;
      case 'support': return <UserCheck className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const roles = [
    { id: 'all', name: 'All Roles' },
    { id: 'admin', name: 'Admin' },
    { id: 'manager', name: 'Manager' },
    { id: 'sales', name: 'Sales' },
    { id: 'support', name: 'Support' },
    { id: 'viewer', name: 'Viewer' }
  ];

  const statuses = [
    { id: 'all', name: 'All Statuses' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'pending', name: 'Pending' },
    { id: 'suspended', name: 'Suspended' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600 mt-1">User accounts and access management</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInviteModal(true)}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <Plus className="w-4 h-4" />
            Invite User
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingUsers}</p>
                <p className="text-sm text-gray-600">Pending Approval</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeToday}</p>
                <p className="text-sm text-gray-600">Active Today</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedUsers.length} selected</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearSelection}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear
                </motion.button>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  <input
                    type="checkbox"
                    onChange={() => selectedUsers.length === filteredUsers.length ? clearSelection() : selectAllUsers()}
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Last Login</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Security</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStatusIcon(user.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="py-4 px-4 text-center text-xs text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {user.isEmailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-600" title="Email Verified" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" title="Email Not Verified" />
                      )}
                      {user.isTwoFactorEnabled ? (
                        <Lock className="w-4 h-4 text-green-600" title="2FA Enabled" />
                      ) : (
                        <Unlock className="w-4 h-4 text-gray-400" title="2FA Disabled" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      {user.status === 'active' ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateUserStatus(user.id, 'suspended')}
                          className="p-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                        </motion.button>
                      ) : user.status === 'suspended' ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateUserStatus(user.id, 'active')}
                          className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;