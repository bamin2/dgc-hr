import { useState } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, parseISO } from "date-fns";
import { Calendar as CalendarIconNav, ChevronLeft, ChevronRight, AlertCircle, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PayrollRunData } from "@/components/payroll/PayrollRunCard";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PayPeriodStepProps {
  payPeriodStart: string;
  payPeriodEnd: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  existingDraft?: PayrollRunData | null;
  onResumeDraft?: (draftId: string) => void;
}

export function PayPeriodStep({
  payPeriodStart,
  payPeriodEnd,
  onStartChange,
  onEndChange,
  existingDraft,
  onResumeDraft,
}: PayPeriodStepProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date(payPeriodStart));

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' 
      ? subMonths(selectedMonth, 1) 
      : addMonths(selectedMonth, 1);
    
    setSelectedMonth(newMonth);
    onStartChange(format(startOfMonth(newMonth), "yyyy-MM-dd"));
    onEndChange(format(endOfMonth(newMonth), "yyyy-MM-dd"));
  };

  const handleQuickSelect = (monthsAgo: number) => {
    const targetMonth = subMonths(new Date(), monthsAgo);
    setSelectedMonth(targetMonth);
    onStartChange(format(startOfMonth(targetMonth), "yyyy-MM-dd"));
    onEndChange(format(endOfMonth(targetMonth), "yyyy-MM-dd"));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Select Pay Period</h2>
      <p className="text-muted-foreground mb-6">
        Choose the pay period for this payroll run.
      </p>

      {/* Quick Select */}
      <div className="flex gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(0)}
        >
          This Month
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(1)}
        >
          Last Month
        </Button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-[150px] justify-center">
          <CalendarIconNav className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-medium text-foreground">
            {format(selectedMonth, "MMMM yyyy")}
          </span>
        </div>
        <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Custom Date Range */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !payPeriodStart && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {payPeriodStart ? format(parseISO(payPeriodStart), "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={payPeriodStart ? parseISO(payPeriodStart) : undefined}
                onSelect={(date) => onStartChange(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !payPeriodEnd && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {payPeriodEnd ? format(parseISO(payPeriodEnd), "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={payPeriodEnd ? parseISO(payPeriodEnd) : undefined}
                onSelect={(date) => onEndChange(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Existing Draft Warning */}
      {existingDraft && (
        <Alert className="border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="flex items-center justify-between">
            <span>A draft already exists for this pay period.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResumeDraft?.(existingDraft.id)}
            >
              Resume Draft
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
