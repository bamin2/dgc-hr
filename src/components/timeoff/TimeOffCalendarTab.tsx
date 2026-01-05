import { TimeOffSummaryCard } from "./TimeOffSummaryCard";
import { TimeOffMonthCalendar } from "./TimeOffMonthCalendar";

export function TimeOffCalendarTab() {
  return (
    <div className="flex gap-6">
      <TimeOffSummaryCard />
      <TimeOffMonthCalendar />
    </div>
  );
}
