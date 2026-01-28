
# Fix: Remove Mock Data Fallback That Shows "Franfer Technologies"

## Problem Summary
The Settings page intermittently shows "Franfer Technologies" (mock data) instead of real company data from the database. This happens due to a race condition where mock fallback data is used before the database query completes.

## Root Cause

### Flow That Causes the Bug:
```text
1. User navigates to /settings
2. Settings.tsx renders
3. useCompanySettings() returns:
   - isLoading: true (DB query in progress)
   - settings: defaultSettings (mock Franfer Technologies data)  ← PROBLEM
4. useState(globalSettings) captures mock data as initial state
5. DB query completes, but local state already has mock data
6. useEffect syncs... but only if condition is properly met
```

### Code Locations:

**File 1: `src/contexts/CompanySettingsContext.tsx` (line 85)**
```tsx
// This falls back to mock data when DB hasn't loaded yet
const settings = useMemo(() => dbSettings || defaultSettings, [dbSettings]);
```

**File 2: `src/data/settings.ts` (lines 146-180)**
```tsx
// Mock data that should NEVER appear in production
export const companySettings: CompanySettings = {
  name: 'Franfer Technologies',  // ← This is what you're seeing
  // ...other mock values
};
```

**File 3: `src/pages/Settings.tsx` (line 68)**
```tsx
// Captures whatever globalSettings is at first render (could be mock data)
const [companySettings, setCompanySettings] = useState<CompanySettings>(globalSettings);
```

## Solution

### Strategy: Remove Mock Data Completely

Instead of having mock "Franfer Technologies" data as a fallback, create a proper empty/placeholder settings object. The app should show loading states while data loads, never mock data.

### Changes Required

**File 1: `src/data/settings.ts`**

Replace the mock `companySettings` export with an empty placeholder that makes it obvious when real data hasn't loaded:

```tsx
// BEFORE: Mock data with "Franfer Technologies"
export const companySettings: CompanySettings = {
  id: 'company-1',
  name: 'Franfer Technologies',
  // ... mock values
};

// AFTER: Empty placeholder - should never be visible to users
export const emptyCompanySettings: CompanySettings = {
  id: '',
  name: '',
  legalName: '',
  industry: '',
  companySize: '',
  taxId: '',
  yearFounded: '',
  email: '',
  phone: '',
  website: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  branding: {
    logoUrl: '',
    documentLogoUrl: '',
    emailLogoUrl: '',
    dashboardDisplayType: 'logo',
    dashboardIconName: 'Building2',
    primaryColor: '#C6A45E',
    timezone: 'Asia/Bahrain',
    dateFormat: 'MM/DD/YYYY',
    currency: 'BHD',
    weekendDays: [5, 6],
    reportingCurrency: 'BHD',
  },
  payrollDayOfMonth: 25,
  employeeCanViewCompensation: true,
  showCompensationLineItems: false,
};
```

Also remove or comment out all the other mock exports (userPreferences, notificationSettings, securitySessions).

**File 2: `src/contexts/CompanySettingsContext.tsx`**

Update the import and fallback to use the empty settings:

```tsx
// BEFORE:
import { CompanySettings, companySettings as defaultSettings, currencies } from '@/data/settings';
const settings = useMemo(() => dbSettings || defaultSettings, [dbSettings]);

// AFTER:
import { CompanySettings, emptyCompanySettings, currencies } from '@/data/settings';
const settings = useMemo(() => dbSettings || emptyCompanySettings, [dbSettings]);
```

**File 3: `src/pages/Settings.tsx`**

Add a more robust check to prevent showing empty/placeholder data:

```tsx
// BEFORE (line 108-113):
useEffect(() => {
  if (!companyLoading && globalSettings) {
    setCompanySettings(globalSettings);
    setHasCompanySettingsLoaded(true);
  }
}, [globalSettings, companyLoading]);

// AFTER: Only sync when we have real data (non-empty name)
useEffect(() => {
  if (!companyLoading && globalSettings && globalSettings.name) {
    setCompanySettings(globalSettings);
    setHasCompanySettingsLoaded(true);
  }
}, [globalSettings, companyLoading]);
```

Also update the initial state to not capture potentially stale data:

```tsx
// BEFORE (line 68):
const [companySettings, setCompanySettings] = useState<CompanySettings>(globalSettings);

// AFTER: Start with empty, let useEffect sync real data
import { emptyCompanySettings } from '@/data/settings';
const [companySettings, setCompanySettings] = useState<CompanySettings>(emptyCompanySettings);
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/settings.ts` | Replace `companySettings` mock with `emptyCompanySettings`, remove other mock exports |
| `src/contexts/CompanySettingsContext.tsx` | Update import to use `emptyCompanySettings` |
| `src/pages/Settings.tsx` | Initialize with empty settings, add name check in useEffect |

## Why This Fixes the Problem

1. **No More Mock Data**: The fallback is now empty strings, not fake company names
2. **Loading States Work**: Empty name means loading indicator shows until real data arrives
3. **Race Condition Safe**: Even if the initial state captures the fallback, it's empty (not misleading)
4. **Tab-Specific Save Still Works**: The existing `hasCompanySettingsLoaded` flag prevents saving empty data

## What Users Will See

- **Before Fix**: "Franfer Technologies" briefly appears, then may or may not update
- **After Fix**: Loading skeleton shows until real "DGC" data loads from database

## Additional Cleanup

The following mock exports in `src/data/settings.ts` should also be removed or marked as test-only:

- `userPreferences` (mock user)
- `notificationSettings` (mock notifications)  
- `securitySessions` (mock sessions)

These are all replaced by real database queries elsewhere in the app.
