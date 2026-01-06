-- Create employee_imports table to track import batches
CREATE TABLE public.employee_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by UUID REFERENCES auth.users(id),
  imported_at TIMESTAMPTZ DEFAULT now(),
  filename TEXT,
  total_records INTEGER NOT NULL,
  successful_records INTEGER NOT NULL,
  failed_records INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'rolled_back')),
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add import_batch_id column to employees table
ALTER TABLE public.employees ADD COLUMN import_batch_id UUID REFERENCES public.employee_imports(id) ON DELETE SET NULL;

-- Enable RLS on employee_imports
ALTER TABLE public.employee_imports ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_imports (HR/Admin can view and manage)
CREATE POLICY "Authenticated users can view import history"
ON public.employee_imports
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert imports"
ON public.employee_imports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = imported_by);

CREATE POLICY "Authenticated users can update their imports"
ON public.employee_imports
FOR UPDATE
TO authenticated
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_employees_import_batch_id ON public.employees(import_batch_id);
CREATE INDEX idx_employee_imports_imported_at ON public.employee_imports(imported_at DESC);