ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS employee_table_columns jsonb DEFAULT '["name", "email", "department", "jobTitle", "joinDate", "status"]';