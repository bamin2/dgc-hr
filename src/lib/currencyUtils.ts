import { currencies } from '@/data/settings';

export function formatAmount(
  amount: number, 
  currencyCode: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbolFromCode(currencyCode: string): string {
  const currency = currencies.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}
