-- =============================================
-- FIX: Restrict overly permissive SELECT policies
-- These tables currently allow public/anonymous access
-- =============================================

-- 1. COMPANY_SETTINGS
DROP POLICY IF EXISTS "Authenticated users can view company settings" ON public.company_settings;
CREATE POLICY "Authenticated users can view company settings" 
  ON public.company_settings 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 2. APPROVAL_WORKFLOWS  
DROP POLICY IF EXISTS "Anyone can view approval workflows" ON public.approval_workflows;
CREATE POLICY "Authenticated users can view approval workflows" 
  ON public.approval_workflows 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 3. ALLOWANCE_TEMPLATES
DROP POLICY IF EXISTS "Authenticated users can view active allowance templates" ON public.allowance_templates;
CREATE POLICY "Authenticated users can view allowance templates" 
  ON public.allowance_templates 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 4. DEDUCTION_TEMPLATES
DROP POLICY IF EXISTS "Authenticated users can view active deduction templates" ON public.deduction_templates;
CREATE POLICY "Authenticated users can view deduction templates" 
  ON public.deduction_templates 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 5. BENEFIT_PLANS
DROP POLICY IF EXISTS "Authenticated users can view benefit plans" ON public.benefit_plans;
CREATE POLICY "Authenticated users can view benefit plans" 
  ON public.benefit_plans 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 6. BENEFIT_COVERAGE_LEVELS
DROP POLICY IF EXISTS "Authenticated users can view coverage levels" ON public.benefit_coverage_levels;
CREATE POLICY "Authenticated users can view coverage levels" 
  ON public.benefit_coverage_levels 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);