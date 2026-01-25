-- Create cost_frequency enum type
CREATE TYPE public.cost_frequency AS ENUM ('monthly', 'yearly');

-- Add cost_frequency column to benefit_plans table
ALTER TABLE public.benefit_plans
ADD COLUMN cost_frequency public.cost_frequency NOT NULL DEFAULT 'monthly';

-- Backfill existing health-related plans to yearly
UPDATE public.benefit_plans
SET cost_frequency = 'yearly'
WHERE type IN ('health', 'dental', 'vision', 'life', 'disability');