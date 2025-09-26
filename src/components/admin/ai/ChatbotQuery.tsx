'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: any;
  chart?: 'bar' | 'line' | 'pie' | 'table';
}

const ChatbotQuery = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Hi! I'm your analytics assistant. I can help you get insights from your data. Try asking me questions like:\n\n• How many leads did we get this week?\n• What's our conversion rate by source?\n• Show me the top performing landing pages\n• Which campaigns have the best ROI?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    "How many leads from Facebook in the last 30 days?",
    "What's our conversion rate this month?",
    "Show me duplicate leads from this week",
    "Which traffic source has the highest ROI?",
    "Compare A/B test performance",
    "Show me leads by location"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processQuery = async (query: string): Promise<ChatMessage> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI responses based on query content
    let response = '';
    let data = null;
    let chart = undefined;

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('leads') && (lowerQuery.includes('facebook') || lowerQuery.includes('fb'))) {
      response = "📊 **Facebook Leads Analysis (Last 30 Days)**\n\n• Total Leads: **156 leads**\n• Conversion Rate: **3.4%**\n• Cost per Lead: **€24.50**\n• Total Spend: **€3,822**\n• Quality Score: **High** (4.2/5)\n\n🎯 Top performing campaigns:\n1. Solar Calculator - Dublin (45 leads)\n2. Battery Systems - Cork (32 leads)\n3. Home Energy Solutions (28 leads)";
      data = {
        leads: 156,
        conversion_rate: 3.4,
        cost_per_lead: 24.50,
        total_spend: 3822
      };
      chart = 'bar';
    } else if (lowerQuery.includes('conversion rate')) {
      response = "📈 **Current Conversion Rate Analysis**\n\n• Overall Site Conversion: **4.2%** ↗️ (+0.5%)\n• By Traffic Source:\n  - Google Ads: **4.8%**\n  - Facebook Ads: **3.4%**\n  - Organic Search: **6.1%**\n  - Direct Traffic: **2.9%**\n  - Email: **8.2%**\n\n🏆 Best performing page: Solar Calculator (5.3% conversion)";
      chart = 'line';
    } else if (lowerQuery.includes('duplicate') || lowerQuery.includes('duplicates')) {
      response = "🔍 **Duplicate Leads Analysis**\n\n• Found: **23 duplicate leads** this week\n• By matching criteria:\n  - Email: 15 duplicates\n  - Phone: 6 duplicates  \n  - Address: 2 duplicates\n\n⚡ **Actions Available:**\n• Auto-merge suggestions: 18 leads\n• Manual review needed: 5 leads\n\n💡 **Recommendation**: Enable automatic deduplication for email matches to improve data quality.";
      data = {
        total_duplicates: 23,
        email_duplicates: 15,
        phone_duplicates: 6,
        address_duplicates: 2
      };
    } else if (lowerQuery.includes('roi') || lowerQuery.includes('return')) {
      response = "💰 **ROI Analysis by Traffic Source**\n\n🥇 **Top Performers:**\n1. **Email Campaigns**: 420% ROI (€5.20 return per €1)\n2. **Organic Search**: 340% ROI (€3.40 return per €1)  \n3. **Google Ads**: 280% ROI (€2.80 return per €1)\n4. **Facebook Ads**: 190% ROI (€1.90 return per €1)\n\n📊 **Total Marketing ROI**: 295% (€145,680 revenue from €49,560 spend)";
      chart = 'pie';
    } else if (lowerQuery.includes('location') || lowerQuery.includes('geographic')) {
      response = "🗺️ **Leads by Geographic Location**\n\n🏙️ **Top Locations:**\n1. **Dublin**: 342 leads (28% of total)\n2. **Cork**: 189 leads (15% of total)\n3. **Galway**: 156 leads (13% of total)\n4. **Limerick**: 134 leads (11% of total)\n5. **Waterford**: 98 leads (8% of total)\n\n📈 **Growth Areas**: Galway (+45% this month), Waterford (+32% this month)";
      data = {
        dublin: 342,
        cork: 189,
        galway: 156,
        limerick: 134,
        waterford: 98
      };
    } else {
      response = `I understand you're asking about "${query}". Here's what I found:\n\n📊 **General Analytics Summary:**\n• Total Leads (30 days): **1,234**\n• Conversion Rate: **4.2%**\n• Top Source: **Google Ads** (456 leads)\n• Revenue Attribution: **€45,678**\n\n💡 Try asking more specific questions like:\n• "Show me conversion rates by landing page"\n• "What's our best performing campaign?"\n• "How many leads came from Dublin this month?"`;
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      data,
      chart
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await processQuery(inputValue);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInputValue(query);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-IE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[800px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Analytics Assistant</h2>
            <p className="text-green-100 text-sm">Ask me anything about your data in plain English</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 text-green-200 text-sm">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="text-sm text-gray-600 mb-2">💡 Try these popular queries:</div>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((query, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSuggestedQuery(query)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
            >
              {query}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-green-600">AI Assistant</span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {message.chart && message.data && (
                  <div className="mt-3 p-3 bg-white rounded-lg border">
                    <div className="text-xs text-gray-500 mb-2">📊 Data Visualization</div>
                    <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded flex items-center justify-center">
                      <div className="text-sm text-gray-600">
                        {message.chart.toUpperCase()} Chart Preview
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-green-200' : 'text-gray-500'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-xl">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your analytics data..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              rows={2}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-3 text-xs text-gray-400">
              Enter to send
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotQuery;