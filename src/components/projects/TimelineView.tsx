import { useMemo } from "react";
import { format, startOfWeek, addDays, isToday, isWithinInterval } from "date-fns";
import { Project, ProjectStatus } from "@/data/projects";
import { TimelineToolbar, TimelineGranularity } from "./TimelineToolbar";
import { TimelineCard } from "./TimelineCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  projects: Project[];
  currentDate: Date;
  granularity: TimelineGranularity;
  onDateChange: (date: Date) => void;
  onGranularityChange: (granularity: TimelineGranularity) => void;
  onProjectClick: (project: Project) => void;
}

const DAY_WIDTH = 120;
const VISIBLE_DAYS = 7;

export function TimelineView({
  projects,
  currentDate,
  granularity,
  onDateChange,
  onGranularityChange,
  onProjectClick,
}: TimelineViewProps) {
  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: VISIBLE_DAYS }, (_, i) => addDays(weekStart, i));

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  // Filter projects that overlap with the current week and sort by priority
  const sortedProjects = useMemo(() => {
    const weekEnd = addDays(weekStart, VISIBLE_DAYS - 1);
    return projects
      .filter(project => {
        return (
          isWithinInterval(project.startDate, { start: weekStart, end: weekEnd }) ||
          isWithinInterval(project.endDate, { start: weekStart, end: weekEnd }) ||
          (project.startDate <= weekStart && project.endDate >= weekEnd)
        );
      })
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [projects, weekStart]);

  return (
    <div>
      <TimelineToolbar
        currentDate={currentDate}
        granularity={granularity}
        onDateChange={onDateChange}
        onGranularityChange={onGranularityChange}
      />

      <ScrollArea className="w-full">
        <div className="min-w-[840px]">
          {/* Day headers */}
          <div className="flex border-b border-border">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex-shrink-0 px-3 py-3 text-center",
                  "border-r border-border last:border-r-0"
                )}
                style={{ width: DAY_WIDTH }}
              >
                <p className={cn(
                  "text-sm font-medium",
                  isToday(day) ? "text-primary" : "text-foreground"
                )}>
                  {format(day, "EEE dd")}
                </p>
              </div>
            ))}
          </div>

          {/* Timeline grid with projects */}
          <div className="relative" style={{ minHeight: Math.max(sortedProjects.length * 128 + 40, 200) }}>
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex-shrink-0 border-r border-border last:border-r-0",
                    isToday(day) && "bg-primary/5"
                  )}
                  style={{ width: DAY_WIDTH }}
                >
                  {/* Today indicator */}
                  {isToday(day) && (
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-primary/50" />
                  )}
                </div>
              ))}
            </div>

            {/* Project cards - one per row, sorted by priority */}
            <div className="relative pt-4">
              {sortedProjects.map((project) => (
                <div
                  key={project.id}
                  className="relative"
                  style={{ height: 120, marginBottom: 8 }}
                >
                  <TimelineCard
                    project={project}
                    weekStart={weekStart}
                    dayWidth={DAY_WIDTH}
                    totalWidth={DAY_WIDTH * VISIBLE_DAYS}
                    onClick={() => onProjectClick(project)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
