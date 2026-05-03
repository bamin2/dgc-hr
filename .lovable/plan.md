# Onboarding Gate for Users Without `employee_id`

## Goal
When a signed-in user's `profile.employee_id` is `null` after Auth has finished loading, replace every protected page with a full-page "Welcome to DGC People" onboarding state and a Sign out button. Users without an employee record cannot navigate anywhere else in the app.

## Strategy
Add the gate inside `ProtectedRoute` — it already wraps every authenticated route in `AnimatedRoutes`, so a single check there blocks all navigation without touching individual routes (`/`, `/employees`, `/settings`, …). `AuthContext` already exposes `profile` and `loading`, so no context shape changes are needed.

## Files
- `src/components/auth/ProtectedRoute.tsx` — add the gate.
- `src/components/auth/OnboardingGate.tsx` — **new**, the full-page onboarding screen.

`src/contexts/AuthContext.tsx` and `src/pages/Index.tsx` are inspected only — no changes needed since `profile.employee_id` is already populated by `fetchProfile`.

## Changes

### 1. New file: `src/components/auth/OnboardingGate.tsx`
Mobile-first, semantic tokens, shadcn `Button`. Centered card on the off-white background, deep-green heading, gold sign-out CTA via `variant="default"` (primary token already maps to gold per project memory).

```tsx
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, LogOut } from "lucide-react";

export function OnboardingGate() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto text-center space-y-6 bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Welcome to DGC People
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            We're getting your account set up. Your HR team has been notified —
            you'll have full access shortly.
          </p>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground flex items-start gap-3 text-left">
          <Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <p>
            If this takes more than one business day, please email{" "}
            <a
              href="mailto:hr@dgcholding.com"
              className="text-primary font-medium hover:underline"
            >
              hr@dgcholding.com
            </a>
            .
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
```

### 2. `src/components/auth/ProtectedRoute.tsx`
Add the onboarding gate between the `loading` check and the role check:

```tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { AppRole } from "@/data/roles";
import { PageLoader } from "@/components/ui/page-loader";
import { OnboardingGate } from "./OnboardingGate";

// ...

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const { currentUser } = useRole();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  // Block every protected route until an employee record is linked.
  // `profile` is null momentarily while fetchProfile resolves; only gate
  // once we have a profile object and confirm employee_id is missing.
  if (profile && profile.employee_id === null) {
    return <OnboardingGate />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(currentUser.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
```

`PublicRoute` is unchanged — `/auth` and `/auth/reset-password` remain reachable, so a stranded user can still complete reset flows.

## Behavior
- A signed-in user with no linked employee record sees the onboarding screen on **every** protected URL they try (direct nav, deep links, refresh).
- They can only sign out (or hit `/auth`, which is correct).
- Users with a valid `employee_id` see the dashboard and all protected routes exactly as before.
- During the brief window before `fetchProfile` resolves, `profile` is `null` and the gate is **not** triggered — `ProtectedRoute` falls through to render its children (which themselves typically show their own loading skeletons via React Query). This avoids flashing the onboarding screen for everyone on first paint.
- No new context fields, no edits to `AuthContext.tsx`, no per-route changes.

## Files Modified / Added
- `src/components/auth/ProtectedRoute.tsx` (modified)
- `src/components/auth/OnboardingGate.tsx` (new)
