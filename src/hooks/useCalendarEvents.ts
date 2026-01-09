import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { startOfDay, endOfDay } from "date-fns";
import { queryKeys } from "@/lib/queryKeys";

export type EventType = Database["public"]["Enums"]["event_type"];
export type EventPlatform = Database["public"]["Enums"]["event_platform"];
export type EventColor = Database["public"]["Enums"]["event_color"];
export type EventRecurrence = Database["public"]["Enums"]["event_recurrence"];

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  type: EventType;
  color: EventColor;
  organizer_id: string | null;
  platform: EventPlatform | null;
  location: string | null;
  is_all_day: boolean | null;
  recurrence: EventRecurrence | null;
  created_at: string;
  updated_at: string;
  organizer?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    position?: { title: string } | null;
  } | null;
  participants?: {
    id: string;
    employee_id: string;
    status: string;
    employee: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
      department?: { name: string } | null;
    };
  }[];
}

export interface CreateEventInput {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type?: EventType;
  color?: EventColor;
  organizer_id?: string;
  platform?: EventPlatform;
  location?: string;
  is_all_day?: boolean;
  recurrence?: EventRecurrence;
  participant_ids?: string[];
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

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

      // Create the event
      const { data: event, error: eventError } = await supabase
        .from("calendar_events")
        .insert(eventData)
        .select()
        .single();

      if (eventError) throw eventError;

      // Add participants if provided
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

      // Update the event
      const { data: event, error: eventError } = await supabase
        .from("calendar_events")
        .update(eventData)
        .eq("id", id)
        .select()
        .single();

      if (eventError) throw eventError;

      // Update participants if provided
      if (participant_ids !== undefined) {
        // Remove existing participants
        await supabase
          .from("event_participants")
          .delete()
          .eq("event_id", id);

        // Add new participants
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

// Helper functions to transform database types to UI-friendly formats
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

// Optimized hook for dashboard - fetches only today's meetings with minimal data
export interface TodayMeeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: EventType;
  platform: EventPlatform | null;
  location: string | null;
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
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
