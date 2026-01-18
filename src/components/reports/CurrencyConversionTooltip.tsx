import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface CurrencyConversionTooltipProps {
  fromCurrency: string;
  rate: number;
  effectiveDate: string;
}

export function CurrencyConversionTooltip({ 
  fromCurrency, 
  rate, 
  effectiveDate 
}: CurrencyConversionTooltipProps) {
  const formattedDate = effectiveDate 
    ? format(parseISO(effectiveDate), 'MMM d, yyyy') 
    : 'N/A';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help inline ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Converted from {fromCurrency} using rate {rate.toFixed(4)} on {formattedDate}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
