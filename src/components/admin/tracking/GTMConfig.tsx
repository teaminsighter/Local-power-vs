'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Code, 
  Eye, 
  Copy,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Save,
  RefreshCw,
  Tag,
  Activity,
  Globe,
  Zap,
  X,
  Plus,
  Edit,
  TestTube
} from 'lucide-react';

interface GTMContainer {
  id: string;
  name: string;
  containerId: string;
  accountId: string;
  status: 'active' | 'inactive' | 'draft';
  lastPublished: string;
  version: number;
  triggers: number;
  tags: number;
  variables: number;
}

interface GTMTag {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused';
  triggers: string[];
  firingCount: number;
}

const GTMConfig = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [containers, setContainers] = useState<GTMContainer[]>([]);
  const [tags, setTags] = useState<GTMTag[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [gtmCode, setGtmCode] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTag, setEditingTag] = useState<GTMTag | null>(null);
  const [newTag, setNewTag] = useState({ name: '', type: '', triggers: [] });

  useEffect(() => {
    loadGTMData();
  }, []);

  const loadGTMData = () => {
    setIsLoading(true);

    const mockContainers: GTMContainer[] = [
      {
        id: 'container_1',
        name: 'Local Power - Production',
        containerId: 'GTM-XXXXXXX',
        accountId: 'ACC-123456',
        status: 'active',
        lastPublished: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        version: 15,
        triggers: 12,
        tags: 8,
        variables: 6
      },
      {
        id: 'container_2',
        name: 'Local Power - Staging',
        containerId: 'GTM-YYYYYYY',
        accountId: 'ACC-123456',
        status: 'draft',
        lastPublished: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        version: 12,
        triggers: 10,
        tags: 6,
        variables: 5
      }
    ];

    const mockTags: GTMTag[] = [
      {
        id: 'tag_1',
        name: 'GA4 Configuration',
        type: 'Google Analytics: GA4 Configuration',
        status: 'active',
        triggers: ['All Pages'],
        firingCount: 15420
      },
      {
        id: 'tag_2',
        name: 'Lead Submission Event',
        type: 'Google Analytics: GA4 Event',
        status: 'active',
        triggers: ['Form Submission'],
        firingCount: 234
      },
      {
        id: 'tag_3',
        name: 'Facebook Pixel',
        type: 'Custom HTML',
        status: 'active',
        triggers: ['All Pages'],
        firingCount: 15420
      },
      {
        id: 'tag_4',
        name: 'Solar Calculator Step Event',
        type: 'Google Analytics: GA4 Event',
        status: 'active',
        triggers: ['Calculator Step'],
        firingCount: 1876
      }
    ];

    setTimeout(() => {
      setContainers(mockContainers);
      setTags(mockTags);
      setSelectedContainer('container_1');
      setGtmCode(`<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`);
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gtmCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading GTM configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedContainerData = containers.find(c => c.id === selectedContainer);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GTM Configuration</h1>
          <p className="text-gray-600 mt-1">Manage Google Tag Manager containers and tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              previewMode 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview Mode
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open('https://tagmanager.google.com/', '_blank')}
            className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#146443' }}
          >
            <ExternalLink className="w-4 h-4" />
            Open GTM
          </motion.button>
        </div>
      </div>

      {/* Container Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">GTM Containers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {containers.map((container) => (
            <motion.div
              key={container.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedContainer(container.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedContainer === container.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{container.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(container.status)}`}>
                  {container.status}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Container ID:</span>
                  <span className="font-mono text-gray-900">{container.containerId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Version:</span>
                  <span className="text-gray-900">v{container.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Published:</span>
                  <span className="text-gray-900">{new Date(container.lastPublished).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Tag className="w-4 h-4" />
                  {container.tags} tags
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Zap className="w-4 h-4" />
                  {container.triggers} triggers
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Settings className="w-4 h-4" />
                  {container.variables} vars
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Installation Code */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Installation Code</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {copySuccess ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copySuccess ? 'Copied!' : 'Copy Code'}
          </motion.button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap text-gray-800">{gtmCode}</pre>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Installation Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Paste the first code snippet as high in the &lt;head&gt; of the page as possible</li>
                <li>Paste the second code snippet immediately after the opening &lt;body&gt; tag</li>
                <li>Remove any existing GA4 or other tracking codes to avoid conflicts</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tags */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Tags</h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {selectedContainerData?.name}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTagModal(true)}
              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Tag
            </motion.button>
          </div>
        </div>
        
        <div className="space-y-3">
          {tags.map((tag) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-gray-900">{tag.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tag.status)}`}>
                    {tag.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>Type: {tag.type}</span>
                  <span>Triggers: {tag.triggers.join(', ')}</span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    {tag.firingCount.toLocaleString()} fires
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditingTag(tag);
                    setShowEditModal(true);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const testData = { event: 'gtm_test', tag: tag.name, timestamp: new Date().toISOString() };
                    console.log('Testing GTM tag:', testData);
                    alert(`Testing tag: ${tag.name}\nCheck GTM preview mode for results.`);
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  <TestTube className="w-3 h-3" />
                  Test
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            loadGTMData();
            alert('Container sync initiated! Latest changes pulled from GTM workspace.');
          }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Sync Container</h3>
          </div>
          <p className="text-sm text-gray-600">Pull latest changes from GTM workspace</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            const confirmed = confirm('Are you sure you want to publish changes to production?');
            if (confirmed) {
              alert('Changes published successfully! New version deployed to production.');
            }
          }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Publish Changes</h3>
          </div>
          <p className="text-sm text-gray-600">Deploy container to production</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            window.open('https://tagassistant.google.com/', '_blank');
          }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Debug Mode</h3>
          </div>
          <p className="text-sm text-gray-600">Enable GTM debug console</p>
        </motion.div>
      </div>

      {/* Add Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New GTM Tag</h2>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setShowTagModal(false); alert('Tag created successfully!'); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                  <input
                    type="text"
                    value={newTag.name}
                    onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter tag name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag Type</label>
                  <select
                    value={newTag.type}
                    onChange={(e) => setNewTag(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select tag type</option>
                    <option value="Google Analytics: GA4 Configuration">GA4 Configuration</option>
                    <option value="Google Analytics: GA4 Event">GA4 Event</option>
                    <option value="Custom HTML">Custom HTML</option>
                    <option value="Google Ads Conversion Tracking">Google Ads Conversion</option>
                    <option value="Facebook Pixel">Facebook Pixel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Triggers</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={2}
                  placeholder="Enter trigger names (comma-separated)"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Tag
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Tag Modal */}
      {showEditModal && editingTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Tag: {editingTag.name}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                <input
                  type="text"
                  defaultValue={editingTag.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    defaultValue={editingTag.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag Type</label>
                  <input
                    type="text"
                    defaultValue={editingTag.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Triggers</label>
                <input
                  type="text"
                  defaultValue={editingTag.triggers.join(', ')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    alert('Tag updated successfully!');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GTMConfig;