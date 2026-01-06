-- Add weekend_days to company_settings (0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday)
-- Default {5,6} for Bahrain (Friday-Saturday weekend)
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS weekend_days INTEGER[] DEFAULT '{5,6}';

-- Create public_holidays table
CREATE TABLE public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  observed_date DATE NOT NULL,
  year INTEGER NOT NULL,
  is_compensated BOOLEAN DEFAULT false,
  compensation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(date, name)
);

-- Enable RLS
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "public_holidays_select" ON public_holidays
  FOR SELECT TO authenticated USING (true);

-- All authenticated users can manage
CREATE POLICY "public_holidays_insert" ON public_holidays
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "public_holidays_update" ON public_holidays
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_holidays_delete" ON public_holidays
  FOR DELETE TO authenticated USING (true);

-- Indexes for efficient queries
CREATE INDEX idx_public_holidays_year ON public_holidays(year);
CREATE INDEX idx_public_holidays_observed ON public_holidays(observed_date);

-- Seed Bahrain 2026 public holidays
INSERT INTO public_holidays (name, date, observed_date, year, is_compensated, compensation_reason) VALUES
  ('New Year''s Day', '2026-01-01', '2026-01-01', 2026, false, NULL),
  ('Eid Al Fitr Day 1', '2026-03-20', '2026-03-22', 2026, true, 'Moved from Friday'),
  ('Eid Al Fitr Day 2', '2026-03-21', '2026-03-23', 2026, true, 'Moved from Saturday'),
  ('Eid Al Fitr Day 3', '2026-03-22', '2026-03-22', 2026, false, NULL),
  ('Labour Day', '2026-05-01', '2026-05-03', 2026, true, 'Moved from Friday'),
  ('Eid Al Adha Day 1', '2026-05-27', '2026-05-27', 2026, false, NULL),
  ('Eid Al Adha Day 2', '2026-05-28', '2026-05-28', 2026, false, NULL),
  ('Eid Al Adha Day 3', '2026-05-29', '2026-05-31', 2026, true, 'Moved from Friday'),
  ('Al Hijra New Year', '2026-06-16', '2026-06-16', 2026, false, NULL),
  ('Ashoora Day 1', '2026-06-24', '2026-06-24', 2026, false, NULL),
  ('Ashoora Day 2', '2026-06-25', '2026-06-25', 2026, false, NULL),
  ('Prophet''s Birthday', '2026-08-25', '2026-08-25', 2026, false, NULL),
  ('National Day 1', '2026-12-16', '2026-12-16', 2026, false, NULL),
  ('National Day 2', '2026-12-17', '2026-12-17', 2026, false, NULL);