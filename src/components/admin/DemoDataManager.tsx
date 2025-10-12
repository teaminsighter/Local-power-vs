'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';

const DemoDataManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [demoDataStatus, setDemoDataStatus] = useState<any>(null);
  const [message, setMessage] = useState<string>('');

  const checkDemoDataStatus = async () => {
    try {
      const response = await fetch('/api/demo/admin-data');
      const data = await response.json();
      setDemoDataStatus(data);
    } catch (error) {
      console.error('Error checking demo data status:', error);
    }
  };

  const generateDemoData = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/demo/admin-data?action=generate');
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Demo data generated successfully!');
        await checkDemoDataStatus();
        
        // Refresh the page after a short delay to show new data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage('❌ Failed to generate demo data: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error generating demo data: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearDemoData = async () => {
    if (!confirm('Are you sure you want to clear all demo data? This cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/demo/admin-data?action=clear');
      const data = await response.json();
      
      if (data.success) {
        setMessage('🗑️ Demo data cleared successfully!');
        await checkDemoDataStatus();
        
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage('❌ Failed to clear demo data: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error clearing demo data: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    checkDemoDataStatus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Demo Data Manager</h3>
            <p className="text-sm text-gray-600">Generate and manage demo data for testing</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {demoDataStatus?.generated && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Demo data active</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Information */}
      {demoDataStatus && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <div className={`font-medium ${demoDataStatus.generated ? 'text-green-600' : 'text-gray-500'}`}>
                {demoDataStatus.generated ? 'Active' : 'Not Generated'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Leads:</span>
              <div className="font-medium">{demoDataStatus.data?.leads?.length || 0}</div>
            </div>
            <div>
              <span className="text-gray-600">Campaigns:</span>
              <div className="font-medium">{demoDataStatus.data?.marketingCampaigns?.length || 0}</div>
            </div>
            <div>
              <span className="text-gray-600">Installations:</span>
              <div className="font-medium">{demoDataStatus.data?.solarInstallations?.length || 0}</div>
            </div>
          </div>
          
          {demoDataStatus.timestamp && (
            <div className="mt-3 text-xs text-gray-500">
              Generated: {new Date(demoDataStatus.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateDemoData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          Generate Demo Data
        </motion.button>

        {demoDataStatus?.generated && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearDemoData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Clear Demo Data
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={checkDemoDataStatus}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium transition-colors hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </motion.button>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : message.includes('❌')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {message.includes('✅') && <CheckCircle className="w-4 h-4" />}
          {message.includes('❌') && <AlertCircle className="w-4 h-4" />}
          {!message.includes('✅') && !message.includes('❌') && <Info className="w-4 h-4" />}
          <span>{message}</span>
        </motion.div>
      )}

      {/* Information */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Demo Data Information:</p>
            <ul className="text-xs space-y-1">
              <li>• Demo data is stored in memory and will reset when the server restarts</li>
              <li>• Generate demo data to populate the admin panel with test information</li>
              <li>• Use "Clear Demo Data" to remove all test data and start fresh</li>
              <li>• Map functionality now works with the provided Google Maps API key</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DemoDataManager;