-- Revoke API access to materialized views
-- These views are used internally by database functions, not by the frontend
-- This resolves the "Unrestricted" security warnings

REVOKE ALL ON public.employee_summary_mv FROM anon, authenticated;
REVOKE ALL ON public.leave_balance_summary_mv FROM anon, authenticated;
REVOKE ALL ON public.payroll_summary_mv FROM anon, authenticated;

-- Keep access for service_role (used by edge functions if needed)
GRANT SELECT ON public.employee_summary_mv TO service_role;
GRANT SELECT ON public.leave_balance_summary_mv TO service_role;
GRANT SELECT ON public.payroll_summary_mv TO service_role;