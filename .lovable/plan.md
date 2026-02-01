
# Fix Business Trip CTA in WelcomeCard

## Problem
When clicking the "Business Trip" quick action button in the WelcomeCard (the greeting area at top of dashboard), it navigates to `/business-trips/new`. However, this route doesn't exist in the application:

- Route `/business-trips` = Business Trips list page
- Route `/business-trips/:id` = Business Trip detail page

When `/business-trips/new` is accessed, React Router matches it as `/business-trips/:id` where `id = "new"`. The BusinessTripDetail page then tries to fetch a trip with ID "new", fails, and shows "Trip not found or access denied."

## Solution
Update `WelcomeCard.tsx` to open the `CreateTripDialog` directly (same pattern as `RequestTimeOffDialog` and `EmployeeRequestLoanDialog`), instead of navigating to a non-existent route.

## Implementation

### File to Modify: `src/components/dashboard/bento/WelcomeCard.tsx`

**Changes:**

1. Add a new state for the business trip dialog:
```tsx
const [isBusinessTripDialogOpen, setIsBusinessTripDialogOpen] = useState(false);
```

2. Import the CreateTripDialog:
```tsx
import { CreateTripDialog } from "@/components/business-trips/CreateTripDialog";
```

3. Update the Business Trip action to use the dialog state instead of navigation:
```tsx
{
  label: "Business Trip",
  icon: Plane,
  onClick: () => setIsBusinessTripDialogOpen(true),  // Changed from navigate("/business-trips/new")
  variant: "outline",
},
```

4. Add the CreateTripDialog component at the end of the JSX (alongside the other dialogs):
```tsx
<CreateTripDialog
  open={isBusinessTripDialogOpen}
  onOpenChange={setIsBusinessTripDialogOpen}
/>
```

## Summary of Changes

| Location | Before | After |
|----------|--------|-------|
| WelcomeCard.tsx line 56 | `navigate("/business-trips/new")` | `setIsBusinessTripDialogOpen(true)` |
| WelcomeCard.tsx imports | - | `import { CreateTripDialog }` |
| WelcomeCard.tsx state | - | `isBusinessTripDialogOpen` state |
| WelcomeCard.tsx JSX | - | `<CreateTripDialog ... />` component |

This matches the existing patterns used for "Request Time Off", "Request Loan", and "HR Letter" quick actions, all of which open dialogs directly rather than navigating to separate pages.
