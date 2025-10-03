'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  Eye, 
  MousePointer,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Zap,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface VisitorData {
  activeUsers: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    page: string;
    views: number;
    visitors: number;
  }>;
  recentActivity: Array<{
    id: string;
    timestamp: string;
    page: string;
    location: string;
    device: string;
    userAgent: string;
  }>;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  locationBreakdown: Array<{
    location: string;
    count: number;
  }>;
}

const RealTimeTracking = () => {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadRealTimeData();
    
    if (!isPaused) {
      // Update real-time data every 30 seconds
      const interval = setInterval(() => {
        loadRealTimeData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const loadRealTimeData = async () => {
    try {
      setError(null);
      
      // Fetch real visitor tracking data
      const response = await fetch('/api/analytics/visitor-tracking');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch visitor data');
      }
      
      if (result.success && result.data) {
        setVisitorData(result.data);
        setLastUpdated(new Date());
      } else {
        // No data available
        setVisitorData({
          activeUsers: 0,
          pageViews: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
          topPages: [],
          recentActivity: [],
          deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
          locationBreakdown: []
        });
      }
    } catch (err) {
      console.error('Failed to load visitor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load visitor data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
      return <Smartphone className="w-4 h-4" />;
    } else if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
      return <Tablet className="w-4 h-4" />;
    } else {
      return <Monitor className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading real-time visitor data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Real-time Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadRealTimeData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!visitorData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">No visitor data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-time Visitor Tracking</h1>
          <p className="text-gray-600 mt-1">
            Live visitor activity and engagement metrics • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isPaused 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadRealTimeData}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
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
              <p className="text-2xl font-bold text-gray-900">{visitorData.activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users (24h)</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
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
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{visitorData.pageViews.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Page Views (24h)</p>
              <p className="text-xs text-green-600">Real-time tracking</p>
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
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(visitorData.avgSessionDuration)}</p>
              <p className="text-sm text-gray-600">Avg Session Duration</p>
              <p className="text-xs text-purple-600">From real sessions</p>
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
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{visitorData.bounceRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Bounce Rate</p>
              <p className="text-xs text-yellow-600">Single page visits</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Visitor Activity</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Real-time Data
            </div>
          </div>
          
          {visitorData.recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {visitorData.recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getDeviceIcon(activity.device)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {activity.page}
                    </div>
                    <div className="text-xs text-gray-600">
                      {activity.location} • {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent visitor activity</p>
            </div>
          )}
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Device Breakdown</h3>
          
          <div className="space-y-4">
            {Object.entries(visitorData.deviceBreakdown).map(([device, count]) => {
              const total = Object.values(visitorData.deviceBreakdown).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device)}
                    <span className="text-sm font-medium text-gray-900 capitalize">{device}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Top Pages and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Most Visited Pages</h3>
          
          {visitorData.topPages.length > 0 ? (
            <div className="space-y-3">
              {visitorData.topPages.map((page, index) => (
                <div key={`${page.page}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{page.page}</div>
                    <div className="text-sm text-gray-600">{page.visitors} unique visitors</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{page.views}</div>
                    <div className="text-xs text-gray-500">views</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No page data available</p>
            </div>
          )}
        </motion.div>

        {/* Top Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Visitor Locations</h3>
          
          {visitorData.locationBreakdown.length > 0 ? (
            <div className="space-y-3">
              {visitorData.locationBreakdown.map((location, index) => {
                const total = visitorData.locationBreakdown.reduce((sum, l) => sum + l.count, 0);
                const percentage = total > 0 ? (location.count / total) * 100 : 0;
                
                return (
                  <div key={`${location.location}-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{location.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{location.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No location data available</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RealTimeTracking;