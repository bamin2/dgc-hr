-- Create enums for team member fields
CREATE TYPE worker_type AS ENUM ('employee', 'contractor_individual', 'contractor_business');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract');
CREATE TYPE pay_frequency AS ENUM ('hour', 'day', 'week', 'month', 'year');

-- Extend employees table with team member fields
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS worker_type worker_type DEFAULT 'employee',
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS employment_type employment_type DEFAULT 'full_time',
ADD COLUMN IF NOT EXISTS pay_frequency pay_frequency DEFAULT 'month',
ADD COLUMN IF NOT EXISTS work_location TEXT,
ADD COLUMN IF NOT EXISTS tax_exemption_status TEXT,
ADD COLUMN IF NOT EXISTS send_offer_letter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS offer_letter_template TEXT;

-- Update existing employees with sensible defaults
UPDATE employees
SET 
  worker_type = 'employee',
  employment_type = 'full_time',
  pay_frequency = 'month'
WHERE worker_type IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN employees.preferred_name IS 'Preferred name/nickname for the employee';
COMMENT ON COLUMN employees.worker_type IS 'Type of worker: employee, contractor_individual, contractor_business';
COMMENT ON COLUMN employees.country IS 'Country code (e.g., US, GB, CA)';
COMMENT ON COLUMN employees.employment_type IS 'Employment type: full_time, part_time, contract';
COMMENT ON COLUMN employees.pay_frequency IS 'Payment frequency: hour, day, week, month, year';
COMMENT ON COLUMN employees.work_location IS 'Work location: Remote, Office name, etc.';
COMMENT ON COLUMN employees.tax_exemption_status IS 'Tax exemption status for payroll';
COMMENT ON COLUMN employees.send_offer_letter IS 'Whether to send an offer letter';
COMMENT ON COLUMN employees.offer_letter_template IS 'Template ID for offer letter';