'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
}

const AllLeads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Mock data - in real implementation this would come from API
  const [leads] = useState<Lead[]>([
    {
      id: '1',
      user_id: 'usr_123456789',
      name: 'John Murphy',
      email: 'john.murphy@email.ie',
      phone: '+353 86 123 4567',
      address: 'Dublin 2, Ireland',
      created_at: '2024-09-25T10:30:00Z',
      last_visit: '2024-09-26T08:15:00Z',
      total_visits: 3,
      utm_source: 'google-ads',
      utm_campaign: 'solar-calculator-dublin',
      conversion_status: 'qualified',
      quote_value: 12500,
      gclid: 'Cj0KCQiA3...example',
      new_submission: false,
      form_steps_completed: 6,
      total_form_steps: 6
    },
    {
      id: '2',
      user_id: 'usr_987654321',
      name: 'Sarah O\'Connor',
      email: 'sarah.oconnor@gmail.com',
      phone: '+353 87 987 6543',
      address: 'Cork City, Ireland',
      created_at: '2024-09-25T14:22:00Z',
      last_visit: '2024-09-25T14:45:00Z',
      total_visits: 1,
      utm_source: 'facebook-ads',
      utm_campaign: 'solar-autumn-2024',
      conversion_status: 'lead',
      quote_value: 8900,
      fbclid: 'IwAR1...example',
      new_submission: true,
      form_steps_completed: 4,
      total_form_steps: 6
    },
    {
      id: '3',
      user_id: 'usr_456789123',
      name: 'Michael Kelly',
      email: 'mkelly@hotmail.com',
      phone: '+353 89 456 7890',
      address: 'Galway, Ireland',
      created_at: '2024-09-24T16:10:00Z',
      last_visit: '2024-09-26T07:30:00Z',
      total_visits: 5,
      utm_source: 'organic',
      utm_campaign: '',
      conversion_status: 'customer',
      quote_value: 15800,
      new_submission: false,
      form_steps_completed: 6,
      total_form_steps: 6
    }
  ]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.address.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      case 'google-ads': return '🟢';
      case 'facebook-ads': return '🔵';
      case 'organic': return '🔍';
      case 'direct': return '🌐';
      default: return '📊';
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

      {/* Leads Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
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
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Lead</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Source</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Status</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-900">Progress</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-900">Quote Value</th>
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
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">{lead.email}</div>
                      <div className="text-gray-500">{lead.phone}</div>
                      <div className="text-gray-400">{lead.address}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSourceIcon(lead.utm_source)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {lead.utm_source.replace('-', ' ')}
                        </div>
                        {lead.utm_campaign && (
                          <div className="text-xs text-gray-500">
                            {lead.utm_campaign}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(lead.conversion_status)}`}>
                      {lead.conversion_status}
                    </span>
                  </td>
                  
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
                  
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-900">
                      €{lead.quote_value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lead.total_visits} visit{lead.total_visits !== 1 ? 's' : ''}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
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
        
        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No leads found</div>
            <div className="text-sm text-gray-500">
              Try adjusting your filters or search terms
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AllLeads;