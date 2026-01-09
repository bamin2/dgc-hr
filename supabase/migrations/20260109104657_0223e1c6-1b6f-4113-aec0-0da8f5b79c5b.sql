-- Create email_logs table for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  resend_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for querying
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_user_id, email_type);
CREATE INDEX idx_email_logs_employee ON public.email_logs(employee_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_created ON public.email_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- HR and Admin can view all email logs
CREATE POLICY "HR and Admin can view email logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['hr'::public.app_role, 'admin'::public.app_role]));

-- HR and Admin can insert email logs (via edge functions)
CREATE POLICY "HR and Admin can insert email logs"
ON public.email_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr'::public.app_role, 'admin'::public.app_role]));

-- Service role can manage email logs (for edge functions)
CREATE POLICY "Service role can manage email logs"
ON public.email_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);