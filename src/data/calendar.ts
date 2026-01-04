import { mockEmployees } from "./employees";

export type EventType = 'meeting' | 'event' | 'reminder' | 'task';
export type EventPlatform = 'zoom' | 'meet' | 'slack' | 'teams' | 'in-person';
export type EventColor = 'green' | 'orange' | 'coral' | 'mint' | 'blue' | 'purple';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  color: EventColor;
  organizerId: string;
  participantIds: string[];
  platform?: EventPlatform;
  location?: string;
  isAllDay?: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

// Helper to create dates relative to today
const getDate = (daysOffset: number, hours: number, minutes: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const calendarEvents: CalendarEvent[] = [
  // Today's events
  {
    id: "evt-1",
    title: "Project Review Meeting",
    description: "Review Q4 project milestones and deliverables",
    startTime: getDate(0, 6, 30),
    endTime: getDate(0, 8, 0),
    type: "meeting",
    color: "green",
    organizerId: "1",
    participantIds: ["2", "3", "4", "5", "6"],
    platform: "zoom",
  },
  {
    id: "evt-2",
    title: "Sales Performance Review",
    description: "Monthly sales team performance analysis",
    startTime: getDate(0, 9, 0),
    endTime: getDate(0, 10, 30),
    type: "meeting",
    color: "orange",
    organizerId: "2",
    participantIds: ["1", "3", "7", "8"],
    platform: "meet",
  },
  // Tomorrow
  {
    id: "evt-3",
    title: "Employee Recruitment",
    description: "Interview candidates for senior developer position",
    startTime: getDate(1, 7, 0),
    endTime: getDate(1, 8, 30),
    type: "event",
    color: "coral",
    organizerId: "3",
    participantIds: ["1", "4", "5"],
    platform: "teams",
  },
  {
    id: "evt-4",
    title: "Quarterly Financial Report",
    description: "Present Q3 financial results to stakeholders",
    startTime: getDate(1, 10, 0),
    endTime: getDate(1, 11, 30),
    type: "meeting",
    color: "mint",
    organizerId: "1",
    participantIds: ["2", "3", "4", "5", "6", "7", "8"],
    platform: "zoom",
  },
  // Day after tomorrow
  {
    id: "evt-5",
    title: "Marketing Strategy Session",
    description: "Plan marketing initiatives for next quarter",
    startTime: getDate(2, 6, 0),
    endTime: getDate(2, 7, 30),
    type: "meeting",
    color: "blue",
    organizerId: "4",
    participantIds: ["1", "2", "5", "6"],
    platform: "slack",
  },
  {
    id: "evt-6",
    title: "Customer Feedback Review",
    description: "Analyze recent customer feedback and satisfaction scores",
    startTime: getDate(2, 8, 30),
    endTime: getDate(2, 10, 0),
    type: "event",
    color: "green",
    organizerId: "5",
    participantIds: ["2", "3", "4"],
    platform: "meet",
  },
  // 3 days from now
  {
    id: "evt-7",
    title: "Bi-Weekly Marketing Sync",
    description: "Regular marketing team synchronization meeting",
    startTime: getDate(3, 6, 30),
    endTime: getDate(3, 8, 0),
    type: "meeting",
    color: "mint",
    organizerId: "6",
    participantIds: ["1", "4", "5", "7", "8"],
    platform: "zoom",
  },
  {
    id: "evt-8",
    title: "Product Demo",
    description: "Demonstrate new product features to clients",
    startTime: getDate(3, 9, 0),
    endTime: getDate(3, 10, 30),
    type: "event",
    color: "purple",
    organizerId: "2",
    participantIds: ["1", "3", "5"],
    platform: "teams",
  },
  // 4 days from now
  {
    id: "evt-9",
    title: "Team Building Activity",
    description: "Monthly team building and social event",
    startTime: getDate(4, 7, 0),
    endTime: getDate(4, 9, 0),
    type: "event",
    color: "orange",
    organizerId: "1",
    participantIds: ["2", "3", "4", "5", "6", "7", "8"],
    location: "Conference Room A",
    platform: "in-person",
  },
  // 5 days from now
  {
    id: "evt-10",
    title: "Sprint Planning",
    description: "Plan tasks and goals for the upcoming sprint",
    startTime: getDate(5, 6, 0),
    endTime: getDate(5, 7, 30),
    type: "meeting",
    color: "blue",
    organizerId: "3",
    participantIds: ["4", "5", "6"],
    platform: "meet",
  },
  {
    id: "evt-11",
    title: "Design Review",
    description: "Review UI/UX designs for new features",
    startTime: getDate(5, 9, 30),
    endTime: getDate(5, 11, 0),
    type: "meeting",
    color: "coral",
    organizerId: "4",
    participantIds: ["1", "2", "3", "5"],
    platform: "zoom",
  },
  // 6 days from now
  {
    id: "evt-12",
    title: "Client Presentation",
    description: "Present project progress to key stakeholders",
    startTime: getDate(6, 8, 0),
    endTime: getDate(6, 9, 30),
    type: "meeting",
    color: "green",
    organizerId: "1",
    participantIds: ["2", "3", "4", "5", "6", "7"],
    platform: "teams",
  },
];

export const getEventsByDateRange = (start: Date, end: Date): CalendarEvent[] => {
  return calendarEvents.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate >= start && eventDate <= end;
  });
};

export const getEventsForDate = (date: Date): CalendarEvent[] => {
  return calendarEvents.filter(event => {
    const eventDate = new Date(event.startTime);
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    );
  });
};

export const getOrganizerById = (id: string) => {
  const emp = mockEmployees.find(e => e.id === id);
  return emp ? { ...emp, name: `${emp.firstName} ${emp.lastName}`, avatar: emp.avatar } : undefined;
};

export const getParticipants = (participantIds: string[]) => {
  return mockEmployees
    .filter(emp => participantIds.includes(emp.id))
    .map(emp => ({ ...emp, name: `${emp.firstName} ${emp.lastName}` }));
};
