

# Use 3 Decimal Places for BHD Currency in Payslips

## Problem
The `formatCurrency` function in both payslip edge functions hardcodes `toFixed(2)`. BHD (Bahraini Dinar) uses 3 decimal places, so amounts like `BHD 1500.000` should display with 3 decimals, not 2.

## Solution
Update `formatCurrency` in both edge functions to check the currency code and use the appropriate number of decimal places. BHD, KWD, and OMR use 3 decimals; most others use 2.

```typescript
function formatCurrency(amount: number | string | null | undefined, currency: string): string {
  const value = Number(amount) || 0;
  const decimals = ['BHD', 'KWD', 'OMR'].includes(currency) ? 3 : 2;
  return `${currency} ${value.toFixed(decimals)}`;
}
```

## Files to modify

| File | Change |
|------|--------|
| `supabase/functions/generate-payslips/index.ts` | Update `formatCurrency` to use 3 decimals for BHD/KWD/OMR |
| `supabase/functions/preview-payslip-template/index.ts` | Same change |

