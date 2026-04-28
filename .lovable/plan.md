# Tune React Query Caching for HR Workload

## Why this is a good idea

You're right — 30s global staleTime is tuned for real-time apps (chat, trading), not HR. In this app:
- Employees, departments, leave types, work locations, payslip templates rarely change in a session
- Navigating between pages currently re-fires queries you just fetched 31s ago
- The infrastructure is already in place: `src/lib/queryOptions.ts` defines `referenceData` (10m), `configData` (5m), `userData` (2m), `liveData` (30s) — but many hooks never opted in and inherit the global 30s default

The fix is two-fold: raise the global floor, and explicitly tag the slow-moving hooks with the right preset.

## Changes

### 1. Raise the global default in `src/App.tsx`

```ts
defaultOptions: {
  queries: {
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 1000 * 60,        // 30s -> 60s (new floor)
    gcTime: 1000 * 60 * 10,      // 5m -> 10m (keep cache around longer)
  },
},
```

This alone makes navigation feel instantly snappier for any hook without an explicit override.

### 2. Tag slow-moving hooks with `referenceData` preset (10 min)

Data that essentially never changes mid-session — apply `...queryPresets.referenceData`:

- `useWorkLocations.ts`
- `usePublicHolidays.ts`
- `usePayslipTemplates.ts`
- `useOfferLetterTemplates.ts`
- `useSmartTags.ts`
- `useNotificationPreferences.ts`
- `useBusinessTripDestinations.ts` / `useBusinessTripSettings.ts`
- `useDocumentTemplates.ts` (verify not already set)
- `useBanks.ts` (verify)
- `useAllowanceTemplates.ts` / `useDeductionTemplates.ts` (verify)
- `useCompanySettingsDb.ts` — company settings (5–10 min is fine)

### 3. Tag config-ish hooks with `configData` preset (5 min)

Data that changes occasionally but not within typical task flows:

- `usePositionsManagement.ts`
- `useDepartmentsManagement.ts`
- `useLeaveTypes.ts` (already done — verify all variants)
- `useEmailTemplates.ts`
- `useDashboardCardVisibility.ts`
- `useUserPreferences.ts`

### 4. Tag operational hooks with `userData` preset (2 min)

Lists users actively work with — they should still feel fresh but don't need 30s re-fetches:

- `usePayrollRuns.ts` / `usePayrollRunsV2.ts`
- `usePayrollRunEmployees.ts` / `usePayrollRunAdjustments.ts`
- `useLoans.ts` / `useLoanInstallmentsDueForPayroll.ts`
- `useOnboarding.ts` / `useOffboarding.ts`
- `useOffers.ts`
- `useMyPayslips.ts` / `useMyHRLetters.ts` / `useMyDocuments.ts`
- `usePayslipDocuments.ts`
- `useSalaryHistory.ts`
- `useTeamMembers.ts`
- `useProjects.ts` (already 2m — leave)

### 5. Leave `liveData` (30s) for genuinely time-sensitive hooks

Keep current short staleTimes — these are correct as-is:

- `usePendingApprovalsCount.ts` (30s + 60s refetch interval)
- `useNotifications.ts` (1 min)
- Clock-in/out current-state query in `useClockInOut.ts`
- `useDashboardMetrics.ts` if it shows "today's" numbers

## Behavior after the change

- Global floor: 60s (anything not opted in)
- Reference data (work locations, templates, holidays): cached 10 min — feels instant on revisit
- Config data (departments, positions, leave types, settings): cached 5 min
- Operational lists (payroll runs, loans, onboarding): cached 2 min
- Live data (approvals count, notifications): unchanged (30s–1m)
- Mutations still invalidate via `queryClient.invalidateQueries(...)` so edits show up immediately — staleTime only affects background refetches, not user actions

## Risk / mitigation

- **Risk**: Stale data shown for up to N minutes if another user edits a record. **Mitigation**: All mutation hooks already call `invalidateQueries`, so the editing user sees their own changes immediately. Cross-user staleness already exists today and isn't materially worse at 5 min vs 30s for reference data.
- **Risk**: A hook tagged as `referenceData` is actually volatile. **Mitigation**: The list above only includes hooks for tables that don't change during a working session (templates, locations, holidays). Operational data stays at 2 min.

## Files touched (estimated)

- `src/App.tsx` (1 line change)
- ~15–20 hook files in `src/hooks/` (one-line `...queryPresets.X` insertion each)

No schema changes, no behavioral changes to mutations, no UI changes.
