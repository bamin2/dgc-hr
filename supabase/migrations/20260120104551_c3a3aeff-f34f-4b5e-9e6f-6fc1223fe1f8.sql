-- =====================================================
-- Fix remaining function search paths
-- =====================================================

-- Fix direct_reports function (if it exists and is user-defined)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'direct_reports' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER FUNCTION public.direct_reports SET search_path = 'public';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore errors if function signature doesn't match
END $$;

-- Fix manager function (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'manager' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER FUNCTION public.manager SET search_path = 'public';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore errors if function signature doesn't match
END $$;