-- Add is_variable and default_amount columns to allowance_templates
ALTER TABLE allowance_templates
ADD COLUMN is_variable BOOLEAN DEFAULT false,
ADD COLUMN default_amount NUMERIC DEFAULT 0;

-- Migrate existing data: copy current amount to default_amount
UPDATE allowance_templates SET default_amount = amount;

-- Add percentage column to employee_allowances for percentage-based overrides
ALTER TABLE employee_allowances
ADD COLUMN percentage NUMERIC;