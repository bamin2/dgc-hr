import { useState, useEffect, useMemo } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Paperclip, Upload, X, Folder, AlertTriangle } from "lucide-react";
import { ResponsiveDialog, ResponsiveDialogFooter } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLeaveTypes } from "@/hooks/useLeaveTypes";
import { useCreateLeaveRequest } from "@/hooks/useLeaveRequests";
import { useMyLeaveBalances } from "@/hooks/useLeaveBalances";
import { useInitiateApproval } from "@/hooks/useApprovalEngine";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RequestTimeOffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestTimeOffDialog({ open, onOpenChange }: RequestTimeOffDialogProps) {
  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHalfDay, setIsHalfDay] = useState(false);

  const { data: leaveTypes, isLoading: typesLoading } = useLeaveTypes();
  const { data: myBalances } = useMyLeaveBalances();
  const createRequest = useCreateLeaveRequest();
  const initiateApproval = useInitiateApproval();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setLeaveTypeId("");
      setDateRange(undefined);
      setNote("");
      setIsHalfDay(false);
    }
  }, [open]);

  // Reset half-day when date range is selected (multi-day)
  useEffect(() => {
    if (dateRange?.to) {
      setIsHalfDay(false);
    }
  }, [dateRange?.to]);

  // Set default leave type when types are loaded
  useEffect(() => {
    if (leaveTypes && leaveTypes.length > 0 && !leaveTypeId) {
      setLeaveTypeId(leaveTypes[0].id);
    }
  }, [leaveTypes, leaveTypeId]);

  const handleSubmit = async () => {
    if (!dateRange?.from || !leaveTypeId) {
      toast.error("Please select a leave type and dates");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the current user's employee_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to request time off");
        return;
      }

      // Get the current user's employee_id from employees table (single source of truth)
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!employee?.id) {
        toast.error("Your profile is not linked to an employee record");
        return;
      }

      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = dateRange.to 
        ? format(dateRange.to, 'yyyy-MM-dd') 
        : startDate;
      const daysCount = isHalfDay 
        ? 0.5 
        : dateRange.to 
          ? differenceInCalendarDays(dateRange.to, dateRange.from) + 1 
          : 1;

      const result = await createRequest.mutateAsync({
        employee_id: employee.id,
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        days_count: daysCount,
        is_half_day: isHalfDay,
        reason: note || undefined,
        results_in_negative_balance: balanceInfo?.wouldBeNegative || false,
      });

      // Initiate the approval workflow
      if (result?.id) {
        await initiateApproval.mutateAsync({
          requestId: result.id,
          requestType: "time_off",
          employeeId: employee.id,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit leave request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDateRange(undefined);
  };

  const daysCount = dateRange?.from
    ? isHalfDay
      ? 0.5
      : dateRange.to
        ? differenceInCalendarDays(dateRange.to, dateRange.from) + 1
        : 1
    : 0;

  const selectedLeaveType = leaveTypes?.find(t => t.id === leaveTypeId);
  
  // Calculate if the request would result in negative balance
  const balanceInfo = useMemo(() => {
    if (!leaveTypeId || !myBalances) return null;
    const selectedBalance = myBalances.find(b => b.leave_type_id === leaveTypeId);
    if (!selectedBalance) return null;
    
    const remaining = selectedBalance.total_days - (selectedBalance.used_days || 0) - (selectedBalance.pending_days || 0);
    const wouldBeNegative = daysCount > remaining;
    const resultingBalance = remaining - daysCount;
    
    return {
      remaining,
      wouldBeNegative,
      resultingBalance,
      leaveTypeName: selectedBalance.leave_type?.name || selectedLeaveType?.name || 'Leave',
    };
  }, [leaveTypeId, myBalances, daysCount, selectedLeaveType]);

  const footerContent = (
    <ResponsiveDialogFooter>
      <Button
        variant="liquidGlassSecondary"
        size="liquidGlass"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        variant="liquidGlass"
        onClick={handleSubmit}
        disabled={isSubmitting || !dateRange?.from || !leaveTypeId}
      >
        {isSubmitting ? "Submitting..." : "Request time off"}
      </Button>
    </ResponsiveDialogFooter>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request time off"
      size="lg"
      footer={footerContent}
    >
      <div className="space-y-5">
          {/* Leave Balance Summary */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Leave Balances</Label>
            {!myBalances ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : myBalances.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {myBalances.map((balance) => {
                  const remaining = balance.total_days - (balance.used_days || 0) - (balance.pending_days || 0);
                  const isLow = remaining > 0 && remaining <= 2;
                  const isNegativeOrZero = remaining <= 0;
                  const isSelected = balance.leave_type_id === leaveTypeId;
                  
                  return (
                    <div
                      key={balance.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "hover:border-muted-foreground/50",
                        !isSelected && isLow && "border-amber-300 bg-amber-50 dark:bg-amber-950/30",
                        !isSelected && isNegativeOrZero && "border-red-300 bg-red-50 dark:bg-red-950/30"
                      )}
                      onClick={() => setLeaveTypeId(balance.leave_type_id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: balance.leave_type?.color || '#6b7280' }}
                        />
                        <span className="text-xs font-medium truncate">
                          {balance.leave_type?.name}
                        </span>
                      </div>
                      <div className={cn(
                        "text-lg font-bold",
                        isNegativeOrZero && "text-red-600 dark:text-red-400",
                        isLow && "text-amber-600 dark:text-amber-400"
                      )}>
                        {remaining.toFixed(remaining % 1 === 0 ? 0 : 1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {balance.total_days} days
                      </div>
                      {(balance.pending_days || 0) > 0 && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {balance.pending_days} pending
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No leave balances found for this year.</p>
            )}
          </div>

          {/* Time off type */}
          <div className="space-y-2">
            <Label>Time off type</Label>
            {typesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        {type.color && (
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                        )}
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-sm text-muted-foreground">
              {selectedLeaveType?.description || "Select the option that best describes your time off request."}
            </p>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <Label>Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Select dates"
                    )}
                  </div>
                  {dateRange?.from && (
                    <X
                      className="h-4 w-4 opacity-50 hover:opacity-100"
                      onClick={clearDates}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                  numberOfMonths={1}
                  className="pointer-events-auto"
                  classNames={{
                    day_today: "ring-1 ring-accent text-foreground",
                  }}
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">
              You can select one day or a range of days.
            </p>
          </div>

          {/* Half Day Option - only show for single day */}
          {dateRange?.from && !dateRange.to && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="halfDay"
                checked={isHalfDay}
                onCheckedChange={(checked) => setIsHalfDay(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor="halfDay" className="font-normal cursor-pointer">
                  Half day
                </Label>
                <p className="text-sm text-muted-foreground">
                  Request only half a day (0.5 days will be deducted)
                </p>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Add a note for the approver..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-sm text-muted-foreground">
              You can leave a message to the approver if needed.
            </p>
          </div>

          {/* File Upload - placeholder for future */}
          <div className="space-y-2">
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                <Folder className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Drag or Drop your Receipts</p>
              <p className="text-sm text-muted-foreground mb-3">
                Maximum file size allowed is 20MB
              </p>
              <Button variant="outline" size="sm" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Upload your files
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Paperclip className="w-4 h-4" />
              <span>No file added</span>
            </div>
          </div>

          {/* Negative Balance Warning */}
          {balanceInfo?.wouldBeNegative && (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">Insufficient Balance</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                This request will result in a negative balance of {balanceInfo.resultingBalance.toFixed(1)} days 
                for {balanceInfo.leaveTypeName}. It will require HR approval.
              </AlertDescription>
            </Alert>
          )}

          {/* Summary */}
          <div className="flex items-center gap-4 text-sm">
            <span>Request: <strong>{daysCount} day{daysCount !== 1 ? "s" : ""}</strong>.</span>
            {balanceInfo && (
              <span className="text-muted-foreground">
                (Balance: {balanceInfo.remaining.toFixed(1)} days remaining)
              </span>
            )}
          </div>

        </div>
    </ResponsiveDialog>
  );
}
