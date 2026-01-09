# Lib Directory

This directory contains shared utilities, constants, and helper functions used across the application.

## Purpose

- **Centralize common logic** to avoid duplication
- **Provide consistent APIs** for common operations
- **Enable easy testing** of utility functions

## Structure

```
src/lib/
├── queryKeys.ts        # React Query key management
├── dateUtils.ts        # Date formatting and calculations
├── utils.ts            # General utilities (cn, etc.)
├── dashboard/          # Dashboard-specific utilities
│   ├── utils.ts        # Shared dashboard helpers
│   └── __tests__/      # Unit tests
└── __tests__/          # Unit tests for lib utilities
```

## Key Files

### `queryKeys.ts`
Centralized React Query key factory for consistent cache management.

```typescript
import { queryKeys } from '@/lib/queryKeys';

// Use in queries
useQuery({
  queryKey: queryKeys.employees.list(),
  queryFn: fetchEmployees,
});

// Use for invalidation
queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
```

**Key Patterns:**
- `queryKeys.{domain}.all` - Base key for all queries in domain
- `queryKeys.{domain}.list(filters?)` - List queries with optional filters
- `queryKeys.{domain}.detail(id)` - Single item by ID
- `queryKeys.{domain}.{custom}(params)` - Domain-specific queries

### `dateUtils.ts`
Comprehensive date utilities for consistent date handling.

**Date String Helpers:**
```typescript
getTodayString()              // "2024-06-15"
getFirstDayOfCurrentMonth()   // "2024-06-01"
getLastDayOfCurrentMonth()    // "2024-06-30"
```

**Formatting:**
```typescript
formatDisplayDate(date)    // "Jun 15, 2024"
formatShortDate(date)      // "Jun 15"
formatLongDate(date)       // "June 15, 2024"
formatDateTime(date)       // "Jun 15, 2024 3:30 PM"
formatTime(date)           // "3:30 PM"
formatRelativeDate(date)   // "Today" | "Tomorrow" | "Jun 20"
formatMonthYear(date)      // "June 2024"
formatISODate(date)        // "2024-06-15"
```

**Calculations:**
```typescript
calculateNextPayrollDate(dayOfMonth)  // Next payroll date
getPayrollPeriod(date?)               // { start, end }
getDateRangeMonthsBack(months)        // { start, end }
getCurrentWeekRange()                 // { start, end }
getNextNDaysRange(days)               // { start, end }
```

**Comparisons:**
```typescript
isDateInRange(date, start, end)  // boolean
areSameDay(date1, date2)         // boolean
getDaysBetween(start, end)       // number
```

**Parsing:**
```typescript
safeParseDate(dateString)              // Date | null
parseDateOrDefault(dateString, default) // Date
```

### `dashboard/utils.ts`
Dashboard-specific utilities shared across dashboard hooks.

```typescript
import { 
  calculatePercentChange,
  formatEmployeeName,
  calculateOutstandingBalance,
} from '@/lib/dashboard/utils';

// Calculate month-over-month change
const change = calculatePercentChange(currentValue, previousValue);

// Format employee display name
const name = formatEmployeeName(firstName, lastName);

// Calculate loan outstanding balance
const balance = calculateOutstandingBalance(installments);
```

## Conventions

### Function Naming
- Use camelCase for all functions
- Prefix with action verb: `get`, `calculate`, `format`, `parse`, `is`
- Be descriptive: `calculateNextPayrollDate` not `nextPayroll`

### Parameters
- Accept both `Date` and `string` where sensible
- Handle `null`/`undefined` gracefully (return empty string or null)
- Use TypeScript overloads if return types differ

### Return Values
- Date strings should be ISO format (`YYYY-MM-DD`)
- Formatted dates should be human-readable
- Return empty string `''` for null/undefined display values

### Testing
- All utility functions should have unit tests
- Tests live in `__tests__/` subdirectory
- Use `vitest` for testing framework
- Mock dates with `vi.useFakeTimers()`

## Adding New Utilities

1. **Determine location:**
   - General purpose → `lib/` root
   - Domain-specific → `lib/{domain}/`

2. **Add JSDoc comments:**
   ```typescript
   /**
    * Calculate the next payroll date based on configured day of month
    * @param payrollDayOfMonth - Day of month when payroll runs (1-31)
    * @returns ISO date string of next payroll date
    */
   export function calculateNextPayrollDate(payrollDayOfMonth: number): string
   ```

3. **Write tests first (TDD recommended)**

4. **Export from file** (no barrel exports)
