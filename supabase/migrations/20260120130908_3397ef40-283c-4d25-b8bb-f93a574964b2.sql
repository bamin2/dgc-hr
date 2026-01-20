-- Create sequence for employee codes starting after highest existing code (29)
CREATE SEQUENCE IF NOT EXISTS public.employee_code_seq START WITH 30;

-- Create trigger function to auto-generate employee code
CREATE OR REPLACE FUNCTION public.generate_employee_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.employee_code IS NULL OR NEW.employee_code = '' THEN
    NEW.employee_code := 'EMP-' || LPAD(nextval('employee_code_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger to run before insert on employees
CREATE TRIGGER generate_employee_code_trigger
  BEFORE INSERT ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_employee_code();