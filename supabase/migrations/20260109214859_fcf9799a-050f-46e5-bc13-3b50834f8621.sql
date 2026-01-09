-- Create email template versions table
CREATE TABLE public.email_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body_content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  change_summary TEXT
);

-- Index for fast lookups
CREATE INDEX idx_email_template_versions_template_id ON public.email_template_versions(template_id);
CREATE INDEX idx_email_template_versions_created_at ON public.email_template_versions(created_at DESC);

-- Enable RLS
ALTER TABLE public.email_template_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies - HR and Admin can view and manage versions
CREATE POLICY "HR and Admin can view email template versions"
  ON public.email_template_versions
  FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['hr'::public.app_role, 'admin'::public.app_role]));

CREATE POLICY "HR and Admin can insert email template versions"
  ON public.email_template_versions
  FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr'::public.app_role, 'admin'::public.app_role]));

-- Create trigger function to auto-save version on template update
CREATE OR REPLACE FUNCTION public.save_email_template_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Only save version if subject or body_content changed
  IF OLD.subject IS DISTINCT FROM NEW.subject OR OLD.body_content IS DISTINCT FROM NEW.body_content OR OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM public.email_template_versions
    WHERE template_id = OLD.id;
    
    -- Save the OLD values as a version (before the change)
    INSERT INTO public.email_template_versions (
      template_id,
      version_number,
      subject,
      body_content,
      is_active,
      created_by,
      change_summary
    ) VALUES (
      OLD.id,
      next_version,
      OLD.subject,
      OLD.body_content,
      OLD.is_active,
      auth.uid(),
      CASE
        WHEN OLD.subject IS DISTINCT FROM NEW.subject AND OLD.body_content IS DISTINCT FROM NEW.body_content THEN 'Updated subject and body'
        WHEN OLD.subject IS DISTINCT FROM NEW.subject THEN 'Updated subject'
        WHEN OLD.body_content IS DISTINCT FROM NEW.body_content THEN 'Updated body content'
        WHEN OLD.is_active IS DISTINCT FROM NEW.is_active THEN 'Changed active status'
        ELSE 'Updated template'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER save_email_template_version_trigger
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.save_email_template_version();