import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths, isToday as checkIsToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoCard } from "./BentoCard";
import { useCalendarEvents, getEventsForDate } from "@/hooks/useCalendarEvents";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const colorMap: Record<string, string> = {
  green: "bg-green-500",
  blue: "bg-blue-500", 
  yellow: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
  pink: "bg-pink-500",
};

export function ScheduleCard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const { data: events = [], isLoading } = useCalendarEvents(monthStart, monthEnd);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: 42 }, (_, i) => {
      const day = i - firstDay + 1;
      return day > 0 && day <= totalDays ? day : null;
    });
  }, [currentDate]);

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getEventsForDate(events, date);
  };

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setSelectedMonth(currentDate.getMonth());
    setSelectedYear(currentDate.getFullYear());
  };

  const today = new Date();
  
  // Get upcoming events for sidebar
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 3);
  }, [events]);

  if (isLoading) {
    return (
      <BentoCard colSpan={8} noPadding>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard colSpan={8} noPadding>
      <div className="flex flex-col lg:flex-row">
        {/* Calendar */}
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">My Schedule</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-9" />;
              }

              const isSelected = selectedDay === day && 
                selectedMonth === currentDate.getMonth() && 
                selectedYear === currentDate.getFullYear();
              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isToday = checkIsToday(dayDate);
              const dayEvents = getEventsForDay(day);

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    h-9 rounded-lg text-sm font-medium relative transition-colors
                    ${isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : isToday 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-secondary/50"
                    }
                  `}
                >
                  {day}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <span
                          key={i}
                          className={`w-1 h-1 rounded-full ${colorMap[event.color] || "bg-primary"}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="lg:w-[220px] border-t lg:border-t-0 lg:border-l border-border/50 p-5 bg-secondary/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Upcoming
          </p>
          
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming events
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${colorMap[event.color] || "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(event.start_time), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BentoCard>
  );
}
