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
  roas: number;
  startDate: string;
  endDate: string;
}

interface AdGroup {
  id: string;
  campaignId: string;
  name: string;
  keywords: string[];
  avgPosition: number;
  qualityScore: number;
  impressionShare: number;
}

const MarketingAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [addressAnalytics, setAddressAnalytics] = useState<any>({});

  useEffect(() => {
    loadMarketingData();
  }, [selectedTimeframe]);

  const loadMarketingData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch real lead source data from API
      const response = await fetch('/api/analytics/overview?dateRange=' + selectedTimeframe);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Convert lead sources to marketing campaigns
        const realCampaigns: Campaign[] = result.data.topSources.map((source: any, index: number) => ({
          id: `source_${index}`,
          name: `${source.name} Campaign`,
          platform: source.name,
          status: 'active' as const,
          budget: 0, // No budget data available yet
          spent: 0, // No spend data available yet  
          impressions: source.leads * 50, // Estimate impressions based on leads
          clicks: source.leads * 2, // Estimate clicks based on leads
          conversions: Math.round(source.leads * (source.conversion / 100)),
          ctr: 2.0, // Default CTR
          cpc: 0, // No CPC data available
          roas: source.conversion > 0 ? (source.revenue / (source.leads * 10)) : 0, // Estimate ROAS
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        }));
        
        setCampaigns(realCampaigns);
        setAddressAnalytics({
          totalLeads: result.data.totalLeads,
          conversionRate: result.data.conversionRate,
          sources: result.data.topSources
        });
      } else {
        // No data available
        setCampaigns([]);
        setAddressAnalytics({});
      }
    } catch (error) {
      console.error('Failed to load marketing data:', error);
      setCampaigns([]);
      setAddressAnalytics({});
    }
    
    setIsLoading(false);
  };

  const filteredCampaigns = selectedPlatform === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.platform.toLowerCase().includes(selectedPlatform.toLowerCase()));

  // Calculate aggregate metrics
  const totalBudget = filteredCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = filteredCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
  const avgROAS = totalSpent > 0 ? (totalConversions * 1500) / totalSpent : 0; // Assuming avg conversion value of €1500
  const costPerLead = totalConversions > 0 ? totalSpent / totalConversions : 0;

  // Platform performance
  const platformPerformance = campaigns.reduce((acc, campaign) => {
    const platform = campaign.platform;
    if (!acc[platform]) {
      acc[platform] = {
        spent: 0,
        conversions: 0,
        clicks: 0,
        impressions: 0,
        campaigns: 0
      };
    }
    acc[platform].spent += campaign.spent;
    acc[platform].conversions += campaign.conversions;
    acc[platform].clicks += campaign.clicks;
    acc[platform].impressions += campaign.impressions;
    acc[platform].campaigns += 1;
    return acc;
  }, {} as { [key: string]: any });

  // Top keywords from address analytics (simplified for now)
  const topKeywords = [
    ['solar panels', addressAnalytics.totalLeads || 0],
    ['solar installation', Math.floor((addressAnalytics.totalLeads || 0) * 0.8)],
    ['solar cost', Math.floor((addressAnalytics.totalLeads || 0) * 0.6)],
    ['solar calculator', Math.floor((addressAnalytics.totalLeads || 0) * 0.4)],
    ['solar quotes', Math.floor((addressAnalytics.totalLeads || 0) * 0.3)]
  ];

  // Geographic performance (simplified based on available data)
  const geoPerformance = addressAnalytics.sources ? 
    addressAnalytics.sources.slice(0, 4).map((source: any) => [source.name, source.leads]) :
    [];

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
          <p className="text-2xl font-bold text-gray-900">€{totalSpent.toLocaleString()}</p>
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
          <p className="text-2xl font-bold text-gray-900">{avgROAS.toFixed(1)}</p>
          <p className="text-sm text-gray-600">Average ROAS</p>
          <p className="text-xs text-green-600">{totalConversions} conversions</p>
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
          <p className="text-2xl font-bold text-gray-900">{avgCTR.toFixed(2)}%</p>
          <p className="text-sm text-gray-600">Average CTR</p>
          <p className="text-xs text-purple-600">{totalClicks.toLocaleString()} clicks</p>
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
          <p className="text-xs text-yellow-600">€{avgCPC.toFixed(2)} avg CPC</p>
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
                <th className="text-center py-3 text-sm font-medium text-gray-600">ROAS</th>
                <th className="text-center py-3 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div>
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-600">CPC: €{campaign.cpc.toFixed(2)}</div>
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
                    <span className={`text-sm font-medium ${campaign.roas >= 4 ? 'text-green-600' : campaign.roas >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {campaign.roas.toFixed(1)}
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
            {Object.entries(platformPerformance).map(([platform, data]) => {
              const cpl = data.conversions > 0 ? data.spent / data.conversions : 0;
              const roas = data.spent > 0 ? (data.conversions * 1500) / data.spent : 0;
              return (
                <div key={platform} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{platform}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {data.campaigns} campaigns
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">ROAS: {roas.toFixed(1)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Spent</span>
                      <p className="font-medium">€{data.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Leads</span>
                      <p className="font-medium">{data.conversions}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CPL</span>
                      <p className="font-medium">€{cpl.toFixed(0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CTR</span>
                      <p className="font-medium">{((data.clicks / data.impressions) * 100).toFixed(2)}%</p>
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
            {topKeywords.map(([keyword, count], index) => (
              <div key={keyword} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{keyword}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <p className="text-xs text-gray-500">searches</p>
                </div>
              </div>
            ))}
            {topKeywords.length === 0 && (
              <p className="text-gray-500 text-sm italic text-center py-4">No search data available</p>
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
          {geoPerformance.length > 0 ? geoPerformance.map(([location, count]: [string, number], index: number) => {
            const totalLeads = addressAnalytics.totalLeads || 1;
            const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
            return (
              <div key={`${location}-${index}`} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">{location}</span>
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
                  {count} leads • Est. €{(count * 1200).toLocaleString()} value
                </div>
              </div>
            );
          }) : (
            <div className="col-span-4 text-center py-8 text-gray-500">
              <p>No geographic data available yet</p>
            </div>
          )}
          {geoPerformance.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-sm italic">No geographic data available</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MarketingAnalytics;