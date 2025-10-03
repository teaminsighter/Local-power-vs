'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  User, 
  Shield, 
  Database,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Globe,
  Lock,
  Unlock,
  Key,
  Mail,
  RefreshCw,
  FileText,
  BarChart3
} from 'lucide-react';

interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: 'authentication' | 'user_management' | 'content' | 'system' | 'security' | 'analytics';
  details: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  device: 'desktop' | 'mobile' | 'tablet';
  status: 'success' | 'failed' | 'warning';
  resource?: string;
  metadata?: { [key: string]: any };
}

interface LogSummary {
  totalLogs: number;
  uniqueUsers: number;
  successfulActions: number;
  failedActions: number;
  securityEvents: number;
  todayActivity: number;
}

const ActivityLogs = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<LogSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [expandedLog, setExpandedLog] = useState<string>('');

  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = () => {
    setIsLoading(true);

    const mockLogs: ActivityLog[] = [
      {
        id: 'log_1',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        userId: 'user_1',
        userName: 'John Anderson',
        userEmail: 'john.anderson@localpower.com',
        action: 'User Login',
        category: 'authentication',
        details: 'Successful login via 2FA',
        ipAddress: '203.123.45.67',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'Sydney, NSW, Australia',
        device: 'desktop',
        status: 'success',
        resource: 'auth/login',
        metadata: { loginMethod: '2fa', sessionDuration: '8h' }
      },
      {
        id: 'log_2',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        userId: 'user_2',
        userName: 'Sarah Mitchell',
        userEmail: 'sarah.mitchell@localpower.com',
        action: 'Lead Updated',
        category: 'content',
        details: 'Updated lead status from "new" to "qualified"',
        ipAddress: '203.123.45.68',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        location: 'Melbourne, VIC, Australia',
        device: 'mobile',
        status: 'success',
        resource: 'leads/lead_12345',
        metadata: { previousStatus: 'new', newStatus: 'qualified', leadValue: 15200 }
      },
      {
        id: 'log_3',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        userId: 'user_3',
        userName: 'Michael Chen',
        userEmail: 'michael.chen@localpower.com',
        action: 'Failed Login Attempt',
        category: 'authentication',
        details: 'Invalid password attempt',
        ipAddress: '203.123.45.69',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Brisbane, QLD, Australia',
        device: 'desktop',
        status: 'failed',
        resource: 'auth/login',
        metadata: { attemptCount: 2, locked: false }
      },
      {
        id: 'log_4',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        userId: 'user_1',
        userName: 'John Anderson',
        userEmail: 'john.anderson@localpower.com',
        action: 'User Created',
        category: 'user_management',
        details: 'Created new user account for Emma Thompson',
        ipAddress: '203.123.45.67',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'Sydney, NSW, Australia',
        device: 'desktop',
        status: 'success',
        resource: 'users/user_4',
        metadata: { newUserRole: 'support', department: 'Customer Support' }
      },
      {
        id: 'log_5',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        userId: 'user_2',
        userName: 'Sarah Mitchell',
        userEmail: 'sarah.mitchell@localpower.com',
        action: 'Analytics Report Generated',
        category: 'analytics',
        details: 'Generated weekly performance report',
        ipAddress: '203.123.45.68',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'Melbourne, VIC, Australia',
        device: 'desktop',
        status: 'success',
        resource: 'reports/weekly_performance',
        metadata: { reportType: 'weekly', dateRange: '2024-01-15_2024-01-21', recipients: 3 }
      },
      {
        id: 'log_6',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        userId: 'system',
        userName: 'System',
        userEmail: 'system@localpower.com',
        action: 'Security Scan Completed',
        category: 'security',
        details: 'Automated security scan detected 0 vulnerabilities',
        ipAddress: '127.0.0.1',
        userAgent: 'SecurityBot/1.0',
        location: 'Server',
        device: 'desktop',
        status: 'success',
        resource: 'security/scan',
        metadata: { scanType: 'full', duration: '45m', threatsFound: 0 }
      },
      {
        id: 'log_7',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        userId: 'user_5',
        userName: 'David Wilson',
        userEmail: 'david.wilson@localpower.com',
        action: 'Unauthorized Access Attempt',
        category: 'security',
        details: 'Attempted to access admin panel without permissions',
        ipAddress: '203.123.45.70',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Perth, WA, Australia',
        device: 'desktop',
        status: 'failed',
        resource: 'admin/dashboard',
        metadata: { requiredPermission: 'admin_access', userRole: 'viewer' }
      },
      {
        id: 'log_8',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        userId: 'user_1',
        userName: 'John Anderson',
        userEmail: 'john.anderson@localpower.com',
        action: 'System Settings Updated',
        category: 'system',
        details: 'Updated email notification settings',
        ipAddress: '203.123.45.67',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'Sydney, NSW, Australia',
        device: 'desktop',
        status: 'success',
        resource: 'settings/notifications',
        metadata: { setting: 'email_notifications', previousValue: false, newValue: true }
      }
    ];

    const mockSummary: LogSummary = {
      totalLogs: mockLogs.length,
      uniqueUsers: [...new Set(mockLogs.map(log => log.userId))].length,
      successfulActions: mockLogs.filter(log => log.status === 'success').length,
      failedActions: mockLogs.filter(log => log.status === 'failed').length,
      securityEvents: mockLogs.filter(log => log.category === 'security').length,
      todayActivity: mockLogs.filter(log => {
        const today = new Date();
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === today.toDateString();
      }).length
    };

    setTimeout(() => {
      setLogs(mockLogs);
      setSummary(mockSummary);
      setIsLoading(false);
    }, 1000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <Key className="w-4 h-4" />;
      case 'user_management': return <User className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return 'text-blue-600 bg-blue-100';
      case 'user_management': return 'text-purple-600 bg-purple-100';
      case 'content': return 'text-green-600 bg-green-100';
      case 'system': return 'text-orange-600 bg-orange-100';
      case 'security': return 'text-red-600 bg-red-100';
      case 'analytics': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'authentication', name: 'Authentication' },
    { id: 'user_management', name: 'User Management' },
    { id: 'content', name: 'Content' },
    { id: 'system', name: 'System' },
    { id: 'security', name: 'Security' },
    { id: 'analytics', name: 'Analytics' }
  ];

  const statuses = [
    { id: 'all', name: 'All Statuses' },
    { id: 'success', name: 'Success' },
    { id: 'failed', name: 'Failed' },
    { id: 'warning', name: 'Warning' }
  ];

  const uniqueUsers = [...new Set(logs.map(log => ({ id: log.userId, name: log.userName })))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    const matchesUser = selectedUser === 'all' || log.userId === selectedUser;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesUser;
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffMs = now.getTime() - logTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading activity logs...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">Monitor system activity and user actions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadActivityLogs}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.totalLogs}</p>
                <p className="text-sm text-gray-600">Total Events</p>
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
                <p className="text-2xl font-bold text-gray-900">{summary.successfulActions}</p>
                <p className="text-sm text-gray-600">Successful</p>
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
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.securityEvents}</p>
                <p className="text-sm text-gray-600">Security Events</p>
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
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.uniqueUsers}</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
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
            
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="space-y-1">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                expandedLog === log.id ? 'bg-gray-50' : ''
              }`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedLog(expandedLog === log.id ? '' : log.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getCategoryColor(log.category)}`}>
                        {getCategoryIcon(log.category)}
                        {log.category.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900">{log.action}</h3>
                        <span className="text-sm text-gray-600">{log.userName}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(log.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{log.details}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {getDeviceIcon(log.device)}
                      <MapPin className="w-3 h-3" />
                      {log.location}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedLog === log.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 border-t border-gray-200 bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">User Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Name: {log.userName}</div>
                        <div>Email: {log.userEmail}</div>
                        <div>User ID: {log.userId}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Technical Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>IP Address: {log.ipAddress}</div>
                        <div>Device: {log.device}</div>
                        <div>Location: {log.location}</div>
                        {log.resource && <div>Resource: {log.resource}</div>}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Timestamp</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                        <div className="text-xs">{formatTimeAgo(log.timestamp)}</div>
                      </div>
                    </div>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Details</h4>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">User Agent</h4>
                    <div className="text-xs text-gray-600 bg-white rounded-lg p-3 border border-gray-200 font-mono">
                      {log.userAgent}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;