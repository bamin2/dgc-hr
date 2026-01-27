import { Check, Clock, Calendar, Briefcase, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyLeaveBalances } from "@/hooks/useLeaveBalances";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { usePublicHolidays } from "@/hooks/usePublicHolidays";

interface SummaryItemProps {
  icon: React.ReactNode;
  bgColor: string;
  days: number;
  label: string;
  sublabel: string;
}

function SummaryItem({ icon, bgColor, days, label, sublabel }: SummaryItemProps) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-sm transition-all duration-200 ${bgColor}`}>
      <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-white">
        {icon}
      </div>
      <div className="flex-1 text-white">
        <p className="font-semibold">
          <span className="text-xl">{days}</span> {label}
        </p>
        <p className="text-sm opacity-80">{sublabel}</p>
      </div>
    </div>
  );
}

export function TimeOffSummaryCard() {
  const currentYear = new Date().getFullYear();
  const { data: balances, isLoading: balancesLoading } = useMyLeaveBalances();
  const { data: leaveRequests, isLoading: requestsLoading } = useLeaveRequests();
  const { data: publicHolidays, isLoading: holidaysLoading } = usePublicHolidays(currentYear);

  const isLoading = balancesLoading || requestsLoading || holidaysLoading;
  
  // Count remaining public holidays (observed dates that haven't passed)
  const remainingHolidays = publicHolidays?.filter(
    h => new Date(h.observed_date) >= new Date()
  ).length || 0;

  // Find Annual Leave balance specifically for "Available to book" and "Total allowance"
  const annualLeaveBalance = balances?.find(b => b.leave_type?.name === 'Annual Leave');
  
  // Available to book - only Annual Leave
  const totalAvailable = annualLeaveBalance 
    ? annualLeaveBalance.total_days - annualLeaveBalance.used_days - annualLeaveBalance.pending_days 
    : 0;
  
  // Total allowance - only Annual Leave
  const totalDays = annualLeaveBalance?.total_days || 0;
  
  // These remain as totals across all leave types
  const totalPending = balances?.reduce((sum, b) => sum + b.pending_days, 0) || 0;
  const totalUsed = balances?.reduce((sum, b) => sum + b.used_days, 0) || 0;

  // Count approved upcoming leave (booked)
  const bookedDays = leaveRequests
    ?.filter(r => r.status === 'approved' && new Date(r.start_date) >= new Date())
    .reduce((sum, r) => sum + r.days_count, 0) || 0;

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">About your time off</CardTitle>
        <Button variant="outline" size="sm">See details</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <SummaryItem
          icon={<Check className="w-4 h-4" />}
          bgColor="bg-primary/90"
          days={totalAvailable}
          label="days paid time off"
          sublabel="Available to book"
        />
        <SummaryItem
          icon={<Clock className="w-4 h-4" />}
          bgColor="bg-teal-500/85"
          days={totalPending}
          label="days pending approval"
          sublabel="Awaiting manager approval"
        />
        <SummaryItem
          icon={<Calendar className="w-4 h-4" />}
          bgColor="bg-amber-500/85"
          days={bookedDays}
          label="days booked"
          sublabel={`${totalUsed}d used`}
        />
        <SummaryItem
          icon={<Briefcase className="w-4 h-4" />}
          bgColor="bg-teal-500/85"
          days={totalDays}
          label="days per year"
          sublabel="Total allowance"
        />
        <SummaryItem
          icon={<Flag className="w-4 h-4" />}
          bgColor="bg-rose-400/85"
          days={remainingHolidays}
          label="Public Holidays"
          sublabel={`${publicHolidays?.length || 0} total in ${currentYear}`}
        />
      </CardContent>
    </Card>
  );
}
