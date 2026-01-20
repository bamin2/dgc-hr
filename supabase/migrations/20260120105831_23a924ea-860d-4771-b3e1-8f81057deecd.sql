-- =====================================================
-- SECURITY FIX: Profiles table RLS
-- =====================================================

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile or HR/Admin can view all" ON public.profiles;

-- Create secure SELECT policy: users see own profile, HR/Admin see all
CREATE POLICY "profiles_select_secure"
ON public.profiles FOR SELECT
USING (
  id = auth.uid() 
  OR has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- Create INSERT policy: users can only insert their own profile
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Create UPDATE policy: users can update their own profile
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- =====================================================
-- SECURITY FIX: Salary history - allow employees to view own
-- =====================================================

-- Drop existing policies to recreate with proper access
DROP POLICY IF EXISTS "HR and Admin can view salary history" ON public.salary_history;
DROP POLICY IF EXISTS "salary_history_select_hr_admin" ON public.salary_history;

-- Create SELECT policy: employees can see own history, HR/Admin see all
CREATE POLICY "salary_history_select_secure"
ON public.salary_history FOR SELECT
USING (
  -- Employee can view their own salary history
  employee_id = (SELECT id FROM public.employees WHERE user_id = auth.uid())
  OR 
  -- HR/Admin can view all
  has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- HR/Admin can manage salary history
CREATE POLICY "salary_history_manage_hr_admin"
ON public.salary_history FOR ALL
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- =====================================================
-- SECURITY FIX: Payslips storage bucket policies
-- =====================================================

-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Authenticated users can view payslips" ON storage.objects;
DROP POLICY IF EXISTS "HR and Admin can manage payslips" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload payslips" ON storage.objects;

-- Create secure SELECT policy for payslips bucket
-- Employees can only view their own payslips (stored in folders named by employee_id)
-- HR/Admin can view all payslips
CREATE POLICY "payslips_select_secure"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payslips'
  AND (
    -- HR/Admin can view all payslips
    has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
    OR
    -- Employees can view their own payslips (path: employee_id/filename)
    (storage.foldername(name))[1] = (
      SELECT id::text FROM public.employees WHERE user_id = auth.uid()
    )
  )
);

-- Only HR/Admin can upload/manage payslips
CREATE POLICY "payslips_insert_hr_admin"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payslips'
  AND has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

CREATE POLICY "payslips_update_hr_admin"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payslips'
  AND has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

CREATE POLICY "payslips_delete_hr_admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'payslips'
  AND has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);