import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { attendanceRecords } from '@/data/attendance';
import { mockEmployees as employees } from '@/data/employees';
import { cn } from '@/lib/utils';

export function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getAttendanceSummaryForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayRecords = attendanceRecords.filter((r) => r.date === dateStr);

    if (dayRecords.length === 0) return null;

    const present = dayRecords.filter((r) => r.status === 'present').length;
    const absent = dayRecords.filter((r) => r.status === 'absent').length;
    const late = dayRecords.filter((r) => r.status === 'late').length;
    const onLeave = dayRecords.filter((r) => r.status === 'on_leave').length;

    return { present, absent, late, onLeave, total: employees.length };
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (dayIndex: number) => {
    return dayIndex === 0 || dayIndex === 6;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Attendance Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">On Leave</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayOfWeek = (startingDay + index) % 7;
            const summary = getAttendanceSummaryForDay(day);
            const weekend = isWeekend(dayOfWeek);

            return (
              <div
                key={day}
                className={cn(
                  'aspect-square p-1 rounded-lg border border-transparent hover:border-border cursor-pointer transition-colors',
                  isToday(day) && 'bg-primary/10 border-primary',
                  weekend && 'bg-muted/50'
                )}
              >
                <div className="text-xs font-medium text-center mb-1">{day}</div>
                {summary && !weekend && (
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {summary.present > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" title={`${summary.present} present`} />
                    )}
                    {summary.late > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" title={`${summary.late} late`} />
                    )}
                    {summary.onLeave > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`${summary.onLeave} on leave`} />
                    )}
                    {summary.absent > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" title={`${summary.absent} absent`} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
