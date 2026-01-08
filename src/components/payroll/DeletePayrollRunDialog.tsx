import { Trash2, AlertTriangle } from "lucide-react";
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
import { useDeletePayrollRun } from "@/hooks/usePayrollRunsV2";
import { toast } from "@/hooks/use-toast";

interface DeletePayrollRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: string;
  periodLabel: string;
  onDeleted: () => void;
}

export function DeletePayrollRunDialog({
  open,
  onOpenChange,
  runId,
  periodLabel,
  onDeleted,
}: DeletePayrollRunDialogProps) {
  const deleteRun = useDeletePayrollRun();

  const handleDelete = async () => {
    try {
      await deleteRun.mutateAsync(runId);
      toast({
        title: "Draft Deleted",
        description: "The payroll run draft has been deleted.",
      });
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Draft Payroll Run
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the draft payroll run for{" "}
            <strong>{periodLabel}</strong>? This will permanently remove all
            employee selections and adjustments. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteRun.isPending}
          >
            {deleteRun.isPending ? "Deleting..." : "Delete Draft"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
