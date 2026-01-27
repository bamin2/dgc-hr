-- =====================================================
-- COMPREHENSIVE RLS SECURITY FIX - PART 2
-- Continues from where part 1 stopped (after loans policy existed)
-- =====================================================

-- 4. FIX LOANS TABLE - Drop existing and recreate
DROP POLICY IF EXISTS "Employees can view own loans" ON public.loans;

CREATE POLICY "Employees can view own loans"
ON public.loans FOR SELECT
USING (
  employee_id = public.get_user_employee_id(auth.uid())
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 5. FIX LOAN_INSTALLMENTS TABLE - Drop existing first
DROP POLICY IF EXISTS "Employees can view own loan installments" ON public.loan_installments;
DROP POLICY IF EXISTS "Authenticated users can view loan installments" ON public.loan_installments;
DROP POLICY IF EXISTS "Loan installments viewable by authenticated users" ON public.loan_installments;
DROP POLICY IF EXISTS "All authenticated users can view loan installments" ON public.loan_installments;

CREATE POLICY "Employees can view own loan installments"
ON public.loan_installments FOR SELECT
USING (
  loan_id IN (
    SELECT id FROM public.loans WHERE employee_id = public.get_user_employee_id(auth.uid())
  )
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 6. FIX BENEFIT_ENROLLMENTS TABLE - Drop existing first
DROP POLICY IF EXISTS "Employees can view own benefit enrollments" ON public.benefit_enrollments;
DROP POLICY IF EXISTS "Authenticated users can view benefit enrollments" ON public.benefit_enrollments;
DROP POLICY IF EXISTS "Benefit enrollments viewable by authenticated users" ON public.benefit_enrollments;
DROP POLICY IF EXISTS "All authenticated users can view benefit enrollments" ON public.benefit_enrollments;

CREATE POLICY "Employees can view own benefit enrollments"
ON public.benefit_enrollments FOR SELECT
USING (
  employee_id = public.get_user_employee_id(auth.uid())
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 7. FIX BENEFIT_CLAIMS TABLE - Drop existing first
DROP POLICY IF EXISTS "Employees can view own benefit claims" ON public.benefit_claims;
DROP POLICY IF EXISTS "Authenticated users can view benefit claims" ON public.benefit_claims;
DROP POLICY IF EXISTS "Benefit claims viewable by authenticated users" ON public.benefit_claims;
DROP POLICY IF EXISTS "All authenticated users can view benefit claims" ON public.benefit_claims;

CREATE POLICY "Employees can view own benefit claims"
ON public.benefit_claims FOR SELECT
USING (
  employee_id = public.get_user_employee_id(auth.uid())
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 8. FIX EMPLOYEE_DOCUMENTS TABLE - Drop existing first
DROP POLICY IF EXISTS "Employees can view own visible documents" ON public.employee_documents;
DROP POLICY IF EXISTS "Authenticated users can view employee documents" ON public.employee_documents;
DROP POLICY IF EXISTS "Employee documents viewable by authenticated users" ON public.employee_documents;
DROP POLICY IF EXISTS "All authenticated users can view employee documents" ON public.employee_documents;

CREATE POLICY "Employees can view own visible documents"
ON public.employee_documents FOR SELECT
USING (
  (employee_id = public.get_user_employee_id(auth.uid()) AND visible_to_employee = true)
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 9. FIX ATTENDANCE_RECORDS TABLE - Drop existing first
DROP POLICY IF EXISTS "Employees can view own attendance or managed reports" ON public.attendance_records;
DROP POLICY IF EXISTS "Authenticated users can view attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Attendance records viewable by authenticated users" ON public.attendance_records;
DROP POLICY IF EXISTS "All authenticated users can view attendance records" ON public.attendance_records;

CREATE POLICY "Employees can view own attendance or managed reports"
ON public.attendance_records FOR SELECT
USING (
  employee_id = public.get_user_employee_id(auth.uid())
  OR public.is_manager_of(auth.uid(), employee_id)
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 10. FIX LEAVE_REQUESTS TABLE - Drop existing first
DROP POLICY IF EXISTS "Employees can view own leave or managed reports" ON public.leave_requests;
DROP POLICY IF EXISTS "Authenticated users can view leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Leave requests viewable by authenticated users" ON public.leave_requests;
DROP POLICY IF EXISTS "All authenticated users can view leave requests" ON public.leave_requests;

CREATE POLICY "Employees can view own leave or managed reports"
ON public.leave_requests FOR SELECT
USING (
  employee_id = public.get_user_employee_id(auth.uid())
  OR public.is_manager_of(auth.uid(), employee_id)
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 11. FIX OFFBOARDING_RECORDS TABLE - Drop existing first
DROP POLICY IF EXISTS "HR Admin and managers can view offboarding" ON public.offboarding_records;
DROP POLICY IF EXISTS "Authenticated users can view offboarding records" ON public.offboarding_records;
DROP POLICY IF EXISTS "Offboarding records viewable by authenticated users" ON public.offboarding_records;
DROP POLICY IF EXISTS "All authenticated users can view offboarding records" ON public.offboarding_records;

CREATE POLICY "HR Admin and managers can view offboarding"
ON public.offboarding_records FOR SELECT
USING (
  employee_id = public.get_user_employee_id(auth.uid())
  OR public.is_manager_of(auth.uid(), employee_id)
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 12. FIX BUSINESS_TRIPS TABLE - Drop existing first
DROP POLICY IF EXISTS "Employees can view own trips or managed reports" ON public.business_trips;
DROP POLICY IF EXISTS "Authenticated users can view business trips" ON public.business_trips;
DROP POLICY IF EXISTS "Business trips viewable by authenticated users" ON public.business_trips;
DROP POLICY IF EXISTS "All authenticated users can view business trips" ON public.business_trips;

CREATE POLICY "Employees can view own trips or managed reports"
ON public.business_trips FOR SELECT
USING (
  employee_id = public.get_user_employee_id(auth.uid())
  OR public.is_manager_of(auth.uid(), employee_id)
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 13. FIX CANDIDATES TABLE - Drop existing first
DROP POLICY IF EXISTS "HR Admin can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Candidates viewable by authenticated users" ON public.candidates;
DROP POLICY IF EXISTS "All authenticated users can view candidates" ON public.candidates;

CREATE POLICY "HR Admin can view candidates"
ON public.candidates FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 14. FIX OFFERS TABLE - Drop existing first
DROP POLICY IF EXISTS "HR Admin can view offers" ON public.offers;
DROP POLICY IF EXISTS "Authenticated users can view offers" ON public.offers;
DROP POLICY IF EXISTS "Offers viewable by authenticated users" ON public.offers;
DROP POLICY IF EXISTS "All authenticated users can view offers" ON public.offers;

CREATE POLICY "HR Admin can view offers"
ON public.offers FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 15. FIX OFFER_VERSIONS TABLE - Drop existing first
DROP POLICY IF EXISTS "HR Admin can view offer versions" ON public.offer_versions;
DROP POLICY IF EXISTS "Authenticated users can view offer versions" ON public.offer_versions;
DROP POLICY IF EXISTS "Offer versions viewable by authenticated users" ON public.offer_versions;
DROP POLICY IF EXISTS "All authenticated users can view offer versions" ON public.offer_versions;

CREATE POLICY "HR Admin can view offer versions"
ON public.offer_versions FOR SELECT
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 16. FIX PROFILES TABLE - Drop existing first
DROP POLICY IF EXISTS "Users can view own profile or HR Admin can view all" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "All authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile or HR Admin can view all"
ON public.profiles FOR SELECT
USING (
  id = auth.uid()
  OR public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 17. ADD POLICIES TO EMAIL_ACTION_TOKENS TABLE - Drop existing first
DROP POLICY IF EXISTS "Users can view own tokens" ON public.email_action_tokens;
DROP POLICY IF EXISTS "HR Admin can view all tokens" ON public.email_action_tokens;

CREATE POLICY "Users can view own tokens"
ON public.email_action_tokens FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "HR Admin can view all tokens"
ON public.email_action_tokens FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- 18. FIX STORAGE BUCKETS - Make them private
UPDATE storage.buckets SET public = false WHERE id IN ('docx-templates', 'benefit-documents');

-- 19. UPDATE STORAGE POLICIES FOR DOCX-TEMPLATES (HR/Admin only)
DROP POLICY IF EXISTS "Allow public access to docx templates" ON storage.objects;
DROP POLICY IF EXISTS "Public can view docx templates" ON storage.objects;
DROP POLICY IF EXISTS "HR Admin can access docx templates" ON storage.objects;

CREATE POLICY "HR Admin can access docx templates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'docx-templates'
  AND public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- 20. UPDATE STORAGE POLICIES FOR BENEFIT-DOCUMENTS (Authenticated users only)
DROP POLICY IF EXISTS "Allow public access to benefit documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can view benefit documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view benefit documents" ON storage.objects;

CREATE POLICY "Authenticated users can view benefit documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'benefit-documents'
  AND auth.role() = 'authenticated'
);