# Fix: Reset password shows generic non‑2xx error

## What’s happening
- The edge function `reset-employee-password` is returning **404** with JSON:
  - `{ "error": "Employee does not have an associated user account" }`
- In the client (`ResetPasswordDialog.tsx`), `supabase.functions.invoke(...)` surfaces this as `error` (non‑2xx), and the UI currently only shows `error.message`, which is the generic: **“Edge Function returned a non-2xx status code”**.
- Edge logs confirm the underlying cause: the profiles lookup returns 0 rows (PGRST116) because the employee has no `profiles` row yet (i.e., no auth account).

## Goals
1. Show the **real server error message** in the toast/dialog instead of the generic one.
2. Reduce noisy edge logs by avoiding `.single()` when 0 rows is expected.
3. Improve UX by disabling/hiding **Reset Password** when the employee doesn’t yet have an account (and guiding HR to “Create Login” instead).

## Changes

### 1) Edge function: use `maybeSingle()` for profile lookup
**File:** `supabase/functions/reset-employee-password/index.ts`
- Change:
  - `.single()` -> `.maybeSingle()`
- Update the not-found branch to be explicit:
  - Return 404 with error like: `No user account exists for this employee. Use "Create Login" first.`
- Logging:
  - Log a concise message for not found (avoid logging the full PGRST116 error object).

Why: `PGRST116` is expected when there is no matching profile; `maybeSingle()` avoids treating this as an error.

### 2) Client: parse error response body from `functions.invoke`
**File:** `src/components/employees/ResetPasswordDialog.tsx`
- When `error` is present:
  - Attempt to extract JSON from `error.context` (Supabase Functions errors typically carry the `Response`).
  - Prefer server message: `body.error`.
  - Fallback to `error.message`.

Implementation approach:
- Add a small helper inside the component (or shared util later):
  - If `error.context?.response` exists: `await error.context.response.json()`
  - Else if `error.context` is a `Response`: `await error.context.json()`
  - Else: return `null`

Then:
```ts
if (error) {
  const serverMsg = await extractFunctionsErrorMessage(error)
  toast.error(serverMsg ?? error.message ?? "Failed to reset password")
  return
}
```

### 3) Client: disable/hide Reset Password when no account exists
**File:** `src/pages/EmployeeProfile.tsx`
- In the “Account Access” card, add a `useQuery` to check if a profile exists:
  - `supabase.from('profiles').select('id').eq('employee_id', employee.id).maybeSingle()`
- Derive:
  - `const hasAccount = !!profileRow?.id`
- UI behavior:
  - If `!hasAccount`: disable Reset Password and show helper text “No account yet — create login first”.
  - If `hasAccount`: enable Reset Password.

Optional UX:
- If `hasAccount`, disable “Create Login” and show “Account already exists”.

### 4) (Optional but recommended) Apply same error parsing to Create Login
**File:** `src/components/employees/CreateLoginDialog.tsx`
- Handle non‑2xx the same way so HR sees real messages.

## Testing checklist
1. HR/Admin resets password for an employee **with** a user account → success.
2. HR/Admin resets password for an employee **without** a user account → button disabled OR meaningful toast “Use Create Login first.”
3. Non HR/Admin attempts reset → 403 with meaningful toast (not generic).
4. Edge logs no longer include `PGRST116` for expected not-found.

## Critical Files for Implementation
- `supabase/functions/reset-employee-password/index.ts` — switch profile lookup to `maybeSingle` + clearer error.
- `src/components/employees/ResetPasswordDialog.tsx` — extract server error body for non‑2xx.
- `src/pages/EmployeeProfile.tsx` — detect whether employee has an account and gate Reset Password.
- `src/components/employees/CreateLoginDialog.tsx` — (optional) consistent non‑2xx error display.
