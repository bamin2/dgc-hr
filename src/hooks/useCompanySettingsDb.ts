import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanySettings, DashboardCardVisibility, defaultDashboardCardVisibility } from '@/data/settings';
import { Json } from '@/integrations/supabase/types';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

interface DbCompanySettings {
  id: string;
  name: string;
  legal_name: string | null;
  industry: string | null;
  company_size: string | null;
  tax_id: string | null;
  year_founded: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip_code: string | null;
  address_country: string | null;
  logo_url: string | null;
  dashboard_display_type: string | null;
  dashboard_icon_url: string | null;
  primary_color: string | null;
  timezone: string | null;
  date_format: string | null;
  currency: string | null;
  weekend_days: number[] | null;
  payroll_day_of_month: number | null;
  dashboard_card_visibility: Json | null;
  created_at: string;
  updated_at: string;
}

// Transform database row to TypeScript interface
function transformFromDb(row: DbCompanySettings): CompanySettings {
  return {
    id: row.id,
    name: row.name || '',
    legalName: row.legal_name || '',
    industry: row.industry || '',
    companySize: row.company_size || '',
    taxId: row.tax_id || '',
    yearFounded: row.year_founded || '',
    email: row.email || '',
    phone: row.phone || '',
    website: row.website || '',
    address: {
      street: row.address_street || '',
      city: row.address_city || '',
      state: row.address_state || '',
      zipCode: row.address_zip_code || '',
      country: row.address_country || '',
    },
    branding: {
      logoUrl: row.logo_url || '',
      dashboardDisplayType: (row.dashboard_display_type as 'logo' | 'icon') || 'logo',
      dashboardIconUrl: row.dashboard_icon_url || '',
      primaryColor: row.primary_color || '#804EEC',
      timezone: row.timezone || 'America/Los_Angeles',
      dateFormat: row.date_format || 'MM/DD/YYYY',
      currency: row.currency || 'USD',
      weekendDays: row.weekend_days || [5, 6],
    },
    payrollDayOfMonth: row.payroll_day_of_month || 25,
    dashboardCardVisibility: row.dashboard_card_visibility 
      ? (row.dashboard_card_visibility as unknown as DashboardCardVisibility)
      : defaultDashboardCardVisibility,
  };
}

// Transform TypeScript interface to database format
function transformToDb(settings: Partial<CompanySettings>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  
  if (settings.name !== undefined) db.name = settings.name;
  if (settings.legalName !== undefined) db.legal_name = settings.legalName;
  if (settings.industry !== undefined) db.industry = settings.industry;
  if (settings.companySize !== undefined) db.company_size = settings.companySize;
  if (settings.taxId !== undefined) db.tax_id = settings.taxId;
  if (settings.yearFounded !== undefined) db.year_founded = settings.yearFounded;
  if (settings.email !== undefined) db.email = settings.email;
  if (settings.phone !== undefined) db.phone = settings.phone;
  if (settings.website !== undefined) db.website = settings.website;
  
  if (settings.address) {
    if (settings.address.street !== undefined) db.address_street = settings.address.street;
    if (settings.address.city !== undefined) db.address_city = settings.address.city;
    if (settings.address.state !== undefined) db.address_state = settings.address.state;
    if (settings.address.zipCode !== undefined) db.address_zip_code = settings.address.zipCode;
    if (settings.address.country !== undefined) db.address_country = settings.address.country;
  }
  
  if (settings.branding) {
    if (settings.branding.logoUrl !== undefined) db.logo_url = settings.branding.logoUrl;
    if (settings.branding.dashboardDisplayType !== undefined) db.dashboard_display_type = settings.branding.dashboardDisplayType;
    if (settings.branding.dashboardIconUrl !== undefined) db.dashboard_icon_url = settings.branding.dashboardIconUrl;
    if (settings.branding.primaryColor !== undefined) db.primary_color = settings.branding.primaryColor;
    if (settings.branding.timezone !== undefined) db.timezone = settings.branding.timezone;
    if (settings.branding.dateFormat !== undefined) db.date_format = settings.branding.dateFormat;
    if (settings.branding.currency !== undefined) db.currency = settings.branding.currency;
    if (settings.branding.weekendDays !== undefined) db.weekend_days = settings.branding.weekendDays;
  }

  if (settings.dashboardCardVisibility !== undefined) {
    db.dashboard_card_visibility = settings.dashboardCardVisibility;
  }

  if (settings.payrollDayOfMonth !== undefined) {
    db.payroll_day_of_month = settings.payrollDayOfMonth;
  }
  
  return db;
}

export function useCompanySettingsDb() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', SETTINGS_ID)
        .single();
      
      if (error) throw error;
      return transformFromDb(data as DbCompanySettings);
    },
  });

  const mutation = useMutation({
    mutationFn: async (settings: Partial<CompanySettings>) => {
      const dbData = transformToDb(settings);
      const { error } = await supabase
        .from('company_settings')
        .update(dbData)
        .eq('id', SETTINGS_ID);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: mutation.mutateAsync,
    isSaving: mutation.isPending,
    refetch: query.refetch,
  };
}
