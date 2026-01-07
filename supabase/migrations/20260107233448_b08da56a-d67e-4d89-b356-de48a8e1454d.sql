-- Add GOSI nationality rates as JSONB column
ALTER TABLE work_locations 
ADD COLUMN gosi_nationality_rates JSONB DEFAULT '[]'::JSONB;

-- Drop the old single percentage column (no longer needed)
ALTER TABLE work_locations 
DROP COLUMN IF EXISTS gosi_percentage;