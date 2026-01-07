import { format, isSameDay, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface TimeOffWeekViewProps {
  weekDates: Date[];
  events: CalendarEvent[];
}

export function TimeOffWeekView({ weekDates, events }: TimeOffWeekViewProps) {
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (day: Date) => {
    return events.filter((event) =>
      isWithinInterval(day, { start: event.startDate, end: event.endDate })
    );
  };

  const isEventStart = (day: Date, event: CalendarEvent) => {
    return isSameDay(day, event.startDate);
  };

  const isEventEnd = (day: Date, event: CalendarEvent) => {
    return isSameDay(day, event.endDate);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDates.map((date, index) => {
          const isToday = isSameDay(date, today);
          
          return (
            <div
              key={index}
              className={cn(
                "p-3 text-center border-r last:border-r-0",
                isToday && "bg-primary/5"
              )}
            >
              <div className="text-xs text-muted-foreground">
                {weekDays[index]}
              </div>
              <div className={cn(
                "text-lg font-semibold",
                isToday && "text-primary"
              )}>
                {format(date, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDates.map((day, dayIndex) => {
          const isToday = isSameDay(day, today);
          const dayEvents = getEventsForDay(day);

          return (
            <div
              key={dayIndex}
              className={cn(
                "p-2 border-r last:border-r-0 min-h-[400px]",
                isToday && "bg-primary/5"
              )}
            >
              <div className="space-y-1">
                {dayEvents.slice(0, 6).map((event) => {
                  const isStart = isEventStart(day, event);
                  const isEnd = isEventEnd(day, event);

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs px-2 py-1.5 truncate text-white",
                        isStart && "rounded-l-md",
                        isEnd && "rounded-r-md",
                        !isStart && !isEnd && "rounded-none",
                        isStart && isEnd && "rounded-md"
                      )}
                      style={{
                        backgroundColor: event.color,
                        marginLeft: isStart ? 0 : -8,
                        marginRight: isEnd ? 0 : -8,
                        paddingLeft: isStart ? 8 : 4,
                        paddingRight: isEnd ? 8 : 4,
                      }}
                      title={event.title}
                    >
                      {isStart && event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 6 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayEvents.length - 6} more
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
