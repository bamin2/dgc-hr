## Problem

`src/components/ui/tabs.tsx` uses hardcoded literal colors instead of design tokens:

```ts
TabsList:    bg-white/15  border-white/20
TabsTrigger: text-black/50  hover:bg-white/30 hover:text-black
             data-[state=active]:bg-white/70  data-[state=active]:text-black
```

Issues:
- Violates the workspace rule "Never write custom color classes (text-white, bg-black) — use semantic tokens".
- In **dark mode**, `text-black/50` on a translucent `white/15` track is barely visible; active state `text-black` on `white/70` becomes harsh white-on-white-ish.
- In **light mode**, the white-on-white liquid pill ignores the soft off-white background (`#F7F7F5`) and the DGC green/gold semantic palette.
- Single source of truth — every tabs instance in the app inherits this.

## Goal

Theme-aware liquid-glass tabs that work in both modes and respect tokens, while keeping the existing pill shape, height, and spacing so no consumer needs changes.

## Changes

### `src/components/ui/tabs.tsx`

Replace literal colors with semantic tokens. Keep all geometry (`h-10`, `rounded-full`, `gap-1`, `p-1`, `px-4 sm:px-5`, scroll classes, focus ring) identical.

**TabsList** (translucent track adapts to mode):
```ts
"inline-flex h-auto items-center gap-1 p-1",
"bg-foreground/5 border border-border/60 backdrop-blur-md rounded-full",
"max-w-full overflow-x-auto scrollbar-none",
```
- `bg-foreground/5` gives a faint tinted track that inverts correctly in dark mode (tiny dark veil on light bg, tiny light veil on dark bg).
- `border-border/60` uses the existing border token (already mode-aware).

**TabsTrigger** (inactive + hover + active all token-driven):
```ts
"inline-flex items-center justify-center gap-2 whitespace-nowrap",
"h-10 px-4 sm:px-5 rounded-full",
"text-sm font-medium transition-colors duration-200",
// Inactive
"text-muted-foreground hover:text-foreground hover:bg-foreground/5",
// Active pill — surface-like contrast against the track
"data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
"data-[state=active]:border data-[state=active]:border-border/40",
// Focus
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
"disabled:pointer-events-none disabled:opacity-50",
```

Why these tokens:
- `text-muted-foreground` → readable secondary in both modes.
- `text-foreground` on hover/active → primary text contrast in both modes.
- `bg-card` for the active pill → naturally contrasts with the `foreground/5` track (white pill on light, raised dark surface in dark mode), preserving the liquid-glass "raised tile" look.
- `border-border/40` adds a subtle definition consistent with the project's liquid-glass normalization rule.

`TabsContent` is already token-clean (`ring-offset-background`, `ring-ring`) — leave untouched.

## Verification

- `rg "text-(black|white)|bg-(black|white)" src/components/ui/tabs.tsx` → no matches.
- Visual check: `/requests`, `/time-management`, `/my-profile`, `/settings`, `/approvals` — tabs readable in both light and dark modes; active pill clearly distinct from inactive triggers; pill shape and overflow scrolling unchanged.

## Technical notes

- All tokens already exist in `index.css` for both `:root` and `.dark`; no theme additions needed.
- No API changes, no consumer changes. Drop-in replacement.
- Aligns with existing memory: *Liquid Glass Normalization* (`backdrop-blur`, translucent borders, no solid white) and *Responsive Tabs Scrolling* (overflow handled here at the base).
