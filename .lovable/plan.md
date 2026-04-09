

# Individual Deduction Line Items in Payslip Templates

## Problem
Currently, deductions are only available as aggregate totals (`GOSI_DEDUCTION`, `OTHER_DEDUCTIONS`, `LOAN_DEDUCTION`). You cannot show each deduction separately in the template — e.g., if an employee has a "Parking Fee" deduction and a "Meal Deduction", they are lumped into one `OTHER_DEDUCTIONS` amount.

Additionally, payroll adjustments (one-time deductions added in Step 3) and individual loan installments are not available at all in the template.

## Solution
Add a **DEDUCTIONS** loop array and individual tags for each deduction, plus fetch adjustments and loan installments during payslip generation.

### Template usage (in DOCX)
```text
{{#DEDUCTIONS}}
{{name}}                    {{amount}}
{{/DEDUCTIONS}}
```
This will render one row per deduction (GOSI, each `other_deduction`, each loan installment, each one-time adjustment deduction). Empty/zero deductions are excluded automatically.

Also add an **ALLOWANCES** loop for individual allowances and an **ADJUSTMENTS_EARNINGS** loop for one-time earning adjustments:
```text
{{#ALLOWANCES}}
{{name}}                    {{amount}}
{{/ALLOWANCES}}
```

### What gets included in DEDUCTIONS loop
1. GOSI deduction (if applicable and > 0)
2. Each item from `other_deductions` array (named deductions from templates)
3. Loan installments paid in this payroll run (fetched from `loan_installments` table)
4. One-time deduction adjustments (fetched from `payroll_run_adjustments` table)

### What gets included in ALLOWANCES loop
1. Housing allowance (if > 0)
2. Transportation allowance (if > 0)
3. Each item from `other_allowances` array

### What gets included in ADJUSTMENTS_EARNINGS loop
1. One-time earning adjustments from `payroll_run_adjustments`

## Files to modify

| File | Change |
|------|--------|
| `supabase/functions/generate-payslips/index.ts` | Fetch adjustments + loan installments; build `DEDUCTIONS`, `ALLOWANCES`, `ADJUSTMENTS_EARNINGS` loop arrays in tagData |
| `supabase/functions/preview-payslip-template/index.ts` | Same loop arrays for preview |
| `src/components/payroll/templates/SmartTagsTab.tsx` | Add loop tags to documentation with usage instructions |
| `src/utils/payslipTemplateGenerator.ts` | Add loop entries to `PAYSLIP_SMART_TAGS` reference |

## Technical Detail

The loop arrays will be structured as:
```typescript
DEDUCTIONS: [
  { name: "Social Insurance", amount: "BHD 50.00" },
  { name: "Parking Fee", amount: "BHD 20.00" },
  { name: "Loan Repayment", amount: "BHD 150.00" },
],
ALLOWANCES: [
  { name: "Housing", amount: "BHD 300.00" },
  { name: "Transportation", amount: "BHD 100.00" },
],
```

Docxtemplater's `{#DEDUCTIONS}...{/DEDUCTIONS}` iterates and renders `{name}` and `{amount}` from each item. Existing individual tags (`GOSI_DEDUCTION`, `OTHER_DEDUCTIONS`, etc.) remain available for backward compatibility.

