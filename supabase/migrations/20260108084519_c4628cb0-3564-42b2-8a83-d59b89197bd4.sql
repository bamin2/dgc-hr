-- Add GOSI base calculation method column to work_locations
ALTER TABLE work_locations 
ADD COLUMN gosi_base_calculation TEXT DEFAULT 'gosi_registered_salary';

-- Add comment for documentation
COMMENT ON COLUMN work_locations.gosi_base_calculation IS 'How to calculate GOSI base: gosi_registered_salary or basic_plus_housing';