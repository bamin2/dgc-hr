-- Drop the table if it was partially created
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Create central audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  performed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Simple RLS - authenticated users can view (page protected by route guards)
CREATE POLICY "Authenticated users can view audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes for efficient filtering
CREATE INDEX idx_audit_logs_employee ON public.audit_logs(employee_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_performed_by ON public.audit_logs(performed_by);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS employee_audit_trigger ON public.employees;
DROP TRIGGER IF EXISTS leave_request_audit_trigger ON public.leave_requests;
DROP TRIGGER IF EXISTS loan_audit_trigger ON public.loans;
DROP TRIGGER IF EXISTS document_audit_trigger ON public.employee_documents;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.log_employee_changes();
DROP FUNCTION IF EXISTS public.log_leave_request_changes();
DROP FUNCTION IF EXISTS public.log_loan_changes();
DROP FUNCTION IF EXISTS public.log_document_changes();

-- Function to log employee profile changes
CREATE OR REPLACE FUNCTION public.log_employee_changes()
RETURNS TRIGGER AS $$
DECLARE
  field_names TEXT[] := ARRAY[
    'first_name', 'second_name', 'last_name', 'email', 'phone', 
    'department_id', 'position_id', 'work_location_id', 'manager_id',
    'employment_type', 'status', 'nationality', 'gender', 'date_of_birth',
    'address', 'country', 'bank_name', 'iban', 'bank_account_number',
    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'
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
        INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, field_name, old_value, new_value, performed_by, description)
        VALUES ('employee', NEW.id, NEW.id, 'update', col, old_val, new_val, auth.uid(), 'Updated ' || replace(col, '_', ' '));
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER employee_audit_trigger
AFTER UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.log_employee_changes();

-- Function to log leave request changes
CREATE OR REPLACE FUNCTION public.log_leave_request_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, description, performed_by, new_value)
    VALUES ('leave_request', NEW.id, NEW.employee_id, 'create', 'Leave request created for ' || NEW.days_count || ' days', auth.uid(), NEW.status);
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, field_name, old_value, new_value, performed_by, description)
    VALUES ('leave_request', NEW.id, NEW.employee_id, 
      CASE WHEN NEW.status = 'approved' THEN 'approve' WHEN NEW.status = 'rejected' THEN 'reject' ELSE 'update' END,
      'status', OLD.status, NEW.status, auth.uid(), 'Leave request ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER leave_request_audit_trigger
AFTER INSERT OR UPDATE ON public.leave_requests
FOR EACH ROW EXECUTE FUNCTION public.log_leave_request_changes();

-- Function to log loan changes
CREATE OR REPLACE FUNCTION public.log_loan_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, description, performed_by, new_value)
    VALUES ('loan', NEW.id, NEW.employee_id, 'create', 'Loan request created for ' || NEW.principal_amount, auth.uid(), NEW.status);
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, field_name, old_value, new_value, performed_by, description)
    VALUES ('loan', NEW.id, NEW.employee_id,
      CASE WHEN NEW.status = 'approved' THEN 'approve' WHEN NEW.status = 'rejected' THEN 'reject' ELSE 'update' END,
      'status', OLD.status, NEW.status, auth.uid(), 'Loan ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER loan_audit_trigger
AFTER INSERT OR UPDATE ON public.loans
FOR EACH ROW EXECUTE FUNCTION public.log_loan_changes();

-- Function to log document changes
CREATE OR REPLACE FUNCTION public.log_document_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, description, performed_by, new_value)
    VALUES ('document', NEW.id, NEW.employee_id, 'upload', 'Document uploaded: ' || NEW.document_name, auth.uid(), NEW.document_name);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, description, performed_by, old_value)
    VALUES ('document', OLD.id, OLD.employee_id, 'delete', 'Document deleted: ' || OLD.document_name, auth.uid(), OLD.document_name);
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER document_audit_trigger
AFTER INSERT OR DELETE ON public.employee_documents
FOR EACH ROW EXECUTE FUNCTION public.log_document_changes();

-- Migrate existing salary_history data
INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, field_name, old_value, new_value, performed_by, created_at, description)
SELECT 'compensation', id, employee_id, 'update', 'salary', COALESCE(previous_salary::text, '0'), new_salary::text, changed_by, created_at,
  'Salary changed from ' || COALESCE(previous_salary::text, '0') || ' to ' || new_salary::text || COALESCE(' - ' || change_type, '')
FROM public.salary_history WHERE employee_id IS NOT NULL;

-- Migrate existing leave_balance_adjustments data
INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, field_name, old_value, new_value, performed_by, created_at, description)
SELECT 'leave_balance', id, employee_id, 'update', 'balance_adjustment', NULL, adjustment_days::text, adjusted_by, created_at,
  adjustment_type || ': ' || adjustment_days || ' days' || COALESCE(' - ' || reason, '')
FROM public.leave_balance_adjustments WHERE employee_id IS NOT NULL;

-- Migrate existing loan_events data
INSERT INTO public.audit_logs (entity_type, entity_id, employee_id, action, field_name, old_value, new_value, performed_by, created_at, description)
SELECT 'loan', le.id, l.employee_id, CASE le.event_type WHEN 'skip' THEN 'skip' ELSE 'update' END,
  'loan_event', NULL, le.event_type, le.created_by, le.created_at, le.event_type || COALESCE(': ' || le.notes, '')
FROM public.loan_events le JOIN public.loans l ON le.loan_id = l.id WHERE l.employee_id IS NOT NULL;