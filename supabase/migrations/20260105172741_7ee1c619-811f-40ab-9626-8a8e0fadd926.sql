-- Create calendar event types
CREATE TYPE event_type AS ENUM ('meeting', 'event', 'reminder', 'task');
CREATE TYPE event_platform AS ENUM ('zoom', 'meet', 'slack', 'teams', 'in-person');
CREATE TYPE event_color AS ENUM ('green', 'orange', 'coral', 'mint', 'blue', 'purple');
CREATE TYPE event_recurrence AS ENUM ('none', 'daily', 'weekly', 'monthly');

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  type event_type NOT NULL DEFAULT 'meeting',
  color event_color NOT NULL DEFAULT 'green',
  organizer_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  platform event_platform,
  location TEXT,
  is_all_day BOOLEAN DEFAULT false,
  recurrence event_recurrence DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_participants junction table
CREATE TABLE public.event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined, tentative
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, employee_id)
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_events_organizer ON public.calendar_events(organizer_id);
CREATE INDEX idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_employee ON public.event_participants(employee_id);

-- RLS Policies for calendar_events

-- HR and Admin can view all events
CREATE POLICY "HR and Admin can view all events"
  ON public.calendar_events FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Employees can view events they organize or participate in
CREATE POLICY "Employees can view own events"
  ON public.calendar_events FOR SELECT
  USING (
    organizer_id = get_user_employee_id(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.event_participants ep
      WHERE ep.event_id = id AND ep.employee_id = get_user_employee_id(auth.uid())
    )
  );

-- HR and Admin can insert events
CREATE POLICY "HR and Admin can insert events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Employees can create events
CREATE POLICY "Employees can create events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (organizer_id = get_user_employee_id(auth.uid()));

-- Organizers can update their events
CREATE POLICY "Organizers can update events"
  ON public.calendar_events FOR UPDATE
  USING (organizer_id = get_user_employee_id(auth.uid()));

-- HR and Admin can update any event
CREATE POLICY "HR and Admin can update events"
  ON public.calendar_events FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Organizers can delete their events
CREATE POLICY "Organizers can delete events"
  ON public.calendar_events FOR DELETE
  USING (organizer_id = get_user_employee_id(auth.uid()));

-- HR and Admin can delete any event
CREATE POLICY "HR and Admin can delete events"
  ON public.calendar_events FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for event_participants

-- HR and Admin can view all participants
CREATE POLICY "HR and Admin can view all participants"
  ON public.event_participants FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Employees can view participants for events they're part of
CREATE POLICY "Employees can view event participants"
  ON public.event_participants FOR SELECT
  USING (
    employee_id = get_user_employee_id(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.calendar_events ce
      WHERE ce.id = event_id AND ce.organizer_id = get_user_employee_id(auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.event_participants ep2
      WHERE ep2.event_id = event_id AND ep2.employee_id = get_user_employee_id(auth.uid())
    )
  );

-- Event organizers can manage participants
CREATE POLICY "Organizers can manage participants"
  ON public.event_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events ce
      WHERE ce.id = event_id AND ce.organizer_id = get_user_employee_id(auth.uid())
    )
  );

-- HR and Admin can manage all participants
CREATE POLICY "HR and Admin can manage participants"
  ON public.event_participants FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Participants can update their own status
CREATE POLICY "Participants can update own status"
  ON public.event_participants FOR UPDATE
  USING (employee_id = get_user_employee_id(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();