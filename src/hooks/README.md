# Hooks Directory

This directory contains custom React hooks for data fetching, state management, and shared logic.

## Purpose

- **Encapsulate data fetching** with React Query
- **Share stateful logic** across components
- **Separate concerns** between data and presentation

## Structure

```
src/hooks/
├── README.md
├── use-mobile.tsx          # Responsive breakpoint hook
├── use-toast.ts            # Toast notification hook
├── usePayrollWizard.ts     # Payroll wizard state management
├── employees/              # Employee-related hooks
├── dashboard/              # Dashboard data hooks
├── calendar/               # Calendar/event hooks
├── leave/                  # Leave management hooks
├── loans/                  # Loan management hooks
├── payroll/                # Payroll hooks
├── attendance/             # Attendance hooks
├── benefits/               # Benefits hooks
├── documents/              # Document hooks
├── settings/               # Settings hooks
└── ...
```

## Hook Categories

### Data Fetching Hooks
Hooks that fetch data using React Query.

```typescript
// Pattern: use{Domain}{Action}
function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: queryKeys.employees.list(filters),
    queryFn: () => fetchEmployees(filters),
  });
}

function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => fetchEmployee(id),
  });
}
```

### Mutation Hooks
Hooks that modify data.

```typescript
// Pattern: use{Action}{Domain}
function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
}
```

### State Management Hooks
Hooks that manage complex component state.

```typescript
// Pattern: use{Feature}
function usePayrollWizard(payrollRunId?: string) {
  // Encapsulates all wizard state and navigation
  return {
    currentStep,
    setCurrentStep,
    canProceed,
    goNext,
    goBack,
    // ... other state and actions
  };
}
```

### Utility Hooks
Hooks for common UI patterns.

```typescript
function useMobile() {
  // Returns true if viewport is mobile-sized
}

function useDebounce<T>(value: T, delay: number): T {
  // Returns debounced value
}
```

## Conventions

### Naming
- Prefix with `use` (React hook convention)
- Use PascalCase for domain: `useEmployees`, `useLeaveRequests`
- Action verbs for mutations: `useCreateEmployee`, `useUpdateLeave`

### Query Keys
Always use centralized query keys from `@/lib/queryKeys`:

```typescript
import { queryKeys } from '@/lib/queryKeys';

// ✅ Good
useQuery({ queryKey: queryKeys.employees.list() });

// ❌ Bad - hardcoded keys
useQuery({ queryKey: ['employees'] });
```

### File Organization
- One hook per file for complex hooks
- Related simple hooks can share a file
- Group by domain in subdirectories

```
hooks/
├── employees/
│   ├── useEmployees.ts
│   ├── useEmployee.ts
│   ├── useCreateEmployee.ts
│   └── useEmployeeFilters.ts
```

### Return Types
Define explicit return types for complex hooks:

```typescript
interface UsePayrollWizardReturn {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  canProceed: boolean;
  // ...
}

function usePayrollWizard(): UsePayrollWizardReturn {
  // ...
}
```

### Error Handling
Let React Query handle errors by default. Use `onError` callbacks for side effects:

```typescript
useMutation({
  mutationFn: createEmployee,
  onError: (error) => {
    toast.error('Failed to create employee');
    console.error(error);
  },
});
```

### Loading States
React Query provides loading states automatically:

```typescript
const { data, isLoading, error } = useEmployees();

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage />;
return <EmployeeList data={data} />;
```

## Dashboard Hooks

Special hooks for dashboard data with role-based scoping:

```
hooks/dashboard/
├── usePersonalDashboard.ts   # Current user's personal data
├── useTeamDashboard.ts       # Manager's team data
└── useAdminDashboard.ts      # Organization-wide data
```

Each dashboard hook:
- Fetches data appropriate to the user's role
- Uses centralized date utilities for date ranges
- Returns typed dashboard card data

## Best Practices

### 1. Keep Hooks Focused
Each hook should do one thing well. Split large hooks into smaller, composable ones.

### 2. Use Proper Dependencies
Ensure all reactive values are in dependency arrays:

```typescript
const callback = useCallback(() => {
  doSomething(employeeId);
}, [employeeId]); // ✅ Include all dependencies
```

### 3. Avoid Prop Drilling
If data is needed in many nested components, consider:
- React Query (data is cached and accessible anywhere)
- Context (for truly global state)

### 4. Memoize Expensive Computations
```typescript
const filteredEmployees = useMemo(
  () => employees.filter(e => e.status === 'active'),
  [employees]
);
```

### 5. Handle Edge Cases
```typescript
function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id!),
    queryFn: () => fetchEmployee(id!),
    enabled: !!id, // Don't fetch if no ID
  });
}
```

## Adding New Hooks

1. **Determine the category** (data fetching, mutation, state, utility)

2. **Choose the right location:**
   - Domain-specific → `hooks/{domain}/`
   - General utility → `hooks/` root

3. **Use query keys** from `@/lib/queryKeys`

4. **Add TypeScript types** for parameters and return values

5. **Document complex hooks** with JSDoc comments

6. **Consider testing** for hooks with complex logic
