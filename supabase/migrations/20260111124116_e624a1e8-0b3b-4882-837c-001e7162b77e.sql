-- Fix Company Name and Company Legal Name smart tags to use correct field names
UPDATE smart_tags
SET field = 'company_name'
WHERE tag = '<<Company Name>>' AND field = 'name';

UPDATE smart_tags
SET field = 'company_legal_name'
WHERE tag = '<<Company Legal Name>>' AND field = 'legal_name';

-- Update any other company-related smart tags
UPDATE smart_tags
SET field = 'company_email'
WHERE tag = '<<Company Email>>' AND field = 'email';

UPDATE smart_tags
SET field = 'company_phone'
WHERE tag = '<<Company Phone>>' AND field = 'phone';

UPDATE smart_tags
SET field = 'company_full_address'
WHERE tag = '<<Company Address>>' AND field = 'full_address';

UPDATE smart_tags
SET field = 'company_logo_url'
WHERE tag = '<<Company Logo>>' AND field = 'logo_url';