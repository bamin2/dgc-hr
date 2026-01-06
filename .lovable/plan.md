# Plan: Auto-Create Login Account When Adding Employee/Team Member

## Overview

Currently, adding an employee only creates a record in the `employees` table. The user must then manually click "Create Login" to create an auth account. This plan modifies the flow to automatically create the auth account when adding an employee.

---

## Current Architecture

```
employees table                    auth.users
+------------------+               +------------------+
| id (uuid)        |               | id (uuid)        |
| email            |               | email            |
| first_name       |               | user_metadata    |
| ...              |               | ...              |
+------------------+               +------------------+
        |                                   |
        |                                   v
        |                          profiles table
        |                          +------------------+
        +------------------------->| id (uuid) = auth.users.id
                                   | employee_id (uuid) ---> employees.id
                                   | email            |
                                   +------------------+
```

**Current Flow:**
1. Create employee in `employees` table
2. (Later) HR clicks "Create Login" which:
   - Creates auth user via `auth.admin.createUser()`
   - Trigger creates `profiles` row
   - Edge function links `profiles.employee_id` to the employee

---

## New Architecture

### Flow After Changes

```
AddTeamMemberWizard / EmployeeForm
           |
           v
   Call create-employee-with-login edge function
           |
           +---> 1. Create auth user (auto-generates password)
           |
           +---> 2. Trigger creates profiles row
           |
           +---> 3. Create employee record with user_id linked
           |
           +---> 4. Update profiles.employee_id
           |
           v
   Return { employee, tempPassword }
```

---

## Implementation Details

### Part 1: Create New Edge Function `create-employee-with-login`

**File:** `supabase/functions/create-employee-with-login/index.ts`

This edge function will:
1. Verify caller has HR/Admin role
2. Generate a secure temporary password
3. Create auth user via `auth.admin.createUser()`
4. Create employee record with the new `user_id`
5. Update `profiles.employee_id` to link to the employee
6. Return the employee data and temporary password

**Request body:**
```typescript
{
  first_name: string;
  last_name: string;
  email: string;
  preferred_name?: string;
  worker_type?: string;
  country?: string;
  join_date?: string;
  department_id?: string;
  position_id?: string;
  manager_id?: string;
  work_location?: string;
  salary?: number;
  pay_frequency?: string;
  employment_type?: string;
  // ... other employee fields
}
```

**Response:**
```typescript
{
  success: true;
  employee: { id: string; ... };
  tempPassword: string;  // Show to HR once, they share with employee
  userId: string;
}
```

**Password generation:**
```typescript
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

---

### Part 2: Update AddTeamMemberWizard

**File:** `src/components/team/wizard/AddTeamMemberWizard.tsx`

Changes:
1. Replace direct Supabase insert with edge function call
2. Show temporary password in a dialog after successful creation
3. Add a "Copy Password" button so HR can share it with the employee

**New flow in `handleSubmit()`:**
```typescript
const { data, error } = await supabase.functions.invoke('create-employee-with-login', {
  body: {
    first_name: basicData.firstName,
    last_name: basicData.lastName,
    email: basicData.email,
    // ... all other employee fields
  }
});

if (data?.success) {
  // Show dialog with temporary password
  setTempPassword(data.tempPassword);
  setShowPasswordDialog(true);
}
```

---

### Part 3: Create TempPasswordDialog Component

**File:** `src/components/team/wizard/TempPasswordDialog.tsx`

A dialog that:
- Shows after successful employee creation
- Displays the employee name and temporary password
- Has a "Copy to Clipboard" button
- Shows a warning: "Please share this password with the employee. It will not be shown again."
- "Done" button closes dialog and navigates to team page

```
+----------------------------------------------------------+
|  Account Created Successfully                      [X]   |
+----------------------------------------------------------+
|                                                          |
|  A login account has been created for:                   |
|  John Doe (john.doe@company.com)                         |
|                                                          |
|  Temporary Password:                                     |
|  +--------------------------------------------------+    |
|  |  xK7mNp3qR2sT                         [Copy]     |    |
|  +--------------------------------------------------+    |
|                                                          |
|  ! Please share this password with the employee.         |
|    They should change it after first login.              |
|    This password will not be shown again.                |
|                                                          |
|                                       [Done]             |
+----------------------------------------------------------+
```

---

### Part 4: Update EmployeeForm (for adding via Employees page)

**File:** `src/components/employees/EmployeeForm.tsx`

Same changes as AddTeamMemberWizard:
1. Call edge function instead of direct insert
2. Show temp password dialog on success

---

### Part 5: Update useCreateEmployee Hook

**File:** `src/hooks/useEmployees.ts`

Create a new hook `useCreateEmployeeWithLogin` that:
1. Calls the edge function
2. Returns the employee data and temp password
3. Handles errors appropriately

```typescript
export function useCreateEmployeeWithLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeData: CreateEmployeeData) => {
      const { data, error } = await supabase.functions.invoke(
        'create-employee-with-login',
        { body: employeeData }
      );

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
  });
}
```

---

### Part 6: Update config.toml

**File:** `supabase/config.toml`

Add the new edge function:
```toml
[functions.create-employee-with-login]
verify_jwt = false
```

---

### Part 7: Clean Up Account Access Section

**File:** `src/pages/EmployeeProfile.tsx`

Since accounts are now auto-created:
- "Create Login" button is no longer needed for new employees
- Keep it only as a fallback for legacy employees without accounts
- Show account status: "Account Active" or "No Account (Legacy)"

---

## Updated Account Access UI

```
+----------------------------------------------------------+
| Account Access                                           |
| Manage login credentials for this employee               |
+----------------------------------------------------------+
|                                                          |
| Status: Account Active (created on Jan 5, 2026)          |
|                                                          |
| [Reset Password]                                         |
|                                                          |
+----------------------------------------------------------+
```

For legacy employees without accounts:
```
+----------------------------------------------------------+
| Account Access                                           |
| Manage login credentials for this employee               |
+----------------------------------------------------------+
|                                                          |
| Status: No Account                                       |
| This employee was added before auto-login was enabled.   |
|                                                          |
| [Create Login]  [Reset Password (disabled)]              |
|                                                          |
+----------------------------------------------------------+
```

---

## Files to Create

| File | Description |
|------|-------------|
| `supabase/functions/create-employee-with-login/index.ts` | Edge function to create employee + auth account |
| `src/components/team/wizard/TempPasswordDialog.tsx` | Dialog showing temporary password after creation |

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/config.toml` | Add new edge function config |
| `src/hooks/useEmployees.ts` | Add `useCreateEmployeeWithLogin` hook |
| `src/components/team/wizard/AddTeamMemberWizard.tsx` | Use new hook, show temp password dialog |
| `src/components/team/wizard/index.ts` | Export TempPasswordDialog |
| `src/components/employees/EmployeeForm.tsx` | Use new hook, show temp password dialog |
| `src/pages/EmployeeProfile.tsx` | Update Account Access section UI |

---

## Security Considerations

1. **Temp password shown once** - After the dialog is closed, the password cannot be retrieved
2. **HR/Admin only** - Edge function verifies caller has appropriate role
3. **Force password change** - (Optional future enhancement) Set flag to require password change on first login
4. **Audit log** - Edge function logs account creation events

---

## Error Handling

1. **Duplicate email** - If auth user with email already exists, show clear error
2. **Database errors** - If employee creation fails after auth user created, rollback by deleting the auth user
3. **Network errors** - Show retry option

---

## Testing Checklist

1. Add team member via wizard - should show temp password dialog
2. Add employee via EmployeeForm - should show temp password dialog
3. Copy password button works
4. Employee can log in with temp password
5. Reset Password still works for existing accounts
6. Legacy employees without accounts show "Create Login" option

---

## Critical Files for Implementation

- `supabase/functions/create-employee-with-login/index.ts` - New edge function (core logic)
- `src/components/team/wizard/TempPasswordDialog.tsx` - New UI component for password display
- `src/components/team/wizard/AddTeamMemberWizard.tsx` - Update to use new flow
- `src/hooks/useEmployees.ts` - Add new mutation hook
- `src/pages/EmployeeProfile.tsx` - Update Account Access section
