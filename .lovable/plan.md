# Fix auth left panel background color

## Issue

The left half of the `/auth` page is still rendering as gold in the screenshot. The intent is for the entire left-side brand panel behind the logo and `People / Purpose / Progress` text to be DGC Green.

## Change

Update `src/components/auth/AuthLeftPanel.tsx` so the outer left panel uses the DGC Green token directly:

```tsx
bg-primary
```

instead of the current gradient:

```tsx
bg-gradient-to-br from-primary to-primary/90
```

This keeps the color semantic and token-based while removing the gradient variation that is currently producing the gold-looking panel in the rendered page.

## Also verify

After the change, check the auth component for any remaining background-related gold/accent styling on the left panel and ensure:

- Left panel background is DGC Green.
- The vertical accent next to `People` remains green (`bg-success`) or can be adjusted if it becomes too subtle on the green background.
- Sign-in button remains the app CTA color unless separately requested.

## Files

- `src/components/auth/AuthLeftPanel.tsx`
