

# Fix Document Upload RLS Policy

## Problem
The `employee_documents` table has only SELECT policies — no INSERT, UPDATE, or DELETE RLS policies. When an HR/admin user uploads a document, the insert into `employee_documents` is blocked by RLS, causing the "Upload failed" error.

The storage bucket upload succeeds (it has proper policies), but the database record insert fails.

## Evidence
Database logs show: `new row violates row-level security policy for table "employee_documents"`

Current policies on `employee_documents`: 3 SELECT policies only, zero INSERT/UPDATE/DELETE policies.

## Fix

**Database migration** — add INSERT, UPDATE, and DELETE policies for HR/admin users:

```sql
-- HR and admin can insert documents
CREATE POLICY "HR and admin can insert employee documents"
ON public.employee_documents
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- HR and admin can update documents
CREATE POLICY "HR and admin can update employee documents"
ON public.employee_documents
FOR UPDATE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
)
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- HR and admin can delete documents
CREATE POLICY "HR and admin can delete employee documents"
ON public.employee_documents
FOR DELETE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);
```

Also add the same for `document_expiry_notifications` table (used when setting expiry notification preferences during upload):

```sql
-- Check current policies on document_expiry_notifications and add INSERT/UPDATE/DELETE if missing
```

## Files changed
No code changes — database migration only.

