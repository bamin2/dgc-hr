# Detect Circular Manager Chains in Approval Engine

## Goal
When the configured workflow step's approver is `manager`, walk up the employee→manager chain (max depth 5) before assigning the manager as approver. If a cycle is detected, treat it like an unresolved manager: fall through to `fallback === 'hr'`, or, if no fallback, leave the request pending with no steps and surface a destructive toast `"Manager assignment is circular. Please contact HR."`.

## Files
- `src/types/approvals.ts` — extend the blocked-reason union.
- `src/hooks/useApprovalEngine.ts` — add helper, modify manager branch, surface new toast.

`src/hooks/useEmployees.ts` is inspected for context only — no changes needed; the helper queries `employees` directly via supabase to keep it lightweight and avoid React-Query coupling inside a mutation.

## Changes

### 1. `src/types/approvals.ts`
Add `'circular_manager'` to `ApprovalInitiationBlockedReason`:
```ts
export type ApprovalInitiationBlockedReason =
  | 'workflow_inactive'
  | 'no_steps'
  | 'no_approver'
  | 'circular_manager';
```

### 2. `src/hooks/useApprovalEngine.ts`

**Add helper** below `getManagerUserId`:
```ts
// Walk the manager chain starting from `managerId` up to MAX_DEPTH levels.
// Returns true if `employeeId` appears in that chain (cycle detected).
async function isCircularManager(employeeId: string, managerId: string): Promise<boolean> {
  const MAX_DEPTH = 5;
  let current: string | null = managerId;
  const visited = new Set<string>([employeeId]);

  for (let depth = 0; depth < MAX_DEPTH && current; depth++) {
    if (visited.has(current)) return true;
    visited.add(current);

    const { data } = await supabase
      .from('employees')
      .select('manager_id')
      .eq('id', current)
      .single();

    current = data?.manager_id ?? null;
  }
  return false;
}
```

**Modify the manager branch** in `useInitiateApproval` (currently lines 95–105). Need to know the manager's `employee.id` to traverse. Add a small helper or fetch it inline. Replace the branch with:

```ts
if (stepConfig.approver === "manager") {
  // Resolve manager's employee row so we can both check for cycles
  // and reuse the user_id we already need.
  const { data: managerEmployee } = await supabase
    .from("employees")
    .select("id, user_id, manager_id")
    .eq("id", (await supabase
      .from("employees")
      .select("manager_id")
      .eq("id", employeeId)
      .single()).data?.manager_id ?? "")
    .maybeSingle();

  const resolvedManagerUserId = managerEmployee?.user_id ?? null;
  const cycle = managerEmployee
    ? await isCircularManager(employeeId, managerEmployee.id)
    : false;

  const managerUsable =
    !!resolvedManagerUserId &&
    resolvedManagerUserId !== requesterUserId &&
    !cycle;

  if (managerUsable) {
    approverUserId = resolvedManagerUserId;
  } else if (stepConfig.fallback === "hr") {
    approverUserId = await getDefaultHRApprover(workflow.default_hr_approver_id, requesterUserId);
    effectiveApproverType = "hr";
    if (cycle) circularManagerDetected = true; // remember for toast if we still end up with no steps
  } else {
    if (cycle) circularManagerDetected = true;
    continue;
  }
}
```

To avoid the awkward double-await inline, refactor the existing top-level fetch:

- Replace line 87 `const managerUserId = await getManagerUserId(employeeId);` with a single fetch that returns both ids:
  ```ts
  const { data: requesterEmployee } = await supabase
    .from("employees")
    .select("manager_id")
    .eq("id", employeeId)
    .single();
  const directManagerEmployeeId = requesterEmployee?.manager_id ?? null;

  let managerEmployeeRow: { id: string; user_id: string | null } | null = null;
  if (directManagerEmployeeId) {
    const { data } = await supabase
      .from("employees")
      .select("id, user_id")
      .eq("id", directManagerEmployeeId)
      .single();
    managerEmployeeRow = data ?? null;
  }
  const managerUserId = managerEmployeeRow?.user_id ?? null;

  const cycleDetected = managerEmployeeRow
    ? await isCircularManager(employeeId, managerEmployeeRow.id)
    : false;

  let circularManagerDetected = false;
  ```

- Then the manager branch becomes simpler:
  ```ts
  if (stepConfig.approver === "manager") {
    if (managerUserId && managerUserId !== requesterUserId && !cycleDetected) {
      approverUserId = managerUserId;
    } else if (stepConfig.fallback === "hr") {
      approverUserId = await getDefaultHRApprover(workflow.default_hr_approver_id, requesterUserId);
      effectiveApproverType = "hr";
      if (cycleDetected) circularManagerDetected = true;
    } else {
      if (cycleDetected) circularManagerDetected = true;
      continue;
    }
  }
  ```

**No-steps fallthrough** (after the loop, before the existing `if (!firstStepCreated)` last-resort HR block): if `firstStepCreated` is still false **and** `circularManagerDetected` is true **and** the last-resort HR fallback also fails to produce an approver, surface `circular_manager` instead of the generic `no_approver`. Concretely, modify the existing block (lines 140–162) so the `else` branch returns:
```ts
return {
  autoApproved: false,
  blocked: true,
  reason: circularManagerDetected ? 'circular_manager' : 'no_approver',
} satisfies ApprovalInitiationResult;
```
The success path inside the `if (fallbackHrUserId)` branch is unchanged.

### 3. Toast in `onSuccess`
Add a case in the existing switch:
```ts
case 'circular_manager':
  toast.error("Manager assignment is circular. Please contact HR.");
  break;
```

## Behavior Summary
- Manager chain is walked up to 5 levels.
- A cycle disqualifies the manager, exactly as if `managerUserId` were null.
- If the step has `fallback === 'hr'`, HR is assigned (no toast change for that step — the request continues normally).
- If no fallback **and** no other approvers can be created **and** the last-resort HR also fails, the request remains pending with no steps and the destructive cyclical-manager toast fires.
- Success path, default values, schema of `request_approval_steps`, and other branches (`hr`, `specific_user`) are untouched.
- `getManagerUserId` is left in place for external compatibility, even though `useInitiateApproval` no longer uses it.

## Files Modified
- `src/types/approvals.ts`
- `src/hooks/useApprovalEngine.ts`
