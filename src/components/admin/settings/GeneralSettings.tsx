'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Globe, 
  Clock, 
  Monitor,
  Palette,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  MapPin,
  Languages,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Shield,
  Bell,
  Database,
  HardDrive,
  Wifi,
  Lock,
  Key,
  Mail,
  Phone,
  Building,
  User
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
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  logoPosition: 'left' | 'center' | 'right';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  
  // Navigation Appearance
  navigationBackground?: string;
  navigationTextColor?: string;
  
  // Button Appearance
  primaryButtonBackground?: string;
  primaryButtonTextColor?: string;
  primaryButtonHoverBackground?: string;
  secondaryButtonBackground?: string;
  secondaryButtonTextColor?: string;
  secondaryButtonBorderColor?: string;
  
  // Typography & Colors
  titleColor?: string;
  subtitleColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  bodyTextColor?: string;
  mutedTextColor?: string;
  
  // Status Colors
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  
  // Advanced
  customCss?: string;
  
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
  const [appearanceChanges, setAppearanceChanges] = useState(false);
  const [systemChanges, setSystemChanges] = useState(false);
  const [notificationChanges, setNotificationChanges] = useState(false);
  const [savingSection, setSavingSection] = useState<string>('');
  const [sectionSuccess, setSectionSuccess] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setIsLoading(true);

    // Load from localStorage if available
    const savedSettings = localStorage.getItem('admin-general-settings');
    
    const mockSettings: GeneralSettings = {
      // Company Information
      companyName: 'Local Power Solutions',
      companyEmail: 'info@localpower.com',
      companyPhone: '+61 2 9876 5432',
      companyAddress: '123 Solar Street, Sydney, NSW 2000, Australia',
      companyWebsite: 'https://localpower.com',
      companyLogo: '/logo.png',
      
      // Localization
      language: 'en-AU',
      timezone: 'Australia/Sydney',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24',
      currency: 'AUD',
      numberFormat: '1,234.56',
      
      // Appearance
      theme: 'light',
      primaryColor: '#146443',
      logoPosition: 'left',
      sidebarCollapsed: false,
      compactMode: false,
      
      // Navigation Appearance
      navigationBackground: '#146443',
      navigationTextColor: '#ffffff',
      
      // Button Appearance
      primaryButtonBackground: '#146443',
      primaryButtonTextColor: '#ffffff',
      primaryButtonHoverBackground: '#1a7f5a',
      secondaryButtonBackground: '#ffffff',
      secondaryButtonTextColor: '#374151',
      secondaryButtonBorderColor: '#d1d5db',
      
      // Typography & Colors
      titleColor: '#111827',
      subtitleColor: '#6b7280',
      backgroundColor: '#f9fafb',
      surfaceColor: '#ffffff',
      borderColor: '#e5e7eb',
      bodyTextColor: '#374151',
      mutedTextColor: '#9ca3af',
      
      // Status Colors
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
      infoColor: '#3b82f6',
      
      // Advanced
      customCss: '',
      
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

    setTimeout(() => {
      let finalSettings = mockSettings;
      
      // Merge with saved settings if available
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          finalSettings = { ...mockSettings, ...parsed };
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
      
      setSettings(finalSettings);
      setIsLoading(false);
      
      // Apply the loaded settings immediately
      setTimeout(() => {
        if (finalSettings !== mockSettings) {
          applyCSSVariablesFromSettings(finalSettings);
          createDynamicThemeStyles(finalSettings);
        }
      }, 100);
    }, 1000);
  };

  const createDynamicThemeStyles = (settings: GeneralSettings) => {
    // Create or update dynamic theme override styles
    let dynamicStyle = document.getElementById('dynamic-admin-theme');
    if (!dynamicStyle) {
      dynamicStyle = document.createElement('style');
      dynamicStyle.id = 'dynamic-admin-theme';
      document.head.appendChild(dynamicStyle);
    }
    
    // Generate CSS that overrides the theme with higher specificity
    let css = `
      /* Dynamic theme overrides with highest priority */
      .admin-sidebar,
      .admin-sidebar.admin-sidebar {
        background-color: ${settings.navigationBackground || '#146443'} !important;
        color: ${settings.navigationTextColor || '#ffffff'} !important;
      }
      
      .admin-sidebar h1,
      .admin-sidebar p,
      .admin-sidebar span,
      .admin-sidebar button:not([class*="bg-"]) {
        color: ${settings.navigationTextColor || '#ffffff'} !important;
      }
      
      
      button[style*="background-color: #146443"],
      button[style*="backgroundColor: #146443"] {
        background-color: ${settings.primaryButtonBackground || '#146443'} !important;
        color: ${settings.primaryButtonTextColor || '#ffffff'} !important;
      }
      
      .admin-panel h1, .admin-panel h2, .admin-panel h3, 
      .admin-panel h4, .admin-panel h5, .admin-panel h6,
      .admin-panel .text-gray-900 {
        color: ${settings.titleColor || '#111827'} !important;
      }
      
      .admin-panel .text-gray-600 {
        color: ${settings.subtitleColor || '#6b7280'} !important;
      }
      
      .admin-panel .bg-white {
        background-color: ${settings.surfaceColor || '#ffffff'} !important;
      }
      
      .admin-panel .border-gray-200,
      .admin-panel .border-gray-300 {
        border-color: ${settings.borderColor || '#e5e7eb'} !important;
      }
      
      body {
        background-color: ${settings.backgroundColor || '#f9fafb'} !important;
      }
    `;
    
    dynamicStyle.textContent = css;
  };

  const applyCSSVariablesFromSettings = (settings: GeneralSettings) => {
    const root = document.documentElement;
    
    if (settings.navigationBackground) {
      root.style.setProperty('--admin-nav-bg', settings.navigationBackground);
    }
    if (settings.navigationTextColor) {
      root.style.setProperty('--admin-nav-text', settings.navigationTextColor);
    }
    if (settings.primaryButtonBackground) {
      root.style.setProperty('--admin-btn-primary-bg', settings.primaryButtonBackground);
    }
    if (settings.primaryButtonTextColor) {
      root.style.setProperty('--admin-btn-primary-text', settings.primaryButtonTextColor);
    }
    if (settings.primaryButtonHoverBackground) {
      root.style.setProperty('--admin-btn-primary-hover', settings.primaryButtonHoverBackground);
    }
    if (settings.secondaryButtonBackground) {
      root.style.setProperty('--admin-btn-secondary-bg', settings.secondaryButtonBackground);
    }
    if (settings.secondaryButtonTextColor) {
      root.style.setProperty('--admin-btn-secondary-text', settings.secondaryButtonTextColor);
    }
    if (settings.primaryColor) {
      root.style.setProperty('--admin-primary', settings.primaryColor);
    }
    if (settings.backgroundColor) {
      root.style.setProperty('--admin-bg', settings.backgroundColor);
    }
    if (settings.titleColor) {
      root.style.setProperty('--admin-title', settings.titleColor);
    }
    if (settings.subtitleColor) {
      root.style.setProperty('--admin-subtitle', settings.subtitleColor);
    }
    if (settings.surfaceColor) {
      root.style.setProperty('--admin-surface', settings.surfaceColor);
    }
    if (settings.borderColor) {
      root.style.setProperty('--admin-border', settings.borderColor);
    }
    if (settings.successColor) {
      root.style.setProperty('--admin-success', settings.successColor);
    }
    if (settings.warningColor) {
      root.style.setProperty('--admin-warning', settings.warningColor);
    }
    if (settings.errorColor) {
      root.style.setProperty('--admin-error', settings.errorColor);
    }
    if (settings.infoColor) {
      root.style.setProperty('--admin-info', settings.infoColor);
    }
    if (settings.customCss) {
      let customStyleElement = document.getElementById('admin-general-custom-css');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'admin-general-custom-css';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = settings.customCss;
    }
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (settings.compactMode) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
  };

  const updateSetting = (key: keyof GeneralSettings, value: any) => {
    if (settings) {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      setHasChanges(true);
      
      // Set section-specific change flags
      if (['companyName', 'companyEmail', 'companyPhone', 'companyAddress', 'companyWebsite', 'companyLogo'].includes(key)) {
        setCompanyChanges(true);
      } else if (['language', 'timezone', 'dateFormat', 'timeFormat', 'currency', 'numberFormat'].includes(key)) {
        setLocalizationChanges(true);
      } else if (key.includes('Color') || key.includes('Background') || key === 'customCss' || key === 'theme' || key === 'compactMode' || key === 'primaryColor' || key === 'logoPosition') {
        setAppearanceChanges(true);
        // Apply changes immediately for appearance settings
        applySettingImmediately(key, value);
        // Update the dynamic theme styles
        createDynamicThemeStyles(newSettings);
      } else if (['autoSave', 'autoBackup', 'sessionTimeout', 'maxLoginAttempts', 'passwordExpiry'].includes(key)) {
        setSystemChanges(true);
      } else if (['emailNotifications', 'smsNotifications', 'pushNotifications', 'notificationSound', 'systemAlerts', 'marketingEmails'].includes(key)) {
        setNotificationChanges(true);
      }
    }
  };

  const applySettingImmediately = (key: keyof GeneralSettings, value: any) => {
    const root = document.documentElement;
    
    switch (key) {
      case 'navigationBackground':
        root.style.setProperty('--admin-nav-bg', value);
        // Force immediate visual update
        const sidebar = document.querySelector('.admin-sidebar');
        if (sidebar) {
          (sidebar as HTMLElement).style.setProperty('background-color', value, 'important');
        }
        break;
      case 'navigationTextColor':
        root.style.setProperty('--admin-nav-text', value);
        // Force immediate visual update to all sidebar text
        const sidebarElements = document.querySelectorAll('.admin-sidebar, .admin-sidebar h1, .admin-sidebar p, .admin-sidebar button, .admin-sidebar span');
        sidebarElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.setProperty('color', value, 'important');
          }
        });
        break;
      case 'primaryButtonBackground':
        root.style.setProperty('--admin-btn-primary-bg', value);
        // Update all primary buttons immediately
        const primaryButtons = document.querySelectorAll('button[style*="background-color: #146443"], button[style*="backgroundColor: #146443"], .btn-primary');
        primaryButtons.forEach(btn => {
          if (btn instanceof HTMLElement) {
            btn.style.setProperty('background-color', value, 'important');
          }
        });
        break;
      case 'primaryButtonTextColor':
        root.style.setProperty('--admin-btn-primary-text', value);
        // Update all primary button text immediately
        const primaryButtonTexts = document.querySelectorAll('button[style*="background-color: #146443"], button[style*="backgroundColor: #146443"], .btn-primary');
        primaryButtonTexts.forEach(btn => {
          if (btn instanceof HTMLElement) {
            btn.style.setProperty('color', value, 'important');
          }
        });
        break;
      case 'primaryButtonHoverBackground':
        root.style.setProperty('--admin-btn-primary-hover', value);
        break;
      case 'secondaryButtonBackground':
        root.style.setProperty('--admin-btn-secondary-bg', value);
        break;
      case 'secondaryButtonTextColor':
        root.style.setProperty('--admin-btn-secondary-text', value);
        break;
      case 'primaryColor':
        root.style.setProperty('--admin-primary', value);
        break;
      case 'backgroundColor':
        root.style.setProperty('--admin-bg', value);
        // Update page background immediately
        const body = document.body;
        if (body) {
          body.style.setProperty('background-color', value, 'important');
        }
        break;
      case 'titleColor':
        root.style.setProperty('--admin-title', value);
        // Update all titles immediately
        const titles = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .admin-title, .text-gray-900');
        titles.forEach(title => {
          if (title instanceof HTMLElement) {
            title.style.setProperty('color', value, 'important');
          }
        });
        break;
      case 'subtitleColor':
        root.style.setProperty('--admin-subtitle', value);
        // Update all subtitles immediately
        const subtitles = document.querySelectorAll('.text-gray-600, .admin-subtitle');
        subtitles.forEach(subtitle => {
          if (subtitle instanceof HTMLElement) {
            subtitle.style.setProperty('color', value, 'important');
          }
        });
        break;
      case 'surfaceColor':
        root.style.setProperty('--admin-surface', value);
        // Update all white surfaces immediately
        const surfaces = document.querySelectorAll('.bg-white, .admin-surface');
        surfaces.forEach(surface => {
          if (surface instanceof HTMLElement) {
            surface.style.setProperty('background-color', value, 'important');
          }
        });
        break;
      case 'borderColor':
        root.style.setProperty('--admin-border', value);
        // Update all borders immediately
        const borders = document.querySelectorAll('.border-gray-200, .border-gray-300, .admin-border');
        borders.forEach(border => {
          if (border instanceof HTMLElement) {
            border.style.setProperty('border-color', value, 'important');
          }
        });
        break;
      case 'successColor':
        root.style.setProperty('--admin-success', value);
        break;
      case 'warningColor':
        root.style.setProperty('--admin-warning', value);
        break;
      case 'errorColor':
        root.style.setProperty('--admin-error', value);
        break;
      case 'infoColor':
        root.style.setProperty('--admin-info', value);
        break;
      case 'customCss':
        let customStyleElement = document.getElementById('admin-general-custom-css');
        if (!customStyleElement) {
          customStyleElement = document.createElement('style');
          customStyleElement.id = 'admin-general-custom-css';
          document.head.appendChild(customStyleElement);
        }
        customStyleElement.textContent = value;
        break;
      case 'theme':
        if (value === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        break;
      case 'compactMode':
        if (value) {
          document.documentElement.classList.add('compact');
        } else {
          document.documentElement.classList.remove('compact');
        }
        break;
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Apply CSS variables immediately
      applyCSSVariables();
      createDynamicThemeStyles(settings!);
      applyCSSVariablesFromSettings(settings!);
      
      // Save to localStorage
      localStorage.setItem('admin-general-settings', JSON.stringify(settings));
      
      // In production, this would make an API call
      // await fetch('/api/admin/settings/general', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setHasChanges(false);
        setCompanyChanges(false);
        setLocalizationChanges(false);
        setAppearanceChanges(false);
        setSystemChanges(false);
        setNotificationChanges(false);
        
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      setIsSaving(false);
    }
  };

  const saveSectionSettings = async (section: string) => {
    setSavingSection(section);
    
    try {
      // Apply CSS variables immediately for appearance changes
      if (section === 'appearance') {
        applyCSSVariables();
        createDynamicThemeStyles(settings!);
        applyCSSVariablesFromSettings(settings!);
      }
      
      // Save to localStorage
      localStorage.setItem('admin-general-settings', JSON.stringify(settings));
      
      // In production, this would make an API call
      // await fetch('/api/admin/settings/general', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      setTimeout(() => {
        setSavingSection('');
        setSectionSuccess(section);
        
        // Clear section-specific change flags
        switch (section) {
          case 'company':
            setCompanyChanges(false);
            break;
          case 'localization':
            setLocalizationChanges(false);
            break;
          case 'appearance':
            setAppearanceChanges(false);
            break;
          case 'system':
            setSystemChanges(false);
            break;
          case 'notifications':
            setNotificationChanges(false);
            break;
        }
        
        // Check if all changes are saved
        if (!companyChanges && !localizationChanges && !appearanceChanges && !systemChanges && !notificationChanges) {
          setHasChanges(false);
        }
        
        setTimeout(() => setSectionSuccess(''), 3000);
      }, 1500);
    } catch (error) {
      console.error('Error saving section settings:', error);
      setSavingSection('');
    }
  };

  const applyCSSVariables = () => {
    if (!settings) return;
    
    const root = document.documentElement;
    
    // Apply navigation styles with priority
    if (settings.navigationBackground) {
      root.style.setProperty('--admin-nav-bg', settings.navigationBackground);
      // Force immediate application to sidebar
      const sidebar = document.querySelector('.admin-sidebar');
      if (sidebar) {
        (sidebar as HTMLElement).style.setProperty('background-color', settings.navigationBackground, 'important');
      }
    }
    if (settings.navigationTextColor) {
      root.style.setProperty('--admin-nav-text', settings.navigationTextColor);
      // Force application to sidebar text elements
      const sidebarTexts = document.querySelectorAll('.admin-sidebar, .admin-sidebar *');
      sidebarTexts.forEach(el => {
        if (el instanceof HTMLElement && !el.matches('svg')) {
          el.style.setProperty('color', settings.navigationTextColor!, 'important');
        }
      });
    }
    
    // Apply button styles
    if (settings.primaryButtonBackground) {
      root.style.setProperty('--admin-btn-primary-bg', settings.primaryButtonBackground);
    }
    if (settings.primaryButtonTextColor) {
      root.style.setProperty('--admin-btn-primary-text', settings.primaryButtonTextColor);
    }
    if (settings.primaryButtonHoverBackground) {
      root.style.setProperty('--admin-btn-primary-hover', settings.primaryButtonHoverBackground);
    }
    if (settings.secondaryButtonBackground) {
      root.style.setProperty('--admin-btn-secondary-bg', settings.secondaryButtonBackground);
    }
    if (settings.secondaryButtonTextColor) {
      root.style.setProperty('--admin-btn-secondary-text', settings.secondaryButtonTextColor);
    }
    
    // Apply general colors
    if (settings.primaryColor) {
      root.style.setProperty('--admin-primary', settings.primaryColor);
    }
    if (settings.backgroundColor) {
      root.style.setProperty('--admin-bg', settings.backgroundColor);
    }
    if (settings.titleColor) {
      root.style.setProperty('--admin-title', settings.titleColor);
    }
    if (settings.subtitleColor) {
      root.style.setProperty('--admin-subtitle', settings.subtitleColor);
    }
    if (settings.surfaceColor) {
      root.style.setProperty('--admin-surface', settings.surfaceColor);
    }
    if (settings.borderColor) {
      root.style.setProperty('--admin-border', settings.borderColor);
    }
    
    // Apply status colors
    if (settings.successColor) {
      root.style.setProperty('--admin-success', settings.successColor);
    }
    if (settings.warningColor) {
      root.style.setProperty('--admin-warning', settings.warningColor);
    }
    if (settings.errorColor) {
      root.style.setProperty('--admin-error', settings.errorColor);
    }
    if (settings.infoColor) {
      root.style.setProperty('--admin-info', settings.infoColor);
    }
    
    // Apply custom CSS
    if (settings.customCss) {
      let customStyleElement = document.getElementById('admin-general-custom-css');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'admin-general-custom-css';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = settings.customCss;
    }
    
    // Apply theme classes
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (settings.compactMode) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
    
    // Apply dynamic theme styles to override everything with highest priority
    createDynamicThemeStyles(settings);
  };

  const resetSettings = () => {
    loadSettings();
    setHasChanges(false);
  };

  const languages = [
    { code: 'en-AU', name: 'English (Australia)' },
    { code: 'en-US', name: 'English (United States)' },
    { code: 'en-GB', name: 'English (United Kingdom)' },
    { code: 'es-ES', name: 'Español (Spain)' },
    { code: 'fr-FR', name: 'Français (France)' },
    { code: 'de-DE', name: 'Deutsch (Germany)' },
    { code: 'it-IT', name: 'Italiano (Italy)' },
    { code: 'pt-BR', name: 'Português (Brazil)' },
    { code: 'zh-CN', name: '中文 (Simplified)' },
    { code: 'ja-JP', name: '日本語 (Japanese)' }
  ];

  const timezones = [
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Perth',
    'Australia/Adelaide',
    'Australia/Darwin',
    'Pacific/Auckland',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Singapore'
  ];

  const currencies = [
    { code: 'AUD', name: 'Australian Dollar (AUD)', symbol: '$' },
    { code: 'USD', name: 'US Dollar (USD)', symbol: '$' },
    { code: 'EUR', name: 'Euro (EUR)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (GBP)', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar (CAD)', symbol: '$' },
    { code: 'NZD', name: 'New Zealand Dollar (NZD)', symbol: '$' },
    { code: 'JPY', name: 'Japanese Yen (JPY)', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan (CNY)', symbol: '¥' }
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#146443' }} />
            <p className="text-gray-600">Loading general settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide preferences and settings</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetSettings}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
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
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">You have unsaved changes</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
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

      {/* Localization Settings */}
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
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => updateSetting('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.name}
                </option>
              ))}
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
              <option value="DD MMM YYYY">DD MMM YYYY</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => updateSetting('timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="12">12-hour (AM/PM)</option>
              <option value="24">24-hour</option>
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
              <option value="1.234,56">1.234,56</option>
              <option value="1 234,56">1 234,56</option>
              <option value="1234.56">1234.56</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Appearance & Interface</h2>
          </div>
          {appearanceChanges && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => saveSectionSettings('appearance')}
              disabled={savingSection === 'appearance'}
              className="text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#146443' }}
            >
              {savingSection === 'appearance' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : sectionSuccess === 'appearance' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Appearance
                </>
              )}
            </motion.button>
          )}
        </div>
        
        {/* Navigation Appearance */}
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">Navigation Bar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.navigationBackground || '#146443'}
                  onChange={(e) => updateSetting('navigationBackground', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.navigationBackground || '#146443'}
                  onChange={(e) => updateSetting('navigationBackground', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.navigationTextColor || '#ffffff'}
                  onChange={(e) => updateSetting('navigationTextColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.navigationTextColor || '#ffffff'}
                  onChange={(e) => updateSetting('navigationTextColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
            
          </div>
        </div>

        {/* Button Appearance */}
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">Buttons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryButtonBackground || '#146443'}
                  onChange={(e) => updateSetting('primaryButtonBackground', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryButtonBackground || '#146443'}
                  onChange={(e) => updateSetting('primaryButtonBackground', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryButtonTextColor || '#ffffff'}
                  onChange={(e) => updateSetting('primaryButtonTextColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryButtonTextColor || '#ffffff'}
                  onChange={(e) => updateSetting('primaryButtonTextColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.secondaryButtonBackground || '#ffffff'}
                  onChange={(e) => updateSetting('secondaryButtonBackground', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondaryButtonBackground || '#ffffff'}
                  onChange={(e) => updateSetting('secondaryButtonBackground', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography & Layout */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">Typography & Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.titleColor || '#111827'}
                  onChange={(e) => updateSetting('titleColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.titleColor || '#111827'}
                  onChange={(e) => updateSetting('titleColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.subtitleColor || '#6b7280'}
                  onChange={(e) => updateSetting('subtitleColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.subtitleColor || '#6b7280'}
                  onChange={(e) => updateSetting('subtitleColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor || '#f9fafb'}
                  onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.backgroundColor || '#f9fafb'}
                  onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Theme & Layout Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => updateSetting('primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => updateSetting('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Position</label>
            <select
              value={settings.logoPosition}
              onChange={(e) => updateSetting('logoPosition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>

        {/* Custom CSS */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
          <textarea
            value={settings.customCss || ''}
            onChange={(e) => updateSetting('customCss', e.target.value)}
            placeholder="/* Add custom CSS rules here */&#10;.admin-panel {&#10;  /* Your custom styles */&#10;}"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Add custom CSS to override default styles. Changes apply immediately.</p>
        </div>
        
        <div className="space-y-4">
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
                  Save System Prefs
                </>
              )}
            </motion.button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              min="15"
              max="1440"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
            <input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
              min="3"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
            <input
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => updateSetting('passwordExpiry', parseInt(e.target.value))}
              min="30"
              max="365"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto Save</label>
              <p className="text-xs text-gray-500">Automatically save changes as you work</p>
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
              <label className="text-sm font-medium text-gray-700">Activity Logging</label>
              <p className="text-xs text-gray-500">Log user activities for audit purposes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.activityLogging}
              onChange={(e) => updateSetting('activityLogging', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
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
              <p className="text-xs text-gray-500">Receive browser push notifications</p>
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
              <p className="text-xs text-gray-500">Receive notifications via SMS</p>
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
              <p className="text-xs text-gray-500">Receive alerts for system events</p>
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
              <p className="text-xs text-gray-500">Receive promotional and marketing emails</p>
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

      {/* Live Preview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Changes apply instantly</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Navigation Preview */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Navigation Bar Preview</h3>
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="p-4"
                style={{ 
                  backgroundColor: settings?.navigationBackground || '#146443',
                  color: settings?.navigationTextColor || '#ffffff'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded"></div>
                  <span className="font-medium">Admin Panel</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div 
                    className="px-3 py-2 rounded flex items-center gap-2"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    }}
                  >
                    <div className="w-4 h-4 bg-current opacity-60 rounded"></div>
                    <span className="text-sm">Active Menu Item</span>
                  </div>
                  <div 
                    className="px-3 py-2 rounded flex items-center gap-2 opacity-80"
                    style={{ color: settings?.navigationTextColor || '#ffffff' }}
                  >
                    <div className="w-4 h-4 bg-current opacity-60 rounded"></div>
                    <span className="text-sm">Regular Menu Item</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Button Preview */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Button Preview</h3>
            <div className="space-y-3">
              <button 
                className="px-4 py-2 rounded-lg font-medium"
                style={{ 
                  backgroundColor: settings?.primaryButtonBackground || '#146443',
                  color: settings?.primaryButtonTextColor || '#ffffff'
                }}
              >
                Primary Button
              </button>
              <button 
                className="px-4 py-2 rounded-lg font-medium border"
                style={{ 
                  backgroundColor: settings?.secondaryButtonBackground || '#ffffff',
                  color: settings?.secondaryButtonTextColor || '#374151',
                  borderColor: settings?.secondaryButtonBorderColor || '#d1d5db'
                }}
              >
                Secondary Button
              </button>
            </div>
          </div>

          {/* Typography Preview */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Typography Preview</h3>
            <div className="space-y-2">
              <h1 
                className="text-xl font-bold"
                style={{ color: settings?.titleColor || '#111827' }}
              >
                Page Title
              </h1>
              <p 
                className="text-sm"
                style={{ color: settings?.subtitleColor || '#6b7280' }}
              >
                Subtitle text with description
              </p>
              <p 
                className="text-sm"
                style={{ color: settings?.bodyTextColor || '#374151' }}
              >
                Regular body text content
              </p>
            </div>
          </div>

          {/* Status Colors Preview */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Status Colors Preview</h3>
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="px-3 py-2 rounded text-white text-sm text-center"
                style={{ backgroundColor: settings?.successColor || '#10b981' }}
              >
                Success
              </div>
              <div 
                className="px-3 py-2 rounded text-white text-sm text-center"
                style={{ backgroundColor: settings?.warningColor || '#f59e0b' }}
              >
                Warning
              </div>
              <div 
                className="px-3 py-2 rounded text-white text-sm text-center"
                style={{ backgroundColor: settings?.errorColor || '#ef4444' }}
              >
                Error
              </div>
              <div 
                className="px-3 py-2 rounded text-white text-sm text-center"
                style={{ backgroundColor: settings?.infoColor || '#3b82f6' }}
              >
                Info
              </div>
            </div>
          </div>
        </div>

        {/* Theme Applied Notice */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Theme changes are applied to the current admin panel in real-time
            </span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Navigate to other admin pages to see your customizations throughout the panel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;