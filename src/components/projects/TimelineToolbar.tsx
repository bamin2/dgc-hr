import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type TimelineGranularity = 'day' | 'week' | 'month';

interface TimelineToolbarProps {
  currentDate: Date;
  granularity: TimelineGranularity;
  onDateChange: (date: Date) => void;
  onGranularityChange: (granularity: TimelineGranularity) => void;
}

export function TimelineToolbar({
  currentDate,
  granularity,
  onDateChange,
  onGranularityChange,
}: TimelineToolbarProps) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const handlePrev = () => {
    onDateChange(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    onDateChange(addWeeks(currentDate, 1));
  };

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Month selector */}
      <Select defaultValue={format(currentDate, "MMMM yyyy")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={format(currentDate, "MMMM yyyy")}>
            {format(currentDate, "MMMM yyyy")}
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Granularity toggle */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        {(['day', 'week', 'month'] as TimelineGranularity[]).map((g) => (
          <Button
            key={g}
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 capitalize",
              granularity === g && "bg-background shadow-sm"
            )}
            onClick={() => onGranularityChange(g)}
          >
            {g}
          </Button>
        ))}
      </div>

      {/* Date range navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-foreground min-w-[160px] text-center">
          {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd")}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
