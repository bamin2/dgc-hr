import { useState } from "react";
import { format } from "date-fns";
import { History, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmployeeImports, useRollbackImport } from "@/hooks/useEmployeeImports";
import { toast } from "@/hooks/use-toast";

interface ImportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportHistoryDialog({ open, onOpenChange }: ImportHistoryDialogProps) {
  const { data: imports = [], isLoading } = useEmployeeImports();
  const rollbackMutation = useRollbackImport();
  const [rollbackId, setRollbackId] = useState<string | null>(null);

  const handleRollback = async () => {
    if (!rollbackId) return;

    try {
      await rollbackMutation.mutateAsync(rollbackId);
      toast({
        title: "Import rolled back",
        description: "All employees from this import have been removed.",
      });
      setRollbackId(null);
    } catch (error) {
      toast({
        title: "Rollback failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Import History
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : imports.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No imports yet
              </div>
            ) : (
              <div className="space-y-3">
                {imports.map((imp) => (
                  <div
                    key={imp.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{imp.filename || "Unknown file"}</span>
                        {imp.status === "completed" ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rolled Back
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(imp.imported_at), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">
                          {imp.successful_records} imported
                        </span>
                        {imp.failed_records > 0 && (
                          <span className="text-destructive ml-2">
                            {imp.failed_records} failed
                          </span>
                        )}
                        <span className="text-muted-foreground ml-2">
                          of {imp.total_records} total
                        </span>
                      </div>
                      {imp.status === "rolled_back" && imp.rolled_back_at && (
                        <div className="text-xs text-muted-foreground">
                          Rolled back on {format(new Date(imp.rolled_back_at), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                    {imp.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRollbackId(imp.id)}
                        disabled={rollbackMutation.isPending}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Rollback
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!rollbackId} onOpenChange={() => setRollbackId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rollback Import?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all employees that were created in this import batch.
              Any related records (attendance, leave requests, etc.) may also be affected.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRollback}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rollbackMutation.isPending ? "Rolling back..." : "Rollback Import"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
