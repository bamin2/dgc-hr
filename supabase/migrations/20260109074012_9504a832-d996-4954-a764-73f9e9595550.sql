-- Add bank account fields to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT;