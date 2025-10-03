'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Star,
  Brain,
  Zap,
  BarChart3,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Filter,
  Sparkles,
  RefreshCw,
  Settings
} from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'optimization' | 'marketing' | 'conversion' | 'cost-reduction' | 'growth';
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  estimatedValue: number;
  timeframe: string;
  status: 'new' | 'in-progress' | 'completed' | 'dismissed';
  generatedAt: string;
  implementedAt?: string;
  insights: string[];
  metrics: string[];
  aiReasoning: string;
}

interface RecommendationMetrics {
  totalRecommendations: number;
  implemented: number;
  inProgress: number;
  estimatedValue: number;
  actualValue: number;
  avgConfidence: number;
}

const Recommendations = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = () => {
    setIsLoading(true);

    const mockRecommendations: Recommendation[] = [
      {
        id: 'rec_1',
        title: 'Optimize Google Ads Budget Allocation',
        description: 'Reallocate budget from underperforming campaigns to high-converting solar calculator traffic campaigns',
        category: 'marketing',
        priority: 'high',
        impact: 'high',
        effort: 'low',
        confidence: 92,
        estimatedValue: 15600,
        timeframe: '2-3 weeks',
        status: 'new',
        generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        insights: [
          'Solar calculator campaigns show 45% higher conversion rate',
          'Current budget allocation is not optimized for performance',
          'Competitor analysis shows opportunity in solar financing keywords'
        ],
        metrics: ['CTR', 'Conversion Rate', 'Cost per Lead', 'ROAS'],
        aiReasoning: 'Based on 30-day performance data analysis, reallocating 30% of budget from generic solar keywords to calculator-specific campaigns could increase conversions by 40% while reducing cost per lead by 25%.'
      },
      {
        id: 'rec_2',
        title: 'Improve Lead Form Conversion Rate',
        description: 'Simplify the multi-step form by reducing required fields and adding progress indicators',
        category: 'conversion',
        priority: 'high',
        impact: 'medium',
        effort: 'medium',
        confidence: 87,
        estimatedValue: 12300,
        timeframe: '1-2 weeks',
        status: 'in-progress',
        generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        implementedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        insights: [
          '35% of users abandon the form at step 3',
          'Mobile users have 20% higher abandonment rate',
          'Similar companies see 25% improvement with simplified forms'
        ],
        metrics: ['Form Completion Rate', 'Abandonment Rate', 'Mobile Conversion'],
        aiReasoning: 'User behavior analysis shows significant drop-off at form field requirements. A/B testing data from similar solar companies indicates that reducing form fields from 12 to 6 can improve completion rates by 25-30%.'
      },
      {
        id: 'rec_3',
        title: 'Implement Dynamic Pricing Strategy',
        description: 'Use AI-powered dynamic pricing based on location, season, and demand patterns',
        category: 'optimization',
        priority: 'medium',
        impact: 'high',
        effort: 'high',
        confidence: 78,
        estimatedValue: 28500,
        timeframe: '6-8 weeks',
        status: 'new',
        generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        insights: [
          'Pricing varies significantly by geographic region',
          'Seasonal demand patterns show 30% variation',
          'Competitor pricing analysis reveals opportunities'
        ],
        metrics: ['Average Deal Size', 'Win Rate', 'Profit Margin', 'Competitive Position'],
        aiReasoning: 'Market analysis indicates that implementing location and time-based pricing could capture additional value while maintaining competitiveness. Historical data shows 15-20% pricing optimization potential.'
      },
      {
        id: 'rec_4',
        title: 'Enhance Follow-up Automation',
        description: 'Implement AI-powered lead scoring and automated nurturing sequences for better conversion',
        category: 'marketing',
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
        confidence: 84,
        estimatedValue: 9800,
        timeframe: '3-4 weeks',
        status: 'completed',
        generatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        implementedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        insights: [
          'Lead response time affects conversion by up to 400%',
          'Personalized follow-up increases engagement by 60%',
          'Automated scoring improves sales efficiency'
        ],
        metrics: ['Lead Response Time', 'Conversion Rate', 'Sales Cycle Length'],
        aiReasoning: 'Analysis of lead conversion patterns shows significant opportunity to improve follow-up timing and personalization. Automated scoring can help prioritize high-value prospects.'
      },
      {
        id: 'rec_5',
        title: 'Optimize Mobile User Experience',
        description: 'Improve mobile calculator performance and user interface for better engagement',
        category: 'conversion',
        priority: 'low',
        impact: 'medium',
        effort: 'low',
        confidence: 76,
        estimatedValue: 5400,
        timeframe: '1 week',
        status: 'dismissed',
        generatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        insights: [
          'Mobile traffic accounts for 65% of total visits',
          'Mobile conversion rate is 40% lower than desktop',
          'Page load time on mobile averages 4.2 seconds'
        ],
        metrics: ['Mobile Conversion Rate', 'Page Load Time', 'Bounce Rate'],
        aiReasoning: 'Mobile analytics indicate significant performance gaps. Optimizing load times and UI elements could improve mobile conversion rates to match desktop performance.'
      }
    ];

    const mockMetrics: RecommendationMetrics = {
      totalRecommendations: mockRecommendations.length,
      implemented: mockRecommendations.filter(r => r.status === 'completed').length,
      inProgress: mockRecommendations.filter(r => r.status === 'in-progress').length,
      estimatedValue: mockRecommendations.reduce((sum, r) => sum + r.estimatedValue, 0),
      actualValue: 9800, // Only from completed recommendations
      avgConfidence: mockRecommendations.reduce((sum, r) => sum + r.confidence, 0) / mockRecommendations.length
    };

    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 1000);
  };

  const generateNewRecommendations = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      loadRecommendations();
    }, 3000);
  };

  const updateRecommendationStatus = (id: string, status: Recommendation['status']) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, status } : rec
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'dismissed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'optimization': return 'text-purple-600 bg-purple-100';
      case 'marketing': return 'text-blue-600 bg-blue-100';
      case 'conversion': return 'text-green-600 bg-green-100';
      case 'cost-reduction': return 'text-orange-600 bg-orange-100';
      case 'growth': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'optimization', name: 'Optimization' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'conversion', name: 'Conversion' },
    { id: 'cost-reduction', name: 'Cost Reduction' },
    { id: 'growth', name: 'Growth' }
  ];

  const priorities = [
    { id: 'all', name: 'All Priorities' },
    { id: 'high', name: 'High Priority' },
    { id: 'medium', name: 'Medium Priority' },
    { id: 'low', name: 'Low Priority' }
  ];

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || rec.priority === selectedPriority;
    return matchesCategory && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading AI recommendations...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
          <p className="text-gray-600 mt-1">Data-driven insights to optimize your solar business</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateNewRecommendations}
          disabled={isGenerating}
          className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: '#146443' }}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate New
            </>
          )}
        </motion.button>
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalRecommendations}</p>
                <p className="text-sm text-gray-600">Total Recommendations</p>
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
                <p className="text-2xl font-bold text-gray-900">{metrics.implemented}</p>
                <p className="text-sm text-gray-600">Implemented</p>
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">€{metrics.estimatedValue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Estimated Value</p>
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
                <Brain className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgConfidence.toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Avg Confidence</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
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
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredRecommendations.length} of {recommendations.length} recommendations
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority} priority
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                      {recommendation.impact} impact
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
                      {recommendation.category}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{recommendation.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Estimated Value:</span>
                    <p className="font-semibold text-gray-900">€{recommendation.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Timeframe:</span>
                    <p className="font-semibold text-gray-900">{recommendation.timeframe}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <p className="font-semibold text-gray-900">{recommendation.confidence}%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Effort:</span>
                    <p className="font-semibold text-gray-900 capitalize">{recommendation.effort}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">AI Reasoning:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{recommendation.aiReasoning}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights:</h4>
                  <ul className="space-y-1">
                    {recommendation.insights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {recommendation.metrics.map((metric, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(recommendation.status)}`}>
                  {recommendation.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Generated {new Date(recommendation.generatedAt).toLocaleDateString()}
                {recommendation.implementedAt && (
                  <span> • Implemented {new Date(recommendation.implementedAt).toLocaleDateString()}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {recommendation.status === 'new' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateRecommendationStatus(recommendation.id, 'in-progress')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      Start Implementation
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateRecommendationStatus(recommendation.id, 'dismissed')}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Dismiss
                    </motion.button>
                  </>
                )}
                
                {recommendation.status === 'in-progress' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateRecommendationStatus(recommendation.id, 'completed')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    Mark Complete
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

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Found</h3>
          <p className="text-gray-600">Try adjusting your filters or generate new recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;