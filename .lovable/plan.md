

# Fix GOSI Base Calculation Ignoring Registered Salary

## Root Cause

The discrepancy of 117 (5,850 vs 5,733) comes from the GOSI deduction calculation in the employee snapshot.

**Al Jawharah's data:**
- Base salary: 3,000
- Housing allowance: 3,300
- Gross pay: 6,300
- GOSI registered salary: **5,000**
- Riyadh location's `gosi_base_calculation`: **`basic_plus_housing`**
- Employee GOSI rate: 9%

**What happens:**
The snapshot code (line 208) sees `gosi_base_calculation === 'basic_plus_housing'` and uses `baseSalary + housingAllowance = 6,300` as the GOSI base, **completely ignoring** the `gosi_registered_salary` of 5,000.

- Current: 6,300 x 9% = **567** → net 5,733
- Expected: 5,000 x 9% = **450** → net 5,850

The `gosi_registered_salary` field exists specifically to record the salary registered with GOSI authorities, which should always take precedence when set. The `basic_plus_housing` setting should only be a fallback formula for employees who don't have a specific registered salary.

**Additional bug:** Line 211 uses `emp.gosi_registered_salary` instead of the `gosiRegisteredSalary` variable (line 160), which means pending salary changes to the GOSI registered salary would also be ignored.

## Fix

In `src/hooks/usePayrollRunEmployees.ts`, change the GOSI base calculation logic (lines 207-212):

**Before:**
```typescript
if (workLocation.gosi_base_calculation === 'basic_plus_housing') {
  gosiBase = baseSalary + housingAllowance;
} else {
  gosiBase = emp.gosi_registered_salary || baseSalary;
}
```

**After:**
```typescript
if (gosiRegisteredSalary) {
  gosiBase = gosiRegisteredSalary;
} else if (workLocation.gosi_base_calculation === 'basic_plus_housing') {
  gosiBase = baseSalary + housingAllowance;
} else {
  gosiBase = baseSalary;
}
```

This ensures:
1. If the employee has a GOSI registered salary → always use it
2. Otherwise, fall back to the location's calculation method
3. Uses the `gosiRegisteredSalary` variable (which respects pending salary changes)

After this fix, you'll need to **re-snapshot** the employees (go back to step 2 and click Continue again) for the corrected values to take effect.

## Files to modify
- `src/hooks/usePayrollRunEmployees.ts` — fix GOSI base priority logic (lines 207-212)

