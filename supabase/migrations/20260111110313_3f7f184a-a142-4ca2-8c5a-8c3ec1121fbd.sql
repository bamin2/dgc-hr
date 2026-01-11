-- Add smart tags for current user's name and position
INSERT INTO smart_tags (tag, field, source, category, description, is_active, is_system)
VALUES 
  ('<<Current User Name>>', 'current_user_name', 'system', 'System', 'Name of the user generating this document', true, true),
  ('<<Current User Position>>', 'current_user_position', 'system', 'System', 'Job title of the user generating this document', true, true)
ON CONFLICT DO NOTHING;