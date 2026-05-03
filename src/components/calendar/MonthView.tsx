import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { CalendarEvent } from "@/hooks/useCalendarEvents";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

const eventColorMap: Record<string, string> = {
  blue: "bg-teal-600",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  purple: "bg-[#C6A45E]",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  mint: "bg-teal-400",
  coral: "bg-rose-400",
};

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      return isSameDay(eventStart, date);
    });
  };

  const MAX_VISIBLE_EVENTS = 2;

  return (
    <div className="flex-1 overflow-auto">
      {/* Week day headers */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="grid grid-cols-7">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const hasMoreEvents = dayEvents.length > MAX_VISIBLE_EVENTS;
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
          const moreCount = dayEvents.length - MAX_VISIBLE_EVENTS;

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] border-b border-r border-border p-1 cursor-pointer hover:bg-muted/50 transition-colors ${
                !isCurrentMonth ? "bg-muted/30" : ""
              }`}
              onClick={() => onDateClick?.(day)}
            >
              {/* Day number */}
              <div className="flex justify-center mb-1">
                <span
                  className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${
                    isTodayDate
                      ? "bg-primary text-primary-foreground font-semibold"
                      : !isCurrentMonth
                      ? "text-muted-foreground"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 ${
                      eventColorMap[event.color] || "bg-teal-600"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {hasMoreEvents && (
                  <div className="text-xs text-muted-foreground px-1.5">
                    +{moreCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
