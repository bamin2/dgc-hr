-- Add payroll day setting to company_settings
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS payroll_day_of_month INTEGER DEFAULT 25;