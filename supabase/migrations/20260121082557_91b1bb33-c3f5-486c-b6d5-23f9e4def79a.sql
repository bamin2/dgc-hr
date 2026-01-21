ALTER TABLE employees 
ADD COLUMN mobile_country_code TEXT DEFAULT 'BH',
ADD COLUMN office_country_code TEXT DEFAULT 'BH';

COMMENT ON COLUMN employees.mobile_country_code IS 'ISO country code for mobile number (e.g., BH, US)';
COMMENT ON COLUMN employees.office_country_code IS 'ISO country code for office number (e.g., BH, US)';