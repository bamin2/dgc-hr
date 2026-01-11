-- Fix smart_tags field for Work Location to match baseData key
UPDATE smart_tags 
SET field = 'work_location' 
WHERE tag = '<<Work Location>>' AND field = 'name';