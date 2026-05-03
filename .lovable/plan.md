# Add Loan Form Validation Refinements

## Goal
Strengthen client-side validation in the employee loan request form by chaining two additional `.refine` rules onto the existing zod schema.

## File
`src/components/loans/EmployeeRequestLoanDialog.tsx` — lines 47–58 only.

## Change
Chain two additional `.refine` calls after the existing one:

```ts
}).refine(
  (data) => {
    if (data.repayment_method === "duration") {
      return data.duration_months && data.duration_months > 0;
    }
    return data.installment_amount && data.installment_amount > 0;
  },
  {
    message: "Please provide duration or installment amount",
    path: ["duration_months"],
  }
).refine(
  (data) => {
    if (data.repayment_method !== "installment") return true;
    if (data.installment_amount == null) return true;
    return data.installment_amount <= data.principal_amount;
  },
  {
    message: "Installment cannot exceed loan amount.",
    path: ["installment_amount"],
  }
).refine(
  (data) => {
    if (data.repayment_method !== "duration") return true;
    if (data.duration_months == null) return true;
    return data.duration_months <= 60;
  },
  {
    message: "Maximum 60 months.",
    path: ["duration_months"],
  }
);
```

## Behavior
- Rule 2: Only validates when `repayment_method === 'installment'`. Errors attached to `installment_amount` field.
- Rule 3: Only validates when `repayment_method === 'duration'`. Errors attached to `duration_months` field.
- Existing rule 1 unchanged. Submission, defaults, and UI untouched.

## Files Modified
- `src/components/loans/EmployeeRequestLoanDialog.tsx`
