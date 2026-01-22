-- Add new benefit types to the enum
ALTER TYPE benefit_type ADD VALUE IF NOT EXISTS 'air_ticket';
ALTER TYPE benefit_type ADD VALUE IF NOT EXISTS 'car_park';
ALTER TYPE benefit_type ADD VALUE IF NOT EXISTS 'phone';

-- Add type-specific configuration column to benefit_plans
ALTER TABLE benefit_plans ADD COLUMN IF NOT EXISTS entitlement_config JSONB DEFAULT NULL;

-- Add tracking data column to benefit_enrollments
ALTER TABLE benefit_enrollments ADD COLUMN IF NOT EXISTS entitlement_data JSONB DEFAULT NULL;

-- Create air ticket usage tracking table
CREATE TABLE IF NOT EXISTS benefit_ticket_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES benefit_enrollments(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on the new table
ALTER TABLE benefit_ticket_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for benefit_ticket_usage
CREATE POLICY "HR and Admin can manage ticket usage"
ON benefit_ticket_usage
FOR ALL
USING (has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "Employees can view their own ticket usage"
ON benefit_ticket_usage
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM benefit_enrollments be
    JOIN employees e ON be.employee_id = e.id
    WHERE be.id = benefit_ticket_usage.enrollment_id
    AND e.user_id = auth.uid()
  )
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_benefit_ticket_usage_enrollment_id ON benefit_ticket_usage(enrollment_id);

-- Add comment explaining the JSONB structures
COMMENT ON COLUMN benefit_plans.entitlement_config IS 'Type-specific config: air_ticket: {tickets_per_period, period_years}, phone: {total_device_cost, monthly_installment, installment_months}, car_park: {spot_location}';
COMMENT ON COLUMN benefit_enrollments.entitlement_data IS 'Tracking data: air_ticket: {tickets_used, last_ticket_date}, phone: {installments_paid, total_paid, remaining_balance}';