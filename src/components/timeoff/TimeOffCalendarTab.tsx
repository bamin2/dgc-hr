import { useState } from "react";
import { TimeOffSummaryCard } from "./TimeOffSummaryCard";
import { TimeOffMonthCalendar } from "./TimeOffMonthCalendar";

export function TimeOffCalendarTab() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <TimeOffSummaryCard year={selectedYear} />
      <TimeOffMonthCalendar onYearChange={setSelectedYear} />
    </div>
  );
}
