'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Bell,
  Clock,
  TrendingDown,
  TrendingUp,
  Activity,
  Target,
  Users,
  DollarSign,
  BarChart3,
  AlertCircle,
  Info,
  Settings,
  Plus,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  Zap,
  Brain,
  Globe,
  Shield,
  RefreshCw
} from 'lucide-react';

interface PerformanceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'conversion' | 'traffic' | 'revenue' | 'performance' | 'security' | 'system';
  metric: string;
  currentValue: number;
  threshold: number;
  previousValue: number;
  change: number;
  changePercent: number;
  triggeredAt: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  isRead: boolean;
  recommendedAction: string;
  affectedPages: string[];
  estimatedImpact: string;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'percent_change' | 'anomaly';
  threshold: number;
  timeframe: string;
  enabled: boolean;
  severity: 'critical' | 'warning' | 'info';
  notifications: boolean;
  emailRecipients: string[];
}

interface AlertMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  unreadAlerts: number;
  avgResolutionTime: string;
  alertsToday: number;
  alertsTrend: number;
}

const PerformanceAlerts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [metrics, setMetrics] = useState<AlertMetrics | null>(null);
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'rules'>('alerts');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    loadAlertsData();
  }, []);

  const loadAlertsData = () => {
    setIsLoading(true);

    const mockAlerts: PerformanceAlert[] = [
      {
        id: 'alert_1',
        title: 'Critical Drop in Conversion Rate',
        description: 'Lead generation conversion rate has dropped by 35% in the last 2 hours',
        severity: 'critical',
        category: 'conversion',
        metric: 'Conversion Rate',
        currentValue: 2.1,
        threshold: 3.5,
        previousValue: 3.2,
        change: -1.1,
        changePercent: -34.4,
        triggeredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'active',
        isRead: false,
        recommendedAction: 'Check calculator functionality, review recent changes to landing pages, and verify tracking implementation',
        affectedPages: ['/solar-calculator', '/get-quote'],
        estimatedImpact: '€1,200 potential revenue loss per hour'
      },
      {
        id: 'alert_2',
        title: 'High Bounce Rate on Mobile',
        description: 'Mobile bounce rate has increased to 78%, significantly above the 65% threshold',
        severity: 'warning',
        category: 'performance',
        metric: 'Mobile Bounce Rate',
        currentValue: 78,
        threshold: 65,
        previousValue: 62,
        change: 16,
        changePercent: 25.8,
        triggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'acknowledged',
        isRead: true,
        recommendedAction: 'Optimize mobile page load speed, review mobile UX design, and check for mobile-specific errors',
        affectedPages: ['/solar-calculator', '/home', '/about'],
        estimatedImpact: 'Reduced lead quality and quantity'
      },
      {
        id: 'alert_3',
        title: 'Server Response Time Spike',
        description: 'Average server response time has increased to 2.8 seconds, exceeding the 2.0s threshold',
        severity: 'warning',
        category: 'system',
        metric: 'Server Response Time',
        currentValue: 2.8,
        threshold: 2.0,
        previousValue: 1.4,
        change: 1.4,
        changePercent: 100,
        triggeredAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        isRead: true,
        recommendedAction: 'Check server resources, review database queries, and consider CDN optimization',
        affectedPages: ['All pages'],
        estimatedImpact: 'Poor user experience, potential SEO impact'
      },
      {
        id: 'alert_4',
        title: 'Low Traffic from Google Ads',
        description: 'Google Ads traffic has decreased by 45% compared to last week',
        severity: 'warning',
        category: 'traffic',
        metric: 'Google Ads Traffic',
        currentValue: 234,
        threshold: 400,
        previousValue: 425,
        change: -191,
        changePercent: -44.9,
        triggeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        isRead: false,
        recommendedAction: 'Review ad performance, check budget allocation, and verify campaign status',
        affectedPages: ['Landing pages'],
        estimatedImpact: 'Reduced lead generation capacity'
      },
      {
        id: 'alert_5',
        title: 'Revenue Target Behind Schedule',
        description: 'Monthly revenue is 15% below target with 8 days remaining',
        severity: 'info',
        category: 'revenue',
        metric: 'Monthly Revenue Progress',
        currentValue: 85,
        threshold: 90,
        previousValue: 88,
        change: -3,
        changePercent: -3.4,
        triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'resolved',
        isRead: true,
        recommendedAction: 'Increase marketing efforts, focus on high-value leads, and implement promotional campaigns',
        affectedPages: ['All sales channels'],
        estimatedImpact: '€25,000 potential revenue shortfall'
      }
    ];

    const mockRules: AlertRule[] = [
      {
        id: 'rule_1',
        name: 'Conversion Rate Drop',
        metric: 'Conversion Rate',
        condition: 'less_than',
        threshold: 3.5,
        timeframe: '1 hour',
        enabled: true,
        severity: 'critical',
        notifications: true,
        emailRecipients: ['admin@localpower.com', 'sales@localpower.com']
      },
      {
        id: 'rule_2',
        name: 'High Bounce Rate',
        metric: 'Bounce Rate',
        condition: 'greater_than',
        threshold: 65,
        timeframe: '30 minutes',
        enabled: true,
        severity: 'warning',
        notifications: true,
        emailRecipients: ['admin@localpower.com']
      },
      {
        id: 'rule_3',
        name: 'Server Performance',
        metric: 'Response Time',
        condition: 'greater_than',
        threshold: 2.0,
        timeframe: '15 minutes',
        enabled: true,
        severity: 'warning',
        notifications: true,
        emailRecipients: ['tech@localpower.com']
      },
      {
        id: 'rule_4',
        name: 'Traffic Anomaly',
        metric: 'Total Traffic',
        condition: 'anomaly',
        threshold: 25,
        timeframe: '1 hour',
        enabled: true,
        severity: 'info',
        notifications: false,
        emailRecipients: ['marketing@localpower.com']
      }
    ];

    const mockMetrics: AlertMetrics = {
      totalAlerts: mockAlerts.length,
      criticalAlerts: mockAlerts.filter(a => a.severity === 'critical').length,
      unreadAlerts: mockAlerts.filter(a => !a.isRead).length,
      avgResolutionTime: '2.4 hours',
      alertsToday: mockAlerts.filter(a => {
        const today = new Date();
        const alertDate = new Date(a.triggeredAt);
        return alertDate.toDateString() === today.toDateString();
      }).length,
      alertsTrend: -12
    };

    setTimeout(() => {
      setAlerts(mockAlerts);
      setRules(mockRules);
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'suppressed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conversion': return 'text-green-600 bg-green-100';
      case 'traffic': return 'text-blue-600 bg-blue-100';
      case 'revenue': return 'text-purple-600 bg-purple-100';
      case 'performance': return 'text-orange-600 bg-orange-100';
      case 'security': return 'text-red-600 bg-red-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const updateAlertStatus = (id: string, status: PerformanceAlert['status']) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status, isRead: true } : alert
    ));
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const severityOptions = [
    { id: 'all', name: 'All Severities' },
    { id: 'critical', name: 'Critical' },
    { id: 'warning', name: 'Warning' },
    { id: 'info', name: 'Info' }
  ];

  const categoryOptions = [
    { id: 'all', name: 'All Categories' },
    { id: 'conversion', name: 'Conversion' },
    { id: 'traffic', name: 'Traffic' },
    { id: 'revenue', name: 'Revenue' },
    { id: 'performance', name: 'Performance' },
    { id: 'security', name: 'Security' },
    { id: 'system', name: 'System' }
  ];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory;
    const matchesResolved = showResolved || alert.status !== 'resolved';
    return matchesSeverity && matchesCategory && matchesResolved;
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading performance alerts...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Performance Alerts</h1>
          <p className="text-gray-600 mt-1">AI-powered monitoring and alerting system</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadAlertsData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <Plus className="w-4 h-4" />
            New Rule
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.criticalAlerts}</p>
                <p className="text-sm text-gray-600">Critical Alerts</p>
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.unreadAlerts}</p>
                <p className="text-sm text-gray-600">Unread Alerts</p>
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgResolutionTime}</p>
                <p className="text-sm text-gray-600">Avg Resolution</p>
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
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.alertsToday}</p>
                <p className="text-sm text-gray-600">Today</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {[
              { id: 'alerts', name: 'Active Alerts', count: alerts.filter(a => a.status !== 'resolved').length },
              { id: 'rules', name: 'Alert Rules', count: rules.length }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedTab === tab.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.name} ({tab.count})
              </motion.button>
            ))}
          </div>

          {selectedTab === 'alerts' && (
            <div className="flex items-center gap-3">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {severityOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResolved(!showResolved)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                  showResolved 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {showResolved ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Resolved
              </motion.button>
            </div>
          )}
        </div>

        {/* Alerts Tab */}
        {selectedTab === 'alerts' && (
          <div className="space-y-4">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 transition-all ${
                  !alert.isRead ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(alert.category)}`}>
                          {alert.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{alert.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Current Value:</span>
                        <p className="font-semibold text-gray-900">{alert.currentValue}{alert.metric.includes('Rate') || alert.metric.includes('Progress') ? '%' : alert.metric.includes('Time') ? 's' : ''}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Threshold:</span>
                        <p className="font-semibold text-gray-900">{alert.threshold}{alert.metric.includes('Rate') || alert.metric.includes('Progress') ? '%' : alert.metric.includes('Time') ? 's' : ''}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Change:</span>
                        <p className={`font-semibold flex items-center gap-1 ${alert.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {alert.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {alert.changePercent.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Triggered:</span>
                        <p className="font-semibold text-gray-900">{new Date(alert.triggeredAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Recommended Action:</h4>
                      <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{alert.recommendedAction}</p>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Estimated Impact:</h4>
                      <p className="text-sm text-gray-600">{alert.estimatedImpact}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {alert.affectedPages.map((page, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {page}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Alert #{alert.id.split('_')[1]}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => markAsRead(alert.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Mark Read
                      </motion.button>
                    )}
                    
                    {alert.status === 'active' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium hover:bg-yellow-200 transition-colors"
                      >
                        Acknowledge
                      </motion.button>
                    )}
                    
                    {(alert.status === 'active' || alert.status === 'acknowledged') && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateAlertStatus(alert.id, 'resolved')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                      >
                        Resolve
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Rules Tab */}
        {selectedTab === 'rules' && (
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                        {rule.severity}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.enabled ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                      }`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Metric:</span>
                        <span className="ml-2 text-gray-900">{rule.metric}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Condition:</span>
                        <span className="ml-2 text-gray-900">{rule.condition.replace('_', ' ')} {rule.threshold}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Timeframe:</span>
                        <span className="ml-2 text-gray-900">{rule.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Recipients:</span>
                        <span className="ml-2 text-gray-900">{rule.emailRecipients.length} users</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredAlerts.length === 0 && selectedTab === 'alerts' && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
            <p className="text-gray-600">Your system is performing well within all thresholds.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceAlerts;