'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Play, Edit, Eye, Copy, Palette, Type, Image, Layout } from 'lucide-react';

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  template: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  last_modified?: string;
  views: number;
  conversions: number;
  conversion_rate: number;
  thumbnail?: string;
  content?: any;
}

interface CreateTestFormData {
  name: string;
  description: string;
  goal: 'conversion_rate' | 'revenue' | 'engagement' | 'lead_generation';
  selectedPageA: LandingPage | null;
  selectedPageB: LandingPage | null;
  trafficSplit: number;
  confidenceLevel: number;
  minimumSampleSize: number;
  maxDurationDays: number;
}

interface ABTestVariant {
  id: string;
  name: string;
  traffic_percentage: number;
  page_url: string;
  metrics: {
    visitors: number;
    conversions: number;
    conversion_rate: number;
    revenue: number;
    bounce_rate: number;
  };
  status: 'running' | 'paused' | 'winner' | 'loser';
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  goal: 'conversion_rate' | 'revenue' | 'engagement' | 'lead_generation';
  status: 'draft' | 'running' | 'completed' | 'paused';
  created_at: string;
  started_at?: string;
  ended_at?: string;
  variants: ABTestVariant[];
  settings: {
    confidence_level: number;
    minimum_sample_size: number;
    max_duration_days: number;
    significance_reached: boolean;
  };
  winner?: string;
  statistical_significance: number;
}

const ABTesting = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'templates' | 'analytics' | 'results'>('dashboard');
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPageSelectorModal, setShowPageSelectorModal] = useState(false);
  const [showVariantEditorModal, setShowVariantEditorModal] = useState(false);
  
  // Form data
  const [createFormData, setCreateFormData] = useState<CreateTestFormData>({
    name: '',
    description: '',
    goal: 'conversion_rate',
    selectedPageA: null,
    selectedPageB: null,
    trafficSplit: 50,
    confidenceLevel: 95,
    minimumSampleSize: 1000,
    maxDurationDays: 30
  });
  
  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Page selection
  const [availablePages, setAvailablePages] = useState<LandingPage[]>([]);
  const [selectingForVariant, setSelectingForVariant] = useState<'A' | 'B'>('A');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Variant editor states
  const [currentEditingVariant, setCurrentEditingVariant] = useState<'A' | 'B'>('A');
  const [variantChanges, setVariantChanges] = useState<{
    A: { [key: string]: any };
    B: { [key: string]: any };
  }>({ A: {}, B: {} });

  // Load available pages
  useEffect(() => {
    loadAvailablePages();
  }, []);

  const loadAvailablePages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pages');
      const result = await response.json();
      
      if (result.pages) {
        const transformedPages = result.pages.map((page: any) => ({
          id: page.id,
          name: page.name,
          slug: page.slug,
          template: page.template,
          status: page.status.toLowerCase(),
          created_at: page.createdAt,
          last_modified: page.updatedAt,
          views: Math.floor(Math.random() * 20000),
          conversions: Math.floor(Math.random() * 500),
          conversion_rate: Math.random() * 5,
          thumbnail: '/admin/thumbnails/default.jpg',
          content: page.content
        }));
        setAvailablePages(transformedPages);
      } else {
        setAvailablePages(mockPages);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
      setAvailablePages(mockPages);
    }
    setLoading(false);
  };

  // Mock pages for fallback
  const mockPages: LandingPage[] = [
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
      thumbnail: '/admin/thumbnails/solar-calc.jpg'
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
    },
    {
      id: '4',
      name: 'Free Solar Quote',
      slug: 'free-solar-quote',
      template: 'lead-gen',
      status: 'published',
      created_at: '2024-09-22T11:30:00Z',
      last_modified: '2024-09-26T09:15:00Z',
      views: 12750,
      conversions: 456,
      conversion_rate: 3.58,
      thumbnail: '/admin/thumbnails/quote.jpg'
    },
    {
      id: '5',
      name: 'Solar ROI Calculator',
      slug: 'solar-roi-calculator',
      template: 'calculator',
      status: 'published',
      created_at: '2024-09-19T14:20:00Z',
      last_modified: '2024-09-25T16:45:00Z',
      views: 9876,
      conversions: 298,
      conversion_rate: 3.02,
      thumbnail: '/admin/thumbnails/roi-calc.jpg'
    }
  ];

  const [tests] = useState<ABTest[]>([
    {
      id: '1',
      name: 'Solar Calculator - Hero Section',
      description: 'Testing different hero headlines and CTA buttons',
      goal: 'conversion_rate',
      status: 'running',
      created_at: '2024-09-20T10:00:00Z',
      started_at: '2024-09-21T09:00:00Z',
      variants: [
        {
          id: 'control',
          name: 'Control (Original)',
          traffic_percentage: 50,
          page_url: '/solar-calculator',
          metrics: {
            visitors: 7856,
            conversions: 327,
            conversion_rate: 4.16,
            revenue: 98100,
            bounce_rate: 23.4
          },
          status: 'running'
        },
        {
          id: 'variant-a',
          name: 'Green Theme + Urgency',
          traffic_percentage: 50,
          page_url: '/solar-calculator?variant=green',
          metrics: {
            visitors: 7923,
            conversions: 389,
            conversion_rate: 4.91,
            revenue: 116700,
            bounce_rate: 21.8
          },
          status: 'running'
        }
      ],
      settings: {
        confidence_level: 95,
        minimum_sample_size: 1000,
        max_duration_days: 30,
        significance_reached: true
      },
      statistical_significance: 97.3
    },
    {
      id: '2',
      name: 'Battery Landing - Pricing Display',
      description: 'Testing monthly vs annual pricing presentation',
      goal: 'lead_generation',
      status: 'completed',
      created_at: '2024-09-15T14:30:00Z',
      started_at: '2024-09-16T09:00:00Z',
      ended_at: '2024-09-25T18:00:00Z',
      variants: [
        {
          id: 'control',
          name: 'Monthly Pricing',
          traffic_percentage: 50,
          page_url: '/battery-storage',
          metrics: {
            visitors: 5234,
            conversions: 167,
            conversion_rate: 3.19,
            revenue: 50100,
            bounce_rate: 28.7
          },
          status: 'loser'
        },
        {
          id: 'variant-b',
          name: 'Annual Savings Focus',
          traffic_percentage: 50,
          page_url: '/battery-storage?pricing=annual',
          metrics: {
            visitors: 5189,
            conversions: 234,
            conversion_rate: 4.51,
            revenue: 70200,
            bounce_rate: 24.2
          },
          status: 'winner'
        }
      ],
      settings: {
        confidence_level: 95,
        minimum_sample_size: 800,
        max_duration_days: 14,
        significance_reached: true
      },
      winner: 'variant-b',
      statistical_significance: 99.1
    },
    {
      id: '3',
      name: 'Contact Form - Fields Optimization',
      description: 'Testing 3-field vs 5-field contact form',
      goal: 'conversion_rate',
      status: 'draft',
      created_at: '2024-09-25T16:45:00Z',
      variants: [
        {
          id: 'control',
          name: '5 Fields (Current)',
          traffic_percentage: 50,
          page_url: '/contact',
          metrics: {
            visitors: 0,
            conversions: 0,
            conversion_rate: 0,
            revenue: 0,
            bounce_rate: 0
          },
          status: 'running'
        },
        {
          id: 'variant-c',
          name: '3 Fields (Minimal)',
          traffic_percentage: 50,
          page_url: '/contact?form=minimal',
          metrics: {
            visitors: 0,
            conversions: 0,
            conversion_rate: 0,
            revenue: 0,
            bounce_rate: 0
          },
          status: 'running'
        }
      ],
      settings: {
        confidence_level: 95,
        minimum_sample_size: 500,
        max_duration_days: 21,
        significance_reached: false
      },
      statistical_significance: 0
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVariantStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'winner': return 'bg-green-100 text-green-800';
      case 'loser': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Admin</span>
        <span>›</span>
        <span>A/B Testing</span>
        <span>›</span>
        <span className="text-orange-600 font-medium">
          {activeView === 'dashboard' ? 'Active Tests' : 
           activeView === 'templates' ? 'Template Library' : 'Analytics'}
        </span>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">A/B Testing</h1>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              {activeView === 'dashboard' ? 'Active Tests' : 
               activeView === 'templates' ? 'Template Library' : 'Analytics'}
            </span>
          </div>
          <p className="text-gray-600">
            {activeView === 'dashboard' ? 'Optimize conversion rates with data-driven experiments' :
             activeView === 'templates' ? 'Pre-built templates to quickly start testing' :
             'Track performance and analyze your A/B testing results'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          🧪 Create New Test
        </motion.button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 bg-gray-50 p-2 rounded-xl w-fit border border-gray-200">
        {[
          { id: 'dashboard', name: 'Active Tests', icon: '📊' },
          { id: 'templates', name: 'Template Library', icon: '📝' },
          { id: 'analytics', name: 'Analytics', icon: '📈' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 relative ${
              activeView === tab.id
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25 border-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 border-2 border-transparent'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={`text-lg ${activeView === tab.id ? 'brightness-0 invert' : ''}`}>
              {tab.icon}
            </span>
            <span className="relative">
              {tab.name}
              {activeView === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Active Tests', value: '2', change: '+1 this week', color: 'orange' },
              { title: 'Avg Lift', value: '+18.2%', change: 'Conversion rate', color: 'green' },
              { title: 'Total Visitors', value: '26.2K', change: 'Last 30 days', color: 'blue' },
              { title: 'Revenue Impact', value: '€284K', change: '+€47K vs control', color: 'purple' }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{metric.title}</div>
                <div className="text-xs text-gray-500">{metric.change}</div>
              </motion.div>
            ))}
          </div>

          {/* Active Tests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Current Tests</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {tests.filter(t => t.status === 'running').length} running
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {tests.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTest(test);
                    setActiveView('results');
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{test.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Goal: {test.goal.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Confidence: {test.settings.confidence_level}%</span>
                        {test.settings.significance_reached && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">
                              {test.statistical_significance.toFixed(1)}% significant
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variants Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {test.variants.map((variant) => (
                      <div key={variant.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{variant.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVariantStatusColor(variant.status)}`}>
                            {variant.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-gray-500">Visitors</div>
                            <div className="font-medium">{variant.metrics.visitors.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Conv. Rate</div>
                            <div className="font-medium">{variant.metrics.conversion_rate.toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Revenue</div>
                            <div className="font-medium">€{(variant.metrics.revenue / 1000).toFixed(0)}K</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Template Library View */}
      {activeView === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">A/B Test Templates</h3>
                <p className="text-gray-600">Pre-built templates to quickly start testing</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Start from Scratch
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'cta-buttons',
                  name: 'CTA Button Optimization',
                  description: 'Test different button colors, text, and sizes',
                  category: 'Conversion',
                  estimatedLift: '+15-25%',
                  variants: ['Orange Button', 'Green Button'],
                  complexity: 'Easy',
                  duration: '1-2 weeks'
                },
                {
                  id: 'headline-test',
                  name: 'Headline A/B Test',
                  description: 'Compare different value propositions and messaging',
                  category: 'Messaging',
                  estimatedLift: '+8-18%',
                  variants: ['Benefit-focused', 'Urgency-driven'],
                  complexity: 'Easy',
                  duration: '2-3 weeks'
                },
                {
                  id: 'pricing-display',
                  name: 'Pricing Format Test',
                  description: 'Test monthly vs annual pricing presentation',
                  category: 'Pricing',
                  estimatedLift: '+20-35%',
                  variants: ['Monthly Focus', 'Annual Savings'],
                  complexity: 'Medium',
                  duration: '2-4 weeks'
                },
                {
                  id: 'form-optimization',
                  name: 'Lead Form Optimization',
                  description: 'Compare form length and field requirements',
                  category: 'Forms',
                  estimatedLift: '+10-30%',
                  variants: ['3 Fields', '5 Fields'],
                  complexity: 'Easy',
                  duration: '1-3 weeks'
                },
                {
                  id: 'social-proof',
                  name: 'Social Proof Test',
                  description: 'Test testimonials vs customer count display',
                  category: 'Trust',
                  estimatedLift: '+5-15%',
                  variants: ['Testimonials', 'Customer Count'],
                  complexity: 'Medium',
                  duration: '2-3 weeks'
                },
                {
                  id: 'hero-layout',
                  name: 'Hero Section Layout',
                  description: 'Compare different hero section arrangements',
                  category: 'Layout',
                  estimatedLift: '+12-22%',
                  variants: ['Image Left', 'Image Right'],
                  complexity: 'Medium',
                  duration: '2-4 weeks'
                }
              ].map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    // Pre-populate modal with template data
                    setCreateFormData(prev => ({
                      ...prev,
                      name: template.name,
                      description: template.description,
                      goal: template.category === 'Conversion' ? 'conversion_rate' : 'lead_generation'
                    }));
                    setShowCreateModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                      <span className="text-xl">
                        {template.category === 'Conversion' ? '🎯' :
                         template.category === 'Messaging' ? '💬' :
                         template.category === 'Pricing' ? '💰' :
                         template.category === 'Forms' ? '📝' :
                         template.category === 'Trust' ? '⭐' : '🎨'}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      {template.estimatedLift}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Variants:</span>
                      <span className="text-gray-700">{template.variants.join(' vs ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Complexity:</span>
                      <span className={`font-medium ${
                        template.complexity === 'Easy' ? 'text-green-600' :
                        template.complexity === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {template.complexity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Duration:</span>
                      <span className="text-gray-700">{template.duration}</span>
                    </div>
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                    Use This Template
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">A/B Testing Analytics</h3>
            
            {/* Analytics Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Tests Run', value: '24', change: '+8 this month', icon: '🧪' },
                { title: 'Avg Conversion Lift', value: '+18.7%', change: 'Across all tests', icon: '📈' },
                { title: 'Statistical Significance', value: '89%', change: 'Tests reaching 95%+', icon: '📊' },
                { title: 'Revenue Impact', value: '€142K', change: '+€47K vs baseline', icon: '💰' }
              ].map((metric, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{metric.icon}</span>
                    <div>
                      <div className="text-xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-sm font-medium text-gray-700">{metric.title}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{metric.change}</div>
                </div>
              ))}
            </div>

            {/* Test Categories Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Test Categories Performance</h4>
                <div className="space-y-3">
                  {[
                    { category: 'CTA Buttons', tests: 8, avgLift: '+22%', color: 'bg-orange-500' },
                    { category: 'Headlines', tests: 6, avgLift: '+15%', color: 'bg-blue-500' },
                    { category: 'Pricing', tests: 4, avgLift: '+28%', color: 'bg-green-500' },
                    { category: 'Forms', tests: 3, avgLift: '+12%', color: 'bg-purple-500' },
                    { category: 'Layout', tests: 3, avgLift: '+8%', color: 'bg-yellow-500' }
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="font-medium text-gray-900">{item.category}</span>
                        <span className="text-sm text-gray-500">({item.tests} tests)</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">{item.avgLift}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Recent Winners</h4>
                <div className="space-y-3">
                  {[
                    { test: 'Homepage CTA Color', winner: 'Green Button', lift: '+24%', date: '2 days ago' },
                    { test: 'Pricing Page Layout', winner: 'Annual Focus', lift: '+31%', date: '1 week ago' },
                    { test: 'Contact Form Fields', winner: '3 Fields', lift: '+18%', date: '2 weeks ago' },
                    { test: 'Hero Section Copy', winner: 'Benefit-focused', lift: '+12%', date: '3 weeks ago' }
                  ].map((item, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm">{item.test}</span>
                        <span className="text-sm font-semibold text-green-600">{item.lift}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Winner: {item.winner}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results View */}
      {activeView === 'results' && selectedTest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Test Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedTest.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTest.status)}`}>
                    {selectedTest.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{selectedTest.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Started: {new Date(selectedTest.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Goal: {selectedTest.goal.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>Confidence: {selectedTest.settings.confidence_level}%</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView('dashboard')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  ← Back
                </motion.button>
              </div>
            </div>

            {/* Statistical Significance */}
            {selectedTest.settings.significance_reached && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Statistical Significance Reached</span>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  This test has reached {selectedTest.statistical_significance.toFixed(1)}% statistical significance. 
                  {selectedTest.winner && ` Variant "${selectedTest.variants.find(v => v.id === selectedTest.winner)?.name}" is the winner.`}
                </p>
              </div>
            )}
          </div>

          {/* Variants Performance Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Comparison</h3>
            
            <div className="space-y-6">
              {selectedTest.variants.map((variant) => (
                <div key={variant.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{variant.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVariantStatusColor(variant.status)}`}>
                        {variant.status}
                      </span>
                      <span className="text-sm text-gray-500">{variant.traffic_percentage}% traffic</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {[
                      { label: 'Visitors', value: variant.metrics.visitors.toLocaleString(), color: 'gray' },
                      { label: 'Conversions', value: variant.metrics.conversions.toLocaleString(), color: 'blue' },
                      { label: 'Conversion Rate', value: `${variant.metrics.conversion_rate.toFixed(2)}%`, color: 'green' },
                      { label: 'Revenue', value: `€${(variant.metrics.revenue / 1000).toFixed(0)}K`, color: 'purple' },
                      { label: 'Bounce Rate', value: `${variant.metrics.bounce_rate.toFixed(1)}%`, color: 'red' }
                    ].map((metric) => (
                      <div key={metric.label} className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                        <div className="text-sm text-gray-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Test Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600">Confidence Level</div>
                <div className="font-medium text-gray-900">{selectedTest.settings.confidence_level}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Min Sample Size</div>
                <div className="font-medium text-gray-900">{selectedTest.settings.minimum_sample_size.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Max Duration</div>
                <div className="font-medium text-gray-900">{selectedTest.settings.max_duration_days} days</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Significance</div>
                <div className={`font-medium ${selectedTest.settings.significance_reached ? 'text-green-600' : 'text-gray-900'}`}>
                  {selectedTest.statistical_significance.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create A/B Test Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create A/B Test Campaign</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Step 1: Choose Template */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      Choose Template
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Start from Scratch Option */}
                      <div 
                        onClick={() => {
                          setSelectedTemplate(null);
                          setCurrentStep(2);
                        }}
                        className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all hover:border-orange-500 hover:bg-orange-50 ${
                          selectedTemplate === null ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">✨</span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">Start from Scratch</h4>
                          <p className="text-sm text-gray-600">Create a custom A/B test</p>
                        </div>
                      </div>

                      {/* Template Options */}
                      {[
                        {
                          id: 'cta-buttons',
                          name: 'CTA Button Test',
                          description: 'Test button colors & text',
                          icon: '🎯',
                          popular: true
                        },
                        {
                          id: 'headline-test',
                          name: 'Headline Test',
                          description: 'Compare different headlines',
                          icon: '💬',
                          popular: true
                        },
                        {
                          id: 'pricing-display',
                          name: 'Pricing Test',
                          description: 'Monthly vs annual pricing',
                          icon: '💰',
                          popular: false
                        },
                        {
                          id: 'form-optimization',
                          name: 'Form Test',
                          description: 'Compare form lengths',
                          icon: '📝',
                          popular: false
                        },
                        {
                          id: 'social-proof',
                          name: 'Social Proof Test',
                          description: 'Testimonials vs numbers',
                          icon: '⭐',
                          popular: false
                        }
                      ].map((template) => (
                        <div
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            setCurrentStep(2);
                            // Pre-populate form data based on template
                            setCreateFormData(prev => ({
                              ...prev,
                              name: template.name,
                              description: template.description,
                              goal: template.id.includes('cta') || template.id.includes('form') ? 'conversion_rate' : 'lead_generation'
                            }));
                          }}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-orange-500 hover:shadow-md ${
                            selectedTemplate === template.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                              <span className="text-xl">{template.icon}</span>
                            </div>
                            {template.popular && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                Popular
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Basic Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
                        <input
                          type="text"
                          value={createFormData.name}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="e.g., Homepage Hero CTA Test"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Test Goal *</label>
                        <select
                          value={createFormData.goal}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, goal: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="conversion_rate">Conversion Rate</option>
                          <option value="revenue">Revenue</option>
                          <option value="lead_generation">Lead Generation</option>
                          <option value="engagement">Engagement</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={createFormData.description}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Describe what you're testing and why..."
                      />
                    </div>
                  </div>

                  {/* Step 3: Select Landing Pages */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      Select Landing Pages for Testing
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Variant A */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Control (Variant A)</h4>
                          <span className="text-sm text-gray-500">{createFormData.trafficSplit}% traffic</span>
                        </div>
                        
                        {createFormData.selectedPageA ? (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{createFormData.selectedPageA.name}</h5>
                              <button
                                onClick={() => setCreateFormData(prev => ({ ...prev, selectedPageA: null }))}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-sm text-gray-600">/{createFormData.selectedPageA.slug}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{createFormData.selectedPageA.views.toLocaleString()} views</span>
                              <span>{createFormData.selectedPageA.conversion_rate.toFixed(1)}% conv rate</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectingForVariant('A');
                              setShowPageSelectorModal(true);
                            }}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
                          >
                            <div className="text-gray-400 text-2xl mb-2">📄</div>
                            <div className="text-sm font-medium text-gray-600">Select Landing Page</div>
                            <div className="text-xs text-gray-500 mt-1">Choose your control variant</div>
                          </button>
                        )}
                      </div>

                      {/* Variant B */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Test (Variant B)</h4>
                          <span className="text-sm text-gray-500">{100 - createFormData.trafficSplit}% traffic</span>
                        </div>
                        
                        {createFormData.selectedPageB ? (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{createFormData.selectedPageB.name}</h5>
                              <button
                                onClick={() => setCreateFormData(prev => ({ ...prev, selectedPageB: null }))}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-sm text-gray-600">/{createFormData.selectedPageB.slug}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{createFormData.selectedPageB.views.toLocaleString()} views</span>
                              <span>{createFormData.selectedPageB.conversion_rate.toFixed(1)}% conv rate</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectingForVariant('B');
                              setShowPageSelectorModal(true);
                            }}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
                          >
                            <div className="text-gray-400 text-2xl mb-2">📄</div>
                            <div className="text-sm font-medium text-gray-600">Select Landing Page</div>
                            <div className="text-xs text-gray-500 mt-1">Choose your test variant</div>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Traffic Split Slider */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Traffic Split: {createFormData.trafficSplit}% / {100 - createFormData.trafficSplit}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={createFormData.trafficSplit}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, trafficSplit: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>10% Control</span>
                        <span>50/50 Split</span>
                        <span>90% Control</span>
                      </div>
                    </div>

                    {/* Visual Editor Access */}
                    {(createFormData.selectedPageA || createFormData.selectedPageB) && (
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-medium text-blue-900 mb-2">Customize Your Variants</h5>
                        <p className="text-sm text-blue-700 mb-3">
                          Use the visual editor to customize your landing pages for A/B testing
                        </p>
                        <div className="flex gap-2">
                          {createFormData.selectedPageA && (
                            <button
                              onClick={() => {
                                setCurrentEditingVariant('A');
                                setShowVariantEditorModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit Variant A
                            </button>
                          )}
                          {createFormData.selectedPageB && (
                            <button
                              onClick={() => {
                                setCurrentEditingVariant('B');
                                setShowVariantEditorModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit Variant B
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 4: Test Configuration */}
                  <div className="pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      Test Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Level</label>
                        <select
                          value={createFormData.confidenceLevel}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, confidenceLevel: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value={90}>90%</option>
                          <option value={95}>95%</option>
                          <option value={99}>99%</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Sample Size</label>
                        <input
                          type="number"
                          value={createFormData.minimumSampleSize}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, minimumSampleSize: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="1000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Duration (days)</label>
                        <input
                          type="number"
                          value={createFormData.maxDurationDays}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, maxDurationDays: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        alert('Test saved as draft!');
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={() => {
                        if (!createFormData.selectedPageA || !createFormData.selectedPageB) {
                          alert('Please select both landing pages before creating the test.');
                          return;
                        }
                        setShowCreateModal(false);
                        alert('A/B Test created and started successfully!');
                      }}
                      disabled={!createFormData.selectedPageA || !createFormData.selectedPageB || !createFormData.name}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Create & Start Test
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page Selector Modal */}
      <AnimatePresence>
        {showPageSelectorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Select Landing Page</h2>
                    <p className="text-gray-600 mt-1">
                      Choose a landing page for Variant {selectingForVariant}
                      {selectingForVariant === 'A' ? ' (Control)' : ' (Test)'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPageSelectorModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search landing pages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-96">
                <LandingPageSelector
                  availablePages={availablePages}
                  searchTerm={searchTerm}
                  statusFilter={statusFilter}
                  onSelectPage={(page) => {
                    if (selectingForVariant === 'A') {
                      setCreateFormData(prev => ({ ...prev, selectedPageA: page }));
                    } else {
                      setCreateFormData(prev => ({ ...prev, selectedPageB: page }));
                    }
                    setShowPageSelectorModal(false);
                  }}
                  selectedPageIds={[
                    createFormData.selectedPageA?.id,
                    createFormData.selectedPageB?.id
                  ].filter(Boolean) as string[]}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visual Variant Editor Modal */}
      <AnimatePresence>
        {showVariantEditorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden"
            >
              <div className="flex h-full">
                {/* Left Panel - Page Preview */}
                <div className="flex-1 border-r border-gray-200">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Variant {currentEditingVariant} Preview
                        {currentEditingVariant === 'A' ? ' (Control)' : ' (Test)'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Desktop
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                          Mobile
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentEditingVariant === 'A' 
                        ? createFormData.selectedPageA?.name 
                        : createFormData.selectedPageB?.name}
                    </p>
                  </div>

                  {/* Page Preview Area */}
                  <div className="p-6 bg-gray-50 h-full overflow-auto">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg mx-auto max-w-4xl min-h-[600px]">
                      {/* Mock page preview */}
                      <div className="p-8">
                        <div className="text-center mb-8">
                          <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Save Money with Solar Power
                            {currentEditingVariant === 'B' && variantChanges.B.headline && (
                              <span className="block text-orange-600">{variantChanges.B.headline}</span>
                            )}
                          </h1>
                          <p className="text-xl text-gray-600 mb-6">
                            Get free solar quotes and start saving today
                          </p>
                          <button 
                            className={`px-8 py-4 rounded-lg text-white font-medium transition-colors ${
                              variantChanges[currentEditingVariant]?.buttonColor || 'bg-orange-600 hover:bg-orange-700'
                            }`}
                          >
                            {variantChanges[currentEditingVariant]?.buttonText || 'Get Free Quote'}
                          </button>
                        </div>

                        {/* Mock content sections */}
                        <div className="grid md:grid-cols-3 gap-8 mt-12">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">💰</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Save Money</h3>
                            <p className="text-gray-600">Reduce your electricity bills by up to 90%</p>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">🌍</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Go Green</h3>
                            <p className="text-gray-600">Help the environment with clean energy</p>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Reliable Power</h3>
                            <p className="text-gray-600">Never worry about power outages again</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Editor Tools */}
                <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-auto">
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Visual Editor</h3>
                      <button
                        onClick={() => setShowVariantEditorModal(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-6">
                    {/* Headline Editor */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Type className="w-4 h-4 text-orange-600" />
                        <h4 className="font-medium text-gray-900">Headline</h4>
                      </div>
                      <textarea
                        value={variantChanges[currentEditingVariant]?.headline || ''}
                        onChange={(e) => setVariantChanges(prev => ({
                          ...prev,
                          [currentEditingVariant]: {
                            ...prev[currentEditingVariant],
                            headline: e.target.value
                          }
                        }))}
                        placeholder="Enter custom headline for this variant..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Button Customization */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Layout className="w-4 h-4 text-orange-600" />
                        <h4 className="font-medium text-gray-900">Call-to-Action</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={variantChanges[currentEditingVariant]?.buttonText || ''}
                            onChange={(e) => setVariantChanges(prev => ({
                              ...prev,
                              [currentEditingVariant]: {
                                ...prev[currentEditingVariant],
                                buttonText: e.target.value
                              }
                            }))}
                            placeholder="Get Free Quote"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Button Color</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { name: 'Orange', class: 'bg-orange-600 hover:bg-orange-700' },
                              { name: 'Green', class: 'bg-green-600 hover:bg-green-700' },
                              { name: 'Blue', class: 'bg-blue-600 hover:bg-blue-700' },
                              { name: 'Red', class: 'bg-red-600 hover:bg-red-700' },
                              { name: 'Purple', class: 'bg-purple-600 hover:bg-purple-700' },
                              { name: 'Gray', class: 'bg-gray-600 hover:bg-gray-700' }
                            ].map((color) => (
                              <button
                                key={color.name}
                                onClick={() => setVariantChanges(prev => ({
                                  ...prev,
                                  [currentEditingVariant]: {
                                    ...prev[currentEditingVariant],
                                    buttonColor: color.class
                                  }
                                }))}
                                className={`w-full h-8 rounded text-white text-xs font-medium ${color.class} ${
                                  variantChanges[currentEditingVariant]?.buttonColor === color.class 
                                    ? 'ring-2 ring-offset-2 ring-orange-500' 
                                    : ''
                                }`}
                              >
                                {color.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color Scheme */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Palette className="w-4 h-4 text-orange-600" />
                        <h4 className="font-medium text-gray-900">Color Scheme</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: 'Default', colors: ['#f97316', '#1f2937', '#ffffff'] },
                          { name: 'Blue Theme', colors: ['#3b82f6', '#1e40af', '#f0f9ff'] },
                          { name: 'Green Theme', colors: ['#10b981', '#065f46', '#ecfdf5'] },
                          { name: 'Purple Theme', colors: ['#8b5cf6', '#5b21b6', '#faf5ff'] }
                        ].map((theme) => (
                          <button
                            key={theme.name}
                            onClick={() => setVariantChanges(prev => ({
                              ...prev,
                              [currentEditingVariant]: {
                                ...prev[currentEditingVariant],
                                colorScheme: theme.name
                              }
                            }))}
                            className={`w-full p-3 border rounded-lg text-left hover:border-orange-500 transition-colors ${
                              variantChanges[currentEditingVariant]?.colorScheme === theme.name 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{theme.name}</span>
                              <div className="flex gap-1">
                                {theme.colors.map((color, i) => (
                                  <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                                ))}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Options */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Image className="w-4 h-4 text-orange-600" />
                        <h4 className="font-medium text-gray-900">Hero Image</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          'Solar panels on roof',
                          'Happy family at home',
                          'Solar installation process',
                          'Energy savings chart'
                        ].map((imageOption) => (
                          <button
                            key={imageOption}
                            onClick={() => setVariantChanges(prev => ({
                              ...prev,
                              [currentEditingVariant]: {
                                ...prev[currentEditingVariant],
                                heroImage: imageOption
                              }
                            }))}
                            className={`w-full p-2 border rounded text-left text-sm hover:border-orange-500 transition-colors ${
                              variantChanges[currentEditingVariant]?.heroImage === imageOption 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-200'
                            }`}
                          >
                            {imageOption}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setVariantChanges(prev => ({
                            ...prev,
                            [currentEditingVariant]: {}
                          }));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Reset Changes
                      </button>
                      <button
                        onClick={() => {
                          const otherVariant = currentEditingVariant === 'A' ? 'B' : 'A';
                          setVariantChanges(prev => ({
                            ...prev,
                            [otherVariant]: { ...prev[currentEditingVariant] }
                          }));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy to Variant {currentEditingVariant === 'A' ? 'B' : 'A'}
                      </button>
                      <button
                        onClick={() => setShowVariantEditorModal(false)}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Landing Page Selector Component
interface LandingPageSelectorProps {
  availablePages: LandingPage[];
  searchTerm: string;
  statusFilter: string;
  onSelectPage: (page: LandingPage) => void;
  selectedPageIds: string[];
}

const LandingPageSelector: React.FC<LandingPageSelectorProps> = ({
  availablePages,
  searchTerm,
  statusFilter,
  onSelectPage,
  selectedPageIds
}) => {
  const filteredPages = availablePages.filter(page => {
    const matchesSearch = 
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (filteredPages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
        <p className="text-gray-600">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredPages.map((page) => {
        const isSelected = selectedPageIds.includes(page.id);
        const isDisabled = isSelected;
        
        return (
          <motion.div
            key={page.id}
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              isDisabled 
                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                : 'border-gray-200 hover:border-orange-500 hover:shadow-md'
            }`}
            onClick={() => !isDisabled && onSelectPage(page)}
          >
            {/* Page Thumbnail */}
            <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
              <div className="text-3xl text-gray-400">📱</div>
            </div>

            {/* Page Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 truncate">{page.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(page.status)}`}>
                  {page.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600">/{page.slug}</p>
              
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div>
                  <div className="font-medium text-gray-900">{page.views.toLocaleString()}</div>
                  <div className="text-gray-500">Views</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">{page.conversions}</div>
                  <div className="text-gray-500">Conv.</div>
                </div>
                <div>
                  <div className="font-medium text-blue-600">{page.conversion_rate.toFixed(1)}%</div>
                  <div className="text-gray-500">Rate</div>
                </div>
              </div>
              
              {isSelected && (
                <div className="text-xs text-orange-600 bg-orange-50 rounded p-2 text-center">
                  Already selected for this test
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ABTesting;