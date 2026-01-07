-- Add GOSI-related fields to employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS gosi_registered_salary numeric,
ADD COLUMN IF NOT EXISTS is_subject_to_gosi boolean DEFAULT false;

-- Auto-set is_subject_to_gosi for existing Bahraini employees
UPDATE employees 
SET is_subject_to_gosi = true 
WHERE nationality = 'Bahrain' AND is_subject_to_gosi = false;

-- Create validation function for GOSI salary requirement
CREATE OR REPLACE FUNCTION validate_gosi_salary()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_subject_to_gosi = true AND NEW.gosi_registered_salary IS NULL THEN
    RAISE EXCEPTION 'GOSI registered salary is required for employees subject to GOSI';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS check_gosi_salary ON employees;
CREATE TRIGGER check_gosi_salary
BEFORE INSERT OR UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION validate_gosi_salary();

-- Update GOSI deduction template to use gosi_registered_salary
UPDATE deduction_templates 
SET percentage_of = 'gosi_registered_salary'
WHERE name = 'GOSI - Bahraini';

-- Create salary_update_batches table for audit
CREATE TABLE IF NOT EXISTS salary_update_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiated_by uuid REFERENCES auth.users(id) NOT NULL,
  initiated_at timestamptz DEFAULT now(),
  effective_date date NOT NULL,
  
  -- Selection criteria
  filter_criteria jsonb,
  employee_ids uuid[] NOT NULL,
  employee_count integer NOT NULL,
  
  -- Update parameters
  update_type text NOT NULL,
  update_value numeric,
  
  -- Components
  components_changed jsonb,
  gosi_salary_changed boolean DEFAULT false,
  
  -- Impact totals
  total_before_salary numeric,
  total_after_salary numeric,
  total_change numeric,
  
  -- Metadata
  change_type text NOT NULL,
  reason text NOT NULL,
  notes text,
  
  created_at timestamptz DEFAULT now()
);

-- Create per-employee snapshot table for audit
CREATE TABLE IF NOT EXISTS salary_update_batch_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES salary_update_batches(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES employees(id) NOT NULL,
  
  -- Before snapshot
  before_basic_salary numeric,
  before_total_allowances numeric,
  before_total_deductions numeric,
  before_net_salary numeric,
  before_gosi_registered_salary numeric,
  before_gosi_deduction numeric,
  
  -- After snapshot
  after_basic_salary numeric,
  after_total_allowances numeric,
  after_total_deductions numeric,
  after_net_salary numeric,
  after_gosi_registered_salary numeric,
  after_gosi_deduction numeric,
  
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE salary_update_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_update_batch_employees ENABLE ROW LEVEL SECURITY;

-- Secure RLS policies - only creator can manage their batches
CREATE POLICY "Users can view their own salary batches"
ON salary_update_batches FOR SELECT TO authenticated
USING (initiated_by = auth.uid());

CREATE POLICY "Users can create salary batches"
ON salary_update_batches FOR INSERT TO authenticated
WITH CHECK (initiated_by = auth.uid());

CREATE POLICY "Users can update their own salary batches"
ON salary_update_batches FOR UPDATE TO authenticated
USING (initiated_by = auth.uid())
WITH CHECK (initiated_by = auth.uid());

CREATE POLICY "Users can delete their own salary batches"
ON salary_update_batches FOR DELETE TO authenticated
USING (initiated_by = auth.uid());

-- Batch employees policies - tied to batch ownership
CREATE POLICY "Users can view batch employees for their batches"
ON salary_update_batch_employees FOR SELECT TO authenticated
USING (
  batch_id IN (
    SELECT id FROM salary_update_batches WHERE initiated_by = auth.uid()
  )
);

CREATE POLICY "Users can insert batch employees for their batches"
ON salary_update_batch_employees FOR INSERT TO authenticated
WITH CHECK (
  batch_id IN (
    SELECT id FROM salary_update_batches WHERE initiated_by = auth.uid()
  )
);

CREATE POLICY "Users can update batch employees for their batches"
ON salary_update_batch_employees FOR UPDATE TO authenticated
USING (
  batch_id IN (
    SELECT id FROM salary_update_batches WHERE initiated_by = auth.uid()
  )
);

CREATE POLICY "Users can delete batch employees for their batches"
ON salary_update_batch_employees FOR DELETE TO authenticated
USING (
  batch_id IN (
    SELECT id FROM salary_update_batches WHERE initiated_by = auth.uid()
  )
);