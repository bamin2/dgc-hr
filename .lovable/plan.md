# Per-Tab Dirty Tracking + Unsaved-Changes Confirm in Settings

## Goal
Track unsaved-edit state per Settings tab using three booleans. Disable the Save button unless the active tab is dirty. When the user clicks a different tab while the active one is dirty, intercept and present an `AlertDialog` with three actions: Save and continue / Discard changes / Cancel.

## Scope
`src/pages/Settings.tsx` only. Tab routing, save calls, child forms, and existing skeleton/loading logic are unchanged. Three tabs are covered by per-tab dirtiness:
- `companyDirty` → applies to `company`, `dashboard`, `selfservice` (all three mutate `companySettings`).
- `prefsDirty` → applies to `preferences`.
- `notifDirty` → applies to `notifications`.
Other tabs (`organization`, `approvals`, `email-templates`, `payroll`, `security`) own their own save flow today; no global Save button shown for them — guarding is unnecessary and intentionally skipped.

## Changes

### 1. Imports
Add to existing imports:
```ts
import { useMemo, useRef } from 'react'; // merge with existing useState/useEffect import
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
```

### 2. State
Right under existing `useState` blocks:
```ts
const [companyDirty, setCompanyDirty] = useState(false);
const [prefsDirty, setPrefsDirty] = useState(false);
const [notifDirty, setNotifDirty] = useState(false);

const [pendingTab, setPendingTab] = useState<string | null>(null);
```

### 3. Setter wrappers — flag dirty when the *user* changes data
The three local-state setters are passed to child forms (`onChange={setUserPreferences}` etc.) and to inline updaters. Wrap them so dirtiness flips on user edits but the data-load `useEffect`s do not.

- Replace `handleCompanySettingsChange` body and add similar wrappers:
```ts
const handleCompanySettingsChange = (newSettings: CompanySettings) => {
  setCompanySettings(newSettings);
  setCompanyDirty(true);
};

const handleUserPreferencesChange = (next: UserPreferences) => {
  setUserPreferences(next);
  setPrefsDirty(true);
};

const handleNotificationSettingsChange = (next: NotificationSettings) => {
  setNotificationSettings(next);
  setNotifDirty(true);
};
```

- Update the inline `onChange` props in `renderTabContent`:
  - `UserPreferencesForm`: `onChange={handleUserPreferencesChange}`
  - `NotificationSettingsForm`: `onChange={handleNotificationSettingsChange}`
  - `DashboardSettingsTab`: replace inline `setCompanySettings(prev => ...)` with:
    ```tsx
    onChange={(visibility) => {
      setCompanySettings(prev => ({ ...prev, dashboardCardVisibility: visibility }));
      setCompanyDirty(true);
    }}
    ```
  - `SelfServiceSettings`: same treatment for the field/value updater.

### 4. Keep load-sync effects from flipping dirty
The three `useEffect`s that mirror DB → local state must not set dirty. Currently they already only call `setX(...)`, which is fine; we just don't add `setXDirty(true)` there. **However** they also need to reset dirtiness when DB resyncs after save (e.g. after a successful save, `dbUserPreferences` updates → effect runs). That's exactly the desired reset path, so leave them as-is. To make the reset explicit and resilient, also reset dirty inside `handleSave` after each successful branch (see step 5).

### 5. `handleSave` — reset the matching dirty flag on success
Inside the existing switch, after each `await ...updateX(...)` call, reset the relevant flag:

```ts
case 'company':
case 'dashboard':
case 'selfservice':
  if (canManageRoles && hasCompanySettingsLoaded) {
    await updateGlobalSettings(companySettings);
    setCompanyDirty(false);
  } else if (canManageRoles && !hasCompanySettingsLoaded) { ... return; }
  break;

case 'preferences':
  await updatePreferences(userPreferences);
  setPrefsDirty(false);
  break;

case 'notifications':
  await updateNotifications(notificationSettings);
  setNotifDirty(false);
  break;
```

### 6. Compute `activeTabDirty` and gate the Save button
```ts
const activeTabDirty = useMemo(() => {
  if (['company', 'dashboard', 'selfservice'].includes(activeTab)) return companyDirty;
  if (activeTab === 'preferences') return prefsDirty;
  if (activeTab === 'notifications') return notifDirty;
  return false;
}, [activeTab, companyDirty, prefsDirty, notifDirty]);
```

Update Save button `disabled`:
```tsx
<Button onClick={handleSave} disabled={!canSave || !activeTabDirty}>
```
`canSave` (existing) preserves the loading-gate for company tabs and the saving spinner; we additionally require `activeTabDirty` so the button is inert with no edits.

### 7. Tab-switch guard
Create a single function used by all three call sites that switch tabs (mobile `<select>`, admin nav buttons, personal nav buttons):

```ts
const requestTabSwitch = (nextTab: string) => {
  if (nextTab === activeTab) return;
  if (activeTabDirty) {
    setPendingTab(nextTab);
    return;
  }
  setActiveTab(nextTab);
};
```

Replace each `onClick={() => setActiveTab(tab.value)}` and `onChange={(e) => setActiveTab(e.target.value)}` with `requestTabSwitch`.

> URL-driven `setActiveTab` calls in the two `useEffect`s (URL → state sync) are **not** routed through the guard — those reflect external navigation and should not pop a dialog mid-render. This matches "do not change tab routing".

### 8. The `AlertDialog`
Render at the bottom of the page (just before `</DashboardLayout>` close):

```tsx
<AlertDialog open={pendingTab !== null} onOpenChange={(open) => { if (!open) setPendingTab(null); }}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
      <AlertDialogDescription>
        You have unsaved changes. Save before switching tabs?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => setPendingTab(null)}>
        Cancel
      </AlertDialogCancel>
      <Button
        variant="outline"
        onClick={() => {
          // Discard: reset matching dirty flag and switch
          if (['company', 'dashboard', 'selfservice'].includes(activeTab)) {
            setCompanySettings(globalSettings);
            setCompanyDirty(false);
          } else if (activeTab === 'preferences') {
            setUserPreferences(dbUserPreferences);
            setPrefsDirty(false);
          } else if (activeTab === 'notifications') {
            setNotificationSettings(dbNotificationSettings);
            setNotifDirty(false);
          }
          const next = pendingTab!;
          setPendingTab(null);
          setActiveTab(next);
        }}
      >
        Discard changes
      </Button>
      <AlertDialogAction
        onClick={async () => {
          const next = pendingTab!;
          setPendingTab(null);
          await handleSave();
          // Only switch if no error toast (best-effort: handleSave already
          // surfaces errors). Switch unconditionally — error tab will simply
          // remain dirty if save failed; user can retry.
          setActiveTab(next);
        }}
      >
        Save and continue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Wrap using a fragment if needed, or place inside the existing root `<DashboardLayout>` children container.

## Behavior Summary
- Editing in a covered tab flips its dirty flag → Save button enables.
- Successful save resets the flag → Save button disables again.
- Clicking a different tab while dirty intercepts and asks Save / Discard / Cancel.
- Discard reverts local state to the last loaded DB snapshot before switching.
- Save and continue runs the normal save then switches tabs.
- Cancel keeps the user on the current tab with edits intact.
- URL-driven tab changes (deep links, mobile-admin redirect) bypass the guard intentionally.
- All other tabs (`organization`, `approvals`, …) are unchanged.

## Files Modified
- `src/pages/Settings.tsx`
