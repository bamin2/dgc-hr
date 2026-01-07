-- Add GOSI configuration columns to work_locations
ALTER TABLE public.work_locations 
ADD COLUMN gosi_enabled BOOLEAN DEFAULT false,
ADD COLUMN gosi_percentage DECIMAL(5,2) DEFAULT 8.00;