## Goal

Replace the greeting block in `src/components/dashboard/Header.tsx` (lines 67–73) with a time-of-day greeting and a role-aware subtitle. No layout/sizing changes; no other elements touched.

## Findings from inspection

- `useRole()` exposes `currentUser.role: AppRole` where `AppRole = 'employee' | 'manager' | 'hr' | 'admin'`. Privileged roles for the subtitle: `manager`, `hr`, `admin`.
- `usePendingApprovalsCount()` returns a React Query result; `data` is a `number` (default 0).
- `usePersonalDashboard()` returns `data.upcomingTimeOff` — already filtered to approved & future, sorted ascending by `startDate`. The first entry is the next approved leave; field used: `startDate` (ISO string).

## Changes (single file: `src/components/dashboard/Header.tsx`)

### 1. Add two imports (after existing hook imports, lines 13–20)
```ts
import { usePendingApprovalsCount } from "@/hooks/usePendingApprovalsCount";
import { usePersonalDashboard } from "@/hooks/usePersonalDashboard";
```

### 2. Compute greeting + subtitle (insert after line 55, after `initials`)
```ts
const firstName = displayName.split(' ')[0];

const greeting = (() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
})();

const { data: pendingApprovalsCount = 0 } = usePendingApprovalsCount();
const { data: personalDashboard } = usePersonalDashboard();

const canApprove = ['manager', 'hr', 'admin'].includes(currentUser.role);
const nextLeaveStart = personalDashboard?.upcomingTimeOff?.[0]?.startDate;

let subtitle: string | null = null;
if (canApprove && pendingApprovalsCount > 0) {
  subtitle = `${pendingApprovalsCount} approval${pendingApprovalsCount === 1 ? '' : 's'} waiting for you`;
} else if (nextLeaveStart) {
  const formatted = new Date(nextLeaveStart).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  subtitle = `Your next leave starts ${formatted}`;
}
```

### 3. Replace greeting block (lines 67–73)
```tsx
<div>
  <h1 className="text-base sm:text-xl font-semibold text-foreground">
    {greeting}, {firstName}
  </h1>
  {subtitle && (
    <p className="hidden sm:block text-sm text-muted-foreground">
      {subtitle}
    </p>
  )}
</div>
```

Same wrapper, same `<h1>` classes, same subtitle classes, same responsive `hidden sm:block`. No layout/sizing changes. The subtitle simply renders nothing (no extra DOM beyond the conditional `<p>`) when neither condition is met.

## Out of scope
- No edits to `RoleContext.tsx` or `usePersonalDashboard.ts` (they already expose what's needed).
- No styling changes elsewhere in the header.
