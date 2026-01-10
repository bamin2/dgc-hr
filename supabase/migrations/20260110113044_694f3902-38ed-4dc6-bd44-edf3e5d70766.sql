-- Remove the duplicate 'employee' role from admin user (keeping only 'admin' role)
DELETE FROM public.user_roles 
WHERE id = '32b7774a-14d6-462f-832a-a3749e088c51'
  AND role = 'employee'
  AND user_id = '7c6d1d76-3962-41ba-866d-9e774dc25bcd';