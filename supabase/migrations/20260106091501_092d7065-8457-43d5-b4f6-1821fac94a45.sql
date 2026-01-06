-- Add salary deduction columns to leave_types
ALTER TABLE leave_types ADD COLUMN has_salary_deduction boolean DEFAULT false;
ALTER TABLE leave_types ADD COLUMN salary_deduction_tiers jsonb DEFAULT '[]'::jsonb;