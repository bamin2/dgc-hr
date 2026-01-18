-- Add is_required column to document_types for compliance snapshot report
ALTER TABLE document_types 
ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT false;

-- Mark essential document types as required
UPDATE document_types 
SET is_required = true 
WHERE name IN ('ID Card', 'Passport', 'Work Visa', 'CPR', 'National ID', 'Residence Permit', 'Work Permit');

-- Add comment for documentation
COMMENT ON COLUMN document_types.is_required IS 'Indicates if this document type is required for compliance reporting';