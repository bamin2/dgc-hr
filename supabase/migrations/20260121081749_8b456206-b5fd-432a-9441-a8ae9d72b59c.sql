-- Add office_phone column to employees table
ALTER TABLE employees ADD COLUMN office_phone TEXT;

-- Add comments for clarity
COMMENT ON COLUMN employees.phone IS 'Mobile phone number';
COMMENT ON COLUMN employees.office_phone IS 'Office/work phone number';