# Plan: Fix Edge Function Role Check Error

## Problem Analysis

The `reset-employee-password` edge function (and `create-employee-login`) are failing with error:

```
Could not choose the best candidate function between: 
public.has_any_role(_roles => public.app_role[], _user_id => uuid), 
public.has_any_role(_user_id => uuid, _roles => public.app_role[])
```

**Root Cause:** There are two overloaded versions of the `has_any_role` function in the database with the same parameters but in different order. When using named parameters via RPC, PostgreSQL cannot determine which function to call.

**Why RLS policies work:** They use positional parameters (e.g., `has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])`) which don't have this ambiguity.

---

## Solution

Replace the RPC call with a direct query to the `user_roles` table. This is simpler and avoids the function overload issue entirely.

**Current (broken):**
```typescript
const { data: roleData, error: roleError } = await supabaseAdmin
  .rpc('has_any_role', { _user_id: caller.id, _roles: ['hr', 'admin'] })
```

**Fixed:**
```typescript
const { data: roleData, error: roleError } = await supabaseAdmin
  .from('user_roles')
  .select('role')
  .eq('user_id', caller.id)
  .in('role', ['hr', 'admin'])
  .limit(1)
  .maybeSingle()

const hasRequiredRole = !!roleData;
```

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/reset-employee-password/index.ts` | Replace RPC call with direct `user_roles` table query |
| `supabase/functions/create-employee-login/index.ts` | Same fix for consistency and to prevent future issues |

---

## Implementation Details

### 1. Update reset-employee-password/index.ts

Replace lines 48-60:

```typescript
// OLD CODE (remove):
const { data: roleData, error: roleError } = await supabaseAdmin
  .rpc('has_any_role', { _user_id: caller.id, _roles: ['hr', 'admin'] })

if (roleError || !roleData) {
  console.error('Role check error:', roleError)
  return new Response(
    JSON.stringify({ error: 'Insufficient permissions. Only HR and Admin can reset passwords.' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

```typescript
// NEW CODE:
const { data: roleData, error: roleError } = await supabaseAdmin
  .from('user_roles')
  .select('role')
  .eq('user_id', caller.id)
  .in('role', ['hr', 'admin'])
  .limit(1)
  .maybeSingle()

if (roleError) {
  console.error('Role check error:', roleError)
  return new Response(
    JSON.stringify({ error: 'Failed to verify permissions' }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

if (!roleData) {
  console.error('User does not have HR or Admin role')
  return new Response(
    JSON.stringify({ error: 'Insufficient permissions. Only HR and Admin can reset passwords.' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

### 2. Update create-employee-login/index.ts

Replace lines 53-71 with the same pattern:

```typescript
// Check if caller has HR or Admin role by querying user_roles table directly
const { data: roleData, error: roleError } = await supabaseAdmin
  .from('user_roles')
  .select('role')
  .eq('user_id', callerUser.id)
  .in('role', ['hr', 'admin'])
  .limit(1)
  .maybeSingle()

if (roleError) {
  console.error('Error checking role:', roleError)
  return new Response(
    JSON.stringify({ error: 'Failed to verify permissions' }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

if (!roleData) {
  console.error('User does not have required role')
  return new Response(
    JSON.stringify({ error: 'Forbidden: HR or Admin role required' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

---

## Why This Fix Works

1. **Direct table query** - Avoids the function overload ambiguity entirely
2. **Using service role key** - The edge function uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS, so it can directly query `user_roles`
3. **Simpler logic** - If a matching row exists, user has one of the required roles
4. **Consistent pattern** - Both edge functions will use the same approach

---

## Critical Files for Implementation

- `supabase/functions/reset-employee-password/index.ts` - Primary fix for password reset
- `supabase/functions/create-employee-login/index.ts` - Same fix for login creation

---

## Testing

After implementation:
1. Log in as HR or Admin user
2. Navigate to an employee's profile with an existing login
3. Click "Reset Password" 
4. Enter new password and confirm
5. Should succeed without errors
