-- Add offer_expiry_date column to offer_versions
ALTER TABLE offer_versions
ADD COLUMN IF NOT EXISTS offer_expiry_date date;

-- Fix the <<Department>> smart tag field mapping (was 'name', should be 'department')
UPDATE smart_tags
SET field = 'department'
WHERE tag = '<<Department>>' AND field = 'name';

-- Fix the <<Manager Name>> smart tag field mapping (was 'full_name', should be 'manager_name')
UPDATE smart_tags
SET field = 'manager_name'
WHERE tag = '<<Manager Name>>' AND field = 'full_name';

-- Add <<Offer Expiry Date>> smart tag if it doesn't exist
INSERT INTO smart_tags (tag, field, source, category, description, is_active, is_system)
VALUES ('<<Offer Expiry Date>>', 'offer_expiry_date', 'offer', 'Offer Details', 'The expiration date for this offer', true, true)
ON CONFLICT DO NOTHING;