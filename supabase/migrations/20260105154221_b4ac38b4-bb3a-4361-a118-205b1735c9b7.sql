-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Display preferences
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'system',
  default_page TEXT DEFAULT 'dashboard',
  items_per_page INTEGER DEFAULT 25,
  compact_mode BOOLEAN DEFAULT false,
  -- Regional preferences  
  timezone TEXT DEFAULT 'America/Los_Angeles',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h',
  first_day_of_week TEXT DEFAULT 'sunday',
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Email notifications
  email_new_employee BOOLEAN DEFAULT true,
  email_leave_submissions BOOLEAN DEFAULT true,
  email_leave_approvals BOOLEAN DEFAULT true,
  email_payroll_reminders BOOLEAN DEFAULT true,
  email_document_expiration BOOLEAN DEFAULT true,
  email_system_announcements BOOLEAN DEFAULT true,
  email_weekly_summary BOOLEAN DEFAULT false,
  -- Push notifications
  push_enabled BOOLEAN DEFAULT true,
  push_new_leave_requests BOOLEAN DEFAULT true,
  push_urgent_approvals BOOLEAN DEFAULT true,
  push_payroll_deadlines BOOLEAN DEFAULT true,
  push_system_updates BOOLEAN DEFAULT false,
  -- Schedule
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',
  weekend_notifications BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification preferences
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own notification preferences
CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own notification preferences
CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create company_settings_audit table
CREATE TABLE public.company_settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_settings_id UUID NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT
);

-- Enable RLS
ALTER TABLE public.company_settings_audit ENABLE ROW LEVEL SECURITY;

-- HR and Admin can view audit logs
CREATE POLICY "HR and Admin can view audit logs"
  ON public.company_settings_audit FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Create function to record company settings changes
CREATE OR REPLACE FUNCTION public.record_company_settings_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  col TEXT;
  old_val TEXT;
  new_val TEXT;
  cols TEXT[] := ARRAY['name', 'legal_name', 'industry', 'company_size', 
    'tax_id', 'year_founded', 'email', 'phone', 'website', 
    'address_street', 'address_city', 'address_state', 'address_zip_code', 
    'address_country', 'logo_url', 'primary_color', 'timezone', 
    'date_format', 'currency'];
BEGIN
  FOREACH col IN ARRAY cols
  LOOP
    EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', col, col)
    INTO old_val, new_val
    USING OLD, NEW;
    
    IF old_val IS DISTINCT FROM new_val THEN
      INSERT INTO public.company_settings_audit 
        (company_settings_id, changed_by, field_name, old_value, new_value)
      VALUES (NEW.id, auth.uid(), col, old_val, new_val);
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for company settings audit
CREATE TRIGGER company_settings_audit_trigger
  AFTER UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION record_company_settings_change();

-- Add phone and job_title to profiles if not exists
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT;