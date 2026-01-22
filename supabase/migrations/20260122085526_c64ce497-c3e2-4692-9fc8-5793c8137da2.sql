-- Create function to maintain enrolled_count
CREATE OR REPLACE FUNCTION public.update_benefit_plan_enrolled_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- On INSERT: increment count if new enrollment is active
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'active' THEN
      UPDATE benefit_plans 
      SET enrolled_count = COALESCE(enrolled_count, 0) + 1 
      WHERE id = NEW.plan_id;
    END IF;
    RETURN NEW;
  
  -- On UPDATE: adjust count based on status change
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from active to something else, decrement
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE benefit_plans 
      SET enrolled_count = GREATEST(0, COALESCE(enrolled_count, 0) - 1) 
      WHERE id = NEW.plan_id;
    -- If status changed to active from something else, increment
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE benefit_plans 
      SET enrolled_count = COALESCE(enrolled_count, 0) + 1 
      WHERE id = NEW.plan_id;
    END IF;
    RETURN NEW;
  
  -- On DELETE: decrement count if deleted enrollment was active
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'active' THEN
      UPDATE benefit_plans 
      SET enrolled_count = GREATEST(0, COALESCE(enrolled_count, 0) - 1) 
      WHERE id = OLD.plan_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger on benefit_enrollments
CREATE TRIGGER maintain_enrolled_count
AFTER INSERT OR UPDATE OR DELETE ON benefit_enrollments
FOR EACH ROW EXECUTE FUNCTION update_benefit_plan_enrolled_count();

-- Sync existing data to fix current counts
UPDATE benefit_plans bp
SET enrolled_count = (
  SELECT COUNT(*) 
  FROM benefit_enrollments be 
  WHERE be.plan_id = bp.id 
  AND be.status = 'active'
);