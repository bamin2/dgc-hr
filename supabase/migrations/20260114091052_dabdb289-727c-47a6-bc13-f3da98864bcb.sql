-- ==============================================
-- Business Trips Module - Complete Database Schema
-- ==============================================

-- 1. Business Trip Destinations (per diem rates by location)
CREATE TABLE public.business_trip_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  city TEXT,
  per_diem_rate_bhd DECIMAL(10,3) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Business Trip Settings (singleton policy table)
CREATE TABLE public.business_trip_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_enabled BOOLEAN DEFAULT true,
  car_uplift_per_night_bhd DECIMAL(10,3) DEFAULT 20.000,
  require_receipts BOOLEAN DEFAULT false,
  max_nights_without_override INTEGER,
  allow_cancellation_after_submit BOOLEAN DEFAULT true,
  allow_edit_after_submit BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,
  inapp_notifications_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 3. Main Business Trips table
CREATE TABLE public.business_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  origin_location_id UUID REFERENCES public.work_locations(id),
  destination_id UUID REFERENCES public.business_trip_destinations(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  nights_count INTEGER NOT NULL,
  travel_mode TEXT NOT NULL DEFAULT 'plane' CHECK (travel_mode IN ('plane', 'car')),
  corporate_card_used BOOLEAN DEFAULT false,
  per_diem_rate_bhd DECIMAL(10,3) NOT NULL DEFAULT 0,
  car_uplift_per_night_bhd DECIMAL(10,3) DEFAULT 0,
  car_uplift_total_bhd DECIMAL(10,3) DEFAULT 0,
  per_diem_budget_bhd DECIMAL(10,3) NOT NULL DEFAULT 0,
  per_diem_payable_bhd DECIMAL(10,3) NOT NULL DEFAULT 0,
  flight_details TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'manager_approved', 'hr_approved', 
    'rejected', 'cancelled', 'completed', 'reconciled'
  )),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Business Trip Expenses (reimbursable items)
CREATE TABLE public.business_trip_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.business_trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('hotel', 'transport', 'meals', 'other')),
  amount_bhd DECIMAL(10,3) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  hr_status TEXT DEFAULT 'pending' CHECK (hr_status IN ('pending', 'approved', 'partially_approved', 'rejected')),
  hr_approved_amount_bhd DECIMAL(10,3),
  hr_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Business Trip Amendments
CREATE TABLE public.business_trip_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.business_trips(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('dates', 'destination', 'travel_mode', 'other')),
  proposed_values JSONB NOT NULL,
  original_values JSONB NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'manager_approved', 'hr_approved', 'rejected', 'cancelled')),
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Business Trip Attachments
CREATE TABLE public.business_trip_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.business_trips(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================
-- Enable RLS on all tables
-- ==============================================
ALTER TABLE public.business_trip_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trip_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trip_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trip_attachments ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- RLS Policies for Destinations
-- ==============================================
CREATE POLICY "Anyone authenticated can view active destinations"
  ON public.business_trip_destinations FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "HR/Admin can manage destinations"
  ON public.business_trip_destinations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

-- ==============================================
-- RLS Policies for Settings
-- ==============================================
CREATE POLICY "HR/Admin can view settings"
  ON public.business_trip_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

CREATE POLICY "HR/Admin can update settings"
  ON public.business_trip_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

-- ==============================================
-- RLS Policies for Trips
-- ==============================================
-- Employees can view their own trips
CREATE POLICY "Employees can view own trips"
  ON public.business_trips FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Managers can view trips of their direct reports
CREATE POLICY "Managers can view team trips"
  ON public.business_trips FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = business_trips.employee_id
      AND e.manager_id IN (
        SELECT id FROM public.employees WHERE user_id = auth.uid()
      )
    )
  );

-- HR/Admin can view all trips
CREATE POLICY "HR/Admin can view all trips"
  ON public.business_trips FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

-- Employees can create their own trips
CREATE POLICY "Employees can create own trips"
  ON public.business_trips FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Employees can update their own draft/submitted trips
CREATE POLICY "Employees can update own draft/submitted trips"
  ON public.business_trips FOR UPDATE
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
    AND status IN ('draft', 'submitted')
  );

-- HR/Admin can update any trip
CREATE POLICY "HR/Admin can update any trip"
  ON public.business_trips FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

-- Employees can delete their own draft trips
CREATE POLICY "Employees can delete own draft trips"
  ON public.business_trips FOR DELETE
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
    AND status = 'draft'
  );

-- ==============================================
-- RLS Policies for Expenses
-- ==============================================
CREATE POLICY "Employees can view own trip expenses"
  ON public.business_trip_expenses FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM public.business_trips 
      WHERE employee_id IN (
        SELECT id FROM public.employees WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "HR/Admin can view all expenses"
  ON public.business_trip_expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

CREATE POLICY "Employees can add expenses to own trips"
  ON public.business_trip_expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM public.business_trips 
      WHERE employee_id IN (
        SELECT id FROM public.employees WHERE user_id = auth.uid()
      )
      AND status IN ('draft', 'submitted', 'manager_approved', 'hr_approved', 'completed')
    )
  );

CREATE POLICY "HR/Admin can update expenses"
  ON public.business_trip_expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

-- ==============================================
-- RLS Policies for Amendments
-- ==============================================
CREATE POLICY "Employees can view own trip amendments"
  ON public.business_trip_amendments FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM public.business_trips 
      WHERE employee_id IN (
        SELECT id FROM public.employees WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can view team amendments"
  ON public.business_trip_amendments FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT bt.id FROM public.business_trips bt
      JOIN public.employees e ON e.id = bt.employee_id
      WHERE e.manager_id IN (
        SELECT id FROM public.employees WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "HR/Admin can view all amendments"
  ON public.business_trip_amendments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

CREATE POLICY "Employees can create amendments for own hr_approved trips"
  ON public.business_trip_amendments FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM public.business_trips 
      WHERE employee_id IN (
        SELECT id FROM public.employees WHERE user_id = auth.uid()
      )
      AND status IN ('hr_approved', 'completed')
    )
  );

CREATE POLICY "HR/Admin can update amendments"
  ON public.business_trip_amendments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

-- ==============================================
-- RLS Policies for Attachments
-- ==============================================
CREATE POLICY "Employees can view own trip attachments"
  ON public.business_trip_attachments FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM public.business_trips 
      WHERE employee_id IN (
        SELECT id FROM public.employees WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "HR/Admin can view all attachments"
  ON public.business_trip_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );

CREATE POLICY "Employees can add attachments to own trips"
  ON public.business_trip_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    trip_id IN (
      SELECT id FROM public.business_trips 
      WHERE employee_id IN (
        SELECT id FROM public.employees WHERE user_id = auth.uid()
      )
      AND status NOT IN ('reconciled', 'cancelled')
    )
  );

-- ==============================================
-- Insert default settings
-- ==============================================
INSERT INTO public.business_trip_settings (
  id, 
  module_enabled, 
  car_uplift_per_night_bhd,
  require_receipts,
  allow_cancellation_after_submit,
  allow_edit_after_submit,
  email_notifications_enabled,
  inapp_notifications_enabled
)
VALUES (
  gen_random_uuid(), 
  true, 
  20.000,
  false,
  true,
  true,
  true,
  true
);

-- ==============================================
-- Create indexes for performance
-- ==============================================
CREATE INDEX idx_business_trips_employee_id ON public.business_trips(employee_id);
CREATE INDEX idx_business_trips_status ON public.business_trips(status);
CREATE INDEX idx_business_trips_destination_id ON public.business_trips(destination_id);
CREATE INDEX idx_business_trips_dates ON public.business_trips(start_date, end_date);
CREATE INDEX idx_business_trip_expenses_trip_id ON public.business_trip_expenses(trip_id);
CREATE INDEX idx_business_trip_amendments_trip_id ON public.business_trip_amendments(trip_id);
CREATE INDEX idx_business_trip_attachments_trip_id ON public.business_trip_attachments(trip_id);

-- ==============================================
-- Audit trigger for business trips changes
-- ==============================================
CREATE OR REPLACE FUNCTION public.log_business_trip_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  field_names TEXT[] := ARRAY[
    'destination_id', 'start_date', 'end_date', 'travel_mode',
    'corporate_card_used', 'status', 'flight_details', 'origin_location_id'
  ];
  col TEXT; 
  old_val TEXT; 
  new_val TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    FOREACH col IN ARRAY field_names LOOP
      EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', col, col)
      INTO old_val, new_val USING OLD, NEW;
      
      IF old_val IS DISTINCT FROM new_val THEN
        INSERT INTO public.audit_logs (
          entity_type, entity_id, employee_id, action, 
          field_name, old_value, new_value, performed_by, description
        )
        VALUES (
          'business_trip', NEW.id, NEW.employee_id, 'update',
          col, old_val, new_val, auth.uid(), 'Updated ' || replace(col, '_', ' ')
        );
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_business_trip_changes
  AFTER UPDATE ON public.business_trips
  FOR EACH ROW EXECUTE FUNCTION log_business_trip_changes();

-- ==============================================
-- Updated at trigger for business trips
-- ==============================================
CREATE TRIGGER update_business_trips_updated_at
  BEFORE UPDATE ON public.business_trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_trip_destinations_updated_at
  BEFORE UPDATE ON public.business_trip_destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_trip_amendments_updated_at
  BEFORE UPDATE ON public.business_trip_amendments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- Storage bucket for receipts
-- ==============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-trip-receipts', 
  'business-trip-receipts', 
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Employees can upload receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'business-trip-receipts');

CREATE POLICY "Users can view trip receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'business-trip-receipts');