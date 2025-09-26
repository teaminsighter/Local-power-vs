'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  template: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  last_modified: string;
  views: number;
  conversions: number;
  conversion_rate: number;
  thumbnail: string;
  ab_test?: {
    is_running: boolean;
    variant_name: string;
    traffic_split: number;
  };
}

interface PageTemplate {
  id: string;
  name: string;
  category: 'solar' | 'battery' | 'generic' | 'funnel';
  preview_image: string;
  components: string[];
  description: string;
}

const LandingPages = () => {
  const [activeView, setActiveView] = useState<'list' | 'templates' | 'editor'>('list');
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for existing pages
  const [pages] = useState<LandingPage[]>([
    {
      id: '1',
      name: 'Solar Calculator - Dublin',
      slug: 'solar-calculator-dublin',
      template: 'solar-calculator',
      status: 'published',
      created_at: '2024-09-20T10:00:00Z',
      last_modified: '2024-09-25T14:30:00Z',
      views: 15420,
      conversions: 642,
      conversion_rate: 4.16,
      thumbnail: '/admin/thumbnails/solar-calc.jpg',
      ab_test: {
        is_running: true,
        variant_name: 'Variant B - Green Theme',
        traffic_split: 50
      }
    },
    {
      id: '2',
      name: 'Battery Storage Landing',
      slug: 'battery-storage',
      template: 'battery-focused',
      status: 'published',
      created_at: '2024-09-18T09:15:00Z',
      last_modified: '2024-09-24T11:20:00Z',
      views: 8934,
      conversions: 287,
      conversion_rate: 3.21,
      thumbnail: '/admin/thumbnails/battery.jpg'
    },
    {
      id: '3',
      name: 'Home Energy Solutions',
      slug: 'home-energy',
      template: 'comprehensive',
      status: 'draft',
      created_at: '2024-09-25T16:45:00Z',
      last_modified: '2024-09-26T08:10:00Z',
      views: 234,
      conversions: 12,
      conversion_rate: 5.13,
      thumbnail: '/admin/thumbnails/home-energy.jpg'
    }
  ]);

  // Mock templates
  const [templates] = useState<PageTemplate[]>([
    {
      id: 'solar-calculator',
      name: 'Solar Calculator Page',
      category: 'solar',
      preview_image: '/admin/templates/solar-calc-template.jpg',
      components: ['Hero Section', 'Calculator Widget', 'Benefits Grid', 'Testimonials', 'Contact Form'],
      description: 'Interactive solar calculator with real-time quotes and lead capture'
    },
    {
      id: 'battery-focused',
      name: 'Battery Storage Focus',
      category: 'battery',
      preview_image: '/admin/templates/battery-template.jpg',
      components: ['Hero Video', 'Feature Comparison', 'ROI Calculator', 'Installation Gallery'],
      description: 'Dedicated battery storage landing page with cost-benefit analysis'
    },
    {
      id: 'comprehensive',
      name: 'Full Home Energy',
      category: 'solar',
      preview_image: '/admin/templates/comprehensive-template.jpg',
      components: ['Multi-step Hero', 'Service Grid', 'Calculator', 'Process Timeline', 'FAQ'],
      description: 'Complete home energy solution page with multiple conversion paths'
    },
    {
      id: 'funnel-step1',
      name: 'Funnel - Step 1',
      category: 'funnel',
      preview_image: '/admin/templates/funnel-template.jpg',
      components: ['Minimal Hero', 'Single Question Form', 'Progress Bar'],
      description: 'High-converting single-step lead capture funnel'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'solar': return 'bg-yellow-100 text-yellow-800';
      case 'battery': return 'bg-blue-100 text-blue-800';
      case 'funnel': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = 
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-gray-600">Create and manage high-converting landing pages</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('templates')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📋 Browse Templates
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Create New Page
          </motion.button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'list', name: 'My Pages', icon: '📄' },
          { id: 'templates', name: 'Templates', icon: '🎨' },
          { id: 'editor', name: 'Page Editor', icon: '✏️' }
        ].map((view) => (
          <motion.button
            key={view.id}
            onClick={() => setActiveView(view.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeView === view.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{view.icon}</span>
            {view.name}
          </motion.button>
        ))}
      </div>

      {/* My Pages View */}
      {activeView === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Pages</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or slug..."
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
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Page Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-400">
                    📱
                  </div>
                  
                  {/* A/B Test Badge */}
                  {page.ab_test?.is_running && (
                    <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      A/B Testing
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(page.status)}`}>
                    {page.status}
                  </div>
                </div>

                {/* Page Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {page.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Preview Page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveView('editor')}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Edit Page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    /{page.slug}
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{page.views.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{page.conversions}</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{page.conversion_rate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">Rate</div>
                    </div>
                  </div>

                  {/* A/B Test Info */}
                  {page.ab_test?.is_running && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="text-sm font-medium text-purple-800">A/B Test Running</div>
                      </div>
                      <div className="text-xs text-purple-600">
                        {page.ab_test.variant_name} • {page.ab_test.traffic_split}% split
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Edit Page
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      title="Duplicate Page"
                    >
                      📄
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      title="Analytics"
                    >
                      📊
                    </motion.button>
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    Modified: {formatDate(page.last_modified)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Templates View */}
      {activeView === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Choose a Template</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>💡 Pro tip: All templates are mobile-responsive and SEO optimized</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Template Preview */}
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-8xl text-gray-400">
                    🎨
                  </div>
                  
                  {/* Category Badge */}
                  <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <motion.button
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Preview Template
                    </motion.button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {template.description}
                  </p>

                  {/* Components List */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Included Components:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.components.slice(0, 3).map((component, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {component}
                        </span>
                      ))}
                      {template.components.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{template.components.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Use Template
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Preview
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Page Editor View */}
      {activeView === 'editor' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Visual Page Editor</h2>
              <p className="text-gray-600">Drag and drop components to build your perfect landing page</p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📱 Preview
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                💾 Save Page
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-96">
            {/* Component Library */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Components</h3>
              <div className="space-y-2">
                {[
                  '🎯 Hero Section',
                  '📊 Calculator Widget',
                  '⭐ Testimonials',
                  '📝 Contact Form',
                  '🖼️ Image Gallery',
                  '📋 Feature List',
                  '💰 Pricing Table',
                  '❓ FAQ Section'
                ].map((component, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-white rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                  >
                    <div className="text-sm font-medium text-gray-700">{component}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Page Canvas */}
            <div className="lg:col-span-2 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl text-gray-400 mb-4">🎨</div>
                <div className="text-lg font-medium text-gray-600">Visual Editor Canvas</div>
                <div className="text-sm text-gray-500 mt-2">
                  Drag components from the left to build your page
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Settings</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Page Name</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Enter page name" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">URL Slug</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="page-url" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">SEO Title</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Page title" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPages;