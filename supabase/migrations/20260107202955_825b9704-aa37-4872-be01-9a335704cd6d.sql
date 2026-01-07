-- Add work_location_id foreign key to allowance_templates
ALTER TABLE allowance_templates
ADD COLUMN work_location_id UUID REFERENCES work_locations(id) ON DELETE CASCADE;

-- Add work_location_id foreign key to deduction_templates  
ALTER TABLE deduction_templates
ADD COLUMN work_location_id UUID REFERENCES work_locations(id) ON DELETE CASCADE;

-- Create indexes for faster lookups by work location
CREATE INDEX idx_allowance_templates_work_location ON allowance_templates(work_location_id);
CREATE INDEX idx_deduction_templates_work_location ON deduction_templates(work_location_id);