'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Facebook, Instagram, Linkedin, Play, Clock, Eye, Heart, MessageCircle, Share2, Settings } from 'lucide-react';

const ContentCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const [posts, setPosts] = useState([
    {
      id: 'post-1',
      title: 'Solar Panel Installation Benefits',
      platform: 'Facebook',
      status: 'scheduled',
      scheduledDate: '2025-10-12',
      scheduledTime: '09:00',
      content: 'Discover how solar panels can reduce your energy bills by up to 80%! ☀️ #SolarPower #GreenEnergy',
      image: '/api/placeholder/400/200',
      engagement: { likes: 0, comments: 0, shares: 0 },
      reach: 0
    },
    {
      id: 'post-2',
      title: 'Heat Pump Efficiency Tips',
      platform: 'Instagram',
      status: 'published',
      scheduledDate: '2025-10-11',
      scheduledTime: '14:30',
      content: 'Maximize your heat pump efficiency with these simple tips! 🏡 #HeatPump #EnergyEfficiency',
      image: '/api/placeholder/400/200',
      engagement: { likes: 156, comments: 23, shares: 12 },
      reach: 2340
    },
    {
      id: 'post-3',
      title: 'Renewable Energy Facts',
      platform: 'LinkedIn',
      status: 'published',
      scheduledDate: '2025-10-10',
      scheduledTime: '10:00',
      content: 'Ireland is leading the way in renewable energy adoption. Here are the latest statistics...',
      image: '/api/placeholder/400/200',
      engagement: { likes: 89, comments: 15, shares: 34 },
      reach: 1890
    },
    {
      id: 'post-4',
      title: 'Energy Savings Challenge',
      platform: 'TikTok',
      status: 'draft',
      scheduledDate: '2025-10-13',
      scheduledTime: '16:00',
      content: 'Join our 30-day energy savings challenge! Can you reduce your energy consumption by 20%? 💡',
      image: '/api/placeholder/400/200',
      engagement: { likes: 0, comments: 0, shares: 0 },
      reach: 0
    },
    {
      id: 'post-5',
      title: 'Customer Success Story',
      platform: 'Facebook',
      status: 'scheduled',
      scheduledDate: '2025-10-14',
      scheduledTime: '11:30',
      content: 'Meet the Murphy family from Dublin who saved €3,000 last year with their solar installation! 🌟',
      image: '/api/placeholder/400/200',
      engagement: { likes: 0, comments: 0, shares: 0 },
      reach: 0
    }
  ]);

  const handleEditPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      alert(`Edit Post: ${post.title}\n\nThis would open a modal with:\n- Content editor\n- Schedule modification\n- Platform settings\n- Performance analytics`);
    }
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(post => post.id !== postId));
      alert('Post deleted successfully!');
    }
  };

  const handlePublishPost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, status: 'published' }
        : post
    ));
    alert('Post published successfully!');
  };

  const contentPosts = posts;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'Instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'LinkedIn': return <Linkedin className="w-4 h-4 text-blue-700" />;
      case 'TikTok': return <Play className="w-4 h-4 text-pink-500" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
            <p className="text-gray-600">Plan and schedule your social media content</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Month
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('Create Post modal would open with:\n\n- Platform selection\n- Content editor\n- Image/video upload\n- Scheduling options\n- Hashtag suggestions\n- Preview functionality')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </motion.button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">15</p>
          <p className="text-sm text-gray-600">Posts This Week</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+18%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">45.2K</p>
          <p className="text-sm text-gray-600">Total Reach</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+25%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">2,847</p>
          <p className="text-sm text-gray-600">Total Engagement</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-blue-600 text-sm font-medium">3 pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">8</p>
          <p className="text-sm text-gray-600">Scheduled Posts</p>
        </motion.div>
      </div>

      {/* Content Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Upcoming Content</h3>
          <div className="text-sm text-gray-600">
            {contentPosts.filter(p => p.status === 'scheduled').length} scheduled posts
          </div>
        </div>

        <div className="space-y-4">
          {contentPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{post.title}</h4>
                    <div className="flex items-center gap-1">
                      {getPlatformIcon(post.platform)}
                      <span className="text-sm text-gray-600">{post.platform}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.scheduledDate} at {post.scheduledTime}</span>
                      </div>
                      {post.status === 'published' && (
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.reach}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.engagement.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.engagement.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            {post.engagement.shares}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Platform Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { platform: 'Facebook', posts: 8, reach: 12340, engagement: 892, color: 'text-blue-600' },
            { platform: 'Instagram', posts: 6, reach: 8960, engagement: 1247, color: 'text-pink-600' },
            { platform: 'LinkedIn', posts: 4, reach: 5670, engagement: 434, color: 'text-blue-700' },
            { platform: 'TikTok', posts: 3, reach: 18450, engagement: 2134, color: 'text-pink-500' }
          ].map((platform) => (
            <div key={platform.platform} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                {getPlatformIcon(platform.platform)}
                <span className="font-medium text-gray-900">{platform.platform}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts:</span>
                  <span className="font-medium">{platform.posts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reach:</span>
                  <span className="font-medium">{platform.reach.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement:</span>
                  <span className={`font-medium ${platform.color}`}>{platform.engagement}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ContentCalendar;