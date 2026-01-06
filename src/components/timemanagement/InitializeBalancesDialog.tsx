import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { useLeaveTypes, LeaveType } from "@/hooks/useLeaveTypes";
import { useBulkInitializeBalances } from "@/hooks/useLeaveBalanceAdjustments";

interface InitializeBalancesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  employeeCount: number;
}

export function InitializeBalancesDialog({
  open,
  onOpenChange,
  year,
  employeeCount,
}: InitializeBalancesDialogProps) {
  const { data: leaveTypes } = useLeaveTypes();
  const { mutate: initialize, isPending } = useBulkInitializeBalances();

  // Show all active leave types - those without max_days_per_year will be initialized with 0 days
  const activeLeaveTypes = leaveTypes?.filter((lt) => lt.is_active !== false);

  const handleInitialize = () => {
    initialize(
      { year },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Initialize Leave Balances for {year}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                This will assign default leave allocations to all employees who
                don't have balances yet for {year}.
              </p>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Leave types to initialize:
                </p>
                <div className="space-y-1.5">
                  {activeLeaveTypes?.map((lt) => (
                    <div
                      key={lt.id}
                      className="flex items-center justify-between py-1.5 px-3 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: lt.color || "#6b7280" }}
                        />
                        <span className="text-sm">{lt.name}</span>
                      </div>
                      <Badge variant={lt.max_days_per_year ? "secondary" : "outline"} className="text-xs">
                        {lt.max_days_per_year ? `${lt.max_days_per_year} days` : "0 days"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Active employees: <strong>{employeeCount}</strong>
              </p>

              <p className="text-xs text-muted-foreground italic">
                Note: Existing balances will not be overwritten.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleInitialize} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize All"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
