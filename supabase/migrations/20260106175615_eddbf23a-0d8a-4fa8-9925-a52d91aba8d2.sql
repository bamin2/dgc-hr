-- Add job_description column to positions table
ALTER TABLE public.positions 
ADD COLUMN job_description TEXT;