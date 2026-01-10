/**
 * Currency View Toggle Component
 * Switch between Local Currency and Reporting Currency (BHD) views
 */

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Globe, Building2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type CurrencyViewMode = 'local' | 'reporting';

interface CurrencyViewToggleProps {
  mode: CurrencyViewMode;
  onModeChange: (mode: CurrencyViewMode) => void;
  reportingCurrency?: string;
  missingRateCurrencies?: string[];
  fxRateInfo?: {
    currency: string;
    rate: number;
    effectiveDate: string;
  } | null;
  disabled?: boolean;
}

export function CurrencyViewToggle({
  mode,
  onModeChange,
  reportingCurrency = 'BHD',
  missingRateCurrencies = [],
  fxRateInfo,
  disabled = false,
}: CurrencyViewToggleProps) {
  const hasMissingRates = missingRateCurrencies.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <ToggleGroup 
          type="single" 
          value={mode} 
          onValueChange={(value) => value && onModeChange(value as CurrencyViewMode)}
          disabled={disabled}
        >
          <ToggleGroupItem 
            value="local" 
            aria-label="View in local currencies"
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            Local Currency
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="reporting" 
            aria-label="View in reporting currency"
            className="gap-2"
            disabled={hasMissingRates}
          >
            <Building2 className="h-4 w-4" />
            Reporting ({reportingCurrency})
          </ToggleGroupItem>
        </ToggleGroup>

        {mode === 'reporting' && fxRateInfo && (
          <Badge variant="secondary" className="text-xs font-normal">
            1 {reportingCurrency} = {fxRateInfo.rate.toFixed(2)} {fxRateInfo.currency} 
            <span className="text-muted-foreground ml-1">
              (as of {fxRateInfo.effectiveDate})
            </span>
          </Badge>
        )}
      </div>

      {hasMissingRates && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-medium">Missing Exchange Rates</AlertTitle>
          <AlertDescription className="text-xs">
            Cannot convert to {reportingCurrency}: No exchange rate configured for{' '}
            <strong>{missingRateCurrencies.join(', ')}</strong>.
            Add rates in Settings → Payroll → Exchange Rates.
          </AlertDescription>
        </Alert>
      )}

      {mode === 'local' && (
        <p className="text-xs text-muted-foreground">
          Values shown in each employee's local currency. Totals across different currencies are not combined.
        </p>
      )}

      {mode === 'reporting' && !hasMissingRates && (
        <p className="text-xs text-muted-foreground">
          All values converted to {reportingCurrency} using the most recent exchange rates for comparison.
        </p>
      )}
    </div>
  );
}
