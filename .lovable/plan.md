## Goal
Update the sign-in headline/subtitle copy and add a centered help link below the Microsoft button. No behavior or input/button styling changes.

## Changes in `src/components/auth/SignInForm.tsx`

### 1. Header copy (lines 113–118)

```tsx
<h1 className="text-2xl sm:text-3xl font-semibold leading-tight mb-3 text-foreground">
  Welcome to DGC People.
</h1>
<p className="text-muted-foreground">
  Your work life, benefits, and requests — in one place.
</p>
```

### 2. Add help link directly under the Microsoft button (after line 208)

```tsx
{/* Help link */}
<p className="mt-4 text-center text-xs text-muted-foreground">
  Need help signing in?{" "}
  <a
    href="mailto:hr@dgcholding.com"
    className="text-accent hover:underline"
  >
    hr@dgcholding.com
  </a>
</p>
```

## Out of scope
- Form submission, validation, error messaging.
- Input, password toggle, primary button, Microsoft button styling.
- Footer, divider, layout wrappers.
