/**
 * Calendar Types
 * Types for calendar events, meetings, and scheduling
 */

import { Database } from '@/integrations/supabase/types';

export type EventType = Database['public']['Enums']['event_type'];
export type EventPlatform = Database['public']['Enums']['event_platform'];
export type EventColor = Database['public']['Enums']['event_color'];
export type EventRecurrence = Database['public']['Enums']['event_recurrence'];

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

export interface TodayMeeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: EventType;
  platform: EventPlatform | null;
  location: string | null;
}
