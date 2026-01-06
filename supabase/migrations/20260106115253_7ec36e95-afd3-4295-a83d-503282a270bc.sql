-- Add currency column to work_locations
ALTER TABLE work_locations ADD COLUMN currency TEXT DEFAULT 'USD';

-- Update existing locations with their correct currencies
UPDATE work_locations SET currency = 'BHD' WHERE country = 'Bahrain';
UPDATE work_locations SET currency = 'SAR' WHERE country = 'Saudi Arabia';