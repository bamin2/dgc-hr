-- Add is_hq column to work_locations table
ALTER TABLE work_locations 
ADD COLUMN is_hq boolean DEFAULT false;