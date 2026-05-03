# Switch auth left-panel accent from gold to DGC green

## Change

In `src/components/auth/AuthLeftPanel.tsx`, the small accent bar next to the word "People" is currently `bg-accent` (burnt orange / DGC gold per the previous refactor). Switch it to a green that reads against the deep green primary background.

The existing `--success` token (`156 35% 28%` light / `156 38% 48%` dark) is a sage green that contrasts cleanly with the `bg-primary` deep green panel. Use `bg-success`.

### Edit

`src/components/auth/AuthLeftPanel.tsx`, line 48:

```tsx
{hasAccent && <div className="w-1 h-6 rounded-full bg-success" />}
```

(was `bg-accent`)

No other changes — "Purpose" and "Progress" remain unaccented; the gold dot in headings elsewhere is unaffected.
