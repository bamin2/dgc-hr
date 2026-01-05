import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { format as dateFnsFormat } from 'date-fns';
import { CompanySettings, companySettings as defaultSettings, currencies } from '@/data/settings';

interface CompanySettingsContextType {
  settings: CompanySettings;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  formatDate: (date: Date | string) => string;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'company-settings';

// Convert hex color to HSL values
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Apply brand color to CSS custom properties
function applyBrandColor(hexColor: string) {
  const hsl = hexToHSL(hexColor);
  const hslValue = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
  
  document.documentElement.style.setProperty('--primary', hslValue);
  document.documentElement.style.setProperty('--ring', hslValue);
  document.documentElement.style.setProperty('--sidebar-primary', hslValue);
  document.documentElement.style.setProperty('--sidebar-ring', hslValue);
}

export function CompanySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load company settings from storage:', e);
    }
    return defaultSettings;
  });

  // Apply brand color on mount and when it changes
  useEffect(() => {
    if (settings.branding.primaryColor) {
      applyBrandColor(settings.branding.primaryColor);
    }
  }, [settings.branding.primaryColor]);

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save company settings to storage:', e);
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<CompanySettings>) => {
    setSettings(prev => {
      // Deep merge for nested objects
      const merged = { ...prev };
      
      Object.keys(newSettings).forEach(key => {
        const typedKey = key as keyof CompanySettings;
        const value = newSettings[typedKey];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          (merged as any)[typedKey] = { ...(prev as any)[typedKey], ...value };
        } else if (value !== undefined) {
          (merged as any)[typedKey] = value;
        }
      });
      
      return merged;
    });
  }, []);

  // Date formatting based on selected format
  const formatDate = useCallback((date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const format = settings.branding.dateFormat;
    
    // Map format strings to date-fns format
    const formatMap: Record<string, string> = {
      'MM/DD/YYYY': 'MM/dd/yyyy',
      'DD/MM/YYYY': 'dd/MM/yyyy',
      'YYYY-MM-DD': 'yyyy-MM-dd',
    };
    
    return dateFnsFormat(d, formatMap[format] || 'MM/dd/yyyy');
  }, [settings.branding.dateFormat]);

  // Currency formatting based on selected currency
  const formatCurrency = useCallback((amount: number) => {
    const currencyInfo = currencies.find(c => c.code === settings.branding.currency);
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.branding.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [settings.branding.currency]);

  const getCurrencySymbol = useCallback(() => {
    const currencyInfo = currencies.find(c => c.code === settings.branding.currency);
    return currencyInfo?.symbol || '$';
  }, [settings.branding.currency]);

  return (
    <CompanySettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        formatDate, 
        formatCurrency,
        getCurrencySymbol 
      }}
    >
      {children}
    </CompanySettingsContext.Provider>
  );
}

export function useCompanySettings() {
  const context = useContext(CompanySettingsContext);
  if (context === undefined) {
    throw new Error('useCompanySettings must be used within a CompanySettingsProvider');
  }
  return context;
}
