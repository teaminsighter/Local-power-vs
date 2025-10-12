'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Facebook, Instagram, Linkedin, Play, Clock, Reply, Heart, Flag, Search, Filter, MoreHorizontal } from 'lucide-react';

const Comments = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const comments = [
    {
      id: 'comment-1',
      platform: 'Facebook',
      postTitle: 'Solar Panel Installation Benefits',
      author: 'Sarah Murphy',
      avatar: '/api/placeholder/40/40',
      content: 'Great information! We\'ve been considering solar panels for our home in Dublin. Could you provide more details about the installation process?',
      timestamp: '2025-10-12T09:15:00',
      sentiment: 'positive',
      status: 'pending',
      likes: 3,
      replies: 0
    },
    {
      id: 'comment-2',
      platform: 'Instagram',
      postTitle: 'Heat Pump Efficiency Tips',
      author: 'John O\'Connor',
      avatar: '/api/placeholder/40/40',
      content: 'Amazing tips! 🔥 My heat pump has been working much better since I followed your advice. Thank you!',
      timestamp: '2025-10-11T16:30:00',
      sentiment: 'positive',
      status: 'replied',
      likes: 7,
      replies: 1
    },
    {
      id: 'comment-3',
      platform: 'LinkedIn',
      postTitle: 'Renewable Energy Facts',
      author: 'Emma Walsh',
      avatar: '/api/placeholder/40/40',
      content: 'Interesting statistics. However, I think the adoption rate could be higher if there were better government incentives.',
      timestamp: '2025-10-10T14:20:00',
      sentiment: 'neutral',
      status: 'replied',
      likes: 12,
      replies: 3
    },
    {
      id: 'comment-4',
      platform: 'TikTok',
      postTitle: 'Energy Savings Challenge',
      author: 'Michael_Energy_Saver',
      avatar: '/api/placeholder/40/40',
      content: 'This challenge is impossible! My energy bills keep going up no matter what I do. These tips don\'t work.',
      timestamp: '2025-10-10T11:45:00',
      sentiment: 'negative',
      status: 'flagged',
      likes: 1,
      replies: 0
    },
    {
      id: 'comment-5',
      platform: 'Facebook',
      postTitle: 'Customer Success Story',
      author: 'Lisa Thompson',
      avatar: '/api/placeholder/40/40',
      content: 'We had a similar experience! Our solar panels from Local Power have been fantastic. Highly recommend!',
      timestamp: '2025-10-09T08:30:00',
      sentiment: 'positive',
      status: 'replied',
      likes: 15,
      replies: 2
    },
    {
      id: 'comment-6',
      platform: 'Instagram',
      postTitle: 'Renewable Energy Facts',
      author: 'greentech_enthusiast',
      avatar: '/api/placeholder/40/40',
      content: 'Love seeing more companies promote renewable energy! 🌱💚 When will you expand to Cork?',
      timestamp: '2025-10-08T19:15:00',
      sentiment: 'positive',
      status: 'pending',
      likes: 8,
      replies: 0
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'Instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'LinkedIn': return <Linkedin className="w-4 h-4 text-blue-700" />;
      case 'TikTok': return <Play className="w-4 h-4 text-pink-500" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'replied': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesFilter = selectedFilter === 'all' || comment.status === selectedFilter;
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comments Management</h1>
            <p className="text-gray-600">Monitor and respond to social media comments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          {/* Filter */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Comments</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
            <option value="flagged">Flagged</option>
          </select>
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
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+15%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">147</p>
          <p className="text-sm text-gray-600">Total Comments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-red-600 text-sm font-medium">12 pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">18</p>
          <p className="text-sm text-gray-600">Pending Responses</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">92%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">4.8</p>
          <p className="text-sm text-gray-600">Avg Sentiment Score</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Reply className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">2.3 hrs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">1.8</p>
          <p className="text-sm text-gray-600">Avg Response Time (hrs)</p>
        </motion.div>
      </div>

      {/* Comments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Comments</h3>
          <div className="text-sm text-gray-600">
            {filteredComments.length} of {comments.length} comments
          </div>
        </div>

        <div className="space-y-4">
          {filteredComments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {comment.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <div className="flex items-center gap-1">
                      {getPlatformIcon(comment.platform)}
                      <span className="text-sm text-gray-600">{comment.platform}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comment.status)}`}>
                      {comment.status}
                    </span>
                    <span className={`text-xs font-medium ${getSentimentColor(comment.sentiment)}`}>
                      {comment.sentiment}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">on "{comment.postTitle}"</p>
                  <p className="text-gray-900 mb-3">{comment.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {comment.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Reply className="w-4 h-4" />
                        {comment.replies}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        Reply
                      </button>
                      <button className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded transition-colors">
                        Flag
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Platform Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Comments by Platform</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { platform: 'Facebook', comments: 45, pending: 8, sentiment: 'positive', avgResponse: '1.2 hrs' },
            { platform: 'Instagram', comments: 67, pending: 5, sentiment: 'positive', avgResponse: '45 min' },
            { platform: 'LinkedIn', comments: 23, pending: 3, sentiment: 'neutral', avgResponse: '3.1 hrs' },
            { platform: 'TikTok', comments: 12, pending: 2, sentiment: 'positive', avgResponse: '2.8 hrs' }
          ].map((platform) => (
            <div key={platform.platform} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                {getPlatformIcon(platform.platform)}
                <span className="font-medium text-gray-900">{platform.platform}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments:</span>
                  <span className="font-medium">{platform.comments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-yellow-600">{platform.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sentiment:</span>
                  <span className={`font-medium ${getSentimentColor(platform.sentiment)}`}>
                    {platform.sentiment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="font-medium">{platform.avgResponse}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Comments;