
-- 1. Create leave_request_attachments table
CREATE TABLE public.leave_request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_request_attachments ENABLE ROW LEVEL SECURITY;

-- HR/admin can do everything
CREATE POLICY "HR and admin can manage leave attachments"
ON public.leave_request_attachments
FOR ALL
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
)
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- Employees can view attachments on their own requests
CREATE POLICY "Employees can view own request attachments"
ON public.leave_request_attachments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_id AND e.user_id = auth.uid()
  )
);

-- Employees can insert attachments on their own requests
CREATE POLICY "Employees can insert own request attachments"
ON public.leave_request_attachments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_id AND e.user_id = auth.uid()
  )
);

-- 2. Add attachment_required column to leave_types
ALTER TABLE public.leave_types ADD COLUMN attachment_required BOOLEAN DEFAULT false;

-- 3. Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('leave-attachments', 'leave-attachments', false);

-- Storage policies
CREATE POLICY "Authenticated users can upload leave attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'leave-attachments');

CREATE POLICY "Authenticated users can read leave attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'leave-attachments');

CREATE POLICY "HR and admin can delete leave attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'leave-attachments'
  AND public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);
