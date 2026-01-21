import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

type CalendarView = "days" | "months" | "years" | "decades";

interface HierarchicalCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
  className?: string;
  initialFocus?: boolean;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec"
];

const FULL_MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

export function HierarchicalCalendar({
  selected,
  onSelect,
  disabled,
  fromYear,
  toYear,
  className,
  initialFocus,
}: HierarchicalCalendarProps) {
  const currentYear = new Date().getFullYear();
  const minYear = fromYear ?? currentYear - 100;
  const maxYear = toYear ?? currentYear + 20;

  const [view, setView] = useState<CalendarView>("days");
  const [viewDate, setViewDate] = useState(selected || new Date());

  // Get the start year for the years grid (shows 12 years)
  const getYearsStart = (year: number) => Math.floor(year / 10) * 10;
  
  // Get the start decade for the decades grid (shows 12 decades)
  const getDecadesStart = (year: number) => Math.floor(year / 100) * 100;

  const handleHeaderClick = () => {
    if (view === "days") setView("months");
    else if (view === "months") setView("years");
    else if (view === "years") setView("decades");
  };

  const handleMonthSelect = (month: number) => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
    setView("days");
  };

  const handleYearSelect = (year: number) => {
    if (year >= minYear && year <= maxYear) {
      setViewDate(new Date(year, viewDate.getMonth(), 1));
      setView("months");
    }
  };

  const handleDecadeSelect = (startYear: number) => {
    if (startYear >= minYear - 10 && startYear <= maxYear) {
      setViewDate(new Date(startYear, 0, 1));
      setView("years");
    }
  };

  const navigatePrev = () => {
    if (view === "days") {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    } else if (view === "months") {
      setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    } else if (view === "years") {
      setViewDate(new Date(viewDate.getFullYear() - 10, viewDate.getMonth(), 1));
    } else if (view === "decades") {
      setViewDate(new Date(viewDate.getFullYear() - 100, viewDate.getMonth(), 1));
    }
  };

  const navigateNext = () => {
    if (view === "days") {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    } else if (view === "months") {
      setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    } else if (view === "years") {
      setViewDate(new Date(viewDate.getFullYear() + 10, viewDate.getMonth(), 1));
    } else if (view === "decades") {
      setViewDate(new Date(viewDate.getFullYear() + 100, viewDate.getMonth(), 1));
    }
  };

  const getHeaderText = () => {
    if (view === "days") {
      return `${FULL_MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    } else if (view === "months") {
      return `${viewDate.getFullYear()}`;
    } else if (view === "years") {
      const start = getYearsStart(viewDate.getFullYear());
      return `${start} - ${start + 9}`;
    } else {
      const start = getDecadesStart(viewDate.getFullYear());
      return `${start} - ${start + 90}`;
    }
  };

  const handleDaySelect = (date: Date | undefined) => {
    onSelect?.(date);
  };

  const isCurrentMonth = (month: number) => {
    const now = new Date();
    return viewDate.getFullYear() === now.getFullYear() && month === now.getMonth();
  };

  const isSelectedMonth = (month: number) => {
    return selected && viewDate.getFullYear() === selected.getFullYear() && month === selected.getMonth();
  };

  const isCurrentYear = (year: number) => {
    return year === new Date().getFullYear();
  };

  const isSelectedYear = (year: number) => {
    return selected && year === selected.getFullYear();
  };

  const isCurrentDecade = (startYear: number) => {
    const currentYear = new Date().getFullYear();
    return currentYear >= startYear && currentYear < startYear + 10;
  };

  const isSelectedDecade = (startYear: number) => {
    return selected && selected.getFullYear() >= startYear && selected.getFullYear() < startYear + 10;
  };

  return (
    <div className={cn("p-3 pointer-events-auto", className)}>
      {/* Header with navigation */}
      <div className="flex justify-center pt-1 relative items-center mb-4">
        <Button
          variant="outline"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
          )}
          onClick={navigatePrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <button
          onClick={handleHeaderClick}
          className={cn(
            "text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1 transition-colors",
            view === "decades" && "cursor-default hover:bg-transparent"
          )}
          disabled={view === "decades"}
        >
          {getHeaderText()}
        </button>
        
        <Button
          variant="outline"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
          )}
          onClick={navigateNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days View - use react-day-picker */}
      {view === "days" && (
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleDaySelect}
          month={viewDate}
          onMonthChange={setViewDate}
          disabled={disabled}
          showOutsideDays
          fixedWeeks
          initialFocus={initialFocus}
          className="!p-0"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "hidden",
            caption_label: "hidden",
            nav: "hidden",
            nav_button: "hidden",
            nav_button_previous: "hidden",
            nav_button_next: "hidden",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 aria-selected:hover:bg-primary aria-selected:hover:text-primary-foreground"
            ),
            day_range_end: "day-range-end",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground aria-selected:bg-primary aria-selected:text-primary-foreground",
            day_outside:
              "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      )}

      {/* Months View */}
      {view === "months" && (
        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((month, idx) => (
            <Button
              key={month}
              variant="ghost"
              className={cn(
                "h-9 w-full text-sm font-normal",
                isCurrentMonth(idx) && "bg-accent text-accent-foreground",
                isSelectedMonth(idx) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => handleMonthSelect(idx)}
            >
              {month}
            </Button>
          ))}
        </div>
      )}

      {/* Years View */}
      {view === "years" && (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => getYearsStart(viewDate.getFullYear()) + i).map(
            (year) => {
              const isDisabled = year < minYear || year > maxYear;
              return (
                <Button
                  key={year}
                  variant="ghost"
                  disabled={isDisabled}
                  className={cn(
                    "h-9 w-full text-sm font-normal",
                    isCurrentYear(year) && "bg-accent text-accent-foreground",
                    isSelectedYear(year) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isDisabled && "text-muted-foreground opacity-50"
                  )}
                  onClick={() => handleYearSelect(year)}
                >
                  {year}
                </Button>
              );
            }
          )}
        </div>
      )}

      {/* Decades View */}
      {view === "decades" && (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => getDecadesStart(viewDate.getFullYear()) + i * 10).map(
            (decade) => {
              const isDisabled = decade + 9 < minYear || decade > maxYear;
              return (
                <Button
                  key={decade}
                  variant="ghost"
                  disabled={isDisabled}
                  className={cn(
                    "h-9 w-full text-sm font-normal",
                    isCurrentDecade(decade) && "bg-accent text-accent-foreground",
                    isSelectedDecade(decade) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isDisabled && "text-muted-foreground opacity-50"
                  )}
                  onClick={() => handleDecadeSelect(decade)}
                >
                  {decade}s
                </Button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
