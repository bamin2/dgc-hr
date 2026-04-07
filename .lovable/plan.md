

# Self-Approval Bug: Nicy Daijo Approved Her Own Leave

## Root Cause

The approval workflow for time off has one step: **HR approval**, with the default HR approver set to **Nicy Daijo** (`f0265a57-...`).

When Nicy submitted her own leave request, the system assigned her as the approver of her own request. She then approved it herself. The approval engine has no guard against self-approval.

## Evidence from Database

| Field | Value |
|-------|-------|
| Request ID | `06859ae8-...` |
| Requester user_id | `f0265a57-...` (Nicy Daijo) |
| Approver user_id | `f0265a57-...` (Nicy Daijo) |
| Default HR Approver | `f0265a57-...` (Nicy Daijo) |
| Status | Approved (25 seconds after creation) |

## Fix

**File:** `src/hooks/useApprovalEngine.ts`

In the approval step creation loop, after resolving the `approverUserId`, add a check: if the resolved approver is the same as the requesting employee's `user_id`, skip that approver and try to find an alternative:

1. Get the requester's `user_id` at the start of the flow
2. When `approverUserId === requesterUserId`:
   - For "hr" steps: query `user_roles` for another user with `hr` or `admin` role (excluding the requester)
   - For "manager" steps: this is less likely (you'd rarely be your own manager), but skip if it happens
3. If no alternative approver is found, skip the step (existing behavior handles "no steps created" by auto-approving, but we could also flag it for manual review)

**Additionally**, in the approval action handlers (`PendingApprovalsTab`, `LeaveRequestDetailView`), add a client-side guard that hides or disables the approve/reject buttons when the current user is the requester. This is a UI-level safeguard on top of the engine fix.

### Changes

| File | Change |
|------|--------|
| `src/hooks/useApprovalEngine.ts` | Add self-approval prevention: resolve alternative approver when requester === approver |
| `src/components/approvals/PendingApprovalsTab.tsx` | Hide approve/reject for own requests |
| `src/components/attendance/LeaveRequestDetailView.tsx` | Disable actions when viewing own request |

### Technical Detail

```text
Current flow:
  Nicy submits → HR step → approver = Nicy → Nicy approves herself

Fixed flow:
  Nicy submits → HR step → approver = Nicy (self!) 
    → find next HR/admin user → assign them instead
    → if none found → skip step (or keep pending for manual resolution)
```

