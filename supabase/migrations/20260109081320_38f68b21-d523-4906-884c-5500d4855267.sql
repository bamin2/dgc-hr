-- Create banks table
CREATE TABLE public.banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  swift_code TEXT,
  country TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read banks
CREATE POLICY "Authenticated users can read banks" 
  ON public.banks FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy for authenticated users to manage banks (for now, will be restricted by app logic)
CREATE POLICY "Authenticated users can manage banks" 
  ON public.banks FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_banks_updated_at
  BEFORE UPDATE ON public.banks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();