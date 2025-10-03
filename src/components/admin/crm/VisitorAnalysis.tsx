'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Clock, 
  MousePointer, 
  Eye, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Tablet,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  ChevronRight,
  Star,
  Target,
  Activity,
  Globe,
  Users
} from 'lucide-react';

interface VisitorProfile {
  id: string;
  visitorUserId: string;
  fingerprint?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  totalSessionTime: number;
  totalPagesViewed: number;
  conversionScore: number;
  isFrequentVisitor: boolean;
  leadScore: number;
  tags?: string;
  notes?: string;
  status: 'ANONYMOUS' | 'IDENTIFIED' | 'LEAD' | 'CUSTOMER';
}

interface VisitorSession {
  id: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pagesVisited: any[];
  actionsPerformed: any[];
  entryPage: string;
  exitPage?: string;
  referrer?: string;
  deviceInfo: any;
  dropOffPoint?: string;
}

interface VisitorJourney {
  id: string;
  page: string;
  timestamp: string;
  stayTime?: number;
  scrollDepth?: number;
  actions?: any;
  deviceType: string;
  browser: string;
}

const VisitorAnalysis = () => {
  const [visitors, setVisitors] = useState<VisitorProfile[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorProfile | null>(null);
  const [visitorSessions, setVisitorSessions] = useState<VisitorSession[]>([]);
  const [visitorJourney, setVisitorJourney] = useState<VisitorJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [frequentVisitorFilter, setFrequentVisitorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for development (replace with real API calls)
  const mockVisitors: VisitorProfile[] = [
    {
      id: '1',
      visitorUserId: 'visitor_1k2j3h4g5f',
      fingerprint: 'fp_abc123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+353 1 234 5678',
      firstVisit: '2024-09-20T10:30:00Z',
      lastVisit: '2024-09-30T15:45:00Z',
      totalVisits: 8,
      totalSessionTime: 3600,
      totalPagesViewed: 24,
      conversionScore: 85,
      isFrequentVisitor: true,
      leadScore: 90,
      tags: 'high-intent,solar-interested,dublin',
      notes: 'Very engaged visitor, viewed pricing multiple times',
      status: 'IDENTIFIED'
    },
    {
      id: '2',
      visitorUserId: 'visitor_9x8y7z6w5v',
      fingerprint: 'fp_def456',
      firstVisit: '2024-09-28T14:20:00Z',
      lastVisit: '2024-09-30T16:10:00Z',
      totalVisits: 3,
      totalSessionTime: 1200,
      totalPagesViewed: 12,
      conversionScore: 45,
      isFrequentVisitor: true,
      leadScore: 60,
      tags: 'return-visitor,mobile-user',
      status: 'ANONYMOUS'
    },
    {
      id: '3',
      visitorUserId: 'visitor_5a4b3c2d1e',
      fingerprint: 'fp_ghi789',
      firstName: 'Sarah',
      lastName: 'Murphy',
      email: 'sarah.murphy@email.com',
      firstVisit: '2024-09-15T09:15:00Z',
      lastVisit: '2024-09-30T11:30:00Z',
      totalVisits: 12,
      totalSessionTime: 4800,
      totalPagesViewed: 48,
      conversionScore: 95,
      isFrequentVisitor: true,
      leadScore: 100,
      tags: 'converted,premium-customer,cork',
      notes: 'Converted to customer, high-value prospect',
      status: 'CUSTOMER'
    }
  ];

  useEffect(() => {
    fetchVisitors();
  }, [currentPage, statusFilter, frequentVisitorFilter, searchTerm]);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredVisitors = [...mockVisitors];
      
      // Apply filters
      if (statusFilter !== 'all') {
        filteredVisitors = filteredVisitors.filter(v => v.status === statusFilter);
      }
      
      if (frequentVisitorFilter === 'frequent') {
        filteredVisitors = filteredVisitors.filter(v => v.isFrequentVisitor);
      } else if (frequentVisitorFilter === 'new') {
        filteredVisitors = filteredVisitors.filter(v => !v.isFrequentVisitor);
      }
      
      if (searchTerm) {
        filteredVisitors = filteredVisitors.filter(v => 
          v.visitorUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (v.firstName && v.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (v.lastName && v.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      setVisitors(filteredVisitors);
      setTotalPages(Math.ceil(filteredVisitors.length / 10));
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorDetails = async (visitorUserId: string) => {
    try {
      // Mock data for visitor sessions and journey
      const mockSessions: VisitorSession[] = [
        {
          id: '1',
          sessionId: 'session_abc123',
          startTime: '2024-09-30T15:45:00Z',
          endTime: '2024-09-30T16:15:00Z',
          duration: 1800,
          pagesVisited: [
            { page: '/', timestamp: '2024-09-30T15:45:00Z', timeSpent: 120 },
            { page: '/solar-calculator', timestamp: '2024-09-30T15:47:00Z', timeSpent: 600 },
            { page: '/pricing', timestamp: '2024-09-30T15:57:00Z', timeSpent: 300 }
          ],
          actionsPerformed: [
            { action: 'scroll', page: '/', depth: 75 },
            { action: 'click', element: 'cta-button', page: '/' },
            { action: 'form_interaction', element: 'calculator', page: '/solar-calculator' }
          ],
          entryPage: '/',
          exitPage: '/pricing',
          referrer: 'https://google.com',
          deviceInfo: { type: 'desktop', browser: 'chrome', os: 'windows' }
        }
      ];

      const mockJourney: VisitorJourney[] = [
        {
          id: '1',
          page: '/pricing',
          timestamp: '2024-09-30T15:57:00Z',
          stayTime: 300,
          scrollDepth: 65,
          actions: { clicks: 2, form_interactions: 0 },
          deviceType: 'desktop',
          browser: 'chrome'
        },
        {
          id: '2',
          page: '/solar-calculator',
          timestamp: '2024-09-30T15:47:00Z',
          stayTime: 600,
          scrollDepth: 90,
          actions: { clicks: 5, form_interactions: 3 },
          deviceType: 'desktop',
          browser: 'chrome'
        }
      ];

      setVisitorSessions(mockSessions);
      setVisitorJourney(mockJourney);
    } catch (error) {
      console.error('Error fetching visitor details:', error);
    }
  };

  const handleVisitorSelect = (visitor: VisitorProfile) => {
    setSelectedVisitor(visitor);
    fetchVisitorDetails(visitor.visitorUserId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CUSTOMER': return 'bg-green-100 text-green-800 border-green-200';
      case 'LEAD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IDENTIFIED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ANONYMOUS': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Visitor Analysis</h2>
          <p className="text-gray-600">Detailed visitor behavior and journey tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitors List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Profiles</h3>
              
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="LEAD">Lead</option>
                    <option value="IDENTIFIED">Identified</option>
                    <option value="ANONYMOUS">Anonymous</option>
                  </select>
                  
                  <select
                    value={frequentVisitorFilter}
                    onChange={(e) => setFrequentVisitorFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Visitors</option>
                    <option value="frequent">Frequent</option>
                    <option value="new">New</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Visitors List */}
            <div className="max-h-96 overflow-y-auto">
              {visitors.map((visitor) => (
                <motion.div
                  key={visitor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedVisitor?.id === visitor.id ? 'bg-green-50 border-green-200' : ''
                  }`}
                  onClick={() => handleVisitorSelect(visitor)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-sm text-gray-900">
                        {visitor.firstName && visitor.lastName 
                          ? `${visitor.firstName} ${visitor.lastName}`
                          : visitor.visitorUserId.substring(0, 12) + '...'
                        }
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(visitor.status)}`}>
                      {visitor.status}
                    </span>
                    {visitor.isFrequentVisitor && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        Frequent
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {visitor.totalVisits} visits
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Score: {visitor.leadScore}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Visitor Details */}
        <div className="lg:col-span-2">
          {selectedVisitor ? (
            <div className="space-y-6">
              {/* Visitor Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedVisitor.firstName && selectedVisitor.lastName 
                        ? `${selectedVisitor.firstName} ${selectedVisitor.lastName}`
                        : 'Anonymous Visitor'
                      }
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">{selectedVisitor.visitorUserId}</p>
                    {selectedVisitor.email && (
                      <p className="text-sm text-gray-600 mt-1">{selectedVisitor.email}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedVisitor.status)}`}>
                      {selectedVisitor.status}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">{selectedVisitor.totalVisits}</div>
                    <div className="text-xs text-blue-600">Total Visits</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">{formatDuration(selectedVisitor.totalSessionTime)}</div>
                    <div className="text-xs text-green-600">Total Time</div>
                  </div>
                  
                  <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Eye className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-900">{selectedVisitor.totalPagesViewed}</div>
                    <div className="text-xs text-yellow-600">Pages Viewed</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-900">{selectedVisitor.leadScore}</div>
                    <div className="text-xs text-purple-600">Lead Score</div>
                  </div>
                </div>

                {/* Tags and Notes */}
                {selectedVisitor.tags && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVisitor.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVisitor.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedVisitor.notes}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Visitor Journey */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity Journey</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {visitorJourney.map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{activity.page}</h4>
                            <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {activity.stayTime ? formatDuration(activity.stayTime) : 'N/A'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <MousePointer className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {activity.scrollDepth || 0}% scrolled
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(activity.deviceType)}
                              <span className="text-gray-600 capitalize">
                                {activity.deviceType} / {activity.browser}
                              </span>
                            </div>
                          </div>
                          
                          {activity.actions && (
                            <div className="mt-2 text-xs text-gray-500">
                              Actions: {activity.actions.clicks || 0} clicks, {activity.actions.form_interactions || 0} form interactions
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Visitor</h3>
              <p className="text-gray-600">Choose a visitor from the list to view their detailed analysis and journey.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorAnalysis;