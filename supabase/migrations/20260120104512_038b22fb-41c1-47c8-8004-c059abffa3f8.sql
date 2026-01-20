-- =====================================================
-- COMPREHENSIVE SECURITY REMEDIATION - ALL PHASES
-- =====================================================

-- =====================================================
-- PHASE 3: Fix Function Search Paths (using ALTER)
-- =====================================================

-- Set search_path on existing functions using ALTER
ALTER FUNCTION public.get_user_employee_id(uuid) SET search_path = 'public';
ALTER FUNCTION public.is_manager_of(uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.has_any_role(uuid, app_role[]) SET search_path = 'public';
ALTER FUNCTION public.has_any_role(app_role[], uuid) SET search_path = 'public';
ALTER FUNCTION public.refresh_all_materialized_views() SET search_path = 'public';
ALTER FUNCTION public.update_employee_search_vector() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';

-- =====================================================
-- PHASE 4: Restrict Profiles Table (Fix PII Exposure)
-- =====================================================

-- Drop overly permissive profiles policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create proper policies for profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (id = auth.uid())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'HR and Admin can view all profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "HR and Admin can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (has_any_role(auth.uid(), ARRAY[''hr''::app_role, ''admin''::app_role]))';
  END IF;
END $$;

-- =====================================================
-- PHASE 4b: Create Secure View for Employee Data
-- (Excludes sensitive financial data for managers)
-- =====================================================

-- Create a view that excludes sensitive financial data
DROP VIEW IF EXISTS public.employees_safe_view;

CREATE VIEW public.employees_safe_view
WITH (security_invoker = on)
AS SELECT 
  id,
  employee_code,
  first_name,
  last_name,
  second_name,
  full_name,
  preferred_name,
  email,
  phone,
  avatar_url,
  department_id,
  position_id,
  manager_id,
  work_location_id,
  join_date,
  status,
  date_of_birth,
  gender,
  nationality,
  address,
  country,
  location,
  work_location,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  worker_type,
  employment_type,
  pay_frequency,
  tax_exemption_status,
  created_at,
  updated_at
  -- Excludes sensitive fields: salary, bank_name, bank_account_number, iban, 
  -- cpr_number, passport_number, gosi_registered_salary, user_id, salary_currency_code
FROM public.employees;

-- Grant access to the safe view
GRANT SELECT ON public.employees_safe_view TO authenticated;

-- =====================================================
-- Revoke direct access to materialized views from anon
-- =====================================================

REVOKE ALL ON public.employee_summary_mv FROM anon;
REVOKE ALL ON public.leave_balance_summary_mv FROM anon;
REVOKE ALL ON public.payroll_summary_mv FROM anon;