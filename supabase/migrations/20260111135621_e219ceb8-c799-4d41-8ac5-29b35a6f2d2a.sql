-- Add column to store PDF storage path when offer letter is sent
ALTER TABLE offer_versions 
ADD COLUMN pdf_storage_path TEXT;