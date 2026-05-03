## Goal
Replace the generic spinner loader with a branded DGC logo loader that gently pulses, and use it in `ProtectedRoute` / `PublicRoute`.

## Changes

### 1. `src/components/ui/page-loader.tsx` (rewrite)
- Render a full-height (`min-h-screen`), centered container with `bg-background`.
- Import the SVG: `import dgcLogoMark from "@/assets/dgc-logo-mark.svg";`
- Render `<img src={dgcLogoMark} alt="" aria-hidden="true" className="w-12 h-12 animate-sla-pulse" />`
  - `w-12` = 48px (8pt grid).
  - `animate-sla-pulse` already defined in `src/index.css` (1.6s ease-in-out, opacity 1 → 0.55 → 1, with `prefers-reduced-motion` disabling it).
- No text. Add `role="status"` + `aria-label="Loading"` on the wrapper for a11y.

```tsx
import dgcLogoMark from "@/assets/dgc-logo-mark.svg";

export function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="min-h-screen w-full flex items-center justify-center bg-background"
    >
      <img
        src={dgcLogoMark}
        alt=""
        aria-hidden="true"
        className="w-12 h-12 animate-sla-pulse"
      />
    </div>
  );
}
```

### 2. `src/components/auth/ProtectedRoute.tsx`
- Import `PageLoader` from `@/components/ui/page-loader`.
- In both `ProtectedRoute` and `PublicRoute`, replace the `Loader2`-based loading block with `return <PageLoader />;`.
- Remove the now-unused `Loader2` import.
- Leave all redirect, role-check, and auth logic untouched.

## Notes
- `animate-sla-pulse` already honors `prefers-reduced-motion` per `src/index.css`.
- No new tokens, colors, or animations introduced.
- `bg-background` resolves to the off-white token (DGC brand-aligned).
