# Enforce @dgcholding.com Domain in AuthContext

## Goal
Block any signed-in session whose email is not on `dgcholding.com` (case-insensitive), regardless of provider (Microsoft OAuth, password, etc.). Enforce on both initial session load and live auth state changes.

## File
`src/contexts/AuthContext.tsx` only. No changes to OAuth setup, password flow, or redirects.

## Changes

### 1. Add constant + sonner import (top of file)
```ts
import { toast } from 'sonner';

const ALLOWED_EMAIL_DOMAIN = 'dgcholding.com';
```

### 2. Add a domain enforcement helper inside `AuthProvider`
```ts
const enforceAllowedDomain = async (currentUser: User | null): Promise<boolean> => {
  if (!currentUser?.email) return true;
  const email = currentUser.email.toLowerCase();
  if (email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) return true;

  await supabase.auth.signOut();
  setProfile(null);
  setUser(null);
  setSession(null);
  toast.error('Only @dgcholding.com accounts can sign in. Please use your DGC email.');
  return false;
};
```

### 3. Wire it into the `onAuthStateChange` callback
After `setUser(session?.user ?? null);`, if there is a `session.user`, run the domain check before scheduling `fetchProfile`. If the check fails, skip the profile fetch entirely.

```ts
setSession(session);
setUser(session?.user ?? null);

if (session?.user) {
  enforceAllowedDomain(session.user).then((ok) => {
    if (!ok) return;
    setTimeout(() => fetchProfile(session.user.id), 0);
  });
} else {
  setProfile(null);
}
```

### 4. Wire it into the initial `getSession()` resolution
```ts
supabase.auth.getSession().then(async ({ data: { session } }) => {
  setSession(session);
  setUser(session?.user ?? null);
  if (session?.user) {
    const ok = await enforceAllowedDomain(session.user);
    if (ok) await fetchProfile(session.user.id);
  }
  setLoading(false);
});
```

## Behavior Notes
- Case-insensitive check via `email.toLowerCase().endsWith('@dgcholding.com')`.
- On rejection: `signOut()` → clear `user`, `session`, `profile` → destructive sonner toast.
- The `SIGNED_OUT` event fired by the forced sign-out will re-enter the listener with `session = null`, which is a no-op for the domain check.
- No changes to: `signInWithAzure` OAuth options, `signIn` password flow, `resetPassword`, `updatePassword`, redirect URLs, or context shape.

## Files Modified
- `src/contexts/AuthContext.tsx`
