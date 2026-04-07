

# Re-add Missing March 2026 Loan Installments

## Problem
Installment #3 (due 2026-03-01) was accidentally deleted from both loans:
- **Muhammad Saleem** — loan `2201691d-3c51-45d4-b8d0-d90e5840576a`, installment amount: 150
- **Omar Alraee** — loan `2e2e57a7-0c12-4082-a762-43b3da83abfb`, installment amount: 255

Both loans have installments 1, 2, 4, 5, ... but #3 is missing.

## Fix
Insert two rows into `loan_installments` using the Supabase insert tool:

```sql
INSERT INTO loan_installments (loan_id, installment_number, due_date, amount, status)
VALUES
  ('2201691d-3c51-45d4-b8d0-d90e5840576a', 3, '2026-03-01', 150, 'due'),
  ('2e2e57a7-0c12-4082-a762-43b3da83abfb', 3, '2026-03-01', 255, 'due');
```

No schema changes needed. This is a data-only operation.

## Files changed
None — database insert only.
