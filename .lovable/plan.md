
# Make WelcomeCard Sections Bigger

## Overview
Increase the size of all sections in the WelcomeCard to make it feel more substantial and less empty. This involves scaling up typography, icons, padding, and spacing throughout the card.

## Current vs. Proposed Sizes

| Element | Current | Proposed |
|---------|---------|----------|
| **Card gap** | `gap-2` | `gap-4` |
| **Card bottom padding** | `pb-3` | Remove (use default) |
| **Header title** | `text-lg` | `text-xl` |
| **Header subtitle** | `text-sm` | `text-sm` (unchanged) |
| **Header spacing** | `space-y-0.5` | `space-y-1` |
| **Sparkle icon** | `h-4 w-4` | `h-5 w-5` |
| **Stats grid gap** | `gap-2` | `gap-3` |
| **Stats padding** | `px-3 py-2` | `px-4 py-3` |
| **Stats icons** | `h-4 w-4` | `h-5 w-5` |
| **Stats label** | `text-xs` | `text-xs` (unchanged) |
| **Stats value** | `text-sm` | `text-base font-semibold` |
| **Stats gap (icon to text)** | `gap-2` | `gap-3` |
| **Action grid gap** | `gap-2` | `gap-3` |
| **Action tile padding** | `p-3` | `p-4` |
| **Action icons** | `h-5 w-5` | `h-6 w-6` |
| **Action labels** | `text-xs` | `text-sm` |
| **Action gap (icon to label)** | `gap-1.5` | `gap-2` |

## Visual Comparison

**Before (compact):**
```text
┌───────────────────────────────────────────────────┐
│ Good afternoon, Bader! ✨    Today                │
│ Here's what's happening      Mon, Feb 3          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│ │📅 Feb 15│ │⏳ 2     │ │✓ 5      │              │
│ └─────────┘ └─────────┘ └─────────┘              │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                      │
│ │ 📅 │ │ ✈️ │ │ 📄 │ │ ✓  │                      │
│ └────┘ └────┘ └────┘ └────┘                      │
└───────────────────────────────────────────────────┘
```

**After (bigger, more substantial):**
```text
┌───────────────────────────────────────────────────┐
│                                                   │
│  Good afternoon, Bader! ✨       Today            │
│  Here's what's happening         Mon, Feb 3      │
│                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│  │ 📅  Feb 15   │ │ ⏳  2        │ │ ✓  5       ││
│  │    Next Leave│ │    Pending   │ │   Approve  ││
│  └──────────────┘ └──────────────┘ └────────────┘│
│                                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐│
│  │   📅    │  │   ✈️    │  │   📄    │  │   ✓   ││
│  │Time Off │  │  Trip   │  │ Letter  │  │Approve││
│  └─────────┘  └─────────┘  └─────────┘  └───────┘│
│                                                   │
└───────────────────────────────────────────────────┘
```

## Technical Changes

### File: `src/components/dashboard/bento/WelcomeCard.tsx`

### 1. BentoCard wrapper (line 110)
```tsx
// Before
<BentoCard colSpan={5} className="flex flex-col gap-2 pb-3">

// After
<BentoCard colSpan={5} className="flex flex-col gap-4">
```

### 2. Header section (lines 112-127)
```tsx
// Before
<div className="flex items-start justify-between">
  <div className="space-y-0.5">
    <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
      {getGreeting()}, {firstName}!
      <Sparkles className="h-4 w-4 text-primary" />
    </h1>
    ...

// After
<div className="flex items-start justify-between">
  <div className="space-y-1">
    <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
      {getGreeting()}, {firstName}!
      <Sparkles className="h-5 w-5 text-primary" />
    </h1>
    ...
```

### 3. Stats grid (lines 140-172)
```tsx
// Before
<div className={cn(
  "grid gap-2",
  ...
)}>
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
    <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">Next Leave</p>
      <p className="text-sm font-medium truncate">{nextLeaveDisplay}</p>
    </div>
  </div>
  ...

// After
<div className={cn(
  "grid gap-3",
  ...
)}>
  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/30">
    <CalendarCheck className="h-5 w-5 text-primary shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">Next Leave</p>
      <p className="text-base font-semibold truncate">{nextLeaveDisplay}</p>
    </div>
  </div>
  ...
```

### 4. Action tiles grid (lines 176-198)
```tsx
// Before
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
  ...
  <button className={cn(
    "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl",
    ...
  )}>
    <Icon className="h-5 w-5 text-primary" />
    <span className="text-xs font-medium ...">

// After
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  ...
  <button className={cn(
    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl",
    ...
  )}>
    <Icon className="h-6 w-6 text-primary" />
    <span className="text-sm font-medium ...">
```

### 5. Skeleton loading state (lines 131-138)
```tsx
// Before
<Skeleton key={i} className="h-12 rounded-lg" />

// After
<Skeleton key={i} className="h-14 rounded-lg" />
```

## Summary of Changes

| Section | Change |
|---------|--------|
| Card container | Increase gap from 2 to 4, remove tight bottom padding |
| Header | Bigger title (xl), larger sparkle icon, more vertical spacing |
| Stats chips | Larger padding, bigger icons (h-5), bolder values |
| Action tiles | Larger padding (p-4), bigger icons (h-6), larger labels (text-sm) |
| Skeleton | Taller placeholder to match bigger stats |

This creates a more substantial, premium feel while maintaining the same layout structure.
