-- Add second_name column for middle/second name
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS second_name text;

-- Add generated full_name column that auto-populates from first_name, second_name, and last_name
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS full_name text GENERATED ALWAYS AS (
  TRIM(
    COALESCE(first_name, '') || 
    CASE WHEN second_name IS NOT NULL AND second_name != '' 
         THEN ' ' || second_name 
         ELSE '' 
    END || 
    ' ' || COALESCE(last_name, '')
  )
) STORED;