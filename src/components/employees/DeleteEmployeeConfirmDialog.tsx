import { Loader2 } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Employee } from "@/hooks/useEmployees";

interface DeleteEmployeeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteEmployeeConfirmDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
  isLoading = false,
}: DeleteEmployeeConfirmDialogProps) {
  if (!employee) return null;

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isLoading && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {fullName}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">What will happen</p>
                <p className="mt-1">
                  This will permanently remove the employee and their personal record.
                  This action cannot be undone.
                </p>
              </div>
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <p className="font-medium text-foreground">If they have historical data</p>
                <p className="mt-1">
                  If this employee is referenced by payroll runs, salary history, loans,
                  leave requests, or other records, they will instead be{" "}
                  <span className="font-medium text-foreground">archived</span> (status set
                  to <span className="font-medium text-foreground">Terminated</span>) and
                  removed from active lists. All historical data will be preserved.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete employee
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
