import { useState, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import {
  CalendarHeader,
  CalendarFilters,
  WeekView,
  CreateEventDialog,
  EventDetailSheet,
} from "@/components/calendar";
import { 
  useCalendarEvents, 
  getEventsForDate, 
  CalendarEvent 
} from "@/hooks/useCalendarEvents";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Calculate the week range for fetching events
  const weekRange = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    return { start: startOfWeek, end: endOfWeek };
  }, [currentDate]);

  // Fetch events from database
  const { data: events = [], isLoading } = useCalendarEvents(weekRange.start, weekRange.end);

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
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-hidden flex flex-col">
          <CalendarHeader
            currentDate={selectedDate}
            todayEvents={todayEvents}
            onScheduleClick={handleScheduleClick}
            onCreateClick={() => setCreateDialogOpen(true)}
          />

          <div className="flex items-center justify-between py-3 border-b border-border">
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
              <div className="flex items-center gap-1">
                {weekDates.map((date) => {
                  const day = date.toLocaleDateString("en-US", { weekday: "short" });
                  const dayNum = date.getDate().toString().padStart(2, "0");
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition-colors ${
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
            </div>

            <div className="flex items-center gap-2">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="h-8 px-3 text-sm border border-border rounded-md bg-background"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
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

          <WeekView
            weekDates={weekDates}
            events={filteredEvents}
            onEventClick={handleEventClick}
          />
        </main>
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
    </div>
  );
}
