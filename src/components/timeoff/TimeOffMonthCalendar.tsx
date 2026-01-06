import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { usePublicHolidays } from "@/hooks/usePublicHolidays";

type ViewMode = "day" | "week" | "month";

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

export function TimeOffMonthCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const { data: leaveRequests, isLoading: isLoadingLeave } = useLeaveRequests();
  const { data: publicHolidays, isLoading: isLoadingHolidays } = usePublicHolidays(currentDate.getFullYear());

  const isLoading = isLoadingLeave || isLoadingHolidays;

  // Create calendar events from public holidays (original + compensated dates)
  const holidayEvents: CalendarEvent[] = useMemo(() => {
    if (!publicHolidays) return [];
    
    const events: CalendarEvent[] = [];
    
    for (const holiday of publicHolidays) {
      const originalDate = parseISO(holiday.date);
      const observedDate = parseISO(holiday.observed_date);
      
      // Always show on original date
      events.push({
        id: `holiday-original-${holiday.id}`,
        title: holiday.name,
        startDate: originalDate,
        endDate: originalDate,
        color: '#ef4444', // Red color for public holidays
      });
      
      // If compensated, also show on observed date with (Compensation) suffix
      if (holiday.is_compensated) {
        events.push({
          id: `holiday-comp-${holiday.id}`,
          title: `${holiday.name} (Compensation)`,
          startDate: observedDate,
          endDate: observedDate,
          color: '#ef4444',
        });
      }
    }
    
    return events;
  }, [publicHolidays]);

  // Convert leave requests to calendar events (excluding Public Holiday leave type)
  const leaveEvents: CalendarEvent[] = useMemo(() => {
    if (!leaveRequests) return [];
    
    return leaveRequests
      .filter(r => 
        (r.status === 'approved' || r.status === 'pending') &&
        r.leave_type?.name !== 'Public Holiday' // Exclude to avoid duplicates
      )
      .map(request => ({
        id: request.id,
        title: `${request.employee?.first_name || ''} - ${request.leave_type?.name || 'Leave'}`,
        startDate: parseISO(request.start_date),
        endDate: parseISO(request.end_date),
        color: request.leave_type?.color || '#3b82f6',
      }));
  }, [leaveRequests]);

  // Merge all events
  const calendarEvents = useMemo(() => {
    return [...leaveEvents, ...holidayEvents];
  }, [leaveEvents, holidayEvents]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = useMemo(() => {
    const daysArray = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      daysArray.push(day);
      day = addDays(day, 1);
    }
    return daysArray;
  }, [currentDate]);

  const weeks = useMemo(() => {
    const weeksArray = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArray.push(days.slice(i, i + 7));
    }
    return weeksArray;
  }, [days]);

  const getEventsForDay = (day: Date) => {
    return calendarEvents.filter((event) =>
      isWithinInterval(day, { start: event.startDate, end: event.endDate })
    );
  };

  const isEventStart = (day: Date, event: CalendarEvent) => {
    return isSameDay(day, event.startDate);
  };

  const isEventEnd = (day: Date, event: CalendarEvent) => {
    return isSameDay(day, event.endDate);
  };

  const goToToday = () => setCurrentDate(new Date());
  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={goToToday}>Today</Button>
        
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(v) => v && setViewMode(v as ViewMode)}
          className="border rounded-lg"
        >
          <ToggleGroupItem value="day" className="px-4">Day</ToggleGroupItem>
          <ToggleGroupItem value="week" className="px-4">Week</ToggleGroupItem>
          <ToggleGroupItem value="month" className="px-4">Month</ToggleGroupItem>
        </ToggleGroup>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {format(monthStart, "MMMM dd")} - {format(monthEnd, "MMMM dd")}
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden bg-card">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Rows */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, today);
              const events = getEventsForDay(day);

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "min-h-[100px] p-2 border-r last:border-r-0 relative",
                    !isCurrentMonth && "bg-muted/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !isCurrentMonth && "text-muted-foreground",
                      isToday && "text-primary font-bold"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  
                  {/* Events */}
                  <div className="mt-1 space-y-1">
                    {events.slice(0, 2).map((event) => {
                      const isStart = isEventStart(day, event);
                      const isEnd = isEventEnd(day, event);
                      
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "text-xs px-2 py-1 truncate text-white",
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
                        >
                          {isStart && event.title}
                        </div>
                      );
                    })}
                    {events.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{events.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
