## Goal
Re-skin the auth left panel accents from green/muted to DGC Gold, and tighten the value-word typography. No layout, logo, or background changes.

## Changes in `src/components/auth/AuthLeftPanel.tsx`

1. Line 21 — top divider:
   - From: `bg-[hsl(var(--auth-brand-panel-foreground)/0.2)]`
   - To: `bg-accent/40`

2. Line 29 — bottom divider: same swap as above.

3. Line 47 — accent bar in `ValueWord`:
   - From: `<div className="w-1 h-6 rounded-full bg-success" />`
   - To: `<div className="w-1 h-8 rounded-full bg-accent" />`

4. Line 49 — value word typography:
   - From: `font-light tracking-[0.1em]`
   - To: `font-medium tracking-[0.05em]`
   (Keep `text-2xl lg:text-3xl` and the panel-foreground color intact.)

## Out of scope
- Panel background `bg-[hsl(var(--auth-brand-panel))]`
- Logo block and `DGC People` label
- Container layout, spacing, and `ml-4` offset for non-accent words
- `ValueWord` prop interface
