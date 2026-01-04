import { CalendarEvent } from "@/data/calendar";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  weekDates: Date[];
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const TIME_SLOTS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function WeekView({ weekDates, events, onEventClick }: WeekViewProps) {
  const formatTimeSlot = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour.toString().padStart(2, "0")} ${period}`;
  };

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getHours() === hour
      );
    });
  };

  const getEventHeight = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(durationHours * 64, 64); // 64px per hour, minimum 64px
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatDayHeader = (date: Date) => {
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate().toString().padStart(2, "0");
    return { day, dayNum };
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header row */}
      <div className="flex border-b border-border sticky top-0 bg-background z-10">
        <div className="w-16 shrink-0" /> {/* Time column spacer */}
        {weekDates.map((date) => {
          const { day, dayNum } = formatDayHeader(date);
          return (
            <div
              key={date.toISOString()}
              className={cn(
                "flex-1 text-center py-3 border-l border-border",
                isToday(date) && "bg-primary/5"
              )}
            >
              <span className="text-xs text-muted-foreground">{day}</span>
              <div
                className={cn(
                  "text-lg font-semibold",
                  isToday(date) && "text-primary"
                )}
              >
                {dayNum}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex">
        {/* Time labels */}
        <div className="w-16 shrink-0">
          {TIME_SLOTS.map((hour) => (
            <div
              key={hour}
              className="h-16 flex items-start justify-end pr-2 pt-0"
            >
              <span className="text-xs text-muted-foreground -mt-2">
                {formatTimeSlot(hour)}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDates.map((date) => (
          <div
            key={date.toISOString()}
            className={cn(
              "flex-1 border-l border-border relative",
              isToday(date) && "bg-primary/5"
            )}
          >
            {TIME_SLOTS.map((hour) => {
              const hourEvents = getEventsForDateAndHour(date, hour);
              return (
                <div
                  key={hour}
                  className="h-16 border-b border-border/50 relative"
                >
                  {hourEvents.map((event, idx) => (
                    <div
                      key={event.id}
                      className="absolute inset-x-1 z-10"
                      style={{
                        top: `${(new Date(event.startTime).getMinutes() / 60) * 64}px`,
                        height: `${getEventHeight(event)}px`,
                      }}
                    >
                      <EventCard
                        event={event}
                        onClick={() => onEventClick(event)}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
