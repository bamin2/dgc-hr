# Update TimeOff Page Subtitle

## Goal
The `/time-off` route is personal (per project memory). The current subtitle "Manage your team's time off." is team-oriented and misleading. Update it to a personal-focused copy.

## File
`src/pages/TimeOff.tsx` — line 21 only.

## Change
Replace:
```tsx
subtitle="Manage your team's time off."
```
with:
```tsx
subtitle="View your leave balances and request time off."
```

No other changes.

## Files Modified
- `src/pages/TimeOff.tsx`
