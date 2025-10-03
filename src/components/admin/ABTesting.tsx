'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ABTest {
  id: string;
  name: string;
  description?: string;
  url: string;
  urlMatchType: 'EXACT' | 'PATTERN' | 'REGEX';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  assignmentType: 'FIFTY_FIFTY' | 'ALTERNATING' | 'CUSTOM_SPLIT';
  customSplitA?: number;
  customSplitB?: number;
  visitsA: number;
  visitsB: number;
  conversionsA: number;
  conversionsB: number;
  conversionRateA: number;
  conversionRateB: number;
  confidenceLevel: number;
  minimumSampleSize: number;
  statisticalSignificance: boolean;
  winnerVariant?: 'A' | 'B';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

interface ABTestTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  thumbnail?: string;
  content: any;
  variables?: any;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export default function ABTesting() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [templates, setTemplates] = useState<ABTestTemplate[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<string | null>(null);
  const [isStopDialogOpen, setIsStopDialogOpen] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tests');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    url: '',
    urlMatchType: 'EXACT' as const,
    assignmentType: 'FIFTY_FIFTY' as const,
    customSplitA: 50,
    customSplitB: 50,
    templateAId: '',
    templateBId: '',
    minimumSampleSize: 100,
    confidenceLevel: 95,
    variantA: {
      name: 'Original (Control)',
      headline: '',
      ctaText: '',
      ctaColor: '#3b82f6',
      description: '',
      customCss: '',
      customHtml: ''
    },
    variantB: {
      name: 'Variant B',
      headline: '',
      ctaText: '',
      ctaColor: '#dc2626',
      description: '',
      customCss: '',
      customHtml: ''
    }
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'landing',
    content: '',
    variables: '{}'
  });

  useEffect(() => {
    loadTests();
    loadTemplates();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'Homepage CTA Button Test',
          description: 'Testing different CTA button colors and text',
          url: '/',
          urlMatchType: 'EXACT',
          status: 'ACTIVE',
          assignmentType: 'FIFTY_FIFTY',
          visitsA: 1250,
          visitsB: 1180,
          conversionsA: 87,
          conversionsB: 112,
          conversionRateA: 6.96,
          conversionRateB: 9.49,
          confidenceLevel: 95,
          minimumSampleSize: 1000,
          statisticalSignificance: true,
          startDate: '2024-01-15T00:00:00Z',
          createdAt: '2024-01-14T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
          createdBy: 'admin'
        },
        {
          id: '2',
          name: 'Lead Form Optimization',
          description: 'Testing form length and field placement',
          url: '/contact',
          urlMatchType: 'EXACT',
          status: 'DRAFT',
          assignmentType: 'CUSTOM_SPLIT',
          customSplitA: 60,
          customSplitB: 40,
          visitsA: 0,
          visitsB: 0,
          conversionsA: 0,
          conversionsB: 0,
          conversionRateA: 0,
          conversionRateB: 0,
          confidenceLevel: 95,
          minimumSampleSize: 500,
          statisticalSignificance: false,
          createdAt: '2024-01-16T00:00:00Z',
          updatedAt: '2024-01-16T00:00:00Z',
          createdBy: 'admin'
        }
      ];
      setTests(mockTests);
    } catch (error) {
      console.error('Failed to load tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockTemplates: ABTestTemplate[] = [
        {
          id: '1',
          name: 'Modern Landing Page',
          description: 'Clean, modern design with bold CTA',
          category: 'landing',
          thumbnail: '/templates/modern-landing.jpg',
          content: { html: '<div>Modern template</div>', css: '', js: '' },
          isActive: true,
          usageCount: 5,
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z',
          createdBy: 'admin'
        },
        {
          id: '2',
          name: 'Minimalist Form',
          description: 'Simple form with minimal fields',
          category: 'form',
          thumbnail: '/templates/minimalist-form.jpg',
          content: { html: '<form>Minimalist template</form>', css: '', js: '' },
          isActive: true,
          usageCount: 3,
          createdAt: '2024-01-12T00:00:00Z',
          updatedAt: '2024-01-12T00:00:00Z',
          createdBy: 'admin'
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const createTest = async () => {
    try {
      // API call would go here
      console.log('Creating test:', newTest);
      setIsCreateDialogOpen(false);
      setNewTest({
        name: '',
        description: '',
        url: '',
        urlMatchType: 'EXACT',
        assignmentType: 'FIFTY_FIFTY',
        customSplitA: 50,
        customSplitB: 50,
        templateAId: '',
        templateBId: '',
        minimumSampleSize: 100,
        confidenceLevel: 95,
        variantA: {
          name: 'Original (Control)',
          headline: '',
          ctaText: '',
          ctaColor: '#3b82f6',
          description: '',
          customCss: '',
          customHtml: ''
        },
        variantB: {
          name: 'Variant B',
          headline: '',
          ctaText: '',
          ctaColor: '#dc2626',
          description: '',
          customCss: '',
          customHtml: ''
        }
      });
      loadTests();
    } catch (error) {
      console.error('Failed to create test:', error);
    }
  };

  const createTemplate = async () => {
    try {
      // API call would go here
      console.log('Creating template:', newTemplate);
      setIsTemplateDialogOpen(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'landing',
        content: '',
        variables: '{}'
      });
      loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const startTest = async (testId: string) => {
    try {
      // Update test status locally (in production, this would be an API call)
      setTests(prevTests => 
        prevTests.map(test => 
          test.id === testId 
            ? { ...test, status: 'ACTIVE' as const, startDate: new Date().toISOString() }
            : test
        )
      );
      console.log('Started test:', testId);
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const pauseTest = async (testId: string) => {
    try {
      // Update test status locally (in production, this would be an API call)
      setTests(prevTests => 
        prevTests.map(test => 
          test.id === testId 
            ? { ...test, status: 'PAUSED' as const }
            : test
        )
      );
      console.log('Paused test:', testId);
    } catch (error) {
      console.error('Failed to pause test:', error);
    }
  };

  const stopTest = async (testId: string, winnerVariant?: 'A' | 'B') => {
    try {
      // Update test status locally (in production, this would be an API call)
      setTests(prevTests => 
        prevTests.map(test => 
          test.id === testId 
            ? { 
                ...test, 
                status: 'COMPLETED' as const, 
                endDate: new Date().toISOString(),
                winnerVariant 
              }
            : test
        )
      );
      setIsStopDialogOpen(null);
      console.log('Stopped test:', testId, 'Winner:', winnerVariant);
    } catch (error) {
      console.error('Failed to stop test:', error);
    }
  };

  const deleteTest = async (testId: string) => {
    try {
      // Remove test locally (in production, this would be an API call)
      setTests(prevTests => prevTests.filter(test => test.id !== testId));
      setIsSettingsOpen(null);
      console.log('Deleted test:', testId);
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  const duplicateTest = async (testId: string) => {
    try {
      const testToDuplicate = tests.find(test => test.id === testId);
      if (testToDuplicate) {
        const newTest = {
          ...testToDuplicate,
          id: Date.now().toString(),
          name: `${testToDuplicate.name} (Copy)`,
          status: 'DRAFT' as const,
          visitsA: 0,
          visitsB: 0,
          conversionsA: 0,
          conversionsB: 0,
          conversionRateA: 0,
          conversionRateB: 0,
          statisticalSignificance: false,
          startDate: undefined,
          endDate: undefined,
          winnerVariant: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setTests(prevTests => [...prevTests, newTest]);
        setIsSettingsOpen(null);
        console.log('Duplicated test:', testId);
      }
    } catch (error) {
      console.error('Failed to duplicate test:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      ARCHIVED: 'bg-gray-100 text-gray-600'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.DRAFT}`}>
        {status}
      </span>
    );
  };

  const getAssignmentTypeLabel = (type: string) => {
    const labels = {
      FIFTY_FIFTY: '50/50 Split',
      ALTERNATING: 'Alternating',
      CUSTOM_SPLIT: 'Custom Split'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading A/B tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/B Testing</h1>
          <p className="text-gray-600">Optimize your pages with data-driven testing</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTemplateDialogOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + New Template
          </button>
          
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + New A/B Test
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'tests', label: 'Active Tests' },
            { id: 'templates', label: 'Template Library' },
            { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tests Tab */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="grid gap-4">
            {filteredTests.map((test) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    <p className="text-sm text-gray-500 mt-1">URL: {test.url}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(test.status)}
                    <div className="flex gap-1">
                      {test.status === 'DRAFT' && (
                        <button
                          onClick={() => startTest(test.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="Start Test"
                        >
                          ▶
                        </button>
                      )}
                      {test.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => pauseTest(test.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                            title="Pause Test"
                          >
                            ⏸
                          </button>
                          <button
                            onClick={() => setIsStopDialogOpen(test.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            title="Stop Test"
                          >
                            ⏹
                          </button>
                        </>
                      )}
                      {test.status === 'PAUSED' && (
                        <button
                          onClick={() => startTest(test.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="Resume Test"
                        >
                          ▶
                        </button>
                      )}
                      <div className="relative">
                        <button 
                          onClick={() => setIsSettingsOpen(isSettingsOpen === test.id ? null : test.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-md" 
                          title="Settings"
                        >
                          ⚙
                        </button>
                        {isSettingsOpen === test.id && (
                          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-40">
                            <button
                              onClick={() => duplicateTest(test.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              📋 Duplicate Test
                            </button>
                            <button
                              onClick={() => {/* Edit functionality */}}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              ✏️ Edit Test
                            </button>
                            <button
                              onClick={() => {/* Export functionality */}}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              📊 Export Results
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={() => deleteTest(test.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              🗑️ Delete Test
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Assignment Type:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getAssignmentTypeLabel(test.assignmentType)}
                      </span>
                    </div>
                    {test.assignmentType === 'CUSTOM_SPLIT' && (
                      <div className="text-sm text-gray-600">
                        Split: {test.customSplitA}%/{test.customSplitB}%
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Variant A</div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Visits:</span>
                        <span>{test.visitsA.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversions:</span>
                        <span>{test.conversionsA}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-medium">{test.conversionRateA.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Variant B</div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Visits:</span>
                        <span>{test.visitsB.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversions:</span>
                        <span>{test.conversionsB}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-medium">{test.conversionRateB.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {test.status === 'ACTIVE' && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress to minimum sample size:</span>
                      <span>{Math.min(test.visitsA + test.visitsB, test.minimumSampleSize)}/{test.minimumSampleSize}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(Math.min(test.visitsA + test.visitsB, test.minimumSampleSize) / test.minimumSampleSize) * 100}%`
                        }}
                      ></div>
                    </div>
                    {test.statisticalSignificance && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-800">
                              Statistical significance achieved! 
                              {test.conversionRateB > test.conversionRateA ? ' Variant B is winning.' : ' Variant A is winning.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">{template.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage:</span>
                  <span>{template.usageCount} times</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Edit
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{tests.filter(t => t.status === 'ACTIVE').length}</p>
                </div>
                <div className="text-blue-600">📊</div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Running experiments</p>
            </div>
            
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tests.reduce((sum, test) => sum + test.visitsA + test.visitsB, 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-green-600">👥</div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all tests</p>
            </div>
            
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tests.reduce((sum, test) => sum + test.conversionsA + test.conversionsB, 0)}
                  </p>
                </div>
                <div className="text-purple-600">🎯</div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Successful outcomes</p>
            </div>
            
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(tests.reduce((sum, test) => sum + test.conversionRateA + test.conversionRateB, 0) / (tests.length * 2 || 1)).toFixed(2)}%
                  </p>
                </div>
                <div className="text-orange-600">📈</div>
              </div>
              <p className="text-xs text-gray-500 mt-1">All variants combined</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Performance Overview</h3>
            <div className="space-y-4">
              {tests.filter(t => t.status === 'ACTIVE' || t.status === 'COMPLETED').map((test) => (
                <div key={test.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{test.name}</h4>
                    {getStatusBadge(test.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Variant A: {test.conversionRateA.toFixed(2)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${test.conversionRateA}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Variant B: {test.conversionRateB.toFixed(2)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${test.conversionRateB}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {test.statisticalSignificance && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      ✓ Statistically significant results
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Test Modal */}
      {isCreateDialogOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsCreateDialogOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Create New A/B Test</h3>
              <p className="text-gray-600 mt-1">Set up your test configuration and define both variants side by side</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Test Configuration */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Test Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                    <input
                      type="text"
                      value={newTest.name}
                      onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                      placeholder="e.g., Homepage CTA Test"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL to Test</label>
                    <input
                      type="text"
                      value={newTest.url}
                      onChange={(e) => setNewTest({...newTest, url: e.target.value})}
                      placeholder="e.g., / or /contact"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newTest.description}
                    onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                    placeholder="Describe what you're testing..."
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Match Type</label>
                    <select 
                      value={newTest.urlMatchType} 
                      onChange={(e) => setNewTest({...newTest, urlMatchType: e.target.value as any})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="EXACT">Exact Match</option>
                      <option value="PATTERN">Pattern Match</option>
                      <option value="REGEX">Regular Expression</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Type</label>
                    <select 
                      value={newTest.assignmentType} 
                      onChange={(e) => setNewTest({...newTest, assignmentType: e.target.value as any})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="FIFTY_FIFTY">50/50 Split</option>
                      <option value="ALTERNATING">Alternating</option>
                      <option value="CUSTOM_SPLIT">Custom Split</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Sample Size</label>
                    <input
                      type="number"
                      min="50"
                      value={newTest.minimumSampleSize}
                      onChange={(e) => setNewTest({...newTest, minimumSampleSize: parseInt(e.target.value) || 100})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Level (%)</label>
                    <input
                      type="number"
                      min="80"
                      max="99"
                      value={newTest.confidenceLevel}
                      onChange={(e) => setNewTest({...newTest, confidenceLevel: parseInt(e.target.value) || 95})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {newTest.assignmentType === 'CUSTOM_SPLIT' && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Variant A Traffic (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newTest.customSplitA}
                        onChange={(e) => setNewTest({...newTest, customSplitA: parseInt(e.target.value) || 0})}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Variant B Traffic (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newTest.customSplitB}
                        onChange={(e) => setNewTest({...newTest, customSplitB: parseInt(e.target.value) || 0})}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Side by Side Variants */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Variant A */}
                <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-blue-900">Variant A (Control)</h4>
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">Original</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
                      <input
                        type="text"
                        value={newTest.variantA.name}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantA: {...newTest.variantA, name: e.target.value}
                        })}
                        placeholder="e.g., Original Homepage"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Headline Text</label>
                      <input
                        type="text"
                        value={newTest.variantA.headline}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantA: {...newTest.variantA, headline: e.target.value}
                        })}
                        placeholder="e.g., Get Your Free Solar Quote Today"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={newTest.variantA.ctaText}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantA: {...newTest.variantA, ctaText: e.target.value}
                        })}
                        placeholder="e.g., Calculate My Savings"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newTest.variantA.ctaColor}
                          onChange={(e) => setNewTest({
                            ...newTest, 
                            variantA: {...newTest.variantA, ctaColor: e.target.value}
                          })}
                          className="w-12 h-10 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={newTest.variantA.ctaColor}
                          onChange={(e) => setNewTest({
                            ...newTest, 
                            variantA: {...newTest.variantA, ctaColor: e.target.value}
                          })}
                          placeholder="#3b82f6"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newTest.variantA.description}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantA: {...newTest.variantA, description: e.target.value}
                        })}
                        placeholder="Describe this variant..."
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
                      <textarea
                        value={newTest.variantA.customCss}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantA: {...newTest.variantA, customCss: e.target.value}
                        })}
                        placeholder=".hero-section { background: #f3f4f6; }"
                        rows={4}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Variant B */}
                <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-green-900">Variant B (Test)</h4>
                    <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">Experiment</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
                      <input
                        type="text"
                        value={newTest.variantB.name}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantB: {...newTest.variantB, name: e.target.value}
                        })}
                        placeholder="e.g., Urgency-Focused Version"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Headline Text</label>
                      <input
                        type="text"
                        value={newTest.variantB.headline}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantB: {...newTest.variantB, headline: e.target.value}
                        })}
                        placeholder="e.g., Lock in 30% Tax Credits - Ending Soon!"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={newTest.variantB.ctaText}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantB: {...newTest.variantB, ctaText: e.target.value}
                        })}
                        placeholder="e.g., Claim My Tax Credit"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newTest.variantB.ctaColor}
                          onChange={(e) => setNewTest({
                            ...newTest, 
                            variantB: {...newTest.variantB, ctaColor: e.target.value}
                          })}
                          className="w-12 h-10 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={newTest.variantB.ctaColor}
                          onChange={(e) => setNewTest({
                            ...newTest, 
                            variantB: {...newTest.variantB, ctaColor: e.target.value}
                          })}
                          placeholder="#dc2626"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newTest.variantB.description}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantB: {...newTest.variantB, description: e.target.value}
                        })}
                        placeholder="Describe this variant..."
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS</label>
                      <textarea
                        value={newTest.variantB.customCss}
                        onChange={(e) => setNewTest({
                          ...newTest, 
                          variantB: {...newTest.variantB, customCss: e.target.value}
                        })}
                        placeholder=".hero-section { background: #fee2e2; animation: pulse 2s infinite; }"
                        rows={4}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <div className="text-sm text-gray-600">
                <p>• Variants will be applied automatically to visitors</p>
                <p>• You can modify content after creating the test</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={createTest}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create A/B Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {isTemplateDialogOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsTemplateDialogOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Create New Template</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="e.g., Modern Landing Page"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Describe this template..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={newTemplate.category} 
                  onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="landing">Landing Page</option>
                  <option value="form">Form</option>
                  <option value="popup">Popup</option>
                  <option value="button">Button</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Content (HTML)</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  placeholder="<div>Your HTML content here...</div>"
                  rows={8}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsTemplateDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createTemplate}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Test Confirmation Dialog */}
      {isStopDialogOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsStopDialogOpen(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Stop A/B Test</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to stop this test? You can optionally declare a winner.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => stopTest(isStopDialogOpen, 'A')}
                  className="w-full px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                >
                  🏆 Stop and declare Variant A as winner
                </button>
                <button
                  onClick={() => stopTest(isStopDialogOpen, 'B')}
                  className="w-full px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                >
                  🏆 Stop and declare Variant B as winner
                </button>
                <button
                  onClick={() => stopTest(isStopDialogOpen)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  ⏹ Stop without declaring winner
                </button>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsStopDialogOpen(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(isSettingsOpen || isStopDialogOpen) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setIsSettingsOpen(null);
            setIsStopDialogOpen(null);
          }}
        />
      )}
    </div>
  );
}