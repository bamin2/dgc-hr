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
import { Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import { useLeaveTypes } from "@/hooks/useLeaveTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ProcessRolloverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromYear: number;
}

export function ProcessRolloverDialog({
  open,
  onOpenChange,
  fromYear,
}: ProcessRolloverDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: leaveTypes } = useLeaveTypes();
  const queryClient = useQueryClient();
  const toYear = fromYear + 1;

  const carryoverTypes = leaveTypes?.filter((lt) => lt.allow_carryover);

  const handleProcessRollover = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "process-yearly-rollover",
        {
          body: { fromYear },
        }
      );

      if (error) throw error;

      toast.success(
        `Rollover complete: ${data.balancesCreated} balances created, ${data.carryoversApplied} carryovers applied`
      );
      queryClient.invalidateQueries({ queryKey: ["all-employee-balances"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance-adjustments"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Rollover failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            Process Year-End Rollover
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                This will process the year-end rollover from{" "}
                <strong>{fromYear}</strong> to <strong>{toYear}</strong>.
              </p>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  What will happen:
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>
                    New balance records created for {toYear} using default
                    allocations
                  </li>
                  <li>
                    Unused days carried over (respecting max carryover limits)
                  </li>
                  <li>Carryover adjustments logged for audit purposes</li>
                </ul>
              </div>

              {carryoverTypes && carryoverTypes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Leave types with carryover enabled:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {carryoverTypes.map((lt) => (
                      <Badge
                        key={lt.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: lt.color || "#6b7280" }}
                        />
                        {lt.name}
                        {lt.max_carryover_days && (
                          <span className="ml-1 text-muted-foreground">
                            (max {lt.max_carryover_days}d)
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-md">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning">
                  This action cannot be undone. Make sure all leave requests for{" "}
                  {fromYear} have been processed before proceeding.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleProcessRollover}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Rollover to ${toYear}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
