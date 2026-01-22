-- Clean up orphaned approval steps for leave requests
DELETE FROM request_approval_steps
WHERE request_type = 'time_off'
  AND request_id NOT IN (SELECT id FROM leave_requests);

-- Clean up orphaned approval steps for business trips
DELETE FROM request_approval_steps
WHERE request_type = 'business_trip'
  AND request_id NOT IN (SELECT id FROM business_trips);

-- Clean up orphaned approval steps for loans
DELETE FROM request_approval_steps
WHERE request_type = 'loan'
  AND request_id NOT IN (SELECT id FROM loans);

-- Create trigger function for leave requests cascade delete
CREATE OR REPLACE FUNCTION delete_approval_steps_on_leave_request_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM request_approval_steps 
  WHERE request_id = OLD.id 
    AND request_type = 'time_off';
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for leave requests
DROP TRIGGER IF EXISTS on_leave_request_delete ON leave_requests;
CREATE TRIGGER on_leave_request_delete
BEFORE DELETE ON leave_requests
FOR EACH ROW EXECUTE FUNCTION delete_approval_steps_on_leave_request_delete();

-- Create trigger function for business trips cascade delete
CREATE OR REPLACE FUNCTION delete_approval_steps_on_business_trip_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM request_approval_steps 
  WHERE request_id = OLD.id 
    AND request_type = 'business_trip';
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for business trips
DROP TRIGGER IF EXISTS on_business_trip_delete ON business_trips;
CREATE TRIGGER on_business_trip_delete
BEFORE DELETE ON business_trips
FOR EACH ROW EXECUTE FUNCTION delete_approval_steps_on_business_trip_delete();

-- Create trigger function for loans cascade delete
CREATE OR REPLACE FUNCTION delete_approval_steps_on_loan_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM request_approval_steps 
  WHERE request_id = OLD.id 
    AND request_type = 'loan';
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for loans
DROP TRIGGER IF EXISTS on_loan_delete ON loans;
CREATE TRIGGER on_loan_delete
BEFORE DELETE ON loans
FOR EACH ROW EXECUTE FUNCTION delete_approval_steps_on_loan_delete();