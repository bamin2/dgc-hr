-- Create payroll_runs table
CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  employee_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  processed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll_records table
CREATE TABLE public.payroll_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  base_salary NUMERIC NOT NULL DEFAULT 0,
  overtime NUMERIC NOT NULL DEFAULT 0,
  bonuses NUMERIC NOT NULL DEFAULT 0,
  tax_deduction NUMERIC NOT NULL DEFAULT 0,
  insurance_deduction NUMERIC NOT NULL DEFAULT 0,
  other_deduction NUMERIC NOT NULL DEFAULT 0,
  net_pay NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'paid',
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for now)
CREATE POLICY "Allow public read access on payroll_runs"
ON public.payroll_runs
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access on payroll_runs"
ON public.payroll_runs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public read access on payroll_records"
ON public.payroll_records
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access on payroll_records"
ON public.payroll_records
FOR INSERT
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_payroll_runs_processed_date ON public.payroll_runs(processed_date DESC);
CREATE INDEX idx_payroll_records_run_id ON public.payroll_records(payroll_run_id);