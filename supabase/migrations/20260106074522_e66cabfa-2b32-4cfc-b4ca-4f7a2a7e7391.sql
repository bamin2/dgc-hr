-- Create enum types for offboarding
CREATE TYPE public.offboarding_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.departure_reason AS ENUM ('resignation', 'termination', 'retirement', 'end_of_contract', 'other');
CREATE TYPE public.notice_period_status AS ENUM ('serving', 'waived', 'garden_leave');
CREATE TYPE public.interview_format AS ENUM ('in_person', 'video', 'written');
CREATE TYPE public.asset_type AS ENUM ('hardware', 'keycard', 'documents', 'other');
CREATE TYPE public.asset_condition AS ENUM ('pending', 'good', 'damaged', 'missing');
CREATE TYPE public.access_system_type AS ENUM ('email', 'cloud', 'internal', 'third_party', 'physical');
CREATE TYPE public.access_status AS ENUM ('active', 'scheduled', 'revoked');

-- Create offboarding_records table (main offboarding record)
CREATE TABLE public.offboarding_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  status offboarding_status NOT NULL DEFAULT 'pending',
  last_working_day DATE NOT NULL,
  departure_reason departure_reason NOT NULL DEFAULT 'resignation',
  resignation_letter_received BOOLEAN DEFAULT false,
  notice_period_status notice_period_status DEFAULT 'serving',
  manager_confirmed BOOLEAN DEFAULT false,
  hr_contact_id UUID REFERENCES public.employees(id),
  it_contact_id UUID REFERENCES public.employees(id),
  data_backup_required BOOLEAN DEFAULT true,
  email_forwarding BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exit_interviews table
CREATE TABLE public.exit_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offboarding_record_id UUID NOT NULL REFERENCES public.offboarding_records(id) ON DELETE CASCADE,
  scheduled_date DATE,
  scheduled_time TEXT,
  interviewer_id UUID REFERENCES public.employees(id),
  format interview_format DEFAULT 'in_person',
  skip_interview BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offboarding_assets table
CREATE TABLE public.offboarding_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offboarding_record_id UUID NOT NULL REFERENCES public.offboarding_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type asset_type NOT NULL DEFAULT 'other',
  serial_number TEXT,
  condition asset_condition NOT NULL DEFAULT 'pending',
  notes TEXT,
  returned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offboarding_access_systems table
CREATE TABLE public.offboarding_access_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offboarding_record_id UUID NOT NULL REFERENCES public.offboarding_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type access_system_type NOT NULL DEFAULT 'internal',
  access_level TEXT,
  revocation_date DATE,
  status access_status NOT NULL DEFAULT 'scheduled',
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.offboarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_access_systems ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offboarding_records
CREATE POLICY "HR and Admin can view all offboarding records"
  ON public.offboarding_records FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can insert offboarding records"
  ON public.offboarding_records FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update offboarding records"
  ON public.offboarding_records FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete offboarding records"
  ON public.offboarding_records FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Managers can view their reports offboarding"
  ON public.offboarding_records FOR SELECT
  USING (is_manager_of(employee_id, auth.uid()));

-- RLS Policies for exit_interviews
CREATE POLICY "HR and Admin can view all exit interviews"
  ON public.exit_interviews FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can manage exit interviews"
  ON public.exit_interviews FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for offboarding_assets
CREATE POLICY "HR and Admin can view all offboarding assets"
  ON public.offboarding_assets FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can manage offboarding assets"
  ON public.offboarding_assets FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for offboarding_access_systems
CREATE POLICY "HR and Admin can view all offboarding access systems"
  ON public.offboarding_access_systems FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can manage offboarding access systems"
  ON public.offboarding_access_systems FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Create indexes
CREATE INDEX idx_offboarding_records_employee_id ON public.offboarding_records(employee_id);
CREATE INDEX idx_offboarding_records_status ON public.offboarding_records(status);
CREATE INDEX idx_exit_interviews_offboarding_record_id ON public.exit_interviews(offboarding_record_id);
CREATE INDEX idx_offboarding_assets_offboarding_record_id ON public.offboarding_assets(offboarding_record_id);
CREATE INDEX idx_offboarding_access_systems_offboarding_record_id ON public.offboarding_access_systems(offboarding_record_id);