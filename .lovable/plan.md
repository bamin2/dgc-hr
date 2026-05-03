## Goal
Neutralize the colored icon tiles on the mobile Quick Actions grid. All actions become tonal (`bg-muted text-primary border border-border`); only "Request Time Off" gets a gold-tinted highlight to read as the most prominent action.

## Changes in `src/components/dashboard/bento/MobileQuickActionsCard.tsx`

1. Drop `color` from the `QuickActionItem` interface (line 20–25).
2. Remove the `color: "..."` field from every entry in `baseActions` (lines 45–70) and `managerActions` (lines 73–86).
3. In the render (lines 113–118), replace the dynamic `action.color` class with a conditional:
   - Default tile: `bg-muted text-primary border border-border`
   - "Request Time Off" only: `bg-accent/10 text-primary border border-accent/30`
4. Keep icons, labels, click handlers, the 2-column grid, BentoCard wrapping, and all dialog wiring untouched.

### Resulting interface
```ts
interface QuickActionItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}
```

### Resulting tile JSX
```tsx
<div
  className={cn(
    "w-11 h-11 rounded-xl flex items-center justify-center border",
    action.label === "Request Time Off"
      ? "bg-accent/10 text-primary border-accent/30"
      : "bg-muted text-primary border-border"
  )}
>
  <Icon className="h-5 w-5" />
</div>
```

## Out of scope
- Outer button background (`bg-secondary/50`), grid layout, header, dialogs, navigation.
