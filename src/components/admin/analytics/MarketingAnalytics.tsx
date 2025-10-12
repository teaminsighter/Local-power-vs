'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Target,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Zap,
  Clock,
  Filter,
  Download
} from 'lucide-react';
import MarketingChart from './charts/MarketingChart';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roi: number;
  conversionRate: number;
  costPerConversion: number;
}

interface MarketingData {
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSpent: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    averageCtr: number;
    averageCpc: number;
    averageConversionRate: number;
    averageRoi: number;
  };
  campaigns: Campaign[];
  dailyPerformance: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    ctr: string;
    cpc: string;
    conversionRate: string;
  }>;
  platformBreakdown: Array<{
    platform: string;
    campaigns: number;
    spent: number;
    clicks: number;
    conversions: number;
    roi: number;
  }>;
  topKeywords: Array<{
    keyword: string;
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
    conversions: number;
  }>;
  geoPerformance: Array<{
    region: string;
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
  }>;
}

const MarketingAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarketingData();
  }, [selectedTimeframe]);

  const loadMarketingData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch comprehensive marketing data from dedicated endpoint
      const response = await fetch(`/api/analytics/marketing?period=${selectedTimeframe}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      setMarketingData(data);
    } catch (error) {
      console.error('Failed to load marketing data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load marketing data');
      setMarketingData(null);
    }
    
    setIsLoading(false);
  };

  const filteredCampaigns = marketingData?.campaigns ? 
    (selectedPlatform === 'all' 
      ? marketingData.campaigns 
      : marketingData.campaigns.filter(c => c.platform.toLowerCase().includes(selectedPlatform.toLowerCase())))
    : [];

  // Use summary data from API or calculate from filtered campaigns
  const summary = marketingData?.summary || {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpent: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    averageCtr: 0,
    averageCpc: 0,
    averageConversionRate: 0,
    averageRoi: 0
  };
  
  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const costPerLead = summary.totalConversions > 0 ? summary.totalSpent / summary.totalConversions : 0;

  // Use platform breakdown from API
  const platformPerformance = marketingData?.platformBreakdown || [];

  // Use keyword data from API
  const topKeywords = marketingData?.topKeywords || [];

  // Use geographic data from API
  const geoPerformance = marketingData?.geoPerformance || [];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading marketing analytics...</p>
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
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Marketing Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadMarketingData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry
            </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Marketing Analysis</h1>
          <p className="text-gray-600 mt-1">Campaign performance and marketing ROI analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <select 
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="google">Google Ads</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Key Marketing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-green-600 flex items-center text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>12.5%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">€{summary.totalSpent.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Ad Spend</p>
          <p className="text-xs text-blue-600">€{totalBudget.toLocaleString()} budget</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-green-600 flex items-center text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>8.2%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.averageRoi.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Average ROI</p>
          <p className="text-xs text-green-600">{summary.totalConversions} conversions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-red-600 flex items-center text-sm">
              <ArrowDown className="w-4 h-4" />
              <span>2.1%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.averageCtr.toFixed(2)}%</p>
          <p className="text-sm text-gray-600">Average CTR</p>
          <p className="text-xs text-purple-600">{summary.totalClicks.toLocaleString()} clicks</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-green-600 flex items-center text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>15.8%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">€{costPerLead.toFixed(0)}</p>
          <p className="text-sm text-gray-600">Cost per Lead</p>
          <p className="text-xs text-yellow-600">€{summary.averageCpc.toFixed(2)} avg CPC</p>
        </motion.div>
      </div>

      {/* Campaign Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Active Campaigns</h3>
          <div className="text-sm text-gray-600">
            {filteredCampaigns.length} campaigns
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-600">Campaign</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Platform</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Budget</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Spent</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Impressions</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">CTR</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Conversions</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">ROI</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div>
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-600">CPC: €{campaign.cpc.toFixed(2)} • ROI: {campaign.roi.toFixed(1)}%</div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-sm text-gray-900">{campaign.platform}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </span>
                  </td>
                  <td className="py-4 text-center text-sm text-gray-900">€{campaign.budget.toLocaleString()}</td>
                  <td className="py-4 text-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">€{campaign.spent.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{((campaign.spent / campaign.budget) * 100).toFixed(0)}% used</div>
                    </div>
                  </td>
                  <td className="py-4 text-center text-sm text-gray-900">{campaign.impressions.toLocaleString()}</td>
                  <td className="py-4 text-center">
                    <span className="text-sm font-medium text-gray-900">{campaign.ctr.toFixed(2)}%</span>
                  </td>
                  <td className="py-4 text-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.conversions}</div>
                      <div className="text-xs text-gray-500">{campaign.clicks} clicks</div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`text-sm font-medium ${campaign.roi >= 200 ? 'text-green-600' : campaign.roi >= 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {campaign.roi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : campaign.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Performance Chart */}
      {marketingData?.dailyPerformance && (
        <MarketingChart dailyData={marketingData.dailyPerformance} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Performance</h3>
          <div className="space-y-4">
            {platformPerformance.map((platform) => {
              const cpl = platform.conversions > 0 ? platform.spent / platform.conversions : 0;
              return (
                <div key={platform.platform} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{platform.platform}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {platform.campaigns} campaigns
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">ROI: {platform.roi.toFixed(1)}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Spent</span>
                      <p className="font-medium">€{platform.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Leads</span>
                      <p className="font-medium">{platform.conversions}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CPL</span>
                      <p className="font-medium">€{cpl.toFixed(0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CTR</span>
                      <p className="font-medium">{((platform.clicks / (platform.clicks * 50)) * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Search Terms</h3>
          <div className="space-y-3">
            {topKeywords.map((keyword, index) => (
              <div key={keyword.keyword} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{keyword.keyword}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{keyword.conversions} leads</div>
                  <div className="text-xs text-gray-500">{keyword.impressions.toLocaleString()} impressions</div>
                  <div className="text-xs text-green-600">€{keyword.cost.toFixed(0)} spent</div>
                </div>
              </div>
            ))}
            {topKeywords.length === 0 && (
              <p className="text-gray-500 text-sm italic text-center py-4">No keyword data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Geographic Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6">Geographic Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {geoPerformance.length > 0 ? geoPerformance.map((geo, index) => {
            const totalConversions = summary.totalConversions || 1;
            const percentage = totalConversions > 0 ? (geo.conversions / totalConversions) * 100 : 0;
            return (
              <div key={`${geo.region}-${index}`} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">{geo.region}</span>
                  <span className="text-xs text-gray-600">{percentage.toFixed(1)}%</span>
                </div>
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: '#146443'
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {geo.conversions} leads • €{geo.cost.toFixed(0)} spent
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {geo.clicks} clicks • {((geo.clicks / geo.impressions) * 100).toFixed(1)}% CTR
                </div>
              </div>
            );
          }) : (
            <div className="col-span-4 text-center py-8 text-gray-500">
              <p>No geographic data available yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MarketingAnalytics;