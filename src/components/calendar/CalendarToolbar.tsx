import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarToolbarProps {
  currentDate: Date;
  weekDates: Date[];
  selectedDate: Date;
  viewMode: "day" | "week" | "month";
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onDateSelect: (date: Date) => void;
  onViewModeChange: (mode: "day" | "week" | "month") => void;
  onFilterClick: () => void;
  onExportClick: () => void;
}

export function CalendarToolbar({
  currentDate,
  weekDates,
  selectedDate,
  viewMode,
  onToday,
  onPrevious,
  onNext,
  onDateSelect,
  onViewModeChange,
  onFilterClick,
  onExportClick,
}: CalendarToolbarProps) {
  const formatDayLabel = (date: Date) => {
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate().toString().padStart(2, "0");
    return { day, dayNum };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {weekDates.map((date) => {
            const { day, dayNum } = formatDayLabel(date);
            return (
              <button
                key={date.toISOString()}
                onClick={() => onDateSelect(date)}
                className={cn(
                  "flex flex-col items-center px-3 py-1.5 rounded-lg transition-colors",
                  isSelected(date)
                    ? "bg-primary text-primary-foreground"
                    : isToday(date)
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span className="text-xs font-medium">{day}</span>
                <span className="text-sm font-bold">{dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={viewMode} onValueChange={(v) => onViewModeChange(v as any)}>
          <SelectTrigger className="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onFilterClick}>
          <Filter className="h-3.5 w-3.5" />
          Filter
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onExportClick}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>
    </div>
  );
}
