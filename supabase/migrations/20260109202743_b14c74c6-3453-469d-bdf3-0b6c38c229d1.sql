-- Add Passport Number and CPR Number smart tags
INSERT INTO public.smart_tags (tag, field, source, category, description, is_system, is_active) 
VALUES 
  ('<<Passport Number>>', 'passport_number', 'employee', 'Employee', 'Employee''s passport number', true, true),
  ('<<CPR Number>>', 'cpr_number', 'employee', 'Employee', 'Employee''s CPR (Civil Personal Registration) number', true, true);