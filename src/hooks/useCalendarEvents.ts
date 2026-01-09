import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
import { queryKeys } from "@/lib/queryKeys";
import type {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
  TodayMeeting,
  EventType,
  EventPlatform,
  EventColor,
  EventRecurrence,
} from "@/types/calendar";

// Re-export types for backward compatibility
export type { CalendarEvent, CreateEventInput, UpdateEventInput, TodayMeeting };
export type { EventType, EventPlatform, EventColor, EventRecurrence };

export function useCalendarEvents(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: queryKeys.calendar.byDateRange(startDate?.toISOString() || '', endDate?.toISOString() || ''),
    staleTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => {
      let query = supabase
        .from("calendar_events")
        .select(`
          *,
          organizer:employees!calendar_events_organizer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            position:positions(title)
          ),
          participants:event_participants(
            id,
            employee_id,
            status,
            employee:employees(
              id,
              first_name,
              last_name,
              avatar_url,
              department:departments!employees_department_id_fkey(name)
            )
          )
        `)
        .order("start_time", { ascending: true });

      if (startDate) {
        query = query.gte("start_time", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("start_time", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
}

export function useCalendarEvent(id: string | undefined) {
  return useQuery({
    queryKey: ["calendar-event", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("calendar_events")
        .select(`
          *,
          organizer:employees!calendar_events_organizer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            position:positions(title)
          ),
          participants:event_participants(
            id,
            employee_id,
            status,
            employee:employees(
              id,
              first_name,
              last_name,
              avatar_url,
              department:departments!employees_department_id_fkey(name)
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as CalendarEvent;
    },
    enabled: !!id,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const { participant_ids, ...eventData } = input;

      const { data: event, error: eventError } = await supabase
        .from("calendar_events")
        .insert(eventData)
        .select()
        .single();

      if (eventError) throw eventError;

      if (participant_ids && participant_ids.length > 0) {
        const participantRecords = participant_ids.map((employeeId) => ({
          event_id: event.id,
          employee_id: employeeId,
          status: "pending",
        }));

        const { error: participantError } = await supabase
          .from("event_participants")
          .insert(participantRecords);

        if (participantError) throw participantError;
      }

      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.events });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      const { id, participant_ids, ...eventData } = input;

      const { data: event, error: eventError } = await supabase
        .from("calendar_events")
        .update(eventData)
        .eq("id", id)
        .select()
        .single();

      if (eventError) throw eventError;

      if (participant_ids !== undefined) {
        await supabase
          .from("event_participants")
          .delete()
          .eq("event_id", id);

        if (participant_ids.length > 0) {
          const participantRecords = participant_ids.map((employeeId) => ({
            event_id: id,
            employee_id: employeeId,
            status: "pending",
          }));

          const { error: participantError } = await supabase
            .from("event_participants")
            .insert(participantRecords);

          if (participantError) throw participantError;
        }
      }

      return event;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.events });
      queryClient.invalidateQueries({ queryKey: ["calendar-event", variables.id] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.events });
    },
  });
}

// Helper functions
export function getOrganizerFromEvent(event: CalendarEvent) {
  if (!event.organizer) return undefined;
  return {
    id: event.organizer.id,
    name: `${event.organizer.first_name} ${event.organizer.last_name}`,
    avatar: event.organizer.avatar_url,
    position: event.organizer.position?.title,
  };
}

export function getParticipantsFromEvent(event: CalendarEvent) {
  if (!event.participants) return [];
  return event.participants.map((p) => ({
    id: p.employee.id,
    name: `${p.employee.first_name} ${p.employee.last_name}`,
    avatar: p.employee.avatar_url,
    department: p.employee.department?.name,
    status: p.status,
  }));
}

export function getEventsForDate(events: CalendarEvent[], date: Date) {
  return events.filter((event) => {
    const eventDate = new Date(event.start_time);
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    );
  });
}

export function useTodayMeetings() {
  const today = new Date();

  return useQuery({
    queryKey: ["today-meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id, title, start_time, end_time, type, platform, location")
        .eq("type", "meeting")
        .gte("start_time", startOfDay(today).toISOString())
        .lte("start_time", endOfDay(today).toISOString())
        .order("start_time");

      if (error) throw error;
      return data as TodayMeeting[];
    },
    staleTime: 1000 * 60 * 2,
  });
}
