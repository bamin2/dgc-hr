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

  // Filter projects that overlap with the current week
  const visibleProjects = useMemo(() => {
    const weekEnd = addDays(weekStart, VISIBLE_DAYS - 1);
    return projects.filter(project => {
      return (
        isWithinInterval(project.startDate, { start: weekStart, end: weekEnd }) ||
        isWithinInterval(project.endDate, { start: weekStart, end: weekEnd }) ||
        (project.startDate <= weekStart && project.endDate >= weekEnd)
      );
    });
  }, [projects, weekStart]);

  // Group projects by row to avoid overlap
  const projectRows = useMemo(() => {
    const rows: Project[][] = [];
    
    visibleProjects.forEach(project => {
      let placed = false;
      for (const row of rows) {
        const hasOverlap = row.some(p => 
          !(project.endDate < p.startDate || project.startDate > p.endDate)
        );
        if (!hasOverlap) {
          row.push(project);
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([project]);
      }
    });
    
    return rows;
  }, [visibleProjects]);

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
          <div className="relative" style={{ minHeight: Math.max(projectRows.length * 140 + 40, 200) }}>
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              {days.map((day, i) => (
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

            {/* Project cards */}
            <div className="relative pt-4">
              {projectRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="relative"
                  style={{ height: 140, marginBottom: 8 }}
                >
                  {row.map((project) => (
                    <TimelineCard
                      key={project.id}
                      project={project}
                      weekStart={weekStart}
                      dayWidth={DAY_WIDTH}
                      onClick={() => onProjectClick(project)}
                    />
                  ))}
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
