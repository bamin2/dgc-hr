import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Events marked on specific dates
const events: Record<number, string> = {
  5: "primary",
  12: "success",
  18: "warning",
  23: "info",
};

export function CalendarWidget() {
  const [currentDate] = useState(new Date());
  const today = currentDate.getDate();
  const month = currentDate.toLocaleDateString("en-US", { month: "long" });
  const year = currentDate.getFullYear();

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
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
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
        {days.map((day, i) => (
          <div key={i} className="aspect-square relative">
            {day && (
              <button
                className={cn(
                  "w-full h-full flex items-center justify-center rounded-lg text-sm transition-colors relative",
                  day === today
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-secondary text-foreground"
                )}
              >
                {day}
                {events[day] && day !== today && (
                  <span
                    className={cn(
                      "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                      events[day] === "primary" && "bg-primary",
                      events[day] === "success" && "bg-success",
                      events[day] === "warning" && "bg-warning",
                      events[day] === "info" && "bg-info"
                    )}
                  />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Upcoming
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <div>
              <p className="text-sm font-medium text-foreground">Team Standup</p>
              <p className="text-xs text-muted-foreground">9:00 AM - 9:30 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-success rounded-full" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Interview: Sarah M.
              </p>
              <p className="text-xs text-muted-foreground">2:00 PM - 3:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}