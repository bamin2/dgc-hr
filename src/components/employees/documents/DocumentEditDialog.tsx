import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ExpiryNotificationSettings } from "./ExpiryNotificationSettings";
import {
  EmployeeDocument,
  useUpdateDocument,
} from "@/hooks/useEmployeeDocuments";
import { toast } from "@/hooks/use-toast";

interface DocumentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: EmployeeDocument | null;
}

export function DocumentEditDialog({
  open,
  onOpenChange,
  document,
}: DocumentEditDialogProps) {
  const updateDocument = useUpdateDocument();

  const [documentName, setDocumentName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [notifications, setNotifications] = useState({
    daysBeforeExpiry: 30,
    notifyEmployee: true,
    notifyManager: true,
    notifyHr: true,
  });

  // Populate form when document changes
  useEffect(() => {
    if (document) {
      setDocumentName(document.documentName);
      setDocumentNumber(document.documentNumber || "");
      setIssueDate(document.issueDate || "");
      setExpiryDate(document.expiryDate || "");
      setNotes(document.notes || "");
      if (document.notifications) {
        setNotifications({
          daysBeforeExpiry: document.notifications.daysBeforeExpiry,
          notifyEmployee: document.notifications.notifyEmployee,
          notifyManager: document.notifications.notifyManager,
          notifyHr: document.notifications.notifyHr,
        });
      }
    }
  }, [document]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!document || !documentName) {
      toast({
        title: "Missing fields",
        description: "Document name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateDocument.mutateAsync({
        id: document.id,
        documentName,
        documentNumber: documentNumber || null,
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        notes: notes || null,
        notifications: expiryDate ? notifications : undefined,
      });

      toast({
        title: "Document updated",
        description: "The document has been updated successfully",
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Type (read-only) */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Document Type</Label>
            <Input value={document.documentTypeName} disabled />
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label>
              Document Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., National ID Card"
            />
          </div>

          {/* Document Number */}
          <div className="space-y-2">
            <Label>Document Number</Label>
            <Input
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="e.g., CPR-123456789"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !issueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {issueDate ? format(parseISO(issueDate), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={issueDate ? parseISO(issueDate) : undefined}
                    onSelect={(date) => setIssueDate(date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(parseISO(expiryDate), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate ? parseISO(expiryDate) : undefined}
                    onSelect={(date) => setExpiryDate(date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          {/* Notification Settings (only if expiry date is set) */}
          {expiryDate && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Expiry Notifications</h4>
                <ExpiryNotificationSettings
                  value={notifications}
                  onChange={setNotifications}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateDocument.isPending}
          >
            {updateDocument.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
