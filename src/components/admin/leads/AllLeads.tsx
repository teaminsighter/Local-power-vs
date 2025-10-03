'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { hybridLeadsService } from '@/services/hybridLeadsService';

interface SystemDetails {
  systemSize: number;
  estimatedCost: number;
  annualSavings: number;
  paybackPeriod: number;
  panelCount: number;
  roofArea: number;
  monthlyBill: number;
  usageKwh: number;
  propertyType: string;
  roofType: string;
}

interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  last_visit: string;
  total_visits: number;
  utm_source: string;
  utm_campaign: string;
  conversion_status: 'lead' | 'qualified' | 'customer' | 'lost';
  quote_value: number;
  gclid?: string;
  fbclid?: string;
  new_submission: boolean;
  form_steps_completed: number;
  total_form_steps: number;
  systemDetails?: SystemDetails;
  
  // Enhanced Tracking Fields
  dateCreated?: string;
  dateModified?: string;
  
  // UTM Parameters
  utmCampaign?: string;
  utmMedium?: string;
  utmContent?: string;
  utmKeyword?: string;
  utmPlacement?: string;
  
  // User/Device Information
  visitorUserId?: string;
  ipAddress?: string;
  device?: string;
  displayAspectRatio?: string;
  defaultLocation?: string;
  
  // Form Tracking
  formId?: string;
  formClass?: string;
  formName?: string;
  
  // A/B Test Tracking
  abTestId?: string;
  abVariant?: 'A' | 'B';
  
  // Visit URL Tracking
  firstVisitUrl?: string;
  lastVisitUrl?: string;
}

const AllLeads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    // Basic Lead Info
    lead: true,
    contact: true,
    source: true,
    status: true,
    progress: true,
    panels: true,
    systemDetails: true,
    quote: true,
    created: false,
    lastVisit: false,
    
    // Enhanced Tracking Fields
    dateCreated: false,
    dateModified: false,
    
    // UTM Parameters
    utmCampaign: false,
    utmMedium: false,
    utmContent: false,
    utmKeyword: false,
    utmPlacement: false,
    
    // Tracking IDs
    gclid: false,
    fbclid: false,
    
    // User/Device Info
    visitorUserId: true, // You wanted this visible
    ipAddress: false,
    device: false,
    displayAspectRatio: false,
    defaultLocation: false,
    
    // Form Info
    formId: false,
    formClass: false,
    formName: false,
    
    // A/B Test Info
    abTestId: false,
    abVariant: false,
    
    // Visit URL Tracking
    firstVisitUrl: false,
    lastVisitUrl: false
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real leads data
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hybridLeadsService.getAllLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setError('Failed to load leads data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Search in new tracking fields
      (lead.visitorUserId && lead.visitorUserId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.utmCampaign && lead.utmCampaign.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.utmMedium && lead.utmMedium.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.utmContent && lead.utmContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.utmKeyword && lead.utmKeyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.device && lead.device.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.defaultLocation && lead.defaultLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.formName && lead.formName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.ipAddress && lead.ipAddress.includes(searchTerm)) ||
      (lead.gclid && lead.gclid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.fbclid && lead.fbclid.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.conversion_status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.utm_source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-yellow-100 text-yellow-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'google-ads': 
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <img 
              src="/logos/logo_google_ads.png" 
              alt="Google Ads" 
              className="w-5 h-5 object-contain"
            />
          </div>
        );
      case 'facebook-ads':
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
            </svg>
          </div>
        );
      case 'google-organic':
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 24c4.74 0 8.71-1.57 11.62-4.24l-3.57-2.77c-1.54 1.03-3.51 1.64-6.05 1.64-4.65 0-8.58-3.14-9.98-7.36H.82v2.85C3.69 20.53 7.59 24 12 24z" fill="#34A853"/>
              <path d="M2.02 14.27C1.69 13.25 1.5 12.14 1.5 11s.19-2.25.52-3.27V4.88H.82C.3 6.69 0 8.31 0 10s.3 3.31.82 5.12l1.2-.85z" fill="#FBBC05"/>
              <path d="M12 4.75c2.62 0 4.97.9 6.81 2.66l2.03-2.03C18.7 3.66 15.59 2.25 12 2.25 7.59 2.25 3.69 5.72.82 10.88l1.2.85C3.42 7.89 7.35 4.75 12 4.75z" fill="#EA4335"/>
            </svg>
          </div>
        );
      case 'bing-organic':
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M5.71 3.5L16.5 8.77v8.87c0 .45-.25.86-.65 1.07l-7.57 4.06c-.4.21-.87.21-1.27 0L.35 18.71c-.4-.21-.65-.62-.65-1.07V8.77L5.71 3.5z" fill="#00BCF2"/>
              <path d="M5.71 3.5v15.21L.35 18.71c-.4-.21-.65-.62-.65-1.07V8.77L5.71 3.5z" fill="#0078D4"/>
              <path d="M16.5 8.77v8.87c0 .45-.25.86-.65 1.07l-7.57 4.06c-.4.21-.87.21-1.27 0l2.28-1.22c.4-.21.65-.62.65-1.07V8.77L16.5 8.77z" fill="#40E0D0"/>
            </svg>
          </div>
        );
      case 'email':
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
        );
      case 'direct': 
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );
      default: 
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z"/>
            </svg>
          </div>
        );
    }
  };

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'google-ads': return 'Google Ads';
      case 'facebook-ads': return 'Facebook Ads';
      case 'google-organic': return 'Google Organic';
      case 'bing-organic': return 'Bing Organic';
      case 'email': return 'Email Marketing';
      case 'direct': return 'Direct Traffic';
      default: return source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    setSelectedLeads(
      selectedLeads.length === filteredLeads.length 
        ? [] 
        : filteredLeads.map(lead => lead.id)
    );
  };

  const handleEditLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setEditStatus(lead.conversion_status);
      setShowEditModal(true);
    }
  };

  const handleViewLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setShowViewModal(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedLead && editStatus) {
      console.log(`Updated lead ${selectedLead.id} status to: ${editStatus}`);
      // In a real app, this would make an API call to update the lead
      setShowEditModal(false);
      setSelectedLead(null);
      setEditStatus('');
    }
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedLead(null);
    setEditStatus('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>
          <p className="text-gray-600">Manage and analyze your lead database</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Export CSV
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Import Leads
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Leads</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="customer">Customer</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Sources</option>
              <option value="google-ads">Google Ads</option>
              <option value="facebook-ads">Facebook Ads</option>
              <option value="organic">Organic Search</option>
              <option value="direct">Direct</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Columns</label>
            <div className="relative">
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-left flex items-center justify-between"
              >
                <span>Customize View</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showColumnDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-h-96 overflow-y-auto" style={{width: '200%'}}>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                    {Object.entries({
                      // Basic Lead Info
                      lead: 'Lead Info',
                      contact: 'Contact',
                      source: 'Source',
                      status: 'Status', 
                      progress: 'Progress',
                      panels: 'Panels',
                      systemDetails: 'System Details',
                      quote: 'Quote Value',
                      created: 'Created Date',
                      lastVisit: 'Last Visit',
                      
                      // Enhanced Tracking Fields
                      dateCreated: 'Date Lead Created',
                      dateModified: 'Date Lead Modified',
                      
                      // UTM Parameters
                      utmCampaign: 'UTM Campaign',
                      utmMedium: 'UTM Medium',
                      utmContent: 'UTM Content',
                      utmKeyword: 'UTM Keyword',
                      utmPlacement: 'UTM Placement',
                      
                      // Tracking IDs
                      gclid: 'Google Click ID',
                      fbclid: 'Facebook Click ID',
                      
                      // User/Device Info
                      visitorUserId: 'Visitor User ID',
                      ipAddress: 'IP Address',
                      device: 'Device Type',
                      displayAspectRatio: 'Display Aspect Ratio',
                      defaultLocation: 'Location',
                      
                      // Form Info
                      formId: 'Form ID',
                      formClass: 'Form Class',
                      formName: 'Form Name',
                      
                      // A/B Test Info
                      abTestId: 'A/B Test ID',
                      abVariant: 'A/B Variant',
                      
                      // Visit URL Tracking
                      firstVisitUrl: 'First Visit URL',
                      lastVisitUrl: 'Last Visit URL'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={visibleColumns[key as keyof typeof visibleColumns]}
                          onChange={(e) => setVisibleColumns(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                        />
                        <span className="text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
                    <button
                      onClick={() => {
                        const allColumns = Object.keys(visibleColumns).reduce((acc, key) => ({
                          ...acc,
                          [key]: true
                        }), {});
                        setVisibleColumns(allColumns);
                      }}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => {
                        const basicColumns = Object.keys(visibleColumns).reduce((acc, key) => ({
                          ...acc,
                          [key]: ['lead', 'contact', 'source', 'status', 'quote', 'created'].includes(key)
                        }), {});
                        setVisibleColumns(basicColumns);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Basic View
                    </button>
                    <button
                      onClick={() => {
                        const noColumns = Object.keys(visibleColumns).reduce((acc, key) => ({
                          ...acc,
                          [key]: false
                        }), {});
                        setVisibleColumns(noColumns);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-2">
              <span>{selectedLeads.length} selected</span>
              <button className="text-green-600 hover:text-green-700">
                Bulk Actions ▼
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      {showEditModal && selectedLead && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModals}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-auto max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Lead Status</h3>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Lead: <span className="font-medium">{selectedLead.name}</span></p>
              <p className="text-sm text-gray-600 mb-4">Current Status: <span className="font-medium capitalize">{selectedLead.conversion_status}</span></p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="customer">Customer</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModals}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedLead && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModals}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-auto max-w-md mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{selectedLead.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{selectedLead.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{selectedLead.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">{selectedLead.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-gray-900 capitalize">{selectedLead.conversion_status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Source</label>
                <p className="text-gray-900">{getSourceDisplayName(selectedLead.utm_source)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quote Value</label>
                <p className="text-gray-900 font-semibold">€{selectedLead.quote_value.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Form Progress</label>
                <p className="text-gray-900">{selectedLead.form_steps_completed}/{selectedLead.total_form_steps} steps completed</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Visits</label>
                <p className="text-gray-900">{selectedLead.total_visits}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{formatDate(selectedLead.created_at)}</p>
              </div>
              
              {selectedLead.systemDetails && (
                <>
                  <div className="col-span-2 mt-2 pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">System Details</h4>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Panel Count</label>
                    <p className="text-gray-900 font-semibold">{selectedLead.systemDetails.panelCount} panels</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">System Size</label>
                    <p className="text-gray-900">{selectedLead.systemDetails.systemSize}kW</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Roof Area</label>
                    <p className="text-gray-900">{selectedLead.systemDetails.roofArea}m²</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Annual Savings</label>
                    <p className="text-gray-900">€{selectedLead.systemDetails.annualSavings.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payback Period</label>
                    <p className="text-gray-900">{selectedLead.systemDetails.paybackPeriod} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Property Type</label>
                    <p className="text-gray-900 capitalize">{selectedLead.systemDetails.propertyType}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModals}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Leads Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                {visibleColumns.lead && (
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Lead</th>
                )}
                {visibleColumns.contact && (
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Contact</th>
                )}
                {visibleColumns.source && (
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Source</th>
                )}
                {visibleColumns.status && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Status</th>
                )}
                {visibleColumns.progress && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Progress</th>
                )}
                {visibleColumns.panels && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Panels</th>
                )}
                {visibleColumns.systemDetails && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">System Details</th>
                )}
                {visibleColumns.quote && (
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-900">Quote Value</th>
                )}
                {visibleColumns.created && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Created</th>
                )}
                {visibleColumns.lastVisit && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Last Visit</th>
                )}
                
                {/* Enhanced Tracking Fields */}
                {visibleColumns.dateCreated && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Date Created</th>
                )}
                {visibleColumns.dateModified && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Date Modified</th>
                )}
                
                {/* UTM Parameters */}
                {visibleColumns.utmCampaign && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">UTM Campaign</th>
                )}
                {visibleColumns.utmMedium && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">UTM Medium</th>
                )}
                {visibleColumns.utmContent && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">UTM Content</th>
                )}
                {visibleColumns.utmKeyword && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">UTM Keyword</th>
                )}
                {visibleColumns.utmPlacement && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">UTM Placement</th>
                )}
                
                {/* Tracking IDs */}
                {visibleColumns.gclid && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Google Click ID</th>
                )}
                {visibleColumns.fbclid && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Facebook Click ID</th>
                )}
                
                {/* User/Device Info */}
                {visibleColumns.visitorUserId && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Visitor ID</th>
                )}
                {visibleColumns.ipAddress && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">IP Address</th>
                )}
                {visibleColumns.device && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Device</th>
                )}
                {visibleColumns.displayAspectRatio && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Aspect Ratio</th>
                )}
                {visibleColumns.defaultLocation && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Location</th>
                )}
                
                {/* Form Info */}
                {visibleColumns.formId && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Form ID</th>
                )}
                {visibleColumns.formClass && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Form Class</th>
                )}
                {visibleColumns.formName && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Form Name</th>
                )}
                
                {/* A/B Test Info */}
                {visibleColumns.abTestId && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">A/B Test</th>
                )}
                {visibleColumns.abVariant && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Variant</th>
                )}
                
                {/* Visit URL Tracking */}
                {visibleColumns.firstVisitUrl && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">First Visit URL</th>
                )}
                {visibleColumns.lastVisitUrl && (
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Last Visit URL</th>
                )}
                
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  
                  {visibleColumns.lead && (
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          {lead.new_submission && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {lead.user_id.substring(0, 12)}...
                        </div>
                        <div className="text-xs text-gray-400">
                          Created: {formatDate(lead.created_at)}
                        </div>
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.contact && (
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{lead.email}</div>
                        <div className="text-gray-500">{lead.phone}</div>
                        <div className="text-gray-400">{lead.address}</div>
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.source && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSourceIcon(lead.utm_source)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getSourceDisplayName(lead.utm_source)}
                          </div>
                          {lead.utm_campaign && (
                            <div className="text-xs text-gray-500">
                              {lead.utm_campaign}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.status && (
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(lead.conversion_status)}`}>
                        {lead.conversion_status}
                      </span>
                    </td>
                  )}
                  
                  {visibleColumns.progress && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-20">
                          <div className="text-xs text-gray-600 mb-1">
                            {lead.form_steps_completed}/{lead.total_form_steps} steps
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ 
                                width: `${(lead.form_steps_completed / lead.total_form_steps) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.panels && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.systemDetails?.panelCount || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.systemDetails?.systemSize || 0}kW
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.systemDetails && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2z"/>
                          </svg>
                          {lead.systemDetails?.panelCount || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          panels
                        </div>
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.quote && (
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        €{lead.quote_value.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.total_visits} visit{lead.total_visits !== 1 ? 's' : ''}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.created && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-500">
                        {formatDate(lead.created_at)}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.lastVisit && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-500">
                        {formatDate(lead.last_visit)}
                      </div>
                    </td>
                  )}
                  
                  {/* Enhanced Tracking Fields */}
                  {visibleColumns.dateCreated && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-500">
                        {lead.dateCreated ? formatDate(lead.dateCreated) : '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.dateModified && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-500">
                        {lead.dateModified ? formatDate(lead.dateModified) : '-'}
                      </div>
                    </td>
                  )}
                  
                  {/* UTM Parameters */}
                  {visibleColumns.utmCampaign && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600">
                        {lead.utmCampaign || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.utmMedium && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600">
                        {lead.utmMedium || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.utmContent && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600">
                        {lead.utmContent || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.utmKeyword && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600">
                        {lead.utmKeyword || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.utmPlacement && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600">
                        {lead.utmPlacement || '-'}
                      </div>
                    </td>
                  )}
                  
                  {/* Tracking IDs */}
                  {visibleColumns.gclid && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600 font-mono">
                        {lead.gclid || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.fbclid && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600 font-mono">
                        {lead.fbclid || '-'}
                      </div>
                    </td>
                  )}
                  
                  {/* User/Device Info */}
                  {visibleColumns.visitorUserId && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-blue-600 font-mono">
                        {lead.visitorUserId ? lead.visitorUserId.substring(0, 12) + '...' : '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.ipAddress && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600 font-mono">
                        {lead.ipAddress || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.device && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600">
                        {lead.device || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.displayAspectRatio && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600">
                        {lead.displayAspectRatio || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.defaultLocation && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600">
                        {lead.defaultLocation || '-'}
                      </div>
                    </td>
                  )}
                  
                  {/* Form Info */}
                  {visibleColumns.formId && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-purple-600">
                        {lead.formId || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.formClass && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-purple-600">
                        {lead.formClass || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.formName && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-purple-600">
                        {lead.formName || '-'}
                      </div>
                    </td>
                  )}
                  
                  {/* A/B Test Info */}
                  {visibleColumns.abTestId && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-orange-600">
                        {lead.abTestId ? lead.abTestId.substring(0, 8) + '...' : '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.abVariant && (
                    <td className="px-6 py-4 text-center">
                      <div className={`text-xs font-semibold px-2 py-1 rounded ${
                        lead.abVariant === 'A' ? 'bg-blue-100 text-blue-800' :
                        lead.abVariant === 'B' ? 'bg-green-100 text-green-800' :
                        'text-gray-400'
                      }`}>
                        {lead.abVariant || '-'}
                      </div>
                    </td>
                  )}
                  
                  {/* Visit URL Tracking */}
                  {visibleColumns.firstVisitUrl && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-blue-600 max-w-xs truncate" title={lead.firstVisitUrl}>
                        {lead.firstVisitUrl ? (
                          <a href={lead.firstVisitUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {lead.firstVisitUrl.length > 30 ? lead.firstVisitUrl.substring(0, 30) + '...' : lead.firstVisitUrl}
                          </a>
                        ) : '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.lastVisitUrl && (
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-blue-600 max-w-xs truncate" title={lead.lastVisitUrl}>
                        {lead.lastVisitUrl ? (
                          <a href={lead.lastVisitUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {lead.lastVisitUrl.length > 30 ? lead.lastVisitUrl.substring(0, 30) + '...' : lead.lastVisitUrl}
                          </a>
                        ) : '-'}
                      </div>
                    </td>
                  )}
                  
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewLead(lead.id)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditLead(lead.id)}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Edit Lead"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
        
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-gray-600">Loading leads...</div>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 text-lg mb-2">Error Loading Leads</div>
            <div className="text-sm text-gray-500 mb-4">{error}</div>
            <button 
              onClick={fetchLeads}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        
        {!loading && !error && filteredLeads.length === 0 && leads.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="text-gray-400 text-lg mb-2">No leads yet</div>
            <div className="text-sm text-gray-500">
              Leads will appear here when users complete the solar calculator
            </div>
          </div>
        )}
        
        {!loading && !error && filteredLeads.length === 0 && leads.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No leads match your filters</div>
            <div className="text-sm text-gray-500">
              Try adjusting your search terms or filters
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AllLeads;