-- Create security definer function to check if employee is a participant
CREATE OR REPLACE FUNCTION public.is_event_participant(_event_id uuid, _employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM event_participants
    WHERE event_id = _event_id
      AND employee_id = _employee_id
  )
$$;

-- Create security definer function to check if employee is the organizer
CREATE OR REPLACE FUNCTION public.is_event_organizer(_event_id uuid, _employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM calendar_events
    WHERE id = _event_id
      AND organizer_id = _employee_id
  )
$$;

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Employees can view own events" ON calendar_events;
DROP POLICY IF EXISTS "Employees can view event participants" ON event_participants;
DROP POLICY IF EXISTS "Organizers can manage participants" ON event_participants;

-- Recreate calendar_events policy using security definer function
CREATE POLICY "Employees can view own events" ON calendar_events
FOR SELECT
TO public
USING (
  organizer_id = get_user_employee_id(auth.uid())
  OR is_event_participant(id, get_user_employee_id(auth.uid()))
);

-- Recreate event_participants SELECT policy
CREATE POLICY "Employees can view event participants" ON event_participants
FOR SELECT
TO public
USING (
  employee_id = get_user_employee_id(auth.uid())
  OR is_event_organizer(event_id, get_user_employee_id(auth.uid()))
  OR is_event_participant(event_id, get_user_employee_id(auth.uid()))
);

-- Recreate event_participants management policy for organizers
CREATE POLICY "Organizers can manage participants" ON event_participants
FOR ALL
TO public
USING (
  is_event_organizer(event_id, get_user_employee_id(auth.uid()))
)
WITH CHECK (
  is_event_organizer(event_id, get_user_employee_id(auth.uid()))
);