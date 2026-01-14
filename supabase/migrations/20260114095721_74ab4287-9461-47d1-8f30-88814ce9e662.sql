-- Add origin_country and origin_city columns to business_trips
ALTER TABLE public.business_trips 
ADD COLUMN origin_country TEXT,
ADD COLUMN origin_city TEXT;