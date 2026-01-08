import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { format as dateFnsFormat } from 'date-fns';
import { CompanySettings, companySettings as defaultSettings, currencies } from '@/data/settings';
import { useCompanySettingsDb } from '@/hooks/useCompanySettingsDb';

interface CompanySettingsContextType {
  settings: CompanySettings;
  updateSettings: (newSettings: Partial<CompanySettings>) => Promise<void>;
  formatDate: (date: Date | string) => string;
  formatCurrency: (amount: number) => string;
  formatCurrencyWithCode: (amount: number, currencyCode: string) => string;
  getCurrencySymbol: () => string;
  isLoading: boolean;
  isSaving: boolean;
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

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
  if (!hexColor || hexColor.length < 4) return;
  
  try {
    const hsl = hexToHSL(hexColor);
    const hslValue = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
    
    document.documentElement.style.setProperty('--primary', hslValue);
    document.documentElement.style.setProperty('--ring', hslValue);
    document.documentElement.style.setProperty('--sidebar-primary', hslValue);
    document.documentElement.style.setProperty('--sidebar-ring', hslValue);
  } catch (e) {
    console.error('Failed to apply brand color:', e);
  }
}

export function CompanySettingsProvider({ children }: { children: ReactNode }) {
  const { 
    settings: dbSettings, 
    isLoading, 
    updateSettings: updateDbSettings,
    isSaving 
  } = useCompanySettingsDb();

  // Use database settings if available, otherwise default
  const settings = dbSettings || defaultSettings;

  // Apply brand color when settings change
  React.useEffect(() => {
    if (settings.branding.primaryColor) {
      applyBrandColor(settings.branding.primaryColor);
    }
  }, [settings.branding.primaryColor]);

  const updateSettings = useCallback(async (newSettings: Partial<CompanySettings>) => {
    await updateDbSettings(newSettings);
  }, [updateDbSettings]);

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

  // Format currency with a specific currency code (for work location currencies)
  const formatCurrencyWithCode = useCallback((amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  return (
    <CompanySettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        formatDate, 
        formatCurrency,
        formatCurrencyWithCode,
        getCurrencySymbol,
        isLoading,
        isSaving
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
