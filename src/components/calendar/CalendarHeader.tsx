import { Button } from "@/components/ui/button";
import { CalendarClock, Plus } from "lucide-react";
import { CalendarEvent } from "@/hooks/useCalendarEvents";

interface CalendarHeaderProps {
  currentDate: Date;
  todayEvents: CalendarEvent[];
  onScheduleClick: () => void;
  onCreateClick: () => void;
}

export function CalendarHeader({
  currentDate,
  todayEvents,
  onScheduleClick,
  onCreateClick,
}: CalendarHeaderProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  const meetingsCount = todayEvents.filter((e) => e.type === "meeting").length;
  const eventsCount = todayEvents.filter((e) => e.type === "event").length;

  const getSummary = () => {
    const parts = [];
    if (meetingsCount > 0) {
      parts.push(`${meetingsCount} meeting${meetingsCount > 1 ? "s" : ""}`);
    }
    if (eventsCount > 0) {
      parts.push(`${eventsCount} event${eventsCount > 1 ? "s" : ""}`);
    }
    if (parts.length === 0) {
      return "No events scheduled for today";
    }
    return `You have ${parts.join(" and ")} today`;
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{formatDate(currentDate)}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{getSummary()}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={onScheduleClick}>
          <CalendarClock className="h-4 w-4" />
          Schedule
        </Button>
        <Button className="gap-2" onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          Create Request
        </Button>
      </div>
    </div>
  );
}
