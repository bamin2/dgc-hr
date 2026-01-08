import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteLoan, Loan } from "@/hooks/useLoans";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { toast } from "sonner";

interface DeleteLoanDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteLoanDialog({ 
  loan, 
  open, 
  onOpenChange,
  onDeleted,
}: DeleteLoanDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const deleteLoan = useDeleteLoan();
  const { formatCurrency } = useCompanySettings();

  const isConfirmed = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!loan || !isConfirmed) return;
    
    try {
      await deleteLoan.mutateAsync(loan.id);
      toast.success("Loan deleted successfully");
      setConfirmText("");
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast.error("Failed to delete loan");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmText("");
    }
    onOpenChange(open);
  };

  const employeeName = loan?.employee?.full_name || 
    `${loan?.employee?.first_name || ""} ${loan?.employee?.last_name || ""}`.trim();

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Loan
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>This will permanently delete the loan and all associated installments.</p>
            
            {loan && (
              <div className="rounded-lg border p-3 space-y-1 bg-muted/50">
                <p className="font-medium text-foreground">{employeeName}</p>
                <p className="text-sm">
                  Principal: {formatCurrency(loan.principal_amount)}
                </p>
                <p className="text-sm">
                  Status: <span className="capitalize">{loan.status}</span>
                </p>
              </div>
            )}
            
            <p className="font-medium text-foreground">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-delete">
            Type <span className="font-mono font-bold">DELETE</span> to confirm:
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || deleteLoan.isPending}
          >
            {deleteLoan.isPending ? "Deleting..." : "Delete Loan"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
