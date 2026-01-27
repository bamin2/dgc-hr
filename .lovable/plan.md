
# Fix: Intermittent "Profile Not Found" Error

## Problem Summary
The app intermittently shows "Profile Not Found: Unable to load your profile" because of a **race condition** between session loading and profile fetching in the authentication flow.

## Root Cause Analysis

### The Authentication Flow Has a Timing Gap

```text
Timeline of Events:
─────────────────────────────────────────────────────────────────────
1. App loads, AuthProvider mounts
2. getSession() completes → loading = false, user is set
3. Profile fetch starts (deferred with setTimeout(0))
4. Component renders (profile is still null!)     ← PROBLEM
5. useMyEmployee uses profile?.employee_id → returns ''
6. useEmployee('' ) runs (enabled: !!'' is TRUE for empty string!)
7. Query returns null → "Profile Not Found" shown
8. Profile fetch completes → profile.employee_id available
9. But component already shows error state
─────────────────────────────────────────────────────────────────────
```

### Specific Code Issues

**Issue 1: `loading` state doesn't include profile loading**

In `AuthContext.tsx`, `loading` is set to `false` immediately after `getSession()` completes (line 99), but `fetchProfile()` is called asynchronously and may not have finished yet.

**Issue 2: Empty string is truthy in JavaScript**

In `useMyEmployee.ts`:
```tsx
const employeeId = profile?.employee_id;
return useEmployee(employeeId || '');  // '' is passed when profile is null
```

In `useEmployees.ts`:
```tsx
export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id!),
    queryFn: () => fetchEmployee(id!),
    enabled: !!id,  // !!'' === false, but id is '' not undefined
  });
}
```

Wait - `!!''` is actually `false`, so the query should be disabled. Let me re-check... Actually `employeeId || ''` evaluates to `''` when `profile?.employee_id` is `null`/`undefined`, and `!!''` is `false`. So the query IS disabled.

**Re-analysis: The real issue is in the loading state check**

Looking at `MobileProfileHub.tsx` line 29:
```tsx
if (employeeLoading && !employee) {
  return <Skeleton />
}
```

When `profile` is null:
- `employeeId` = `undefined` (from `profile?.employee_id`)
- `useEmployee(undefined || '')` → `useEmployee('')`
- `enabled: !!''` → `false` (query is disabled)
- `isLoading` = `false` (disabled queries aren't loading)
- `employee` = `undefined`

So the condition `employeeLoading && !employee` is `false && true` = `false` → shows error!

## Solution

The fix needs to account for the profile loading state in addition to the employee query loading state.

### Changes Required

**File 1: `src/hooks/useMyEmployee.ts`**

Return additional context about whether profile is still loading, so consumers can show appropriate loading states:

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useEmployee } from '@/hooks/useEmployees';

export function useMyEmployee() {
  const { profile, loading: authLoading } = useAuth();
  const employeeId = profile?.employee_id;
  
  const employeeQuery = useEmployee(employeeId || undefined);
  
  return {
    ...employeeQuery,
    // Consider auth loading as part of overall loading state
    isLoading: authLoading || employeeQuery.isLoading,
    // Profile may be loaded but employee_id not linked yet
    isProfileLoading: authLoading,
  };
}
```

**File 2: `src/hooks/useEmployees.ts`**

Change the parameter type to accept `undefined` properly and ensure query is disabled when id is falsy:

```tsx
export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id || 'none'),
    queryFn: () => fetchEmployee(id!),
    enabled: !!id && id.length > 0,  // More explicit check
  });
}
```

**File 3: `src/components/myprofile/mobile/MobileProfileHub.tsx`**

Update the loading check to include auth loading state:

```tsx
export function MobileProfileHub() {
  const { data: employee, isLoading: employeeLoading, isProfileLoading } = useMyEmployee();
  // ...
  
  // Show skeleton while auth/profile is loading OR employee query is loading
  if ((employeeLoading || isProfileLoading) && !employee) {
    return (/* skeleton */);
  }
  // ...
}
```

**File 4: `src/pages/MyProfile.tsx`**

Same pattern - use the enhanced loading state:

```tsx
const { data: employee, isLoading, error, isProfileLoading } = useMyEmployee();
// ...

if (isLoading || isProfileLoading || settingsLoading) {
  return <MyProfileSkeleton />;
}
```

## Technical Details

### Why This Happens Intermittently

The race condition depends on:
- Network latency for profile/employee fetches
- Browser performance
- React Query cache state
- Tab visibility (background tabs may have stale data)

On fast connections or when data is cached, profile loads quickly and the issue doesn't occur. On slower connections or first loads, the timing gap is more noticeable.

### Alternative Approaches Considered

1. **Add profile loading state to AuthContext** - More invasive change, affects all consumers
2. **Use React Suspense** - Requires larger architectural changes
3. **Wait for profile in getSession handler** - Would block entire app

The chosen approach is minimal and targeted to the affected components.

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useMyEmployee.ts` | Return `isProfileLoading` from auth context |
| `src/hooks/useEmployees.ts` | Add explicit length check for id parameter |
| `src/components/myprofile/mobile/MobileProfileHub.tsx` | Check `isProfileLoading` in loading condition |
| `src/pages/MyProfile.tsx` | Check `isProfileLoading` in loading condition |

## Testing

After the fix:
1. Clear browser cache and reload - should show loading skeleton until profile loads
2. Refresh page multiple times rapidly - should never flash "Profile Not Found"
3. Navigate to My Profile from different pages - should consistently load
4. Test on slow network (DevTools throttling) - should show skeleton longer, not error
