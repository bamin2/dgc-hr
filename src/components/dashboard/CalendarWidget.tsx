import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCalendarEvents, getEventsForDate } from "@/hooks/useCalendarEvents";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const colorMap: Record<string, string> = {
  blue: "bg-primary",
  green: "bg-success",
  yellow: "bg-warning",
  red: "bg-destructive",
  purple: "bg-info",
};

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const month = format(currentDate, "MMMM");
  const year = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Fetch events for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const { data: events, isLoading } = useCalendarEvents(monthStart, monthEnd);

  // Generate calendar days
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    if (!events) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getEventsForDate(events, date);
  };

  // Get upcoming events (next 3)
  const upcomingEvents = (events || [])
    .filter(e => new Date(e.start_time) >= today)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 2);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Your Schedule
          </h3>
          <p className="text-sm text-muted-foreground">
            {month} {year}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isToday = day === todayDate && currentMonth === todayMonth && year === todayYear;
          const dayEvents = day ? getEventsForDay(day) : [];
          
          return (
            <div key={i} className="aspect-square relative">
              {day && (
                <button
                  className={cn(
                    "w-full h-full flex items-center justify-center rounded-lg text-sm transition-colors relative",
                    isToday
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  {day}
                  {dayEvents.length > 0 && !isToday && (
                    <span
                      className={cn(
                        "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                        colorMap[dayEvents[0].color] || "bg-primary"
                      )}
                    />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Events */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Upcoming
        </p>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No upcoming events</p>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className={cn("w-1 h-8 rounded-full", colorMap[event.color] || "bg-primary")} />
                <div>
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
