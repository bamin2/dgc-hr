/**
 * FX Rate Management Hooks
 * CRUD operations for currency exchange rates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FxRate {
  id: string;
  base_currency_code: string;
  quote_currency_code: string;
  rate: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateFxRateInput {
  quote_currency_code: string;
  rate: number;
  effective_date: string;
  base_currency_code?: string;
}

export interface UpdateFxRateInput {
  id: string;
  rate?: number;
  effective_date?: string;
}

/**
 * Fetch all FX rates
 */
export function useFxRates() {
  return useQuery({
    queryKey: ['fx-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fx_rates')
        .select('*')
        .order('effective_date', { ascending: false });

      if (error) throw error;
      return data as FxRate[];
    },
  });
}

/**
 * Fetch the most recent FX rate for a specific currency pair
 */
export function useGetFxRate(quoteCurrency: string, asOfDate?: Date) {
  const dateStr = asOfDate 
    ? asOfDate.toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['fx-rate', quoteCurrency, dateStr],
    queryFn: async () => {
      if (!quoteCurrency || quoteCurrency === 'BHD') {
        // No conversion needed for base currency
        return { rate: 1, effectiveDate: dateStr };
      }

      const { data, error } = await supabase
        .from('fx_rates')
        .select('rate, effective_date')
        .eq('quote_currency_code', quoteCurrency)
        .eq('base_currency_code', 'BHD')
        .lte('effective_date', dateStr)
        .order('effective_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        return { rate: null, effectiveDate: null };
      }

      return { 
        rate: Number(data.rate), 
        effectiveDate: data.effective_date 
      };
    },
    enabled: !!quoteCurrency,
  });
}

/**
 * Get FX rates for multiple currencies at once
 */
export function useFxRatesForCurrencies(currencies: string[], asOfDate?: Date) {
  const dateStr = asOfDate 
    ? asOfDate.toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['fx-rates-multi', currencies.sort().join(','), dateStr],
    queryFn: async () => {
      // Filter out base currency
      const quoteCurrencies = currencies.filter(c => c && c !== 'BHD');
      
      if (quoteCurrencies.length === 0) {
        return new Map<string, { rate: number; effectiveDate: string }>();
      }

      const { data, error } = await supabase
        .from('fx_rates')
        .select('quote_currency_code, rate, effective_date')
        .eq('base_currency_code', 'BHD')
        .in('quote_currency_code', quoteCurrencies)
        .lte('effective_date', dateStr)
        .order('effective_date', { ascending: false });

      if (error) throw error;

      // Build a map with the most recent rate for each currency
      const rateMap = new Map<string, { rate: number; effectiveDate: string }>();
      
      // BHD to BHD is always 1
      rateMap.set('BHD', { rate: 1, effectiveDate: dateStr });

      data?.forEach(row => {
        if (!rateMap.has(row.quote_currency_code)) {
          rateMap.set(row.quote_currency_code, {
            rate: Number(row.rate),
            effectiveDate: row.effective_date,
          });
        }
      });

      return rateMap;
    },
    enabled: currencies.length > 0,
  });
}

/**
 * Create a new FX rate
 */
export function useCreateFxRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFxRateInput) => {
      const { data, error } = await supabase
        .from('fx_rates')
        .insert({
          base_currency_code: input.base_currency_code || 'BHD',
          quote_currency_code: input.quote_currency_code,
          rate: input.rate,
          effective_date: input.effective_date,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fx-rates'] });
      queryClient.invalidateQueries({ queryKey: ['fx-rate'] });
      queryClient.invalidateQueries({ queryKey: ['fx-rates-multi'] });
      toast.success('FX rate added successfully');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('A rate for this currency and date already exists');
      } else {
        toast.error(`Failed to add FX rate: ${error.message}`);
      }
    },
  });
}

/**
 * Update an existing FX rate
 */
export function useUpdateFxRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateFxRateInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('fx_rates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fx-rates'] });
      queryClient.invalidateQueries({ queryKey: ['fx-rate'] });
      queryClient.invalidateQueries({ queryKey: ['fx-rates-multi'] });
      toast.success('FX rate updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update FX rate: ${error.message}`);
    },
  });
}

/**
 * Delete an FX rate
 */
export function useDeleteFxRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fx_rates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fx-rates'] });
      queryClient.invalidateQueries({ queryKey: ['fx-rate'] });
      queryClient.invalidateQueries({ queryKey: ['fx-rates-multi'] });
      toast.success('FX rate deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete FX rate: ${error.message}`);
    },
  });
}

/**
 * Convert an amount from one currency to the base currency (BHD)
 */
export function convertToBaseCurrency(
  amount: number,
  fromCurrency: string,
  fxRateMap: Map<string, { rate: number; effectiveDate: string }>
): { convertedAmount: number; rate: number; effectiveDate: string } | null {
  if (fromCurrency === 'BHD') {
    return { convertedAmount: amount, rate: 1, effectiveDate: new Date().toISOString().split('T')[0] };
  }

  const rateInfo = fxRateMap.get(fromCurrency);
  if (!rateInfo || rateInfo.rate === null) {
    return null;
  }

  // Rate is how many of the quote currency equals 1 base currency
  // So to convert to base: amount / rate
  const convertedAmount = amount / rateInfo.rate;
  
  return {
    convertedAmount,
    rate: rateInfo.rate,
    effectiveDate: rateInfo.effectiveDate,
  };
}

/**
 * Get list of currencies that are missing FX rates
 */
export function getMissingRateCurrencies(
  currencies: string[],
  fxRateMap: Map<string, { rate: number; effectiveDate: string }>
): string[] {
  return currencies.filter(currency => {
    if (currency === 'BHD') return false;
    const rateInfo = fxRateMap.get(currency);
    return !rateInfo || rateInfo.rate === null;
  });
}
