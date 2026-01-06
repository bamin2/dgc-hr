-- Create work_locations table
CREATE TABLE public.work_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view work locations"
  ON public.work_locations FOR SELECT
  USING (true);

CREATE POLICY "HR and Admin can insert work locations"
  ON public.work_locations FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update work locations"
  ON public.work_locations FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete work locations"
  ON public.work_locations FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Insert initial work locations
INSERT INTO public.work_locations (name, city, country) VALUES
  ('Bahrain Office', 'Manama', 'Bahrain'),
  ('Riyadh Office', 'Riyadh', 'Saudi Arabia');

-- Add work_location_id to employees table
ALTER TABLE public.employees 
ADD COLUMN work_location_id UUID REFERENCES public.work_locations(id);