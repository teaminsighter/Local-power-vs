'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Globe, 
  Clock, 
  Monitor,
  Save,
  RefreshCw,
  CheckCircle,
  Info,
  Eye,
  Building
} from 'lucide-react';

interface GeneralSettings {
  // Company Information
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  companyLogo: string;
  
  // Localization
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: string;
  
  // Appearance
  logoPosition: 'left' | 'center' | 'right';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  
  // System Preferences
  autoSave: boolean;
  autoBackup: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordExpiry: number;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationSound: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
  
  // Privacy & Security
  twoFactorRequired: boolean;
  passwordComplexity: 'low' | 'medium' | 'high';
  dataRetention: number;
  activityLogging: boolean;
  ipWhitelist: string[];
  
  // Performance
  cacheEnabled: boolean;
  compressionEnabled: boolean;
  cdnEnabled: boolean;
  maxFileSize: number;
  
  // Regional Settings
  country: string;
  region: string;
  city: string;
  postalCode: string;
}

const GeneralSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [companyChanges, setCompanyChanges] = useState(false);
  const [localizationChanges, setLocalizationChanges] = useState(false);
  const [systemChanges, setSystemChanges] = useState(false);
  const [notificationChanges, setNotificationChanges] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [sectionSuccess, setSectionSuccess] = useState<string | null>(null);

  const defaultSettings: GeneralSettings = {
    // Company Information
    companyName: 'Local Power',
    companyEmail: 'info@localpower.ie',
    companyPhone: '+353 1 234 5678',
    companyAddress: 'Dublin, Ireland',
    companyWebsite: 'https://localpower.ie',
    companyLogo: '',
    
    // Localization
    language: 'en',
    timezone: 'Europe/Dublin',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24',
    currency: 'AUD',
    numberFormat: '1,234.56',
    
    // Appearance
    logoPosition: 'left',
    sidebarCollapsed: false,
    compactMode: false,
    
    // System Preferences
    autoSave: true,
    autoBackup: true,
    sessionTimeout: 480,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationSound: true,
    systemAlerts: true,
    marketingEmails: false,
    
    // Privacy & Security
    twoFactorRequired: false,
    passwordComplexity: 'medium',
    dataRetention: 365,
    activityLogging: true,
    ipWhitelist: [],
    
    // Performance
    cacheEnabled: true,
    compressionEnabled: true,
    cdnEnabled: false,
    maxFileSize: 10,
    
    // Regional Settings
    country: 'Australia',
    region: 'New South Wales',
    city: 'Sydney',
    postalCode: '2000'
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('admin-general-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        } else {
          setSettings(defaultSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof GeneralSettings, value: any) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
    
    // Track section changes
    if (['companyName', 'companyEmail', 'companyPhone', 'companyAddress', 'companyWebsite', 'companyLogo'].includes(key)) {
      setCompanyChanges(true);
    } else if (['language', 'timezone', 'dateFormat', 'timeFormat', 'currency', 'numberFormat', 'country', 'region', 'city', 'postalCode'].includes(key)) {
      setLocalizationChanges(true);
    } else if (['logoPosition', 'compactMode', 'sidebarCollapsed'].includes(key)) {
      // No appearance changes tracking needed since we removed color customization
    } else if (['autoSave', 'autoBackup', 'sessionTimeout', 'maxLoginAttempts', 'passwordExpiry', 'twoFactorRequired', 'passwordComplexity', 'dataRetention', 'activityLogging', 'cacheEnabled', 'compressionEnabled', 'cdnEnabled', 'maxFileSize'].includes(key)) {
      setSystemChanges(true);
    } else if (['emailNotifications', 'pushNotifications', 'smsNotifications', 'notificationSound', 'systemAlerts', 'marketingEmails'].includes(key)) {
      setNotificationChanges(true);
    }
  };

  const saveAllSettings = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin-general-settings', JSON.stringify(settings));
      }
      
      setSaveSuccess(true);
      setHasChanges(false);
      setCompanyChanges(false);
      setLocalizationChanges(false);
      setSystemChanges(false);
      setNotificationChanges(false);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveSectionSettings = async (section: string) => {
    if (!settings) return;
    
    try {
      setSavingSection(section);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin-general-settings', JSON.stringify(settings));
      }
      
      setSectionSuccess(section);
      
      // Reset section-specific change flags
      if (section === 'company') setCompanyChanges(false);
      if (section === 'localization') setLocalizationChanges(false);
      if (section === 'system') setSystemChanges(false);
      if (section === 'notifications') setNotificationChanges(false);
      
      setTimeout(() => setSectionSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving section settings:', error);
    } finally {
      setSavingSection(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load settings. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Save All Changes Bar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">You have unsaved changes</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveAllSettings}
              disabled={isSaving}
              className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: hasChanges ? '#146443' : '#9CA3AF' }}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All Changes
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
          </div>
          {companyChanges && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => saveSectionSettings('company')}
              disabled={savingSection === 'company'}
              className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#146443' }}
            >
              {savingSection === 'company' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : sectionSuccess === 'company' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Company Info
                </>
              )}
            </motion.button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => updateSetting('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={settings.companyEmail}
              onChange={(e) => updateSetting('companyEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.companyPhone}
              onChange={(e) => updateSetting('companyPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={settings.companyWebsite}
              onChange={(e) => updateSetting('companyWebsite', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={settings.companyAddress}
              onChange={(e) => updateSetting('companyAddress', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Localization & Regional Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Localization & Regional Settings</h2>
          </div>
          {localizationChanges && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => saveSectionSettings('localization')}
              disabled={savingSection === 'localization'}
              className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#146443' }}
            >
              {savingSection === 'localization' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : sectionSuccess === 'localization' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Localization
                </>
              )}
            </motion.button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Australia/Sydney">Australia/Sydney</option>
              <option value="Australia/Melbourne">Australia/Melbourne</option>
              <option value="Australia/Brisbane">Australia/Brisbane</option>
              <option value="Australia/Perth">Australia/Perth</option>
              <option value="Pacific/Auckland">New Zealand</option>
              <option value="America/New_York">US Eastern</option>
              <option value="America/Los_Angeles">US Pacific</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => updateSetting('timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="24">24 Hour (23:59)</option>
              <option value="12">12 Hour (11:59 PM)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => updateSetting('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="NZD">NZD - New Zealand Dollar</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number Format</label>
            <select
              value={settings.numberFormat}
              onChange={(e) => updateSetting('numberFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="1,234.56">1,234.56</option>
              <option value="1 234,56">1 234,56</option>
              <option value="1234.56">1234.56</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interface Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Interface Settings</h2>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Clean & Simple Design</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The interface has been optimized with a clean black and white design. 
            All color customization options have been removed to maintain consistency 
            and professional appearance across all tabs and components.
          </p>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Compact Mode</label>
              <p className="text-xs text-gray-500">Reduce spacing and padding for smaller screens</p>
            </div>
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => updateSetting('compactMode', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Sidebar Collapsed by Default</label>
              <p className="text-xs text-gray-500">Start with sidebar in collapsed state</p>
            </div>
            <input
              type="checkbox"
              checked={settings.sidebarCollapsed}
              onChange={(e) => updateSetting('sidebarCollapsed', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">System Preferences</h2>
          </div>
          {systemChanges && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => saveSectionSettings('system')}
              disabled={savingSection === 'system'}
              className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#146443' }}
            >
              {savingSection === 'system' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : sectionSuccess === 'system' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save System Settings
                </>
              )}
            </motion.button>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                min="5"
                max="1440"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
              <input
                type="number"
                min="30"
                max="365"
                value={settings.passwordExpiry}
                onChange={(e) => updateSetting('passwordExpiry', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto Save</label>
                <p className="text-xs text-gray-500">Automatically save changes</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSetting('autoSave', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto Backup</label>
                <p className="text-xs text-gray-500">Automatically backup data daily</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => updateSetting('autoBackup', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Two-Factor Authentication Required</label>
                <p className="text-xs text-gray-500">Require 2FA for all admin users</p>
              </div>
              <input
                type="checkbox"
                checked={settings.twoFactorRequired}
                onChange={(e) => updateSetting('twoFactorRequired', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          </div>
          {notificationChanges && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => saveSectionSettings('notifications')}
              disabled={savingSection === 'notifications'}
              className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#146443' }}
            >
              {savingSection === 'notifications' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : sectionSuccess === 'notifications' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Notifications
                </>
              )}
            </motion.button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-xs text-gray-500">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Push Notifications</label>
              <p className="text-xs text-gray-500">Browser push notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
              <p className="text-xs text-gray-500">Text message notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Notification Sound</label>
              <p className="text-xs text-gray-500">Play sound for notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationSound}
              onChange={(e) => updateSetting('notificationSound', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">System Alerts</label>
              <p className="text-xs text-gray-500">Critical system notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.systemAlerts}
              onChange={(e) => updateSetting('systemAlerts', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Marketing Emails</label>
              <p className="text-xs text-gray-500">Product updates and marketing content</p>
            </div>
            <input
              type="checkbox"
              checked={settings.marketingEmails}
              onChange={(e) => updateSetting('marketingEmails', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;