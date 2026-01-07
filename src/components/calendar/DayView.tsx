import { format, isSameDay } from "date-fns";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { EventCard } from "./EventCard";

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function DayView({ date, events, onEventClick }: DayViewProps) {
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

  const formatTimeSlot = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour.toString().padStart(2, "0")} ${period}`;
  };

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      return (
        isSameDay(eventStart, date) &&
        eventStart.getHours() === hour
      );
    });
  };

  const getEventHeight = (event: CalendarEvent) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const heightPerMinute = 80 / 60;
    return Math.max(durationMinutes * heightPerMinute, 24);
  };

  const isToday = isSameDay(date, new Date());

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="grid grid-cols-[80px_1fr]">
          <div className="p-3 text-xs text-muted-foreground" />
          <div
            className={`p-3 text-center border-l border-border ${
              isToday ? "bg-primary/5" : ""
            }`}
          >
            <span className="text-sm text-muted-foreground">
              {format(date, "EEEE")}
            </span>
            <div
              className={`text-2xl font-semibold ${
                isToday ? "text-primary" : ""
              }`}
            >
              {format(date, "d")}
            </div>
            <span className="text-sm text-muted-foreground">
              {format(date, "MMMM yyyy")}
            </span>
          </div>
        </div>
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[80px_1fr]">
        {/* Time labels */}
        <div className="border-r border-border">
          {timeSlots.map((hour) => (
            <div
              key={hour}
              className="h-20 flex items-start justify-end pr-3 pt-1"
            >
              <span className="text-xs text-muted-foreground">
                {formatTimeSlot(hour)}
              </span>
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className={isToday ? "bg-primary/5" : ""}>
          {timeSlots.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            return (
              <div
                key={hour}
                className="h-20 border-b border-border relative"
              >
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1"
                    style={{ height: getEventHeight(event) }}
                  >
                    <EventCard event={event} onClick={() => onEventClick(event)} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
