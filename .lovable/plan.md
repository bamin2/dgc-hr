## Goal
Stop silently auto-approving requests when the approval workflow is misconfigured. Instead, leave the request in its initial pending/submitted state, surface a destructive toast, and return a structured `{ blocked: true, reason }` so callers can react.

## Behavior matrix

| Condition | Old behavior | New behavior |
|---|---|---|
| `workflow.is_active === false` | Flips status to approved/hr_approved | No DB write to status, no steps. Return `{ autoApproved: false, blocked: true, reason: 'workflow_inactive' }`. Destructive toast: *"Approval workflow is inactive. Please contact HR to enable it."* |
| `steps.length === 0` | Flips status to approved | Same: no writes, return `{ blocked: true, reason: 'no_steps' }`. Same toast wording but with reason-specific message: *"Approval workflow has no steps configured. Please contact HR."* |
| `firstStepCreated === false` after loop | Flips status to approved | Last-resort: call `getDefaultHRApprover(workflow.default_hr_approver_id, requesterUserId)`. If a user is found → create a single HR step (pending). If still null → no steps, return `{ blocked: true, reason: 'no_approver' }`. Destructive toast: *"No approver could be assigned. Please contact HR."* |
| All steps created | Updates request to `pending`/`submitted`, returns `{ autoApproved: false }` | **Unchanged.** |

The hook **never** flips a request to approved on its own.

## Type changes — `src/types/approvals.ts`

Add a result type used by the mutation (placed near the existing approval types):

```ts
export type ApprovalInitiationBlockedReason =
  | 'workflow_inactive'
  | 'no_steps'
  | 'no_approver';

export interface ApprovalInitiationResult {
  autoApproved: false;
  blocked: boolean;
  reason?: ApprovalInitiationBlockedReason;
}
```

Note: `autoApproved` is now always `false` (the hook no longer auto-approves), but the field is retained so existing call sites that read `result.autoApproved` keep compiling.

## Hook changes — `src/hooks/useApprovalEngine.ts`

Import the new result type alongside existing imports:

```ts
import { ApprovalWorkflowStep, RequestType, ApprovalInitiationResult } from "@/types/approvals";
```

### A. Replace the inactive-workflow block (lines 76–100)

```ts
// 2. If workflow is inactive — block, do not auto-approve.
if (!workflow.is_active) {
  return { autoApproved: false, blocked: true, reason: 'workflow_inactive' } satisfies ApprovalInitiationResult;
}
```

### B. Replace the zero-steps block (lines 102–127)

```ts
const steps = (workflow.steps as unknown as ApprovalWorkflowStep[]) || [];
if (steps.length === 0) {
  return { autoApproved: false, blocked: true, reason: 'no_steps' } satisfies ApprovalInitiationResult;
}
```

### C. Replace the "no steps created" auto-approve fallback (lines 182–206)

```ts
// 5. If no steps were created, try a last-resort default HR approver.
if (!firstStepCreated) {
  const fallbackHrUserId = await getDefaultHRApprover(
    workflow.default_hr_approver_id,
    requesterUserId,
  );

  if (fallbackHrUserId) {
    const { error: insertError } = await supabase
      .from("request_approval_steps")
      .insert({
        request_id: requestId,
        request_type: requestType,
        step_number: 1,
        approver_type: "hr",
        approver_user_id: fallbackHrUserId,
        status: "pending",
      });
    if (insertError) throw insertError;
    firstStepCreated = true;
  } else {
    return { autoApproved: false, blocked: true, reason: 'no_approver' } satisfies ApprovalInitiationResult;
  }
}
```

The existing block at lines 208–228 (set request to pending/submitted, return `{ autoApproved: false }`) runs unchanged when at least one step exists. Update the final return so it satisfies the new type:

```ts
return { autoApproved: false, blocked: false } satisfies ApprovalInitiationResult;
```

### D. Update `onSuccess` toast handling (lines 246–250)

Replace the auto-approve branch with reason-specific destructive toasts:

```ts
if (result.blocked) {
  switch (result.reason) {
    case 'workflow_inactive':
      toast.error("Approval workflow is inactive. Please contact HR to enable it.");
      break;
    case 'no_steps':
      toast.error("Approval workflow has no steps configured. Please contact HR.");
      break;
    case 'no_approver':
      toast.error("No approver could be assigned. Please contact HR.");
      break;
    default:
      toast.error("Request could not be submitted for approval. Please contact HR.");
  }
} else {
  toast.success("Request submitted for approval");
}
```

(`onError` handler unchanged.)

## Side-effect notes
- Existing callers reading `result.autoApproved` will simply see `false` in all blocked paths and continue rendering pending UI — correct behavior, since the request really is pending.
- Database query invalidations in `onSuccess` still run (idempotent, harmless when blocked).
- No changes to `getEmployeeUserId`, `getManagerUserId`, or `getDefaultHRApprover` signatures.

## Out of scope
- `request_approval_steps` table schema, RLS, or migrations.
- Other approval-related hooks/components.
- Any UI that consumes `useInitiateApproval` — they keep working unchanged.
- DGC tokens / styling.
