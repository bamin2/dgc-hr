-- Assign admin role to Bader Amin
INSERT INTO user_roles (user_id, role)
VALUES ('7c6d1d76-3962-41ba-866d-9e774dc25bcd', 'admin');

-- Link profile to employee record
UPDATE profiles 
SET employee_id = '11b4f502-bd8f-452c-be74-4184dcd54f2d'
WHERE id = '7c6d1d76-3962-41ba-866d-9e774dc25bcd';

-- Link employee record to user
UPDATE employees 
SET user_id = '7c6d1d76-3962-41ba-866d-9e774dc25bcd'
WHERE id = '11b4f502-bd8f-452c-be74-4184dcd54f2d';