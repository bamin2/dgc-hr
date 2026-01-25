-- Create audit trigger function for HR document requests
CREATE OR REPLACE FUNCTION public.log_hr_document_request_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      entity_type, entity_id, employee_id, action, 
      description, performed_by, new_value
    )
    VALUES (
      'hr_document_request', NEW.id, NEW.employee_id, 'create', 
      'HR document requested', auth.uid(), NEW.status
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (
      entity_type, entity_id, employee_id, action, 
      field_name, old_value, new_value, performed_by, description
    )
    VALUES (
      'hr_document_request', NEW.id, NEW.employee_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'approve' 
        WHEN NEW.status = 'rejected' THEN 'reject' 
        ELSE 'update' 
      END,
      'status', OLD.status, NEW.status, auth.uid(),
      CASE 
        WHEN NEW.status = 'approved' THEN 'HR document request approved'
        WHEN NEW.status = 'rejected' THEN 'HR document request rejected'
        ELSE 'HR document request updated'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER hr_document_request_audit_trigger
AFTER INSERT OR UPDATE ON public.hr_document_requests
FOR EACH ROW EXECUTE FUNCTION public.log_hr_document_request_changes();