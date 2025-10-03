'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminThemeSettings {
  // Navigation
  navigationBackground: string;
  navigationTextColor: string;
  navigationActiveBackground: string;
  navigationActiveTextColor: string;
  navigationHoverBackground: string;
  navigationBorderColor: string;
  
  // Buttons
  primaryButtonBackground: string;
  primaryButtonTextColor: string;
  primaryButtonHoverBackground: string;
  secondaryButtonBackground: string;
  secondaryButtonTextColor: string;
  secondaryButtonBorderColor: string;
  
  // General Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  
  // Text Colors
  titleColor: string;
  subtitleColor: string;
  bodyTextColor: string;
  mutedTextColor: string;
  
  // Status Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  
  // Layout
  sidebarWidth: string;
  contentPadding: string;
  borderRadius: string;
  boxShadow: string;
  
  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  
  // Advanced
  logoPosition: 'left' | 'center' | 'right';
  compactMode: boolean;
  darkMode: boolean;
  customCss: string;
}

const defaultTheme: AdminThemeSettings = {
  // Navigation
  navigationBackground: '#146443',
  navigationTextColor: '#ffffff',
  navigationActiveBackground: '#1a7f5a',
  navigationActiveTextColor: '#ffffff',
  navigationHoverBackground: '#0f5537',
  navigationBorderColor: '#0f4630',
  
  // Buttons
  primaryButtonBackground: '#146443',
  primaryButtonTextColor: '#ffffff',
  primaryButtonHoverBackground: '#1a7f5a',
  secondaryButtonBackground: '#ffffff',
  secondaryButtonTextColor: '#374151',
  secondaryButtonBorderColor: '#d1d5db',
  
  // General Colors
  primaryColor: '#146443',
  secondaryColor: '#059669',
  backgroundColor: '#f9fafb',
  surfaceColor: '#ffffff',
  borderColor: '#e5e7eb',
  
  // Text Colors
  titleColor: '#111827',
  subtitleColor: '#6b7280',
  bodyTextColor: '#374151',
  mutedTextColor: '#9ca3af',
  
  // Status Colors
  successColor: '#10b981',
  warningColor: '#f59e0b',
  errorColor: '#ef4444',
  infoColor: '#3b82f6',
  
  // Layout
  sidebarWidth: '16rem',
  contentPadding: '1.5rem',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  
  // Typography
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: '1.5',
  
  // Advanced
  logoPosition: 'left',
  compactMode: false,
  darkMode: false,
  customCss: ''
};

interface AdminThemeContextType {
  theme: AdminThemeSettings;
  updateTheme: (updates: Partial<AdminThemeSettings>) => void;
  resetTheme: () => void;
  saveTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
  applyCSSVariables: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
}

interface AdminThemeProviderProps {
  children: ReactNode;
}

export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const [theme, setTheme] = useState<AdminThemeSettings>(defaultTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    applyCSSVariables();
  }, [theme]);

  const updateTheme = (updates: Partial<AdminThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem('admin-theme-settings');
  };

  const saveTheme = async () => {
    try {
      localStorage.setItem('admin-theme-settings', JSON.stringify(theme));
      
      // In production, this would make an API call
      await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme)
      });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const loadTheme = async () => {
    try {
      // Load from localStorage first
      const saved = localStorage.getItem('admin-theme-settings');
      if (saved) {
        const savedTheme = JSON.parse(saved);
        setTheme({ ...defaultTheme, ...savedTheme });
      }

      // In production, this would load from API
      // const response = await fetch('/api/admin/theme');
      // if (response.ok) {
      //   const serverTheme = await response.json();
      //   setTheme({ ...defaultTheme, ...serverTheme });
      // }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const applyCSSVariables = () => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--admin-nav-bg', theme.navigationBackground);
    root.style.setProperty('--admin-nav-text', theme.navigationTextColor);
    root.style.setProperty('--admin-nav-active-bg', theme.navigationActiveBackground);
    root.style.setProperty('--admin-nav-active-text', theme.navigationActiveTextColor);
    root.style.setProperty('--admin-nav-hover-bg', theme.navigationHoverBackground);
    root.style.setProperty('--admin-nav-border', theme.navigationBorderColor);
    
    root.style.setProperty('--admin-btn-primary-bg', theme.primaryButtonBackground);
    root.style.setProperty('--admin-btn-primary-text', theme.primaryButtonTextColor);
    root.style.setProperty('--admin-btn-primary-hover', theme.primaryButtonHoverBackground);
    root.style.setProperty('--admin-btn-secondary-bg', theme.secondaryButtonBackground);
    root.style.setProperty('--admin-btn-secondary-text', theme.secondaryButtonTextColor);
    root.style.setProperty('--admin-btn-secondary-border', theme.secondaryButtonBorderColor);
    
    root.style.setProperty('--admin-primary', theme.primaryColor);
    root.style.setProperty('--admin-secondary', theme.secondaryColor);
    root.style.setProperty('--admin-bg', theme.backgroundColor);
    root.style.setProperty('--admin-surface', theme.surfaceColor);
    root.style.setProperty('--admin-border', theme.borderColor);
    
    root.style.setProperty('--admin-title', theme.titleColor);
    root.style.setProperty('--admin-subtitle', theme.subtitleColor);
    root.style.setProperty('--admin-body-text', theme.bodyTextColor);
    root.style.setProperty('--admin-muted-text', theme.mutedTextColor);
    
    root.style.setProperty('--admin-success', theme.successColor);
    root.style.setProperty('--admin-warning', theme.warningColor);
    root.style.setProperty('--admin-error', theme.errorColor);
    root.style.setProperty('--admin-info', theme.infoColor);
    
    root.style.setProperty('--admin-sidebar-width', theme.sidebarWidth);
    root.style.setProperty('--admin-content-padding', theme.contentPadding);
    root.style.setProperty('--admin-border-radius', theme.borderRadius);
    root.style.setProperty('--admin-box-shadow', theme.boxShadow);
    
    root.style.setProperty('--admin-font-family', theme.fontFamily);
    root.style.setProperty('--admin-font-size', theme.fontSize);
    root.style.setProperty('--admin-font-weight', theme.fontWeight);
    root.style.setProperty('--admin-line-height', theme.lineHeight);

    // Apply custom CSS if provided
    if (theme.customCss) {
      let customStyleElement = document.getElementById('admin-custom-css');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'admin-custom-css';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = theme.customCss;
    }

    // Apply dark mode class
    if (theme.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply compact mode
    if (theme.compactMode) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
  };

  return (
    <AdminThemeContext.Provider value={{
      theme,
      updateTheme,
      resetTheme,
      saveTheme,
      loadTheme,
      applyCSSVariables
    }}>
      {children}
    </AdminThemeContext.Provider>
  );
}