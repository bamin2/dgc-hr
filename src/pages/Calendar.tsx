import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { DashboardLayout } from "@/components/dashboard";
import {
  CalendarHeader,
  CalendarFilters,
  WeekView,
  CreateEventDialog,
  EventDetailSheet,
  DayView,
  MonthView,
} from "@/components/calendar";
import { 
  useCalendarEvents, 
  getEventsForDate, 
  CalendarEvent 
} from "@/hooks/useCalendarEvents";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    types: [] as string[],
    platforms: [] as string[],
    colors: [] as string[],
  });

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === "day") {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      return { start: dayStart, end: dayEnd };
    } else if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      return { start: calendarStart, end: calendarEnd };
    } else {
      // Week view
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    }
  }, [currentDate, viewMode]);

  // Fetch events from database
  const { data: events = [], isLoading } = useCalendarEvents(dateRange.start, dateRange.end);

  // Calculate the week dates based on current date
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // Get today's events for the header summary
  const todayEvents = useMemo(() => {
    return getEventsForDate(events, new Date());
  }, [events]);

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters.types.length > 0 && !filters.types.includes(event.type)) {
        return false;
      }
      if (filters.platforms.length > 0 && event.platform && !filters.platforms.includes(event.platform)) {
        return false;
      }
      if (filters.colors.length > 0 && !filters.colors.includes(event.color)) {
        return false;
      }
      return true;
    });
  }, [events, filters]);

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventSheetOpen(true);
  };

  const handleScheduleClick = () => {
    toast.info("Schedule feature", { description: "Quick scheduling coming soon!" });
  };

  const handleExportClick = () => {
    toast.info("Export calendar", { description: "Calendar export will be available with Outlook integration" });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <CalendarHeader
          currentDate={selectedDate}
          todayEvents={todayEvents}
          onScheduleClick={handleScheduleClick}
          onCreateClick={() => setCreateDialogOpen(true)}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-border gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Show week dates only in week view - hidden on mobile */}
            {viewMode === "week" && (
              <div className="hidden lg:flex items-center gap-1">
                {weekDates.map((date) => {
                  const day = date.toLocaleDateString("en-US", { weekday: "short" });
                  const dayNum = date.getDate().toString().padStart(2, "0");
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      className={`flex flex-col items-center px-2 lg:px-3 py-1.5 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="text-xs font-medium">{day}</span>
                      <span className="text-sm font-bold">{dayNum}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Show date display in day view */}
            {viewMode === "day" && (
              <span className="text-lg font-semibold">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </span>
            )}

            {/* Show month display in month view */}
            {viewMode === "month" && (
              <span className="text-lg font-semibold">
                {format(currentDate, "MMMM yyyy")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "day" | "week" | "month")}
            >
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
            <CalendarFilters
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              filters={filters}
              onFiltersChange={setFilters}
            />
            <button
              onClick={handleExportClick}
              className="h-8 px-3 flex items-center gap-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Calendar Views */}
        {viewMode === "day" && (
          <DayView
            date={selectedDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            weekDates={weekDates}
            events={filteredEvents}
            onEventClick={handleEventClick}
          />
        )}

        {viewMode === "month" && (
          <MonthView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={(date) => {
              setSelectedDate(date);
              setViewMode("day");
            }}
          />
        )}
      </div>

      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EventDetailSheet
        event={selectedEvent}
        open={eventSheetOpen}
        onOpenChange={setEventSheetOpen}
      />
    </DashboardLayout>
  );
}
