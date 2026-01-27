import { TimeOffSummaryCard } from "./TimeOffSummaryCard";
import { TimeOffMonthCalendar } from "./TimeOffMonthCalendar";

export function TimeOffCalendarTab() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <TimeOffSummaryCard />
      <TimeOffMonthCalendar />
    </div>
  );
}
