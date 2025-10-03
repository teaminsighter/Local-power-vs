'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Cookie, Eye } from 'lucide-react';

const PrivacyBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('privacy-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('privacy-consent', JSON.stringify({
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('privacy-consent', JSON.stringify({
      analytics: false,
      marketing: false,
      functional: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowDetails(true);
  };

  const handleSaveCustom = (settings: any) => {
    localStorage.setItem('privacy-consent', JSON.stringify({
      ...settings,
      timestamp: new Date().toISOString()
    }));
    setShowDetails(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      We respect your privacy
                    </h3>
                    <p className="text-sm text-gray-600">
                      We use cookies and similar technologies to analyze website traffic, improve your experience, 
                      and show you personalized content. We also track visitor behavior to improve our solar calculator.
                    </p>
                    <button
                      onClick={() => setShowDetails(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 underline mt-1"
                    >
                      Learn more about our data practices
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleAcceptEssential}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={handleCustomize}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Customize
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Settings Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Choose which data we can collect to improve your experience
                </p>
              </div>

              <PrivacySettingsForm onSave={handleSaveCustom} onCancel={() => setShowDetails(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface PrivacySettingsFormProps {
  onSave: (settings: any) => void;
  onCancel: () => void;
}

const PrivacySettingsForm = ({ onSave, onCancel }: PrivacySettingsFormProps) => {
  const [settings, setSettings] = useState({
    functional: true, // Always required
    analytics: false,
    marketing: false
  });

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Functional Cookies */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
              <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Always Active
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Required for the website to function properly. These include session management, 
              security features, and basic functionality.
            </p>
          </div>
        </div>

        {/* Analytics */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Analytics & Performance</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.analytics}
                  onChange={(e) => setSettings(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Help us understand how visitors use our website. This includes tracking page views, 
              calculator usage, user interactions, and IP addresses (anonymized after 30 days).
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <strong>Data collected:</strong> Page views, click events, form interactions, IP addresses, 
              device information, browser type, referring websites
            </div>
          </div>
        </div>

        {/* Marketing */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Marketing & Advertising</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.marketing}
                  onChange={(e) => setSettings(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Allow us to show you personalized content and relevant solar solution recommendations. 
              This helps us provide better service and more accurate quotes.
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <strong>Data collected:</strong> Marketing campaign interactions, lead scoring data, 
              personalization preferences, cross-device tracking
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Link */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          For more details about how we handle your data, please read our{' '}
          <a href="/privacy-policy" className="text-blue-600 hover:text-blue-700 underline">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms-of-service" className="text-blue-600 hover:text-blue-700 underline">
            Terms of Service
          </a>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default PrivacyBanner;