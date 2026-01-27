import { format, isSameDay, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface TimeOffDayViewProps {
  date: Date;
  events: CalendarEvent[];
}

export function TimeOffDayView({ date, events }: TimeOffDayViewProps) {
  const today = new Date();
  const isToday = isSameDay(date, today);

  const dayEvents = events.filter((event) =>
    isWithinInterval(date, { start: event.startDate, end: event.endDate })
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Day Header */}
      <div className={cn(
        "p-4 border-b text-center",
        isToday && "bg-primary/5"
      )}>
        <div className="text-sm text-muted-foreground">
          {format(date, "EEEE")}
        </div>
        <div className={cn(
          "text-2xl font-semibold",
          isToday && "text-primary"
        )}>
          {format(date, "d")}
        </div>
        <div className="text-sm text-muted-foreground">
          {format(date, "MMMM yyyy")}
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 min-h-[400px]">
        {dayEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No time off scheduled for this day
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((event) => {
              const isMultiDay = !isSameDay(event.startDate, event.endDate);
              
              return (
                <div
                  key={event.id}
                  className="p-4 rounded-lg text-white"
                  style={{ backgroundColor: event.color }}
                >
                  <div className="font-medium">{event.title}</div>
                  {isMultiDay && (
                    <div className="text-sm opacity-90 mt-1">
                      {format(event.startDate, "MMM d")} - {format(event.endDate, "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
